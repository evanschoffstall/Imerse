import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { canViewCampaign } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/gallery - List images and folders
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");
    const isFolder = searchParams.get("isFolder");

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

    // Filter by folder
    if (folderId) {
      where.folderId = folderId;
    } else if (folderId === null) {
      where.folderId = null; // Root level
    }

    // Filter by name
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Filter folders only
    if (isFolder === "true") {
      where.isFolder = true;
    }

    const images = await prisma.image.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        folder: true,
        _count: {
          select: {
            images: true,
            entityAssets: true,
            imageMentions: true,
          },
        },
      },
      orderBy: [
        { isFolder: "desc" }, // Folders first
        { updatedAt: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Gallery GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST /api/gallery - Create folder or upload image
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      campaignId,
      folderId,
      isFolder,
      ext,
      size,
      width,
      height,
      focusX,
      focusY,
      visibility,
    } = body;

    if (!name || !campaignId) {
      return NextResponse.json(
        { error: "Name and campaign ID required" },
        { status: 400 }
      );
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // For folders, just create folder entry
    if (isFolder) {
      const folder = await prisma.image.create({
        data: {
          name,
          campaignId,
          folderId: folderId || null,
          isFolder: true,
          ext: "",
          size: 0,
          visibility: visibility ?? 0,
          createdBy: session.user.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json(folder, { status: 201 });
    }

    // For images, create image entry (actual file upload handled by /api/upload)
    if (!ext || !size) {
      return NextResponse.json(
        { error: "Extension and size required for images" },
        { status: 400 }
      );
    }

    const image = await prisma.image.create({
      data: {
        name,
        campaignId,
        folderId: folderId || null,
        isFolder: false,
        ext,
        size,
        width: width || null,
        height: height || null,
        focusX: focusX || null,
        focusY: focusY || null,
        visibility: visibility ?? 0,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Gallery POST error:", error);
    return NextResponse.json(
      { error: "Failed to create image/folder" },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery?ids=id1,id2,id3 - Bulk delete
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const idsParam = searchParams.get("ids");
    const campaignId = searchParams.get("campaignId");

    if (!idsParam || !campaignId) {
      return NextResponse.json(
        { error: "IDs and campaign ID required" },
        { status: 400 }
      );
    }

    const ids = idsParam.split(",");

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete images/folders
    await prisma.image.deleteMany({
      where: {
        id: { in: ids },
        campaignId,
      },
    });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error("Gallery DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete images" },
      { status: 500 }
    );
  }
}
