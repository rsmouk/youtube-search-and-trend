"use client";

import type { RssVideo } from "@/lib/youtube-rss";
import { formatDate } from "@/lib/format";

interface RssVideoCardProps {
  video: RssVideo;
}

export default function RssVideoCard({ video }: RssVideoCardProps) {
  return (
    <a
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-2 text-start text-sm font-medium leading-relaxed text-stone-800">
          {video.title}
        </p>
        <p className="mt-2 text-xs text-stone-400">{formatDate(video.publishedAt)}</p>
      </div>
    </a>
  );
}
