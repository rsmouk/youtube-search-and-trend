import { createClient } from "@/lib/supabase/server";
import type { SiteChannelRow } from "@/lib/channels-db";

function isConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
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
