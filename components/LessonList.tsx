"use client";

import { useMemo } from "react";
import { Category } from "@/lib/types";
import { buildLessons } from "@/lib/game";
import { Profile, lessonRoundsFor } from "@/lib/storage";
import { TopNav } from "./ui";

export default function LessonList({
  cat,
  profile,
  onPlay,
  onBack,
}: {
  cat: Category;
  profile: Profile;
  onPlay: (lessonIndex: number) => void;
  onBack: () => void;
}) {
  const lessons = useMemo(() => buildLessons(cat), [cat]);

  return (
    <div className="screen">
      <TopNav title={`${cat.emoji} ${cat.name}`} onBack={onBack} />
      <div
        className="mode-hero card"
        style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}
      >
        <span className="mode-hero-emoji">📖</span>
        <div className="mode-hero-info">
          <div className="mode-hero-name">Lektionen</div>
          <div className="mode-hero-count">
            {lessons.length} Lektionen · {cat.words.length} Wörter insgesamt
          </div>
        </div>
      </div>

      <div className="mode-list">
        {lessons.map((words, i) => {
          const rounds = lessonRoundsFor(profile, cat.id, i);
          return (
            <button key={i} className="mode-btn lesson-list-btn card pop" onClick={() => onPlay(i)}>
              <span className="mode-btn-emoji">{rounds > 0 ? "✅" : "📖"}</span>
              <span className="mode-btn-text">
                <span className="mode-btn-title">Lektion {i + 1}</span>
                <span className="mode-btn-desc">
                  {words.length} Wörter{rounds > 0 ? ` · ${rounds}× geübt` : " · noch nicht gemacht"}
                </span>
              </span>
              <span className="mode-btn-go">▶</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
