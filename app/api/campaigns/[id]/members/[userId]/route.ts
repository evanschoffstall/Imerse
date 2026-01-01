import { auth } from "@/auth";
import {
    Permission,
    removeCampaignMember,
    requireCampaignAccess,
    RoleLevel,
    updateCampaignMember,
} from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/campaigns/[campaignId]/members/[userId]
 * Update a member's role and permissions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const campaignId = params.id
    const userId = params.userId

    // Require MEMBERS permission
    await requireCampaignAccess(campaignId, Permission.MEMBERS)

    const body = await request.json()
    const { role, isAdmin, permissions } = body

    const member = await updateCampaignMember(campaignId, userId, {
      role: role as RoleLevel,
      isAdmin,
      permissions,
    })

    return NextResponse.json(member)
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("Error updating campaign member:", error)
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/campaigns/[campaignId]/members/[userId]
 * Remove a member from the campaign
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const campaignId = params.id
    const userId = params.userId

    // Require MEMBERS permission
    await requireCampaignAccess(campaignId, Permission.MEMBERS)

    // Prevent removing yourself (use leave endpoint instead)
    const session = await auth()
    if (session?.user?.id === userId) {
      return NextResponse.json(
        { error: "Use /leave endpoint to leave the campaign" },
        { status: 400 }
      )
    }

    await removeCampaignMember(campaignId, userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error.message === "Cannot remove campaign owner") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error removing campaign member:", error)
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    )
  }
}
