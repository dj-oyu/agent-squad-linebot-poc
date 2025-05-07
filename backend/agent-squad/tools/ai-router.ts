/**
 * AI用途分担ルーティング
 * 用途ごとに最適なAI API（OpenAI, Gemini, Grok, Groq）を呼び分ける
 * 各AI APIのラッパーはtools/配下に実装
 */

type Purpose =
  | "code_generation"
  | "quiz_generation"
  | "document_summary"
  | "quiz_judgement"
  | "quiz_review"
  | "default";

import { callOpenAIGPT4 } from "./openai-tool";
import { callGeminiPro } from "./gemini-tool";
import { callGrok } from "./grok-tool";
import { callGroqLlama3 } from "./groq-tool";
import { logApiUsage } from "../services/api-usage-log";

export async function aiRouter(purpose: Purpose, input: any): Promise<any> {
  switch (purpose) {
    case "code_generation":
      // OpenAI GPT-4.1
      const openaiRes = await callOpenAIGPT4(input);
      await logApiUsage({
        userId: input.userId || "unknown",
        aiType: "openai",
        purpose,
        request: input,
        response: openaiRes,
      });
      return openaiRes;
    case "quiz_generation":
    case "document_summary":
      // Gemini Pro 2.5
      const geminiRes = await callGeminiPro(input);
      await logApiUsage({
        userId: input.userId || "unknown",
        aiType: "gemini",
        purpose,
        request: input,
        response: geminiRes,
      });
      return geminiRes;
    case "quiz_judgement":
    case "quiz_review":
      // Groq (Llama3 Scout)
      const groqRes = await callGroqLlama3(input);
      await logApiUsage({
        userId: input.userId || "unknown",
        aiType: "groq",
        purpose,
        request: input,
        response: groqRes,
      });
      return groqRes;
    default:
      // Grok（無料枠）
      const grokRes = await callGrok(input);
      await logApiUsage({
        userId: input.userId || "unknown",
        aiType: "grok",
        purpose,
        request: input,
        response: grokRes,
      });
      return grokRes;
  }
}
