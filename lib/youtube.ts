import type { Channel } from "./types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export class YouTubeApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public reason?: string
  ) {
    super(message);
    this.name = "YouTubeApiError";
  }
}

function getEnvKeys(): string[] {
  const raw = process.env.YOUTUBE_API_KEYS ?? process.env.YOUTUBE_API_KEY ?? "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function fetchWithKeyRotation<T>(
  buildUrl: (apiKey: string) => string,
  apiKeys: string[]
): Promise<T> {
  const keys = [...new Set([...apiKeys, ...getEnvKeys()])];

  if (keys.length === 0) {
    throw new YouTubeApiError(
      "لا يوجد مفتاح API. أضف مفتاحاً من الإعدادات.",
      400,
      "missing_api_key"
    );
  }

  let lastError: YouTubeApiError | null = null;

  for (const apiKey of keys) {
    const url = buildUrl(apiKey);
    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();

    if (res.ok) {
      return data as T;
    }

    const reason = data?.error?.errors?.[0]?.reason ?? data?.error?.message;
    lastError = new YouTubeApiError(
      data?.error?.message ?? "فشل طلب YouTube API",
      res.status,
      reason
    );

    const quotaErrors = ["quotaExceeded", "dailyLimitExceeded", "keyInvalid"];
    if (!quotaErrors.includes(reason ?? "")) {
      throw lastError;
    }
  }

  throw lastError ?? new YouTubeApiError("فشل جميع مفاتيح API", 429);
}

interface SearchListResponse {
  items?: Array<{
    id?: { videoId?: string; channelId?: string };
    snippet?: {
      channelId?: string;
      channelTitle?: string;
      title?: string;
      publishedAt?: string;
    };
  }>;
  pageInfo?: { totalResults?: number };
}

interface ChannelsListResponse {
  items?: Array<{
    id: string;
    snippet: Channel["snippet"];
    statistics: Channel["statistics"];
  }>;
}

export async function searchRecentChannels(
  keyword: string,
  apiKeys: string[]
): Promise<{ channels: Channel[]; totalResults: number }> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    throw new YouTubeApiError("أدخل كلمة للبحث", 400);
  }

  const publishedAfter = new Date();
  publishedAfter.setDate(publishedAfter.getDate() - 30);

  const searchData = await fetchWithKeyRotation<SearchListResponse>(
    (apiKey) => {
      const params = new URLSearchParams({
        part: "snippet",
        q: trimmed,
        type: "video",
        order: "date",
        publishedAfter: publishedAfter.toISOString(),
        maxResults: "50",
        key: apiKey,
      });
      return `${YOUTUBE_API_BASE}/search?${params}`;
    },
    apiKeys
  );

  const channelMap = new Map<
    string,
    { title?: string; recentVideoTitle?: string; recentVideoPublishedAt?: string }
  >();

  for (const item of searchData.items ?? []) {
    const channelId = item.snippet?.channelId;
    if (!channelId || channelMap.has(channelId)) continue;
    channelMap.set(channelId, {
      title: item.snippet?.channelTitle,
      recentVideoTitle: item.snippet?.title,
      recentVideoPublishedAt: item.snippet?.publishedAt,
    });
  }

  const channelIds = Array.from(channelMap.keys());
  if (channelIds.length === 0) {
    return { channels: [], totalResults: 0 };
  }

  const channelsData = await fetchWithKeyRotation<ChannelsListResponse>(
    (apiKey) => {
      const params = new URLSearchParams({
        part: "snippet,statistics",
        id: channelIds.join(","),
        maxResults: "50",
        key: apiKey,
      });
      return `${YOUTUBE_API_BASE}/channels?${params}`;
    },
    apiKeys
  );

  const channels: Channel[] = (channelsData.items ?? []).map((item) => {
    const meta = channelMap.get(item.id);
    return {
      id: item.id,
      snippet: item.snippet,
      statistics: item.statistics,
      recentVideoTitle: meta?.recentVideoTitle,
      recentVideoPublishedAt: meta?.recentVideoPublishedAt,
    };
  });

  channels.sort((a, b) => {
    const dateA = a.recentVideoPublishedAt
      ? new Date(a.recentVideoPublishedAt).getTime()
      : 0;
    const dateB = b.recentVideoPublishedAt
      ? new Date(b.recentVideoPublishedAt).getTime()
      : 0;
    return dateB - dateA;
  });

  return {
    channels,
    totalResults: searchData.pageInfo?.totalResults ?? channels.length,
  };
}
