import { auth } from "@/auth";
import { canViewCampaign } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/attribute-templates/[id] - Get single template
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await prisma.attributeTemplate.findUnique({
      where: { id: params.id },
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
            email: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, template.campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("AttributeTemplate GET [id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PATCH /api/attribute-templates/[id] - Update template
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, description, config, entityType, isPublic, position } =
      body;

    // Get existing template
    const existing = await prisma.attributeTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, existing.campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (config !== undefined) updateData.config = config;
    if (entityType !== undefined) updateData.entityType = entityType;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (position !== undefined) updateData.position = position;

    const updated = await prisma.attributeTemplate.update({
      where: { id: params.id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("AttributeTemplate PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/attribute-templates/[id] - Delete template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing template
    const existing = await prisma.attributeTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check campaign access
    if (!(await canViewCampaign(session.user.id, existing.campaignId))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.attributeTemplate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AttributeTemplate DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
