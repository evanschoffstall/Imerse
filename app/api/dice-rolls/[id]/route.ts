import { authOptions } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dice-rolls/[id] - Get single dice roll
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const diceRoll = await prisma.diceRoll.findUnique({
      where: { id: params.id },
      include: {
        campaign: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
          },
        },
        results: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50, // Limit to last 50 results
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    if (!diceRoll) {
      return NextResponse.json(
        { error: "Dice roll not found" },
        { status: 404 }
      );
    }

    // Check view permission
    const canView = await hasPermission(
      session.user.id,
      diceRoll.campaignId,
      Permission.VIEW_ENTITIES
    );

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(diceRoll);
  } catch (error) {
    console.error("Error fetching dice roll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/dice-rolls/[id] - Update dice roll
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const diceRoll = await prisma.diceRoll.findUnique({
      where: { id: params.id },
    });

    if (!diceRoll) {
      return NextResponse.json(
        { error: "Dice roll not found" },
        { status: 404 }
      );
    }

    // Check edit permission
    const canEdit = await hasPermission(
      session.user.id,
      diceRoll.campaignId,
      Permission.EDIT_ENTITIES
    );

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, system, parameters, characterId, isPrivate } = body;

    const updated = await prisma.diceRoll.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(system !== undefined && { system: system || null }),
        ...(parameters !== undefined && { parameters }),
        ...(characterId !== undefined && { characterId: characterId || null }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating dice roll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/dice-rolls/[id] - Delete dice roll
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const diceRoll = await prisma.diceRoll.findUnique({
      where: { id: params.id },
    });

    if (!diceRoll) {
      return NextResponse.json(
        { error: "Dice roll not found" },
        { status: 404 }
      );
    }

    // Check delete permission
    const canDelete = await hasPermission(
      session.user.id,
      diceRoll.campaignId,
      Permission.DELETE_ENTITIES
    );

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.diceRoll.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting dice roll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
