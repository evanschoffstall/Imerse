import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const relationSchema = z.object({
  relation: z.string().min(1, "Relation type is required"),
  attitude: z.number().min(-3).max(3).default(0),
  colour: z.string().optional(),
  isPinned: z.boolean().default(false),
  visibility: z.enum(["all", "admin", "self"]).default("all"),
  ownerId: z.string().min(1, "Owner ID is required"),
  ownerType: z.string().min(1, "Owner type is required"),
  targetId: z.string().min(1, "Target ID is required"),
  targetType: z.string().min(1, "Target type is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  createMirror: z.boolean().default(false),
  mirrorRelation: z.string().optional(),
});

// GET /api/relations - List all relations
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const ownerId = searchParams.get("ownerId");
    const ownerType = searchParams.get("ownerType");
    const targetId = searchParams.get("targetId");
    const targetType = searchParams.get("targetType");

    const where: any = {};

    if (campaignId) {
      where.campaignId = campaignId;
    }

    if (ownerId && ownerType) {
      where.ownerId = ownerId;
      where.ownerType = ownerType;
    }

    if (targetId && targetType) {
      where.targetId = targetId;
      where.targetType = targetType;
    }

    const relations = await prisma.relation.findMany({
      where,
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
        mirror: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(relations);
  } catch (error) {
    console.error("Error fetching relations:", error);
    return NextResponse.json(
      { error: "Failed to fetch relations" },
      { status: 500 }
    );
  }
}

// POST /api/relations - Create a new relation
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = relationSchema.parse(body);

    // Create the primary relation
    const relation = await prisma.relation.create({
      data: {
        relation: validatedData.relation,
        attitude: validatedData.attitude,
        colour: validatedData.colour,
        isPinned: validatedData.isPinned,
        visibility: validatedData.visibility,
        ownerId: validatedData.ownerId,
        ownerType: validatedData.ownerType,
        targetId: validatedData.targetId,
        targetType: validatedData.targetType,
        campaignId: validatedData.campaignId,
        createdById: session.user.id,
      },
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
      },
    });

    // Create mirror relation if requested
    if (validatedData.createMirror) {
      const mirrorRelationType =
        validatedData.mirrorRelation || validatedData.relation;

      const mirrorRelation = await prisma.relation.create({
        data: {
          relation: mirrorRelationType,
          attitude: validatedData.attitude,
          colour: validatedData.colour,
          isPinned: validatedData.isPinned,
          visibility: validatedData.visibility,
          ownerId: validatedData.targetId,
          ownerType: validatedData.targetType,
          targetId: validatedData.ownerId,
          targetType: validatedData.ownerType,
          campaignId: validatedData.campaignId,
          createdById: session.user.id,
          mirrorId: relation.id,
        },
      });

      // Update the primary relation with mirror ID
      await prisma.relation.update({
        where: { id: relation.id },
        data: { mirrorId: mirrorRelation.id },
      });
    }

    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating relation:", error);
    return NextResponse.json(
      { error: "Failed to create relation" },
      { status: 500 }
    );
  }
}
