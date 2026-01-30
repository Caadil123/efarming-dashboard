import { PrismaClient } from "../prisma/generated-client-v2";

const globalForPrisma = global as unknown as { prisma_v3: PrismaClient };

export const prisma =
    globalForPrisma.prisma_v3 ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma_v3 = prisma;
}
