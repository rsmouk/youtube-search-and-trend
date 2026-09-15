import type { Channel, SavedChannel } from "./types";

export function savedToChannel(saved: SavedChannel): Channel {
  return {
    id: saved.id,
    snippet: {
      title: saved.title,
      description: saved.description,
      customUrl: saved.customUrl,
      publishedAt: saved.publishedAt ?? saved.savedAt,
      country: saved.country,
      thumbnails: {
        medium: { url: saved.thumbnail },
        default: { url: saved.thumbnail },
        high: { url: saved.thumbnail },
      },
    },
    statistics: {
      viewCount: saved.viewCount ?? "0",
      subscriberCount: saved.subscriberCount,
      videoCount: saved.videoCount ?? "0",
      hiddenSubscriberCount: saved.hiddenSubscriberCount,
    },
    recentVideoTitle: saved.recentVideoTitle,
    recentVideoPublishedAt: saved.recentVideoPublishedAt,
  };
}

export function channelToSaved(channel: Channel, thumbnail: string): SavedChannel {
  return {
    id: channel.id,
    title: channel.snippet.title,
    thumbnail,
    subscriberCount: channel.statistics.subscriberCount ?? "0",
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    publishedAt: channel.snippet.publishedAt,
    country: channel.snippet.country,
    viewCount: channel.statistics.viewCount,
    videoCount: channel.statistics.videoCount,
    hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount,
    recentVideoTitle: channel.recentVideoTitle,
    recentVideoPublishedAt: channel.recentVideoPublishedAt,
    savedAt: new Date().toISOString(),
  };
}
