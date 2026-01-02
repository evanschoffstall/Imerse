'use client'

import { ENTITY_TYPE_LABELS, EntityType, SearchResult } from '@/types/search'
import Link from 'next/link'
import * as React from 'react'

export interface SearchResultsProps {
  results: SearchResult[]
  query: string
  loading?: boolean
}

const ENTITY_ICONS: Record<EntityType, string> = {
  campaign: '📚',
  character: '👤',
  location: '📍',
  item: '⚔️',
  quest: '🎯',
  event: '📅',
  journal: '📔',
  note: '📝',
  family: '👨‍👩‍👧‍👦',
  race: '🧬',
  organisation: '🏛️',
  tag: '🏷️',
  timeline: '📊',
  map: '🗺️',
}

const ENTITY_COLORS: Record<EntityType, string> = {
  campaign: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  character: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  location: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  item: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  quest: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  event: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  journal: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  note: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  family: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  race: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  organisation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  tag: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  timeline: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  map: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
}

function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query || !text) return text

  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

function getEntityPath(result: SearchResult): string {
  const pluralMap: Record<EntityType, string> = {
    campaign: 'campaigns',
    character: 'characters',
    location: 'locations',
    item: 'items',
    quest: 'quests',
    event: 'events',
    journal: 'journals',
    note: 'notes',
    family: 'families',
    race: 'races',
    organisation: 'organisations',
    tag: 'tags',
    timeline: 'timelines',
    map: 'maps',
  }
  return `/${pluralMap[result.type]}/${result.id}`
}

function truncateDescription(text: string | null, maxLength: number = 200): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function SearchResults({ results, query, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search query or filters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Found {results.length} {results.length === 1 ? 'result' : 'results'}
      </div>
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={getEntityPath(result)}
          className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{ENTITY_ICONS[result.type]}</span>
            <div className="flex-grow min-w-0">
              {/* Entity Type Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${ENTITY_COLORS[result.type]
                    }`}
                >
                  {ENTITY_TYPE_LABELS[result.type]}
                </span>
              </div>

              {/* Name */}
              <h3 className="text-lg font-semibold mb-2 truncate">
                {highlightMatches(result.name, query)}
              </h3>

              {/* Description */}
              {result.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                  {highlightMatches(truncateDescription(result.description), query)}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-500">
                <span>Created: {new Date(result.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(result.updatedAt).toLocaleDateString()}</span>
                {result.campaign && (
                  <span className="flex items-center gap-1">
                    📚 {result.campaign.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
