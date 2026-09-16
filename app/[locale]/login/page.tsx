import type { Metadata } from "next";
import LoginView from "./login-view";
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
    title: t("seo.loginTitle"),
    description: t("seo.loginDescription"),
    path: "/login",
  });
}

export default function LoginPage() {
  return <LoginView />;
}
