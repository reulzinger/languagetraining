import { CATEGORIES } from "./data";
import { Category, Lang, LangMode, Word } from "./types";

export function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickLang(mode: LangMode): Lang {
  if (mode === "both") return Math.random() < 0.5 ? "en" : "es";
  return mode;
}

export interface Question {
  catId: string;
  word: Word;
  lang: Lang;
  dir: "de2x" | "x2de";
  prompt: string;
  answer: string;
  options: string[];
}

export function makeQuestion(
  cat: Category,
  word: Word,
  langMode: LangMode,
  fixed?: { lang?: Lang; dir?: "de2x" | "x2de" }
): Question {
  const lang = fixed?.lang ?? pickLang(langMode);
  const dir: "de2x" | "x2de" = fixed?.dir ?? (Math.random() < 0.5 ? "de2x" : "x2de");
  const answer = dir === "de2x" ? word[lang] : word.de;
  const pool = cat.words.filter((w) => w.de !== word.de);
  const distractors: string[] = [];
  for (const w of shuffle(pool)) {
    const v = dir === "de2x" ? w[lang] : w.de;
    if (v !== answer && !distractors.includes(v)) distractors.push(v);
    if (distractors.length === 3) break;
  }
  return {
    catId: word.catId ?? cat.id,
    word,
    lang,
    dir,
    prompt: dir === "de2x" ? word.de : word[lang],
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

export function buildQuiz(cat: Category, langMode: LangMode, count: number): Question[] {
  const words = shuffle(cat.words).slice(0, count);
  return words.map((w) => makeQuestion(cat, w, langMode));
}

/** Hör-Quiz: fremdes Wort hören, deutsche Bedeutung wählen. */
export function buildListening(cat: Category, langMode: LangMode, count: number): Question[] {
  const words = shuffle(cat.words).slice(0, count);
  return words.map((w) => makeQuestion(cat, w, langMode, { dir: "x2de" }));
}

export interface WeakEntry {
  cat: Category;
  word: Word;
  lang: Lang;
}

/** Wackelkandidaten: schon geübte Wörter mit Stärke 0–1. */
export function weakEntries(strength: Record<string, number>, langMode: LangMode): WeakEntry[] {
  const langs: Lang[] = langMode === "both" ? ["en", "es"] : [langMode];
  const out: WeakEntry[] = [];
  for (const cat of CATEGORIES) {
    for (const word of cat.words) {
      for (const lang of langs) {
        const s = strength[`${cat.id}|${word.de}|${lang}`];
        if (s !== undefined && s <= 1) out.push({ cat, word, lang });
      }
    }
  }
  return out;
}

export function buildReview(
  strength: Record<string, number>,
  langMode: LangMode,
  count: number
): Question[] {
  return shuffle(weakEntries(strength, langMode))
    .slice(0, count)
    .map((e) => makeQuestion(e.cat, e.word, langMode, { lang: e.lang }));
}

/** Artikel entfernen, damit man nur das eigentliche Wort tippen muss. */
export function stripArticle(text: string, lang: Lang): string {
  if (lang === "es") return text.replace(/^(el|la|los|las)\s+/i, "");
  return text.replace(/^(to|the)\s+/i, "");
}

/** Sprache wählen, in der sich das Wort gut tippen lässt (kurz, ohne Leerzeichen). */
export function typeableLang(word: Word, langMode: LangMode): Lang | null {
  const candidates: Lang[] = langMode === "both" ? shuffle(["en", "es"]) : [langMode];
  for (const lang of candidates) {
    const t = stripArticle(word[lang], lang);
    if (!t.includes(" ") && t.length >= 2 && t.length <= 12) return lang;
  }
  return null;
}

/** Teilt eine Kategorie in kleine Lerngruppen für die geführte Lektion. */
export function buildLessonBatches(cat: Category, batchSize = 5): Word[][] {
  const out: Word[][] = [];
  for (let i = 0; i < cat.words.length; i += batchSize) out.push(cat.words.slice(i, i + batchSize));
  return out;
}

/** Endlose Fragen quer durch alle Kategorien (für die Blitzrunde). */
export function randomQuestion(langMode: LangMode, exclude?: string): Question {
  for (let i = 0; i < 10; i++) {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const word = cat.words[Math.floor(Math.random() * cat.words.length)];
    if (word.de !== exclude || i === 9) return makeQuestion(cat, word, langMode);
  }
  const cat = CATEGORIES[0];
  return makeQuestion(cat, cat.words[0], langMode);
}
