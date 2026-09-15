"use client";

import type { TrendingVideo } from "@/lib/types";
import { formatCount, formatDate, getVideoUrl } from "@/lib/format";

interface TrendingVideoCardProps {
  video: TrendingVideo;
  rank: number;
}

export default function TrendingVideoCard({
  video,
  rank,
}: TrendingVideoCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-stone-100">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 rounded-lg bg-stone-900/80 px-2 py-1 text-xs font-bold text-white">
          #{rank}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-relaxed text-stone-800">
          {video.title}
        </h3>
        <p className="mt-2 text-xs text-stone-500">{video.channelTitle}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-400">
          <span>{formatCount(video.viewCount)} مشاهدة</span>
          <span>•</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={getVideoUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-stone-800 px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-stone-700"
          >
            مشاهدة
          </a>
          <a
            href={`https://www.youtube.com/channel/${video.channelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-center text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            القناة
          </a>
        </div>
      </div>
    </article>
  );
}
