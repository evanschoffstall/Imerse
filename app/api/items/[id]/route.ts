import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: {
        id: id,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingItem = await prisma.item.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check if user is the campaign owner or item creator
    if (
      existingItem.createdById !== session.user.id &&
      existingItem.campaign.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, ...rest } = body

    const updateData: any = { ...rest }
    
    // Update slug if name changed
    if (name && name !== existingItem.name) {
      updateData.name = name
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    }

    const item = await prisma.item.update({
      where: { id: id },
      data: updateData,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingItem = await prisma.item.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check if user is the campaign owner or item creator
    if (
      existingItem.createdById !== session.user.id &&
      existingItem.campaign.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.item.delete({
      where: { id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
