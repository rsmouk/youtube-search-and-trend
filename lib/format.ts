export function formatCount(value: string | number | undefined): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (!num || Number.isNaN(num)) return "—";

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString("ar-EG");
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getChannelUrl(channel: {
  id: string;
  snippet?: { customUrl?: string };
  customUrl?: string;
}): string {
  const customUrl = channel.snippet?.customUrl ?? channel.customUrl;
  if (customUrl) {
    const handle = customUrl.startsWith("@") ? customUrl : `@${customUrl}`;
    return `https://www.youtube.com/${handle}`;
  }
  return `https://www.youtube.com/channel/${channel.id}`;
}
