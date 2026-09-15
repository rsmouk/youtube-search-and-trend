"use client";

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

function FilterSelect({
  label,
  value,
  disabled,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  disabled: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-stone-400">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition-colors focus:border-stone-300 focus:ring-4 focus:ring-stone-100 disabled:opacity-50"
      >
        {children}
      </select>
    </label>
  );
}

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
        <FilterSelect
          label="منطقة البحث"
          value={filters.regionCode}
          disabled={loading}
          onChange={(v) => update({ regionCode: v })}
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={`region-${c.code}`} value={c.code}>
              {c.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="دولة القناة"
          value={filters.channelCountry}
          disabled={loading}
          onChange={(v) => update({ channelCountry: v })}
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={`country-${c.code}`} value={c.code}>
              {c.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="الفترة الزمنية"
          value={filters.periodDays}
          disabled={loading}
          onChange={(v) => update({ periodDays: Number(v) })}
        >
          {PERIOD_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="لغة المحتوى"
          value={filters.relevanceLanguage}
          disabled={loading}
          onChange={(v) => update({ relevanceLanguage: v })}
        >
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </FilterSelect>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-stone-400">
        منطقة البحث تؤثر على نتائج YouTube. دولة القناة تُفلتر محلياً بدون
        طلب API إضافي.
      </p>
    </div>
  );
}
