import { prisma } from "@/lib/db";
import { Permission, requireCampaignAccess } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Check campaign access
    await requireCampaignAccess(campaignId, Permission.READ);

    // Just fetch characters - simpler and faster
    const characters = await prisma.character.findMany({
      where: { campaignId },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        imageId: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    const entities = characters.map((c) => ({
      ...c,
      type: "character",
      image: c.imageId ? `/api/images/${c.imageId}` : null,
    }));

    return NextResponse.json({ entities });
  } catch (error) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("Error fetching recent entities:", err);
    return NextResponse.json(
      { error: "Failed to fetch recent entities" },
      { status: 500 }
    );
  }
}
