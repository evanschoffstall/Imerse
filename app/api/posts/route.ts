import { auth } from "@/auth";
import { checkPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/posts - List posts
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const isPinned = searchParams.get("isPinned");
    const entityType = searchParams.get("entityType"); // character, location, etc.
    const entityId = searchParams.get("entityId");

    if (!campaignId) {
      return Response.json({ error: "Campaign ID required" }, { status: 400 });
    }

    // Check campaign access
    const hasAccess = await checkPermission(
      session.user.id,
      campaignId,
      "READ"
    );
    if (!hasAccess) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build where clause
    const where: any = {
      campaignId,
      OR: [{ isPrivate: false }, { createdById: session.user.id }],
    };

    if (isPinned) {
      where.isPinned = isPinned === "true";
    }

    if (entityType && entityId) {
      where[`${entityType}Id`] = entityId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { position: "asc" },
        { createdAt: "desc" },
      ],
    });

    return Response.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/posts - Create post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      campaignId,
      name,
      entry,
      isPrivate,
      isPinned,
      position,
      layoutId,
      settings,
      characterId,
      locationId,
      itemId,
      questId,
      eventId,
      journalId,
      familyId,
      organisationId,
      tagIds,
    } = body;

    if (!campaignId || !name) {
      return Response.json(
        { error: "Campaign ID and name required" },
        { status: 400 }
      );
    }

    // Check campaign access
    const hasAccess = await checkPermission(
      session.user.id,
      campaignId,
      "CREATE"
    );
    if (!hasAccess) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        campaignId,
        createdById: session.user.id,
        name,
        entry: entry || null,
        isPrivate: isPrivate ?? false,
        isPinned: isPinned ?? false,
        position: position ?? 0,
        layoutId: layoutId || null,
        settings: settings || {},
        characterId: characterId || null,
        locationId: locationId || null,
        itemId: itemId || null,
        questId: questId || null,
        eventId: eventId || null,
        journalId: journalId || null,
        familyId: familyId || null,
        organisationId: organisationId || null,
        ...(tagIds && tagIds.length > 0
          ? {
              tags: {
                create: tagIds.map((tagId: string) => ({
                  tagId,
                })),
              },
            }
          : {}),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    return Response.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
