import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Grok（無料枠）汎用応答用
 * @param input { prompt: string }
 */
export async function callGrok(input: { prompt: string }) {
  const GROK_API_KEY = process.env.GROK_API_KEY || "";
  if (!GROK_API_KEY) {
    throw new Error("GROK_API_KEY is not set");
  }
  try {
    const res = await fetch("https://api.grok.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-beta",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: input.prompt },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const errMsg = `Grok API error: ${res.status} ${res.statusText}`;
      console.error(errMsg);
      throw new Error(errMsg);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Grok会話APIエラー:", err);
    throw new Error("Grok会話APIエラー: " + (err instanceof Error ? err.message : String(err)));
  }
}
