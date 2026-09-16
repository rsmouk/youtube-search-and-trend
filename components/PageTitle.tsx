"use client";

import { useI18n } from "@/components/I18nProvider";
import { formatSiteTitle, useDocumentTitle } from "@/lib/use-document-title";

/** Sets the browser tab title for client-rendered pages. */
export default function PageTitle({ title }: { title: string }) {
  const { t } = useI18n();
  useDocumentTitle(formatSiteTitle(title, t("seo.siteName")));
  return null;
}
