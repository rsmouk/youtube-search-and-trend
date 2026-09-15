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
