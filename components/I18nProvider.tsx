"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createTranslator,
  getLocaleFromStorage,
  saveLocale,
  type Locale,
  type Translator,
} from "@/lib/i18n";

const I18nContext = createContext<
  Translator & { setLocale: (locale: Locale) => void }
 | null>(null);

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getLocaleFromStorage());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const { dir } = createTranslator(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("data-numbering", "latn");
  }, [locale, mounted]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    saveLocale(next);
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
