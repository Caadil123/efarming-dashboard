import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators/post";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const post = await prisma.post.findUnique({
            where: { id },
        });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        return NextResponse.json(post);
    } catch (error: any) {
        console.error("GET post error:", error);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validatedData = postSchema.parse(body);

        const post = await prisma.post.update({
            where: { id },
            data: {
                title: validatedData.title,
                slug: validatedData.slug || (undefined as any),
                excerpt: validatedData.excerpt,
                content: validatedData.content,
                contentSections: validatedData.contentSections as any,
                featuredImage: validatedData.featuredImage,
                status: validatedData.status,
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

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await prisma.post.update({
            where: { id },
            data: { isDeleted: true },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
