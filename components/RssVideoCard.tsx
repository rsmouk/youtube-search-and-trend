"use client";

import type { RssVideo } from "@/lib/youtube-rss";
import { formatDate } from "@/lib/format";

interface RssVideoCardProps {
  video: RssVideo;
  onPlay?: (video: RssVideo) => void;
}

export default function RssVideoCard({ video, onPlay }: RssVideoCardProps) {
  return (
    <article className="flex gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm transition-all hover:shadow-md">
      <button
        type="button"
        onClick={() => onPlay?.(video)}
        className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-stone-100"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover"
        />
      </button>
      <div className="min-w-0 flex-1 py-0.5">
        <button
          type="button"
          onClick={() => onPlay?.(video)}
          className="line-clamp-2 text-right text-sm font-medium leading-relaxed text-stone-800 hover:text-stone-600"
        >
          {video.title}
        </button>
        <p className="mt-2 text-xs text-stone-400">
          {formatDate(video.publishedAt)}
        </p>
        <a
          href={video.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-stone-500 underline hover:text-stone-700"
        >
          YouTube
        </a>
      </div>
    </article>
  );
}
