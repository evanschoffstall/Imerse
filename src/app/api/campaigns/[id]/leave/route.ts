import { auth } from "@/auth"
import { removeCampaignMember } from "@/lib/permissions"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/campaigns/[id]/leave
 * Leave a campaign (remove yourself as a member)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaignId = id
    const userId = session.user.id

    await removeCampaignMember(campaignId, userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Cannot remove campaign owner") {
      return NextResponse.json(
        { error: "Campaign owners cannot leave their campaigns. Transfer ownership or delete the campaign instead." },
        { status: 400 }
      )
    }
    console.error("Error leaving campaign:", error)
    return NextResponse.json(
      { error: "Failed to leave campaign" },
      { status: 500 }
    )
  }
}
