"use client";

import { useEffect, useState } from "react";
import ChannelCard from "@/components/ChannelCard";
import { useI18n } from "@/components/I18nProvider";
import { getFeaturedChannels } from "@/lib/channels-db";
import {
  getSuggestedLayout,
  saveSuggestedLayout,
  type SuggestedLayout,
} from "@/lib/storage";
import type { Channel } from "@/lib/types";

interface SuggestedChannelsProps {
  onHasSuggestions?: (has: boolean) => void;
}

export default function SuggestedChannels({ onHasSuggestions }: SuggestedChannelsProps) {
  const { t } = useI18n();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<SuggestedLayout>("grid");

  useEffect(() => {
    setLayout(getSuggestedLayout());
  }, []);

  useEffect(() => {
    getFeaturedChannels().then((data) => {
      setChannels(data);
      onHasSuggestions?.(data.length > 0);
      setLoading(false);
    });
  }, [onHasSuggestions]);

  const changeLayout = (next: SuggestedLayout) => {
    setLayout(next);
    saveSuggestedLayout(next);
  };

  if (loading || channels.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-stone-700">{t("home.suggested")}</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-stone-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => changeLayout("grid")}
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
              onClick={() => changeLayout("row")}
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
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
            {t("common.channels", { count: channels.length })}
          </span>
        </div>
      </div>
      <div
        className={
          layout === "grid"
            ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-3"
        }
      >
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} variant={layout} />
        ))}
      </div>
    </section>
  );
}
