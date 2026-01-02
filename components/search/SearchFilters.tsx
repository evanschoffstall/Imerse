'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ENTITY_TYPE_LABELS, EntityType } from '@/types/search'
import * as React from 'react'

export interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersState) => void
  campaignId?: string
}

export interface SearchFiltersState {
  entityTypes: EntityType[]
  includePrivate: boolean
  createdAfter: string
  createdBefore: string
  updatedAfter: string
  updatedBefore: string
  sortBy: 'relevance' | 'name' | 'updated' | 'created'
  sortOrder: 'asc' | 'desc'
}

const ALL_ENTITY_TYPES: EntityType[] = [
  'character',
  'location',
  'item',
  'quest',
  'event',
  'journal',
  'note',
  'family',
  'race',
  'organisation',
  'tag',
  'timeline',
  'map',
]

export function SearchFilters({ onFiltersChange, campaignId }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [filters, setFilters] = React.useState<SearchFiltersState>({
    entityTypes: [],
    includePrivate: false,
    createdAfter: '',
    createdBefore: '',
    updatedAfter: '',
    updatedBefore: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
  })

  const handleFilterChange = (updates: Partial<SearchFiltersState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleEntityType = (type: EntityType) => {
    const newTypes = filters.entityTypes.includes(type)
      ? filters.entityTypes.filter((t) => t !== type)
      : [...filters.entityTypes, type]
    handleFilterChange({ entityTypes: newTypes })
  }

  const selectAllTypes = () => {
    handleFilterChange({ entityTypes: ALL_ENTITY_TYPES })
  }

  const clearAllTypes = () => {
    handleFilterChange({ entityTypes: [] })
  }

  const clearFilters = () => {
    const resetFilters: SearchFiltersState = {
      entityTypes: [],
      includePrivate: false,
      createdAfter: '',
      createdBefore: '',
      updatedAfter: '',
      updatedBefore: '',
      sortBy: 'relevance',
      sortOrder: 'desc',
    }
    setFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const hasActiveFilters =
    filters.entityTypes.length > 0 ||
    filters.includePrivate ||
    filters.createdAfter ||
    filters.createdBefore ||
    filters.updatedAfter ||
    filters.updatedBefore ||
    filters.sortBy !== 'relevance'

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Filters</h3>
          {hasActiveFilters && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Entity Types */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Entity Types</label>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={selectAllTypes}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllTypes}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {ALL_ENTITY_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={filters.entityTypes.includes(type)}
                    onChange={() => toggleEntityType(type)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm">{ENTITY_TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
                <option value="created">Created Date</option>
                <option value="updated">Updated Date</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Date Filters */}
          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Created After
                </label>
                <Input
                  type="date"
                  value={filters.createdAfter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange({ createdAfter: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Created Before
                </label>
                <Input
                  type="date"
                  value={filters.createdBefore}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange({ createdBefore: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Updated After
                </label>
                <Input
                  type="date"
                  value={filters.updatedAfter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange({ updatedAfter: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Updated Before
                </label>
                <Input
                  type="date"
                  value={filters.updatedBefore}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange({ updatedBefore: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Privacy Filter */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.includePrivate}
                onChange={(e) => handleFilterChange({ includePrivate: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm">Include private entities</span>
            </label>
          </div>
        </div>
      )}
    </Card>
  )
}
