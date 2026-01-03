import { auth } from "@/auth";
import { canViewCampaign } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/attribute-templates - List attribute templates
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const entityType = searchParams.get("entityType");
    const search = searchParams.get("search");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID required" },
        { status: 400 }
      );
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build where clause
    const where: any = {
      campaignId,
    };

    if (entityType) {
      where.OR = [
        { entityType },
        { entityType: null }, // Templates that apply to all entities
      ];
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const templates = await prisma.attributeTemplate.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("AttributeTemplate GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/attribute-templates - Create attribute template
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      config,
      entityType,
      isPublic,
      position,
      campaignId,
    } = body;

    if (!name || !campaignId || !config) {
      return NextResponse.json(
        { error: "Name, campaign ID, and config required" },
        { status: 400 }
      );
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Generate slug if not provided
    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    // Check for duplicate slug
    const existing = await prisma.attributeTemplate.findUnique({
      where: {
        campaignId_slug: {
          campaignId,
          slug: finalSlug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Template with this name already exists" },
        { status: 409 }
      );
    }

    const template = await prisma.attributeTemplate.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        config,
        entityType: entityType || null,
        isPublic: isPublic ?? false,
        position: position ?? 0,
        campaignId,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("AttributeTemplate POST error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
