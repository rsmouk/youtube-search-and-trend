"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import { pageMainLg } from "@/lib/layout-classes";

export default function SettingsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, dict } = useI18n();
  const [keys, setKeys] = useState<string[]>([""]);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace("/login");
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const loadKeys = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/api-keys");
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? t("settings.loadError"));
          setKeys([""]);
        } else {
          const data = await res.json();
          const stored: string[] = data.keys ?? [];
          setKeys(stored.length > 0 ? stored : [""]);
        }
      } catch {
        setError(t("settings.loadError"));
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    loadKeys();
  }, [isAdmin, t]);

  const updateKey = (index: number, value: string) => {
    const next = [...keys];
    next[index] = value;
    setKeys(next);
    setSaved(false);
  };

  const addKey = () => {
    setKeys([...keys, ""]);
    setSaved(false);
  };

  const removeKey = (index: number) => {
    if (keys.length === 1) {
      setKeys([""]);
    } else {
      setKeys(keys.filter((_, i) => i !== index));
    }
    setSaved(false);
  };

  const handleSave = async () => {
    const filtered = keys.map((k) => k.trim()).filter(Boolean);
    setError("");
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: filtered }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("settings.saveError"));
        return;
      }
      setKeys(filtered.length > 0 ? filtered : [""]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(t("settings.saveError"));
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <>
        <Header />
        <main className={pageMainLg}>
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  if (!mounted || loading) {
    return (
      <>
        <Header />
        <main className={pageMainLg}>
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  const steps = [...dict.settings.googleCloudSteps];

  return (
    <>
      <Header />
      <main className={pageMainLg}>
        <section className="mb-8">
          <h1 className="text-3xl font-semibold text-stone-800">{t("settings.title")}</h1>
          <p className="mt-2 text-stone-500">{t("settings.subtitle")}</p>
        </section>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {keys.map((key, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="password"
                  value={key}
                  onChange={(e) => updateKey(index, e.target.value)}
                  placeholder={t("settings.apiKey", { n: index + 1 })}
                  className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
                />
                <button
                  type="button"
                  onClick={() => removeKey(index)}
                  className="rounded-xl border border-stone-200 px-3 text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                  aria-label={t("settings.removeKey")}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addKey}
            className="mt-4 w-full rounded-xl border border-dashed border-stone-300 py-3 text-sm text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
          >
            {t("settings.addKey")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="mt-6 w-full rounded-2xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            {saved ? t("common.saved") : t("settings.saveKeys")}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm leading-relaxed text-sky-900">
            <p className="font-semibold">{t("settings.googleCloudTitle")}</p>
            <ol className="mt-3 list-inside list-decimal space-y-2">
              <li>
                Enable{" "}
                <a
                  href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  YouTube Data API v3
                </a>{" "}
                in Google Cloud Console
              </li>
              <li>
                Create an API key from{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Credentials
                </a>
              </li>
              <li>{steps[2]}</li>
              <li>{steps[3]}</li>
            </ol>
          </div>

          <div className="rounded-2xl bg-stone-50 p-5 text-sm leading-relaxed text-stone-500">
            <p className="font-medium text-stone-700">{t("settings.notesTitle")}</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {dict.settings.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
