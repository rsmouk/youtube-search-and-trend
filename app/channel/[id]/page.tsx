"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import RssVideoCard from "@/components/RssVideoCard";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import { getCachedChannel } from "@/lib/channel-cache";
import { getSiteChannelById, siteRowToChannel } from "@/lib/channels-db";
import { channelToSaved } from "@/lib/channel-utils";
import { formatCount, formatDate, formatPlainCount, getChannelUrl } from "@/lib/format";
import { getCountryLabel } from "@/lib/filters";
import { shareChannelPage } from "@/lib/share";
import type { RssVideo } from "@/lib/youtube-rss";
import { pageMainChannel } from "@/lib/layout-classes";
import {
  checkChannelSaved,
  removeChannelForUser,
  saveChannelForUser,
} from "@/lib/saved-service";
import type { Channel } from "@/lib/types";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.id as string;
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<RssVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    Promise.all([
      getSiteChannelById(channelId),
      fetch(`/api/channel/${channelId}/videos`).then((r) => r.json()),
    ]).then(([row, rssData]) => {
      const cached = getCachedChannel(channelId);
      if (cached) {
        setChannel(cached);
      } else if (row) {
        setChannel(siteRowToChannel(row));
      } else if (rssData.channelName) {
        setChannel({
          id: channelId,
          snippet: {
            title: rssData.channelName,
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
      } else {
        setNotFound(true);
      }
      setVideos(rssData.videos ?? []);
      setLoading(false);
      setVideosLoading(false);
    });
  }, [channelId]);

  useEffect(() => {
    checkChannelSaved(channelId, user?.id).then(setSaved);
  }, [channelId, user?.id]);

  const thumbnail =
    channel?.snippet.thumbnails.medium?.url ??
    channel?.snippet.thumbnails.default?.url ??
    "";

  const toggleSave = async () => {
    if (!channel) return;
    if (saved) {
      await removeChannelForUser(channelId, user?.id);
      setSaved(false);
    } else {
      await saveChannelForUser(channelToSaved(channel, thumbnail), user?.id);
      setSaved(true);
    }
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
        <Header />
        <main className={`${pageMainChannel} text-center`}>
          <p className="text-stone-500">{t("channel.notFound")}</p>
          <Link href="/" className="mt-4 inline-block text-sm underline">
            {t("channel.backSearch")}
          </Link>
        </main>
      </>
    );
  }

  if (!channel) return null;

  return (
    <>
      <Header />
      <main className={pageMainChannel}>
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={thumbnail}
              alt={channel.snippet.title}
              className="h-20 w-20 shrink-0 rounded-full border border-stone-100 object-cover"
            />
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
              onClick={toggleSave}
              title={saved ? t("common.saved") : t("common.save")}
              aria-label={t("common.save")}
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
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
