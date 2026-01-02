import { auth } from "@/auth";
import { canViewCampaign } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/gallery/[id] - Get single image/folder
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const image = await prisma.image.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        folder: true,
        images: true, // Sub-images if folder
        entityAssets: {
          include: {
            character: {
              select: { id: true, name: true },
            },
            location: {
              select: { id: true, name: true },
            },
          },
        },
        imageMentions: {
          include: {
            character: {
              select: { id: true, name: true },
            },
            location: {
              select: { id: true, name: true },
            },
            post: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, image.campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Gallery GET [id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}

// PATCH /api/gallery/[id] - Update image/folder
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, folderId, focusX, focusY, visibility } = body;

    // Get existing image
    const existing = await prisma.image.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, existing.campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (folderId !== undefined) updateData.folderId = folderId;
    if (focusX !== undefined) updateData.focusX = focusX;
    if (focusY !== undefined) updateData.focusY = focusY;
    if (visibility !== undefined) updateData.visibility = visibility;

    const updated = await prisma.image.update({
      where: { id: params.id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        folder: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gallery PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery/[id] - Delete single image/folder
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing image
    const existing = await prisma.image.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, existing.campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete image/folder (cascade will handle sub-items)
    await prisma.image.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
