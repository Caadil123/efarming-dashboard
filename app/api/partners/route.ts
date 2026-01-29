import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { partnerSchema } from "@/lib/validators/partner";

export async function GET() {
    try {
        const partners = await (prisma as any).partner.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(partners);
    } catch (error) {
        console.error("GET partners error:", error);
        return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await req.json();
        const validatedData = partnerSchema.parse(json);

        const partner = await (prisma as any).partner.create({
            data: {
                name: validatedData.name,
                imageUrl: validatedData.imageUrl,
                url: validatedData.url,
            },
        });

        return NextResponse.json(partner);
    } catch (error: any) {
        console.error("POST partner error:", error);
        return NextResponse.json({ error: error.message || "Failed to create partner" }, { status: 400 });
    }
}
