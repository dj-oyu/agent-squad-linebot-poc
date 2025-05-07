import dotenv from "dotenv";
dotenv.config();

/**
 * Groq (Llama3 Scout) クイズ判定・講評用
 * @param input { prompt: string }
 */
export async function callGroqLlama3(input: { prompt: string }) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }
  // Groq APIのエンドポイント例（実際のAPI仕様に合わせて修正）
  const res = await fetch("https://api.groq.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: "あなたは親しみやすいLINE公式アカウントBotです。日常会話をしつつ、AWSやIT資格のクイズ出題・判定、資料要約、履歴管理などが得意です。ユーザーが困っていたら「資料URLを送ってくれたらクイズを自動生成できます」「回答: ...と送ると判定します」など、できることを自然に案内してください。無理に営業せず、雑談も歓迎です。" },
        { role: "user", content: input.prompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data;
}
