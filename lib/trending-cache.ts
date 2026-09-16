"use client";

import type { TrendingVideo, VideoCategory } from "./types";

const CACHE_PREFIX = "trend_cache_";
const CACHE_TTL_MS = 3 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

function categoriesKey(regionCode: string): string {
  return `${CACHE_PREFIX}categories_${regionCode}`;
}

function videosKey(regionCode: string, categoryId: string): string {
  return `${CACHE_PREFIX}videos_${regionCode}_${categoryId || "all"}`;
}

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, cachedAt: Date.now() };
  localStorage.setItem(key, JSON.stringify(entry));
}

export function getCacheRemainingMs(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    const remaining = CACHE_TTL_MS - (Date.now() - entry.cachedAt);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

export function formatCacheRemaining(
  ms: number,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return t("common.hours", { h: hours, m: minutes });
  return t("common.minutes", { m: minutes });
}

export async function getCachedVideoCategories(
  regionCode: string
): Promise<{ data: VideoCategory[]; fromCache: boolean; error?: string }> {
  const key = categoriesKey(regionCode);
  const cached = readCache<VideoCategory[]>(key);
  if (cached) return { data: cached, fromCache: true };

  const res = await fetch(`/api/trending/categories?region=${encodeURIComponent(regionCode)}`);
  const json = await res.json();
  if (!res.ok) {
    return { data: [], fromCache: false, error: json.error ?? "fetch_failed" };
  }

  const data: VideoCategory[] = json.categories ?? [];
  writeCache(key, data);
  return { data, fromCache: false };
}

export async function getCachedTrendingVideos(
  regionCode: string,
  categoryId?: string
): Promise<{ data: TrendingVideo[]; fromCache: boolean; error?: string }> {
  const key = videosKey(regionCode, categoryId ?? "");
  const cached = readCache<TrendingVideo[]>(key);
  if (cached) return { data: cached, fromCache: true };

  const params = new URLSearchParams({ region: regionCode });
  if (categoryId) params.set("category", categoryId);

  const res = await fetch(`/api/trending/videos?${params}`);
  const json = await res.json();
  if (!res.ok) {
    return { data: [], fromCache: false, error: json.error ?? "fetch_failed" };
  }

  const data: TrendingVideo[] = json.videos ?? [];
  writeCache(key, data);
  return { data, fromCache: false };
}

export function getVideosCacheKey(regionCode: string, categoryId: string): string {
  return videosKey(regionCode, categoryId);
}
