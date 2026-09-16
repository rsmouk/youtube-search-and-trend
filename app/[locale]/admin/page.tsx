import type { Metadata } from "next";
import AdminView from "./admin-view";
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
    title: t("seo.adminTitle"),
    description: t("seo.adminDescription"),
    path: "/admin",
  });
}

export default function AdminPage() {
  return <AdminView />;
}
