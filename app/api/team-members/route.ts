import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teamMemberSchema } from "@/lib/validators/team-member";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const teamMembers = await prisma.teamMember.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(teamMembers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = teamMemberSchema.parse(body);

        const teamMember = await prisma.teamMember.create({
            data: {
                name: validatedData.name,
                title: validatedData.title,
                description: validatedData.description,
                imageUrl: validatedData.imageUrl,
                isActive: validatedData.isActive,
            },
        });

        return NextResponse.json(teamMember);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
    }
}
