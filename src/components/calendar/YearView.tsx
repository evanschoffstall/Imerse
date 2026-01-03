'use client'

import { Calendar, CalendarDate, CalendarWeather } from '@/types/calendar'

interface YearViewProps {
  calendar: Calendar
  year: number
  onMonthClick?: (month: number) => void
  onDateClick?: (date: CalendarDate) => void
  currentDate?: CalendarDate | null
  weather?: CalendarWeather[]
}

export default function YearView({
  calendar,
  year,
  onMonthClick,
  onDateClick,
  currentDate,
  weather = [],
}: YearViewProps) {
  const months = calendar.months || []
  const seasons = calendar.seasons || []
  const moons = calendar.moons || []

  // Helper to get season for a month
  const getSeasonForMonth = (monthIndex: number) => {
    // Find the season that contains this month
    const month = monthIndex + 1
    return seasons.find(season => {
      return month >= season.monthStart && month <= season.monthEnd
    }) || null
  }

  // Helper to check if date is current
  const isCurrentMonth = (monthIndex: number) => {
    return currentDate && currentDate.year === year && currentDate.month === monthIndex + 1
  }

  // Helper to count weather entries for a month
  const getWeatherCountForMonth = (monthIndex: number) => {
    const month = monthIndex + 1
    return weather.filter(w => {
      if (!w.date) return false
      const [y, m] = w.date.split('-').map(Number)
      return y === year && m === month
    }).length
  }

  // Helper to get moon phase for a month (simplified)
  const getMoonPhaseForMonth = (monthIndex: number) => {
    if (moons.length === 0) return null
    // Simplified: show first moon's phase at month start
    const moon = moons[0]
    const daysIntoYear = months.slice(0, monthIndex).reduce((sum, m) => sum + m.length, 0)
    const phase = (daysIntoYear + moon.shift) % moon.cycle
    const halfCycle = moon.cycle / 2

    if (phase < 2) return '🌑' // New moon
    if (phase < halfCycle / 2 - 2) return '🌒' // Waxing crescent
    if (phase < halfCycle / 2 + 2) return '🌓' // First quarter
    if (phase < halfCycle - 2) return '🌔' // Waxing gibbous
    if (phase < halfCycle + 2) return '🌕' // Full moon
    if (phase < halfCycle + halfCycle / 2 - 2) return '🌖' // Waning gibbous
    if (phase < halfCycle + halfCycle / 2 + 2) return '🌗' // Last quarter
    return '🌘' // Waning crescent
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Year Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <h2 className="text-3xl font-bold">
          {year} {calendar.suffix || ''}
        </h2>
        <p className="text-sm text-blue-100 mt-1">
          {months.length} months • {months.reduce((sum, m) => sum + m.length, 0)} days
        </p>
      </div>

      {/* Seasons Legend */}
      {seasons.length > 0 && (
        <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-medium text-gray-700">Seasons:</span>
            {seasons.map((season, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {season.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: season.color }}
                  />
                )}
                <span className="text-sm text-gray-600">{season.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Months Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month, index) => {
            const season = getSeasonForMonth(index)
            const isCurrent = isCurrentMonth(index)
            const weatherCount = getWeatherCountForMonth(index)
            const moonPhase = getMoonPhaseForMonth(index)

            return (
              <button
                key={index}
                onClick={() => onMonthClick?.(index + 1)}
                className={`
                  rounded-lg border-2 p-4 transition-all
                  hover:shadow-lg hover:scale-105
                  ${isCurrent
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                  }
                `}
                style={{
                  borderLeftColor: season?.color || undefined,
                  borderLeftWidth: season?.color ? '6px' : undefined,
                }}
              >
                {/* Month Number */}
                <div className="text-xs text-gray-500 mb-1">Month {index + 1}</div>

                {/* Month Name */}
                <div className={`font-bold text-lg mb-2 ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                  {month.name}
                </div>

                {/* Month Details */}
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    {month.length} days
                  </div>

                  {month.intercalary && (
                    <div className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                      Intercalary
                    </div>
                  )}

                  {/* Season Indicator */}
                  {season && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {season.color && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: season.color }}
                        />
                      )}
                      {season.name}
                    </div>
                  )}

                  {/* Moon Phase */}
                  {moonPhase && (
                    <div className="text-2xl mt-1" title={`${moons[0]?.name || 'Moon'} phase`}>
                      {moonPhase}
                    </div>
                  )}

                  {/* Weather Count */}
                  {weatherCount > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      ☀️ {weatherCount} weather {weatherCount === 1 ? 'entry' : 'entries'}
                    </div>
                  )}

                  {/* Current Month Indicator */}
                  {isCurrent && (
                    <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded mt-1">
                      Current
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Moons Info */}
      {moons.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Moons</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {moons.map((moon, index) => (
              <div key={index} className="flex items-center gap-2">
                {moon.color && (
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: moon.color }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {moon.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    Cycle: {moon.cycle} days
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year Statistics */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {months.length}
            </div>
            <div className="text-xs text-gray-600">Months</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {months.reduce((sum, m) => sum + m.length, 0)}
            </div>
            <div className="text-xs text-gray-600">Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {seasons.length}
            </div>
            <div className="text-xs text-gray-600">Seasons</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {moons.length}
            </div>
            <div className="text-xs text-gray-600">Moons</div>
          </div>
        </div>
      </div>
    </div>
  )
}
