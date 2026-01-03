'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Event } from '@/types/event'
import Link from 'next/link'
import * as React from 'react'

interface TimelineEventListProps {
  timelineId: string
  campaignId: string
}

export function TimelineEventList({ timelineId, campaignId }: TimelineEventListProps) {
  const [events, setEvents] = React.useState<Event[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(`/api/events?campaignId=${campaignId}&timelineId=${timelineId}`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Error fetching timeline events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [campaignId, timelineId])

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Timeline Events</h3>
        <p className="text-sm text-muted-foreground mb-4">
          No events linked to this timeline yet
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Link events to this timeline to track them chronologically.
        </p>
        <Button asChild>
          <Link href={`/events/new?campaignId=${campaignId}&timelineId=${timelineId}`}>
            Create Event
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Timeline Events ({events.length})</h3>
        <Button asChild>
          <Link href={`/events/new?campaignId=${campaignId}&timelineId=${timelineId}`}>
            Add Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <Link href={`/events/${event.id}`}>
                  <h4 className="text-lg font-semibold hover:underline">{event.name}</h4>
                </Link>
                {event.type && (
                  <Badge variant="secondary" className="mt-1">
                    {event.type}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
              {event.calendarDate && (
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{event.calendarDate}</span>
                  {event.calendar && (
                    <span className="text-xs">({event.calendar.name})</span>
                  )}
                </div>
              )}
              {!event.calendarDate && event.date && (
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{event.date}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description.replace(/<[^>]*>/g, '')}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
