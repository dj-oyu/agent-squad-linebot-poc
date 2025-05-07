import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * クイズ履歴をDBに記録
 */
export async function logQuizHistory({
  userId,
  quiz,
  answer,
  result,
}: {
  userId: string;
  quiz: any;
  answer: string;
  result: string;
}) {
  return prisma.quizHistory.create({
    data: {
      userId,
      quiz: JSON.stringify(quiz),
      answer,
      result,
    },
  });
}

/**
 * ユーザーごとのクイズ履歴を取得
 */
export async function getQuizHistories(userId: string, limit = 20) {
  return prisma.quizHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
