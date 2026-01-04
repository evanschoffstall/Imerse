import { prisma } from "@/lib/db";
import { Permission, requireCampaignAccess } from "@/lib/permissions";
import { NextResponse } from "next/server";

/**
 * GET /api/campaigns/[id]/dashboard - Get all dashboard data in one request
 * This combines stats, recent activity, and active quests to reduce API calls
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Single permission check for all dashboard data
    await requireCampaignAccess(campaignId, Permission.READ);

    // Fetch all dashboard data in parallel
    const [
      characterCount,
      locationCount,
      activeQuests,
      recentCharacters,
      recentLocations,
      recentItems,
      recentQuests,
      recentEvents,
      recentJournals,
      recentNotes,
    ] = await Promise.all([
      // Stats
      prisma.character.count({ where: { campaignId } }),
      prisma.location.count({ where: { campaignId } }),

      // Active quests
      prisma.quest.findMany({
        where: { campaignId, status: "active" },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          status: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),

      // Recent entities
      prisma.character.findMany({
        where: { campaignId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          imageId: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.location.findMany({
        where: { campaignId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          imageId: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.item.findMany({
        where: { campaignId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          image: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.quest.findMany({
        where: { campaignId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.event.findMany({
        where: { campaignId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.journal.findMany({
        where: { campaignId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.note.findMany({
        where: { campaignId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
    ]);

    // Combine all recent entities with type labels
    const recentEntities = [
      ...recentCharacters.map((e) => ({ ...e, type: "character" })),
      ...recentLocations.map((e) => ({ ...e, type: "location" })),
      ...recentItems.map((e) => ({ ...e, type: "item", imageId: e.image })),
      ...recentQuests.map((e) => ({ ...e, type: "quest" })),
      ...recentEvents.map((e) => ({ ...e, type: "event" })),
      ...recentJournals.map((e) => ({ ...e, type: "journal" })),
      ...recentNotes.map((e) => ({ ...e, type: "note" })),
    ]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        hasCharacters: characterCount > 0,
        hasLocations: locationCount > 0,
      },
      recentEntities,
      activeQuests,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching dashboard data:", err);

    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
