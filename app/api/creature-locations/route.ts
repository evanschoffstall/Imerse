import { auth } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/creature-locations - List creature-location links
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const creatureId = searchParams.get("creatureId");
    const locationId = searchParams.get("locationId");

    if (!creatureId && !locationId) {
      return Response.json(
        { error: "Creature ID or Location ID required" },
        { status: 400 }
      );
    }

    // Build query
    const where: any = {};
    if (creatureId) where.creatureId = creatureId;
    if (locationId) where.locationId = locationId;

    // Get campaign ID for permission check
    let campaignId: string | null = null;
    if (creatureId) {
      const creature = await prisma.creature.findUnique({
        where: { id: creatureId },
        select: { campaignId: true },
      });
      campaignId = creature?.campaignId || null;
    } else if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: locationId },
        select: { campaignId: true },
      });
      campaignId = location?.campaignId || null;
    }

    if (!campaignId) {
      return Response.json({ error: "Entity not found" }, { status: 404 });
    }

    // Check permissions
    const canView = await hasPermission(
      campaignId,
      Permission.VIEW_ENTITIES,
      session.user.id
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const links = await prisma.creatureLocation.findMany({
      where,
      include: {
        creature: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ creature: { name: "asc" } }],
    });

    return Response.json(links);
  } catch (error) {
    console.error("Error fetching creature-locations:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/creature-locations - Create creature-location link
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { creatureId, locationId } = data;

    if (!creatureId || !locationId) {
      return Response.json(
        { error: "Creature ID and Location ID required" },
        { status: 400 }
      );
    }

    // Verify creature exists and get campaign ID
    const creature = await prisma.creature.findUnique({
      where: { id: creatureId },
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

    // Check if link already exists
    const existing = await prisma.creatureLocation.findFirst({
      where: {
        creatureId,
        locationId,
      },
    });

    if (existing) {
      return Response.json({ error: "Link already exists" }, { status: 409 });
    }

    const link = await prisma.creatureLocation.create({
      data: {
        creatureId,
        locationId,
      },
      include: {
        creature: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return Response.json(link, { status: 201 });
  } catch (error) {
    console.error("Error creating creature-location:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
