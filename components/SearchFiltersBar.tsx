"use client";

import SearchableSelect from "@/components/SearchableSelect";
import type { SearchFilters } from "@/lib/filters";
import {
  COUNTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  PERIOD_OPTIONS,
} from "@/lib/filters";

interface SearchFiltersBarProps {
  filters: SearchFilters;
  loading: boolean;
  onChange: (filters: SearchFilters) => void;
}

const countryOptions = COUNTRY_OPTIONS.map((c) => ({
  value: c.code,
  label: c.label,
}));

const periodOptions = PERIOD_OPTIONS.map((p) => ({
  value: String(p.value),
  label: p.label,
}));

const languageOptions = LANGUAGE_OPTIONS.map((l) => ({
  value: l.code,
  label: l.label,
}));

export default function SearchFiltersBar({
  filters,
  loading,
  onChange,
}: SearchFiltersBarProps) {
  const update = (patch: Partial<SearchFilters>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="mt-4 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-sm">
      <p className="mb-3 text-xs font-medium text-stone-500">الفلاتر</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchableSelect
          label="منطقة البحث"
          value={filters.regionCode}
          options={countryOptions}
          disabled={loading}
          placeholder="كل المناطق"
          onChange={(v) => update({ regionCode: v })}
        />

        <SearchableSelect
          label="دولة القناة"
          value={filters.channelCountry}
          options={countryOptions}
          disabled={loading}
          placeholder="كل الدول"
          onChange={(v) => update({ channelCountry: v })}
        />

        <SearchableSelect
          label="الفترة الزمنية"
          value={String(filters.periodDays)}
          options={periodOptions}
          disabled={loading}
          onChange={(v) => update({ periodDays: Number(v) })}
        />

        <SearchableSelect
          label="لغة المحتوى"
          value={filters.relevanceLanguage}
          options={languageOptions}
          disabled={loading}
          placeholder="كل اللغات"
          onChange={(v) => update({ relevanceLanguage: v })}
        />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-stone-400">
        منطقة البحث تؤثر على نتائج YouTube. دولة القناة تُفلتر محلياً بدون
        طلب API إضافي.
      </p>
    </div>
  );
}
