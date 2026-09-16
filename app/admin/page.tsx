"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import {
  getAllSiteChannels,
  setChannelFeatured,
  type SiteChannelRow,
} from "@/lib/channels-db";
import { formatCount } from "@/lib/format";

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [channels, setChannels] = useState<SiteChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "featured">("all");

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
      router.replace("/login");
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, filter]);

  const toggleFeatured = async (channelId: string, current: boolean) => {
    const ok = await setChannelFeatured(channelId, !current);
    if (ok) load();
  };

  if (authLoading || !isAdmin) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl flex-1 px-4 py-10">
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <section className="mb-8">
          <h1 className="text-3xl font-semibold text-stone-800">
            لوحة الإدارة
          </h1>
          <p className="mt-2 text-stone-500">
            اختر القنوات التي تظهر في الرئيسية كـ «مقترحة»
          </p>
        </section>

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
              {f === "all" ? "كل القنوات" : "المميزة فقط"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        ) : (
          <div className="space-y-3">
            {channels.map((ch) => (
              <div
                key={ch.channel_id}
                className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm"
              >
                {ch.thumbnail_url && (
                  <img
                    src={ch.thumbnail_url}
                    alt={ch.title}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-800">
                    {ch.title}
                  </p>
                  <p className="text-xs text-stone-400">
                    {formatCount(ch.subscriber_count ?? "0")} مشترك •{" "}
                    {ch.search_count} عملية بحث
                    {ch.country ? ` • ${ch.country}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFeatured(ch.channel_id, ch.featured)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium ${
                    ch.featured
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {ch.featured ? "مميزة ✓" : "تعيين كمقترحة"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
