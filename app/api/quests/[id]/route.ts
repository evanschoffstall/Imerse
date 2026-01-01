import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const quest = await prisma.quest.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  if (!quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

  // Verify user has access to this campaign
  const hasAccess = await prisma.campaign.findFirst({
    where: {
      id: quest.campaignId,
      ownerId: session.user.id
    }
  })

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ quest })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const quest = await prisma.quest.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: {
          ownerId: true
        }
      }
    }
  })

  if (!quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

  // Check if user is campaign owner or quest creator
  if (quest.campaign.ownerId !== session.user.id && quest.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { name, type, description, image, status, isPrivate } = body

  // Generate new slug if name changed
  let slug = quest.slug
  if (name && name !== quest.name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const updatedQuest = await prisma.quest.update({
    where: { id: params.id },
    data: {
      name,
      slug,
      type,
      description,
      image,
      status,
      isPrivate
    },
    include: {
      campaign: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  return NextResponse.json({ quest: updatedQuest })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const quest = await prisma.quest.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: {
          ownerId: true
        }
      }
    }
  })

  if (!quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

  // Check if user is campaign owner or quest creator
  if (quest.campaign.ownerId !== session.user.id && quest.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.quest.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ message: 'Quest deleted successfully' })
}
