import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validators/user";
import bcrypt from "bcrypt";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        where: { isDeleted: false },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            status: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = userSchema.parse(body);

        const passwordHash = await bcrypt.hash(validatedData.password, 10);

        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                passwordHash,
                role: validatedData.role,
                image: validatedData.image,
                status: validatedData.status,
            },
        });

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
    }
}
