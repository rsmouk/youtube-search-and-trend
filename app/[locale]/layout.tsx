import AuthProvider from "@/components/AuthProvider";
import I18nProvider from "@/components/I18nProvider";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import PwaRegister from "@/components/PwaRegister";
import ScrollToTop from "@/components/ScrollToTop";
import { createTranslator, isValidLocale, LOCALES, type Locale } from "@/lib/i18n";
import { getSiteUrl, resolveLocale } from "@/lib/seo";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-arabic",
});

export const viewport: Viewport = {
  themeColor: "#292524",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const { t } = createTranslator(locale);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: t("seo.defaultTitle"),
      template: t("seo.titleTemplate"),
    },
    description: t("seo.defaultDescription"),
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: t("seo.siteName"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isValidLocale(raw)) notFound();
  const locale = raw as Locale;
  const { dir } = createTranslator(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      data-numbering="latn"
      className={`${inter.variable} ${notoSansArabic.variable} h-full`}
    >
      <body className="min-h-screen bg-[#f7f6f3] font-sans text-stone-800 antialiased">
        <I18nProvider locale={locale}>
          <AuthProvider>
            <ScrollToTop />
            <div className="flex min-h-screen flex-col">{children}</div>
            <PwaInstallPrompt />
            <PwaRegister />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
