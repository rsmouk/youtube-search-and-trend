"use client";

import { useEffect, useState } from "react";
import ChannelCard from "@/components/ChannelCard";
import { getFeaturedChannels } from "@/lib/channels-db";
import type { Channel } from "@/lib/types";

interface SuggestedChannelsProps {
  onHasSuggestions?: (has: boolean) => void;
}

export default function SuggestedChannels({
  onHasSuggestions,
}: SuggestedChannelsProps) {
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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-stone-700">قنوات مقترحة</h2>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
          {channels.length} قناة
        </span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </section>
  );
}
