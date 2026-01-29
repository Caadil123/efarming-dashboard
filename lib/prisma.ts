import { PrismaClient } from "../prisma/generated-client";

const globalForPrisma = global as unknown as { prisma_final: PrismaClient };

export const prisma =
    globalForPrisma.prisma_final ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma_final = prisma;
}
