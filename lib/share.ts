import { localePath } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

function currentLocale(): Locale {
  const seg = window.location.pathname.split("/")[1];
  if (seg === "ar" || seg === "fr" || seg === "es" || seg === "en") return seg;
  return "en";
}

export async function shareChannelPage(
  channelId: string,
  title: string
): Promise<"shared" | "copied"> {
  const url = `${window.location.origin}${localePath(currentLocale(), `/channel/${channelId}`)}`;

  if (navigator.share) {
    await navigator.share({ title, url });
    return "shared";
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}

export async function shareCurrentPage(
  title?: string
): Promise<"shared" | "copied"> {
  const url = window.location.href;
  const shareTitle = title || document.title;

  if (navigator.share) {
    await navigator.share({ title: shareTitle, url });
    return "shared";
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}
