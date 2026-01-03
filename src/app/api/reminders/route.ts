import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reminders - List reminders
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const eventTypeId = searchParams.get("eventTypeId");
    const calendarId = searchParams.get("calendarId");
    const isRecurring = searchParams.get("isRecurring");
    const isNotification = searchParams.get("isNotification");

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

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (eventTypeId) {
      where.eventTypeId = eventTypeId;
    }

    if (calendarId) {
      where.calendarId = calendarId;
    }

    if (isRecurring === "true") {
      where.isRecurring = true;
    }

    if (isNotification === "true") {
      where.isNotification = true;
    }

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        eventType: true,
        calendar: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
      orderBy: [{ calendarDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Reminder GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

// POST /api/reminders - Create reminder
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      entityType,
      entityId,
      eventTypeId,
      calendarId,
      calendarDate,
      isRecurring,
      recurrenceRule,
      notifyBefore,
      isNotification,
      campaignId,
    } = body;

    // Validation
    if (!name || !entityType || !entityId || !eventTypeId || !campaignId) {
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

    // Verify event type exists
    const eventType = await prisma.entityEventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    // Create reminder
    const reminder = await prisma.reminder.create({
      data: {
        name,
        description,
        entityType,
        entityId,
        eventTypeId,
        calendarId,
        calendarDate,
        isRecurring: isRecurring || false,
        recurrenceRule: recurrenceRule || undefined,
        notifyBefore,
        isNotification: isNotification || false,
        campaignId,
        createdById: session.user.id,
      },
      include: {
        eventType: true,
        calendar: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Reminder POST error:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
