import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * OpenAI GPT-4.1 コード生成用
 * @param input { prompt: string }
 */
export async function callOpenAIGPT4(input: { prompt: string }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  try {
    // インスタンス生成を関数内に移動
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a helpful AI coding assistant." },
        { role: "user", content: input.prompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("OpenAI会話APIエラー:", err);
    throw new Error("OpenAI会話APIエラー: " + (err instanceof Error ? err.message : String(err)));
  }
}
