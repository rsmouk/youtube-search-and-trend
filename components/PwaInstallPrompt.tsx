"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

const DISMISS_KEY = "pwa_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!visible || !deferred) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black text-lg font-bold leading-none text-white">
          Y
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-800">{t("pwa.installTitle")}</p>
          <p className="text-xs text-stone-500">{t("pwa.installDesc")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl px-3 py-2 text-xs text-stone-500 hover:bg-stone-100"
          >
            {t("pwa.dismiss")}
          </button>
          <button
            type="button"
            onClick={install}
            className="rounded-xl bg-stone-800 px-4 py-2 text-xs font-medium text-white hover:bg-stone-700"
          >
            {t("pwa.install")}
          </button>
        </div>
      </div>
    </div>
  );
}
