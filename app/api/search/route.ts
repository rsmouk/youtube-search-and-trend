import { NextRequest, NextResponse } from "next/server";
import { searchRecentChannels, YouTubeApiError } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keyword = typeof body.keyword === "string" ? body.keyword : "";
    const apiKeys = Array.isArray(body.apiKeys)
      ? body.apiKeys.filter((k: unknown) => typeof k === "string")
      : [];

    const result = await searchRecentChannels(keyword, apiKeys);

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
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
