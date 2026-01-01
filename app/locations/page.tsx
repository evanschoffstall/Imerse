'use client'

import Button from '@/components/ui/Button'
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
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please select a campaign to view locations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Locations</h1>
        <Link href={`/locations/new?campaignId=${campaignId}`}>
          <Button>Create New Location</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : locations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No locations yet. Create your first location to get started!
            </p>
            <Link href={`/locations/new?campaignId=${campaignId}`}>
              <Button>Create Location</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {buildHierarchy(locations).map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/locations/${location.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        style={{ paddingLeft: `${location.level * 1.5}rem` }}
                      >
                        {location.level > 0 && '↳ '}{location.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {location.type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {location.parent ? (
                        <Link
                          href={`/locations/${location.parent.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {location.parent.name}
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(location.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/locations/${location.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/locations/${location.id}`}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
