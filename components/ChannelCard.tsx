"use client";

import Link from "next/link";
import type { Channel } from "@/lib/types";
import { formatCount, getChannelUrl } from "@/lib/format";
import { cacheChannel } from "@/lib/channel-cache";
import { channelToSaved } from "@/lib/channel-utils";
import { shareChannelPage } from "@/lib/share";
import { useAuth } from "@/components/AuthProvider";
import {
  checkChannelSaved,
  removeChannelForUser,
  saveChannelForUser,
} from "@/lib/saved-service";
import { useEffect, useState } from "react";

interface ChannelCardProps {
  channel: Channel;
  onSavedChange?: () => void;
}

export default function ChannelCard({
  channel,
  onSavedChange,
}: ChannelCardProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(true);
  const [shareMsg, setShareMsg] = useState("");
  const thumbnail =
    channel.snippet.thumbnails.medium?.url ??
    channel.snippet.thumbnails.default?.url ??
    "";

  useEffect(() => {
    let active = true;
    setChecking(true);
    checkChannelSaved(channel.id, user?.id).then((isSaved) => {
      if (active) {
        setSaved(isSaved);
        setChecking(false);
      }
    });
    return () => {
      active = false;
    };
  }, [channel.id, user?.id]);

  const toggleSave = async () => {
    if (saved) {
      await removeChannelForUser(channel.id, user?.id);
      setSaved(false);
    } else {
      await saveChannelForUser(channelToSaved(channel, thumbnail), user?.id);
      setSaved(true);
    }
    onSavedChange?.();
  };

  const handleShare = async () => {
    try {
      const result = await shareChannelPage(
        channel.id,
        channel.snippet.title
      );
      setShareMsg(result === "shared" ? "تمت المشاركة" : "تم نسخ الرابط");
      setTimeout(() => setShareMsg(""), 2000);
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-1 items-start gap-4 p-4">
        <Link href={`/channel/${channel.id}`} onClick={() => cacheChannel(channel)}>
          <img
            src={thumbnail}
            alt={channel.snippet.title}
            className="h-16 w-16 shrink-0 rounded-full border border-stone-100 object-cover transition-opacity hover:opacity-90"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/channel/${channel.id}`}
            onClick={() => cacheChannel(channel)}
            className="block truncate text-base font-semibold text-stone-800 hover:text-stone-600"
          >
            {channel.snippet.title}
          </Link>
          <p className="mt-1 text-sm text-stone-500">
            {channel.statistics.hiddenSubscriberCount
              ? "المشتركون مخفيون"
              : `${formatCount(channel.statistics.subscriberCount)} مشترك`}
          </p>
          <p
            className={`mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-stone-400 ${
              channel.recentVideoTitle ? "" : "invisible"
            }`}
          >
            {channel.recentVideoTitle
              ? `آخر فيديو: ${channel.recentVideoTitle}`
              : "placeholder"}
          </p>
        </div>
      </div>

      <div className="relative mt-auto border-t border-stone-100 bg-stone-50/60 p-3">
        {shareMsg && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-stone-800 px-2 py-1 text-[10px] text-white">
            {shareMsg}
          </span>
        )}
        <div className="flex items-center gap-2">
          <a
            href={getChannelUrl(channel)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-stone-800 px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-stone-700"
          >
            فتح القناة
          </a>
          <Link
            href={`/channel/${channel.id}`}
            onClick={() => cacheChannel(channel)}
            className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-center text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            التفاصيل
          </Link>
          <button
            type="button"
            onClick={handleShare}
            title="مشاركة"
            aria-label="مشاركة القناة"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
          </button>
          <button
            type="button"
            disabled={checking}
            onClick={toggleSave}
            title={saved ? "محفوظة" : "حفظ"}
            aria-label={saved ? "إزالة من المحفوظات" : "حفظ القناة"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-50 ${
              saved
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
