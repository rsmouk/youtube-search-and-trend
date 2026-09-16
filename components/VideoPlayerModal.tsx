"use client";

import type { TrendingVideo } from "@/lib/types";
import { formatCount, getVideoUrl } from "@/lib/format";

interface VideoPlayerModalProps {
  video: TrendingVideo | null;
  onClose: () => void;
}

export default function VideoPlayerModal({
  video,
  onClose,
}: VideoPlayerModalProps) {
  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h2 className="line-clamp-1 text-base font-semibold text-stone-800">
            {video.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="إغلاق"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>

        <div className="p-5">
          <p className="text-sm text-stone-500">{video.channelTitle}</p>
          <p className="mt-1 text-xs text-stone-400">
            {formatCount(video.viewCount)} مشاهدة
          </p>
          <a
            href={getVideoUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            فتح في YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
