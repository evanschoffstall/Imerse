import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/maps/[id]/groups - List all groups for a map
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mapId = params.id

    // Get map to check campaign access
    const map = await prisma.map.findUnique({
      where: { id: mapId },
      select: { campaignId: true }
    })

    if (!map) {
      return Response.json({ error: 'Map not found' }, { status: 404 })
    }

    // Check campaign permission
    const canView = await hasPermission(
      map.campaignId,
      session.user.id,
      'VIEW_ENTITIES'
    )
    if (!canView) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all groups for this map, ordered by position
    const groups = await prisma.mapGroup.findMany({
      where: { mapId },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true }
        },
        markers: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { position: 'asc' }
    })

    return Response.json(groups)
  } catch (error) {
    console.error('Error fetching map groups:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/maps/[id]/groups - Create a new group
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mapId = params.id

    // Get map to check campaign access
    const map = await prisma.map.findUnique({
      where: { id: mapId },
      select: { campaignId: true }
    })

    if (!map) {
      return Response.json({ error: 'Map not found' }, { status: 404 })
    }

    // Check campaign permission
    const canEdit = await hasPermission(
      map.campaignId,
      session.user.id,
      'CREATE_ENTITIES'
    )
    if (!canEdit) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    const group = await prisma.mapGroup.create({
      data: {
        mapId,
        name: body.name,
        position: body.position ?? 0,
        isShown: body.isShown ?? true,
        isPrivate: body.isPrivate ?? false,
        parentId: body.parentId,
        createdById: session.user.id
      },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true }
        },
        markers: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    })

    return Response.json(group, { status: 201 })
  } catch (error) {
    console.error('Error creating map group:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
