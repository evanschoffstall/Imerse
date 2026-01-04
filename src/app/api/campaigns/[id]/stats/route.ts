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

    // Simple existence checks - faster than counts
    const [character, location] = await Promise.all([
      prisma.character.findFirst({
        where: { campaignId },
        select: { id: true },
      }),
      prisma.location.findFirst({
        where: { campaignId },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      hasCharacters: !!character,
      hasLocations: !!location,
    });
  } catch (error) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("Error fetching campaign stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch campaign stats" },
      { status: 500 }
    );
  }
}
