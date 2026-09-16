export const LOCALES = ["en", "ar", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  es: "Español",
};

export function isRtlLocale(locale: Locale): boolean {
  return locale === "ar";
}

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends readonly string[]
    ? readonly string[]
    : T[K] extends string
      ? string
      : DeepStringRecord<T[K]>;
};

export type TranslationDict = DeepStringRecord<
  typeof import("./translations/en").en
>;
