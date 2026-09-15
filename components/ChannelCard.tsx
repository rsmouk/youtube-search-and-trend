"use client";

import type { Channel } from "@/lib/types";
import { formatCount, getChannelUrl } from "@/lib/format";
import { isChannelSaved, saveChannel, removeSavedChannel } from "@/lib/storage";
import { useState } from "react";

interface ChannelCardProps {
  channel: Channel;
  onDetails: (channel: Channel) => void;
  onSavedChange?: () => void;
}

export default function ChannelCard({
  channel,
  onDetails,
  onSavedChange,
}: ChannelCardProps) {
  const [saved, setSaved] = useState(() => isChannelSaved(channel.id));
  const thumbnail =
    channel.snippet.thumbnails.medium?.url ??
    channel.snippet.thumbnails.default?.url ??
    "";

  const toggleSave = () => {
    if (saved) {
      removeSavedChannel(channel.id);
      setSaved(false);
    } else {
      saveChannel({
        id: channel.id,
        title: channel.snippet.title,
        thumbnail,
        subscriberCount: channel.statistics.subscriberCount ?? "0",
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        savedAt: new Date().toISOString(),
      });
      setSaved(true);
    }
    onSavedChange?.();
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4 p-4">
        <img
          src={thumbnail}
          alt={channel.snippet.title}
          className="h-16 w-16 shrink-0 rounded-full border border-stone-100 object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-stone-800">
            {channel.snippet.title}
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            {channel.statistics.hiddenSubscriberCount
              ? "المشتركون مخفيون"
              : `${formatCount(channel.statistics.subscriberCount)} مشترك`}
          </p>
          {channel.recentVideoTitle && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-400">
              آخر فيديو: {channel.recentVideoTitle}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-stone-100 bg-stone-50/60 p-3">
        <a
          href={getChannelUrl(channel)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-stone-800 px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-stone-700"
        >
          فتح القناة
        </a>
        <button
          type="button"
          onClick={() => onDetails(channel)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
        >
          التفاصيل
        </button>
        <button
          type="button"
          onClick={toggleSave}
          className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
            saved
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          {saved ? "محفوظة" : "حفظ"}
        </button>
      </div>
    </article>
  );
}
