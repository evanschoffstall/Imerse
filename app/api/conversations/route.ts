import { authOptions } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/conversations - List conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const search = searchParams.get("search");
    const isClosed = searchParams.get("isClosed");

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

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (isClosed !== null && isClosed !== undefined) {
      where.isClosed = isClosed === "true";
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            messages: true,
            participants: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, name, target, isPrivate, participantIds } = body;

    if (!campaignId || !name) {
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

    // Create conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        name,
        target: target || "characters",
        isPrivate: isPrivate || false,
        isClosed: false,
        campaignId,
        createdById: session.user.id,
        participants:
          participantIds && participantIds.length > 0
            ? {
                create: participantIds.map((id: string) => ({
                  ...(target === "users"
                    ? { userId: id }
                    : { characterId: id }),
                })),
              }
            : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
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
          },
        },
        _count: {
          select: {
            messages: true,
            participants: true,
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
