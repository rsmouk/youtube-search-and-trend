"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { getSavedChannels, removeSavedChannel } from "@/lib/storage";
import { formatCount, formatDate, getChannelUrl } from "@/lib/format";
import type { SavedChannel } from "@/lib/types";

export default function SavedPage() {
  const [channels, setChannels] = useState<SavedChannel[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadSaved = () => {
    setChannels(getSavedChannels());
  };

  useEffect(() => {
    loadSaved();
    setMounted(true);
  }, []);

  const handleRemove = (id: string) => {
    removeSavedChannel(id);
    loadSaved();
  };

  if (!mounted) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <section className="mb-8">
          <h1 className="text-3xl font-semibold text-stone-800">المحفوظات</h1>
          <p className="mt-2 text-stone-500">
            القنوات التي حفظتها محلياً على جهازك
          </p>
        </section>

        {channels.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center">
            <p className="text-stone-500">لا توجد قنوات محفوظة بعد</p>
            <a
              href="/"
              className="mt-4 inline-block rounded-xl bg-stone-800 px-5 py-2.5 text-sm text-white hover:bg-stone-700"
            >
              ابدأ البحث
            </a>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <article
                key={channel.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm"
              >
                <div className="flex items-start gap-4 p-4">
                  <img
                    src={channel.thumbnail}
                    alt={channel.title}
                    className="h-16 w-16 shrink-0 rounded-full border border-stone-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-stone-800">
                      {channel.title}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatCount(channel.subscriberCount)} مشترك
                    </p>
                    <p className="mt-2 text-xs text-stone-400">
                      حُفظت {formatDate(channel.savedAt)}
                    </p>
                  </div>
                </div>

                {channel.description && (
                  <p className="line-clamp-2 px-4 pb-3 text-xs leading-relaxed text-stone-400">
                    {channel.description}
                  </p>
                )}

                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-stone-100 bg-stone-50/60 p-3">
                  <a
                    href={getChannelUrl(channel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-stone-800 px-3 py-2 text-center text-xs font-medium text-white hover:bg-stone-700"
                  >
                    فتح القناة
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(channel.id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    حذف
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
