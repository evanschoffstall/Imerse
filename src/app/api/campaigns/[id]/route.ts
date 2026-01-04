import { authConfig } from "@/auth";
import { prisma } from "@/lib/db";
import { Permission, requireCampaignAccess } from "@/lib/permissions";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId = id;

    // Check campaign access (READ permission)
    await requireCampaignAccess(campaignId, Permission.READ);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId = id;

    const body = await request.json();
    const { name, description, image, backgroundImage } = body;

    // Check campaign access (MANAGE permission for campaign settings)
    await requireCampaignAccess(campaignId, Permission.MANAGE);

    // Check campaign exists and user owns it
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Validate data
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Campaign name cannot be empty" },
          { status: 400 }
        );
      }

      if (name.length > 255) {
        return NextResponse.json(
          { error: "Campaign name must be less than 255 characters" },
          { status: 400 }
        );
      }
    }

    // Update campaign
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .substring(0, 191);
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    if (image !== undefined) {
      updateData.image = image || null;
    }

    if (backgroundImage !== undefined) {
      updateData.backgroundImage = backgroundImage || null;
    }

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ campaign });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId = id;

    // Only campaign owner can delete (MANAGE permission)
    await requireCampaignAccess(campaignId, Permission.MANAGE);

    // Delete campaign
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
