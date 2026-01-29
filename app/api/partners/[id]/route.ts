import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { partnerSchema } from "@/lib/validators/partner";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await req.json();
        const validatedData = partnerSchema.parse(json);

        const partner = await (prisma as any).partner.update({
            where: { id: params.id },
            data: {
                name: validatedData.name,
                imageUrl: validatedData.imageUrl,
                url: validatedData.url,
            },
        });

        return NextResponse.json(partner);
    } catch (error: any) {
        console.error("PATCH partner error:", error);
        return NextResponse.json({ error: error.message || "Failed to update partner" }, { status: 400 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await (prisma as any).partner.update({
            where: { id: params.id },
            data: { isDeleted: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE partner error:", error);
        return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 });
    }
}
