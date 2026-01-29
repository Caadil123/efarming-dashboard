import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators/project";

export async function GET() {
    const projects = await prisma.project.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validatedData = projectSchema.parse(body);

        const project = await prisma.project.create({
            data: {
                ...validatedData,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
            },
        });

        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
    }
}
