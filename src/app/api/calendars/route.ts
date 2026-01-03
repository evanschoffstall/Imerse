import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { getCampaignPermissions, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { calendarSchema } from "@/types/calendar";
import { NextRequest, NextResponse } from "next/server";

// GET /api/calendars - List all calendars user has access to
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const includeWeather = searchParams.get("includeWeather") === "true";

    // Build query
    const where: any = {};

    // If campaignId specified, check permissions
    if (campaignId) {
      const permissions = await getCampaignPermissions(campaignId, user.id);
      if (
        !permissions ||
        (!permissions.isOwner &&
          !permissions.isAdmin &&
          !permissions.permissions.includes(Permission.READ))
      ) {
        return NextResponse.json(
          { error: "No access to this campaign" },
          { status: 403 }
        );
      }
      where.campaignId = campaignId;
    } else {
      // Get all campaigns user has access to
      const ownedCampaigns = await prisma.campaign.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });

      const memberCampaigns = await prisma.campaignRole.findMany({
        where: { userId: user.id },
        select: { campaignId: true },
      });

      const accessibleCampaignIds = [
        ...ownedCampaigns.map((c) => c.id),
        ...memberCampaigns.map((c) => c.campaignId),
      ];

      where.campaignId = { in: accessibleCampaignIds };
    }

    // Fetch calendars
    const calendars = await prisma.calendar.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        weather: includeWeather ? true : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(calendars);
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendars" },
      { status: 500 }
    );
  }
}

// POST /api/calendars - Create a new calendar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = calendarSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check campaign permissions
    const permissions = await getCampaignPermissions(data.campaignId, user.id);
    if (!permissions) {
      return NextResponse.json(
        { error: "No permission to create calendars in this campaign" },
        { status: 403 }
      );
    }

    // Generate slug if not provided
    if (!data.slug) {
      const baseSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check for existing slugs and append number if needed
      let slug = baseSlug;
      let counter = 1;
      while (
        await prisma.calendar.findUnique({
          where: {
            campaignId_slug: {
              campaignId: data.campaignId,
              slug,
            },
          },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      data.slug = slug;
    }

    // Create calendar
    const calendar = await prisma.calendar.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        date: data.date,
        months: data.months as any,
        weekdays: data.weekdays as any,
        years: data.years as any,
        seasons: data.seasons as any,
        moons: data.moons as any,
        weekNames: data.weekNames as any,
        monthAliases: data.monthAliases as any,
        suffix: data.suffix,
        format: data.format,
        hasLeapYear: data.hasLeapYear ?? false,
        leapYearAmount: data.leapYearAmount,
        leapYearMonth: data.leapYearMonth,
        leapYearOffset: data.leapYearOffset,
        leapYearStart: data.leapYearStart,
        startOffset: data.startOffset ?? 0,
        skipYearZero: data.skipYearZero ?? false,
        showBirthdays: data.showBirthdays ?? true,
        parameters: data.parameters as any,
        isPrivate: data.isPrivate ?? false,
        parentId: data.parentId,
        campaignId: data.campaignId,
        createdById: user.id,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(calendar, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar:", error);
    return NextResponse.json(
      { error: "Failed to create calendar" },
      { status: 500 }
    );
  }
}
