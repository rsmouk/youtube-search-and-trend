"use client";

import type { SearchFilters } from "@/lib/filters";
import type { Channel } from "@/lib/types";

const SEARCH_SESSION_KEY = "home_search_session_v1";

export interface HomeSearchSession {
  keyword: string;
  searchedKeyword: string;
  channels: Channel[];
  filters: SearchFilters;
  hasSearched: boolean;
  searchKey: string;
}

export function saveHomeSearchSession(state: HomeSearchSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SEARCH_SESSION_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function loadHomeSearchSession(): HomeSearchSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SEARCH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HomeSearchSession;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.channels)) return null;
    return parsed;
  } catch {
    return null;
  }
}
