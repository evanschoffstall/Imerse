import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const attributeUpdateSchema = z.object({
  key: z.string().min(1, "Key is required").optional(),
  value: z.string().optional(),
  type: z.enum(["text", "number", "boolean", "date", "url"]).optional(),
  category: z.string().optional(),
  order: z.number().int().optional(),
  isPrivate: z.boolean().optional(),
});

// GET /api/attributes/[id] - Get a single attribute
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attribute = await prisma.attribute.findUnique({
    where: { id: params.id },
    include: {
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!attribute) {
    return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
  }

  // Verify user has access to this campaign
  const hasAccess = await prisma.campaign.findFirst({
    where: {
      id: attribute.campaignId,
      ownerId: session.user.id,
    },
  });

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ attribute });
}

// PATCH /api/attributes/[id] - Update an attribute
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const attribute = await prisma.attribute.findUnique({
      where: { id: params.id },
      include: {
        campaign: { select: { ownerId: true } },
      },
    });

    if (!attribute) {
      return NextResponse.json(
        { error: "Attribute not found" },
        { status: 404 }
      );
    }

    // Check if user is campaign owner or attribute creator
    if (
      attribute.campaign.ownerId !== session.user.id &&
      attribute.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = attributeUpdateSchema.parse(body);

    // If key is being updated, check for conflicts
    if (data.key && data.key !== attribute.key) {
      const existing = await prisma.attribute.findUnique({
        where: {
          entityType_entityId_key: {
            entityType: attribute.entityType,
            entityId: attribute.entityId,
            key: data.key,
          },
        },
      });

      if (existing && existing.id !== attribute.id) {
        return NextResponse.json(
          {
            error: "An attribute with this key already exists for this entity",
          },
          { status: 409 }
        );
      }
    }

    const updatedAttribute = await prisma.attribute.update({
      where: { id: params.id },
      data,
      include: {
        campaign: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ attribute: updatedAttribute });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating attribute:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/attributes/[id] - Delete an attribute
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attribute = await prisma.attribute.findUnique({
    where: { id: params.id },
    include: {
      campaign: { select: { ownerId: true } },
    },
  });

  if (!attribute) {
    return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
  }

  // Check if user is campaign owner or attribute creator
  if (
    attribute.campaign.ownerId !== session.user.id &&
    attribute.createdById !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.attribute.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Attribute deleted successfully" });
}
