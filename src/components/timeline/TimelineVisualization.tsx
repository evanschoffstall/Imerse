'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Timeline } from '@/types/timeline'
import { useRef, useState } from 'react'

interface TimelineEvent {
  id: string
  name: string
  date?: string
  year?: number
  description?: string
  color?: string
  type?: string
}

interface TimelineEra {
  name: string
  startYear: number
  endYear?: number
  color?: string
}

interface TimelineVisualizationProps {
  timeline: Timeline
  events?: TimelineEvent[]
  eras?: TimelineEra[]
  onEventClick?: (event: TimelineEvent) => void
  onEraClick?: (era: TimelineEra) => void
}

export default function TimelineVisualization({
  timeline,
  events = [],
  eras = [],
  onEventClick,
  onEraClick,
}: TimelineVisualizationProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate year range
  const allYears = [
    ...events.map(e => e.year).filter(y => y !== undefined) as number[],
    ...eras.map(e => e.startYear),
    ...eras.map(e => e.endYear).filter(y => y !== undefined) as number[],
  ]

  const minYear = allYears.length > 0 ? Math.min(...allYears) - 10 : 0
  const maxYear = allYears.length > 0 ? Math.max(...allYears) + 10 : 100
  const yearRange = maxYear - minYear

  // Pixel width per year (base scale)
  const pixelsPerYear = 50 * zoom

  // Convert year to x position
  const yearToX = (year: number) => {
    return ((year - minYear) / yearRange) * (yearRange * pixelsPerYear) + pan
  }

  // Handle zoom
  const handleZoomIn = () => setZoom(Math.min(zoom * 1.5, 5))
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.5, 0.2))
  const handleResetZoom = () => {
    setZoom(1)
    setPan(0)
  }

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX - pan)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan(e.clientX - dragStart)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Get era for a year
  const getEraForYear = (year: number) => {
    return eras.find(era => year >= era.startYear && (era.endYear === undefined || year <= era.endYear))
  }

  // Group events by decade for better visualization
  const decades = new Map<number, TimelineEvent[]>()
  events.forEach(event => {
    if (event.year !== undefined) {
      const decade = Math.floor(event.year / 10) * 10
      if (!decades.has(decade)) {
        decades.set(decade, [])
      }
      decades.get(decade)!.push(event)
    }
  })

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">{timeline.name}</h2>
        {timeline.description && (
          <p className="text-sm text-purple-100 mt-1">{timeline.description}</p>
        )}
      </div>

      {/* Controls */}
      <div className="border-b border-gray-200 px-6 py-3 bg-muted flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          <span className="ml-4 text-sm text-muted-foreground">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{events.length}</span> events • <span className="font-medium">{eras.length}</span> eras
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto overflow-y-hidden"
        style={{ height: '500px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative"
          style={{
            width: `${yearRange * pixelsPerYear}px`,
            height: '100%',
            minWidth: '100%',
          }}
        >
          {/* Era Backgrounds */}
          {eras.map((era, index) => {
            const startX = yearToX(era.startYear)
            const endX = era.endYear ? yearToX(era.endYear) : yearToX(maxYear)
            const width = endX - startX

            return (
              <div
                key={index}
                className="absolute top-0 bottom-0 opacity-20 hover:opacity-30 transition-opacity cursor-pointer"
                style={{
                  left: `${startX}px`,
                  width: `${width}px`,
                  backgroundColor: era.color || '#3b82f6',
                }}
                onClick={() => onEraClick?.(era)}
                title={era.name}
              />
            )
          })}

          {/* Timeline Axis */}
          <div
            className="absolute top-1/2 w-full h-1 bg-gray-300"
            style={{ transform: 'translateY(-50%)' }}
          />

          {/* Year Markers */}
          {Array.from({ length: Math.ceil(yearRange / 10) + 1 }, (_, i) => {
            const year = minYear + i * 10
            const x = yearToX(year)

            return (
              <div
                key={year}
                className="absolute top-1/2"
                style={{ left: `${x}px`, transform: 'translateY(-50%)' }}
              >
                <div className="w-px h-4 bg-gray-400" />
                <div className="text-xs text-gray-600 mt-1 whitespace-nowrap">
                  {year}
                </div>
              </div>
            )
          })}

          {/* Events */}
          {events.map((event, index) => {
            if (event.year === undefined) return null

            const x = yearToX(event.year)
            const era = getEraForYear(event.year)
            const isAbove = index % 2 === 0

            return (
              <div
                key={event.id}
                className={`absolute ${isAbove ? 'bottom-1/2' : 'top-1/2'}`}
                style={{ left: `${x}px`, transform: `translateX(-50%) ${isAbove ? 'translateY(-20px)' : 'translateY(20px)'}` }}
              >
                {/* Connector Line */}
                <div
                  className="absolute left-1/2 bg-gray-400"
                  style={{
                    width: '2px',
                    height: '30px',
                    [isAbove ? 'bottom' : 'top']: '0',
                    transform: 'translateX(-50%)',
                  }}
                />

                {/* Event Card */}
                <div
                  className={`
                    bg-white border-2 rounded-lg shadow-md p-3 cursor-pointer
                    hover:shadow-lg hover:scale-105 transition-all
                    ${isAbove ? 'mb-8' : 'mt-8'}
                  `}
                  style={{
                    borderColor: event.color || era?.color || '#3b82f6',
                    minWidth: '150px',
                    maxWidth: '200px',
                  }}
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="font-semibold text-sm text-gray-900 mb-1">
                    {event.name}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {event.year}
                  </div>
                  {event.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </div>
                  )}
                  {event.type && (
                    <div className="mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {event.type}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      {eras.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4 bg-muted">
          <h3 className="text-sm font-semibold mb-2">Eras</h3>
          <div className="flex flex-wrap gap-3">
            {eras.map((era, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onEraClick?.(era)}
                className="gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: era.color || '#3b82f6' }}
                />
                <span>{era.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({era.startYear}{era.endYear ? ` - ${era.endYear}` : '+'})
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card className="border-t border-blue-200 bg-blue-50 rounded-none">
        <CardContent className="p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Click and drag to pan the timeline. Use zoom controls to adjust the view scale.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
