import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators/post";

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            where: { isDeleted: false },
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(posts);
    } catch (error: any) {
        console.error("GET posts error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validatedData = postSchema.parse(body);

        const post = await prisma.post.create({
            data: {
                title: validatedData.title,
                slug: validatedData.slug || (null as any),
                excerpt: validatedData.excerpt,
                content: validatedData.content,
                contentSections: validatedData.contentSections as any,
                featuredImage: validatedData.featuredImage,
                status: validatedData.status,
                authorId: session.user.id,
                publishedAt: (validatedData.status === "PUBLISHED"
                    ? (validatedData.publishedAt ? new Date(validatedData.publishedAt) : new Date())
                    : null) as any,
            } as any,
        });

        return NextResponse.json(post);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
    }
}
