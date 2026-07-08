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

export function makeQuestion(cat: Category, word: Word, langMode: LangMode): Question {
  const lang = pickLang(langMode);
  const dir: "de2x" | "x2de" = Math.random() < 0.5 ? "de2x" : "x2de";
  const answer = dir === "de2x" ? word[lang] : word.de;
  const pool = cat.words.filter((w) => w.de !== word.de);
  const distractors: string[] = [];
  for (const w of shuffle(pool)) {
    const v = dir === "de2x" ? w[lang] : w.de;
    if (v !== answer && !distractors.includes(v)) distractors.push(v);
    if (distractors.length === 3) break;
  }
  return {
    catId: cat.id,
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
