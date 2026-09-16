"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import CategoryButtons from "@/components/CategoryButtons";
import LayoutToggle, { cardsContainerClass } from "@/components/LayoutToggle";
import SearchableSelect from "@/components/SearchableSelect";
import TrendingVideoCard from "@/components/TrendingVideoCard";
import { useI18n } from "@/components/I18nProvider";
import NavIcon from "@/components/NavIcon";
import {
  DEFAULT_TRENDING_PREFS,
  getTrendingPrefs,
  getTrendingRegionLabel,
  getTrendingRegionOptions,
  regionDisplayName,
  saveTrendingPrefs,
} from "@/lib/filters";
import { getCategoryLabel } from "@/lib/i18n/categories";
import {
  formatCacheRemaining,
  getCachedTrendingVideos,
  getCachedVideoCategories,
  getCacheRemainingMs,
  getVideosCacheKey,
} from "@/lib/trending-cache";
import { useCardLayout } from "@/lib/use-card-layout";
import { useLocalePath } from "@/lib/use-locale-path";
import { translateYouTubeError } from "@/lib/youtube-errors";
import type { TrendingVideo, VideoCategory } from "@/lib/types";
import { pageMain } from "@/lib/layout-classes";
import PageTitle from "@/components/PageTitle";

export default function TrendingView() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lp = useLocalePath();
  const { layout, setLayout } = useCardLayout();
  const [mounted, setMounted] = useState(false);
  const [regionCode, setRegionCode] = useState(DEFAULT_TRENDING_PREFS.regionCode);
  const [categoryId, setCategoryId] = useState(DEFAULT_TRENDING_PREFS.categoryId);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [cacheRemaining, setCacheRemaining] = useState("");

  const syncUrl = useCallback(
    (region: string, category: string) => {
      const params = new URLSearchParams();
      if (region) params.set("region", region);
      if (category) params.set("category", category);
      const qs = params.toString();
      router.replace(qs ? `${lp("/trending")}?${qs}` : lp("/trending"), {
        scroll: false,
      });
    },
    [lp, router]
  );

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
        const { data: cats, error: errCode } = await getCachedVideoCategories(
          region,
          locale
        );
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
    [loadVideos, locale, t]
  );

  useEffect(() => {
    const prefs = getTrendingPrefs();
    const region =
      searchParams.get("region") || prefs.regionCode || DEFAULT_TRENDING_PREFS.regionCode;
    const category =
      searchParams.get("category") ||
      (!searchParams.get("region") ? prefs.categoryId : "") ||
      "";
    setRegionCode(region);
    setCategoryId(category);
    setMounted(true);
    syncUrl(region, category);
    loadCategoriesAndVideos(region, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once from URL/prefs
  }, []);

  const handleCountryChange = (code: string) => {
    setRegionCode(code);
    setCategoryId("");
    saveTrendingPrefs({ regionCode: code, categoryId: "" });
    syncUrl(code, "");
    loadCategoriesAndVideos(code, "");
  };

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    saveTrendingPrefs({ regionCode, categoryId: id });
    syncUrl(regionCode, id);
    loadVideos(regionCode, id);
  };

  const regionLabel = getTrendingRegionLabel(
    regionCode,
    locale,
    t("common.unspecified")
  );

  const pageHeading = useMemo(() => {
    const country =
      regionDisplayName(regionCode || "US", locale) || t("common.unspecified");
    const category = getCategoryLabel(categoryId, locale, t("category.all"));
    return categoryId
      ? t("seo.trendingCategoryTitle", { category, country })
      : t("seo.trendingTitle", { country });
  }, [categoryId, locale, regionCode, t]);

  if (!mounted) {
    return (
      <>
        <PageTitle title={pageHeading} />
        <Header />
        <main className={pageMain}>
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <PageTitle title={pageHeading} />
      <Header />
      <main className={pageMain}>
        <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
                <NavIcon name="trending" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="min-w-0 text-3xl font-semibold text-stone-800">
                  {pageHeading}
                </h1>
                <p className="mt-2 text-stone-500">{t("trending.subtitle")}</p>
                {fromCache && cacheRemaining && (
                  <p className="mt-2 text-xs text-stone-400">
                    {t("trending.cachedHint", { time: cacheRemaining })}
                  </p>
                )}
              </div>
            </div>
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
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <h2 className="truncate text-lg font-medium text-stone-700">
                {t("trending.trendingIn", { country: regionLabel })}
              </h2>
              {!loadingVideos && videos.length > 0 && (
                <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                  {t("common.videos", { count: videos.length })}
                </span>
              )}
            </div>
            <LayoutToggle layout={layout} onChange={setLayout} />
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
            <div className={cardsContainerClass(layout)}>
              {videos.map((video, index) => (
                <TrendingVideoCard
                  key={video.id}
                  video={video}
                  rank={index + 1}
                  variant={layout}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
