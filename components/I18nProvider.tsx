"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  createTranslator,
  type Locale,
  type Translator,
} from "@/lib/i18n";

const I18nContext = createContext<
  Translator & { setLocale: (locale: Locale) => void }
 | null>(null);

export default function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = createTranslator(locale).dir;
    document.documentElement.setAttribute("data-numbering", "latn");
    try {
      localStorage.setItem("app_locale", locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback((_next: Locale) => {
    // Locale changes via URL navigation (LanguageSwitcher)
  }, []);

  const value = useMemo(() => {
    const translator = createTranslator(locale);
    return { ...translator, setLocale };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
