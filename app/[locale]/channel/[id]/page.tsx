import type { Metadata } from "next";
import ChannelView from "./channel-view";
import { getSiteChannelByIdServer } from "@/lib/channels-db-server";
import { createTranslator } from "@/lib/i18n";
import { buildPageMetadata, resolveLocale } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: raw, id } = await params;
  const locale = resolveLocale(raw);
  const { t } = createTranslator(locale);
  const row = await getSiteChannelByIdServer(id);

  const title = t("seo.channelTitle", { name: row?.title ?? id });
  const description = row?.description?.trim()
    ? row.description.slice(0, 160)
    : row?.title
      ? t("seo.channelDescription", { name: row.title })
      : t("seo.channelFallbackDescription");

  const images = row?.thumbnail_url ? [row.thumbnail_url] : undefined;

  return buildPageMetadata(locale, {
    title,
    description,
    path: `/channel/${id}`,
    images,
  });
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialRow = await getSiteChannelByIdServer(id);
  return <ChannelView channelId={id} initialRow={initialRow} />;
}
