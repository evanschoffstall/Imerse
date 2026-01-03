import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  relation: z.string().min(1).optional(),
  attitude: z.number().min(-3).max(3).optional(),
  colour: z.string().optional(),
  isPinned: z.boolean().optional(),
  visibility: z.enum(["all", "admin", "self"]).optional(),
});

// GET /api/relations/[id] - Get a single relation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const relation = await prisma.relation.findUnique({
      where: { id: id },
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
    });

    if (!relation) {
      return NextResponse.json(
        { error: "Relation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(relation);
  } catch (error) {
    console.error("Error fetching relation:", error);
    return NextResponse.json(
      { error: "Failed to fetch relation" },
      { status: 500 }
    );
  }
}

// PATCH /api/relations/[id] - Update a relation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    // Check if relation exists and user has permission
    const existingRelation = await prisma.relation.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingRelation) {
      return NextResponse.json(
        { error: "Relation not found" },
        { status: 404 }
      );
    }

    // Check if user is campaign owner or relation creator
    if (
      existingRelation.campaign.ownerId !== session.user.id &&
      existingRelation.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const relation = await prisma.relation.update({
      where: { id: id },
      data: validatedData,
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
    });

    // Update mirror relation if it exists
    if (existingRelation.mirrorId && validatedData.attitude !== undefined) {
      await prisma.relation.update({
        where: { id: existingRelation.mirrorId },
        data: {
          attitude: validatedData.attitude,
        },
      });
    }

    return NextResponse.json(relation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating relation:", error);
    return NextResponse.json(
      { error: "Failed to update relation" },
      { status: 500 }
    );
  }
}

// DELETE /api/relations/[id] - Delete a relation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if relation exists and user has permission
    const existingRelation = await prisma.relation.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!existingRelation) {
      return NextResponse.json(
        { error: "Relation not found" },
        { status: 404 }
      );
    }

    // Check if user is campaign owner or relation creator
    if (
      existingRelation.campaign.ownerId !== session.user.id &&
      existingRelation.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete mirror relation if it exists
    if (existingRelation.mirrorId) {
      await prisma.relation.delete({
        where: { id: existingRelation.mirrorId },
      });
    }

    // Delete the primary relation
    await prisma.relation.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting relation:", error);
    return NextResponse.json(
      { error: "Failed to delete relation" },
      { status: 500 }
    );
  }
}
