import type { Metadata } from "next";
import { createTranslator, LOCALES, type Locale } from "@/lib/i18n";
import { getCategoryLabel } from "@/lib/i18n/categories";
import { regionDisplayName } from "@/lib/filters";

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function localePath(locale: Locale, path = ""): string {
  const clean = path.startsWith("/") ? path : path ? `/${path}` : "";
  // English is the default locale and uses unprefixed URLs (/ not /en)
  if (locale === "en") {
    return clean || "/";
  }
  if (!clean || clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function buildAlternates(
  locale: Locale,
  path: string,
  search = ""
): Metadata["alternates"] {
  const site = getSiteUrl();
  const query = search
    ? search.startsWith("?")
      ? search
      : `?${search}`
    : "";
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = `${site}${localePath(loc, path)}${query}`;
  }
  languages["x-default"] = `${site}${localePath("en", path)}${query}`;

  return {
    canonical: `${site}${localePath(locale, path)}${query}`,
    languages,
  };
}

export function buildPageMetadata(
  locale: Locale,
  options: {
    title: string;
    description: string;
    path: string;
    search?: string;
    openGraphType?: "website" | "article";
    images?: string[];
  }
): Metadata {
  const site = getSiteUrl();
  const url = `${site}${localePath(locale, options.path)}${
    options.search
      ? options.search.startsWith("?")
        ? options.search
        : `?${options.search}`
      : ""
  }`;

  return {
    title: options.title,
    description: options.description,
    alternates: buildAlternates(locale, options.path, options.search),
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      siteName: createTranslator(locale).t("seo.siteName"),
      locale,
      type: options.openGraphType ?? "website",
      ...(options.images?.length ? { images: options.images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      ...(options.images?.length ? { images: options.images } : {}),
    },
  };
}

export function resolveLocale(value: string): Locale {
  return (LOCALES as readonly string[]).includes(value)
    ? (value as Locale)
    : "en";
}

export function trendingMetadata(
  locale: Locale,
  regionCode: string,
  categoryId: string
): Metadata {
  const { t } = createTranslator(locale);
  const country =
    regionDisplayName(regionCode || "US", locale) || t("common.unspecified");
  const category = getCategoryLabel(categoryId, locale, t("category.all"));

  const title = categoryId
    ? t("seo.trendingCategoryTitle", { category, country })
    : t("seo.trendingTitle", { country });
  const description = categoryId
    ? t("seo.trendingCategoryDescription", { category, country })
    : t("seo.trendingDescription", { country });

  const params = new URLSearchParams();
  if (regionCode) params.set("region", regionCode);
  if (categoryId) params.set("category", categoryId);
  const search = params.toString();

  return buildPageMetadata(locale, {
    title,
    description,
    path: "/trending",
    search,
  });
}
