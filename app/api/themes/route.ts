import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/themes - List themes
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const isOfficial = searchParams.get("isOfficial");
    const isPublic = searchParams.get("isPublic");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      OR: [
        { isPublic: true },
        { isOfficial: true },
        { createdById: session.user.id },
      ],
    };

    if (isOfficial === "true") {
      where.isOfficial = true;
    }

    if (isPublic === "true") {
      where.isPublic = true;
    }

    if (search) {
      where.AND = [
        {
          OR: [
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
          ],
        },
      ];
    }

    const themes = await prisma.theme.findMany({
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
      orderBy: [{ isOfficial: "desc" }, { isPublic: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(themes);
  } catch (error) {
    console.error("Theme GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

// POST /api/themes - Create theme
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, colors, fonts, layout, customCSS, isPublic } =
      body;

    // Validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (
      await prisma.theme.findFirst({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create theme
    const theme = await prisma.theme.create({
      data: {
        name,
        slug,
        description,
        colors: colors || {},
        fonts: fonts || {},
        layout: layout || {},
        customCSS,
        isPublic: isPublic || false,
        isOfficial: false, // Only admins can create official themes
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

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error("Theme POST error:", error);
    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 }
    );
  }
}
