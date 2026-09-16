"use client";

import type { Channel, SavedChannel } from "./types";
import {
  ensureSiteChannel,
  getUserLikedChannels,
  getChannelLikeCount,
  isChannelLikedByUser,
  likeChannel,
  unlikeChannel,
  type SiteChannelRow,
} from "./channels-db";
import { channelToSaved } from "./channel-utils";

export const LIKES_CHANGED = "channel-likes-changed";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LIKES_CHANGED));
}

export async function fetchLikedChannels(
  userId?: string | null
): Promise<SavedChannel[]> {
  if (!userId) return [];
  return getUserLikedChannels(userId);
}

export async function fetchLikedCount(userId?: string | null): Promise<number> {
  if (!userId) return 0;
  const list = await getUserLikedChannels(userId);
  return list.length;
}

export async function checkChannelLiked(
  channelId: string,
  userId?: string | null
): Promise<boolean> {
  if (!userId) return false;
  return isChannelLikedByUser(userId, channelId);
}

export async function fetchLikeCount(channelId: string): Promise<number> {
  return getChannelLikeCount(channelId);
}

export async function toggleChannelLike(
  channel: Channel,
  userId: string,
  currentlyLiked: boolean
): Promise<{ liked: boolean; likeCount: number } | null> {
  const thumbnail =
    channel.snippet.thumbnails.medium?.url ??
    channel.snippet.thumbnails.default?.url ??
    "";

  await ensureSiteChannel(channelToSaved(channel, thumbnail));

  if (currentlyLiked) {
    const ok = await unlikeChannel(userId, channel.id);
    if (!ok) return null;
    notify();
    const likeCount = await getChannelLikeCount(channel.id);
    return { liked: false, likeCount };
  }

  const ok = await likeChannel(userId, channel.id);
  if (!ok) return null;
  notify();
  const likeCount = await getChannelLikeCount(channel.id);
  return { liked: true, likeCount };
}

export type { SiteChannelRow };
