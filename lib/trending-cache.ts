"use client";

import type { TrendingVideo, VideoCategory } from "./types";
import {
  getTrendingVideos,
  getVideoCategories,
} from "./youtube";

const CACHE_PREFIX = "trend_cache_";
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 ساعات

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

export function formatCacheRemaining(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours} س ${minutes} د`;
  return `${minutes} د`;
}

export async function getCachedVideoCategories(
  regionCode: string,
  apiKeys: string[],
  referer?: string
): Promise<{ data: VideoCategory[]; fromCache: boolean }> {
  const key = categoriesKey(regionCode);
  const cached = readCache<VideoCategory[]>(key);
  if (cached) return { data: cached, fromCache: true };

  const data = await getVideoCategories(regionCode, apiKeys, referer);
  writeCache(key, data);
  return { data, fromCache: false };
}

export async function getCachedTrendingVideos(
  regionCode: string,
  apiKeys: string[],
  categoryId?: string,
  referer?: string
): Promise<{ data: TrendingVideo[]; fromCache: boolean }> {
  const key = videosKey(regionCode, categoryId ?? "");
  const cached = readCache<TrendingVideo[]>(key);
  if (cached) return { data: cached, fromCache: true };

  const data = await getTrendingVideos(
    regionCode,
    apiKeys,
    categoryId,
    referer
  );
  writeCache(key, data);
  return { data, fromCache: false };
}

export function getVideosCacheKey(regionCode: string, categoryId: string): string {
  return videosKey(regionCode, categoryId);
}
