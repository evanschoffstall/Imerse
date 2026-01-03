import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next';
import { hasPermission, Permission } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

// DELETE /api/creature-locations/[id] - Delete creature-location link
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const link = await prisma.creatureLocation.findUnique({
      where: { id: id },
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
      Permission.EDIT_ENTITIES,
      session.user.id
    );
    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.creatureLocation.delete({
      where: { id: id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting creature-location:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
