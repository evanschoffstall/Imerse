import { auth } from "@/auth";
import { getCampaignActivity } from "@/lib/db";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Verify user has access to this campaign
    const membership = await prisma.campaignRole.findFirst({
      where: {
        campaignId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this campaign" },
        { status: 403 }
      );
    }

    const activity = await getCampaignActivity(id, limit);

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Failed to fetch campaign activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
