import { describe, it, expect, vi, beforeEach } from "vitest";
import * as grokTool from "../tools/grok-tool";

describe("callGrok", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GROK_API_KEY = "dummy-key";
  });

  it("APIキー未設定時は例外", async () => {
    process.env.GROK_API_KEY = "";
    await expect(grokTool.callGrok({ prompt: "test" })).rejects.toThrow("GROK_API_KEY is not set");
  });

  it("正常系: Grok API呼び出し", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: "grok" }),
    });
    globalThis.fetch = mockFetch as any;
    const result = await grokTool.callGrok({ prompt: "test" });
    expect(result).toEqual({ result: "grok" });
    expect(mockFetch).toHaveBeenCalled();
  });

  it("APIエラー時は例外", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });
    globalThis.fetch = mockFetch as any;
    await expect(grokTool.callGrok({ prompt: "test" })).rejects.toThrow("Grok API error: 401 Unauthorized");
  });
});
