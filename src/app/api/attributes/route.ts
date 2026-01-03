import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const attributeSchema = z.object({
  entityType: z.string().min(1, "Entity type is required"),
  entityId: z.string().min(1, "Entity ID is required"),
  key: z.string().min(1, "Key is required"),
  value: z.string(),
  type: z.enum(["text", "number", "boolean", "date", "url"]).default("text"),
  category: z.string().optional(),
  order: z.number().int().default(0),
  isPrivate: z.boolean().default(false),
  campaignId: z.string().min(1, "Campaign ID is required"),
  createdById: z.string().min(1, "Created by ID is required"),
});

// GET /api/attributes - Get attributes for an entity
export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");
  const campaignId = searchParams.get("campaignId");

  if (!entityType || !entityId || !campaignId) {
    return NextResponse.json(
      {
        error: "Entity type, entity ID, and campaign ID are required",
      },
      { status: 400 }
    );
  }

  // Verify user has access to this campaign
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId: session.user.id,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const attributes = await prisma.attribute.findMany({
    where: {
      entityType,
      entityId,
      campaignId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: [{ category: "asc" }, { order: "asc" }, { key: "asc" }],
  });

  return NextResponse.json({ attributes });
}

// POST /api/attributes - Create a new attribute
export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = attributeSchema.parse(body);

    // Verify user has access to this campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: data.campaignId,
        ownerId: session.user.id,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if attribute with same key already exists
    const existing = await prisma.attribute.findUnique({
      where: {
        entityType_entityId_key: {
          entityType: data.entityType,
          entityId: data.entityId,
          key: data.key,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "An attribute with this key already exists for this entity",
        },
        { status: 409 }
      );
    }

    const attribute = await prisma.attribute.create({
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ attribute }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating attribute:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
