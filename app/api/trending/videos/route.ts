import { NextRequest, NextResponse } from "next/server";
import { getServerApiKeys } from "@/lib/api-keys-server";
import { getTrendingVideos, YouTubeApiError } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  try {
    const regionCode = request.nextUrl.searchParams.get("region") ?? "US";
    const categoryId = request.nextUrl.searchParams.get("category") ?? undefined;
    const apiKeys = await getServerApiKeys();
    const videos = await getTrendingVideos(
      regionCode,
      apiKeys,
      categoryId || undefined
    );

    return NextResponse.json({ videos });
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
