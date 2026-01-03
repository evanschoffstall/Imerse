'use client'

import MapForm from '@/components/forms/MapForm'
import type { Map, MapFormData } from '@/types/map'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditMapPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [map, setMap] = useState<Map | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMap()
  }, [params.id])

  const fetchMap = async () => {
    try {
      const response = await fetch(`/api/maps/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch map')
      const data = await response.json()
      setMap(data.map)
    } catch (error) {
      console.error('Error fetching map:', error)
      toast.error('Failed to load map')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: MapFormData) => {
    try {
      const response = await fetch(`/api/maps/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update map')

      toast.success('Map updated successfully')
      router.push(`/maps/${params.id}`)
    } catch (error) {
      console.error('Error updating map:', error)
      toast.error('Failed to update map')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/maps/${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!map) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Map not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/maps/${map.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Map
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Map</h1>
          <MapForm
            map={map}
            campaignId={map.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
