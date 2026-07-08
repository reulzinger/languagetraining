"use client";

import { CATEGORIES, MIXED_CATEGORY, ALL_WORDS_COUNT } from "@/lib/data";
import { weakEntries } from "@/lib/game";
import { BADGES } from "@/lib/badges";
import { Profile, levelInfo, starsFor } from "@/lib/storage";
import { Lang, LangMode, LANG_FLAG } from "@/lib/types";
import { speak } from "@/lib/speech";
import { ProgressBar, Stars } from "./ui";

function wordOfToday() {
  const all = CATEGORIES.flatMap((c) => c.words);
  const days = Math.floor(Date.now() / 86400000);
  return all[days % all.length];
}

const LANG_OPTIONS: { value: LangMode; label: string }[] = [
  { value: "en", label: "🇬🇧 Englisch" },
  { value: "es", label: "🇪🇸 Spanisch" },
  { value: "both", label: "🌍 Beide" },
];

export default function Home({
  profile,
  profiles,
  onOpenCategory,
  onBlitz,
  onReview,
  onProfiles,
  onLangChange,
}: {
  profile: Profile;
  profiles: Profile[];
  onOpenCategory: (id: string) => void;
  onBlitz: () => void;
  onReview: () => void;
  onProfiles: () => void;
  onLangChange: (mode: LangMode) => void;
}) {
  const { level, progress } = levelInfo(profile.xp);
  const wod = wordOfToday();
  const langs: Lang[] = profile.lang === "both" ? ["en", "es"] : [profile.lang];
  const board = [...profiles].sort((a, b) => b.weekXp - a.weekXp);
  const medals = ["🥇", "🥈", "🥉"];
  const weakCount = weakEntries(profile.strength, profile.lang).length;
  const earnedBadges = BADGES.filter((b) => b.earned(profile));

  return (
    <div className="screen home-screen">
      <header className="home-header card">
        <button className="home-avatar" onClick={onProfiles} aria-label="Profil wechseln">
          {profile.avatar}
        </button>
        <div className="home-headinfo">
          <div className="home-greeting">Hallo, {profile.name}!</div>
          <div className="home-levelrow">
            <span className="chip chip-level">Level {level}</span>
            <ProgressBar value={progress} className="xpbar" />
            <span className="home-xp">{profile.xp} XP</span>
          </div>
        </div>
        <div className={`chip chip-streak ${profile.streak > 0 ? "hot" : ""}`}>
          🔥 {profile.streak}
        </div>
      </header>

      <div className="segmented">
        {LANG_OPTIONS.map((o) => (
          <button
            key={o.value}
            className={`seg-btn ${profile.lang === o.value ? "active" : ""}`}
            onClick={() => onLangChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <button className="blitz-cta card" onClick={onBlitz}>
        <span className="blitz-emoji">⚡</span>
        <span className="blitz-text">
          <span className="blitz-title">Blitzrunde</span>
          <span className="blitz-sub">60 Sekunden · alle {ALL_WORDS_COUNT} Wörter · wer schafft mehr?</span>
        </span>
        <span className="blitz-go">▶</span>
      </button>

      {weakCount > 0 && (
        <button className="review-cta card" onClick={onReview}>
          <span className="review-emoji">🔁</span>
          <span className="blitz-text">
            <span className="review-title">Wackelkandidaten üben</span>
            <span className="review-sub">
              {weakCount} {weakCount === 1 ? "Wort sitzt" : "Wörter sitzen"} noch nicht sicher
            </span>
          </span>
          <span className="blitz-go">▶</span>
        </button>
      )}

      <div className="card wod-card">
        <div className="card-label">✨ Wort des Tages</div>
        <div className="wod-row">
          <span className="wod-emoji">{wod.emoji}</span>
          <div className="wod-words">
            <div className="wod-de">{wod.de}</div>
            <button className="wod-lang" onClick={() => speak(wod.en, "en")}>
              🇬🇧 {wod.en} <span className="speak-icon">🔊</span>
            </button>
            <button className="wod-lang" onClick={() => speak(wod.es, "es")}>
              🇪🇸 {wod.es} <span className="speak-icon">🔊</span>
            </button>
          </div>
        </div>
      </div>

      {profiles.length > 1 && (
        <div className="card board-card">
          <div className="card-label">🏆 Familien-Bestenliste (diese Woche)</div>
          {board.map((p, i) => (
            <div key={p.id} className={`board-row ${p.id === profile.id ? "me" : ""}`}>
              <span className="board-medal">{medals[i] ?? `${i + 1}.`}</span>
              <span className="board-avatar">{p.avatar}</span>
              <span className="board-name">{p.name}</span>
              <span className="board-xp">{p.weekXp} XP</span>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">📚 Kategorien</h2>
      <div className="cat-grid">
        {[MIXED_CATEGORY, ...CATEGORIES].map((cat) => (
          <button
            key={cat.id}
            className="cat-tile"
            style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}
            onClick={() => onOpenCategory(cat.id)}
          >
            {!cat.isMixed && profile.lessonsDone.includes(cat.id) && (
              <span className="cat-done-badge" title="Lektion abgeschlossen">✅</span>
            )}
            <span className="cat-emoji">{cat.emoji}</span>
            <span className="cat-name">{cat.name}</span>
            <span className="cat-count">
              {cat.isMixed ? "Alle Wörter gemischt" : `${cat.words.length} Wörter`}
            </span>
            {!cat.isMixed && (
              <span className="cat-stars">
                {langs.map((l) => (
                  <span key={l} className="cat-starrow">
                    {profile.lang === "both" && <span className="cat-flag">{LANG_FLAG[l]}</span>}
                    <Stars count={starsFor(profile, cat, l)} size={13} />
                  </span>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card badge-card">
        <div className="card-label">
          🎖️ Abzeichen ({earnedBadges.length}/{BADGES.length})
        </div>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const got = b.earned(profile);
            return (
              <div key={b.id} className={`badge ${got ? "earned" : "locked"}`} title={b.desc}>
                <span className="badge-emoji">{got ? b.emoji : "🔒"}</span>
                <span className="badge-name">{b.name}</span>
                <span className="badge-desc">{b.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="home-footer">
        Fortschritt wird auf diesem Gerät gespeichert · {ALL_WORDS_COUNT} Wörter an Bord 🎒
      </footer>
    </div>
  );
}
