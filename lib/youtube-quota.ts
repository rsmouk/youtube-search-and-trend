import { createHash } from "crypto";
import type { ServerApiKeyInfo } from "@/lib/api-keys-server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { KeyQuotaStat, KeyQuotaSource, QuotaStatsResult } from "./quota-types";

export type { KeyQuotaStat, QuotaStatsResult };

/** Default YouTube Data API daily quota units per project/key. */
export const DEFAULT_DAILY_QUOTA = 10_000;

export const QUOTA_COSTS = {
  search: 100,
  channels: 1,
  videos: 1,
  videoCategories: 1,
} as const;

export type QuotaOperation = keyof typeof QUOTA_COSTS;

export function getPacificDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getDailyQuotaLimit(): number {
  const raw = process.env.YOUTUBE_DAILY_QUOTA;
  if (!raw) return DEFAULT_DAILY_QUOTA;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_QUOTA;
}

export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex").slice(0, 16);
}

export function apiKeySuffix(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 4) return trimmed;
  return trimmed.slice(-4);
}

export async function recordApiQuotaUsage(
  apiKey: string,
  units: number,
  requests = 1
): Promise<void> {
  if (units <= 0) return;
  const admin = createAdminClient();
  if (!admin) {
    console.error("recordApiQuotaUsage: SUPABASE_SERVICE_ROLE_KEY not configured");
    return;
  }

  const { error } = await admin.rpc("increment_youtube_quota", {
    p_usage_date: getPacificDateString(),
    p_key_suffix: apiKeySuffix(apiKey),
    p_key_hash: hashApiKey(apiKey),
    p_units: units,
    p_requests: requests,
  });

  if (error) {
    console.error("recordApiQuotaUsage:", error.message);
  }
}

function buildKeyStat(
  keySuffix: string,
  keyHash: string,
  unitsUsed: number,
  requestCount: number,
  dailyLimit: number,
  source: KeyQuotaSource
): KeyQuotaStat {
  const unitsRemaining = Math.max(dailyLimit - unitsUsed, 0);
  const percentUsed = Math.min(100, Math.round((unitsUsed / dailyLimit) * 100));
  let status: KeyQuotaStat["status"] = "ok";
  if (unitsRemaining <= 0) status = "exhausted";
  else if (percentUsed >= 80) status = "low";

  return {
    keySuffix,
    keyHash,
    unitsUsed,
    requestCount,
    dailyLimit,
    unitsRemaining,
    percentUsed,
    status,
    source,
  };
}

export async function getQuotaStats(
  configuredKeys: Array<string | ServerApiKeyInfo>
): Promise<QuotaStatsResult> {
  const date = getPacificDateString();
  const dailyLimit = getDailyQuotaLimit();
  const admin = createAdminClient();

  const sourceByHash = new Map<string, KeyQuotaSource>();
  const uniqueKeys: string[] = [];
  for (const entry of configuredKeys) {
    if (typeof entry === "string") {
      if (!entry || uniqueKeys.includes(entry)) continue;
      uniqueKeys.push(entry);
      sourceByHash.set(hashApiKey(entry), "unknown");
    } else if (entry.key) {
      if (uniqueKeys.includes(entry.key)) continue;
      uniqueKeys.push(entry.key);
      sourceByHash.set(hashApiKey(entry.key), entry.source);
    }
  }

  const usageByHash = new Map<
    string,
    { key_suffix: string; units_used: number; request_count: number }
  >();

  if (admin) {
    const { data, error } = await admin
      .from("youtube_api_usage")
      .select("key_suffix, key_hash, units_used, request_count")
      .eq("usage_date", date);

    if (error) {
      console.error("getQuotaStats:", error.message);
    } else if (data) {
      for (const row of data) {
        usageByHash.set(row.key_hash as string, {
          key_suffix: row.key_suffix as string,
          units_used: Number(row.units_used) || 0,
          request_count: Number(row.request_count) || 0,
        });
      }
    }
  }

  const keys: KeyQuotaStat[] = uniqueKeys.map((key) => {
    const hash = hashApiKey(key);
    const usage = usageByHash.get(hash);
    return buildKeyStat(
      apiKeySuffix(key),
      hash,
      usage?.units_used ?? 0,
      usage?.request_count ?? 0,
      dailyLimit,
      sourceByHash.get(hash) ?? "unknown"
    );
  });

  // Include usage rows for keys no longer configured
  for (const [hash, usage] of usageByHash) {
    if (keys.some((k) => k.keyHash === hash)) continue;
    keys.push(
      buildKeyStat(
        usage.key_suffix,
        hash,
        usage.units_used,
        usage.request_count,
        dailyLimit,
        "unknown"
      )
    );
  }

  const unitsUsed = keys.reduce((sum, k) => sum + k.unitsUsed, 0);
  const totalLimit = dailyLimit * Math.max(uniqueKeys.length, 1);
  const unitsRemaining = Math.max(totalLimit - unitsUsed, 0);
  const requestCount = keys.reduce((sum, k) => sum + k.requestCount, 0);
  const percentUsed = Math.min(
    100,
    Math.round((unitsUsed / Math.max(totalLimit, 1)) * 100)
  );

  return {
    date,
    dailyLimit,
    timezone: "America/Los_Angeles",
    keysConfigured: uniqueKeys.length,
    keys,
    totals: {
      unitsUsed,
      unitsRemaining,
      requestCount,
      percentUsed,
    },
    note: "tracked_internally",
  };
}
