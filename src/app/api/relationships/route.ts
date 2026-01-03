import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
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

// GET /api/relationships - List relationships with optional filters
export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const entityType = searchParams.get("entityType") as EntityType | null;
  const entityId = searchParams.get("entityId");
  const relationshipType = searchParams.get("relationshipType");
  const includePrivate = searchParams.get("includePrivate") === "true";

  try {
    const where: any = {};

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

    // Filter by entity (source or target)
    if (entityType && entityId) {
      where.OR = [
        { sourceEntityType: entityType, sourceEntityId: entityId },
        { targetEntityType: entityType, targetEntityId: entityId },
      ];
    }

    // Filter by relationship type
    if (relationshipType) {
      where.relationshipType = relationshipType;
    }

    // Privacy filter
    if (!includePrivate) {
      where.isPrivate = false;
    }

    const relationships = await prisma.relationship.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Fetch entity details for all relationships
    const relationshipsWithEntities = await Promise.all(
      relationships.map(async (rel: any) => {
        const [sourceEntity, targetEntity] = await Promise.all([
          fetchEntity(rel.sourceEntityType as EntityType, rel.sourceEntityId),
          fetchEntity(rel.targetEntityType as EntityType, rel.targetEntityId),
        ]);

        return {
          ...rel,
          sourceEntity: sourceEntity
            ? { ...sourceEntity, type: rel.sourceEntityType }
            : null,
          targetEntity: targetEntity
            ? { ...targetEntity, type: rel.targetEntityType }
            : null,
        };
      })
    );

    return NextResponse.json({
      relationships: relationshipsWithEntities,
      total: relationshipsWithEntities.length,
    });
  } catch (error) {
    console.error("Error fetching relationships:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationships" },
      { status: 500 }
    );
  }
}

// POST /api/relationships - Create a new relationship
export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = relationshipFormSchema.parse(body);

    // Extract campaign ID from source entity
    const sourceEntity = await fetchEntity(
      validatedData.sourceEntityType as EntityType,
      validatedData.sourceEntityId
    );

    if (!sourceEntity) {
      return NextResponse.json(
        { error: "Source entity not found" },
        { status: 404 }
      );
    }

    // Get campaign ID from source entity
    const modelName = validatedData.sourceEntityType as keyof typeof prisma;
    const model = prisma[modelName] as any;

    const sourceModel = await model.findUnique({
      where: { id: validatedData.sourceEntityId },
      select: { campaignId: true },
    });

    const campaignId = sourceModel?.campaignId;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Source entity must belong to a campaign" },
        { status: 400 }
      );
    }

    // Verify user has permission to manage campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
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

    // Verify target entity exists
    const targetEntity = await fetchEntity(
      validatedData.targetEntityType as EntityType,
      validatedData.targetEntityId
    );

    if (!targetEntity) {
      return NextResponse.json(
        { error: "Target entity not found" },
        { status: 404 }
      );
    }

    // Create relationship
    const relationship = await prisma.relationship.create({
      data: {
        sourceEntityType: validatedData.sourceEntityType,
        sourceEntityId: validatedData.sourceEntityId,
        targetEntityType: validatedData.targetEntityType,
        targetEntityId: validatedData.targetEntityId,
        relationshipType: validatedData.relationshipType,
        description: validatedData.description || null,
        metadata: (validatedData.metadata as any) || null,
        bidirectional: validatedData.bidirectional || false,
        isPrivate: validatedData.isPrivate || false,
        campaignId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({
      relationship: {
        ...relationship,
        sourceEntity: { ...sourceEntity, type: relationship.sourceEntityType },
        targetEntity: { ...targetEntity, type: relationship.targetEntityType },
      },
    });
  } catch (error) {
    console.error("Error creating relationship:", error);
    return NextResponse.json(
      { error: "Failed to create relationship" },
      { status: 500 }
    );
  }
}
