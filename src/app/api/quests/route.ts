import { authConfig } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
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

  const quests = await prisma.quest.findMany({
    where: { campaignId },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      status: true,
      isPrivate: true,
      image: true,
      // description: excluded - too large for list view
      createdAt: true,
      updatedAt: true,
      campaignId: true,
      createdById: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ quests });
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    type,
    description,
    image,
    status,
    isPrivate,
    campaignId,
    createdById,
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

  const quest = await prisma.quest.create({
    data: {
      name,
      slug,
      type,
      description,
      image,
      status: status || "active",
      isPrivate: isPrivate || false,
      campaignId,
      createdById: createdById || session.user.id,
    },
    include: {
      createdBy: {
        select: { name: true, email: true },
      },
    },
  });

  return NextResponse.json({ quest }, { status: 201 });
}
