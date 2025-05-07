import express from "express";
import { middleware, Client, WebhookEvent } from "@line/bot-sdk";
import dotenv from "dotenv";

dotenv.config();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

const client = new Client(config);
const app = express();

app.use(middleware(config));
app.use(express.json());

// Webhookエンドポイント
app.post("/webhook", async (req, res) => {
  const events: WebhookEvent[] = req.body.events;
  if (!events || events.length === 0) {
    return res.status(200).send("No events");
  }

  // 各イベントを非同期で処理
  await Promise.all(
    events.map(async (event) => {
      // ここでevent.typeごとに処理を分岐
      if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text;
        // 資料URLらしきテキストを検知（簡易判定: http/httpsで始まる）
        if (/^https?:\/\/\S+/.test(text)) {
          // agent squadの/aiエンドポイントにPOST
          try {
            const res = await fetch(process.env.AGENT_SQUAD_API_URL + "/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                purpose: "quiz_generation",
                input: { url: text, userId: event.source.userId },
              }),
            });
            const data = await res.json();
            // クイズ生成結果をLINEで出題（仮: テキストでそのまま表示）
            let quizText = "クイズ生成結果:\n";
            if (data.result && data.result.candidates && data.result.candidates[0]?.content?.parts) {
              // Gemini APIのレスポンス例
              quizText += data.result.candidates[0].content.parts.map((p: any) => p.text).join("\n");
            } else if (typeof data.result === "string") {
              quizText += data.result;
            } else {
              quizText += JSON.stringify(data.result);
            }
            await client.replyMessage(event.replyToken, [
              { type: "text", text: quizText },
            ]);
          } catch (err) {
            await client.replyMessage(event.replyToken, [
              { type: "text", text: "クイズ生成API連携でエラーが発生しました" },
            ]);
          }
        } else {
          // 通常のテキストはオウム返し
          await client.replyMessage(event.replyToken, [
            { type: "text", text: `受信: ${text}` },
          ]);
        }
      }
      // 今後: agent squad連携や資料URL検知・クイズ出題ロジックを追加
    })
  );

  res.status(200).send("OK");
});

// サーバ起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE Bot webhook server running on port ${port}`);
});
