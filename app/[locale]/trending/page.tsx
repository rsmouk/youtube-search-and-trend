import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import TrendingView from "./trending-view";
import { pageMain } from "@/lib/layout-classes";
import { resolveLocale, trendingMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ region?: string; category?: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const { region = "US", category = "" } = await searchParams;
  return trendingMetadata(resolveLocale(raw), region, category);
}

function TrendingFallback() {
  return (
    <>
      <Header />
      <main className={pageMain}>
        <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
      </main>
    </>
  );
}

export default function TrendingPage() {
  return (
    <Suspense fallback={<TrendingFallback />}>
      <TrendingView />
    </Suspense>
  );
}
