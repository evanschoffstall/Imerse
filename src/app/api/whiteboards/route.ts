import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/whiteboards - List whiteboards
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const search = searchParams.get("search");
    const isPrivate = searchParams.get("isPrivate");
    const template = searchParams.get("template");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
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
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Build where clause
    const where: any = {
      campaignId,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (isPrivate === "true") {
      where.isPrivate = true;
    } else if (isPrivate === "false") {
      where.isPrivate = false;
    }

    if (template) {
      where.template = template;
    }

    const whiteboards = await prisma.whiteboard.findMany({
      where,
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
      orderBy: [{ updatedAt: "desc" }],
    });

    return NextResponse.json(whiteboards);
  } catch (error) {
    console.error("Whiteboard GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch whiteboards" },
      { status: 500 }
    );
  }
}

// POST /api/whiteboards - Create whiteboard
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, template, isPrivate, campaignId } = body;

    // Validation
    if (!name || !campaignId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
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
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Generate slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug within campaign
    while (
      await prisma.whiteboard.findFirst({
        where: { campaignId, slug },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Initialize content with template or empty
    const initialContent = {
      version: "1.0",
      elements: [],
    };

    // Create whiteboard
    const whiteboard = await prisma.whiteboard.create({
      data: {
        name,
        slug,
        description,
        content: initialContent,
        template,
        isPrivate: isPrivate || false,
        campaignId,
        createdById: session.user.id,
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

    return NextResponse.json(whiteboard, { status: 201 });
  } catch (error) {
    console.error("Whiteboard POST error:", error);
    return NextResponse.json(
      { error: "Failed to create whiteboard" },
      { status: 500 }
    );
  }
}
