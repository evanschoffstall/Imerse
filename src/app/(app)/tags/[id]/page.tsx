'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Tag } from '@/types/tag'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function TagDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tag, setTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTag()
  }, [params.id])

  const fetchTag = async () => {
    try {
      const response = await fetch(`/api/tags/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch tag')
      const data = await response.json()
      setTag(data.tag)
    } catch (error) {
      console.error('Error fetching tag:', error)
      toast.error('Failed to load tag')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      const response = await fetch(`/api/tags/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete tag')

      toast.success('Tag deleted successfully')
      router.push(`/tags?campaignId=${tag?.campaignId}`)
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Failed to delete tag')
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

  if (!tag) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Tag not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/tags?campaignId=${tag.campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Tags
        </Link>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {tag.color && (
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                <h1 className="text-4xl font-bold">{tag.name}</h1>
              </div>
              <div className="flex gap-2 mb-4">
                {tag.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {tag.type}
                  </span>
                )}
                {tag.isPrivate && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/tags/${tag.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </div>
          </div>

          {tag.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: tag.description }}
              />
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${tag.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {tag.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {tag.createdBy?.name || tag.createdBy?.email}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(tag.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(tag.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
