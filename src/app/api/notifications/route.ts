import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type {
  CreateNotificationInput,
  NotificationFilters,
} from "@/types/notification";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const read = searchParams.get("read");
    const type = searchParams.get("type");
    const campaignId = searchParams.get("campaignId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const filters: NotificationFilters = {};
    if (read !== null) filters.read = read === "true";
    if (type) filters.type = type as any;
    if (campaignId) filters.campaignId = campaignId;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(filters.read !== undefined && { read: filters.read }),
        ...(filters.type && { type: filters.type }),
        ...(filters.campaignId && { campaignId: filters.campaignId }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateNotificationInput;

    // Validate required fields
    if (!body.type || !body.title || !body.message || !body.userId) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message, userId" },
        { status: 400 }
      );
    }

    // Check if user has permission to create notifications for this user
    // For now, only allow creating notifications for yourself or system notifications
    if (
      body.userId !== session.user.id &&
      !(session.user.email && session.user.email.includes("admin@example.com"))
    ) {
      return NextResponse.json(
        { error: "Cannot create notifications for other users" },
        { status: 403 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        type: body.type,
        title: body.title,
        message: body.message,
        link: body.link,
        entityType: body.entityType,
        entityId: body.entityId,
        userId: body.userId,
        creatorId: body.creatorId || session.user.id,
        campaignId: body.campaignId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// Mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "mark-all-read") {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ message: "All notifications marked as read" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
