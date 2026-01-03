'use client'

import LocationForm from '@/components/forms/LocationForm'
import type { Location, LocationFormData } from '@/types/location'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function NewLocationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const campaignId = searchParams.get('campaignId')
  const [availableLocations, setAvailableLocations] = useState<Location[]>([])
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
      if (response.ok) {
        const data = await response.json()
        setAvailableLocations(data.locations)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200 mb-4">
            Campaign ID is required to create a location.
          </p>
          <Link href="/campaigns" className="text-primary hover:underline">
            Go to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: LocationFormData) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a location')
      return
    }

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          campaignId,
          createdById: session.user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to create location')

      const { location } = await response.json()
      toast.success('Location created successfully')
      router.push(`/locations/${location.id}`)
    } catch (error) {
      console.error('Error creating location:', error)
      toast.error('Failed to create location')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/locations?campaignId=${campaignId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/locations?campaignId=${campaignId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Locations
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Location</h1>
          <LocationForm
            campaignId={campaignId}
            availableLocations={availableLocations}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
