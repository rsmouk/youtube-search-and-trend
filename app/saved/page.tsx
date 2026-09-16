"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import ChannelCard from "@/components/ChannelCard";
import LayoutToggle, { cardsContainerClass } from "@/components/LayoutToggle";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import { savedToChannel } from "@/lib/channel-utils";
import { fetchSavedChannels } from "@/lib/saved-service";
import { SAVED_CHANNELS_CHANGED } from "@/lib/storage";
import { useCardLayout } from "@/lib/use-card-layout";
import type { SavedChannel } from "@/lib/types";
import { pageMain } from "@/lib/layout-classes";

export default function SavedPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { layout, setLayout } = useCardLayout();
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
        <main className={pageMain}>
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={pageMain}>
        <PageHeader
          icon="saved"
          title={t("saved.title")}
          subtitle={user ? t("saved.syncedAccount") : t("saved.localOnly")}
          actions={<LayoutToggle layout={layout} onChange={setLayout} />}
        >
          {!user && (
            <Link
              href="/login"
              className="mt-2 inline-block text-sm text-stone-600 underline hover:text-stone-800"
            >
              {t("saved.signIn")}
            </Link>
          )}
        </PageHeader>

        {channels.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center">
            <p className="text-stone-500">{t("saved.empty")}</p>
            <a
              href="/"
              className="mt-4 inline-block rounded-xl bg-stone-800 px-5 py-2.5 text-sm text-white hover:bg-stone-700"
            >
              {t("saved.startSearch")}
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                {t("common.channels", { count: channels.length })}
              </span>
            </div>

            <div className={cardsContainerClass(layout)}>
              {channels.map((saved) => (
                <ChannelCard
                  key={saved.id}
                  channel={savedToChannel(saved)}
                  onSavedChange={loadSaved}
                  variant={layout}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
