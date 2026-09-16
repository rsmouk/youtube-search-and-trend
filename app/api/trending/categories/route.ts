import { NextRequest, NextResponse } from "next/server";
import { getServerApiKeys } from "@/lib/api-keys-server";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { translateCategoryTitle } from "@/lib/i18n/categories";
import { getVideoCategories, YouTubeApiError } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  try {
    const regionCode = request.nextUrl.searchParams.get("region") ?? "US";
    const hlParam = request.nextUrl.searchParams.get("hl") ?? "en";
    const locale: Locale = isValidLocale(hlParam) ? hlParam : "en";
    const apiKeys = await getServerApiKeys();
    const categories = await getVideoCategories(
      regionCode,
      apiKeys,
      undefined,
      locale
    );

    return NextResponse.json({
      categories: categories.map((c) => ({
        ...c,
        title: translateCategoryTitle(c.id, c.title, locale),
      })),
    });
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      return NextResponse.json(
        { error: error.message, code: error.reason },
        { status: error.status }
      );
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
