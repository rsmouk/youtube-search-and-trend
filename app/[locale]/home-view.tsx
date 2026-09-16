"use client";

import { useEffect, useState } from "react";
import type { SearchFilters } from "@/lib/filters";
import { DEFAULT_FILTERS, getSavedFilters, saveFilters } from "@/lib/filters";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import ChannelCard from "@/components/ChannelCard";
import ChannelCardSkeleton from "@/components/ChannelCardSkeleton";
import LayoutToggle, { cardsContainerClass } from "@/components/LayoutToggle";
import SuggestedChannels from "@/components/SuggestedChannels";
import { useI18n } from "@/components/I18nProvider";
import { upsertChannelsFromSearch } from "@/lib/channels-db";
import { addRecentSearch } from "@/lib/storage";
import { useCardLayout } from "@/lib/use-card-layout";
import { translateYouTubeError } from "@/lib/youtube";
import type { Channel } from "@/lib/types";
import { pageMain } from "@/lib/layout-classes";
import PageTitle from "@/components/PageTitle";

const SKELETON_COUNT = 6;

export default function HomePage() {
  const { t } = useI18n();
  const { layout, setLayout } = useCardLayout();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setFilters(getSavedFilters());
  }, []);

  const handleFiltersChange = (next: SearchFilters) => {
    setFilters(next);
    saveFilters(next);
  };

  const runSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setKeyword(trimmed);
    setLoading(true);
    setError("");
    setHasSearched(true);
    setSearchedKeyword(trimmed);
    addRecentSearch(trimmed);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: trimmed, filters }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChannels([]);
        setError(translateYouTubeError(data.error ?? "unexpected", t));
        return;
      }

      setChannels(data.channels ?? []);
      upsertChannelsFromSearch(data.channels ?? []).catch(() => {});

      if ((data.channels ?? []).length === 0) {
        setError(
          filters.channelCountry ? t("home.noResultsFiltered") : t("home.noResults")
        );
      }
    } catch {
      setChannels([]);
      setError(t("errors.connectionFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(keyword);
  };

  const showResults = hasSearched && (loading || channels.length > 0);

  return (
    <>
      <PageTitle title={t("seo.homeTitle")} />
      <Header />
      <main className={pageMain}>
        <section className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-800 sm:text-4xl">
            {t("home.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-500">{t("home.subtitle")}</p>
        </section>

        <div className="mb-10">
          <SearchForm
            keyword={keyword}
            loading={loading}
            filters={filters}
            onKeywordChange={setKeyword}
            onFiltersChange={handleFiltersChange}
            onSubmit={handleSearch}
            onSelectRecent={runSearch}
          />
        </div>

        {!hasSearched && <SuggestedChannels />}

        {error && !loading && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 whitespace-pre-line">
            {error}
          </div>
        )}

        {showResults && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <h2 className="truncate text-lg font-medium text-stone-700">
                  {t("home.resultsFor", { keyword: searchedKeyword })}
                </h2>
                {!loading && channels.length > 0 && (
                  <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                    {t("common.channels", { count: channels.length })}
                  </span>
                )}
              </div>
              <LayoutToggle layout={layout} onChange={setLayout} />
            </div>

            <div className={cardsContainerClass(layout, true)}>
              {loading
                ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <ChannelCardSkeleton key={i} />
                  ))
                : channels.map((channel) => (
                    <ChannelCard key={channel.id} channel={channel} variant={layout} />
                  ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
