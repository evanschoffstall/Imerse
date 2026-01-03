import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const familyUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  location: z.string().optional(),
  isPrivate: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const family = await prisma.family.findUnique({
    where: { id: id },
    include: {
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    }
  })

  if (!family) {
    return NextResponse.json({ error: 'Family not found' }, { status: 404 })
  }

  // Verify user has access to campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: family.campaignId }
  })

  if (!campaign || campaign.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return NextResponse.json({ family })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existingFamily = await prisma.family.findUnique({
      where: { id: id },
      include: { campaign: true }
    })

    if (!existingFamily) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    // Verify user has access
    if (existingFamily.campaign.ownerId !== session.user.id && existingFamily.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const data = familyUpdateSchema.parse(body)

    // Update slug if name changed
    const updateData: any = { ...data }
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }

    const family = await prisma.family.update({
      where: { id: id },
      data: updateData,
      include: {
        campaign: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({ family })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating family:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const family = await prisma.family.findUnique({
    where: { id: id },
    include: { campaign: true }
  })

  if (!family) {
    return NextResponse.json({ error: 'Family not found' }, { status: 404 })
  }

  // Verify user has access
  if (family.campaign.ownerId !== session.user.id && family.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.family.delete({
    where: { id: id }
  })

  return NextResponse.json({ success: true })
}
