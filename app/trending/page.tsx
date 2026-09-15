"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import CategoryButtons from "@/components/CategoryButtons";
import TrendingVideoCard from "@/components/TrendingVideoCard";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import {
  DEFAULT_TRENDING_PREFS,
  getCountryLabel,
  getTrendingPrefs,
  saveTrendingPrefs,
  TRENDING_COUNTRIES,
} from "@/lib/filters";
import { getApiKeys } from "@/lib/storage";
import {
  formatCacheRemaining,
  getCachedTrendingVideos,
  getCachedVideoCategories,
  getCacheRemainingMs,
  getVideosCacheKey,
} from "@/lib/trending-cache";
import { YouTubeApiError } from "@/lib/youtube";
import type { TrendingVideo, VideoCategory } from "@/lib/types";

export default function TrendingPage() {
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
        const apiKeys = getApiKeys();
        const { data, fromCache: cached } = await getCachedTrendingVideos(
          region,
          apiKeys,
          category || undefined
        );
        setVideos(data);
        setFromCache(cached);
        const remaining = getCacheRemainingMs(
          getVideosCacheKey(region, category)
        );
        setCacheRemaining(formatCacheRemaining(remaining));
        if (data.length === 0) {
          setError("لا توجد فيديوهات ترند في هذا التصنيف");
        }
      } catch (err) {
        setVideos([]);
        if (err instanceof YouTubeApiError) {
          setError(err.message);
        } else {
          setError("تعذر جلب الفيديوهات");
        }
      } finally {
        setLoadingVideos(false);
      }
    },
    []
  );

  const loadCategoriesAndVideos = useCallback(
    async (region: string, category: string) => {
      setLoadingCategories(true);
      setError("");
      try {
        const apiKeys = getApiKeys();
        const { data: cats } = await getCachedVideoCategories(region, apiKeys);
        setCategories(cats);

        const validCategory =
          category && cats.some((c) => c.id === category) ? category : "";
        if (validCategory !== category) {
          setCategoryId(validCategory);
        }

        await loadVideos(region, validCategory);
      } catch (err) {
        setCategories([]);
        setVideos([]);
        if (err instanceof YouTubeApiError) {
          setError(err.message);
        } else {
          setError("تعذر جلب التصنيفات");
        }
      } finally {
        setLoadingCategories(false);
      }
    },
    [loadVideos]
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
        <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <section className="mb-8">
          <h1 className="text-3xl font-semibold text-stone-800">الترند</h1>
          <p className="mt-2 text-stone-500">
            أكثر الفيديوهات مشاهدة حالياً حسب الدولة والتصنيف
          </p>
          {fromCache && cacheRemaining && (
            <p className="mt-2 text-xs text-stone-400">
              بيانات محفوظة محلياً — تُحدَّث بعد {cacheRemaining}
            </p>
          )}
        </section>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-stone-400">الدولة</span>
            <select
              value={regionCode}
              disabled={loadingCategories || loadingVideos}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100 disabled:opacity-50"
            >
              {TRENDING_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-stone-600">التصنيفات</h2>
            {loadingCategories && (
              <span className="text-xs text-stone-400">جاري التحميل...</span>
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
              ترند {getCountryLabel(regionCode)}
            </h2>
            {!loadingVideos && videos.length > 0 && (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                {videos.length} فيديو
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
              <p className="text-sm">جاري جلب الفيديوهات...</p>
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

      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}
