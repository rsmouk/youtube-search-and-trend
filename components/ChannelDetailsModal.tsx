"use client";

import type { Channel } from "@/lib/types";
import { formatCount, formatDate, getChannelUrl } from "@/lib/format";

interface ChannelDetailsModalProps {
  channel: Channel | null;
  onClose: () => void;
}

export default function ChannelDetailsModal({
  channel,
  onClose,
}: ChannelDetailsModalProps) {
  if (!channel) return null;

  const thumbnail =
    channel.snippet.thumbnails.high?.url ??
    channel.snippet.thumbnails.medium?.url ??
    channel.snippet.thumbnails.default?.url ??
    "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/30 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-stone-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-stone-800">تفاصيل القناة</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="إغلاق"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <img
              src={thumbnail}
              alt={channel.snippet.title}
              className="h-20 w-20 rounded-full border border-stone-100 object-cover"
            />
            <div>
              <h3 className="text-xl font-semibold text-stone-800">
                {channel.snippet.title}
              </h3>
              {channel.snippet.customUrl && (
                <p className="text-sm text-stone-500">
                  @{channel.snippet.customUrl.replace("@", "")}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatBox
              label="المشتركون"
              value={
                channel.statistics.hiddenSubscriberCount
                  ? "مخفيون"
                  : formatCount(channel.statistics.subscriberCount)
              }
            />
            <StatBox
              label="المشاهدات"
              value={formatCount(channel.statistics.viewCount)}
            />
            <StatBox
              label="الفيديوهات"
              value={formatCount(channel.statistics.videoCount)}
            />
          </div>

          <div className="mt-6 space-y-3 text-sm text-stone-600">
            <InfoRow label="تاريخ الإنشاء" value={formatDate(channel.snippet.publishedAt)} />
            {channel.snippet.country && (
              <InfoRow label="البلد" value={channel.snippet.country} />
            )}
            {channel.recentVideoTitle && (
              <InfoRow label="آخر فيديو مطابق" value={channel.recentVideoTitle} />
            )}
            {channel.recentVideoPublishedAt && (
              <InfoRow
                label="تاريخ النشر"
                value={formatDate(channel.recentVideoPublishedAt)}
              />
            )}
          </div>

          {channel.snippet.description && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-stone-700">الوصف</p>
              <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
                {channel.snippet.description.slice(0, 500)}
                {channel.snippet.description.length > 500 ? "..." : ""}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-stone-400">
            البيانات من طلب API واحد — بدون طلبات إضافية
          </p>

          <a
            href={getChannelUrl(channel)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            زيارة القناة على يوتيوب
          </a>
        </div>
      </div>
    </div>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-stone-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-700">{value}</span>
    </div>
  );
}
