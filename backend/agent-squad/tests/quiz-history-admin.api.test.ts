import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// Prismaのモック
const findManyMock = vi.fn().mockResolvedValue([
  { id: "1", userId: "user-1", answer: "S3", result: "正解", createdAt: new Date() },
  { id: "2", userId: "user-2", answer: "EC2", result: "不正解", createdAt: new Date() },
]);
vi.mock("@prisma/client", () => {
  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      quizHistory: {
        findMany: findManyMock,
      },
    })),
  };
});

// 管理者ID環境変数を設定してからアプリを読み込む
process.env.ADMIN_LINE_USER_ID = "admin-user";
// テスト対象アプリはモック定義後に読み込む
const { app } = await import("../mcp-server");

// LINE JWT検証モック
vi.mock("../services/line-jwt", () => ({
  verifyLineIdToken: vi.fn().mockImplementation((token: string) => {
    if (token === "admin-token") return Promise.resolve("admin-user");
    throw new Error("Invalid token");
  }),
}));

describe("GET /quiz-history-admin", () => {
  it("admin claimがない場合は403", async () => {
    await request(app)
      .get("/quiz-history-admin")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);
  });

  it("admin claimがある場合は全件取得できる", async () => {
    const res = await request(app)
      .get("/quiz-history-admin")
      .set("Authorization", "Bearer admin-token")
      .expect(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].userId).toBe("user-1");
    expect(res.body[1].userId).toBe("user-2");
    expect(findManyMock).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
  });
});
