import type { SearchFilters } from "@/lib/filters";
import type { Channel } from "@/lib/types";

export interface SearchResultPayload {
  channels: Channel[];
  totalResults: number;
}

interface CacheEntry {
  result: SearchResultPayload;
  cachedAt: number;
}

/** Default 60 minutes; override with SEARCH_CACHE_TTL_MINUTES */
function getTtlMs(): number {
  const raw = process.env.SEARCH_CACHE_TTL_MINUTES;
  const minutes = raw ? parseInt(raw, 10) : 60;
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 60) * 60 * 1000;
}

const resultCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<SearchResultPayload>>();

export function buildSearchCacheKey(
  keyword: string,
  filters: SearchFilters
): string {
  return [
    keyword.trim().toLowerCase(),
    filters.regionCode ?? "",
    filters.channelCountry ?? "",
    String(filters.periodDays ?? 30),
    filters.relevanceLanguage ?? "",
  ].join("\0");
}

export function getCachedSearch(
  key: string
): SearchResultPayload | null {
  const entry = resultCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > getTtlMs()) {
    resultCache.delete(key);
    return null;
  }
  return entry.result;
}

export function setCachedSearch(key: string, result: SearchResultPayload): void {
  resultCache.set(key, { result, cachedAt: Date.now() });
}

/**
 * Serves TTL cache hits, coalesces identical in-flight requests,
 * then stores the result for later searches.
 */
export async function withSearchCache(
  key: string,
  loader: () => Promise<SearchResultPayload>
): Promise<{ result: SearchResultPayload; fromCache: boolean }> {
  const cached = getCachedSearch(key);
  if (cached) {
    return { result: cached, fromCache: true };
  }

  const pending = inflight.get(key);
  if (pending) {
    const result = await pending;
    return { result, fromCache: true };
  }

  const promise = loader()
    .then((result) => {
      setCachedSearch(key, result);
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  const result = await promise;
  return { result, fromCache: false };
}
