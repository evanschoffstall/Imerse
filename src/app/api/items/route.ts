import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaignId is required' },
        { status: 400 }
      )
    }
    
    const items = await prisma.item.findMany({
      where: {
        campaignId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, campaignId, createdById, ...rest } = body
    
    if (!name || !campaignId || !createdById) {
      return NextResponse.json(
        { error: 'Name, campaignId, and createdById are required' },
        { status: 400 }
      )
    }
    
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    
    const item = await prisma.item.create({
      data: {
        name,
        slug,
        campaignId,
        createdById,
        ...rest,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
