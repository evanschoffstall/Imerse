import { auth } from "@/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Helper to get campaignId from entity
async function getCampaignIdFromEntity(
  entityId: string,
  entityType: string
): Promise<string | null> {
  switch (entityType) {
    case "character":
      const character = await prisma.character.findUnique({
        where: { id: entityId },
        select: { campaignId: true },
      });
      return character?.campaignId || null;
    case "item":
      const item = await prisma.item.findUnique({
        where: { id: entityId },
        select: { campaignId: true },
      });
      return item?.campaignId || null;
    case "race":
      const race = await prisma.race.findUnique({
        where: { id: entityId },
        select: { campaignId: true },
      });
      return race?.campaignId || null;
    default:
      return null;
  }
}

// PATCH /api/entity-abilities/[id] - Update entity ability
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entityAbility = await prisma.entityAbility.findUnique({
      where: { id: params.id },
      select: { entityId: true, entityType: true },
    });

    if (!entityAbility) {
      return Response.json(
        { error: "Entity ability not found" },
        { status: 404 }
      );
    }

    const campaignId = await getCampaignIdFromEntity(
      entityAbility.entityId,
      entityAbility.entityType
    );

    if (!campaignId) {
      return Response.json(
        { error: "Associated entity not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const canEdit = await hasPermission(
      campaignId,
      session.user.id,
      "EDIT_ENTITIES"
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const { charges, position, note, isPrivate } = data;

    const updated = await prisma.entityAbility.update({
      where: { id: params.id },
      data: {
        ...(charges !== undefined && { charges }),
        ...(position !== undefined && { position }),
        ...(note !== undefined && { note }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      include: {
        ability: {
          select: {
            id: true,
            name: true,
            type: true,
            charges: true,
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

    return Response.json(updated);
  } catch (error) {
    console.error("Error updating entity ability:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/entity-abilities/[id] - Delete entity ability
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entityAbility = await prisma.entityAbility.findUnique({
      where: { id: params.id },
      select: { entityId: true, entityType: true },
    });

    if (!entityAbility) {
      return Response.json(
        { error: "Entity ability not found" },
        { status: 404 }
      );
    }

    const campaignId = await getCampaignIdFromEntity(
      entityAbility.entityId,
      entityAbility.entityType
    );

    if (!campaignId) {
      return Response.json(
        { error: "Associated entity not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const canDelete = await hasPermission(
      campaignId,
      session.user.id,
      "EDIT_ENTITIES"
    );
    if (!canDelete) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.entityAbility.delete({
      where: { id: params.id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting entity ability:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
