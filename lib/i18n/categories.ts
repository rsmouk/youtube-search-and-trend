import type { Locale } from "./types";

/** Stable YouTube video category IDs → localized labels */
const CATEGORY_NAMES: Record<string, Record<Locale, string>> = {
  "1": {
    en: "Film & Animation",
    ar: "أفلام ورسوم متحركة",
    fr: "Film et animation",
    es: "Cine y animación",
  },
  "2": {
    en: "Autos & Vehicles",
    ar: "سيارات ومركبات",
    fr: "Autos et véhicules",
    es: "Autos y vehículos",
  },
  "10": {
    en: "Music",
    ar: "موسيقى",
    fr: "Musique",
    es: "Música",
  },
  "15": {
    en: "Pets & Animals",
    ar: "حيوانات أليفة",
    fr: "Animaux",
    es: "Mascotas y animales",
  },
  "17": {
    en: "Sports",
    ar: "رياضة",
    fr: "Sport",
    es: "Deportes",
  },
  "19": {
    en: "Travel & Events",
    ar: "سفر وفعاليات",
    fr: "Voyage et événements",
    es: "Viajes y eventos",
  },
  "20": {
    en: "Gaming",
    ar: "ألعاب",
    fr: "Jeux vidéo",
    es: "Videojuegos",
  },
  "22": {
    en: "People & Blogs",
    ar: "أشخاص ومدونات",
    fr: "People et blogs",
    es: "Gente y blogs",
  },
  "23": {
    en: "Comedy",
    ar: "كوميديا",
    fr: "Comédie",
    es: "Comedia",
  },
  "24": {
    en: "Entertainment",
    ar: "ترفيه",
    fr: "Divertissement",
    es: "Entretenimiento",
  },
  "25": {
    en: "News & Politics",
    ar: "أخبار وسياسة",
    fr: "Actualités et politique",
    es: "Noticias y política",
  },
  "26": {
    en: "Howto & Style",
    ar: "إرشادات وأسلوب",
    fr: "Mode et astuces",
    es: "Cómo hacerlo y estilo",
  },
  "27": {
    en: "Education",
    ar: "تعليم",
    fr: "Éducation",
    es: "Educación",
  },
  "28": {
    en: "Science & Technology",
    ar: "علوم وتقنية",
    fr: "Science et technologie",
    es: "Ciencia y tecnología",
  },
  "29": {
    en: "Nonprofits & Activism",
    ar: "غير ربحية ونشاط",
    fr: "Associations et activisme",
    es: "ONG y activismo",
  },
};

export function translateCategoryTitle(
  id: string,
  fallbackTitle: string,
  locale: Locale
): string {
  return CATEGORY_NAMES[id]?.[locale] ?? fallbackTitle;
}

export function getCategoryLabel(
  id: string | undefined | null,
  locale: Locale,
  allLabel: string
): string {
  if (!id) return allLabel;
  return CATEGORY_NAMES[id]?.[locale] ?? id;
}
