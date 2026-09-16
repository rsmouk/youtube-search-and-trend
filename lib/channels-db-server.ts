import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  siteRowToChannel,
  type SiteChannelRow,
} from "@/lib/channels-db";
import type { Channel } from "@/lib/types";

/** Prefer DB rows newer than this instead of calling channels.list */
const CHANNEL_DB_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function isConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function isReusableSiteRow(row: SiteChannelRow): boolean {
  if (!row.title?.trim()) return false;
  if (row.subscriber_count == null || row.subscriber_count === "") return false;
  const seen = new Date(row.last_seen_at).getTime();
  if (!Number.isFinite(seen)) return false;
  return Date.now() - seen < CHANNEL_DB_MAX_AGE_MS;
}

export async function getSiteChannelByIdServer(
  channelId: string
): Promise<SiteChannelRow | null> {
  if (!isConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_channels")
      .select("*")
      .eq("channel_id", channelId)
      .maybeSingle();
    if (error || !data) return null;
    return data as SiteChannelRow;
  } catch {
    return null;
  }
}

/** Server-side lookup for search enrichment (skips channels.list when possible). */
export async function getSiteChannelsByIds(
  channelIds: string[]
): Promise<Map<string, Channel>> {
  const map = new Map<string, Channel>();
  const unique = [...new Set(channelIds.filter(Boolean))];
  if (unique.length === 0) return map;

  const admin = createAdminClient();
  if (!admin) return map;

  const { data, error } = await admin
    .from("site_channels")
    .select("*")
    .in("channel_id", unique);

  if (error || !data) return map;

  for (const row of data as SiteChannelRow[]) {
    if (!isReusableSiteRow(row)) continue;
    map.set(row.channel_id, siteRowToChannel(row));
  }
  return map;
}
