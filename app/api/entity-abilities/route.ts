import { auth } from "@/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/entity-abilities - List entity abilities
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entityId");
    const entityType = searchParams.get("entityType");
    const abilityId = searchParams.get("abilityId");

    if (!entityId || !entityType) {
      return Response.json(
        { error: "Entity ID and type required" },
        { status: 400 }
      );
    }

    // Get the entity's campaign to check permissions
    let campaignId: string | null = null;

    // Determine campaignId based on entity type
    switch (entityType) {
      case "character":
        const character = await prisma.character.findUnique({
          where: { id: entityId },
          select: { campaignId: true },
        });
        campaignId = character?.campaignId || null;
        break;
      case "item":
        const item = await prisma.item.findUnique({
          where: { id: entityId },
          select: { campaignId: true },
        });
        campaignId = item?.campaignId || null;
        break;
      case "race":
        const race = await prisma.race.findUnique({
          where: { id: entityId },
          select: { campaignId: true },
        });
        campaignId = race?.campaignId || null;
        break;
      default:
        return Response.json({ error: "Invalid entity type" }, { status: 400 });
    }

    if (!campaignId) {
      return Response.json({ error: "Entity not found" }, { status: 404 });
    }

    // Check permissions
    const canView = await hasPermission(
      campaignId,
      session.user.id,
      "VIEW_ENTITIES"
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build query
    const where: any = {
      entityId,
      entityType,
    };

    if (abilityId) {
      where.abilityId = abilityId;
    }

    const entityAbilities = await prisma.entityAbility.findMany({
      where,
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
      orderBy: [{ position: "asc" }, { ability: { name: "asc" } }],
    });

    return Response.json(entityAbilities);
  } catch (error) {
    console.error("Error fetching entity abilities:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/entity-abilities - Create entity ability link
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      entityId,
      entityType,
      abilityId,
      charges,
      position,
      note,
      isPrivate,
    } = data;

    if (!entityId || !entityType || !abilityId) {
      return Response.json(
        { error: "Entity ID, type, and ability ID required" },
        { status: 400 }
      );
    }

    // Get the entity's campaign to check permissions
    let campaignId: string | null = null;

    switch (entityType) {
      case "character":
        const character = await prisma.character.findUnique({
          where: { id: entityId },
          select: { campaignId: true },
        });
        campaignId = character?.campaignId || null;
        break;
      case "item":
        const item = await prisma.item.findUnique({
          where: { id: entityId },
          select: { campaignId: true },
        });
        campaignId = item?.campaignId || null;
        break;
      case "race":
        const race = await prisma.race.findUnique({
          where: { id: entityId },
          select: { campaignId: true },
        });
        campaignId = race?.campaignId || null;
        break;
      default:
        return Response.json({ error: "Invalid entity type" }, { status: 400 });
    }

    if (!campaignId) {
      return Response.json({ error: "Entity not found" }, { status: 404 });
    }

    // Check permissions
    const canCreate = await hasPermission(
      campaignId,
      session.user.id,
      "EDIT_ENTITIES"
    );
    if (!canCreate) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const entityAbility = await prisma.entityAbility.create({
      data: {
        entityId,
        entityType,
        abilityId,
        charges: charges || null,
        position: position || 0,
        note: note || null,
        isPrivate: isPrivate || false,
        createdById: session.user.id,
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

    return Response.json(entityAbility, { status: 201 });
  } catch (error) {
    console.error("Error creating entity ability:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
