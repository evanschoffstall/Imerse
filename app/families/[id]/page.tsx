'use client'

import { Button } from '@/components/ui/button'
import type { Family } from '@/types/family'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function FamilyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFamily()
  }, [params.id])

  const fetchFamily = async () => {
    try {
      const response = await fetch(`/api/families/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch family')
      const data = await response.json()
      setFamily(data.family)
    } catch (error) {
      console.error('Error fetching family:', error)
      toast.error('Failed to load family')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this family?')) return

    try {
      const response = await fetch(`/api/families/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete family')

      toast.success('Family deleted successfully')
      router.push(`/families?campaignId=${family?.campaignId}`)
    } catch (error) {
      console.error('Error deleting family:', error)
      toast.error('Failed to delete family')
    }
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

  if (!family) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Family not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/families?campaignId=${family.campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Families
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {family.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={family.image}
              alt={family.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{family.name}</h1>
              <div className="flex gap-2 mb-4">
                {family.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {family.type}
                  </span>
                )}
                {family.location && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {family.location}
                  </span>
                )}
                {family.isPrivate && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/families/${family.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </div>
          </div>

          {family.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">History</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: family.description }}
              />
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${family.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {family.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {family.createdBy?.name || family.createdBy?.email}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(family.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(family.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
