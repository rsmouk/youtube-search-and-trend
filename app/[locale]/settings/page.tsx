import type { Metadata } from "next";
import SettingsView from "./settings-view";
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
    title: t("seo.settingsTitle"),
    description: t("seo.settingsDescription"),
    path: "/settings",
  });
}

export default function SettingsPage() {
  return <SettingsView />;
}
