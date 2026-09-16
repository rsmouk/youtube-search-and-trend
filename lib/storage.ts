"use client";

import type { SavedChannel } from "./types";

const API_KEYS_KEY = "youtube_api_keys";
const SEARCH_HISTORY_KEY = "search_history";
const MAX_SEARCH_HISTORY = 10;
const SUGGESTED_LAYOUT_KEY = "suggested_layout";
const ADMIN_MIN_LIKES_KEY = "admin_min_likes";

export type SuggestedLayout = "grid" | "row";

export const SEARCH_HISTORY_CHANGED = "search-history-changed";
/** @deprecated Use LIKES_CHANGED from likes-service */
export const SAVED_CHANNELS_CHANGED = "channel-likes-changed";

function notifySearchHistoryChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SEARCH_HISTORY_CHANGED));
}

export function getApiKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(API_KEYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return parsed.filter((k) => k.trim().length > 0);
  } catch {
    return [];
  }
}

export function saveApiKeys(keys: string[]): void {
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return parsed.filter((k) => k.trim().length > 0).slice(0, MAX_SEARCH_HISTORY);
  } catch {
    return [];
  }
}

export function addRecentSearch(keyword: string): void {
  const trimmed = keyword.trim();
  if (!trimmed) return;

  const filtered = getRecentSearches().filter(
    (k) => k.toLowerCase() !== trimmed.toLowerCase()
  );
  const updated = [trimmed, ...filtered].slice(0, MAX_SEARCH_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  notifySearchHistoryChange();
}

export function getSuggestedLayout(): SuggestedLayout {
  if (typeof window === "undefined") return "grid";
  try {
    const raw = localStorage.getItem(SUGGESTED_LAYOUT_KEY);
    return raw === "row" ? "row" : "grid";
  } catch {
    return "grid";
  }
}

export function saveSuggestedLayout(layout: SuggestedLayout): void {
  localStorage.setItem(SUGGESTED_LAYOUT_KEY, layout);
}

export function getAdminMinLikes(defaultValue = 2): number {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(ADMIN_MIN_LIKES_KEY);
    if (!raw) return defaultValue;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveAdminMinLikes(value: number): void {
  localStorage.setItem(ADMIN_MIN_LIKES_KEY, String(Math.max(0, value)));
}

/** Local channel saves removed — stubs kept to avoid breakages during migration. */
export function getSavedChannels(): SavedChannel[] {
  return [];
}
