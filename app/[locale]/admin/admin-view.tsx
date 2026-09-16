"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import LayoutToggle, { cardsContainerClass } from "@/components/LayoutToggle";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import {
  getAllSiteChannels,
  setChannelFeatured,
  type SiteChannelRow,
} from "@/lib/channels-db";
import { formatCount } from "@/lib/format";
import { pageMain } from "@/lib/layout-classes";
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
  const [filter, setFilter] = useState<"all" | "featured">("all");
  const [actionError, setActionError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getAllSiteChannels(
      filter === "featured" ? { featured: true } : {}
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
    if (isAdmin) load();
  }, [isAdmin, filter]);

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
        <Header />
        <main className={pageMain}>
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={pageMain}>
        <PageHeader
          icon="admin"
          title={t("admin.title")}
          subtitle={t("admin.subtitle")}
          actions={<LayoutToggle layout={layout} onChange={setLayout} />}
        />

        {actionError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="mb-6 flex gap-2">
          {(["all", "featured"] as const).map((f) => (
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
              {f === "all" ? t("admin.allChannels") : t("admin.featuredOnly")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        ) : (
          <div className={cardsContainerClass(layout)}>
            {channels.map((ch) => (
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
                    {t("admin.searches", { count: ch.search_count })}
                    {ch.country ? ` • ${ch.country}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={togglingId === ch.channel_id}
                  onClick={() => toggleFeatured(ch.channel_id, ch.featured)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-colors disabled:opacity-60 ${
                    layout === "grid" ? "w-full" : ""
                  } ${
                    ch.featured
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {togglingId === ch.channel_id
                    ? "..."
                    : ch.featured
                      ? t("admin.featured")
                      : t("admin.setFeatured")}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
