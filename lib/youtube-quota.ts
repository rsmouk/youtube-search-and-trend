import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { KeyQuotaStat, QuotaStatsResult } from "./quota-types";

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
  if (!admin) return;

  try {
    await admin.rpc("increment_youtube_quota", {
      p_usage_date: getPacificDateString(),
      p_key_suffix: apiKeySuffix(apiKey),
      p_key_hash: hashApiKey(apiKey),
      p_units: units,
      p_requests: requests,
    });
  } catch (err) {
    console.error("recordApiQuotaUsage:", err);
  }
}

export async function getQuotaStats(
  configuredKeys: string[]
): Promise<QuotaStatsResult> {
  const date = getPacificDateString();
  const dailyLimit = getDailyQuotaLimit();
  const uniqueKeys = [...new Set(configuredKeys.filter(Boolean))];
  const admin = createAdminClient();

  const usageByHash = new Map<
    string,
    { key_suffix: string; units_used: number; request_count: number }
  >();

  if (admin) {
    const { data, error } = await admin
      .from("youtube_api_usage")
      .select("key_suffix, key_hash, units_used, request_count")
      .eq("usage_date", date);

    if (!error && data) {
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
    const unitsUsed = usage?.units_used ?? 0;
    const requestCount = usage?.request_count ?? 0;
    const unitsRemaining = Math.max(dailyLimit - unitsUsed, 0);
    const percentUsed = Math.min(100, Math.round((unitsUsed / dailyLimit) * 100));
    let status: KeyQuotaStat["status"] = "ok";
    if (unitsRemaining <= 0) status = "exhausted";
    else if (percentUsed >= 80) status = "low";

    return {
      keySuffix: apiKeySuffix(key),
      keyHash: hash,
      unitsUsed,
      requestCount,
      dailyLimit,
      unitsRemaining,
      percentUsed,
      status,
    };
  });

  // Include usage rows for keys no longer configured
  for (const [hash, usage] of usageByHash) {
    if (keys.some((k) => k.keyHash === hash)) continue;
    const unitsUsed = usage.units_used;
    const unitsRemaining = Math.max(dailyLimit - unitsUsed, 0);
    const percentUsed = Math.min(100, Math.round((unitsUsed / dailyLimit) * 100));
    keys.push({
      keySuffix: usage.key_suffix,
      keyHash: hash,
      unitsUsed,
      requestCount: usage.request_count,
      dailyLimit,
      unitsRemaining,
      percentUsed,
      status: unitsRemaining <= 0 ? "exhausted" : percentUsed >= 80 ? "low" : "ok",
    });
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
    note:
      "tracked_internally",
  };
}
