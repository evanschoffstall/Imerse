import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/presets - List presets
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const typeId = searchParams.get("typeId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const isPublic = searchParams.get("isPublic");
    const isOfficial = searchParams.get("isOfficial");
    const campaignId = searchParams.get("campaignId");

    // Build where clause
    const where: any = {};

    if (typeId) {
      where.typeId = typeId;
    }

    if (category) {
      where.category = category;
    }

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

    // Filter visibility
    where.OR = [
      { isPublic: true },
      { isOfficial: true },
      { createdById: session.user.id },
    ];

    if (campaignId) {
      where.OR.push({ campaignId });
    }

    if (isPublic === "true") {
      where.isPublic = true;
    }

    if (isOfficial === "true") {
      where.isOfficial = true;
    }

    const presets = await prisma.preset.findMany({
      where,
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
      orderBy: [{ isOfficial: "desc" }, { isPublic: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Preset GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}

// POST /api/presets - Create preset
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
      category,
      tags,
      typeId,
      campaignId,
      isPublic,
    } = body;

    if (!name || !typeId || !config) {
      return NextResponse.json(
        { error: "Name, type ID, and config required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    // Check for duplicate slug
    const existing = await prisma.preset.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Preset with this name already exists" },
        { status: 409 }
      );
    }

    const preset = await prisma.preset.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        config,
        category: category || null,
        tags: tags || [],
        typeId,
        campaignId: campaignId || null,
        isPublic: isPublic ?? false,
        isOfficial: false, // Only admins can create official presets
        createdById: session.user.id,
      },
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

    return NextResponse.json(preset, { status: 201 });
  } catch (error) {
    console.error("Preset POST error:", error);
    return NextResponse.json(
      { error: "Failed to create preset" },
      { status: 500 }
    );
  }
}
