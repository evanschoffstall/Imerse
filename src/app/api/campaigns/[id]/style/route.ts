import { authConfig } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

// GET /api/campaigns/[id]/style - Get campaign style
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

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: id,
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

    // Get or create campaign style
    let style = await prisma.campaignStyle.findUnique({
      where: { campaignId: id },
      include: {
        theme: true,
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Create default style if doesn't exist
    if (!style) {
      style = await prisma.campaignStyle.create({
        data: {
          campaignId: id,
          colors: {},
          fonts: {},
        },
        include: {
          theme: true,
          campaign: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
    }

    return NextResponse.json(style);
  } catch (error) {
    console.error("Campaign style GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign style" },
      { status: 500 }
    );
  }
}

// PATCH /api/campaigns/[id]/style - Update campaign style
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

    // Verify campaign access - only owner can modify style
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: id,
        ownerId: session.user.id,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found or you don't have permission" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      themeId,
      headerImage,
      colors,
      fonts,
      customCSS,
      bgOpacity,
      bgBlur,
      bgExpandToSidebar,
      bgExpandToHeader,
      headerBgOpacity,
      sidebarBgOpacity,
    } = body;

    // Validate background values
    if (bgOpacity !== undefined && (bgOpacity < 0 || bgOpacity > 1)) {
      return NextResponse.json(
        { error: "Background opacity must be between 0 and 1" },
        { status: 400 }
      );
    }

    if (bgBlur !== undefined && (bgBlur < 0 || bgBlur > 50)) {
      return NextResponse.json(
        { error: "Background blur must be between 0 and 50" },
        { status: 400 }
      );
    }

    if (
      headerBgOpacity !== undefined &&
      (headerBgOpacity < 0 || headerBgOpacity > 1)
    ) {
      return NextResponse.json(
        { error: "Header background opacity must be between 0 and 1" },
        { status: 400 }
      );
    }

    if (
      sidebarBgOpacity !== undefined &&
      (sidebarBgOpacity < 0 || sidebarBgOpacity > 1)
    ) {
      return NextResponse.json(
        { error: "Sidebar background opacity must be between 0 and 1" },
        { status: 400 }
      );
    }

    // Verify theme exists if provided
    if (themeId) {
      const theme = await prisma.theme.findUnique({
        where: { id: themeId },
      });

      if (!theme) {
        return NextResponse.json({ error: "Theme not found" }, { status: 404 });
      }
    }

    // Upsert campaign style
    const style = await prisma.campaignStyle.upsert({
      where: { campaignId: id },
      update: {
        ...(themeId !== undefined && { themeId }),
        ...(headerImage !== undefined && { headerImage }),
        ...(colors !== undefined && { colors }),
        ...(fonts !== undefined && { fonts }),
        ...(customCSS !== undefined && { customCSS }),
        ...(bgOpacity !== undefined && { bgOpacity }),
        ...(bgBlur !== undefined && { bgBlur }),
        ...(bgExpandToSidebar !== undefined && { bgExpandToSidebar }),
        ...(bgExpandToHeader !== undefined && { bgExpandToHeader }),
        ...(headerBgOpacity !== undefined && { headerBgOpacity }),
        ...(sidebarBgOpacity !== undefined && { sidebarBgOpacity }),
      },
      create: {
        campaignId: id,
        themeId,
        headerImage,
        colors: colors || {},
        fonts: fonts || {},
        customCSS,
        bgOpacity: bgOpacity ?? 0.8,
        bgBlur: bgBlur ?? 4,
        bgExpandToSidebar: bgExpandToSidebar ?? false,
        bgExpandToHeader: bgExpandToHeader ?? false,
        headerBgOpacity: headerBgOpacity ?? 0.95,
        sidebarBgOpacity: sidebarBgOpacity ?? 1.0,
      },
      include: {
        theme: true,
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(style);
  } catch (error) {
    console.error("Campaign style PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update campaign style" },
      { status: 500 }
    );
  }
}
