import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calendarId = id;

    // Check calendar exists and get campaign
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
      select: {
        id: true,
        campaignId: true,
        campaign: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    // Check if user is campaign owner or has access
    const isCampaignOwner = calendar.campaign.ownerId === session.user.id;
    if (!isCampaignOwner) {
      // Could add more permission checks here if needed
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { date, weatherType, temperature, precipitation, wind, effect } =
      body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Check for existing weather on this date
    const existing = await prisma.calendarWeather.findFirst({
      where: {
        calendarId,
        date,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Weather already exists for this date. Use PATCH to update." },
        { status: 409 }
      );
    }

    const weather = await prisma.calendarWeather.create({
      data: {
        calendarId,
        date,
        weatherType: weatherType || "clear",
        temperature: temperature !== null ? temperature : undefined,
        precipitation: precipitation || undefined,
        wind: wind || undefined,
        effect: effect || undefined,
      },
    });

    return NextResponse.json(weather);
  } catch (error) {
    console.error("Failed to create weather:", error);
    return NextResponse.json(
      { error: "Failed to create weather" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calendarId = id;

    // Check calendar exists and get campaign owner
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
      select: {
        id: true,
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    // Check if user has access (simplified - just check ownership for now)
    const hasAccess = calendar.campaign.ownerId === session.user.id;

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = { calendarId };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.date = { gte: startDate };
    } else if (endDate) {
      where.date = { lte: endDate };
    }

    const weather = await prisma.calendarWeather.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(weather);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
