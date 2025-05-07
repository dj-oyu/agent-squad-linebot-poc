import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * API利用ログをDBに記録
 */
export async function logApiUsage({
  userId,
  aiType,
  purpose,
  request,
  response,
  cost,
}: {
  userId: string;
  aiType: string;
  purpose: string;
  request: any;
  response: any;
  cost?: number;
}) {
  return prisma.apiUsageLog.create({
    data: {
      userId,
      aiType,
      purpose,
      request: JSON.stringify(request),
      response: JSON.stringify(response),
      cost,
    },
  });
}
