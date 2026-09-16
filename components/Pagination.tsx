"use client";

import { useI18n } from "@/components/I18nProvider";
import { getPageNumbers } from "@/lib/pagination";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  start,
  end,
  onChange,
}: PaginationProps) {
  const { t } = useI18n();

  if (total === 0 || totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
      aria-label={t("pagination.label")}
    >
      <p className="text-sm text-stone-500">
        {t("pagination.showing", { start, end, total })}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("pagination.prev")}
        </button>

        {pages.map((item, index) =>
          item === "…" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-stone-400"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`min-w-10 rounded-xl px-3 py-2 text-sm transition-colors ${
                item === page
                  ? "bg-stone-800 font-medium text-white"
                  : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("pagination.next")}
        </button>
      </div>
    </nav>
  );
}
