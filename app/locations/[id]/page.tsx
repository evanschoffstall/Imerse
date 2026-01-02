'use client'

import { Button } from '@/components/ui/button'
import Dialog from '@/components/ui/dialog-legacy'
import type { Location } from '@/types/location'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function LocationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchLocation()
  }, [params.id])

  const fetchLocation = async () => {
    try {
      const response = await fetch(`/api/locations/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch location')
      const data = await response.json()
      setLocation(data.location)
    } catch (error) {
      console.error('Error fetching location:', error)
      toast.error('Failed to load location')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/locations/${params.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete location')
      }

      toast.success('Location deleted successfully')
      router.push('/locations')
    } catch (error) {
      console.error('Error deleting location:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete location')
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Location not found</p>
          <Link href="/locations">
            <Button>Back to Locations</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/locations" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Locations
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {location.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={location.image}
              alt={location.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{location.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {location.type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {location.type}
                  </span>
                )}
                {location.isPrivate && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Link href={`/locations/${location.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Hierarchy Information */}
          {location.parent && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Parent Location
              </h3>
              <Link
                href={`/locations/${location.parent.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {location.parent.name}
              </Link>
            </div>
          )}

          {location.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: location.description }}
              />
            </div>
          )}

          {location.mapImage && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Map</h2>
              <div className="relative w-full min-h-[400px] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                <NextImage
                  src={location.mapImage}
                  alt={`Map of ${location.name}`}
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Child Locations */}
          {location.children && location.children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Sub-Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {location.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/locations/${child.id}`}
                    className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {child.name}
                    </h3>
                    {child.type && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {child.type}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${location.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {location.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span> {location.createdBy?.name}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(location.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last updated:</span>{' '}
                {new Date(location.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Location"
      >
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete "{location.name}"?
          {location.children && location.children.length > 0 && (
            <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
              This location has {location.children.length} sub-location(s).
              You must delete or move them first.
            </span>
          )}
        </p>
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || (location.children && location.children.length > 0)}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
