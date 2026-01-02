import { auth } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/maps/[id]/markers/[markerId] - Get a single marker
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; markerId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marker = await prisma.mapMarker.findUnique({
      where: { id: params.markerId },
      include: {
        map: {
          select: { id: true, campaignId: true },
        },
        group: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!marker) {
      return Response.json({ error: "Marker not found" }, { status: 404 });
    }

    // Check campaign permission
    const canView = await hasPermission(
      marker.map.campaignId,
      Permission.READ,
      session.user.id
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json(marker);
  } catch (error) {
    console.error("Error fetching map marker:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/maps/[id]/markers/[markerId] - Update a marker
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; markerId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marker = await prisma.mapMarker.findUnique({
      where: { id: params.markerId },
      include: {
        map: {
          select: { campaignId: true },
        },
      },
    });

    if (!marker) {
      return Response.json({ error: "Marker not found" }, { status: 404 });
    }

    // Check campaign permission
    const canEdit = await hasPermission(
      marker.map.campaignId,
      Permission.EDIT,
      session.user.id
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updatedMarker = await prisma.mapMarker.update({
      where: { id: params.markerId },
      data: {
        name: body.name,
        entry: body.entry,
        longitude: body.longitude,
        latitude: body.latitude,
        shape: body.shape,
        size: body.size,
        colour: body.colour,
        fontColour: body.fontColour,
        icon: body.icon,
        customIcon: body.customIcon,
        customShape: body.customShape,
        opacity: body.opacity,
        circleRadius: body.circleRadius,
        polygonStyle: body.polygonStyle,
        isDraggable: body.isDraggable,
        isPopupless: body.isPopupless,
        pinSize: body.pinSize,
        css: body.css,
        entityId: body.entityId,
        entityType: body.entityType,
        isPrivate: body.isPrivate,
        groupId: body.groupId,
      },
      include: {
        group: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return Response.json(updatedMarker);
  } catch (error) {
    console.error("Error updating map marker:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/maps/[id]/markers/[markerId] - Delete a marker
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; markerId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marker = await prisma.mapMarker.findUnique({
      where: { id: params.markerId },
      include: {
        map: {
          select: { campaignId: true },
        },
      },
    });

    if (!marker) {
      return Response.json({ error: "Marker not found" }, { status: 404 });
    }

    // Check campaign permission
    const canDelete = await hasPermission(
      marker.map.campaignId,
      Permission.DELETE,
      session.user.id
    );
    if (!canDelete) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.mapMarker.delete({
      where: { id: params.markerId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting map marker:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
