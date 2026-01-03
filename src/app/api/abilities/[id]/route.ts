import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/abilities/[id] - Get ability
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ability = await prisma.ability.findUnique({
      where: { id },
      include: {
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
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            type: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            children: true,
            entityAbilities: true,
          },
        },
      },
    });

    if (!ability) {
      return Response.json({ error: "Ability not found" }, { status: 404 });
    }

    // Check permissions
    const canView = await hasPermission(
      ability.campaignId,
      Permission.VIEW_ENTITIES,
      session.user.id
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json(ability);
  } catch (error) {
    console.error("Error fetching ability:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/abilities/[id] - Update ability
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ability = await prisma.ability.findUnique({
      where: { id },
      select: { campaignId: true },
    });

    if (!ability) {
      return Response.json({ error: "Ability not found" }, { status: 404 });
    }

    // Check permissions
    const canEdit = await hasPermission(
      ability.campaignId,
      Permission.EDIT_ENTITIES,
      session.user.id
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const { name, entry, charges, type, isPrivate, parentId } = data;

    const updated = await prisma.ability.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(entry !== undefined && { entry }),
        ...(charges !== undefined && { charges }),
        ...(type !== undefined && { type }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(parentId !== undefined && { parentId }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Error updating ability:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/abilities/[id] - Delete ability
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ability = await prisma.ability.findUnique({
      where: { id },
      select: { campaignId: true },
    });

    if (!ability) {
      return Response.json({ error: "Ability not found" }, { status: 404 });
    }

    // Check permissions
    const canDelete = await hasPermission(
      ability.campaignId,
      Permission.DELETE_ENTITIES,
      session.user.id
    );
    if (!canDelete) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.ability.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting ability:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
