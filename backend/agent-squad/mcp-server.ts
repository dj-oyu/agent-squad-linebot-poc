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
import { getQuizHistories } from "./services/quiz-history";
// 簡易認証ミドルウェア
// 簡易認証ミドルウェア
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // TODO: 本番はJWT検証やユーザー認可を実装
  next();
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

// 今後: /tools/openai, /tools/gemini, /tools/grok, /tools/groq など個別エンドポイントも追加

if (require.main === module) {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`agent squad MCP server running on port ${port}`);
  });
}
