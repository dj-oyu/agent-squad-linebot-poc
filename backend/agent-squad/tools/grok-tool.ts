import dotenv from "dotenv";
dotenv.config();

const GROK_API_KEY = process.env.GROK_API_KEY || "";

/**
 * Grok（無料枠）汎用応答用
 * @param input { prompt: string }
 */
export async function callGrok(input: { prompt: string }) {
  if (!GROK_API_KEY) {
    throw new Error("GROK_API_KEY is not set");
  }
  // Grok APIのエンドポイント例（実際のAPI仕様に合わせて修正）
  const res = await fetch("https://api.grok.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-1",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: input.prompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    throw new Error(`Grok API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data;
}
