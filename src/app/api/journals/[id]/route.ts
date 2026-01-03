import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const journal = await prisma.journal.findUnique({
    where: { id: id },
    include: {
      campaign: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  if (!journal) {
    return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
  }

  const hasAccess = await prisma.campaign.findFirst({
    where: {
      id: journal.campaignId,
      ownerId: session.user.id
    }
  })

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ journal })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const journal = await prisma.journal.findUnique({
    where: { id: id },
    include: {
      campaign: {
        select: {
          ownerId: true
        }
      }
    }
  })

  if (!journal) {
    return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
  }

  if (journal.campaign.ownerId !== session.user.id && journal.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { name, type, date, description, image, isPrivate } = body

  let slug = journal.slug
  if (name && name !== journal.name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const updatedJournal = await prisma.journal.update({
    where: { id: id },
    data: {
      name,
      slug,
      type,
      date,
      description,
      image,
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

  return NextResponse.json({ journal: updatedJournal })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const journal = await prisma.journal.findUnique({
    where: { id: id },
    include: {
      campaign: {
        select: {
          ownerId: true
        }
      }
    }
  })

  if (!journal) {
    return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
  }

  if (journal.campaign.ownerId !== session.user.id && journal.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.journal.delete({
    where: { id: id }
  })

  return NextResponse.json({ message: 'Journal deleted successfully' })
}
