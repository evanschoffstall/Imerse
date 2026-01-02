import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/whiteboards/[id] - Get whiteboard by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      );
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: whiteboard.campaignId,
        OR: [
          { ownerId: session.user.id },
          {
            campaignRoles: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(whiteboard);
  } catch (error) {
    console.error("Whiteboard GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch whiteboard" },
      { status: 500 }
    );
  }
}

// PATCH /api/whiteboards/[id] - Update whiteboard
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
    });

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      );
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: whiteboard.campaignId,
        OR: [
          { ownerId: session.user.id },
          {
            campaignRoles: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, content, thumbnail, template, isPrivate } = body;

    // Update slug if name changes
    let slug = whiteboard.slug;
    if (name && name !== whiteboard.name) {
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      slug = baseSlug;
      let counter = 1;

      // Ensure unique slug within campaign
      while (
        await prisma.whiteboard.findFirst({
          where: {
            campaignId: whiteboard.campaignId,
            slug,
            NOT: { id: params.id },
          },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Update whiteboard
    const updatedWhiteboard = await prisma.whiteboard.update({
      where: { id: params.id },
      data: {
        ...(name && { name, slug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(template !== undefined && { template }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    return NextResponse.json(updatedWhiteboard);
  } catch (error) {
    console.error("Whiteboard PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update whiteboard" },
      { status: 500 }
    );
  }
}

// DELETE /api/whiteboards/[id] - Delete whiteboard
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
    });

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      );
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: whiteboard.campaignId,
        OR: [
          { ownerId: session.user.id },
          {
            campaignRoles: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.whiteboard.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Whiteboard DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete whiteboard" },
      { status: 500 }
    );
  }
}
