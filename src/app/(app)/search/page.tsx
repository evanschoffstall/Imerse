import { SearchFilters, SearchFiltersState } from '@/components/search/SearchFilters'
import { SearchResults } from '@/components/search/SearchResults'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { SearchResult } from '@/types/search'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q')
  const campaignIdParam = searchParams.get('campaignId')

  const [query, setQuery] = useState(queryParam || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFiltersState>({
    entityTypes: [],
    includePrivate: false,
    createdAfter: '',
    createdBefore: '',
    updatedAfter: '',
    updatedBefore: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
  })

  useEffect(() => {
    if (queryParam) {
      performSearch(queryParam)
    }
  }, [queryParam, campaignIdParam])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })

      if (campaignIdParam) {
        params.append('campaignId', campaignIdParam)
      }

      if (filters.entityTypes.length > 0) {
        params.append('entityTypes', filters.entityTypes.join(','))
      }

      if (filters.includePrivate) {
        params.append('includePrivate', 'true')
      }

      if (filters.createdAfter) {
        params.append('createdAfter', filters.createdAfter)
      }

      if (filters.createdBefore) {
        params.append('createdBefore', filters.createdBefore)
      }

      if (filters.updatedAfter) {
        params.append('updatedAfter', filters.updatedAfter)
      }

      if (filters.updatedBefore) {
        params.append('updatedBefore', filters.updatedBefore)
      }

      const response = await fetch(`/api/search?${params.toString()}`)
      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Failed to search')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const params = new URLSearchParams({ q: query })
    if (campaignIdParam) {
      params.append('campaignId', campaignIdParam)
    }
    router.push(`/search?${params.toString()}`)
  }

  const handleFiltersChange = (newFilters: SearchFiltersState) => {
    setFilters(newFilters)
    if (queryParam) {
      // Trigger new search with updated filters
      performSearch(queryParam)
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-6">Search</h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-4">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all entities..."
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>

        {/* Filters */}
        <SearchFilters onFiltersChange={handleFiltersChange} campaignId={campaignIdParam || undefined} />
      </div>

      {/* Results */}
      {queryParam ? (
        <SearchResults results={results} query={queryParam} loading={loading} />
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
            <p className="text-muted-foreground">
              Search across characters, locations, items, quests, and more
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
