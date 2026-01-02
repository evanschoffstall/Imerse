'use client'

import CalendarForm from '@/components/forms/CalendarForm'

export default function NewCalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Calendar</h1>
        <p className="text-gray-600 mt-1">
          Create a custom calendar system for your world
        </p>
      </div>

      <div className="max-w-3xl">
        <CalendarForm mode="create" />
      </div>
    </div>
  )
}
