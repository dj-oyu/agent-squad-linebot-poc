import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Gemini Pro 2.5 ドキュメント要約・クイズ生成用
 * @param input { url: string, userId?: string }
 */
export async function callGeminiPro(input: { url: string; userId?: string }) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  // ここでは資料URLをそのままプロンプトに渡す（本番は事前に内容取得・要約等を追加）
  const prompt = `以下のURLの資料内容を要約し、AWS資格試験対策のクイズを3問自動生成してください。\n資料URL: ${input.url}`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );
    if (!res.ok) {
      const errMsg = `Gemini API error: ${res.status} ${res.statusText}`;
      console.error(errMsg);
      throw new Error(errMsg);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Gemini会話APIエラー:", err);
    throw new Error("Gemini会話APIエラー: " + (err instanceof Error ? err.message : String(err)));
  }
}
