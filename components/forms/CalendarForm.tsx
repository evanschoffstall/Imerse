'use client'

import ImageUpload from '@/components/ui/ImageUpload'
import { Calendar, CalendarFormData, calendarSchema } from '@/types/calendar'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface CalendarFormProps {
  calendar?: Calendar
  mode: 'create' | 'edit'
}

export default function CalendarForm({ calendar, mode }: CalendarFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCampaignId = searchParams.get('campaignId') || calendar?.campaignId || ''

  const [formData, setFormData] = useState<CalendarFormData>({
    name: calendar?.name || '',
    slug: calendar?.slug || '',
    description: calendar?.description || '',
    image: calendar?.image || '',
    date: calendar?.date || '',
    suffix: calendar?.suffix || 'AD',
    isPrivate: calendar?.isPrivate ?? false,
    campaignId: defaultCampaignId,
    showBirthdays: calendar?.showBirthdays ?? true,
    skipYearZero: calendar?.skipYearZero ?? false,
    startOffset: calendar?.startOffset ?? 0,
    hasLeapYear: calendar?.hasLeapYear ?? false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch('/api/campaigns')
        if (response.ok) {
          const data = await response.json()
          setCampaigns(data)
        }
      } catch (err) {
        console.error('Failed to fetch campaigns:', err)
      }
    }

    fetchCampaigns()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate
      const validationResult = calendarSchema.safeParse(formData)
      if (!validationResult.success) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const url = mode === 'create' ? '/api/calendars' : `/api/calendars/${calendar?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save calendar')
      }

      const savedCalendar = await response.json()
      router.push(`/calendars/${savedCalendar.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Calendar Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL-friendly identifier)
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="auto-generated if left blank"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-1">
            Campaign *
          </label>
          <select
            id="campaign"
            value={formData.campaignId}
            onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calendar Image
          </label>
          <ImageUpload
            currentImage={formData.image}
            onImageUpload={(url) => setFormData({ ...formData, image: url || '' })}
          />
        </div>
      </div>

      {/* Current Date */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Current Date</h2>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Current Date (YYYY-MM-DD)
          </label>
          <input
            type="text"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            placeholder="e.g., 2024-03-15"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            The current date in this calendar system
          </p>
        </div>

        <div>
          <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 mb-1">
            Date Suffix
          </label>
          <input
            type="text"
            id="suffix"
            value={formData.suffix}
            onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
            placeholder="e.g., AD, BR, AL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Era suffix (e.g., "AD" for Anno Domini, "BR" for Before Ragnarok)
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
            Private (only visible to campaign members)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showBirthdays"
            checked={formData.showBirthdays}
            onChange={(e) => setFormData({ ...formData, showBirthdays: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="showBirthdays" className="ml-2 block text-sm text-gray-700">
            Show birthdays on calendar
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="skipYearZero"
            checked={formData.skipYearZero}
            onChange={(e) => setFormData({ ...formData, skipYearZero: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="skipYearZero" className="ml-2 block text-sm text-gray-700">
            Skip year zero (1 BC → 1 AD)
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Calendar' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a simplified calendar form. Advanced features like custom months,
          weekdays, seasons, moons, and leap year configuration will be available in the calendar detail view
          after creation.
        </p>
      </div>
    </form>
  )
}
