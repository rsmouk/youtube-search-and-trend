import { NextRequest, NextResponse } from "next/server";
import { getServerApiKeys } from "@/lib/api-keys-server";
import { getVideoCategories, YouTubeApiError } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  try {
    const regionCode = request.nextUrl.searchParams.get("region") ?? "US";
    const apiKeys = await getServerApiKeys();
    const categories = await getVideoCategories(regionCode, apiKeys);

    return NextResponse.json({ categories });
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
