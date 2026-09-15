export interface ChannelStatistics {
  viewCount: string;
  subscriberCount: string;
  videoCount: string;
  hiddenSubscriberCount?: boolean;
}

export interface ChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  country?: string;
}

export interface Channel {
  id: string;
  snippet: ChannelSnippet;
  statistics: ChannelStatistics;
  recentVideoTitle?: string;
  recentVideoPublishedAt?: string;
}

export interface SavedChannel {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: string;
  description: string;
  customUrl?: string;
  publishedAt?: string;
  country?: string;
  viewCount?: string;
  videoCount?: string;
  hiddenSubscriberCount?: boolean;
  recentVideoTitle?: string;
  recentVideoPublishedAt?: string;
  savedAt: string;
}

export interface SearchResponse {
  channels: Channel[];
  totalResults: number;
  keyword: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface VideoCategory {
  id: string;
  title: string;
}

export interface TrendingVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: string;
  likeCount?: string;
  commentCount?: string;
}
