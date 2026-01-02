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

  const note = await prisma.note.findUnique({
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

  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  const hasAccess = await prisma.campaign.findFirst({
    where: {
      id: note.campaignId,
      ownerId: session.user.id
    }
  })

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ note })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: {
          ownerId: true
        }
      }
    }
  })

  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  if (note.campaign.ownerId !== session.user.id && note.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { name, type, description, image, isPrivate } = body

  let slug = note.slug
  if (name && name !== note.name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const updatedNote = await prisma.note.update({
    where: { id: params.id },
    data: {
      name,
      slug,
      type,
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

  return NextResponse.json({ note: updatedNote })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        select: {
          ownerId: true
        }
      }
    }
  })

  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  if (note.campaign.ownerId !== session.user.id && note.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.note.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ message: 'Note deleted successfully' })
}
