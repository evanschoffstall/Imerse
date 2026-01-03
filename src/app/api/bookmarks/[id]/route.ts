import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { canViewCampaign } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/bookmarks/[id] - Get single bookmark
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
      include: {
        campaign: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        character: {
          select: { id: true, name: true },
        },
        location: {
          select: { id: true, name: true },
        },
        item: {
          select: { id: true, name: true },
        },
        quest: {
          select: { id: true, name: true },
        },
        event: {
          select: { id: true, name: true },
        },
        journal: {
          select: { id: true, name: true },
        },
        family: {
          select: { id: true, name: true },
        },
        organisation: {
          select: { id: true, name: true },
        },
      },
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Check access (own bookmark or campaign member)
    if (bookmark.userId !== session.user.id) {
      if (!(await canViewCampaign(session.user.id, bookmark.campaignId))) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("Bookmark GET [id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmark" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookmarks/[id] - Update bookmark
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, icon, color, config, folder, position } = body;

    // Get existing bookmark
    const existing = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Only owner can update
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (config !== undefined) updateData.config = config;
    if (folder !== undefined) updateData.folder = folder;
    if (position !== undefined) updateData.position = position;

    const updated = await prisma.bookmark.update({
      where: { id },
      data: updateData,
      include: {
        character: {
          select: { id: true, name: true },
        },
        location: {
          select: { id: true, name: true },
        },
        item: {
          select: { id: true, name: true },
        },
        quest: {
          select: { id: true, name: true },
        },
        event: {
          select: { id: true, name: true },
        },
        journal: {
          select: { id: true, name: true },
        },
        family: {
          select: { id: true, name: true },
        },
        organisation: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Bookmark PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookmarks/[id] - Delete bookmark
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing bookmark
    const existing = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Only owner can delete
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.bookmark.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bookmark DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
