import { auth } from "@/auth";
import { canViewCampaign } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/bookmarks - List bookmarks
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const folder = searchParams.get("folder");
    const type = searchParams.get("type");

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
      userId: session.user.id, // Only show user's own bookmarks
    };

    if (folder !== null) {
      where.folder = folder;
    }

    if (type) {
      where.type = type;
    }

    const bookmarks = await prisma.bookmark.findMany({
      where,
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
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Bookmark GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - Create bookmark
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      icon,
      color,
      type,
      config,
      folder,
      position,
      campaignId,
      characterId,
      locationId,
      itemId,
      questId,
      eventId,
      journalId,
      familyId,
      organisationId,
    } = body;

    if (!name || !campaignId || !type) {
      return NextResponse.json(
        { error: "Name, campaign ID, and type required" },
        { status: 400 }
      );
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        name,
        icon: icon || null,
        color: color || null,
        type,
        config: config || {},
        folder: folder || null,
        position: position ?? 0,
        campaignId,
        userId: session.user.id,
        characterId: characterId || null,
        locationId: locationId || null,
        itemId: itemId || null,
        questId: questId || null,
        eventId: eventId || null,
        journalId: journalId || null,
        familyId: familyId || null,
        organisationId: organisationId || null,
      },
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

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Bookmark POST error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}
