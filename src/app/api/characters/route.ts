import { Permission, requireCampaignAccess } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { versionCreate } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }

    // Check campaign access (READ permission)
    await requireCampaignAccess(campaignId, Permission.READ);

    const characters = await prisma.character.findMany({
      where: {
        campaignId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        birthCalendar: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ characters });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching characters:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, campaignId, createdById, ...rest } = body;

    if (!name || !campaignId || !createdById) {
      return NextResponse.json(
        { error: "Name, campaignId, and createdById are required" },
        { status: 400 }
      );
    }

    // Check campaign access (CREATE permission)
    await requireCampaignAccess(campaignId, Permission.CREATE);

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const character = await prisma.character.create({
      data: {
        name,
        slug,
        campaignId,
        createdById,
        ...rest,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create initial version
    await versionCreate("character", character.id, campaignId, createdById);

    return NextResponse.json({ character }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error creating character:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}
