import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      calendar: {
        select: { id: true, name: true },
      },
      timeline: {
        select: { id: true, name: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Verify user has access to this campaign
  const hasAccess = await prisma.campaign.findFirst({
    where: {
      id: event.campaignId,
      ownerId: session.user.id,
    },
  });

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ event });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Check if user is campaign owner or event creator
  if (
    event.campaign.ownerId !== session.user.id &&
    event.createdById !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    name,
    type,
    date,
    description,
    image,
    location,
    isPrivate,
    calendarId,
    calendarDate,
    isRecurring,
    recurrenceRule,
    timelineId,
  } = body;

  // Generate new slug if name changed
  let slug = event.slug;
  if (name && name !== event.name) {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const updatedEvent = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== event.slug && { slug }),
      ...(type !== undefined && { type }),
      ...(date !== undefined && { date }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(location !== undefined && { location }),
      ...(isPrivate !== undefined && { isPrivate }),
      ...(calendarId !== undefined && { calendarId }),
      ...(calendarDate !== undefined && { calendarDate }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(recurrenceRule !== undefined && { recurrenceRule }),
      ...(timelineId !== undefined && { timelineId }),
    },
    include: {
      campaign: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      calendar: {
        select: { id: true, name: true },
      },
      timeline: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json({ event: updatedEvent });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Check if user is campaign owner or event creator
  if (
    event.campaign.ownerId !== session.user.id &&
    event.createdById !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.event.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Event deleted successfully" });
}
