'use client'

import { TimelineEventList } from '@/components/timeline/TimelineEventList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Timeline } from '@/types/timeline'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function TimelineDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTimeline()
  }, [params.id])

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`/api/timelines/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch timeline')
      const data = await response.json()
      setTimeline(data.timeline)
    } catch (error) {
      console.error('Error fetching timeline:', error)
      toast.error('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this timeline?')) return

    try {
      const response = await fetch(`/api/timelines/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete timeline')

      toast.success('Timeline deleted successfully')
      router.push(`/timelines?campaignId=${timeline?.campaignId}`)
    } catch (error) {
      console.error('Error deleting timeline:', error)
      toast.error('Failed to delete timeline')
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

  if (!timeline) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Timeline not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/timelines?campaignId=${timeline.campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Timelines
        </Link>
      </div>

      <Card className="overflow-hidden">
        {timeline.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={timeline.image}
              alt={timeline.name}
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
              <h1 className="text-4xl font-bold mb-2">{timeline.name}</h1>
              <div className="flex gap-2 mb-4">
                {timeline.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {timeline.type}
                  </span>
                )}
                {timeline.isPrivate && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/timelines/${timeline.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </div>
          </div>

          {timeline.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: timeline.description }}
              />
            </div>
          )}

          {(timeline.startDate || timeline.endDate) && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Timeline Range</h2>
              <div className="flex gap-4 text-sm">
                {timeline.startDate && (
                  <div>
                    <span className="font-medium">Start:</span> {timeline.startDate}
                  </div>
                )}
                {timeline.endDate && (
                  <div>
                    <span className="font-medium">End:</span> {timeline.endDate}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <TimelineEventList timelineId={timeline.id} campaignId={timeline.campaignId} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${timeline.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {timeline.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {timeline.createdBy?.name || timeline.createdBy?.email}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(timeline.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(timeline.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
