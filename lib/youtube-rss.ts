export interface RssVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  link: string;
}

export interface RssFeedData {
  channelName?: string;
  videos: RssVideo[];
}

export async function fetchChannelRssFeed(
  channelId: string,
  limit = 15
): Promise<RssFeedData> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) return { videos: [] };

  const xml = await res.text();
  const channelName =
    xml.match(/<author>\s*<name>([^<]+)<\/name>/)?.[1] ??
    xml.match(/<name>([^<]+)<\/name>/)?.[1];

  const entries = xml.split("<entry>").slice(1);
  const videos: RssVideo[] = [];

  for (const entry of entries) {
    if (videos.length >= limit) break;

    const id =
      entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ??
      entry.match(/<id>yt:video:([^<]+)<\/id>/)?.[1];
    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    const thumbnail =
      entry.match(/<media:thumbnail url="([^"]+)"/)?.[1] ??
      (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");

    if (!id || !title) continue;

    videos.push({
      id,
      title: decodeXml(title),
      publishedAt: published ?? "",
      thumbnail,
      link: `https://www.youtube.com/watch?v=${id}`,
    });
  }

  return {
    channelName: channelName ? decodeXml(channelName) : undefined,
    videos,
  };
}

export async function fetchChannelRssVideos(
  channelId: string,
  limit = 15
): Promise<RssVideo[]> {
  const feed = await fetchChannelRssFeed(channelId, limit);
  return feed.videos;
}

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
