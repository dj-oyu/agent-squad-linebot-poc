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

export async function aiRouter(purpose: Purpose, input: any): Promise<any> {
  switch (purpose) {
    case "code_generation":
      // OpenAI GPT-4.1
      return await callOpenAIGPT4(input);
    case "quiz_generation":
    case "document_summary":
      // Gemini Pro 2.5
      return await callGeminiPro(input);
    case "quiz_judgement":
    case "quiz_review":
      // Groq (Llama3 Scout)
      // return await callGroqLlama3(input);
      return { result: "Groq Llama3 Scout (ダミー応答)" };
    default:
      // Grok（無料枠）
      // return await callGrok(input);
      return { result: "Grok (ダミー応答)" };
  }
}
