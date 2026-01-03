import { auth } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/maps/[id]/groups/[groupId] - Get a single group
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id, groupId } = await params;
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const group = await prisma.mapGroup.findUnique({
      where: { id: groupId },
      include: {
        map: {
          select: { id: true, campaignId: true },
        },
        parent: {
          select: { id: true, name: true },
        },
        children: {
          select: { id: true, name: true },
        },
        markers: {
          select: { id: true, name: true, longitude: true, latitude: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!group) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    // Check campaign permission
    const canView = await hasPermission(
      group.map.campaignId,
      Permission.VIEW_ENTITIES,
      session.user.id
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json(group);
  } catch (error) {
    console.error("Error fetching map group:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/maps/[id]/groups/[groupId] - Update a group
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id, groupId } = await params;
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const group = await prisma.mapGroup.findUnique({
      where: { id: groupId },
      include: {
        map: {
          select: { campaignId: true },
        },
      },
    });

    if (!group) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    // Check campaign permission
    const canEdit = await hasPermission(
      group.map.campaignId,
      Permission.EDIT_ENTITIES,
      session.user.id
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updatedGroup = await prisma.mapGroup.update({
      where: { id: groupId },
      data: {
        name: body.name,
        position: body.position,
        isShown: body.isShown,
        isPrivate: body.isPrivate,
        parentId: body.parentId,
      },
      include: {
        parent: {
          select: { id: true, name: true },
        },
        children: {
          select: { id: true, name: true },
        },
        markers: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return Response.json(updatedGroup);
  } catch (error) {
    console.error("Error updating map group:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/maps/[id]/groups/[groupId] - Delete a group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id, groupId } = await params;
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const group = await prisma.mapGroup.findUnique({
      where: { id: groupId },
      include: {
        map: {
          select: { campaignId: true },
        },
      },
    });

    if (!group) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    // Check campaign permission
    const canDelete = await hasPermission(
      group.map.campaignId,
      Permission.DELETE_ENTITIES,
      session.user.id
    );
    if (!canDelete) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.mapGroup.delete({
      where: { id: groupId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting map group:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
