"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import RssVideoCard from "@/components/RssVideoCard";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import { getCachedChannel } from "@/lib/channel-cache";
import { siteRowToChannel, type SiteChannelRow } from "@/lib/channels-db";
import { formatCompactCount, formatCount, formatDate, formatPlainCount, getChannelUrl } from "@/lib/format";
import { getCountryLabel } from "@/lib/filters";
import { shareChannelPage } from "@/lib/share";
import type { RssVideo } from "@/lib/youtube-rss";
import { pageMainChannel } from "@/lib/layout-classes";
import {
  checkChannelLiked,
  fetchLikeCount,
  LIKES_CHANGED,
  toggleChannelLike,
} from "@/lib/likes-service";
import { useLocalePath } from "@/lib/use-locale-path";
import type { Channel } from "@/lib/types";
import LoginPromptModal from "@/components/LoginPromptModal";
import PageTitle from "@/components/PageTitle";

function channelFromRow(
  channelId: string,
  initialRow: SiteChannelRow | null
): Channel | null {
  if (!initialRow) return null;
  return {
    ...siteRowToChannel(initialRow),
    likeCount: initialRow.like_count ?? 0,
  };
}

export default function ChannelView({
  channelId,
  initialRow = null,
}: {
  channelId: string;
  initialRow?: SiteChannelRow | null;
}) {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const lp = useLocalePath();
  const [channel, setChannel] = useState<Channel | null>(() =>
    channelFromRow(channelId, initialRow)
  );
  const [videos, setVideos] = useState<RssVideo[]>([]);
  const [loading, setLoading] = useState(() => !initialRow);
  const [videosLoading, setVideosLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialRow?.like_count ?? 0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fromRow = channelFromRow(channelId, initialRow);
    const cached = getCachedChannel(channelId);
    const seed = cached ?? fromRow;

    if (seed) {
      setChannel(seed);
      setLoading(false);
      setNotFound(false);
      if (initialRow?.like_count != null) {
        setLikeCount(initialRow.like_count);
      }
    }

    async function load() {
      try {
        const [rssRes, count] = await Promise.all([
          fetch(`/api/channel/${channelId}/videos`)
            .then(async (r) => {
              if (!r.ok) return { videos: [] as RssVideo[], channelName: undefined };
              return r.json() as Promise<{
                videos?: RssVideo[];
                channelName?: string;
              }>;
            })
            .catch(() => ({ videos: [] as RssVideo[], channelName: undefined })),
          fetchLikeCount(channelId).catch(() => 0),
        ]);

        if (cancelled) return;

        setVideos(rssRes.videos ?? []);
        setLikeCount((prev) => (prev > 0 ? prev : count));

        if (!seed) {
          if (rssRes.channelName) {
            setChannel({
              id: channelId,
              snippet: {
                title: rssRes.channelName,
                description: "",
                publishedAt: new Date().toISOString(),
                thumbnails: {},
              },
              statistics: {
                viewCount: "0",
                subscriberCount: "0",
                videoCount: "0",
              },
            });
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        if (!cancelled && !seed) setNotFound(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setVideosLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [channelId, initialRow]);

  useEffect(() => {
    checkChannelLiked(channelId, user?.id).then(setLiked).catch(() => setLiked(false));
  }, [channelId, user?.id]);

  const title = channel
    ? t("seo.channelTitle", { name: channel.snippet.title })
    : notFound
      ? t("channel.notFound")
      : t("seo.siteName");

  const thumbnail =
    channel?.snippet.thumbnails.medium?.url ??
    channel?.snippet.thumbnails.default?.url ??
    "";

  const toggleLike = async () => {
    if (!channel) return;
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    const result = await toggleChannelLike(channel, user.id, liked);
    setLikeBusy(false);
    if (!result) return;
    setLiked(result.liked);
    setLikeCount(result.likeCount);
    window.dispatchEvent(new CustomEvent(LIKES_CHANGED));
  };

  const handleShare = async () => {
    if (!channel) return;
    try {
      const result = await shareChannelPage(channelId, channel.snippet.title);
      setShareMsg(result === "shared" ? t("common.shared") : t("common.linkCopied"));
      setTimeout(() => setShareMsg(""), 2000);
    } catch {
      /* cancelled */
    }
  };

  if (loading) {
    return (
      <>
        <PageTitle title={title} />
        <Header />
        <main className={pageMainChannel}>
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  if (notFound && !channel) {
    return (
      <>
        <PageTitle title={title} />
        <Header />
        <main className={`${pageMainChannel} text-center`}>
          <p className="text-stone-500">{t("channel.notFound")}</p>
          <Link href={lp("/")} className="mt-4 inline-block text-sm underline">
            {t("channel.backSearch")}
          </Link>
        </main>
      </>
    );
  }

  if (!channel) return null;

  return (
    <>
      <PageTitle title={title} />
      <Header />
      <main className={pageMainChannel}>
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={channel.snippet.title}
                className="h-20 w-20 shrink-0 rounded-full border border-stone-100 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-stone-100 bg-stone-100 text-2xl font-semibold text-stone-400">
                {channel.snippet.title.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-stone-800">{channel.snippet.title}</h1>
              {channel.snippet.customUrl && (
                <p className="mt-1 text-sm text-stone-500">
                  @{channel.snippet.customUrl.replace("@", "")}
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-4 flex gap-2">
            {shareMsg && (
              <span className="absolute -top-8 start-0 rounded-lg bg-stone-800 px-2 py-1 text-[10px] whitespace-nowrap text-white">
                {shareMsg}
              </span>
            )}
            <button
              type="button"
              onClick={handleShare}
              title={t("common.share")}
              aria-label={t("common.share")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
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
              disabled={likeBusy}
              onClick={toggleLike}
              title={liked ? t("likes.unlike") : t("likes.like")}
              aria-label={liked ? t("likes.unlike") : t("likes.like")}
              className={`flex min-w-10 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 ${
                liked
                  ? "bg-rose-50 text-rose-600 border border-rose-200"
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
              {likeCount > 0 && (
                <span className="text-[10px] font-medium leading-none tabular-nums">
                  {formatCompactCount(likeCount)}
                </span>
              )}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatBox
              label={t("channel.subscribers")}
              value={
                channel.statistics.hiddenSubscriberCount
                  ? t("channel.hidden")
                  : formatCount(channel.statistics.subscriberCount)
              }
            />
            <StatBox
              label={t("channel.totalViews")}
              value={formatCount(channel.statistics.viewCount)}
            />
            <StatBox
              label={t("channel.videoCount")}
              value={formatPlainCount(channel.statistics.videoCount)}
            />
          </div>

          <div className="mt-4 space-y-2 text-sm text-stone-600">
            {channel.snippet.country && (
              <p>
                <span className="text-stone-400">{t("channel.countryLabel")}: </span>
                {getCountryLabel(
                  channel.snippet.country,
                  locale,
                  t("common.unspecified")
                )}
              </p>
            )}
            <p>
              <span className="text-stone-400">{t("channel.addedDate")}: </span>
              {formatDate(channel.snippet.publishedAt)}
            </p>
          </div>

          {channel.snippet.description && (
            <p className="mt-4 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
              {channel.snippet.description.slice(0, 600)}
              {channel.snippet.description.length > 600 ? "..." : ""}
            </p>
          )}

          <a
            href={getChannelUrl(channel)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-stone-800 py-3 text-sm font-medium text-white hover:bg-stone-700"
          >
            {t("channel.visitYoutube")}
          </a>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-medium text-stone-700">
            {t("channel.latestVideos", { name: channel.snippet.title })}
          </h2>

          {videosLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-200 py-10 text-center text-sm text-stone-500">
              {t("channel.noVideos")}
            </p>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <RssVideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </section>
      </main>
      <LoginPromptModal open={loginPrompt} onClose={() => setLoginPrompt(false)} />
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 px-3 py-4 text-center">
      <p className="text-lg font-semibold text-stone-800">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{label}</p>
    </div>
  );
}
