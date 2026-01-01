import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { EntityType } from "@/types/relationship";
import { relationshipFormSchema } from "@/types/relationship";
import { NextRequest, NextResponse } from "next/server";

// Helper function to fetch entity by type and ID
async function fetchEntity(entityType: EntityType, entityId: string) {
  const modelMap: Record<EntityType, any> = {
    character: prisma.character,
    location: prisma.location,
    item: prisma.item,
    quest: prisma.quest,
    event: prisma.event,
    journal: prisma.journal,
    note: prisma.note,
    family: prisma.family,
    race: prisma.race,
    organisation: prisma.organisation,
    tag: prisma.tag,
    timeline: prisma.timeline,
    map: prisma.map,
  };

  const model = modelMap[entityType];
  if (!model) return null;

  return model.findUnique({
    where: { id: entityId },
    select: { id: true, name: true, slug: true, image: true },
  });
}

// GET /api/relationships/[id] - Get a specific relationship
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const relationship = await prisma.relationship.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          select: {
            id: true,
            ownerId: true,
            campaignRoles: {
              where: { userId: session.user.id },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasAccess =
      relationship.campaign.ownerId === session.user.id ||
      relationship.campaign.campaignRoles.length > 0;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch entity details
    const [sourceEntity, targetEntity] = await Promise.all([
      fetchEntity(
        relationship.sourceEntityType as EntityType,
        relationship.sourceEntityId
      ),
      fetchEntity(
        relationship.targetEntityType as EntityType,
        relationship.targetEntityId
      ),
    ]);

    return NextResponse.json({
      relationship: {
        ...relationship,
        sourceEntity: sourceEntity
          ? { ...sourceEntity, type: relationship.sourceEntityType }
          : null,
        targetEntity: targetEntity
          ? { ...targetEntity, type: relationship.targetEntityType }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching relationship:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationship" },
      { status: 500 }
    );
  }
}

// PATCH /api/relationships/[id] - Update a relationship
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const relationship = await prisma.relationship.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          select: {
            ownerId: true,
            campaignRoles: {
              where: { userId: session.user.id, isAdmin: true },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasPermission =
      relationship.campaign.ownerId === session.user.id ||
      relationship.campaign.campaignRoles.length > 0;

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to edit this relationship" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = relationshipFormSchema.partial().parse(body);

    const updatedRelationship = await prisma.relationship.update({
      where: { id: params.id },
      data: {
        relationshipType: validatedData.relationshipType,
        description: validatedData.description,
        metadata: validatedData.metadata as any,
        bidirectional: validatedData.bidirectional,
        isPrivate: validatedData.isPrivate,
      },
    });

    // Fetch entity details
    const [sourceEntity, targetEntity] = await Promise.all([
      fetchEntity(
        updatedRelationship.sourceEntityType as EntityType,
        updatedRelationship.sourceEntityId
      ),
      fetchEntity(
        updatedRelationship.targetEntityType as EntityType,
        updatedRelationship.targetEntityId
      ),
    ]);

    return NextResponse.json({
      relationship: {
        ...updatedRelationship,
        sourceEntity: sourceEntity
          ? { ...sourceEntity, type: updatedRelationship.sourceEntityType }
          : null,
        targetEntity: targetEntity
          ? { ...targetEntity, type: updatedRelationship.targetEntityType }
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating relationship:", error);
    return NextResponse.json(
      { error: "Failed to update relationship" },
      { status: 500 }
    );
  }
}

// DELETE /api/relationships/[id] - Delete a relationship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const relationship = await prisma.relationship.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          select: {
            ownerId: true,
            campaignRoles: {
              where: { userId: session.user.id, isAdmin: true },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasPermission =
      relationship.campaign.ownerId === session.user.id ||
      relationship.campaign.campaignRoles.length > 0;

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to delete this relationship" },
        { status: 403 }
      );
    }

    await prisma.relationship.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting relationship:", error);
    return NextResponse.json(
      { error: "Failed to delete relationship" },
      { status: 500 }
    );
  }
}
