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

export const PERIOD_OPTIONS = [
  { value: 7, label: "7 أيام" },
  { value: 30, label: "30 يوم" },
  { value: 90, label: "90 يوم" },
];

export const LANGUAGE_OPTIONS = [
  { code: "", label: "كل اللغات" },
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "tr", label: "Türkçe" },
];

export const COUNTRY_OPTIONS = [
  { code: "", label: "الكل" },
  { code: "SA", label: "🇸🇦 السعودية" },
  { code: "EG", label: "🇪🇬 مصر" },
  { code: "AE", label: "🇦🇪 الإمارات" },
  { code: "KW", label: "🇰🇼 الكويت" },
  { code: "QA", label: "🇶🇦 قطر" },
  { code: "BH", label: "🇧🇭 البحرين" },
  { code: "OM", label: "🇴🇲 عُمان" },
  { code: "JO", label: "🇯🇴 الأردن" },
  { code: "LB", label: "🇱🇧 لبنان" },
  { code: "SY", label: "🇸🇾 سوريا" },
  { code: "IQ", label: "🇮🇶 العراق" },
  { code: "MA", label: "🇲🇦 المغرب" },
  { code: "DZ", label: "🇩🇿 الجزائر" },
  { code: "TN", label: "🇹🇳 تونس" },
  { code: "LY", label: "🇱🇾 ليبيا" },
  { code: "SD", label: "🇸🇩 السودان" },
  { code: "YE", label: "🇾🇪 اليمن" },
  { code: "PS", label: "🇵🇸 فلسطين" },
  { code: "US", label: "🇺🇸 أمريكا" },
  { code: "GB", label: "🇬🇧 بريطانيا" },
  { code: "DE", label: "🇩🇪 ألمانيا" },
  { code: "FR", label: "🇫🇷 فرنسا" },
  { code: "TR", label: "🇹🇷 تركيا" },
  { code: "IN", label: "🇮🇳 الهند" },
];

export function getCountryLabel(code: string | undefined): string {
  if (!code) return "غير محدد";
  return COUNTRY_OPTIONS.find((c) => c.code === code)?.label ?? code;
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

export const TRENDING_COUNTRIES = COUNTRY_OPTIONS.filter((c) => c.code !== "");

const TRENDING_PREFS_KEY = "trending_prefs";

export interface TrendingPrefs {
  regionCode: string;
  categoryId: string;
}

export const DEFAULT_TRENDING_PREFS: TrendingPrefs = {
  regionCode: "SA",
  categoryId: "",
};

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

export function saveTrendingPrefs(prefs: TrendingPrefs): void {
  localStorage.setItem(TRENDING_PREFS_KEY, JSON.stringify(prefs));
}
