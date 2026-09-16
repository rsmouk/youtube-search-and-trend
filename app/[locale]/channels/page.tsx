import type { Metadata } from "next";
import ChannelsView from "./channels-view";
import { createTranslator } from "@/lib/i18n";
import { buildPageMetadata, resolveLocale } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const { t } = createTranslator(locale);
  return buildPageMetadata(locale, {
    title: t("seo.channelsTitle"),
    description: t("seo.channelsDescription"),
    path: "/channels",
  });
}

export default function ChannelsPage() {
  return <ChannelsView />;
}
