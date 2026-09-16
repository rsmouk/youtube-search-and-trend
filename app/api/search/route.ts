import { getServerApiKeys } from "@/lib/api-keys-server";
import { DEFAULT_FILTERS, type SearchFilters } from "@/lib/filters";
import { NextRequest, NextResponse } from "next/server";
import { searchRecentChannels, YouTubeApiError } from "@/lib/youtube";

function parseFilters(raw: unknown): SearchFilters {
  if (!raw || typeof raw !== "object") return DEFAULT_FILTERS;
  const f = raw as Record<string, unknown>;
  return {
    regionCode: typeof f.regionCode === "string" ? f.regionCode : "",
    channelCountry: typeof f.channelCountry === "string" ? f.channelCountry : "",
    periodDays: typeof f.periodDays === "number" ? f.periodDays : 30,
    relevanceLanguage:
      typeof f.relevanceLanguage === "string" ? f.relevanceLanguage : "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keyword = typeof body.keyword === "string" ? body.keyword : "";
    const apiKeys = await getServerApiKeys();

    const filters = parseFilters(body.filters);
    const result = await searchRecentChannels(keyword, apiKeys, undefined, filters);

    return NextResponse.json({
      channels: result.channels,
      totalResults: result.totalResults,
      keyword: keyword.trim(),
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
