import { auth } from "@/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// DELETE /api/creature-locations/[id] - Delete creature-location link
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const link = await prisma.creatureLocation.findUnique({
      where: { id: params.id },
      include: {
        creature: {
          select: {
            campaignId: true,
          },
        },
      },
    });

    if (!link) {
      return Response.json({ error: "Link not found" }, { status: 404 });
    }

    // Check permissions
    const canEdit = await hasPermission(
      link.creature.campaignId,
      session.user.id,
      "EDIT_ENTITIES"
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.creatureLocation.delete({
      where: { id: params.id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting creature-location:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
