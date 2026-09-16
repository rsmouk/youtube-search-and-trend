export type KeyQuotaSource = "settings" | "env" | "both" | "unknown";

export interface KeyQuotaStat {
  keySuffix: string;
  keyHash: string;
  unitsUsed: number;
  requestCount: number;
  dailyLimit: number;
  unitsRemaining: number;
  percentUsed: number;
  status: "ok" | "low" | "exhausted";
  source: KeyQuotaSource;
}

export interface QuotaStatsResult {
  date: string;
  dailyLimit: number;
  timezone: string;
  keysConfigured: number;
  keys: KeyQuotaStat[];
  totals: {
    unitsUsed: number;
    unitsRemaining: number;
    requestCount: number;
    percentUsed: number;
  };
  note: string;
}
