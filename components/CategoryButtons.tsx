"use client";

import type { VideoCategory } from "@/lib/types";

interface CategoryButtonsProps {
  categories: VideoCategory[];
  selectedId: string;
  loading: boolean;
  onSelect: (categoryId: string) => void;
}

export default function CategoryButtons({
  categories,
  selectedId,
  loading,
  onSelect,
}: CategoryButtonsProps) {
  const allCategories: VideoCategory[] = [
    { id: "", title: "الكل" },
    ...categories,
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {allCategories.map((category) => {
        const active = selectedId === category.id;
        return (
          <button
            key={category.id || "all"}
            type="button"
            disabled={loading}
            onClick={() => onSelect(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
              active
                ? "bg-stone-800 text-white shadow-sm"
                : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            {category.title}
          </button>
        );
      })}
    </div>
  );
}
