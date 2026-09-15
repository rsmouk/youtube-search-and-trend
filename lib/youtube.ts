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

export function getYouTubeErrorHelp(message: string, reason?: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("v3datasearchservice.list are blocked") ||
    lower.includes("requests to this api") ||
    reason === "forbidden"
  ) {
    return (
      "المفتاح محظور أو غير مفعّل. تأكد من:\n" +
      "1. تفعيل YouTube Data API v3 في Google Cloud Console\n" +
      "2. في Credentials → API restrictions → اختر «Restrict key» وفعّل YouTube Data API v3\n" +
      "3. في Application restrictions → HTTP referrers → أضف نطاق موقعك:\n" +
      "   localhost:3000/* و your-app.vercel.app/*"
    );
  }

  if (
    lower.includes("referer") ||
    lower.includes("referrer") ||
    reason === "API_KEY_HTTP_REFERRER_BLOCKED"
  ) {
    return (
      "المفتاح مقيد بالنطاق (Referrer). أضف نطاق موقعك في Google Cloud:\n" +
      "Credentials → Application restrictions → HTTP referrers:\n" +
      "http://localhost:3000/*\n" +
      "https://your-app.vercel.app/*"
    );
  }

  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
    return "نفدت الحصة اليومية لهذا المفتاح. أضف مفتاحاً آخر أو انتظر حتى منتصف الليل (توقيت Pacific).";
  }

  return message;
}

function getEnvKeys(): string[] {
  if (typeof window !== "undefined") return [];
  const raw = process.env.YOUTUBE_API_KEYS ?? process.env.YOUTUBE_API_KEY ?? "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function shouldTryNextKey(reason: string | undefined, message: string): boolean {
  const retryReasons = [
    "quotaExceeded",
    "dailyLimitExceeded",
    "keyInvalid",
    "forbidden",
  ];
  if (reason && retryReasons.includes(reason)) return true;
  const lower = message.toLowerCase();
  return (
    lower.includes("blocked") ||
    lower.includes("referer") ||
    lower.includes("quota")
  );
}

async function fetchWithKeyRotation<T>(
  buildUrl: (apiKey: string) => string,
  apiKeys: string[],
  referer?: string
): Promise<T> {
  const keys = [...new Set([...apiKeys, ...getEnvKeys()])];

  if (keys.length === 0) {
    throw new YouTubeApiError(
      "لا يوجد مفتاح API. أضف مفتاحاً من صفحة الإعدادات.",
      400,
      "missing_api_key"
    );
  }

  let lastError: YouTubeApiError | null = null;

  for (const apiKey of keys) {
    const url = buildUrl(apiKey);
    const headers: HeadersInit = {};
    if (referer) {
      headers.Referer = referer;
    }

    const res = await fetch(url, { headers, cache: "no-store" });
    const data = await res.json();

    if (res.ok) {
      return data as T;
    }

    const message = data?.error?.message ?? "فشل طلب YouTube API";
    const reason =
      data?.error?.errors?.[0]?.reason ??
      data?.error?.details?.[0]?.reason ??
      data?.error?.message;

    lastError = new YouTubeApiError(
      getYouTubeErrorHelp(message, reason),
      res.status,
      reason
    );

    if (!shouldTryNextKey(reason, message)) {
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
  apiKeys: string[],
  referer?: string
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
    apiKeys,
    referer ?? (typeof window !== "undefined" ? window.location.origin + "/" : undefined)
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
    apiKeys,
    referer ?? (typeof window !== "undefined" ? window.location.origin + "/" : undefined)
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
