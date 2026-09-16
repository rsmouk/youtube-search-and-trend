"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ChannelCard from "@/components/ChannelCard";
import SearchableSelect from "@/components/SearchableSelect";
import {
  getAllSiteChannels,
  siteRowToChannel,
  type SiteChannelRow,
} from "@/lib/channels-db";
import { COUNTRY_OPTIONS } from "@/lib/filters";
import { pageMain } from "@/lib/layout-classes";

const countryFilterOptions = [
  { value: "", label: "كل الدول" },
  ...COUNTRY_OPTIONS.filter((c) => c.code).map((c) => ({
    value: c.code,
    label: c.label,
  })),
];

export default function ChannelsPage() {
  const [channels, setChannels] = useState<SiteChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getAllSiteChannels({
      country: country || undefined,
      featured: featuredOnly || undefined,
      search: search || undefined,
    });
    setChannels(data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search, country, featuredOnly]);

  return (
    <>
      <Header />
      <main className={pageMain}>
        <section className="mb-8">
          <h1 className="text-3xl font-semibold text-stone-800">
            دليل القنوات
          </h1>
          <p className="mt-2 text-stone-500">
            جميع القنوات المكتشفة عبر البحث في الموقع
          </p>
        </section>

        <div className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-xs text-stone-400">بحث بالاسم</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="اسم القناة..."
                className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
              />
            </label>
            <SearchableSelect
              label="الدولة"
              value={country}
              options={countryFilterOptions}
              placeholder="كل الدول"
              onChange={setCountry}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-stone-400">تصفية</span>
              <button
                type="button"
                onClick={() => setFeaturedOnly((v) => !v)}
                className={`rounded-xl border px-4 py-2.5 text-sm ${
                  featuredOnly
                    ? "border-stone-800 bg-stone-800 text-white"
                    : "border-stone-200 bg-white text-stone-600"
                }`}
              >
                {featuredOnly ? "المقترحة فقط ✓" : "عرض المقترحة فقط"}
              </button>
            </label>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-stone-500">
            {loading ? "جاري التحميل..." : `${channels.length} قناة`}
          </span>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        ) : channels.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-200 py-16 text-center text-stone-500">
            لا توجد قنوات مطابقة
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((row) => (
              <ChannelCard key={row.channel_id} channel={siteRowToChannel(row)} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
