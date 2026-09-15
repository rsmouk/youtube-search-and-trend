"use client";

import { useEffect, useState } from "react";
import SearchFiltersBar from "@/components/SearchFiltersBar";
import type { SearchFilters } from "@/lib/filters";
import {
  getRecentSearches,
  SEARCH_HISTORY_CHANGED,
} from "@/lib/storage";

interface SearchFormProps {
  keyword: string;
  loading: boolean;
  filters: SearchFilters;
  onKeywordChange: (value: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSelectRecent?: (keyword: string) => void;
}

export default function SearchForm({
  keyword,
  loading,
  filters,
  onKeywordChange,
  onFiltersChange,
  onSubmit,
  onSelectRecent,
}: SearchFormProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const updateHistory = () => setRecentSearches(getRecentSearches());
    updateHistory();

    window.addEventListener(SEARCH_HISTORY_CHANGED, updateHistory);
    window.addEventListener("storage", updateHistory);

    return () => {
      window.removeEventListener(SEARCH_HISTORY_CHANGED, updateHistory);
      window.removeEventListener("storage", updateHistory);
    };
  }, []);

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="ابحث عن كلمة... مثل: برمجة، طبخ، تصميم"
            className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !keyword.trim()}
          className="rounded-2xl bg-stone-800 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "جاري البحث..." : "بحث"}
        </button>
      </div>

      <SearchFiltersBar
        filters={filters}
        loading={loading}
        onChange={onFiltersChange}
      />

      {recentSearches.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-stone-400">آخر عمليات البحث</p>
          <div className="flex flex-wrap justify-center gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                disabled={loading}
                onClick={() => onSelectRecent?.(term)}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800 disabled:opacity-50"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-center text-xs text-stone-400">
        يعرض القنوات التي نشرت فيديوهات حديثة تحتوي على كلمتك
      </p>
    </form>
  );
}
