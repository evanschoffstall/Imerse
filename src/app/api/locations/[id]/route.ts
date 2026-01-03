import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const location = await prisma.location.findUnique({
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
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            type: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location' },
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
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingLocation = await prisma.location.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    // Check if user is the campaign owner or location creator
    if (
      existingLocation.createdById !== session.user.id &&
      existingLocation.campaign.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, parentId, ...rest } = body

    // Prevent circular hierarchy
    if (parentId === id) {
      return NextResponse.json(
        { error: 'A location cannot be its own parent' },
        { status: 400 }
      )
    }

    // Check for circular references by traversing up the hierarchy
    if (parentId) {
      let currentParentId: string | null = parentId
      const maxDepth = 100
      let depth = 0

      while (currentParentId && depth < maxDepth) {
        if (currentParentId === id) {
          return NextResponse.json(
            { error: 'Circular hierarchy detected' },
            { status: 400 }
          )
        }

        const parentLocation = await prisma.location.findUnique({
          where: { id: currentParentId },
          select: { parentId: true },
        })

        currentParentId = parentLocation?.parentId || null
        depth++
      }
    }

    const updateData: any = { ...rest }
    
    // Update slug if name changed
    if (name && name !== existingLocation.name) {
      updateData.name = name
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    }

    // Handle parent change
    if (parentId !== undefined) {
      updateData.parentId = parentId || null
    }

    const location = await prisma.location.update({
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
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
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
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingLocation = await prisma.location.findUnique({
      where: { id: id },
      include: {
        campaign: {
          select: {
            ownerId: true,
          },
        },
        children: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    // Check if user is the campaign owner or location creator
    if (
      existingLocation.createdById !== session.user.id &&
      existingLocation.campaign.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if location has children
    if (existingLocation.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete location with child locations. Delete or move children first.' },
        { status: 400 }
      )
    }

    await prisma.location.delete({
      where: { id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
