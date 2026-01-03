'use client'

import CalendarEventList from '@/components/calendar/CalendarEventList'
import MonthEditor from '@/components/calendar/editors/MonthEditor'
import MoonEditor from '@/components/calendar/editors/MoonEditor'
import SeasonEditor from '@/components/calendar/editors/SeasonEditor'
import WeekdayEditor from '@/components/calendar/editors/WeekdayEditor'
import MonthView from '@/components/calendar/MonthView'
import WeatherManager from '@/components/calendar/WeatherManager'
import YearView from '@/components/calendar/YearView'
import { Calendar, CalendarDate, formatCalendarDate, parseCalendarDate } from '@/types/calendar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function CalendarDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [calendar, setCalendar] = useState<Calendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [view, setView] = useState<'info' | 'month' | 'year' | 'config' | 'events'>('info')
  const [configTab, setConfigTab] = useState<'months' | 'seasons' | 'moons' | 'weekdays' | 'weather'>('months')
  const [selectedMonth, setSelectedMonth] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null)
  const [saving, setSaving] = useState(false)

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this calendar? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/calendars/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete calendar')
      }

      router.push('/calendars')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete calendar')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading calendar...</div>
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

  const currentDate = parseCalendarDate(calendar.date)
  const currentYear = currentDate?.year || new Date().getFullYear()

  const handleDateClick = (date: CalendarDate) => {
    console.log('Date clicked:', date)
    // Future: Open date details modal or navigate to date view
  }

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month)
    setView('month')
  }

  const handleConfigSave = async (field: string, value: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/calendars/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) {
        throw new Error('Failed to update calendar')
      }

      const updated = await response.json()
      setCalendar(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleWeatherUpdate = async () => {
    // Refetch calendar to get updated weather
    try {
      const response = await fetch(`/api/calendars/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCalendar(data)
      }
    } catch (err) {
      console.error('Failed to refresh weather:', err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{calendar.name}</h1>
              {calendar.isPrivate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  Private
                </span>
              )}
            </div>

            {calendar.campaign && (
              <p className="text-gray-600">
                Campaign: <Link href={`/campaigns/${calendar.campaign.id}`} className="text-blue-600 hover:underline">{calendar.campaign.name}</Link>
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button asChild>
              <Link href={`/calendars/${calendar.id}/edit`}>
                Edit
              </Link>
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setView('info')}
              className={`${view === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Information
            </button>
            <button
              onClick={() => setView('year')}
              className={`${view === 'year'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Year View
            </button>
            <button
              onClick={() => setView('month')}
              className={`${view === 'month'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Month View
            </button>
            <button
              onClick={() => setView('events')}
              className={`${view === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Events & Birthdays
            </button>
            <button
              onClick={() => setView('config')}
              className={`${view === 'config'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Configure
            </button>
          </nav>
        </div>
      </div>

      {/* Calendar Views */}
      {view === 'year' && (
        <YearView
          calendar={calendar}
          year={currentYear}
          onMonthClick={handleMonthClick}
          onDateClick={handleDateClick}
          currentDate={currentDate}
          weather={calendar.weather}
        />
      )}

      {view === 'month' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => {
                if (selectedMonth > 1) {
                  setSelectedMonth(selectedMonth - 1)
                }
              }}
              disabled={selectedMonth === 1}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setView('year')}
              className="px-4 py-1 text-primary hover:underline"
            >
              View Full Year
            </button>
            <button
              onClick={() => {
                const maxMonths = calendar.months?.length || 12
                if (selectedMonth < maxMonths) {
                  setSelectedMonth(selectedMonth + 1)
                }
              }}
              disabled={selectedMonth >= (calendar.months?.length || 12)}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
          <MonthView
            calendar={calendar}
            year={currentYear}
            month={selectedMonth}
            onDateClick={handleDateClick}
            currentDate={currentDate}
            weather={calendar.weather}
          />
        </div>
      )}

      {/* Information View */}
      {view === 'info' && (
        <>
          {/* Calendar Image */}
          {calendar.image && (
            <div className="mb-8">
              <img
                src={calendar.image}
                alt={calendar.name}
                className="w-full max-w-2xl rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Current Date */}
          {currentDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Current Date</h2>
              <p className="text-2xl font-bold text-blue-900">
                {formatCalendarDate(currentDate, calendar)}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {calendar.date}
              </p>
            </div>
          )}

          {/* Description */}
          {calendar.description && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: calendar.description }}
              />
            </div>
          )}

          {/* Calendar Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Months */}
            {calendar.months && Array.isArray(calendar.months) && calendar.months.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Months</h2>
                <div className="space-y-2">
                  {calendar.months.map((month, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{month.name}</span>
                      <span className="text-gray-600">{month.length} days</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekdays */}
            {calendar.weekdays && Array.isArray(calendar.weekdays) && calendar.weekdays.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekdays</h2>
                <div className="flex flex-wrap gap-2">
                  {calendar.weekdays.map((day, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seasons */}
            {calendar.seasons && Array.isArray(calendar.seasons) && calendar.seasons.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seasons</h2>
                <div className="space-y-2">
                  {calendar.seasons.map((season, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {season.color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: season.color }}
                        />
                      )}
                      <span className="font-medium">{season.name}</span>
                      <span className="text-gray-600 text-sm">(Months {season.monthStart}-{season.monthEnd})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moons */}
            {calendar.moons && Array.isArray(calendar.moons) && calendar.moons.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Moons</h2>
                <div className="space-y-3">
                  {calendar.moons.map((moon, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {moon.color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: moon.color }}
                        />
                      )}
                      <div>
                        <span className="font-medium">{moon.name}</span>
                        <p className="text-sm text-gray-600">
                          Cycle: {moon.cycle} days (Shift: {moon.shift})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Date Suffix:</span>
                <span className="ml-2 font-medium">{calendar.suffix || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-600">Skip Year Zero:</span>
                <span className="ml-2 font-medium">{calendar.skipYearZero ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-600">Show Birthdays:</span>
                <span className="ml-2 font-medium">{calendar.showBirthdays ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-600">Leap Year:</span>
                <span className="ml-2 font-medium">{calendar.hasLeapYear ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          {/* Weather Tracking */}
          {calendar.weather && calendar.weather.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Weather Log</h2>
              <div className="space-y-3">
                {calendar.weather.slice(0, 10).map((weather) => (
                  <div key={weather.id} className="border-l-4 border-blue-400 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {weather.weatherType || 'Weather Entry'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {weather.date}
                        </p>
                      </div>
                      {weather.temperature && (
                        <span className="text-sm text-gray-600">{weather.temperature}°</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Events & Birthdays View */}
      {view === 'events' && (
        <div className="bg-white rounded-lg shadow p-6">
          <CalendarEventList
            calendarId={calendar.id}
            campaignId={calendar.campaignId}
            selectedDate={selectedDate || undefined}
          />
        </div>
      )}

      {/* Configuration View */}
      {view === 'config' && (
        <div>
          {/* Configuration Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                {['months', 'seasons', 'moons', 'weekdays', 'weather'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setConfigTab(tab as any)}
                    className={`${configTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors capitalize`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Configuration Content */}
          <div className="bg-white rounded-lg shadow p-6">
            {saving && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                Saving changes...
              </div>
            )}

            {configTab === 'months' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Month Configuration</h2>
                <MonthEditor
                  months={calendar.months || []}
                  onChange={(months) => handleConfigSave('months', months)}
                />
              </div>
            )}

            {configTab === 'seasons' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Season Configuration</h2>
                <SeasonEditor
                  seasons={calendar.seasons || []}
                  months={(calendar.months || []).map(m => ({ ...m, intercalary: m.intercalary || false }))}
                  onChange={(seasons) => handleConfigSave('seasons', seasons)}
                />
              </div>
            )}

            {configTab === 'moons' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Moon Configuration</h2>
                <MoonEditor
                  moons={calendar.moons || []}
                  onChange={(moons) => handleConfigSave('moons', moons)}
                />
              </div>
            )}

            {configTab === 'weekdays' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekday Configuration</h2>
                <WeekdayEditor
                  weekdays={calendar.weekdays || []}
                  onChange={(weekdays) => handleConfigSave('weekdays', weekdays)}
                />
              </div>
            )}

            {configTab === 'weather' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Weather Management</h2>
                <WeatherManager
                  calendarId={calendar.id}
                  weather={calendar.weather || []}
                  onUpdate={handleWeatherUpdate}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
