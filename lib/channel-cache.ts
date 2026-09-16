"use client";

import type { Channel } from "./types";

const PREFIX = "channel_cache_";

export function cacheChannel(channel: Channel): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PREFIX + channel.id, JSON.stringify(channel));
}

export function getCachedChannel(channelId: string): Channel | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + channelId);
    if (!raw) return null;
    return JSON.parse(raw) as Channel;
  } catch {
    return null;
  }
}
