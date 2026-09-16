import { createAdminClient } from "@/lib/supabase/admin";

const SETTINGS_KEY = "youtube_api_keys";

export type ApiKeySource = "settings" | "env" | "both";

export interface ServerApiKeyInfo {
  key: string;
  source: ApiKeySource;
  keySuffix: string;
}

function keySuffix(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 4) return trimmed;
  return trimmed.slice(-4);
}

export function getEnvApiKeys(): string[] {
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

/** Keys from Settings UI + env (`YOUTUBE_API_KEYS` / `YOUTUBE_API_KEY`). */
export async function getServerApiKeys(): Promise<string[]> {
  const detailed = await getServerApiKeysDetailed();
  return detailed.map((k) => k.key);
}

export async function getServerApiKeysDetailed(): Promise<ServerApiKeyInfo[]> {
  const [dbKeys, envKeys] = await Promise.all([getDbKeys(), Promise.resolve(getEnvApiKeys())]);
  const dbSet = new Set(dbKeys);
  const envSet = new Set(envKeys);
  const all = [...new Set([...dbKeys, ...envKeys])];

  return all.map((key) => {
    const fromSettings = dbSet.has(key);
    const fromEnv = envSet.has(key);
    const source: ApiKeySource =
      fromSettings && fromEnv ? "both" : fromEnv ? "env" : "settings";
    return { key, source, keySuffix: keySuffix(key) };
  });
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

/** DB keys for the Settings form (env keys are shown separately, read-only). */
export async function getAdminApiKeysForDisplay(): Promise<string[]> {
  return getDbKeys();
}

export function getEnvApiKeySuffixes(): string[] {
  return getEnvApiKeys().map(keySuffix);
}
