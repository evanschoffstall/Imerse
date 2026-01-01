'use client'

import Button from '@/components/ui/Button'
import InteractiveMap from '@/components/maps/InteractiveMap'
import LayerManager from '@/components/maps/LayerManager'
import MarkerManager from '@/components/maps/MarkerManager'
import type { Map, MapLayer, MapMarker, MapGroup } from '@/types/map'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function MapDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [map, setMap] = useState<Map | null>(null)
  const [layers, setLayers] = useState<MapLayer[]>([])
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [groups, setGroups] = useState<MapGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'map' | 'layers' | 'markers'>('map')

  useEffect(() => {
    fetchMap()
    fetchLayers()
    fetchMarkers()
    fetchGroups()
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

  const fetchLayers = async () => {
    try {
      const response = await fetch(`/api/maps/${params.id}/layers`)
      if (response.ok) {
        const data = await response.json()
        setLayers(data)
      }
    } catch (error) {
      console.error('Error fetching layers:', error)
    }
  }

  const fetchMarkers = async () => {
    try {
      const response = await fetch(`/api/maps/${params.id}/markers`)
      if (response.ok) {
        const data = await response.json()
        setMarkers(data)
      }
    } catch (error) {
      console.error('Error fetching markers:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch(`/api/maps/${params.id}/groups`)
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this map?')) return

    try {
      const response = await fetch(`/api/maps/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete map')

      toast.success('Map deleted successfully')
      router.push(`/maps?campaignId=${map?.campaignId}`)
    } catch (error) {
      console.error('Error deleting map:', error)
      toast.error('Failed to delete map')
    }
  }

  const handleMarkerClick = (marker: MapMarker) => {
    toast.info(`Clicked marker: ${marker.name}`)
  }

  const handleMarkerDragEnd = async (markerId: string, x: number, y: number) => {
    try {
      const response = await fetch(`/api/maps/${params.id}/markers/${markerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longitude: x, latitude: y })
      })

      if (!response.ok) throw new Error('Failed to update marker position')

      toast.success('Marker position updated')
      fetchMarkers()
    } catch (error) {
      console.error('Error updating marker:', error)
      toast.error('Failed to update marker')
    }
  }

  const handleStageClick = (x: number, y: number) => {
    toast.info(`Clicked at (${x.toFixed(1)}, ${y.toFixed(1)})`)
  }

  const refreshData = () => {
    fetchLayers()
    fetchMarkers()
    fetchGroups()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
          href={`/maps?campaignId=${map.campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Maps
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{map.name}</h1>
              <div className="flex gap-2 mb-4">
                {map.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
                    {map.type}
                  </span>
                )}
                {map.isPrivate && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    Private
                  </span>
                )}
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  {layers.length} Layers
                </span>
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                  {markers.length} Markers
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/maps/${map.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button onClick={handleDelete} variant="danger">
                Delete
              </Button>
            </div>
          </div>

          {map.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: map.description }}
              />
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${map.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {map.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {map.createdBy?.name || map.createdBy?.email}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(map.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(map.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px ${
            activeTab === 'map'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Interactive Map
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px ${
            activeTab === 'layers'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Layers ({layers.length})
        </button>
        <button
          onClick={() => setActiveTab('markers')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px ${
            activeTab === 'markers'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Markers & Groups ({markers.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <InteractiveMap
            mapImage={map.image}
            layers={layers}
            markers={markers}
            width={1200}
            height={800}
            editable={true}
            onMarkerClick={handleMarkerClick}
            onMarkerDragEnd={handleMarkerDragEnd}
            onStageClick={handleStageClick}
          />
        </div>
      )}

      {activeTab === 'layers' && (
        <LayerManager mapId={params.id} layers={layers} onUpdate={refreshData} />
      )}

      {activeTab === 'markers' && (
        <MarkerManager 
          mapId={params.id} 
          markers={markers} 
          groups={groups} 
          onUpdate={refreshData} 
        />
      )}
    </div>
  )
}
