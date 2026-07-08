export type Lang = "en" | "es";
export type LangMode = Lang | "both";

export interface Word {
  de: string;
  en: string;
  es: string;
  emoji: string;
  lvl: 1 | 2 | 3;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  from: string; // Gradient-Startfarbe
  to: string; // Gradient-Endfarbe
  words: Word[];
}

export const LANG_LABEL: Record<Lang, string> = { en: "Englisch", es: "Spanisch" };
export const LANG_FLAG: Record<Lang, string> = { en: "🇬🇧", es: "🇪🇸" };
