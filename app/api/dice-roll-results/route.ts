import { auth } from "@/auth";
import { rollDice } from "@/lib/dice-roller";
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dice-roll-results - List dice roll results
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const diceRollId = searchParams.get("diceRollId");
    const campaignId = searchParams.get("campaignId");

    if (!diceRollId && !campaignId) {
      return NextResponse.json(
        { error: "Either diceRollId or campaignId required" },
        { status: 400 }
      );
    }

    // Build query
    const where: any = {};

    if (diceRollId) {
      // Verify access to dice roll
      const diceRoll = await prisma.diceRoll.findUnique({
        where: { id: diceRollId },
      });

      if (!diceRoll) {
        return NextResponse.json(
          { error: "Dice roll not found" },
          { status: 404 }
        );
      }

      const canView = await hasPermission(
        diceRoll.campaignId,
        Permission.READ,
        session.user.id
      );

      if (!canView) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      where.diceRollId = diceRollId;
    } else if (campaignId) {
      // Check campaign access
      const canView = await hasPermission(
        campaignId,
        Permission.READ,
        session.user.id
      );

      if (!canView) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      where.diceRoll = {
        campaignId,
      };
    }

    const results = await prisma.diceRollResult.findMany({
      where,
      include: {
        diceRoll: {
          select: {
            id: true,
            name: true,
            parameters: true,
            character: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
      take: 100, // Limit results
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching dice roll results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/dice-roll-results - Execute roll and create result
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { diceRollId, isPrivate } = body;

    if (!diceRollId) {
      return NextResponse.json(
        { error: "Dice roll ID required" },
        { status: 400 }
      );
    }

    // Get dice roll with character attributes
    const diceRoll = await prisma.diceRoll.findUnique({
      where: { id: diceRollId },
      include: {
        character: {
          include: {
            // Note: Would need attributes relation if implemented
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

    // Check permission
    const canView = await hasPermission(
      diceRoll.campaignId,
      Permission.READ,
      session.user.id
    );

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get character attributes if character is linked
    let characterAttributes: Record<string, string | number> = {};
    if (diceRoll.characterId) {
      // Fetch attributes for the character
      const attributes = await prisma.attribute.findMany({
        where: {
          entityId: diceRoll.characterId,
          entityType: "character",
        },
      });

      // Convert to key-value pairs
      attributes.forEach((attr) => {
        characterAttributes[attr.key.toLowerCase()] = attr.value || "";
      });
    }

    // Execute the roll
    const rollDetails = rollDice(diceRoll.parameters, characterAttributes);

    // Save result
    const result = await prisma.diceRollResult.create({
      data: {
        diceRollId,
        results: JSON.stringify(rollDetails),
        isPrivate: isPrivate || false,
        createdById: session.user.id,
      },
      include: {
        diceRoll: {
          select: {
            id: true,
            name: true,
            parameters: true,
            character: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating dice roll result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
