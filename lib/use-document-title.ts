"use client";

import { useEffect } from "react";

/**
 * Keeps `document.title` in sync for client navigations and filter changes.
 * Next.js metadata can overwrite the title after soft navigations; we re-apply.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    if (!title) return;

    const apply = () => {
      if (document.title !== title) {
        document.title = title;
      }
    };

    apply();

    const titleEl = document.querySelector("title");
    const observer =
      titleEl &&
      new MutationObserver(() => {
        apply();
      });

    if (titleEl && observer) {
      observer.observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    const timers = [0, 50, 150, 400].map((ms) => setTimeout(apply, ms));

    return () => {
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [title]);
}

export function formatSiteTitle(pageTitle: string, siteName: string): string {
  if (!pageTitle) return siteName;
  if (pageTitle.includes(siteName)) return pageTitle;
  return `${pageTitle} | ${siteName}`;
}
