"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import ChannelCard from "@/components/ChannelCard";
import LayoutToggle, { cardsContainerClass } from "@/components/LayoutToggle";
import SearchableSelect from "@/components/SearchableSelect";
import { useI18n } from "@/components/I18nProvider";
import {
  getAllSiteChannels,
  siteRowToChannel,
  type SiteChannelRow,
} from "@/lib/channels-db";
import { getCountryOptions } from "@/lib/filters";
import { pageMain } from "@/lib/layout-classes";
import { useCardLayout } from "@/lib/use-card-layout";

export default function ChannelsPage() {
  const { t, locale } = useI18n();
  const { layout, setLayout } = useCardLayout();
  const [channels, setChannels] = useState<SiteChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const countryFilterOptions = getCountryOptions(locale, t("common.allCountries")).map(
    (c) => ({ value: c.code, label: c.label })
  );

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
        <PageHeader
          icon="channels"
          title={t("channels.title")}
          subtitle={t("channels.subtitle")}
          actions={<LayoutToggle layout={layout} onChange={setLayout} />}
        />

        <div className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-xs text-stone-400">{t("channels.searchByName")}</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("channels.searchPlaceholder")}
                className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
              />
            </label>
            <SearchableSelect
              label={t("trending.country")}
              value={country}
              options={countryFilterOptions}
              placeholder={t("common.allCountries")}
              onChange={setCountry}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-stone-400">{t("channels.filter")}</span>
              <button
                type="button"
                onClick={() => setFeaturedOnly((v) => !v)}
                className={`rounded-xl border px-4 py-2.5 text-sm ${
                  featuredOnly
                    ? "border-stone-800 bg-stone-800 text-white"
                    : "border-stone-200 bg-white text-stone-600"
                }`}
              >
                {featuredOnly ? t("channels.featuredOnly") : t("channels.showFeaturedOnly")}
              </button>
            </label>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-stone-500">
            {loading
              ? t("channels.loading")
              : t("common.channels", { count: channels.length })}
          </span>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        ) : channels.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-200 py-16 text-center text-stone-500">
            {t("channels.noMatch")}
          </div>
        ) : (
          <div className={cardsContainerClass(layout)}>
            {channels.map((row) => (
              <ChannelCard
                key={row.channel_id}
                channel={siteRowToChannel(row)}
                variant={layout}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
