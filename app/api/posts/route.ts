import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators/post";

export async function GET() {
    const posts = await prisma.post.findMany({
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validatedData = postSchema.parse(body);

        const post = await prisma.post.create({
            data: {
                ...validatedData,
                authorId: session.user.id,
                publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,
            },
        });

        return NextResponse.json(post);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
    }
}
