import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId: session.user.id
    }
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const notes = await prisma.note.findMany({
    where: { campaignId },
    include: {
      createdBy: {
        select: { name: true, email: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return NextResponse.json({ notes })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, type, description, image, isPrivate, campaignId, createdById } = body

  if (!name || !campaignId) {
    return NextResponse.json({ error: 'Name and campaign ID are required' }, { status: 400 })
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId: session.user.id
    }
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const note = await prisma.note.create({
    data: {
      name,
      slug,
      type,
      description,
      image,
      isPrivate: isPrivate || false,
      campaignId,
      createdById: createdById || session.user.id
    },
    include: {
      createdBy: {
        select: { name: true, email: true }
      }
    }
  })

  return NextResponse.json({ note }, { status: 201 })
}
