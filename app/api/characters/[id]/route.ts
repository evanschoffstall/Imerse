import { auth } from "@/auth";
import { Permission, requireCampaignAccess } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  captureVersionBeforeUpdate,
  createVersionAfterUpdate,
} from "@/lib/versioning";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const character = await prisma.character.findUnique({
      where: {
        id: id,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Check campaign access (READ permission)
    await requireCampaignAccess(character.campaignId, Permission.READ);

    return NextResponse.json({ character });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching character:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingCharacter = await prisma.character.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingCharacter) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Check campaign access (EDIT permission)
    await requireCampaignAccess(existingCharacter.campaignId, Permission.EDIT);

    // Capture version before update
    const previousSnapshot = await captureVersionBeforeUpdate(
      "character",
      id
    );

    const body = await request.json();
    const { name, ...rest } = body;

    const updateData: any = { ...rest };

    // Update slug if name changed
    if (name && name !== existingCharacter.name) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
    }

    const character = await prisma.character.update({
      where: { id: id },
      data: updateData,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create version after update
    await createVersionAfterUpdate(
      "character",
      id,
      existingCharacter.campaignId,
      session.user.id,
      previousSnapshot
    );

    return NextResponse.json({ character });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error updating character:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingCharacter = await prisma.character.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingCharacter) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Check campaign access (DELETE permission)
    await requireCampaignAccess(
      existingCharacter.campaignId,
      Permission.DELETE
    );

    await prisma.character.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error deleting character:", error);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
}
