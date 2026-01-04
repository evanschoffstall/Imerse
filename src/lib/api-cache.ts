/**
 * API request deduplication utilities
 * Prevents duplicate API calls during React Strict Mode double-rendering
 */

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();
const DEFAULT_TTL = 5000; // 5 seconds

/**
 * Cached fetch with automatic deduplication
 * Multiple simultaneous calls with the same key will share the same request
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options || {})}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  // Check if there's already a pending request
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  // Create new request
  const request = fetch(url, options)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    })
    .finally(() => {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    });

  // Store pending request
  pendingRequests.set(cacheKey, request);

  return request;
}

/**
 * Clear cache for a specific URL or pattern
 */
export function clearCache(urlPattern?: string) {
  if (!urlPattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(urlPattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Invalidate cache entries older than TTL
 */
export function cleanupCache(ttl: number = DEFAULT_TTL) {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > ttl) {
      cache.delete(key);
    }
  }
}

// Cleanup old cache entries every minute
if (typeof window !== "undefined") {
  setInterval(() => cleanupCache(), 60000);
}
