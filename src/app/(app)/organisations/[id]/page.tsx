'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Organisation } from '@/types/organisation'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function OrganisationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganisation()
  }, [params.id])

  const fetchOrganisation = async () => {
    try {
      const response = await fetch(`/api/organisations/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch organisation')
      const data = await response.json()
      setOrganisation(data.organisation)
    } catch (error) {
      console.error('Error fetching organisation:', error)
      toast.error('Failed to load organisation')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this organisation?')) return

    try {
      const response = await fetch(`/api/organisations/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete organisation')

      toast.success('Organisation deleted successfully')
      router.push(`/organisations?campaignId=${organisation?.campaignId}`)
    } catch (error) {
      console.error('Error deleting organisation:', error)
      toast.error('Failed to delete organisation')
    }
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

  if (!organisation) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Organisation not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/organisations?campaignId=${organisation.campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Organisations
        </Link>
      </div>

      <Card className="overflow-hidden">
        {organisation.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={organisation.image}
              alt={organisation.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{organisation.name}</h1>
              <div className="flex gap-2 mb-4">
                {organisation.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    {organisation.type}
                  </span>
                )}
                {organisation.location && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {organisation.location}
                  </span>
                )}
                {organisation.isPrivate && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/organisations/${organisation.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </div>
          </div>

          {organisation.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: organisation.description }}
              />
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${organisation.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {organisation.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {organisation.createdBy?.name || organisation.createdBy?.email}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(organisation.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(organisation.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
