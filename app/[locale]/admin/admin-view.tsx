"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import LayoutToggle, { cardsContainerClass } from "@/components/LayoutToggle";
import Pagination from "@/components/Pagination";
import PageTitle from "@/components/PageTitle";
import QuotaStatsModal from "@/components/QuotaStatsModal";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import {
  getAllSiteChannels,
  setChannelFeatured,
  type SiteChannelRow,
} from "@/lib/channels-db";
import { formatCompactCount, formatCount } from "@/lib/format";
import { pageMain } from "@/lib/layout-classes";
import { paginateItems } from "@/lib/pagination";
import type { QuotaStatsResult } from "@/lib/quota-types";
import { getAdminMinLikes, saveAdminMinLikes } from "@/lib/storage";
import { useCardLayout } from "@/lib/use-card-layout";
import { useLocalePath } from "@/lib/use-locale-path";

export default function AdminView() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalePath();
  const { t } = useI18n();
  const { layout, setLayout } = useCardLayout();
  const [channels, setChannels] = useState<SiteChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"eligible" | "featured">("eligible");
  const [minLikes, setMinLikes] = useState(2);
  const [actionError, setActionError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [quotaError, setQuotaError] = useState("");
  const [quotaStats, setQuotaStats] = useState<QuotaStatsResult | null>(null);

  useEffect(() => {
    setMinLikes(getAdminMinLikes(2));
  }, []);

  const load = async (likesThreshold: number, listFilter: typeof filter) => {
    setLoading(true);
    const data = await getAllSiteChannels(
      listFilter === "featured"
        ? { featured: true }
        : { minLikes: likesThreshold }
    );
    setChannels(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace(lp("/login"));
    }
  }, [user, isAdmin, authLoading, router, lp]);

  useEffect(() => {
    if (isAdmin) {
      setPage(1);
      load(minLikes, filter);
    }
  }, [isAdmin, filter, minLikes]);

  const pagination = useMemo(() => paginateItems(channels, page), [channels, page]);

  useEffect(() => {
    if (page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMinLikesChange = (value: number) => {
    const next = Number.isFinite(value) ? Math.max(0, value) : 2;
    setMinLikes(next);
    saveAdminMinLikes(next);
  };

  const loadQuotaStats = async () => {
    setQuotaLoading(true);
    setQuotaError("");
    try {
      const res = await fetch("/api/admin/quota");
      const data = await res.json();
      if (!res.ok) {
        setQuotaError(data.error ?? t("admin.quotaLoadError"));
        setQuotaStats(null);
        return;
      }
      setQuotaStats(data as QuotaStatsResult);
    } catch {
      setQuotaError(t("admin.quotaLoadError"));
      setQuotaStats(null);
    } finally {
      setQuotaLoading(false);
    }
  };

  const openQuotaStats = () => {
    setQuotaOpen(true);
    void loadQuotaStats();
  };

  const toggleFeatured = async (channelId: string, current: boolean) => {
    if (togglingId) return;

    setActionError("");
    const next = !current;
    setTogglingId(channelId);

    setChannels((prev) =>
      prev.map((ch) =>
        ch.channel_id === channelId ? { ...ch, featured: next } : ch
      )
    );

    const result = await setChannelFeatured(channelId, next);
    setTogglingId(null);

    if (!result.ok) {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.channel_id === channelId ? { ...ch, featured: current } : ch
        )
      );
      setActionError(result.error ?? t("admin.updateFailed"));
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <>
        <PageTitle title={t("seo.adminTitle")} />
        <Header />
        <main className={pageMain}>
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("seo.adminTitle")} />
      <Header />
      <main className={pageMain}>
        <PageHeader
          icon="admin"
          title={t("admin.title")}
          subtitle={t("admin.subtitle")}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openQuotaStats}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 sm:text-sm"
              >
                {t("admin.quotaButton")}
              </button>
              <LayoutToggle layout={layout} onChange={setLayout} />
            </div>
          }
        />

        {actionError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["eligible", "featured"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm ${
                  filter === f
                    ? "bg-stone-800 text-white"
                    : "border border-stone-200 bg-white text-stone-600"
                }`}
              >
                {f === "eligible"
                  ? t("admin.eligibleLikes")
                  : t("admin.featuredOnly")}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-600">
            <span>{t("admin.minLikes")}</span>
            <input
              type="number"
              min={0}
              value={minLikes}
              onChange={(e) => handleMinLikesChange(Number(e.target.value))}
              className="w-20 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800"
            />
          </label>

          {!loading && channels.length > 0 && (
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
              {t("common.channels", { count: channels.length })}
            </span>
          )}
        </div>

        <p className="mb-4 text-xs text-stone-400">{t("admin.featuredHint")}</p>

        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        ) : channels.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center text-stone-500">
            {t("admin.noEligible")}
          </div>
        ) : (
          <>
            <div className={cardsContainerClass(layout)}>
              {pagination.items.map((ch) => (
                <div
                  key={ch.channel_id}
                  className={`flex gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm ${
                    layout === "grid"
                      ? "flex-col items-start"
                      : "flex-row items-center"
                  }`}
                >
                  {ch.thumbnail_url && (
                    <img
                      src={ch.thumbnail_url}
                      alt={ch.title}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-stone-800">{ch.title}</p>
                    <p className="text-xs text-stone-400">
                      {formatCount(ch.subscriber_count ?? "0")} •{" "}
                      {t("likes.count", {
                        count: formatCompactCount(ch.like_count ?? 0),
                      })}
                      {ch.country ? ` • ${ch.country}` : ""}
                    </p>
                  </div>
                  <label
                    className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                      layout === "grid" ? "w-full justify-between" : ""
                    } ${
                      ch.featured
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    <span>
                      {togglingId === ch.channel_id
                        ? "..."
                        : ch.featured
                          ? t("admin.featured")
                          : t("admin.setFeatured")}
                    </span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-emerald-600"
                      checked={ch.featured}
                      disabled={togglingId === ch.channel_id}
                      onChange={() => toggleFeatured(ch.channel_id, ch.featured)}
                    />
                  </label>
                </div>
              ))}
            </div>

            <Pagination
              page={pagination.currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              start={pagination.start}
              end={pagination.end}
              onChange={handlePageChange}
            />
          </>
        )}
      </main>

      <QuotaStatsModal
        open={quotaOpen}
        loading={quotaLoading}
        error={quotaError}
        stats={quotaStats}
        onClose={() => setQuotaOpen(false)}
        onRefresh={loadQuotaStats}
      />
    </>
  );
}
