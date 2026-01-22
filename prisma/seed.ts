import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import bcrypt from "bcrypt";

console.log("DATABASE_URL found:", !!process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("Admin@12345", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@efarming.local" },
        update: {},
        create: {
            email: "admin@efarming.local",
            name: "Super Admin",
            passwordHash,
            role: "ADMIN",
        },
    });

    console.log("Admin user created/updated:", admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
