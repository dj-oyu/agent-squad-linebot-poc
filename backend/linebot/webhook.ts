import express from "express";
import { middleware, Client, WebhookEvent } from "@line/bot-sdk";
import dotenv from "dotenv";
import path from "path";

// プロジェクトルートの.envを参照
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

export const client = new Client(config);
export const app = express();

// ヘルスチェック用エンドポイント（署名検証なし）
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use(middleware(config));
app.use(express.json());

// Webhookエンドポイント
app.post("/webhook", async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    if (!events || events.length === 0) {
      return res.status(200).send("No events");
    }


    // 各イベントを非同期で処理
    await Promise.allSettled(
      events.map(async (event) => {
        try {
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
            } else if (/^回答[:：]/.test(text)) {
              // 回答メッセージを検知→agent squadで判定
              try {
                const res = await fetch(process.env.AGENT_SQUAD_API_URL + "/ai", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    purpose: "quiz_judgement",
                    input: { prompt: text, userId: event.source.userId },
                  }),
                });
                const data = await res.json();
            let judgeText = "判定結果:\n";
            if (data.result && data.result.judge) {
              judgeText += data.result.judge;
              if (data.result.review) judgeText += "\n" + data.result.review;
            } else if (typeof data.result === "string") {
              judgeText += data.result;
            } else {
              judgeText += JSON.stringify(data.result);
            }
            // クイズ履歴記録API呼び出し
            try {
              await fetch(process.env.AGENT_SQUAD_API_URL + "/quiz-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: event.source.userId,
                  quiz: {}, // TODO: 実際のクイズ内容を渡す
                  answer: text,
                  result: data.result.judge || "",
                }),
              });
            } catch (e) {
              // ignore
            }
            await client.replyMessage(event.replyToken, [
              { type: "text", text: judgeText },
            ]);
              } catch (err) {
                try {
                  await client.replyMessage(event.replyToken, [
                    { type: "text", text: "判定API連携でエラーが発生しました" },
                  ]);
                } catch (e) {
                  // ignore
                }
              }
        } else {
          // 通常のテキストはgroq（Llama3 Scout）で会話応答
          try {
            console.log("groq呼び出し: ", text);
            const groqRes = await fetch(process.env.AGENT_SQUAD_API_URL + "/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                purpose: "default",
                input: { prompt: text, userId: event.source.userId },
              }),
            });
            const data = await groqRes.json();
            let replyText = "";
            if (data.result && data.result.choices && data.result.choices[0]?.message?.content) {
              replyText = data.result.choices[0].message.content;
            } else if (typeof data.result === "string") {
              replyText = data.result;
            } else {
              replyText = JSON.stringify(data.result);
            }
            await client.replyMessage(event.replyToken, [
              { type: "text", text: replyText },
            ]);
          } catch (err) {
            console.error("groq会話API呼び出しエラー:", err);
            await client.replyMessage(event.replyToken, [
              { type: "text", text: "会話API連携でエラーが発生しました: " + (err instanceof Error ? err.message : String(err)) },
            ]);
          }
        }
          }
        } catch (err) {
          // 予期せぬエラーもログ出力
          console.error("Webhook event error:", err);
        }
        // 今後: agent squad連携や資料URL検知・クイズ出題ロジックを追加
      })
    );

    res.status(200).send("OK");
  } catch (err) {
    // 全体の予期せぬエラーもログ出力
    console.error("Webhook handler error:", err);
    res.status(200).send("OK");
  }
});

// サーバ起動（テスト時は実行しない）
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`LINE Bot webhook server running on port ${port}`);
  });
}
