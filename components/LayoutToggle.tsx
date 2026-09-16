"use client";

import { useI18n } from "@/components/I18nProvider";
import type { SuggestedLayout } from "@/lib/storage";

interface LayoutToggleProps {
  layout: SuggestedLayout;
  onChange: (layout: SuggestedLayout) => void;
}

export default function LayoutToggle({ layout, onChange }: LayoutToggleProps) {
  const { t } = useI18n();

  return (
    <div className="flex shrink-0 rounded-xl border border-stone-200 bg-white p-0.5">
      <button
        type="button"
        onClick={() => onChange("grid")}
        title={t("home.gridView")}
        aria-label={t("home.gridView")}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          layout === "grid"
            ? "bg-stone-800 text-white"
            : "text-stone-500 hover:bg-stone-50"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("row")}
        title={t("home.rowView")}
        aria-label={t("home.rowView")}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          layout === "row"
            ? "bg-stone-800 text-white"
            : "text-stone-500 hover:bg-stone-50"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <line x1="8" x2="21" y1="6" y2="6" />
          <line x1="8" x2="21" y1="12" y2="12" />
          <line x1="8" x2="21" y1="18" y2="18" />
          <line x1="3" x2="3.01" y1="6" y2="6" />
          <line x1="3" x2="3.01" y1="12" y2="12" />
          <line x1="3" x2="3.01" y1="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export function cardsContainerClass(layout: SuggestedLayout, autoRows = false): string {
  if (layout === "row") return "flex flex-col gap-3";
  return autoRows
    ? "grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3"
    : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";
}
