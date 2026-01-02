import { auth } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/maps/[id]/layers - List all layers for a map
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mapId = params.id;

    // Get map to check campaign access
    const map = await prisma.map.findUnique({
      where: { id: mapId },
      select: { campaignId: true },
    });

    if (!map) {
      return Response.json({ error: "Map not found" }, { status: 404 });
    }

    // Check campaign permission
    const canView = await hasPermission(
      map.campaignId,
      Permission.VIEW_ENTITIES,
      session.user.id
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all layers for this map, ordered by position
    const layers = await prisma.mapLayer.findMany({
      where: { mapId },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { position: "desc" },
    });

    return Response.json(layers);
  } catch (error) {
    console.error("Error fetching map layers:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/maps/[id]/layers - Create a new layer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mapId = params.id;

    // Get map to check campaign access
    const map = await prisma.map.findUnique({
      where: { id: mapId },
      select: { campaignId: true },
    });

    if (!map) {
      return Response.json({ error: "Map not found" }, { status: 404 });
    }

    // Check campaign permission
    const canEdit = await hasPermission(
      map.campaignId,
      Permission.CREATE_ENTITIES,
      session.user.id
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const layer = await prisma.mapLayer.create({
      data: {
        mapId,
        name: body.name,
        image: body.image,
        entry: body.entry,
        position: body.position ?? 0,
        width: body.width,
        height: body.height,
        opacity: body.opacity ?? 1.0,
        isVisible: body.isVisible ?? true,
        isPrivate: body.isPrivate ?? false,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return Response.json(layer, { status: 201 });
  } catch (error) {
    console.error("Error creating map layer:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
