import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { hasPermission } from "@/lib/permissions";
import { Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

type Params = Promise<{
  id: string;
}>;

// GET /api/posts/[id] - Get single post
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: id },
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
            email: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        item: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        quest: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        journal: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
                slug: true,
              },
            },
          },
        },
        permissions: {
          include: {
            role: {
              select: {
                id: true,
                role: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Check campaign access
    const hasAccess = await hasPermission(
      post.campaignId,
      Permission.READ,
      session.user.id
    );
    if (!hasAccess) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check post privacy
    if (post.isPrivate && post.createdById !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/posts/[id] - Update post
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Check permissions
    const hasAccess = await hasPermission(
      post.campaignId,
      Permission.EDIT,
      session.user.id
    );
    const isOwner = post.createdById === session.user.id;
    if (!hasAccess && !isOwner) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
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

    // Update tags if provided
    let tagsUpdate = {};
    if (tagIds !== undefined) {
      // Delete existing tags and create new ones
      tagsUpdate = {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({
            tagId,
          })),
        },
      };
    }

    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: {
        ...(name !== undefined && { name }),
        ...(entry !== undefined && { entry }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(isPinned !== undefined && { isPinned }),
        ...(position !== undefined && { position }),
        ...(layoutId !== undefined && { layoutId }),
        ...(settings !== undefined && { settings }),
        ...(characterId !== undefined && { characterId }),
        ...(locationId !== undefined && { locationId }),
        ...(itemId !== undefined && { itemId }),
        ...(questId !== undefined && { questId }),
        ...(eventId !== undefined && { eventId }),
        ...(journalId !== undefined && { journalId }),
        ...(familyId !== undefined && { familyId }),
        ...(organisationId !== undefined && { organisationId }),
        ...tagsUpdate,
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

    return Response.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Check permissions
    const hasAccess = await hasPermission(
      post.campaignId,
      Permission.DELETE,
      session.user.id
    );
    const isOwner = post.createdById === session.user.id;
    if (!hasAccess && !isOwner) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
