"use client";

import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n";
import { useI18n } from "@/components/I18nProvider";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={compact ? "" : "flex items-center gap-2"}>
      {!compact && (
        <span className="text-xs text-stone-500">{t("language.label")}</span>
      )}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t("language.label")}
        className="rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-700 outline-none focus:border-stone-300 focus:ring-2 focus:ring-stone-100"
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
