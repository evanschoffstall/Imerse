import { authOptions } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dice-rolls - List dice rolls
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const characterId = searchParams.get("characterId");
    const search = searchParams.get("search");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID required" },
        { status: 400 }
      );
    }

    // Check view permission
    const canView = await hasPermission(
      session.user.id,
      campaignId,
      Permission.VIEW_ENTITIES
    );

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build query
    const where: any = {
      campaignId,
    };

    if (characterId) {
      where.characterId = characterId;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const diceRolls = await prisma.diceRoll.findMany({
      where,
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
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(diceRolls);
  } catch (error) {
    console.error("Error fetching dice rolls:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/dice-rolls - Create dice roll
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, name, system, parameters, characterId, isPrivate } =
      body;

    if (!campaignId || !name || !parameters) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check create permission
    const canCreate = await hasPermission(
      session.user.id,
      campaignId,
      Permission.CREATE_ENTITIES
    );

    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const diceRoll = await prisma.diceRoll.create({
      data: {
        name,
        system: system || null,
        parameters,
        characterId: characterId || null,
        isPrivate: isPrivate || false,
        campaignId,
        createdById: session.user.id,
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

    return NextResponse.json(diceRoll, { status: 201 });
  } catch (error) {
    console.error("Error creating dice roll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
