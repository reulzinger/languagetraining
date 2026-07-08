"use client";

import { Category, Lang, LANG_FLAG } from "@/lib/types";
import { Profile, lessonRoundsFor, starsFor } from "@/lib/storage";
import { typeableLang } from "@/lib/game";
import { speechAvailable } from "@/lib/speech";
import { Stars, TopNav } from "./ui";
import { GameMode } from "./App";

const MODES: { mode: GameMode; emoji: string; title: string; desc: string }[] = [
  { mode: "flash", emoji: "🃏", title: "Karteikarten", desc: "Karten umdrehen, anhören und einprägen" },
  { mode: "quiz", emoji: "❓", title: "Quiz", desc: "10 Fragen mit 4 Antworten – was stimmt?" },
  { mode: "memory", emoji: "🧠", title: "Memory", desc: "Finde die passenden Wortpaare" },
  { mode: "typing", emoji: "⌨️", title: "Wort tippen", desc: "Baue das Wort aus dem Buchstabensalat" },
  { mode: "listen", emoji: "🎧", title: "Hör-Quiz", desc: "Gut zuhören und die Bedeutung wählen" },
  { mode: "blitz", emoji: "⚡", title: "Blitzrunde", desc: "60 Sekunden Vollgas nur mit dieser Kategorie" },
];

export default function ModeSelect({
  cat,
  profile,
  onPlay,
  onBack,
}: {
  cat: Category;
  profile: Profile;
  onPlay: (mode: GameMode) => void;
  onBack: () => void;
}) {
  const langs: Lang[] = profile.lang === "both" ? ["en", "es"] : [profile.lang];
  const typeableCount = cat.words.filter((w) => typeableLang(w, profile.lang)).length;
  const rounds = lessonRoundsFor(profile, cat.id);

  const modes = MODES.filter((m) => {
    if (m.mode === "typing" && typeableCount < 6) return false;
    if (m.mode === "listen" && !speechAvailable()) return false;
    return true;
  });

  return (
    <div className="screen">
      <TopNav title={cat.name} emoji={cat.emoji} onBack={onBack} />
      <div
        className="mode-hero card"
        style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}
      >
        <span className="mode-hero-emoji">{cat.emoji}</span>
        <div className="mode-hero-info">
          <div className="mode-hero-name">{cat.name}</div>
          {cat.isMixed ? (
            <div className="mode-hero-count">🎲 Zufällige Auswahl aus allen Kategorien</div>
          ) : (
            <>
              <div className="mode-hero-count">{cat.words.length} Wörter</div>
              <div className="mode-hero-stars">
                {langs.map((l) => (
                  <span key={l} className="cat-starrow">
                    <span className="cat-flag">{LANG_FLAG[l]}</span>
                    <Stars count={starsFor(profile, cat, l)} size={15} />
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {!cat.isMixed && (
        <button className="lesson-cta card pop" onClick={() => onPlay("lesson")}>
          <span className="lesson-cta-ribbon">
            {rounds === 0 ? "Empfohlen zum Start" : `✅ ${rounds}× abgeschlossen`}
          </span>
          <span className="lesson-cta-row">
            <span className="lesson-cta-emoji">📖</span>
            <span className="mode-btn-text">
              <span className="mode-btn-title">Lektion {rounds + 1}</span>
              <span className="mode-btn-desc">Erst alle Wörter kennenlernen, dann in kleinen Gruppen abfragen</span>
            </span>
            <span className="mode-btn-go">▶</span>
          </span>
        </button>
      )}

      <div className="mode-list">
        {modes.map((m) => (
          <button key={m.mode} className="mode-btn card pop" onClick={() => onPlay(m.mode)}>
            <span className="mode-btn-emoji">{m.emoji}</span>
            <span className="mode-btn-text">
              <span className="mode-btn-title">{m.title}</span>
              <span className="mode-btn-desc">{m.desc}</span>
            </span>
            <span className="mode-btn-go">▶</span>
          </button>
        ))}
      </div>
    </div>
  );
}
