import { prisma } from "@/lib/db";
import { Permission, requireCampaignAccess } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    // Check campaign access
    await requireCampaignAccess(campaignId, Permission.READ);

    // Fetch counts efficiently
    const [characterCount, locationCount] = await Promise.all([
      prisma.character.count({ where: { campaignId } }),
      prisma.location.count({ where: { campaignId } }),
    ]);

    return NextResponse.json({
      hasCharacters: characterCount > 0,
      hasLocations: locationCount > 0,
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
