import { auth } from "@/auth";
import { getCampaignPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { calendarSchema } from "@/types/calendar";
import { NextRequest, NextResponse } from "next/server";

// GET /api/calendars/[id] - Get a single calendar
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const calendar = await prisma.calendar.findUnique({
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
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        weather: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const permissions = await getCampaignPermissions(calendar.campaignId);
    if (!permissions) {
      return NextResponse.json(
        { error: "No access to this calendar" },
        { status: 403 }
      );
    }

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

// PATCH /api/calendars/[id] - Update a calendar
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const calendar = await prisma.calendar.findUnique({
      where: { id: id },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const permissions = await getCampaignPermissions(calendar.campaignId);
    if (!permissions) {
      return NextResponse.json(
        { error: "No permission to edit this calendar" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = calendarSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== calendar.slug) {
      const existing = await prisma.calendar.findUnique({
        where: {
          campaignId_slug: {
            campaignId: calendar.campaignId,
            slug: data.slug,
          },
        },
      });
      if (existing && existing.id !== calendar.id) {
        return NextResponse.json(
          { error: "A calendar with this slug already exists in the campaign" },
          { status: 409 }
        );
      }
    }

    // Update calendar
    const updated = await prisma.calendar.update({
      where: { id: id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.months !== undefined && { months: data.months as any }),
        ...(data.weekdays !== undefined && { weekdays: data.weekdays as any }),
        ...(data.years !== undefined && { years: data.years as any }),
        ...(data.seasons !== undefined && { seasons: data.seasons as any }),
        ...(data.moons !== undefined && { moons: data.moons as any }),
        ...(data.weekNames !== undefined && {
          weekNames: data.weekNames as any,
        }),
        ...(data.monthAliases !== undefined && {
          monthAliases: data.monthAliases as any,
        }),
        ...(data.suffix !== undefined && { suffix: data.suffix }),
        ...(data.format !== undefined && { format: data.format }),
        ...(data.hasLeapYear !== undefined && {
          hasLeapYear: data.hasLeapYear,
        }),
        ...(data.leapYearAmount !== undefined && {
          leapYearAmount: data.leapYearAmount,
        }),
        ...(data.leapYearMonth !== undefined && {
          leapYearMonth: data.leapYearMonth,
        }),
        ...(data.leapYearOffset !== undefined && {
          leapYearOffset: data.leapYearOffset,
        }),
        ...(data.leapYearStart !== undefined && {
          leapYearStart: data.leapYearStart,
        }),
        ...(data.startOffset !== undefined && {
          startOffset: data.startOffset,
        }),
        ...(data.skipYearZero !== undefined && {
          skipYearZero: data.skipYearZero,
        }),
        ...(data.showBirthdays !== undefined && {
          showBirthdays: data.showBirthdays,
        }),
        ...(data.parameters !== undefined && {
          parameters: data.parameters as any,
        }),
        ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
      },
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
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating calendar:", error);
    return NextResponse.json(
      { error: "Failed to update calendar" },
      { status: 500 }
    );
  }
}

// DELETE /api/calendars/[id] - Delete a calendar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const calendar = await prisma.calendar.findUnique({
      where: { id: id },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const permissions = await getCampaignPermissions(calendar.campaignId);
    if (!permissions) {
      return NextResponse.json(
        { error: "No permission to delete this calendar" },
        { status: 403 }
      );
    }

    // Delete calendar (cascade will handle weather entries)
    await prisma.calendar.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar" },
      { status: 500 }
    );
  }
}
