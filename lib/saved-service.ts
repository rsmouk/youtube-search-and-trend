"use client";

import {
  getUserSavedChannels,
  isUserChannelSaved,
  removeUserChannel,
  saveUserChannel,
} from "./channels-db";
import type { SavedChannel } from "./types";
import {
  getSavedChannels as getLocalSaved,
  getSavedCount as getLocalCount,
  isChannelSaved as isLocalSaved,
  removeSavedChannel as removeLocal,
  saveChannel as saveLocal,
  SAVED_CHANNELS_CHANGED,
} from "./storage";

function notify() {
  window.dispatchEvent(new CustomEvent(SAVED_CHANNELS_CHANGED));
}

export async function fetchSavedChannels(
  userId?: string | null
): Promise<SavedChannel[]> {
  if (userId) return getUserSavedChannels(userId);
  return getLocalSaved();
}

export async function fetchSavedCount(userId?: string | null): Promise<number> {
  if (userId) {
    const list = await getUserSavedChannels(userId);
    return list.length;
  }
  return getLocalCount();
}

export async function checkChannelSaved(
  channelId: string,
  userId?: string | null
): Promise<boolean> {
  if (userId) return isUserChannelSaved(userId, channelId);
  return isLocalSaved(channelId);
}

export async function saveChannelForUser(
  channel: SavedChannel,
  userId?: string | null
): Promise<void> {
  if (userId) {
    await saveUserChannel(userId, channel);
  } else {
    saveLocal(channel);
  }
  notify();
}

export async function removeChannelForUser(
  channelId: string,
  userId?: string | null
): Promise<void> {
  if (userId) {
    await removeUserChannel(userId, channelId);
  } else {
    removeLocal(channelId);
  }
  notify();
}
