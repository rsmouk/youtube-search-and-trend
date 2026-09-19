"use client";

import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { shareCurrentPage } from "@/lib/share";

export default function SharePageButton() {
  const { t } = useI18n();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await shareCurrentPage(document.title);
      setMsg(result === "shared" ? t("common.shared") : t("common.linkCopied"));
      setTimeout(() => setMsg(""), 2000);
    } catch {
      /* user cancelled share sheet */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div className="pointer-events-auto relative flex flex-col items-center">
        {msg && (
          <span className="mb-2 rounded-full bg-stone-800 px-3 py-1 text-xs text-white shadow-lg">
            {msg}
          </span>
        )}
        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
          title={t("common.share")}
          aria-label={t("common.share")}
          className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white shadow-lg shadow-black/20 transition hover:bg-stone-800 disabled:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
          </svg>
          {t("common.share")}
        </button>
      </div>
    </div>
  );
}
