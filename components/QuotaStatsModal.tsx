"use client";

import { useI18n } from "@/components/I18nProvider";
import type { QuotaStatsResult } from "@/lib/quota-types";

interface QuotaStatsModalProps {
  open: boolean;
  loading: boolean;
  error: string;
  stats: QuotaStatsResult | null;
  onClose: () => void;
  onRefresh: () => void;
}

function statusClass(status: string) {
  if (status === "exhausted") return "bg-red-50 text-red-700 border-red-200";
  if (status === "low") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export default function QuotaStatsModal({
  open,
  loading,
  error,
  stats,
  onClose,
  onRefresh,
}: QuotaStatsModalProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quota-stats-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="quota-stats-title"
              className="text-lg font-semibold text-stone-800"
            >
              {t("admin.quotaTitle")}
            </h2>
            <p className="mt-1 text-xs text-stone-400">
              {t("admin.quotaNote")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-50"
          >
            {t("common.cancel")}
          </button>
        </div>

        {loading ? (
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-stone-100" />
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : stats ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs text-stone-500">
                {t("admin.quotaDate", { date: stats.date })} · {stats.timezone}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat
                  label={t("admin.quotaUsed")}
                  value={String(stats.totals.unitsUsed)}
                />
                <Stat
                  label={t("admin.quotaRemaining")}
                  value={String(stats.totals.unitsRemaining)}
                />
                <Stat
                  label={t("admin.quotaRequests")}
                  value={String(stats.totals.requestCount)}
                />
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-stone-500">
                  <span>{t("admin.quotaPercent", { pct: stats.totals.percentUsed })}</span>
                  <span>
                    {t("admin.quotaLimit", { limit: stats.dailyLimit })} ×{" "}
                    {stats.keysConfigured}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stats.totals.percentUsed >= 100
                        ? "bg-red-500"
                        : stats.totals.percentUsed >= 80
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(stats.totals.percentUsed, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-700">
                {t("admin.quotaPerKey")}
              </p>
              {stats.keys.length === 0 ? (
                <p className="text-sm text-stone-400">{t("admin.quotaNoKeys")}</p>
              ) : (
                stats.keys.map((key) => (
                  <div
                    key={key.keyHash}
                    className={`rounded-2xl border px-4 py-3 ${statusClass(key.status)}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        …{key.keySuffix}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md border border-current/20 bg-white/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
                          {t(`admin.quotaSource.${key.source ?? "unknown"}`)}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                          {t(`admin.quotaStatus.${key.status}`)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs opacity-80">
                      {t("admin.quotaKeyLine", {
                        used: key.unitsUsed,
                        remaining: key.unitsRemaining,
                        limit: key.dailyLimit,
                        requests: key.requestCount,
                      })}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
                      <div
                        className="h-full rounded-full bg-current opacity-70"
                        style={{ width: `${Math.min(key.percentUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-stone-400">
              {t("admin.quotaCosts")}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-stone-800 px-4 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("admin.quotaRefresh")}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm">
      <p className="text-lg font-semibold text-stone-800">{value}</p>
      <p className="mt-0.5 text-[11px] text-stone-500">{label}</p>
    </div>
  );
}
