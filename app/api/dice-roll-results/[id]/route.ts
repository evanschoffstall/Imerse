import { authOptions } from "@/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/dice-roll-results/[id] - Delete dice roll result
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.diceRollResult.findUnique({
      where: { id: params.id },
      include: {
        diceRoll: true,
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Check edit permission (need edit to delete results)
    const canEdit = await hasPermission(
      session.user.id,
      result.diceRoll.campaignId,
      Permission.EDIT_ENTITIES
    );

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.diceRollResult.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting dice roll result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
