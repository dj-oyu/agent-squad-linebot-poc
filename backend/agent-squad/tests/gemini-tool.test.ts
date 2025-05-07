import { describe, it, expect, vi, beforeEach } from "vitest";
import * as geminiTool from "../tools/gemini-tool";

describe("callGeminiPro", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GEMINI_API_KEY = "dummy-key";
  });

  it("APIキー未設定時は例外", async () => {
    process.env.GEMINI_API_KEY = "";
    await expect(geminiTool.callGeminiPro({ url: "http://example.com" })).rejects.toThrow("GEMINI_API_KEY is not set");
  });

  it("正常系: Gemini API呼び出し", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: "gemini" }),
    });
    globalThis.fetch = mockFetch as any;
    const result = await geminiTool.callGeminiPro({ url: "http://example.com" });
    expect(result).toEqual({ result: "gemini" });
    expect(mockFetch).toHaveBeenCalled();
  });

  it("APIエラー時は例外", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });
    globalThis.fetch = mockFetch as any;
    await expect(geminiTool.callGeminiPro({ url: "http://example.com" })).rejects.toThrow("Gemini API error: 500 Internal Server Error");
  });
});
