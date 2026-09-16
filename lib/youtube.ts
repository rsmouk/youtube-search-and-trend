import type { SearchFilters } from "./filters";
import { DEFAULT_FILTERS } from "./filters";
import type { Channel, TrendingVideo, VideoCategory } from "./types";

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
    return "blocked_key";
  }

  if (
    lower.includes("referer") ||
    lower.includes("referrer") ||
    reason === "API_KEY_HTTP_REFERRER_BLOCKED"
  ) {
    return "referrer_blocked";
  }

  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
    return "quota_exceeded";
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
    throw new YouTubeApiError("missing_api_key", 400, "missing_api_key");
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

    const message = data?.error?.message ?? "YouTube API request failed";
    const reason =
      data?.error?.errors?.[0]?.reason ??
      data?.error?.details?.[0]?.reason ??
      data?.error?.message;

    const helpKey = getYouTubeErrorHelp(message, reason);
    lastError = new YouTubeApiError(helpKey, res.status, reason);

    if (!shouldTryNextKey(reason, message)) {
      throw lastError;
    }
  }

  throw lastError ?? new YouTubeApiError("all_keys_failed", 429);
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
  referer?: string,
  filters: SearchFilters = DEFAULT_FILTERS
): Promise<{ channels: Channel[]; totalResults: number }> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    throw new YouTubeApiError("enter_keyword", 400);
  }

  const publishedAfter = new Date();
  publishedAfter.setDate(publishedAfter.getDate() - filters.periodDays);

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
      if (filters.regionCode) {
        params.set("regionCode", filters.regionCode);
      }
      if (filters.relevanceLanguage) {
        params.set("relevanceLanguage", filters.relevanceLanguage);
      }
      return `${YOUTUBE_API_BASE}/search?${params}`;
    },
    apiKeys,
    referer
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
    referer
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

  let filtered = channels;
  if (filters.channelCountry) {
    filtered = channels.filter(
      (c) => c.snippet.country === filters.channelCountry
    );
  }

  filtered.sort((a, b) => {
    const dateA = a.recentVideoPublishedAt
      ? new Date(a.recentVideoPublishedAt).getTime()
      : 0;
    const dateB = b.recentVideoPublishedAt
      ? new Date(b.recentVideoPublishedAt).getTime()
      : 0;
    return dateB - dateA;
  });

  return {
    channels: filtered,
    totalResults: filtered.length,
  };
}

function getReferer(referer?: string): string | undefined {
  return referer;
}

interface VideoCategoriesResponse {
  items?: Array<{
    id: string;
    snippet: { title: string; assignable?: boolean };
  }>;
}

interface TrendingVideosResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      channelId: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        medium?: { url: string };
        high?: { url: string };
        default?: { url: string };
      };
    };
    statistics: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
  }>;
}

export async function getVideoCategories(
  regionCode: string,
  apiKeys: string[],
  referer?: string
): Promise<VideoCategory[]> {
  const data = await fetchWithKeyRotation<VideoCategoriesResponse>(
    (apiKey) => {
      const params = new URLSearchParams({
        part: "snippet",
        regionCode,
        key: apiKey,
      });
      return `${YOUTUBE_API_BASE}/videoCategories?${params}`;
    },
    apiKeys,
    getReferer(referer)
  );

  return (data.items ?? [])
    .filter((item) => item.snippet.assignable !== false)
    .map((item) => ({
      id: item.id,
      title: item.snippet.title,
    }));
}

export async function getTrendingVideos(
  regionCode: string,
  apiKeys: string[],
  categoryId?: string,
  referer?: string
): Promise<TrendingVideo[]> {
  const data = await fetchWithKeyRotation<TrendingVideosResponse>(
    (apiKey) => {
      const params = new URLSearchParams({
        part: "snippet,statistics",
        chart: "mostPopular",
        regionCode,
        maxResults: "50",
        key: apiKey,
      });
      if (categoryId) {
        params.set("videoCategoryId", categoryId);
      }
      return `${YOUTUBE_API_BASE}/videos?${params}`;
    },
    apiKeys,
    getReferer(referer)
  );

  return (data.items ?? []).map((item) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnail:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
    viewCount: item.statistics.viewCount ?? "0",
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
  }));
}

export function translateYouTubeError(code: string, t: (key: string) => string): string {
  switch (code) {
    case "missing_api_key":
      return t("errors.missingApiKey");
    case "blocked_key":
      return t("youtube.blockedKey");
    case "referrer_blocked":
      return t("youtube.referrerBlocked");
    case "quota_exceeded":
      return t("youtube.quotaExceeded");
    case "enter_keyword":
      return t("youtube.enterKeyword");
    case "all_keys_failed":
      return t("youtube.allKeysFailed");
    default:
      return code;
  }
}
