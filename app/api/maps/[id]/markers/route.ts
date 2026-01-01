import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/maps/[id]/markers - List all markers for a map
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
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')

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

    // Build where clause
    const where: any = { mapId }
    if (groupId) {
      where.groupId = groupId
    }

    // Get all markers for this map
    const markers = await prisma.mapMarker.findMany({
      where,
      include: {
        group: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return Response.json(markers)
  } catch (error) {
    console.error('Error fetching map markers:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/maps/[id]/markers - Create a new marker
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

    const marker = await prisma.mapMarker.create({
      data: {
        mapId,
        name: body.name,
        entry: body.entry,
        longitude: body.longitude,
        latitude: body.latitude,
        shape: body.shape ?? 'marker',
        size: body.size ?? 1,
        colour: body.colour ?? '#ff0000',
        fontColour: body.fontColour ?? '#ffffff',
        icon: body.icon,
        customIcon: body.customIcon,
        customShape: body.customShape,
        opacity: body.opacity ?? 1.0,
        circleRadius: body.circleRadius,
        polygonStyle: body.polygonStyle,
        isDraggable: body.isDraggable ?? false,
        isPopupless: body.isPopupless ?? false,
        pinSize: body.pinSize,
        css: body.css,
        entityId: body.entityId,
        entityType: body.entityType,
        isPrivate: body.isPrivate ?? false,
        groupId: body.groupId,
        createdById: session.user.id
      },
      include: {
        group: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    })

    return Response.json(marker, { status: 201 })
  } catch (error) {
    console.error('Error creating map marker:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
