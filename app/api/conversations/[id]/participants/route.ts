import { auth } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/conversations/[id]/participants - Get conversation participants
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

    const participants = await prisma.conversationParticipant.findMany({
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
      },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/participants - Add participant
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

    // Check edit permission
    const canEdit = await hasPermission(conversation.campaignId, Permission.EDIT, session.user.id);

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { participantId } = body;

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    // Determine if participantId is user or character based on conversation target
    let userId: string | null = null;
    let characterId: string | null = null;

    if (conversation.target === "users") {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: participantId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      userId = participantId;
    } else if (conversation.target === "characters") {
      // Verify character exists and belongs to campaign
      const character = await prisma.character.findUnique({
        where: { id: participantId },
      });

      if (!character || character.campaignId !== conversation.campaignId) {
        return NextResponse.json(
          { error: "Character not found or not in campaign" },
          { status: 404 }
        );
      }

      characterId = participantId;
    } else {
      return NextResponse.json(
        { error: "Invalid conversation target" },
        { status: 400 }
      );
    }

    // Check if participant already exists
    const existingParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        ...(userId && { userId }),
        ...(characterId && { characterId }),
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Participant already exists" },
        { status: 400 }
      );
    }

    const participant = await prisma.conversationParticipant.create({
      data: {
        conversationId: id,
        userId,
        characterId,
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
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id]/participants/[participantId] - Remove participant
export async function DELETE(
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

    // Check edit permission
    const canEdit = await hasPermission(conversation.campaignId, Permission.EDIT, session.user.id);

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId");

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    const participant = await prisma.conversationParticipant.findUnique({
      where: { id: participantId },
    });

    if (!participant || participant.conversationId !== id) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    await prisma.conversationParticipant.delete({
      where: { id: participantId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
