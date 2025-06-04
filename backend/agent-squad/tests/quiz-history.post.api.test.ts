import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";

// Prisma create mock
const createMock = vi.fn().mockResolvedValue({
  id: "1",
  userId: "user-1",
  quiz: '{"q":"test"}',
  answer: "S3",
  result: "正解",
  createdAt: new Date(),
});
vi.mock("@prisma/client", () => {
  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      quizHistory: {
        create: createMock,
      },
    })),
  };
});

let app: any;
beforeAll(async () => {
  const mod = await import("../mcp-server");
  app = mod.app;
});

describe("POST /quiz-history", () => {
  it("履歴を登録して結果を返す", async () => {
    const payload = { userId: "user-1", quiz: { q: "test" }, answer: "S3", result: "正解" };
    const res = await request(app).post("/quiz-history").send(payload).expect(201);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        quiz: JSON.stringify({ q: "test" }),
        answer: "S3",
        result: "正解",
      },
    });
    expect(res.body.userId).toBe("user-1");
  });
});
