import type { Locale } from "@/lib/i18n";

export interface SearchFilters {
  regionCode: string;
  channelCountry: string;
  periodDays: number;
  relevanceLanguage: string;
}

export const DEFAULT_FILTERS: SearchFilters = {
  regionCode: "",
  channelCountry: "",
  periodDays: 30,
  relevanceLanguage: "",
};

const FILTERS_KEY = "search_filters";

export const COUNTRY_CODES = [
  "",
  "SA",
  "EG",
  "AE",
  "KW",
  "QA",
  "BH",
  "OM",
  "JO",
  "LB",
  "SY",
  "IQ",
  "MA",
  "DZ",
  "TN",
  "LY",
  "SD",
  "YE",
  "PS",
  "US",
  "GB",
  "DE",
  "FR",
  "TR",
  "IN",
  "ES",
] as const;

const COUNTRY_FLAGS: Record<string, string> = {
  SA: "🇸🇦",
  EG: "🇪🇬",
  AE: "🇦🇪",
  KW: "🇰🇼",
  QA: "🇶🇦",
  BH: "🇧🇭",
  OM: "🇴🇲",
  JO: "🇯🇴",
  LB: "🇱🇧",
  SY: "🇸🇾",
  IQ: "🇮🇶",
  MA: "🇲🇦",
  DZ: "🇩🇿",
  TN: "🇹🇳",
  LY: "🇱🇾",
  SD: "🇸🇩",
  YE: "🇾🇪",
  PS: "🇵🇸",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
  TR: "🇹🇷",
  IN: "🇮🇳",
  ES: "🇪🇸",
};

function regionDisplayName(code: string, locale: Locale): string {
  if (!code) return "";
  try {
    // Use Latin script locale for names when Arabic to avoid mixed digit systems
    const displayLocale = locale === "ar" ? "ar" : locale;
    const dn = new Intl.DisplayNames([displayLocale], { type: "region" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

export function getCountryOptions(locale: Locale, allLabel: string) {
  return COUNTRY_CODES.map((code) => ({
    code,
    label: code
      ? `${COUNTRY_FLAGS[code] ?? ""} ${regionDisplayName(code, locale)}`.trim()
      : allLabel,
  }));
}

export function getPeriodOptions(t: (key: string) => string) {
  return [
    { value: 7, label: t("filters.days7") },
    { value: 30, label: t("filters.days30") },
    { value: 90, label: t("filters.days90") },
  ];
}

export function getLanguageOptions(t: (key: string) => string) {
  return [
    { code: "", label: t("common.allLanguages") },
    { code: "ar", label: "العربية" },
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "tr", label: "Türkçe" },
  ];
}

export function getCountryLabel(
  code: string | undefined,
  locale: Locale,
  unspecifiedLabel: string
): string {
  if (!code) return unspecifiedLabel;
  const flag = COUNTRY_FLAGS[code] ?? "";
  const name = regionDisplayName(code, locale);
  return `${flag} ${name}`.trim();
}

export function getSavedFilters(): SearchFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function saveFilters(filters: SearchFilters): void {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}

export function getTrendingRegionOptions(locale: Locale, allLabel: string) {
  return getCountryOptions(locale, allLabel).filter((c) => c.code !== "");
}

export function getTrendingRegionLabel(
  code: string,
  locale: Locale,
  unspecifiedLabel: string
): string {
  return getCountryLabel(code, locale, unspecifiedLabel);
}

export interface TrendingPrefs {
  regionCode: string;
  categoryId: string;
}

export const DEFAULT_TRENDING_PREFS: TrendingPrefs = {
  regionCode: "SA",
  categoryId: "",
};

const TRENDING_PREFS_KEY = "trending_prefs";

export function getTrendingPrefs(): TrendingPrefs {
  if (typeof window === "undefined") return DEFAULT_TRENDING_PREFS;
  try {
    const raw = localStorage.getItem(TRENDING_PREFS_KEY);
    if (!raw) return DEFAULT_TRENDING_PREFS;
    return { ...DEFAULT_TRENDING_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TRENDING_PREFS;
  }
}

export function saveTrendingPrefs(prefs: Partial<TrendingPrefs>): void {
  const current = getTrendingPrefs();
  localStorage.setItem(
    TRENDING_PREFS_KEY,
    JSON.stringify({ ...current, ...prefs })
  );
}
