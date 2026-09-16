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
  const [showFilters, setShowFilters] = useState(false);

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

          {recentSearches.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
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
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !keyword.trim()}
          className="h-fit rounded-2xl bg-stone-800 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50 sm:shrink-0"
        >
          {loading ? "جاري البحث..." : "بحث"}
        </button>
      </div>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
        </button>
      </div>

      {showFilters && (
        <SearchFiltersBar
          filters={filters}
          loading={loading}
          onChange={onFiltersChange}
        />
      )}

      <p className="mt-3 text-center text-xs text-stone-400">
        يعرض القنوات التي نشرت فيديوهات حديثة تحتوي على كلمتك
      </p>
    </form>
  );
}
