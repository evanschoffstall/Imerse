'use client'

import { Calendar } from '@/types/calendar'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function CalendarsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCalendars() {
      try {
        const url = campaignId
          ? `/api/calendars?campaignId=${campaignId}`
          : '/api/calendars'
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Failed to fetch calendars')
        }

        const data = await response.json()
        setCalendars(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCalendars()
  }, [campaignId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading calendars...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendars</h1>
          <p className="text-gray-600 mt-1">
            Manage your world's custom calendars, timekeeping systems, and weather
          </p>
        </div>
        <Button asChild>
          <Link href={campaignId ? `/calendars/new?campaignId=${campaignId}` : '/calendars/new'}>
            Create Calendar
          </Link>
        </Button>
      </div>

      {calendars.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No calendars</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new calendar for your world.
          </p>
          <div className="mt-6">
            <Link
              href={campaignId ? `/calendars/new?campaignId=${campaignId}` : '/calendars/new'}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Calendar
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendars.map((calendar) => (
            <Link
              key={calendar.id}
              href={`/calendars/${calendar.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {calendar.image && (
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={calendar.image}
                      alt={calendar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {calendar.name}
                    </h3>
                    {calendar.isPrivate && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        Private
                      </span>
                    )}
                  </div>

                  {calendar.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {calendar.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {calendar.date && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        📅 {calendar.date}
                      </span>
                    )}
                    {calendar.months && Array.isArray(calendar.months) && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        {calendar.months.length} months
                      </span>
                    )}
                    {calendar.moons && Array.isArray(calendar.moons) && calendar.moons.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        🌙 {calendar.moons.length} moons
                      </span>
                    )}
                  </div>

                  {calendar.campaign && (
                    <div className="text-sm text-muted-foreground">
                      Campaign: {calendar.campaign.name}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
