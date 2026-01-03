import { prisma } from "@/lib/db";
import { Permission, requireCampaignAccess } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    // Check campaign access
    await requireCampaignAccess(campaignId, Permission.READ);

    // Fetch recent entities from multiple types
    const [characters, locations, items, quests, events, journals, notes] =
      await Promise.all([
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

    // Combine and sort all entities
    const allEntities = [
      ...characters.map((c) => ({
        ...c,
        type: "character",
        image: c.imageId ? `/api/images/${c.imageId}` : null,
      })),
      ...locations.map((l) => ({
        ...l,
        type: "location",
        image: l.imageId ? `/api/images/${l.imageId}` : null,
      })),
      ...items.map((i) => ({
        ...i,
        type: "item",
        image: i.image || null,
      })),
      ...quests.map((q) => ({ ...q, type: "quest", image: null })),
      ...events.map((e) => ({ ...e, type: "event", image: null })),
      ...journals.map((j) => ({ ...j, type: "journal", image: null })),
      ...notes.map((n) => ({ ...n, type: "note", image: null })),
    ].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Return top 10
    const entities = allEntities.slice(0, 10);

    return NextResponse.json({ entities });
  } catch (error) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("Error fetching recent entities:", err);
    return NextResponse.json(
      { error: "Failed to fetch recent entities" },
      { status: 500 }
    );
  }
}
