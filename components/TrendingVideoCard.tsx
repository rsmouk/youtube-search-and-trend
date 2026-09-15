"use client";

import type { TrendingVideo } from "@/lib/types";
import { formatCount, formatDate } from "@/lib/format";

interface TrendingVideoCardProps {
  video: TrendingVideo;
  rank: number;
  onPlay: (video: TrendingVideo) => void;
}

export default function TrendingVideoCard({
  video,
  rank,
  onPlay,
}: TrendingVideoCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onPlay(video)}
        className="relative aspect-video overflow-hidden bg-stone-100 text-right"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 rounded-lg bg-stone-900/80 px-2 py-1 text-xs font-bold text-white">
          #{rank}
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-stone-900/0 transition-colors group-hover:bg-stone-900/20">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-stone-800 opacity-0 shadow transition-opacity group-hover:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={() => onPlay(video)}
          className="line-clamp-2 text-right text-sm font-semibold leading-relaxed text-stone-800 transition-colors hover:text-stone-600"
        >
          {video.title}
        </button>
        <p className="mt-2 text-xs text-stone-500">{video.channelTitle}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-400">
          <span>{formatCount(video.viewCount)} مشاهدة</span>
          <span>•</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onPlay(video)}
            className="rounded-xl bg-stone-800 px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-stone-700"
          >
            مشاهدة
          </button>
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
