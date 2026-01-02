"use client"

import { ENTITY_TYPE_ICONS, ENTITY_TYPE_LABELS, SearchResult } from "@/types/search"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

export default function GlobalSearch() {
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
  }, [])

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
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search...</span>
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 rounded">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => {
          setIsOpen(false)
          setQuery("")
          setResults([])
        }}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-0 top-20 z-50 max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search entities... (use = for exact match)"
              className="w-full pl-10 pr-4 py-4 text-lg border-0 focus:outline-none focus:ring-0"
            />
          </div>

          {/* Results */}
          {query.trim() && (
            <div className="border-t border-gray-200 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <>
                  {results.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => navigateToResult(result)}
                      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${selectedIndex === index ? "bg-blue-50" : ""
                        }`}
                    >
                      {result.image && (
                        <img
                          src={result.image}
                          alt={result.name}
                          className="w-10 h-10 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{ENTITY_TYPE_ICONS[result.type]}</span>
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {ENTITY_TYPE_LABELS[result.type]}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 truncate">{result.name}</h4>
                        {result.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {truncateText(result.description)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* See all results */}
                  <button
                    onClick={navigateToSearch}
                    className={`w-full px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50 border-t border-gray-200 ${selectedIndex === results.length ? "bg-blue-50" : ""
                      }`}
                  >
                    See all results for "{query}"
                  </button>
                </>
              ) : (
                <div className="px-4 py-8 text-center text-gray-600">
                  <p>No results found for "{query}"</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try different keywords or use exact match (=)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
