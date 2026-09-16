"use client";

import { useEffect, useState } from "react";
import type { SearchFilters } from "@/lib/filters";
import { DEFAULT_FILTERS, getSavedFilters, saveFilters } from "@/lib/filters";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import ChannelCard from "@/components/ChannelCard";
import ChannelCardSkeleton from "@/components/ChannelCardSkeleton";
import SuggestedChannels from "@/components/SuggestedChannels";
import { upsertChannelsFromSearch } from "@/lib/channels-db";
import { addRecentSearch, getApiKeys } from "@/lib/storage";
import { searchRecentChannels, YouTubeApiError } from "@/lib/youtube";
import type { Channel } from "@/lib/types";
import { pageMain } from "@/lib/layout-classes";

const SKELETON_COUNT = 6;

export default function HomePage() {
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
      const apiKeys = getApiKeys();
      const result = await searchRecentChannels(trimmed, apiKeys, undefined, filters);

      setChannels(result.channels);
      upsertChannelsFromSearch(result.channels).catch(() => {});

      if (result.channels.length === 0) {
        setError(
          filters.channelCountry
            ? "لا توجد قنوات مطابقة للفلاتر المحددة. جرّب تغيير الدولة أو المنطقة."
            : "لم يتم العثور على قنوات نشرت مؤخراً بهذه الكلمة"
        );
      }
    } catch (err) {
      setChannels([]);
      if (err instanceof YouTubeApiError) {
        setError(err.message);
      } else {
        setError("تعذر الاتصال بـ YouTube API");
      }
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
      <Header />
      <main className={pageMain}>
        <section className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-800 sm:text-4xl">
            اكتشف قنوات يوتيوب
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-500">
            ابحث بكلمة مفتاحية واعثر على القنوات التي نشرت محتوى حديثاً
          </p>
        </section>

        {!hasSearched && <SuggestedChannels />}

        <SearchForm
          keyword={keyword}
          loading={loading}
          filters={filters}
          onKeywordChange={setKeyword}
          onFiltersChange={handleFiltersChange}
          onSubmit={handleSearch}
          onSelectRecent={runSearch}
        />

        {error && !loading && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 whitespace-pre-line">
            {error}
          </div>
        )}

        {showResults && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium text-stone-700">
                نتائج &quot;{searchedKeyword}&quot;
              </h2>
              {!loading && channels.length > 0 && (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                  {channels.length} قناة
                </span>
              )}
            </div>

            <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <ChannelCardSkeleton key={i} />
                  ))
                : channels.map((channel) => (
                    <ChannelCard key={channel.id} channel={channel} />
                  ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
