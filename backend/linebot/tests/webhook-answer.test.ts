import { describe, it, expect, vi, beforeEach } from "vitest";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import request from "supertest";
import { Client } from "@line/bot-sdk";
import { app, client } from "../webhook";

// モック
vi.mock("@line/bot-sdk", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    middleware: vi.fn(() => (req, res, next) => next()),
    Client: vi.fn().mockImplementation(() => ({
      replyMessage: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

describe("LINE Bot クイズ回答→判定→履歴記録フロー", () => {
  beforeEach(() => {
    process.env.LINE_CHANNEL_SECRET = "dummy";
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "dummy";
    vi.clearAllMocks();
    vi.spyOn(client, "replyMessage").mockResolvedValue({} as any);
  });

  it("ユーザーの回答を受信し、agent squadで判定→LINE返信→履歴記録API呼び出し", async () => {
    // agent squad判定APIのモック
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: { judge: "正解", review: "Good!" },
      }),
    }) as any;

    // クイズ履歴記録APIのモック（今後拡張）
    // ...

    // LINE Webhookイベント（回答メッセージ）
    const event = {
      type: "message",
      message: { type: "text", text: "回答: S3" },
      replyToken: "dummy-token",
      source: { userId: "user-1" },
    };

    // Webhookリクエスト
    await request(app)
      .post("/webhook")
      .send({ events: [event] })
      .expect(200);

    // 期待値: agent squadに判定リクエストが送られ、LINEに判定結果が返信される
    expect(fetch).toHaveBeenCalled();
    expect(client.replyMessage).toHaveBeenCalledWith("dummy-token", [
      { type: "text", text: expect.stringContaining("正解") },
    ]);
  });
});
