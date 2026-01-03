import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const organisationUpdateSchema = z.object({
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
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const organisation = await prisma.organisation.findUnique({
    where: { id: id },
    include: {
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } }
    }
  })

  if (!organisation) {
    return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: organisation.campaignId }
  })

  if (!campaign || campaign.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return NextResponse.json({ organisation })
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
    const existingOrganisation = await prisma.organisation.findUnique({
      where: { id: id },
      include: { campaign: true }
    })

    if (!existingOrganisation) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })
    }

    if (existingOrganisation.campaign.ownerId !== session.user.id && existingOrganisation.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const data = organisationUpdateSchema.parse(body)

    const updateData: any = { ...data }
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }

    const organisation = await prisma.organisation.update({
      where: { id: id },
      data: updateData,
      include: {
        campaign: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({ organisation })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating organisation:', error)
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

  const organisation = await prisma.organisation.findUnique({
    where: { id: id },
    include: { campaign: true }
  })

  if (!organisation) {
    return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })
  }

  if (organisation.campaign.ownerId !== session.user.id && organisation.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.organisation.delete({
    where: { id: id }
  })

  return NextResponse.json({ success: true })
}
