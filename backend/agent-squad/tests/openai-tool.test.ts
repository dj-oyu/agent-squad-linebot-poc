import { describe, it, expect, vi, beforeEach } from "vitest";

// OpenAIクラスのモックをテストファイルのトップレベルで適用
const mockCreate = vi.fn();
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    })),
  };
});

import * as openaiTool from "../tools/openai-tool";

describe("callOpenAIGPT4", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "dummy-key";
  });

  it("APIキー未設定時は例外", async () => {
    process.env.OPENAI_API_KEY = "";
    await expect(openaiTool.callOpenAIGPT4({ prompt: "test" })).rejects.toThrow("OPENAI_API_KEY is not set");
  });

  it("正常系: OpenAI API呼び出し", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "result" } }],
    });
    const result = await openaiTool.callOpenAIGPT4({ prompt: "test" });
    expect(result).toBe("result");
    expect(mockCreate).toHaveBeenCalled();
  });

  it("APIエラー時は例外", async () => {
    mockCreate.mockRejectedValueOnce(new Error("api error"));
    await expect(openaiTool.callOpenAIGPT4({ prompt: "test" })).rejects.toThrow("api error");
  });
});
