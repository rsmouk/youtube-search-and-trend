"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import CategoryButtons from "@/components/CategoryButtons";
import SearchableSelect from "@/components/SearchableSelect";
import TrendingVideoCard from "@/components/TrendingVideoCard";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import { useI18n } from "@/components/I18nProvider";
import {
  DEFAULT_TRENDING_PREFS,
  getTrendingPrefs,
  getTrendingRegionLabel,
  getTrendingRegionOptions,
  saveTrendingPrefs,
} from "@/lib/filters";
import {
  formatCacheRemaining,
  getCachedTrendingVideos,
  getCachedVideoCategories,
  getCacheRemainingMs,
  getVideosCacheKey,
} from "@/lib/trending-cache";
import { translateYouTubeError } from "@/lib/youtube";
import type { TrendingVideo, VideoCategory } from "@/lib/types";
import { pageMain } from "@/lib/layout-classes";

export default function TrendingPage() {
  const { t, locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [regionCode, setRegionCode] = useState(DEFAULT_TRENDING_PREFS.regionCode);
  const [categoryId, setCategoryId] = useState(DEFAULT_TRENDING_PREFS.categoryId);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<TrendingVideo | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheRemaining, setCacheRemaining] = useState("");

  const loadVideos = useCallback(
    async (region: string, category: string) => {
      setLoadingVideos(true);
      setError("");
      try {
        const { data, fromCache: cached, error: errCode } =
          await getCachedTrendingVideos(region, category || undefined);
        if (errCode) {
          setVideos([]);
          setError(translateYouTubeError(errCode, t));
          return;
        }
        setVideos(data);
        setFromCache(cached);
        const remaining = getCacheRemainingMs(getVideosCacheKey(region, category));
        setCacheRemaining(formatCacheRemaining(remaining, t));
        if (data.length === 0) {
          setError(t("trending.noVideos"));
        }
      } catch {
        setVideos([]);
        setError(t("trending.fetchVideosError"));
      } finally {
        setLoadingVideos(false);
      }
    },
    [t]
  );

  const loadCategoriesAndVideos = useCallback(
    async (region: string, category: string) => {
      setLoadingCategories(true);
      setError("");
      try {
        const { data: cats, error: errCode } = await getCachedVideoCategories(region);
        if (errCode) {
          setCategories([]);
          setVideos([]);
          setError(translateYouTubeError(errCode, t));
          return;
        }
        setCategories(cats);

        const validCategory =
          category && cats.some((c) => c.id === category) ? category : "";
        if (validCategory !== category) {
          setCategoryId(validCategory);
        }

        await loadVideos(region, validCategory);
      } catch {
        setCategories([]);
        setVideos([]);
        setError(t("trending.fetchCategoriesError"));
      } finally {
        setLoadingCategories(false);
      }
    },
    [loadVideos, t]
  );

  useEffect(() => {
    const prefs = getTrendingPrefs();
    setRegionCode(prefs.regionCode);
    setCategoryId(prefs.categoryId);
    setMounted(true);
    loadCategoriesAndVideos(prefs.regionCode, prefs.categoryId);
  }, [loadCategoriesAndVideos]);

  const handleCountryChange = (code: string) => {
    setRegionCode(code);
    setCategoryId("");
    saveTrendingPrefs({ regionCode: code, categoryId: "" });
    loadCategoriesAndVideos(code, "");
  };

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    saveTrendingPrefs({ regionCode, categoryId: id });
    loadVideos(regionCode, id);
  };

  if (!mounted) {
    return (
      <>
        <Header />
        <main className={pageMain}>
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  const regionLabel = getTrendingRegionLabel(
    regionCode,
    locale,
    t("common.unspecified")
  );

  return (
    <>
      <Header />
      <main className={pageMain}>
        <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold text-stone-800">{t("trending.title")}</h1>
            <p className="mt-2 text-stone-500">{t("trending.subtitle")}</p>
            {fromCache && cacheRemaining && (
              <p className="mt-2 text-xs text-stone-400">
                {t("trending.cachedHint", { time: cacheRemaining })}
              </p>
            )}
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm lg:w-80">
            <SearchableSelect
              label={t("trending.country")}
              value={regionCode}
              options={getTrendingRegionOptions(locale, t("common.all")).map((c) => ({
                value: c.code,
                label: c.label,
              }))}
              disabled={loadingCategories || loadingVideos}
              placeholder={t("trending.searchCountry")}
              menuMaxHeight={280}
              onChange={handleCountryChange}
            />
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-stone-600">{t("trending.categories")}</h2>
            {loadingCategories && (
              <span className="text-xs text-stone-400">{t("trending.loadingCategories")}</span>
            )}
          </div>
          <CategoryButtons
            categories={categories}
            selectedId={categoryId}
            loading={loadingCategories || loadingVideos}
            onSelect={handleCategorySelect}
          />
        </section>

        <section className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-stone-700">
              {t("trending.trendingIn", { country: regionLabel })}
            </h2>
            {!loadingVideos && videos.length > 0 && (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                {t("common.videos", { count: videos.length })}
              </span>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 whitespace-pre-line">
              {error}
            </div>
          )}

          {loadingVideos ? (
            <div className="flex flex-col items-center gap-3 py-16 text-stone-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-500" />
              <p className="text-sm">{t("trending.loadingVideos")}</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, index) => (
                <TrendingVideoCard
                  key={video.id}
                  video={video}
                  rank={index + 1}
                  onPlay={setSelectedVideo}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </>
  );
}
