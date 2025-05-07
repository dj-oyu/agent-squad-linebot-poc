import { describe, it, expect, vi, beforeEach } from "vitest";
import * as groqTool from "../tools/groq-tool";

describe("callGroqLlama3", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GROQ_API_KEY = "dummy-key";
  });

  it("APIキー未設定時は例外", async () => {
    process.env.GROQ_API_KEY = "";
    await expect(groqTool.callGroqLlama3({ prompt: "judge" })).rejects.toThrow("GROQ_API_KEY is not set");
  });

  it("正常系: Groq API呼び出し", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: "groq" }),
    });
    globalThis.fetch = mockFetch as any;
    const result = await groqTool.callGroqLlama3({ prompt: "judge" });
    expect(result).toEqual({ result: "groq" });
    expect(mockFetch).toHaveBeenCalled();
  });

  it("APIエラー時は例外", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });
    globalThis.fetch = mockFetch as any;
    await expect(groqTool.callGroqLlama3({ prompt: "judge" })).rejects.toThrow("Groq API error: 403 Forbidden");
  });
});
