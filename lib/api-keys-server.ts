import { createAdminClient } from "@/lib/supabase/admin";

const SETTINGS_KEY = "youtube_api_keys";

function getEnvKeys(): string[] {
  const raw = process.env.YOUTUBE_API_KEYS ?? process.env.YOUTUBE_API_KEY ?? "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function getDbKeys(): Promise<string[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error || !data?.value) return [];

  const value = data.value;
  if (Array.isArray(value)) {
    return value.filter((k): k is string => typeof k === "string" && k.trim().length > 0);
  }
  return [];
}

export async function getServerApiKeys(): Promise<string[]> {
  const dbKeys = await getDbKeys();
  return [...new Set([...dbKeys, ...getEnvKeys()])];
}

export async function setServerApiKeys(keys: string[]): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured" };
  }

  const filtered = keys.map((k) => k.trim()).filter(Boolean);

  const { error } = await admin.from("site_settings").upsert(
    {
      key: SETTINGS_KEY,
      value: filtered,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getAdminApiKeysForDisplay(): Promise<string[]> {
  return getDbKeys();
}
