import type { Metadata } from "next";
import SavedView from "./saved-view";
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
    title: t("seo.savedTitle"),
    description: t("seo.savedDescription"),
    path: "/saved",
  });
}

export default function SavedPage() {
  return <SavedView />;
}
