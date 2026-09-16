const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  numberingSystem: "latn",
});

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  numberingSystem: "latn",
  year: "numeric",
  month: "short",
  day: "numeric",
});

/** Convert Eastern Arabic / Persian digits to Western 0-9 */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

function parseCount(value: string | number | undefined): number | null {
  if (value === undefined || value === null) return null;
  const num =
    typeof value === "string"
      ? parseInt(toLatinDigits(value).replace(/,/g, ""), 10)
      : value;
  if (Number.isNaN(num)) return null;
  return num;
}

export function formatCount(value: string | number | undefined): string {
  const num = parseCount(value);
  if (num === null || num === 0) return "—";

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return NUMBER_FORMAT.format(num);
}

/** Full number with Western digits, no K/M abbreviation */
export function formatPlainCount(value: string | number | undefined): string {
  const num = parseCount(value);
  if (num === null) return "—";
  return NUMBER_FORMAT.format(num);
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return DATE_FORMAT.format(new Date(iso));
}

export function getVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
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
