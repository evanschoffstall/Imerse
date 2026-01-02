import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const calendarId = searchParams.get("calendarId");
  const timelineId = searchParams.get("timelineId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!campaignId) {
    return NextResponse.json(
      { error: "Campaign ID is required" },
      { status: 400 }
    );
  }

  // Verify user has access to this campaign
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId: session.user.id,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Build where clause for filtering
  const where: any = { campaignId };

  if (calendarId) {
    where.calendarId = calendarId;
  }

  if (timelineId) {
    where.timelineId = timelineId;
  }

  if (startDate && endDate) {
    where.calendarDate = {
      gte: startDate,
      lte: endDate,
    };
  } else if (startDate) {
    where.calendarDate = { gte: startDate };
  } else if (endDate) {
    where.calendarDate = { lte: endDate };
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      createdBy: {
        select: { name: true, email: true },
      },
      calendar: {
        select: { id: true, name: true },
      },
      timeline: {
        select: { id: true, name: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    campaignId,
    createdById,
    calendarId,
    calendarDate,
    isRecurring,
    recurrenceRule,
    timelineId,
  } = body;

  if (!name || !campaignId) {
    return NextResponse.json(
      { error: "Name and campaign ID are required" },
      { status: 400 }
    );
  }

  // Verify user has access to this campaign
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId: session.user.id,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const event = await prisma.event.create({
    data: {
      name,
      slug,
      type,
      date,
      description,
      image,
      location,
      isPrivate: isPrivate || false,
      calendarId: calendarId || undefined,
      calendarDate: calendarDate || undefined,
      isRecurring: isRecurring || false,
      recurrenceRule: recurrenceRule || undefined,
      timelineId: timelineId || undefined,
      campaignId,
      createdById: createdById || session.user.id,
    },
    include: {
      createdBy: {
        select: { name: true, email: true },
      },
      timeline: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
