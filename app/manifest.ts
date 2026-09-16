import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YouTube Channels Directory",
    short_name: "YT Channels",
    description: "Discover YouTube channels by keyword search",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f3",
    theme_color: "#292524",
    orientation: "portrait-primary",
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
