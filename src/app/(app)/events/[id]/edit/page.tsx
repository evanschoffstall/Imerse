'use client'

import EventForm from '@/components/forms/EventForm'
import type { Event, EventFormData } from '@/types/event'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch event')
      const data = await response.json()
      setEvent(data.event)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: EventFormData) => {
    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update event')

      toast.success('Event updated successfully')
      router.push(`/events/${params.id}`)
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/events/${params.id}`)
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

  if (!event) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Event not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/events/${event.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Event
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
          <EventForm
            event={event}
            campaignId={event.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
