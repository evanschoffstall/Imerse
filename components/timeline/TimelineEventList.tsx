'use client'

import { Button } from '@/components/ui/button'
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
    return <div className="text-center py-8">Loading events...</div>
  }

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Timeline Events</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          No events linked to this timeline yet
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          Link events to this timeline to track them chronologically.
        </p>
        <Link href={`/events/new?campaignId=${campaignId}&timelineId=${timelineId}`}>
          <Button>Create Event</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Timeline Events ({events.length})</h3>
        <Link href={`/events/new?campaignId=${campaignId}&timelineId=${timelineId}`}>
          <Button>Add Event</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <Link href={`/events/${event.id}`}>
                  <h4 className="text-lg font-semibold hover:underline">{event.name}</h4>
                </Link>
                {event.type && (
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 mt-1">
                    {event.type}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
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
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {event.description.replace(/<[^>]*>/g, '')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
