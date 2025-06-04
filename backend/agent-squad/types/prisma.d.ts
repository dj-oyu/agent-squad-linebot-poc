declare module "@prisma/client" {
  export class PrismaClient {
    constructor(): void;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    quizHistory: {
      create: (...args: any[]) => Promise<any>;
      findMany: (...args: any[]) => Promise<any[]>;
    };
    apiUsageLog: {
      create: (...args: any[]) => Promise<any>;
    };
  }
}
