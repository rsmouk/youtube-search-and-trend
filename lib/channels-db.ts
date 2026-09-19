import type { Channel, SavedChannel } from "./types";
import { createClient, isSupabaseConfigured } from "./supabase/client";

export interface SiteChannelRow {
  id: string;
  channel_id: string;
  title: string;
  thumbnail_url: string | null;
  subscriber_count: string | null;
  description: string | null;
  custom_url: string | null;
  country: string | null;
  language: string | null;
  view_count: string | null;
  video_count: string | null;
  hidden_subscriber_count: boolean | null;
  featured: boolean;
  search_count: number;
  like_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

export interface ChannelFilters {
  country?: string;
  language?: string;
  featured?: boolean;
  search?: string;
  minLikes?: number;
}

function channelToPayload(channel: Channel, language?: string) {
  const thumbnail =
    channel.snippet.thumbnails.medium?.url ??
    channel.snippet.thumbnails.default?.url ??
    null;

  return {
    channel_id: channel.id,
    title: channel.snippet.title,
    thumbnail_url: thumbnail,
    subscriber_count: channel.statistics.subscriberCount ?? "0",
    description: channel.snippet.description ?? "",
    custom_url: channel.snippet.customUrl ?? null,
    country: channel.snippet.country ?? null,
    language: language || null,
    view_count: channel.statistics.viewCount ?? "0",
    video_count: channel.statistics.videoCount ?? "0",
    hidden_subscriber_count: channel.statistics.hiddenSubscriberCount ?? false,
  };
}

export function siteRowToChannel(row: SiteChannelRow): Channel {
  return {
    id: row.channel_id,
    snippet: {
      title: row.title,
      description: row.description ?? "",
      customUrl: row.custom_url ?? undefined,
      publishedAt: row.first_seen_at,
      country: row.country ?? undefined,
      thumbnails: {
        medium: row.thumbnail_url ? { url: row.thumbnail_url } : undefined,
        default: row.thumbnail_url ? { url: row.thumbnail_url } : undefined,
      },
    },
    statistics: {
      viewCount: row.view_count ?? "0",
      subscriberCount: row.subscriber_count ?? "0",
      videoCount: row.video_count ?? "0",
      hiddenSubscriberCount: row.hidden_subscriber_count ?? false,
    },
  };
}

export function siteRowToSaved(row: SiteChannelRow): SavedChannel {
  return {
    id: row.channel_id,
    title: row.title,
    thumbnail: row.thumbnail_url ?? "",
    subscriberCount: row.subscriber_count ?? "0",
    description: row.description ?? "",
    customUrl: row.custom_url ?? undefined,
    country: row.country ?? undefined,
    viewCount: row.view_count ?? undefined,
    videoCount: row.video_count ?? undefined,
    hiddenSubscriberCount: row.hidden_subscriber_count ?? undefined,
    savedAt: row.last_seen_at,
  };
}

export async function upsertChannelsFromSearch(
  channels: Channel[],
  language?: string
): Promise<void> {
  if (channels.length === 0 || !isSupabaseConfigured()) return;
  const supabase = createClient();
  const payload = channels.map((ch) => channelToPayload(ch, language));
  await supabase.rpc("upsert_site_channels", { channels: payload });
}

export async function getSiteChannelById(
  channelId: string
): Promise<SiteChannelRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_channels")
    .select("*")
    .eq("channel_id", channelId)
    .maybeSingle();
  if (error || !data) return null;
  return data as SiteChannelRow;
}

export async function getFeaturedChannels(
  language = "en"
): Promise<Channel[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_channels")
    .select("*")
    .eq("featured", true)
    .eq("language", language)
    .order("like_count", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(12);

  if (error || !data) return [];
  return (data as SiteChannelRow[]).map((row) => ({
    ...siteRowToChannel(row),
    likeCount: row.like_count ?? 0,
  }));
}

export async function getAllSiteChannels(
  filters: ChannelFilters = {}
): Promise<SiteChannelRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  let query = supabase
    .from("site_channels")
    .select("*")
    .order("like_count", { ascending: false })
    .order("search_count", { ascending: false });

  if (filters.country) {
    query = query.eq("country", filters.country);
  }
  if (filters.language) {
    query = query.eq("language", filters.language);
  }
  if (filters.featured === true) {
    query = query.eq("featured", true);
  }
  if (filters.minLikes !== undefined && filters.minLikes > 0) {
    query = query.gte("like_count", filters.minLikes);
  }
  if (filters.search?.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  const { data, error } = await query.limit(500);
  if (error || !data) return [];
  return data as SiteChannelRow[];
}

export async function setChannelFeatured(
  channelId: string,
  featured: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase غير مُعد" };
  }
  const supabase = createClient();

  const { error: rpcError } = await supabase.rpc("set_channel_featured", {
    p_channel_id: channelId,
    p_featured: featured,
  });

  if (!rpcError) return { ok: true };

  const { error } = await supabase
    .from("site_channels")
    .update({ featured })
    .eq("channel_id", channelId);

  if (error) {
    console.error("setChannelFeatured:", rpcError ?? error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function ensureSiteChannel(
  channel: SavedChannel,
  language?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  const { error } = await supabase.rpc("ensure_site_channel", {
    ch: {
      channel_id: channel.id,
      title: channel.title,
      thumbnail_url: channel.thumbnail || null,
      subscriber_count: channel.subscriberCount ?? "0",
      description: channel.description ?? "",
      custom_url: channel.customUrl ?? null,
      country: channel.country ?? null,
      language: language || null,
      view_count: channel.viewCount ?? "0",
      video_count: channel.videoCount ?? "0",
      hidden_subscriber_count: channel.hiddenSubscriberCount ?? false,
    },
  });
  return !error;
}

export async function getChannelLikeCount(channelId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = createClient();
  const { data } = await supabase
    .from("site_channels")
    .select("like_count")
    .eq("channel_id", channelId)
    .maybeSingle();
  return (data as { like_count?: number } | null)?.like_count ?? 0;
}

export async function isChannelLikedByUser(
  userId: string,
  channelId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  const { data } = await supabase
    .from("channel_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("channel_id", channelId)
    .maybeSingle();
  return !!data;
}

export async function likeChannel(
  userId: string,
  channelId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  const { error } = await supabase.from("channel_likes").upsert(
    { user_id: userId, channel_id: channelId },
    { onConflict: "user_id,channel_id" }
  );
  return !error;
}

export async function unlikeChannel(
  userId: string,
  channelId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  const { error } = await supabase
    .from("channel_likes")
    .delete()
    .eq("user_id", userId)
    .eq("channel_id", channelId);
  return !error;
}

export async function getUserLikedChannels(
  userId: string
): Promise<SavedChannel[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data: likes, error } = await supabase
    .from("channel_likes")
    .select("channel_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !likes?.length) return [];

  const ids = likes.map((l) => l.channel_id as string);
  const { data: channels } = await supabase
    .from("site_channels")
    .select("*")
    .in("channel_id", ids);

  const byId = new Map(
    ((channels ?? []) as SiteChannelRow[]).map((c) => [c.channel_id, c])
  );

  return likes
    .map((like) => {
      const row = byId.get(like.channel_id as string);
      if (!row) return null;
      return {
        ...siteRowToSaved(row),
        savedAt: like.created_at as string,
      };
    })
    .filter((c): c is SavedChannel => c !== null);
}

/** @deprecated Use likes system instead */
export async function getUserSavedChannels(
  userId: string
): Promise<SavedChannel[]> {
  return getUserLikedChannels(userId);
}

export async function saveUserChannel(
  _userId: string,
  _channel: SavedChannel
): Promise<boolean> {
  return false;
}

export async function removeUserChannel(
  userId: string,
  channelId: string
): Promise<boolean> {
  return unlikeChannel(userId, channelId);
}

export async function isUserChannelSaved(
  userId: string,
  channelId: string
): Promise<boolean> {
  return isChannelLikedByUser(userId, channelId);
}

export async function syncLocalSavesToDb(
  _userId: string,
  _localChannels: SavedChannel[]
): Promise<void> {
  /* local saves removed */
}
