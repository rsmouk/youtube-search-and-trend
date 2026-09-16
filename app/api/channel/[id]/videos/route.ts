import { fetchChannelRssFeed } from "@/lib/youtube-rss";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const feed = await fetchChannelRssFeed(id);

  return NextResponse.json(
    { videos: feed.videos, channelName: feed.channelName },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
