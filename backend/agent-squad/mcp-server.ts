import express from "express";
import dotenv from "dotenv";
import { aiRouter } from "./tools/ai-router";

dotenv.config();

import type { Request, Response, NextFunction } from "express";
export const app = express();
app.use(express.json());

// ヘルスチェック
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// AI用途分担ルーティング
app.post("/ai", async (req, res) => {
  const { purpose, input } = req.body;
  try {
    const result = await aiRouter(purpose, input);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "AIルーティングエラー", details: err });
  }
});

// クイズ履歴取得API
import { getQuizHistories, logQuizHistory } from "./services/quiz-history";
// 簡易認証ミドルウェア
// LINE IDトークン認証ミドルウェア
import { verifyLineIdToken } from "./services/line-jwt";
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const idToken = auth.replace("Bearer ", "");
  try {
    const userIdFromToken = await verifyLineIdToken(idToken);
    // userIdクエリと一致しなければ403
    const userId = req.query.userId as string;
    if (!userId || userId !== userIdFromToken) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    // req.userId = userIdFromToken; // 必要に応じて
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
}

// 型: Promise<void>を明示
app.get("/quiz-history", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  const histories = await getQuizHistories(userId, 20);
  res.json(histories);
  return;
});

// クイズ履歴登録API（linebotから利用）
app.post("/quiz-history", async (req: Request, res: Response): Promise<void> => {
  const { userId, quiz, answer, result } = req.body;
  if (!userId || !quiz) {
    res.status(400).json({ error: "userId and quiz required" });
    return;
  }
  try {
    const history = await logQuizHistory({ userId, quiz, answer, result });
    res.status(201).json(history);
  } catch (e) {
    res.status(500).json({ error: "Failed to log quiz history" });
  }
});

// 管理者API: admin claim（userId === "admin-user"）のみ全件取得
app.get("/quiz-history-admin", async (req: Request, res: Response): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const idToken = auth.replace("Bearer ", "");
  try {
    const userIdFromToken = await verifyLineIdToken(idToken);
    const adminId = process.env.ADMIN_LINE_USER_ID || "admin-user";
    if (userIdFromToken !== adminId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const histories = await getQuizHistories(undefined, 1000); // 全件取得
    res.json(histories);
    return;
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
});

// 今後: /tools/openai, /tools/gemini, /tools/grok, /tools/groq など個別エンドポイントも追加

if (require.main === module) {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`agent squad MCP server running on port ${port}`);
  });
}
