"use client";

import Link from "next/link";
import type { Channel } from "@/lib/types";
import { formatCompactCount, formatCount, getChannelUrl } from "@/lib/format";
import { cacheChannel } from "@/lib/channel-cache";
import { shareChannelPage } from "@/lib/share";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import LoginPromptModal from "@/components/LoginPromptModal";
import {
  checkChannelLiked,
  fetchLikeCount,
  LIKES_CHANGED,
  toggleChannelLike,
} from "@/lib/likes-service";
import { useLocalePath } from "@/lib/use-locale-path";
import { useEffect, useState } from "react";

interface ChannelCardProps {
  channel: Channel;
  onLikeChange?: () => void;
  variant?: "grid" | "row";
}

export default function ChannelCard({
  channel,
  onLikeChange,
  variant = "grid",
}: ChannelCardProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const lp = useLocalePath();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(channel.likeCount ?? 0);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [loginPrompt, setLoginPrompt] = useState(false);
  const thumbnail =
    channel.snippet.thumbnails.medium?.url ??
    channel.snippet.thumbnails.default?.url ??
    "";

  useEffect(() => {
    let active = true;
    setChecking(true);
    setLikeCount(channel.likeCount ?? 0);

    Promise.all([
      checkChannelLiked(channel.id, user?.id),
      channel.likeCount === undefined
        ? fetchLikeCount(channel.id)
        : Promise.resolve(channel.likeCount),
    ]).then(([isLiked, count]) => {
      if (!active) return;
      setLiked(isLiked);
      setLikeCount(count);
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, [channel.id, channel.likeCount, user?.id]);

  const toggleLike = async () => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    if (busy) return;
    setBusy(true);
    const result = await toggleChannelLike(channel, user.id, liked);
    setBusy(false);
    if (!result) return;
    setLiked(result.liked);
    setLikeCount(result.likeCount);
    onLikeChange?.();
    window.dispatchEvent(new CustomEvent(LIKES_CHANGED));
  };

  const handleShare = async () => {
    try {
      const result = await shareChannelPage(channel.id, channel.snippet.title);
      setShareMsg(result === "shared" ? t("common.shared") : t("common.linkCopied"));
      setTimeout(() => setShareMsg(""), 2000);
    } catch {
      /* cancelled */
    }
  };

  const subscriberLabel = channel.statistics.hiddenSubscriberCount
    ? t("common.subscribersHidden")
    : t("common.subscribers", {
        count: formatCount(channel.statistics.subscriberCount),
      });

  const likeButton = (
    <button
      type="button"
      disabled={checking || busy}
      onClick={toggleLike}
      title={liked ? t("likes.unlike") : t("likes.like")}
      aria-label={liked ? t("likes.unlike") : t("likes.like")}
      className={`flex min-w-9 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1 transition-colors disabled:opacity-50 ${
        liked
          ? "border border-rose-200 bg-rose-50 text-rose-600"
          : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="text-[10px] font-medium leading-none tabular-nums">
        {formatCompactCount(likeCount)}
      </span>
    </button>
  );

  const actions = (
    <div className="relative flex items-center gap-2">
      {shareMsg && (
        <span className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-stone-800 px-2 py-1 text-[10px] text-white">
          {shareMsg}
        </span>
      )}
      <a
        href={getChannelUrl(channel)}
        target="_blank"
        rel="noopener noreferrer"
        className={`rounded-xl bg-stone-800 text-center text-xs font-medium text-white transition-colors hover:bg-stone-700 ${
          variant === "row" ? "px-3 py-2" : "flex-1 px-3 py-2"
        }`}
      >
        {t("common.open")}
      </a>
      <Link
        href={lp(`/channel/${channel.id}`)}
        onClick={() => cacheChannel(channel)}
        className={`rounded-xl border border-stone-200 bg-white text-center text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 ${
          variant === "row" ? "px-3 py-2" : "flex-1 px-3 py-2"
        }`}
      >
        {t("common.details")}
      </Link>
      <button
        type="button"
        onClick={handleShare}
        title={t("common.share")}
        aria-label={t("common.share")}
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
      {likeButton}
    </div>
  );

  return (
    <>
      {variant === "row" ? (
        <article className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href={lp(`/channel/${channel.id}`)} onClick={() => cacheChannel(channel)}>
              <img
                src={thumbnail}
                alt={channel.snippet.title}
                className="h-12 w-12 shrink-0 rounded-full border border-stone-100 object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={lp(`/channel/${channel.id}`)}
                onClick={() => cacheChannel(channel)}
                className="block truncate text-sm font-semibold text-stone-800 hover:text-stone-600"
              >
                {channel.snippet.title}
              </Link>
              <p className="mt-0.5 text-xs text-stone-500">{subscriberLabel}</p>
            </div>
          </div>
          <div className="shrink-0 overflow-x-auto">{actions}</div>
        </article>
      ) : (
        <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex flex-1 items-start gap-4 p-4">
            <Link href={lp(`/channel/${channel.id}`)} onClick={() => cacheChannel(channel)}>
              <img
                src={thumbnail}
                alt={channel.snippet.title}
                className="h-16 w-16 shrink-0 rounded-full border border-stone-100 object-cover transition-opacity hover:opacity-90"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={lp(`/channel/${channel.id}`)}
                onClick={() => cacheChannel(channel)}
                className="block truncate text-base font-semibold text-stone-800 hover:text-stone-600"
              >
                {channel.snippet.title}
              </Link>
              <p className="mt-1 text-sm text-stone-500">{subscriberLabel}</p>
              <p
                className={`mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-stone-400 ${
                  channel.recentVideoTitle ? "" : "invisible"
                }`}
              >
                {channel.recentVideoTitle
                  ? t("common.lastVideo", { title: channel.recentVideoTitle })
                  : "placeholder"}
              </p>
            </div>
          </div>

          <div className="mt-auto border-t border-stone-100 bg-stone-50/60 p-3">{actions}</div>
        </article>
      )}

      <LoginPromptModal open={loginPrompt} onClose={() => setLoginPrompt(false)} />
    </>
  );
}
