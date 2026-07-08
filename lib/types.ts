export type Lang = "en" | "es";
export type LangMode = Lang | "both";

export interface Word {
  de: string;
  en: string;
  es: string;
  emoji: string;
  lvl: 1 | 2 | 3;
  catId?: string; // gesetzt, wenn das Wort aus einer anderen Kategorie stammt (z.B. "Gemischt")
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  from: string; // Gradient-Startfarbe
  to: string; // Gradient-Endfarbe
  words: Word[];
  isMixed?: boolean; // Sammelkategorie aus allen Themen, ohne eigene Lektion/Sterne
  practiceLimit?: number; // begrenzt z.B. die Karteikarten-Stapelgröße bei sehr großen Pools
}

export const LANG_LABEL: Record<Lang, string> = { en: "Englisch", es: "Spanisch" };
export const LANG_FLAG: Record<Lang, string> = { en: "🇬🇧", es: "🇪🇸" };
