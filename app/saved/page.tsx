"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ChannelCard from "@/components/ChannelCard";
import { useAuth } from "@/components/AuthProvider";
import { savedToChannel } from "@/lib/channel-utils";
import { fetchSavedChannels } from "@/lib/saved-service";
import { SAVED_CHANNELS_CHANGED } from "@/lib/storage";
import type { SavedChannel } from "@/lib/types";

export default function SavedPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<SavedChannel[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadSaved = async () => {
    setChannels(await fetchSavedChannels(user?.id));
  };

  useEffect(() => {
    loadSaved().then(() => setMounted(true));

    const refresh = () => loadSaved();
    window.addEventListener(SAVED_CHANNELS_CHANGED, refresh);
    return () => window.removeEventListener(SAVED_CHANNELS_CHANGED, refresh);
  }, [user?.id]);

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
            {user
              ? "قنواتك محفوظة في حسابك"
              : "قنواتك محفوظة محلياً — سجّل الدخول للمزامنة"}
          </p>
          {!user && (
            <Link
              href="/login"
              className="mt-2 inline-block text-sm text-stone-600 underline hover:text-stone-800"
            >
              تسجيل الدخول
            </Link>
          )}
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
              {channels.map((saved) => (
                <ChannelCard
                  key={saved.id}
                  channel={savedToChannel(saved)}
                  onSavedChange={loadSaved}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
