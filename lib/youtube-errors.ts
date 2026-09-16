export function translateYouTubeError(
  code: string,
  t: (key: string) => string
): string {
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
