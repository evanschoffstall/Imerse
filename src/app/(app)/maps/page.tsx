'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Map } from '@/types/map'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function MapsPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [maps, setMaps] = useState<Map[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campaignId) {
      fetchMaps()
    } else {
      setLoading(false)
    }
  }, [campaignId])

  const fetchMaps = async () => {
    try {
      const response = await fetch(`/api/maps?campaignId=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch maps')
      const data = await response.json()
      setMaps(data.maps)
    } catch (error) {
      console.error('Error fetching maps:', error)
      toast.error('Failed to load maps')
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

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert>
          <AlertDescription>
            Please select a campaign to view maps.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Maps</h1>
        <Link href={`/maps/new?campaignId=${campaignId}`}>
          <Button>Create New Map</Button>
        </Link>
      </div>

      <Card>
        {loading ? (
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        ) : maps.length === 0 ? (
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              No maps yet. Create your first map to start mapping!
            </p>
            <Link href={`/maps/new?campaignId=${campaignId}`}>
              <Button>Create Map</Button>
            </Link>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maps.map((map) => (
                <TableRow key={map.id}>
                  <TableCell>
                    <Link
                      href={`/maps/${map.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {map.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {map.type || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(map.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/maps/${map.id}/edit`}
                      className="text-primary hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/maps/${map.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
