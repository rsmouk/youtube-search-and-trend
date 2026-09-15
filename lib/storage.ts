"use client";

import type { SavedChannel } from "./types";

const API_KEYS_KEY = "youtube_api_keys";
const SAVED_CHANNELS_KEY = "saved_channels";
const SEARCH_HISTORY_KEY = "search_history";
const MAX_SEARCH_HISTORY = 10;

export const SAVED_CHANNELS_CHANGED = "saved-channels-changed";
export const SEARCH_HISTORY_CHANGED = "search-history-changed";

function notifySavedChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SAVED_CHANNELS_CHANGED));
}

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

export function getSavedChannels(): SavedChannel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_CHANNELS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedChannel[];
  } catch {
    return [];
  }
}

export function saveChannel(channel: SavedChannel): void {
  const existing = getSavedChannels();
  if (existing.some((c) => c.id === channel.id)) return;
  localStorage.setItem(
    SAVED_CHANNELS_KEY,
    JSON.stringify([channel, ...existing])
  );
  notifySavedChange();
}

export function removeSavedChannel(id: string): void {
  const filtered = getSavedChannels().filter((c) => c.id !== id);
  localStorage.setItem(SAVED_CHANNELS_KEY, JSON.stringify(filtered));
  notifySavedChange();
}

export function getSavedCount(): number {
  return getSavedChannels().length;
}

export function isChannelSaved(id: string): boolean {
  return getSavedChannels().some((c) => c.id === id);
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
