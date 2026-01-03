'use client'

import TimelineForm from '@/components/forms/TimelineForm'
import type { TimelineFormData } from '@/types/timeline'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function NewTimelinePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200 mb-4">
            Campaign ID is required to create a timeline.
          </p>
          <Link href="/campaigns" className="text-primary hover:underline">
            Go to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: TimelineFormData) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a timeline')
      return
    }

    try {
      const response = await fetch('/api/timelines', {
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

      if (!response.ok) throw new Error('Failed to create timeline')

      const { timeline } = await response.json()
      toast.success('Timeline created successfully')
      router.push(`/timelines/${timeline.id}`)
    } catch (error) {
      console.error('Error creating timeline:', error)
      toast.error('Failed to create timeline')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/timelines?campaignId=${campaignId}`)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/timelines?campaignId=${campaignId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Timelines
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Timeline</h1>
          <TimelineForm
            campaignId={campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
