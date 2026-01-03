'use client'

import ImageUpload from '@/components/ui/ImageUpload'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Calendar Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL-friendly identifier)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated if left blank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign *</Label>
            <Select
              value={formData.campaignId}
              onValueChange={(value) => setFormData({ ...formData, campaignId: value })}
            >
              <SelectTrigger id="campaign">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select a campaign</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Calendar Image</Label>
            <ImageUpload
              currentImage={formData.image}
              onImageUpload={(url) => setFormData({ ...formData, image: url || '' })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Current Date (YYYY-MM-DD)</Label>
            <Input
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              placeholder="e.g., 2024-03-15"
            />
            <p className="text-sm text-muted-foreground">
              The current date in this calendar system
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suffix">Date Suffix</Label>
            <Input
              id="suffix"
              value={formData.suffix}
              onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
              placeholder="e.g., AD, BR, AL"
            />
            <p className="text-sm text-muted-foreground">
              Era suffix (e.g., "AD" for Anno Domini, "BR" for Before Ragnarok)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="isPrivate"
              checked={formData.isPrivate}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPrivate: Boolean(checked) })
              }
            />
            <span>Private (only visible to campaign members)</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="showBirthdays"
              checked={formData.showBirthdays}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showBirthdays: Boolean(checked) })
              }
            />
            <span>Show birthdays on calendar</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              id="skipYearZero"
              checked={formData.skipYearZero}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, skipYearZero: Boolean(checked) })
              }
            />
            <span>Skip year zero (1 BC → 1 AD)</span>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Calendar' : 'Save Changes'}
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a simplified calendar form. Advanced features like custom months,
            weekdays, seasons, moons, and leap year configuration will be available in the calendar detail view
            after creation.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
