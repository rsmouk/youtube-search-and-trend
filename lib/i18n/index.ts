import { ar } from "./translations/ar";
import { en } from "./translations/en";
import { es } from "./translations/es";
import { fr } from "./translations/fr";
import {
  DEFAULT_LOCALE,
  isRtlLocale,
  LOCALES,
  type Locale,
  type TranslationDict,
} from "./types";

export * from "./types";

const dictionaries: Record<Locale, TranslationDict> = { en, ar, fr, es };

export function getDictionary(locale: Locale): TranslationDict {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function getLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem("app_locale");
    if (stored && isValidLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function saveLocale(locale: Locale): void {
  localStorage.setItem("app_locale", locale);
}

type InterpolationValues = Record<string, string | number>;

function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );
}

export function createTranslator(locale: Locale) {
  const dict = getDictionary(locale);

  function t(path: string, values?: InterpolationValues): string {
    const keys = path.split(".");
    let current: unknown = dict;
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    if (typeof current === "string") {
      return interpolate(current, values);
    }
    if (Array.isArray(current)) {
      return current.join("\n");
    }
    return path;
  }

  return {
    t,
    locale,
    dir: isRtlLocale(locale) ? ("rtl" as const) : ("ltr" as const),
    dict,
  };
}

export type Translator = ReturnType<typeof createTranslator>;
