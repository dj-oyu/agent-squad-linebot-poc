import { describe, it, expect, vi, beforeEach } from "vitest";
import * as openaiTool from "../tools/openai-tool";
import * as geminiTool from "../tools/gemini-tool";
import * as grokTool from "../tools/grok-tool";
import * as groqTool from "../tools/groq-tool";

// Prismaを利用するAPI利用ログサービスをモック化
vi.mock("../services/api-usage-log", () => ({
  logApiUsage: vi.fn(),
}));

// モック設定後に対象モジュールを読み込む
import * as aiRouterModule from "../tools/ai-router";

describe("aiRouter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("code_generation用途でOpenAIラッパーが呼ばれる", async () => {
    const spy = vi.spyOn(openaiTool, "callOpenAIGPT4").mockResolvedValue("openai-ok");
    const result = await aiRouterModule.aiRouter("code_generation", { prompt: "test" });
    expect(result).toBe("openai-ok");
    expect(spy).toHaveBeenCalledWith({ prompt: "test" });
  });

  it("quiz_generation用途でGeminiラッパーが呼ばれる", async () => {
    const spy = vi.spyOn(geminiTool, "callGeminiPro").mockResolvedValue("gemini-ok");
    const result = await aiRouterModule.aiRouter("quiz_generation", { url: "http://example.com" });
    expect(result).toBe("gemini-ok");
    expect(spy).toHaveBeenCalledWith({ url: "http://example.com" });
  });

  it("quiz_judgement用途でGroqラッパーが呼ばれる", async () => {
    const spy = vi.spyOn(groqTool, "callGroqLlama3").mockResolvedValue("groq-ok");
    const result = await aiRouterModule.aiRouter("quiz_judgement", { prompt: "judge" });
    expect(result).toBe("groq-ok");
    expect(spy).toHaveBeenCalledWith({ prompt: "judge" });
  });

  it("default用途でGrokラッパーが呼ばれる", async () => {
    const spy = vi.spyOn(grokTool, "callGrok").mockResolvedValue("grok-ok");
    const result = await aiRouterModule.aiRouter("default", { prompt: "hello" });
    expect(result).toBe("grok-ok");
    expect(spy).toHaveBeenCalledWith({ prompt: "hello" });
  });

  it("不正な用途でもGrokラッパーが呼ばれる", async () => {
    const spy = vi.spyOn(grokTool, "callGrok").mockResolvedValue("grok-ok");
    const result = await aiRouterModule.aiRouter("unknown" as any, { prompt: "hello" });
    expect(result).toBe("grok-ok");
    expect(spy).toHaveBeenCalledWith({ prompt: "hello" });
  });
});
