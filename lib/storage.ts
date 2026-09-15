"use client";

import type { SavedChannel } from "./types";

const API_KEYS_KEY = "youtube_api_keys";
const SAVED_CHANNELS_KEY = "saved_channels";

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
}

export function removeSavedChannel(id: string): void {
  const filtered = getSavedChannels().filter((c) => c.id !== id);
  localStorage.setItem(SAVED_CHANNELS_KEY, JSON.stringify(filtered));
}

export function isChannelSaved(id: string): boolean {
  return getSavedChannels().some((c) => c.id === id);
}
