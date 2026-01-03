"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { ENTITY_TYPE_ICONS, ENTITY_TYPE_LABELS, SearchResult } from "@/types/search"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

interface GlobalSearchProps {
  campaignId?: string
}

export default function GlobalSearch({ campaignId }: GlobalSearchProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
        setQuery("")
        setResults([])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)

    try {
      const params = new URLSearchParams({
        query: searchQuery,
        limit: "5", // Show max 5 quick results
      })

      // Add campaignId to search if available
      if (campaignId) {
        params.append('campaignId', campaignId)
      }

      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  // Handle query change with debounce
  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(0)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (value.trim()) {
      timeoutRef.current = setTimeout(() => {
        performSearch(value)
      }, 300) // 300ms debounce
    } else {
      setResults([])
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex === results.length) {
        // "See all results" option
        navigateToSearch()
      } else if (results[selectedIndex]) {
        navigateToResult(results[selectedIndex])
      }
    }
  }

  const navigateToResult = (result: SearchResult) => {
    const url = result.type === "campaign"
      ? `/campaigns/${result.id}`
      : `/${result.type}s/${result.id}`

    router.push(url)
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  const navigateToSearch = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  const truncateText = (text: string | null | undefined, length: number = 80) => {
    if (!text) return ""
    return text.length > length ? text.substring(0, length) + "..." : text
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="relative justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <Kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </Kbd>
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-4 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search entities... (use = for exact match)"
            className="w-full border-0 pl-10 pr-4 py-6 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Results */}
        {query.trim() && (
          <ScrollArea className="max-h-100 border-t">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <Spinner className="mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <>
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => navigateToResult(result)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left ${selectedIndex === index ? "bg-accent" : ""
                      }`}
                  >
                    {result.image && (
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-10 h-10 object-cover rounded shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{ENTITY_TYPE_ICONS[result.type]}</span>
                        <Badge variant="secondary" className="text-xs">
                          {ENTITY_TYPE_LABELS[result.type]}
                        </Badge>
                      </div>
                      <h4 className="font-medium truncate">{result.name}</h4>
                      {result.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {truncateText(result.description)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}

                {/* See all results */}
                <Button
                  onClick={navigateToSearch}
                  variant="ghost"
                  className={`w-full rounded-none border-t ${selectedIndex === results.length ? "bg-accent" : ""
                    }`}
                >
                  See all results for "{query}"
                </Button>
              </>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">
                  Try different keywords or use exact match (=)
                </p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="px-4 py-2 bg-muted border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <Kbd>esc</Kbd>
              close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
