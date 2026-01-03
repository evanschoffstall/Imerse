'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

const ENTITY_BADGE_VARIANTS: Record<EntityType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  campaign: 'default',
  character: 'secondary',
  location: 'outline',
  item: 'default',
  quest: 'secondary',
  event: 'destructive',
  journal: 'default',
  note: 'outline',
  family: 'secondary',
  race: 'outline',
  organisation: 'default',
  tag: 'secondary',
  timeline: 'default',
  map: 'outline',
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
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-1/4 mb-3" />
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search query or filters
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Found {results.length} {results.length === 1 ? 'result' : 'results'}
      </div>
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={getEntityPath(result)}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{ENTITY_ICONS[result.type]}</span>
              <div className="grow min-w-0">
                {/* Entity Type Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={ENTITY_BADGE_VARIANTS[result.type]}>
                    {ENTITY_TYPE_LABELS[result.type]}
                  </Badge>
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold mb-2 truncate">
                  {highlightMatches(result.name, query)}
                </h3>

                {/* Description */}
                {result.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {highlightMatches(truncateDescription(result.description), query)}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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
          </Card>
        </Link>
      ))}
    </div>
  )
}
