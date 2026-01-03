import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/maps/[id]/layers/[layerId] - Get a single layer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; layerId: string }> }
) {
  try {
    const { id, layerId } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const layer = await prisma.mapLayer.findUnique({
      where: { id: layerId },
      include: {
        map: {
          select: { id: true, campaignId: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!layer) {
      return Response.json({ error: "Layer not found" }, { status: 404 });
    }

    // Check campaign permission
    const canView = await hasPermission(
      layer.map.campaignId,
      Permission.VIEW_ENTITIES,
      session.user.id
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json(layer);
  } catch (error) {
    console.error("Error fetching map layer:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/maps/[id]/layers/[layerId] - Update a layer
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; layerId: string }> }
) {
  try {
    const { id, layerId } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const layer = await prisma.mapLayer.findUnique({
      where: { id: layerId },
      include: {
        map: {
          select: { campaignId: true },
        },
      },
    });

    if (!layer) {
      return Response.json({ error: "Layer not found" }, { status: 404 });
    }

    // Check campaign permission
    const canEdit = await hasPermission(
      layer.map.campaignId,
      Permission.EDIT_ENTITIES,
      session.user.id
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updatedLayer = await prisma.mapLayer.update({
      where: { id: layerId },
      data: {
        name: body.name,
        image: body.image,
        entry: body.entry,
        position: body.position,
        width: body.width,
        height: body.height,
        opacity: body.opacity,
        isVisible: body.isVisible,
        isPrivate: body.isPrivate,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return Response.json(updatedLayer);
  } catch (error) {
    console.error("Error updating map layer:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/maps/[id]/layers/[layerId] - Delete a layer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; layerId: string }> }
) {
  try {
    const { id, layerId } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const layer = await prisma.mapLayer.findUnique({
      where: { id: layerId },
      include: {
        map: {
          select: { campaignId: true },
        },
      },
    });

    if (!layer) {
      return Response.json({ error: "Layer not found" }, { status: 404 });
    }

    // Check campaign permission
    const canDelete = await hasPermission(
      layer.map.campaignId,
      Permission.DELETE_ENTITIES,
      session.user.id
    );
    if (!canDelete) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.mapLayer.delete({
      where: { id: layerId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting map layer:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
