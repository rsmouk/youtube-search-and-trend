export async function shareChannelPage(
  channelId: string,
  title: string
): Promise<"shared" | "copied"> {
  const url = `${window.location.origin}/channel/${channelId}`;

  if (navigator.share) {
    await navigator.share({ title, url });
    return "shared";
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}
