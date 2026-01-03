import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const timelineUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timeline = await prisma.timeline.findUnique({
    where: { id: id },
    include: {
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      events: {
        select: {
          id: true,
          name: true,
          date: true,
          calendarDate: true,
          type: true,
        },
        orderBy: [{ calendarDate: "asc" }, { date: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!timeline) {
    return NextResponse.json({ error: "Timeline not found" }, { status: 404 });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: timeline.campaignId },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({ timeline });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingTimeline = await prisma.timeline.findUnique({
      where: { id: id },
      include: { campaign: true },
    });

    if (!existingTimeline) {
      return NextResponse.json(
        { error: "Timeline not found" },
        { status: 404 }
      );
    }

    if (
      existingTimeline.campaign.ownerId !== session.user.id &&
      existingTimeline.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const data = timelineUpdateSchema.parse(body);

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate || null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate || null;
    }

    const timeline = await prisma.timeline.update({
      where: { id: id },
      data: updateData,
      include: {
        campaign: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        events: {
          select: {
            id: true,
            name: true,
            date: true,
            calendarDate: true,
            type: true,
          },
          orderBy: [{ calendarDate: "asc" }, { date: "asc" }, { name: "asc" }],
        },
      },
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating timeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timeline = await prisma.timeline.findUnique({
    where: { id: id },
    include: { campaign: true },
  });

  if (!timeline) {
    return NextResponse.json({ error: "Timeline not found" }, { status: 404 });
  }

  if (
    timeline.campaign.ownerId !== session.user.id &&
    timeline.createdById !== session.user.id
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.timeline.delete({
    where: { id: id },
  });

  return NextResponse.json({ success: true });
}
