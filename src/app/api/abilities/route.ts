import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/abilities - List abilities
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const parentId = searchParams.get("parentId");
    const search = searchParams.get("search");

    if (!campaignId) {
      return Response.json({ error: "Campaign ID required" }, { status: 400 });
    }

    // Check permissions
    const canView = await hasPermission(
      campaignId,
      Permission.VIEW_ENTITIES,
      session.user.id
    );
    if (!canView) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build query
    const where: any = {
      campaignId,
    };

    // Filter by parent (null for top-level abilities)
    if (parentId === "null") {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    // Search filter
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const abilities = await prisma.ability.findMany({
      where,
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
        _count: {
          select: {
            children: true,
            entityAbilities: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    });

    return Response.json(abilities);
  } catch (error) {
    console.error("Error fetching abilities:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/abilities - Create ability
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, entry, charges, type, isPrivate, campaignId, parentId } =
      data;

    if (!name || !campaignId) {
      return Response.json(
        { error: "Name and campaign ID required" },
        { status: 400 }
      );
    }

    // Check permissions
    const canCreate = await hasPermission(
      campaignId,
      Permission.CREATE_ENTITIES,
      session.user.id
    );
    if (!canCreate) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const ability = await prisma.ability.create({
      data: {
        name,
        entry: entry || null,
        charges: charges || null,
        type: type || null,
        isPrivate: isPrivate || false,
        campaignId,
        createdById: session.user.id,
        parentId: parentId || null,
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

    return Response.json(ability, { status: 201 });
  } catch (error) {
    console.error("Error creating ability:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
