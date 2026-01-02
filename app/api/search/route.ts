import { auth } from "@/auth";
import { getCampaignPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { EntityType, SearchResult } from "@/types/search";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const campaignId = searchParams.get("campaignId");
    const entityTypesParam = searchParams.get("entityTypes");
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const sortBy = searchParams.get("sortBy") || "relevance";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const includePrivate = searchParams.get("includePrivate") === "true";
    const createdAfter = searchParams.get("createdAfter");
    const createdBefore = searchParams.get("createdBefore");
    const updatedAfter = searchParams.get("updatedAfter");
    const updatedBefore = searchParams.get("updatedBefore");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const limit = Math.min(limitParam ? parseInt(limitParam, 10) : 20, 100);
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    const entityTypes: EntityType[] = entityTypesParam
      ? (entityTypesParam.split(",") as EntityType[])
      : [
          "campaign",
          "character",
          "location",
          "item",
          "quest",
          "event",
          "journal",
          "note",
          "family",
          "race",
          "organisation",
          "tag",
          "timeline",
          "map",
        ];

    // Check campaign access if campaignId provided
    if (campaignId) {
      const perms = await getCampaignPermissions(campaignId, session.user.id);
      if (!perms) {
        return NextResponse.json(
          { error: "No access to this campaign" },
          { status: 403 }
        );
      }
    }

    // Get all campaigns user has access to
    const userCampaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            campaignRoles: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
        ...(campaignId ? { id: campaignId } : {}),
      },
      select: { id: true, name: true },
    });

    const campaignIds = userCampaigns.map((c) => c.id);

    if (campaignIds.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        query,
        entityTypes,
        campaignId,
      });
    }

    const searchResults: SearchResult[] = [];
    const searchTerm = query.trim().toLowerCase();
    const isExactMatch = searchTerm.startsWith("=");
    const cleanTerm = isExactMatch ? searchTerm.slice(1) : searchTerm;

    // Build WHERE clause for name matching
    const nameFilter = isExactMatch
      ? { name: { equals: cleanTerm, mode: "insensitive" as const } }
      : { name: { contains: cleanTerm, mode: "insensitive" as const } };

    // Helper to check if entity type should be searched
    const shouldSearch = (type: EntityType) => entityTypes.includes(type);

    // Search filter based on query
    const searchFilter = {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
      ],
    };

    // Build date range filters
    const dateFilters: any = {};
    if (createdAfter) {
      dateFilters.createdAt = {
        ...dateFilters.createdAt,
        gte: new Date(createdAfter),
      };
    }
    if (createdBefore) {
      dateFilters.createdAt = {
        ...dateFilters.createdAt,
        lte: new Date(createdBefore),
      };
    }
    if (updatedAfter) {
      dateFilters.updatedAt = {
        ...dateFilters.updatedAt,
        gte: new Date(updatedAfter),
      };
    }
    if (updatedBefore) {
      dateFilters.updatedAt = {
        ...dateFilters.updatedAt,
        lte: new Date(updatedBefore),
      };
    }

    // Combine filters
    const baseFilter: any = {
      ...searchFilter,
      ...(campaignId ? { campaignId } : { campaignId: { in: campaignIds } }),
      ...dateFilters,
      ...(includePrivate ? {} : { isPrivate: false }),
    };

    // Search campaigns (if not filtered by campaignId)
    if (entityTypes.includes("campaign") && !campaignId) {
      const campaigns = await prisma.campaign.findMany({
        where: {
          ownerId: session.user.id,
          ...searchFilter,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...campaigns.map((c: any) => ({
          ...c,
          type: "campaign" as EntityType,
        }))
      );
    }

    // Search characters
    if (entityTypes.includes("character")) {
      const characters = await prisma.character.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          title: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...characters.map((c: any) => ({
          ...c,
          type: "character" as EntityType,
        }))
      );
    }

    // Search locations
    if (entityTypes.includes("location")) {
      const locations = await prisma.location.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...locations.map((l: any) => ({
          ...l,
          type: "location" as EntityType,
        }))
      );
    }

    // Search items
    if (entityTypes.includes("item")) {
      const items = await prisma.item.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...items.map((i: any) => ({
          ...i,
          type: "item" as EntityType,
        }))
      );
    }

    // Search quests
    if (entityTypes.includes("quest")) {
      const quests = await prisma.quest.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...quests.map((q: any) => ({
          ...q,
          type: "quest" as EntityType,
        }))
      );
    }

    // Search events
    if (entityTypes.includes("event")) {
      const events = await prisma.event.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...events.map((e: any) => ({
          ...e,
          type: "event" as EntityType,
        }))
      );
    }

    // Search journals
    if (entityTypes.includes("journal")) {
      const journals = await prisma.journal.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...journals.map((j: any) => ({
          ...j,
          type: "journal" as EntityType,
        }))
      );
    }

    // Search notes
    if (entityTypes.includes("note")) {
      const notes = await prisma.note.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...notes.map((n: any) => ({
          ...n,
          type: "note" as EntityType,
        }))
      );
    }

    // Search families
    if (entityTypes.includes("family")) {
      const families = await prisma.family.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...families.map((f: any) => ({
          ...f,
          type: "family" as EntityType,
        }))
      );
    }

    // Search races
    if (entityTypes.includes("race")) {
      const races = await prisma.race.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...races.map((r: any) => ({
          ...r,
          type: "race" as EntityType,
        }))
      );
    }

    // Search organisations
    if (entityTypes.includes("organisation")) {
      const organisations = await prisma.organisation.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...organisations.map((o: any) => ({
          ...o,
          type: "organisation" as EntityType,
        }))
      );
    }

    // Search tags
    if (entityTypes.includes("tag")) {
      const tags = await prisma.tag.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          color: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...tags.map((t: any) => ({
          ...t,
          type: "tag" as EntityType,
        }))
      );
    }

    // Search timelines
    if (entityTypes.includes("timeline")) {
      const timelines = await prisma.timeline.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...timelines.map((t: any) => ({
          ...t,
          type: "timeline" as EntityType,
        }))
      );
    }

    // Search maps
    if (entityTypes.includes("map")) {
      const maps = await prisma.map.findMany({
        where: baseFilter,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          image: true,
          campaignId: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      searchResults.push(
        ...maps.map((m: any) => ({
          ...m,
          type: "map" as EntityType,
        }))
      );
    }

    // Sort results based on sortBy parameter
    const sortedResults = searchResults.sort((a, b) => {
      if (sortBy === "relevance") {
        // Name exact match first, then partial match, then description match
        const aNameExact = a.name.toLowerCase() === query.toLowerCase();
        const bNameExact = b.name.toLowerCase() === query.toLowerCase();
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;

        const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
        const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } else if (sortBy === "name") {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (sortBy === "created") {
        const comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (sortBy === "updated") {
        const comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        return sortOrder === "asc" ? comparison : -comparison;
      }
      return 0;
    });

    // Apply limit
    const paginatedResults = sortedResults.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginatedResults,
      total: sortedResults.length,
      query,
      entityTypes,
      campaignId,
      filters: {
        includePrivate,
        createdAfter,
        createdBefore,
        updatedAfter,
        updatedBefore,
        sortBy,
        sortOrder,
      },
      pagination: {
        limit,
        offset,
        hasMore: sortedResults.length > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
