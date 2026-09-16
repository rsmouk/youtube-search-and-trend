import type { Metadata } from "next";
import HomeView from "./home-view";
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
    title: t("seo.homeTitle"),
    description: t("seo.homeDescription"),
    path: "/",
  });
}

export default function HomePage() {
  return <HomeView />;
}
