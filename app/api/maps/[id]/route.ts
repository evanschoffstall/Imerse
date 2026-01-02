import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const mapUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  grid: z.any().optional(),
  isPrivate: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const map = await prisma.map.findUnique({
    where: { id: params.id },
    include: {
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    }
  })

  if (!map) {
    return NextResponse.json({ error: 'Map not found' }, { status: 404 })
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: map.campaignId }
  })

  if (!campaign || campaign.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return NextResponse.json({ map })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existingMap = await prisma.map.findUnique({
      where: { id: params.id },
      include: { campaign: true }
    })

    if (!existingMap) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 })
    }

    if (existingMap.campaign.ownerId !== session.user.id && existingMap.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const data = mapUpdateSchema.parse(body)

    const updateData: any = { ...data }
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }

    const map = await prisma.map.update({
      where: { id: params.id },
      data: updateData,
      include: {
        campaign: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({ map })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating map:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const map = await prisma.map.findUnique({
    where: { id: params.id },
    include: { campaign: true }
  })

  if (!map) {
    return NextResponse.json({ error: 'Map not found' }, { status: 404 })
  }

  if (map.campaign.ownerId !== session.user.id && map.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.map.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
