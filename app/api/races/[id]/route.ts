import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const raceUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isPrivate: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const race = await prisma.race.findUnique({
    where: { id: id },
    include: {
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    }
  })

  if (!race) {
    return NextResponse.json({ error: 'Race not found' }, { status: 404 })
  }

  // Verify user has access to campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: race.campaignId }
  })

  if (!campaign || campaign.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return NextResponse.json({ race })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existingRace = await prisma.race.findUnique({
      where: { id: id },
      include: { campaign: true }
    })

    if (!existingRace) {
      return NextResponse.json({ error: 'Race not found' }, { status: 404 })
    }

    // Verify user has access
    if (existingRace.campaign.ownerId !== session.user.id && existingRace.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const data = raceUpdateSchema.parse(body)

    // Update slug if name changed
    const updateData: any = { ...data }
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }

    const race = await prisma.race.update({
      where: { id: id },
      data: updateData,
      include: {
        campaign: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({ race })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating race:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const race = await prisma.race.findUnique({
    where: { id: id },
    include: { campaign: true }
  })

  if (!race) {
    return NextResponse.json({ error: 'Race not found' }, { status: 404 })
  }

  // Verify user has access
  if (race.campaign.ownerId !== session.user.id && race.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.race.delete({
    where: { id: id }
  })

  return NextResponse.json({ success: true })
}
