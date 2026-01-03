'use client'

import LocationForm from '@/components/forms/LocationForm'
import type { Location, LocationFormData } from '@/types/location'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditLocationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [location, setLocation] = useState<Location | null>(null)
  const [availableLocations, setAvailableLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      // Fetch location details
      const locationResponse = await fetch(`/api/locations/${params.id}`)
      if (!locationResponse.ok) throw new Error('Failed to fetch location')
      const locationData = await locationResponse.json()
      setLocation(locationData.location)

      // Fetch all locations in the campaign for parent selection
      const locationsResponse = await fetch(`/api/locations?campaignId=${locationData.location.campaignId}`)
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json()
        // Filter out current location and its descendants
        const filtered = filterDescendants(locationData.location.id, locationsData.locations)
        setAvailableLocations(filtered)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load location')
    } finally {
      setLoading(false)
    }
  }

  // Filter out location and its descendants to prevent circular references
  const filterDescendants = (currentId: string, locations: Location[]): Location[] => {
    const descendants = new Set<string>([currentId])

    const findDescendants = (parentId: string) => {
      locations.forEach(loc => {
        if (loc.parentId === parentId && !descendants.has(loc.id)) {
          descendants.add(loc.id)
          findDescendants(loc.id)
        }
      })
    }

    findDescendants(currentId)
    return locations.filter(loc => !descendants.has(loc.id))
  }

  const handleSubmit = async (data: LocationFormData) => {
    try {
      const response = await fetch(`/api/locations/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update location')
      }

      toast.success('Location updated successfully')
      router.push(`/locations/${params.id}`)
    } catch (error) {
      console.error('Error updating location:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update location')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/locations/${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Location not found</p>
          <Link href="/locations" className="text-blue-600 hover:text-blue-700">
            Back to Locations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/locations/${location.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Location
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Location</h1>
        <LocationForm
          location={location}
          campaignId={location.campaignId}
          availableLocations={availableLocations}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
