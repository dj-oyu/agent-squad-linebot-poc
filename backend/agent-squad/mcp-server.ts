import express from "express";
import dotenv from "dotenv";
import { aiRouter } from "./tools/ai-router";

dotenv.config();

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
app.get("/quiz-history", async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: "userId required" });
  const histories = await getQuizHistories(userId, 20);
  res.json(histories);
});

// 今後: /tools/openai, /tools/gemini, /tools/grok, /tools/groq など個別エンドポイントも追加

if (require.main === module) {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`agent squad MCP server running on port ${port}`);
  });
}
