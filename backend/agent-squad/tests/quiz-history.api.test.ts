import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../mcp-server";

// Prismaのモック
vi.mock("@prisma/client", () => {
  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      quizHistory: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "1",
            userId: "user-1",
            quiz: '{"q":"AWSのストレージサービスは？"}',
            answer: "S3",
            result: "正解",
            createdAt: new Date(),
          },
        ]),
      },
    })),
  };
});

describe("GET /quiz-history", () => {
  it("認証トークンがない場合は401", async () => {
    await request(app)
      .get("/quiz-history?userId=user-1")
      .expect(401);
  });

  it("ユーザーID指定＋認証トークンで履歴が取得できる", async () => {
    const res = await request(app)
      .get("/quiz-history?userId=user-1")
      .set("Authorization", "Bearer testtoken")
      .expect(200);
    expect(res.body[0].answer).toBe("S3");
    expect(res.body[0].userId).toBe("user-1");
  });
});
