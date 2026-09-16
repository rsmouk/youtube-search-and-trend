"use client";

import { useEffect } from "react";

const SW_FIX_KEY = "sw_nav_fix_v2";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const applyFix = async () => {
      try {
        // Clear old cache-first SW data that broke App Router navigations
        if (localStorage.getItem(SW_FIX_KEY) !== "1" && "caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
          localStorage.setItem(SW_FIX_KEY, "1");
        }

        const reg = await navigator.serviceWorker.register("/sw.js");
        await reg.update();
      } catch {
        /* ignore */
      }
    };

    void applyFix();
  }, []);

  return null;
}
