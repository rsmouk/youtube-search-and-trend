"use client";

import SearchableSelect from "@/components/SearchableSelect";
import { useI18n } from "@/components/I18nProvider";
import type { SearchFilters } from "@/lib/filters";
import {
  getCountryOptions,
  getLanguageOptions,
  getPeriodOptions,
} from "@/lib/filters";

interface SearchFiltersBarProps {
  filters: SearchFilters;
  loading: boolean;
  onChange: (filters: SearchFilters) => void;
}

export default function SearchFiltersBar({
  filters,
  loading,
  onChange,
}: SearchFiltersBarProps) {
  const { t, locale } = useI18n();

  const countryOptions = getCountryOptions(locale, t("common.all")).map((c) => ({
    value: c.code,
    label: c.label,
  }));

  const periodOptions = getPeriodOptions(t).map((p) => ({
    value: String(p.value),
    label: p.label,
  }));

  const languageOptions = getLanguageOptions(t).map((l) => ({
    value: l.code,
    label: l.label,
  }));

  const update = (patch: Partial<SearchFilters>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="mt-4 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-sm">
      <p className="mb-3 text-xs font-medium text-stone-500">{t("filters.title")}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchableSelect
          label={t("filters.searchRegion")}
          value={filters.regionCode}
          options={countryOptions}
          disabled={loading}
          placeholder={t("common.allRegions")}
          onChange={(v) => update({ regionCode: v })}
        />

        <SearchableSelect
          label={t("filters.channelCountry")}
          value={filters.channelCountry}
          options={countryOptions}
          disabled={loading}
          placeholder={t("common.allCountries")}
          onChange={(v) => update({ channelCountry: v })}
        />

        <SearchableSelect
          label={t("filters.timePeriod")}
          value={String(filters.periodDays)}
          options={periodOptions}
          disabled={loading}
          onChange={(v) => update({ periodDays: Number(v) })}
        />

        <SearchableSelect
          label={t("filters.contentLanguage")}
          value={filters.relevanceLanguage}
          options={languageOptions}
          disabled={loading}
          placeholder={t("common.allLanguages")}
          onChange={(v) => update({ relevanceLanguage: v })}
        />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-stone-400">{t("filters.hint")}</p>
    </div>
  );
}
