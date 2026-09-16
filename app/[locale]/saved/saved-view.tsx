"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import ChannelCard from "@/components/ChannelCard";
import LayoutToggle, { cardsContainerClass } from "@/components/LayoutToggle";
import Pagination from "@/components/Pagination";
import PageTitle from "@/components/PageTitle";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import { savedToChannel } from "@/lib/channel-utils";
import { paginateItems } from "@/lib/pagination";
import { fetchLikedChannels, LIKES_CHANGED } from "@/lib/likes-service";
import { useCardLayout } from "@/lib/use-card-layout";
import type { SavedChannel } from "@/lib/types";
import { pageMain } from "@/lib/layout-classes";
import { useLocalePath } from "@/lib/use-locale-path";

export default function SavedView() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const lp = useLocalePath();
  const { layout, setLayout } = useCardLayout();
  const [channels, setChannels] = useState<SavedChannel[]>([]);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);

  const loadLiked = async () => {
    if (!user?.id) {
      setChannels([]);
      return;
    }
    setChannels(await fetchLikedChannels(user.id));
  };

  useEffect(() => {
    if (authLoading) return;
    loadLiked().then(() => setMounted(true));

    const refresh = () => loadLiked();
    window.addEventListener(LIKES_CHANGED, refresh);
    return () => window.removeEventListener(LIKES_CHANGED, refresh);
  }, [user?.id, authLoading]);

  const pagination = useMemo(() => paginateItems(channels, page), [channels, page]);

  useEffect(() => {
    if (page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted || authLoading) {
    return (
      <>
        <PageTitle title={t("seo.savedTitle")} />
        <Header />
        <main className={pageMain}>
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("seo.savedTitle")} />
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
              href={lp("/login")}
              className="mt-2 inline-block text-sm text-stone-600 underline hover:text-stone-800"
            >
              {t("saved.signIn")}
            </Link>
          )}
        </PageHeader>

        {!user ? (
          <div className="rounded-3xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center">
            <p className="text-stone-500">{t("likes.loginRequired")}</p>
            <Link
              href={lp("/login")}
              className="mt-4 inline-block rounded-xl bg-stone-800 px-5 py-2.5 text-sm text-white hover:bg-stone-700"
            >
              {t("saved.signIn")}
            </Link>
          </div>
        ) : channels.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center">
            <p className="text-stone-500">{t("saved.empty")}</p>
            <p className="mt-2 text-sm text-stone-400">{t("saved.emptyHint")}</p>
            <Link
              href={lp("/")}
              className="mt-4 inline-block rounded-xl bg-stone-800 px-5 py-2.5 text-sm text-white hover:bg-stone-700"
            >
              {t("saved.startSearch")}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                {t("common.channels", { count: channels.length })}
              </span>
            </div>

            <div className={cardsContainerClass(layout)}>
              {pagination.items.map((liked) => (
                <ChannelCard
                  key={liked.id}
                  channel={savedToChannel(liked)}
                  onLikeChange={loadLiked}
                  variant={layout}
                />
              ))}
            </div>

            <Pagination
              page={pagination.currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              start={pagination.start}
              end={pagination.end}
              onChange={handlePageChange}
            />
          </>
        )}
      </main>
    </>
  );
}
