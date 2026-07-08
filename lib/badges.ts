import { CATEGORIES } from "./data";
import { buildLessons } from "./game";
import { Profile, levelInfo, lessonProgressKey, starsFor } from "./storage";

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  earned: (p: Profile) => boolean;
}

function threeStarCategories(p: Profile): number {
  let n = 0;
  for (const cat of CATEGORIES) {
    if (starsFor(p, cat, "en") === 3 || starsFor(p, cat, "es") === 3) n++;
  }
  return n;
}

function allLessonsStarted(p: Profile): boolean {
  for (const cat of CATEGORIES) {
    const lessonCount = buildLessons(cat).length;
    for (let i = 0; i < lessonCount; i++) {
      if ((p.lessonProgress?.[lessonProgressKey(cat.id, i)] ?? 0) < 1) return false;
    }
  }
  return true;
}

export const BADGES: Badge[] = [
  {
    id: "start",
    emoji: "👟",
    name: "Erste Schritte",
    desc: "10 richtige Antworten",
    earned: (p) => p.totalCorrect >= 10,
  },
  {
    id: "sammler",
    emoji: "📚",
    name: "Wortsammler",
    desc: "100 richtige Antworten",
    earned: (p) => p.totalCorrect >= 100,
  },
  {
    id: "profi",
    emoji: "🎓",
    name: "Wortprofi",
    desc: "500 richtige Antworten",
    earned: (p) => p.totalCorrect >= 500,
  },
  {
    id: "meister",
    emoji: "👑",
    name: "Wortmeister",
    desc: "2000 richtige Antworten",
    earned: (p) => p.totalCorrect >= 2000,
  },
  {
    id: "streak3",
    emoji: "🔥",
    name: "Dranbleiber",
    desc: "3 Tage am Stück geübt",
    earned: (p) => p.streak >= 3,
  },
  {
    id: "streak7",
    emoji: "🎇",
    name: "Feuerwoche",
    desc: "7 Tage am Stück geübt",
    earned: (p) => p.streak >= 7,
  },
  {
    id: "level5",
    emoji: "🚀",
    name: "Aufsteiger",
    desc: "Level 5 erreicht",
    earned: (p) => levelInfo(p.xp).level >= 5,
  },
  {
    id: "level10",
    emoji: "🦸",
    name: "Sprachheld",
    desc: "Level 10 erreicht",
    earned: (p) => levelInfo(p.xp).level >= 10,
  },
  {
    id: "stern",
    emoji: "⭐",
    name: "Sternensammler",
    desc: "Eine Kategorie mit 3 Sternen",
    earned: (p) => threeStarCategories(p) >= 1,
  },
  {
    id: "sterne5",
    emoji: "🌟",
    name: "Sternenhimmel",
    desc: "5 Kategorien mit 3 Sternen",
    earned: (p) => threeStarCategories(p) >= 5,
  },
  {
    id: "bilingual",
    emoji: "🌍",
    name: "Weltenbummler",
    desc: "Je 100 richtige auf Englisch und Spanisch",
    earned: (p) => p.correctEn >= 100 && p.correctEs >= 100,
  },
  {
    id: "blitz",
    emoji: "⚡",
    name: "Blitzmeister",
    desc: "15 Treffer in einer Blitzrunde",
    earned: (p) => p.blitzBest >= 15,
  },
  {
    id: "lesson1",
    emoji: "📖",
    name: "Erste Lektion",
    desc: "Eine Lektion abgeschlossen",
    earned: (p) => Object.values(p.lessonProgress ?? {}).some((n) => n >= 1),
  },
  {
    id: "lessonAll",
    emoji: "🏅",
    name: "Alles gelernt",
    desc: "Jede Lektion in jeder Kategorie mindestens einmal gemacht",
    earned: (p) => allLessonsStarted(p),
  },
  {
    id: "lessonRepeat",
    emoji: "🔂",
    name: "Übung macht den Meister",
    desc: "Eine Lektion 3× wiederholt",
    earned: (p) => Object.values(p.lessonProgress ?? {}).some((n) => n >= 3),
  },
];
