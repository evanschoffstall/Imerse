'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
            <Badge variant="secondary">Active</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Entity Types */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Entity Types</Label>
              <div className="flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={selectAllTypes}
                  className="h-auto p-0 text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearAllTypes}
                  className="h-auto p-0 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {ALL_ENTITY_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                >
                  <Checkbox
                    checked={filters.entityTypes.includes(type)}
                    onCheckedChange={() => toggleEntityType(type)}
                  />
                  <span className="text-sm">{ENTITY_TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange({ sortBy: value as any })}
              >
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="updated">Updated Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort-order">Order</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => handleFilterChange({ sortOrder: value as any })}
              >
                <SelectTrigger id="sort-order">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
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
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.includePrivate}
              onCheckedChange={(checked) => handleFilterChange({ includePrivate: Boolean(checked) })}
            />
            <span className="text-sm">Include private entities</span>
          </label>
        </div>
      )}
    </Card>
  )
}
