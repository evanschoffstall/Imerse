import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { prisma } from "@/lib/db";
import { compareSnapshots } from "@/types/version";
import { NextRequest, NextResponse } from "next/server";

// GET /api/versions/compare - Compare two versions
export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const version1Id = searchParams.get("version1Id");
  const version2Id = searchParams.get("version2Id");

  if (!version1Id || !version2Id) {
    return NextResponse.json(
      { error: "version1Id and version2Id are required" },
      { status: 400 }
    );
  }

  try {
    const [version1, version2] = await Promise.all([
      prisma.version.findUnique({
        where: { id: version1Id },
        include: {
          campaign: {
            select: {
              ownerId: true,
              campaignRoles: {
                where: { userId: session.user.id },
                select: { userId: true },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.version.findUnique({
        where: { id: version2Id },
        include: {
          campaign: {
            select: {
              ownerId: true,
              campaignRoles: {
                where: { userId: session.user.id },
                select: { userId: true },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    if (!version1 || !version2) {
      return NextResponse.json(
        { error: "Version(s) not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasAccess1 =
      version1.campaign.ownerId === session.user.id ||
      version1.campaign.campaignRoles.length > 0;
    const hasAccess2 =
      version2.campaign.ownerId === session.user.id ||
      version2.campaign.campaignRoles.length > 0;

    if (!hasAccess1 || !hasAccess2) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify they're for the same entity
    if (
      version1.entityType !== version2.entityType ||
      version1.entityId !== version2.entityId
    ) {
      return NextResponse.json(
        { error: "Versions must be for the same entity" },
        { status: 400 }
      );
    }

    // Compare snapshots
    const diff = compareSnapshots(
      version1.snapshot as Record<string, any>,
      version2.snapshot as Record<string, any>
    );

    return NextResponse.json({
      version1,
      version2,
      diff,
    });
  } catch (error) {
    console.error("Error comparing versions:", error);
    return NextResponse.json(
      { error: "Failed to compare versions" },
      { status: 500 }
    );
  }
}
