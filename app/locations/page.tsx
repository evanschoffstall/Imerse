'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Location } from '@/types/location'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function LocationsPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campaignId) {
      fetchLocations()
    } else {
      setLoading(false)
    }
  }, [campaignId])

  const fetchLocations = async () => {
    try {
      const response = await fetch(`/api/locations?campaignId=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch locations')
      const data = await response.json()
      setLocations(data.locations)
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(date).toLocaleDateString()
  }

  // Build hierarchy tree
  const buildHierarchy = (locs: Location[]) => {
    const map = new Map<string, Location & { level: number }>()
    locs.forEach(loc => map.set(loc.id, { ...loc, level: 0 }))

    // Calculate levels
    map.forEach(loc => {
      let level = 0
      let currentParentId = loc.parentId
      while (currentParentId && level < 10) {
        level++
        const parent = map.get(currentParentId)
        currentParentId = parent?.parentId || null
      }
      loc.level = level
    })

    // Sort by parent hierarchy and name
    return Array.from(map.values()).sort((a, b) => {
      if (a.parentId === b.parentId) return a.name.localeCompare(b.name)
      // Root items come first
      if (!a.parentId) return -1
      if (!b.parentId) return 1
      return a.level - b.level
    })
  }

  if (!campaignId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please select a campaign to view locations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Locations</h1>
        <Link href={`/locations/new?campaignId=${campaignId}`}>
          <Button>Create New Location</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : locations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No locations yet. Create your first location to get started!
              </p>
              <Link href={`/locations/new?campaignId=${campaignId}`}>
                <Button>Create Location</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildHierarchy(locations).map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <Link
                        href={`/locations/${location.id}`}
                        className="font-medium text-primary hover:underline"
                        style={{ paddingLeft: `${location.level * 1.5}rem` }}
                      >
                        {location.level > 0 && '↳ '}{location.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {location.type || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {location.parent ? (
                        <Link
                          href={`/locations/${location.parent.id}`}
                          className="text-primary hover:underline"
                        >
                          {location.parent.name}
                        </Link>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(location.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/locations/${location.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/locations/${location.id}`}
                        className="text-muted-foreground hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
