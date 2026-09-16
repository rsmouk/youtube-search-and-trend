import AuthProvider from "@/components/AuthProvider";
import I18nProvider from "@/components/I18nProvider";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import PwaRegister from "@/components/PwaRegister";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
  title: "YouTube Channels Directory",
  description: "Discover YouTube channels by keyword search",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YT Channels",
  },
};

export const viewport: Viewport = {
  themeColor: "#292524",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${notoSansArabic.variable} h-full`}>
      <body className="min-h-screen bg-[#f7f6f3] font-sans text-stone-800 antialiased">
        <I18nProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">{children}</div>
            <PwaInstallPrompt />
            <PwaRegister />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
