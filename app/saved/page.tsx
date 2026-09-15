"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ChannelCard from "@/components/ChannelCard";
import ChannelDetailsModal from "@/components/ChannelDetailsModal";
import { savedToChannel } from "@/lib/channel-utils";
import { getSavedChannels } from "@/lib/storage";
import type { Channel, SavedChannel } from "@/lib/types";

export default function SavedPage() {
  const [channels, setChannels] = useState<SavedChannel[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const loadSaved = () => {
    setChannels(getSavedChannels());
  };

  useEffect(() => {
    loadSaved();
    setMounted(true);
  }, []);

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
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium text-stone-700">
                القنوات المحفوظة
              </h2>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                {channels.length} قناة
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {channels.map((saved) => {
                const channel = savedToChannel(saved);
                return (
                  <ChannelCard
                    key={saved.id}
                    channel={channel}
                    onDetails={setSelectedChannel}
                    onSavedChange={loadSaved}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      <ChannelDetailsModal
        channel={selectedChannel}
        onClose={() => setSelectedChannel(null)}
      />
    </>
  );
}
