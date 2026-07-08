import { Category, Lang, LangMode } from "./types";

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  lastActive: string; // YYYY-MM-DD
  lang: LangMode;
  strength: Record<string, number>; // "catId|de|lang" -> 0..3
  weekXp: number;
  weekKey: string;
  totalCorrect: number;
  correctEn: number;
  correctEs: number;
  blitzBest: number; // meiste Treffer in einer Blitzrunde
}

const PROFILES_KEY = "sprachhelden_profiles_v1";
const ACTIVE_KEY = "sprachhelden_active_v1";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function localDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function currentWeekKey(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.floor((d.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000));
  return `${d.getFullYear()}-${week}`;
}

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<Profile>[];
    // Ältere Profile um neue Felder ergänzen
    return parsed.map(
      (p) =>
        ({
          totalCorrect: 0,
          correctEn: 0,
          correctEs: 0,
          blitzBest: 0,
          ...p,
        }) as Profile
    );
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string | null) {
  if (id === null) localStorage.removeItem(ACTIVE_KEY);
  else localStorage.setItem(ACTIVE_KEY, id);
}

export function newProfile(name: string, avatar: string): Profile {
  return {
    id: `p_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    name,
    avatar,
    xp: 0,
    streak: 0,
    lastActive: "",
    lang: "en",
    strength: {},
    weekXp: 0,
    weekKey: currentWeekKey(),
    totalCorrect: 0,
    correctEn: 0,
    correctEs: 0,
    blitzBest: 0,
  };
}

/** Streak fortschreiben: heute schon aktiv → nichts, gestern aktiv → +1, sonst Neustart. */
export function touchStreak(p: Profile) {
  const today = localDateStr();
  if (p.lastActive === today) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  p.streak = p.lastActive === localDateStr(y) ? p.streak + 1 : 1;
  p.lastActive = today;
}

export function addXp(p: Profile, amount: number) {
  p.xp += amount;
  const wk = currentWeekKey();
  if (p.weekKey !== wk) {
    p.weekKey = wk;
    p.weekXp = 0;
  }
  p.weekXp += amount;
}

export function recordWord(p: Profile, catId: string, de: string, lang: Lang, correct: boolean) {
  const key = `${catId}|${de}|${lang}`;
  const s = p.strength[key] ?? 0;
  p.strength[key] = correct ? Math.min(3, s + 1) : Math.max(0, s - 1);
  if (correct) {
    p.totalCorrect += 1;
    if (lang === "en") p.correctEn += 1;
    else p.correctEs += 1;
  }
}

/** 0–3 Sterne, je nachdem wie gut die Wörter der Kategorie sitzen. */
export function starsFor(p: Profile, cat: Category, lang: Lang): number {
  let sum = 0;
  for (const w of cat.words) sum += p.strength[`${cat.id}|${w.de}|${lang}`] ?? 0;
  const ratio = sum / (cat.words.length * 3);
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.5) return 2;
  if (ratio >= 0.15) return 1;
  return 0;
}

export function levelInfo(xp: number): { level: number; progress: number; toNext: number } {
  const level = Math.floor(Math.sqrt(xp / 60)) + 1;
  const start = 60 * (level - 1) * (level - 1);
  const next = 60 * level * level;
  return { level, progress: (xp - start) / (next - start), toNext: next - xp };
}
