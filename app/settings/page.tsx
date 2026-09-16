"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { getApiKeys, saveApiKeys } from "@/lib/storage";
import { pageMainLg } from "@/lib/layout-classes";

export default function SettingsPage() {
  const [keys, setKeys] = useState<string[]>([""]);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getApiKeys();
    setKeys(stored.length > 0 ? stored : [""]);
    setMounted(true);
  }, []);

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

  const handleSave = () => {
    const filtered = keys.map((k) => k.trim()).filter(Boolean);
    saveApiKeys(filtered);
    setKeys(filtered.length > 0 ? filtered : [""]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!mounted) {
    return (
      <>
        <Header />
        <main className={pageMainLg}>
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={pageMainLg}>
        <section className="mb-8">
          <h1 className="text-3xl font-semibold text-stone-800">الإعدادات</h1>
          <p className="mt-2 text-stone-500">
            أضف مفاتيح YouTube Data API v3 — يتم تدويرها تلقائياً عند نفاد
            الحصة
          </p>
        </section>

        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {keys.map((key, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="password"
                  value={key}
                  onChange={(e) => updateKey(index, e.target.value)}
                  placeholder={`مفتاح API ${index + 1}`}
                  className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
                />
                <button
                  type="button"
                  onClick={() => removeKey(index)}
                  className="rounded-xl border border-stone-200 px-3 text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                  aria-label="حذف المفتاح"
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
            + إضافة مفتاح آخر
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="mt-6 w-full rounded-2xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            {saved ? "تم الحفظ ✓" : "حفظ المفاتيح"}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm leading-relaxed text-sky-900">
            <p className="font-semibold">إعداد Google Cloud (مهم)</p>
            <ol className="mt-3 list-inside list-decimal space-y-2">
              <li>
                فعّل{" "}
                <a
                  href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  YouTube Data API v3
                </a>
              </li>
              <li>
                أنشئ API Key من{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Credentials
                </a>
              </li>
              <li>
                API restrictions → Restrict key → اختر{" "}
                <strong>YouTube Data API v3</strong>
              </li>
              <li>
                Application restrictions → HTTP referrers → أضف:
                <code className="mt-1 block rounded bg-white px-2 py-1 text-xs">
                  http://localhost:3000/*
                </code>
                <code className="mt-1 block rounded bg-white px-2 py-1 text-xs">
                  https://your-app.vercel.app/*
                </code>
              </li>
            </ol>
          </div>

          <div className="rounded-2xl bg-stone-50 p-5 text-sm leading-relaxed text-stone-500">
            <p className="font-medium text-stone-700">ملاحظات:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>الطلبات تُرسل من المتصفح مباشرة (Referrer صحيح)</li>
              <li>المفاتيح تُحفظ في localStorage على جهازك</li>
              <li>كل بحث = طلبين فقط: search + channels</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
