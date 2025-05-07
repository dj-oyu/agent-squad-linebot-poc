import dotenv from "dotenv";
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

/**
 * Groq (Llama3 Scout) クイズ判定・講評用
 * @param input { prompt: string }
 */
export async function callGroqLlama3(input: { prompt: string }) {
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
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are an expert quiz judge and reviewer." },
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
