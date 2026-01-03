import { auth } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/conversations/[id]/messages - Get conversation messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check view permission
    const canView = await hasPermission(conversation.campaignId, Permission.READ, session.user.id);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    const messages = await prisma.conversationMessage.findMany({
      where: {
        conversationId: id,
      },
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages - Create message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if conversation is closed
    if (conversation.isClosed) {
      return NextResponse.json(
        { error: "Conversation is closed" },
        { status: 400 }
      );
    }

    // Check create permission
    const canCreate = await hasPermission(conversation.campaignId, Permission.CREATE, session.user.id);

    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { message, authorType, authorId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!authorType || !["user", "character"].includes(authorType)) {
      return NextResponse.json(
        { error: "Invalid author type" },
        { status: 400 }
      );
    }

    // Determine author fields based on authorType
    let userId: string | null = null;
    let characterId: string | null = null;

    if (authorType === "user") {
      userId = session.user.id;
    } else if (authorType === "character") {
      if (!authorId) {
        return NextResponse.json(
          { error: "Character ID required for character messages" },
          { status: 400 }
        );
      }

      // Verify character exists and belongs to user's campaign
      const character = await prisma.character.findUnique({
        where: { id: authorId },
      });

      if (!character || character.campaignId !== conversation.campaignId) {
        return NextResponse.json(
          { error: "Invalid character" },
          { status: 400 }
        );
      }

      characterId = authorId;
    }

    const newMessage = await prisma.conversationMessage.create({
      data: {
        message,
        conversationId: id,
        userId,
        characterId,
        createdById: session.user.id,
      },
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
