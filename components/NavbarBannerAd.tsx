"use client";

import { useEffect, useRef } from "react";

const AD_KEY = "78d81c7378359288985a402fe8cd49cf";

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

/** Centered 300×250 banner (highrevenueformat / Adsterra). */
export default function NavbarBannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    window.atOptions = {
      key: AD_KEY,
      format: "iframe",
      height: 250,
      width: 300,
      params: {},
    };

    const script = document.createElement("script");
    script.src = `https://www.highrevenueformat.com/${AD_KEY}/invoke.js`;
    script.async = true;
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div className="flex w-full justify-center px-4 py-3" aria-hidden="true">
      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{ width: 300, minHeight: 250 }}
      />
    </div>
  );
}
