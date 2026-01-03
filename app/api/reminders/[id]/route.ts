import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reminders/[id] - Get reminder by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id: id },
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

    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: reminder.campaignId,
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(reminder);
  } catch (error) {
    console.error("Reminder GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminder" },
      { status: 500 }
    );
  }
}

// PATCH /api/reminders/[id] - Update reminder
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id: id },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: reminder.campaignId,
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    } = body;

    // Verify event type if provided
    if (eventTypeId) {
      const eventType = await prisma.entityEventType.findUnique({
        where: { id: eventTypeId },
      });

      if (!eventType) {
        return NextResponse.json(
          { error: "Event type not found" },
          { status: 404 }
        );
      }
    }

    // Update reminder
    const updatedReminder = await prisma.reminder.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
        ...(eventTypeId && { eventTypeId }),
        ...(calendarId !== undefined && { calendarId }),
        ...(calendarDate !== undefined && { calendarDate }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurrenceRule !== undefined && { recurrenceRule }),
        ...(notifyBefore !== undefined && { notifyBefore }),
        ...(isNotification !== undefined && { isNotification }),
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

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error("Reminder PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

// DELETE /api/reminders/[id] - Delete reminder
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id: id },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: reminder.campaignId,
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.reminder.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reminder DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
