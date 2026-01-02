import { auth } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/creatures/[id] - Get creature
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creature = await prisma.creature.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            type: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        locations: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            locations: true,
          },
        },
      },
    });

    if (!creature) {
      return Response.json({ error: "Creature not found" }, { status: 404 });
    }

    // Check permissions
    const canView = await hasPermission(
      creature.campaignId,
      Permission.VIEW_ENTITIES,
      session.user.id
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json(creature);
  } catch (error) {
    console.error("Error fetching creature:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/creatures/[id] - Update creature
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creature = await prisma.creature.findUnique({
      where: { id: params.id },
      select: { campaignId: true },
    });

    if (!creature) {
      return Response.json({ error: "Creature not found" }, { status: 404 });
    }

    // Check permissions
    const canEdit = await hasPermission(
      creature.campaignId,
      Permission.EDIT_ENTITIES,
      session.user.id
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const { name, entry, type, image, isExtinct, isDead, isPrivate, parentId } =
      data;

    const updated = await prisma.creature.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(entry !== undefined && { entry }),
        ...(type !== undefined && { type }),
        ...(image !== undefined && { image }),
        ...(isExtinct !== undefined && { isExtinct }),
        ...(isDead !== undefined && { isDead }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(parentId !== undefined && { parentId }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Error updating creature:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/creatures/[id] - Delete creature
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creature = await prisma.creature.findUnique({
      where: { id: params.id },
      select: { campaignId: true },
    });

    if (!creature) {
      return Response.json({ error: "Creature not found" }, { status: 404 });
    }

    // Check permissions
    const canDelete = await hasPermission(
      creature.campaignId,
      Permission.DELETE_ENTITIES,
      session.user.id
    );
    if (!canDelete) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.creature.delete({
      where: { id: params.id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting creature:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
