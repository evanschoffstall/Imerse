import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/presets/[id] - Get single preset
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preset = await prisma.preset.findUnique({
      where: { id: id },
      include: {
        type: true,
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
            email: true,
          },
        },
      },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Check access (public, official, own, or campaign member)
    if (
      !preset.isPublic &&
      !preset.isOfficial &&
      preset.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Preset GET [id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset" },
      { status: 500 }
    );
  }
}

// PATCH /api/presets/[id] - Update preset
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, description, config, category, tags, isPublic } = body;

    // Get existing preset
    const existing = await prisma.preset.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Only owner can update
    if (existing.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (config !== undefined) updateData.config = config;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updated = await prisma.preset.update({
      where: { id: id },
      data: updateData,
      include: {
        type: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Preset PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update preset" },
      { status: 500 }
    );
  }
}

// DELETE /api/presets/[id] - Delete preset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing preset
    const existing = await prisma.preset.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Only owner can delete (and not official presets)
    if (existing.createdById !== session.user.id || existing.isOfficial) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.preset.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Preset DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete preset" },
      { status: 500 }
    );
  }
}
