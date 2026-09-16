"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { localePath } from "@/lib/seo";

/** Strip `/[locale]` prefix from pathname. */
export function stripLocale(pathname: string): string {
  const parts = pathname.split("/");
  if (parts[1] && isValidLocale(parts[1])) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

export function useLocale(): Locale {
  const params = useParams();
  const raw = params?.locale;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && isValidLocale(value) ? value : "en";
}

export function useLocalePath() {
  const locale = useLocale();

  return useCallback(
    (path: string) => localePath(locale, path),
    [locale]
  );
}

export function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (next: Locale) => {
      const path = stripLocale(pathname);
      const search = window.location.search;
      router.push(`${localePath(next, path)}${search}`);
    },
    [pathname, router]
  );
}
