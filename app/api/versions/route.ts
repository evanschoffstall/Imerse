import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { EntityType } from "@/types/version";
import { createVersionSchema } from "@/types/version";
import { NextRequest, NextResponse } from "next/server";

// Helper function to get entity name
async function getEntityName(
  entityType: EntityType,
  entityId: string
): Promise<string | null> {
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

  try {
    const entity = await model.findUnique({
      where: { id: entityId },
      select: { name: true },
    });
    return entity?.name || null;
  } catch {
    return null;
  }
}

// GET /api/versions - List versions for an entity
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType") as EntityType | null;
  const entityId = searchParams.get("entityId");
  const campaignId = searchParams.get("campaignId");

  if (!entityType || !entityId) {
    return NextResponse.json(
      { error: "entityType and entityId are required" },
      { status: 400 }
    );
  }

  try {
    const where: any = {
      entityType,
      entityId,
    };

    if (campaignId) {
      // Verify user has access to campaign
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            { ownerId: session.user.id },
            { campaignRoles: { some: { userId: session.user.id } } },
          ],
        },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      where.campaignId = campaignId;
    } else {
      // User must have access through campaign ownership or role
      where.campaign = {
        OR: [
          { ownerId: session.user.id },
          { campaignRoles: { some: { userId: session.user.id } } },
        ],
      };
    }

    const versions = await prisma.version.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { versionNumber: "desc" },
      take: 50,
    });

    const entityName = await getEntityName(entityType, entityId);

    return NextResponse.json({
      versions,
      total: versions.length,
      entityName,
    });
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

// POST /api/versions - Create a new version
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createVersionSchema.parse(body);

    // Verify user has permission to manage campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: validatedData.campaignId,
        OR: [
          { ownerId: session.user.id },
          {
            campaignRoles: { some: { userId: session.user.id, isAdmin: true } },
          },
        ],
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "You do not have permission to manage this campaign" },
        { status: 403 }
      );
    }

    // Get the current version number
    const lastVersion = await prisma.version.findFirst({
      where: {
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
      },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    const versionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Create the version
    const version = await prisma.version.create({
      data: {
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
        versionNumber,
        snapshot: validatedData.snapshot as any,
        changeType: validatedData.changeType || "update",
        changesMade: validatedData.changesMade || null,
        changedFields: (validatedData.changedFields as any) || null,
        campaignId: validatedData.campaignId,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ version });
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    );
  }
}
