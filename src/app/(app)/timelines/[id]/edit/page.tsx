'use client'

import TimelineForm from '@/components/forms/TimelineForm'
import type { Timeline, TimelineFormData } from '@/types/timeline'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditTimelinePage({ params }: { params: { id: string } }) {
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

  const handleSubmit = async (data: TimelineFormData) => {
    try {
      const response = await fetch(`/api/timelines/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update timeline')

      toast.success('Timeline updated successfully')
      router.push(`/timelines/${params.id}`)
    } catch (error) {
      console.error('Error updating timeline:', error)
      toast.error('Failed to update timeline')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/timelines/${params.id}`)
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
          href={`/timelines/${timeline.id}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Timeline
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Timeline</h1>
          <TimelineForm
            timeline={timeline}
            campaignId={timeline.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
