import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const timelineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isPrivate: z.boolean().default(false),
  campaignId: z.string(),
  createdById: z.string(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json(
      { error: "Campaign ID is required" },
      { status: 400 }
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const timelines = await prisma.timeline.findMany({
    where: { campaignId },
    include: {
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      _count: {
        select: { events: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ timelines });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = timelineSchema.parse(body);

    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const timeline = await prisma.timeline.create({
      data: {
        ...data,
        slug,
      },
      include: {
        campaign: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ timeline }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating timeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
