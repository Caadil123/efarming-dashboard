import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teamMemberSchema } from "@/lib/validators/team-member";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = teamMemberSchema.partial().parse(body);

        const teamMember = await prisma.teamMember.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json(teamMember);
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
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.teamMember.update({
            where: { id },
            data: { isDeleted: true },
        });

        return NextResponse.json({ message: "Team member deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
    }
}

