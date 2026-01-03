import {
    addCampaignMember,
    getCampaignMembers,
    Permission,
    requireCampaignAccess,
    RoleLevel,
} from "@/lib/permissions"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/campaigns/[id]/members
 * List all members of a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = id

    // Require campaign access (any member can view members)
    await requireCampaignAccess(campaignId)

    const members = await getCampaignMembers(campaignId)

    // Also get the campaign owner info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({
      members,
      owner: campaign?.owner,
    })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("Error fetching campaign members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/members
 * Add a new member to the campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = id

    // Require MEMBERS permission
    await requireCampaignAccess(campaignId, Permission.MEMBERS)

    const body = await request.json()
    const { email, role = RoleLevel.MEMBER, isAdmin = false, permissions } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found. They must register first." },
        { status: 404 }
      )
    }

    // Prevent adding the owner as a member
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { ownerId: true },
    })

    if (campaign?.ownerId === user.id) {
      return NextResponse.json(
        { error: "Campaign owner is already a member" },
        { status: 400 }
      )
    }

    const member = await addCampaignMember(
      campaignId,
      user.id,
      role,
      isAdmin,
      permissions
    )

    return NextResponse.json(member, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error.message === "User is already a member of this campaign") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error adding campaign member:", error)
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    )
  }
}
