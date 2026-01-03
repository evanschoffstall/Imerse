import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; weatherId: string }> }
) {
  try {
    const { id, weatherId } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calendarId = id;

    // Check weather exists
    const weather = await prisma.calendarWeather.findUnique({
      where: { id: weatherId },
      include: {
        calendar: {
          select: {
            id: true,
            campaign: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!weather || weather.calendarId !== calendarId) {
      return NextResponse.json({ error: "Weather not found" }, { status: 404 });
    }

    // Check if user has edit permission
    const canEdit = weather.calendar.campaign.ownerId === session.user.id;

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { date, weatherType, temperature, precipitation, wind, effect } =
      body;

    const updated = await prisma.calendarWeather.update({
      where: { id: weatherId },
      data: {
        date: date || undefined,
        weatherType: weatherType !== null ? weatherType : undefined,
        temperature: temperature !== null ? temperature : undefined,
        precipitation: precipitation !== null ? precipitation : undefined,
        wind: wind !== null ? wind : undefined,
        effect: effect !== null ? effect : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update weather:", error);
    return NextResponse.json(
      { error: "Failed to update weather" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; weatherId: string }> }
) {
  try {
    const { id, weatherId } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calendarId = id;

    // Check weather exists
    const weather = await prisma.calendarWeather.findUnique({
      where: { id: weatherId },
      include: {
        calendar: {
          select: {
            id: true,
            campaign: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!weather || weather.calendarId !== calendarId) {
      return NextResponse.json({ error: "Weather not found" }, { status: 404 });
    }

    // Check if user has delete permission
    const canDelete = weather.calendar.campaign.ownerId === session.user.id;

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.calendarWeather.delete({
      where: { id: weatherId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete weather:", error);
    return NextResponse.json(
      { error: "Failed to delete weather" },
      { status: 500 }
    );
  }
}
