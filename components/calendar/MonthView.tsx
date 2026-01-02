'use client'

import { Calendar, CalendarDate, CalendarWeather, getDaysInMonth } from '@/types/calendar'

interface MonthViewProps {
  calendar: Calendar
  year: number
  month: number // 1-based
  onDateClick?: (date: CalendarDate) => void
  currentDate?: CalendarDate | null
  weather?: CalendarWeather[]
  events?: any[] // Future: Event[] when event system is integrated
}

export default function MonthView({
  calendar,
  year,
  month,
  onDateClick,
  currentDate,
  weather = [],
  events = [],
}: MonthViewProps) {
  const daysInMonth = getDaysInMonth(month, calendar)
  const weekdays = calendar.weekdays || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthData = calendar.months?.[month - 1]

  // Calculate starting day of week (simplified - assumes startOffset)
  const startDayOfWeek = (calendar.startOffset + getDayOffset(year, month, calendar)) % weekdays.length

  // Generate calendar grid
  const calendarDays: (number | null)[] = []

  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Organize into weeks
  const weeks: (number | null)[][] = []
  for (let i = 0; i < calendarDays.length; i += weekdays.length) {
    weeks.push(calendarDays.slice(i, i + weekdays.length))
  }

  // Helper to check if date is current
  const isCurrentDate = (day: number) => {
    return currentDate &&
      currentDate.year === year &&
      currentDate.month === month &&
      currentDate.day === day
  }

  // Helper to get weather for a specific day
  const getWeatherForDay = (day: number) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return weather.find(w => w.date === dateStr)
  }

  // Helper to get weather icon
  const getWeatherIcon = (weatherType?: string) => {
    if (!weatherType) return null
    const icons: Record<string, string> = {
      clear: '☀️',
      cloudy: '☁️',
      rain: '🌧️',
      drizzle: '🌦️',
      snow: '❄️',
      sleet: '🌨️',
      hail: '🌨️',
      storm: '⛈️',
      thunderstorm: '⛈️',
      fog: '🌫️',
      mist: '🌁',
      wind: '💨',
      hot: '🌡️',
      cold: '🥶',
    }
    return icons[weatherType.toLowerCase()] || '🌤️'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Month Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">
          {monthData?.name || `Month ${month}`}, {year} {calendar.suffix || ''}
        </h2>
        {monthData?.intercalary && (
          <p className="text-sm text-blue-100 mt-1">Intercalary Month</p>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `repeat(${weekdays.length}, minmax(0, 1fr))` }}>
          {weekdays.map((day, index) => (
            <div
              key={index}
              className="text-center font-semibold text-gray-700 text-sm py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: `repeat(${weekdays.length}, minmax(0, 1fr))` }}
          >
            {week.map((day, dayIndex) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${dayIndex}`}
                    className="aspect-square bg-gray-50 rounded"
                  />
                )
              }

              const isCurrent = isCurrentDate(day)
              const dayWeather = getWeatherForDay(day)
              const weatherIcon = dayWeather ? getWeatherIcon(dayWeather.weatherType || undefined) : null

              return (
                <button
                  key={day}
                  onClick={() => onDateClick?.({ year, month, day })}
                  className={`
                    aspect-square rounded border transition-all
                    flex flex-col items-center justify-center p-1
                    hover:shadow-md hover:scale-105
                    ${isCurrent
                      ? 'bg-blue-100 border-blue-500 border-2 font-bold'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className={`text-sm ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                    {day}
                  </span>

                  {weatherIcon && (
                    <span className="text-lg mt-0.5" title={dayWeather?.weatherType || 'Weather'}>
                      {weatherIcon}
                    </span>
                  )}

                  {dayWeather?.weatherType && (
                    <span className="text-xs text-gray-600 truncate">
                      {dayWeather.weatherType}
                    </span>
                  )}

                  {/* Future: Event indicators */}
                  {events.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded" />
            <span>Current Date</span>
          </div>
          {weather.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg">☀️</span>
              <span>Weather Tracked</span>
            </div>
          )}
          {events.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Has Events</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to calculate day offset for a given year/month
// This is a simplified version - in production, you'd want more sophisticated date math
function getDayOffset(year: number, month: number, calendar: Calendar): number {
  const months = calendar.months || []
  let totalDays = 0

  // Add days from previous months in the year
  for (let m = 0; m < month - 1; m++) {
    totalDays += months[m]?.length || 30
  }

  // Add days from previous years (simplified calculation)
  const daysInYear = months.reduce((sum, m) => sum + (m.length || 30), 0)
  totalDays += (year - 1) * daysInYear

  return totalDays
}
