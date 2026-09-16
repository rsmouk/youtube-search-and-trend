"use client";

import { useEffect, useState } from "react";
import ChannelCard from "@/components/ChannelCard";
import LayoutToggle, { cardsContainerClass } from "@/components/LayoutToggle";
import { useI18n } from "@/components/I18nProvider";
import { getFeaturedChannels } from "@/lib/channels-db";
import { useCardLayout } from "@/lib/use-card-layout";
import type { Channel } from "@/lib/types";

interface SuggestedChannelsProps {
  onHasSuggestions?: (has: boolean) => void;
}

export default function SuggestedChannels({ onHasSuggestions }: SuggestedChannelsProps) {
  const { t } = useI18n();
  const { layout, setLayout } = useCardLayout();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedChannels().then((data) => {
      setChannels(data);
      onHasSuggestions?.(data.length > 0);
      setLoading(false);
    });
  }, [onHasSuggestions]);

  if (loading || channels.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="text-lg font-medium text-stone-700">{t("home.suggested")}</h2>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
            {t("common.channels", { count: channels.length })}
          </span>
        </div>
        <LayoutToggle layout={layout} onChange={setLayout} />
      </div>
      <div className={cardsContainerClass(layout)}>
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} variant={layout} />
        ))}
      </div>
    </section>
  );
}
