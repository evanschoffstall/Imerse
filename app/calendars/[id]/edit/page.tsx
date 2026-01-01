'use client'

import CalendarForm from '@/components/forms/CalendarForm'
import { Calendar } from '@/types/calendar'
import { useEffect, useState } from 'react'

export default function EditCalendarPage({ params }: { params: { id: string } }) {
  const [calendar, setCalendar] = useState<Calendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const response = await fetch(`/api/calendars/${params.id}`)

        if (!response.ok) {
          throw new Error('Failed to fetch calendar')
        }

        const data = await response.json()
        setCalendar(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCalendar()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading calendar...</div>
        </div>
      </div>
    )
  }

  if (error || !calendar) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || 'Calendar not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Calendar</h1>
        <p className="text-gray-600 mt-1">
          Update {calendar.name}
        </p>
      </div>

      <div className="max-w-3xl">
        <CalendarForm mode="edit" calendar={calendar} />
      </div>
    </div>
  )
}
