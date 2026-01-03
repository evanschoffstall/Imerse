import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { EntityType } from "@/types/version";
import { compareSnapshots } from "@/types/version";
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
    campaign: prisma.campaign,
  };

  const model = modelMap[entityType];
  if (!model) return null;

  return model.findUnique({
    where: { id: entityId },
  });
}

// Helper function to update entity
async function updateEntity(
  entityType: EntityType,
  entityId: string,
  data: Record<string, any>
) {
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
    campaign: prisma.campaign,
  };

  const model = modelMap[entityType];
  if (!model) return null;

  // Remove system fields that shouldn't be updated
  const { id, createdAt, updatedAt, createdById, ...updateData } = data;

  return model.update({
    where: { id: entityId },
    data: updateData,
  });
}

// GET /api/versions/[id] - Get a specific version
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const version = await prisma.version.findUnique({
      where: { id: id },
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
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Check permissions
    const hasAccess =
      version.campaign.ownerId === session.user.id ||
      version.campaign.campaignRoles.length > 0;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ version });
  } catch (error) {
    console.error("Error fetching version:", error);
    return NextResponse.json(
      { error: "Failed to fetch version" },
      { status: 500 }
    );
  }
}

// POST /api/versions/[id]/restore - Restore an entity to this version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const version = await prisma.version.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            id: true,
            ownerId: true,
            campaignRoles: {
              where: { userId: session.user.id, isAdmin: true },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Check permissions
    const hasPermission =
      version.campaign.ownerId === session.user.id ||
      version.campaign.campaignRoles.length > 0;

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to restore this version" },
        { status: 403 }
      );
    }

    // Get current entity state
    const currentEntity = await fetchEntity(
      version.entityType as EntityType,
      version.entityId
    );

    if (!currentEntity) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    // Restore the entity to the version snapshot
    const restoredEntity = await updateEntity(
      version.entityType as EntityType,
      version.entityId,
      version.snapshot as Record<string, any>
    );

    // Create a new version entry for the restore action
    const lastVersion = await prisma.version.findFirst({
      where: {
        entityType: version.entityType,
        entityId: version.entityId,
      },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    const newVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    await prisma.version.create({
      data: {
        entityType: version.entityType,
        entityId: version.entityId,
        versionNumber: newVersionNumber,
        snapshot: restoredEntity as any,
        changeType: "update",
        changesMade: `Restored to version ${version.versionNumber}`,
        changedFields: compareSnapshots(
          currentEntity,
          version.snapshot as Record<string, any>
        ).map((d) => d.field) as any,
        campaignId: version.campaignId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      restoredEntity,
      message: `Successfully restored to version ${version.versionNumber}`,
    });
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 }
    );
  }
}

// DELETE /api/versions/[id] - Delete a version (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const version = await prisma.version.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Only campaign owner can delete versions
    if (version.campaign.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this version" },
        { status: 403 }
      );
    }

    await prisma.version.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting version:", error);
    return NextResponse.json(
      { error: "Failed to delete version" },
      { status: 500 }
    );
  }
}
