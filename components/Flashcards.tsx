"use client";

import { useMemo, useState } from "react";
import { Category, Lang, LangMode, LANG_FLAG } from "@/lib/types";
import { Word } from "@/lib/types";
import { shuffle } from "@/lib/game";
import { speak } from "@/lib/speech";
import { playCorrect, playWin } from "@/lib/sound";
import { Confetti, ProgressBar, TopNav } from "./ui";
import { ReportFn } from "./Quiz";

const XP_PER_KNOWN = 5;

function pickDeck(cat: Category): Word[] {
  const all = shuffle(cat.words);
  return cat.practiceLimit ? all.slice(0, cat.practiceLimit) : all;
}

export default function Flashcards({
  cat,
  langMode,
  report,
  onExit,
}: {
  cat: Category;
  langMode: LangMode;
  report: ReportFn;
  onExit: () => void;
}) {
  const [round, setRound] = useState(0);
  const initial = useMemo(() => pickDeck(cat), [cat, round]);
  const [queue, setQueue] = useState<Word[]>(initial);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [retries, setRetries] = useState(0);
  const [xp, setXp] = useState(0);

  const total = initial.length;
  const langs: Lang[] = langMode === "both" ? ["en", "es"] : [langMode];
  const card = queue[0];

  function answer(knewIt: boolean) {
    if (!card) return;
    const wordCatId = card.catId ?? cat.id;
    langs.forEach((l, i) => report(wordCatId, card.de, l, knewIt, knewIt && i === 0 ? XP_PER_KNOWN : 0));
    if (knewIt) {
      setXp((x) => x + XP_PER_KNOWN);
      setKnown((k) => k + 1);
      playCorrect();
      const rest = queue.slice(1);
      setQueue(rest);
      if (rest.length === 0) playWin();
    } else {
      setRetries((r) => r + 1);
      setQueue([...queue.slice(1), card]);
    }
    setFlipped(false);
  }

  function restart() {
    setRound((r) => r + 1);
    setQueue(pickDeck(cat));
    setFlipped(false);
    setKnown(0);
    setRetries(0);
    setXp(0);
  }

  if (!card) {
    return (
      <div className="screen">
        <Confetti />
        <TopNav title="Karteikarten" emoji="🃏" onBack={onExit} />
        <div className="card end-card pop">
          <div className="end-emoji">🎉</div>
          <div className="end-title">Stapel geschafft!</div>
          <div className="end-score">
            {total} Karten gemeistert{retries > 0 ? ` · ${retries}× wiederholt` : ""}
          </div>
          <div className="end-xp">+{xp} XP</div>
          <div className="end-actions">
            <button className="btn btn-primary btn-big" onClick={restart}>
              🔄 Nochmal mischen
            </button>
            <button className="btn btn-ghost btn-big" onClick={onExit}>
              Fertig
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopNav title={`${cat.emoji} Karteikarten`} onBack={onExit} />
      <div className="quiz-progress">
        <ProgressBar value={known / total} className="quizbar" />
        <span className="quiz-count">
          {known}/{total}
        </span>
      </div>

      <div className={`flip-wrap ${flipped ? "flipped" : ""}`}>
        <button className="flip-card" onClick={() => setFlipped((f) => !f)}>
          <div
            className="flip-face flip-front"
            style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}
          >
            <span className="flip-emoji">{card.emoji}</span>
            <span className="flip-word">{card.de}</span>
            <span className="flip-hint">Tippen zum Umdrehen 👆</span>
          </div>
          <div className="flip-face flip-back">
            <span className="flip-emoji">{card.emoji}</span>
            {langs.map((l) => (
              <span key={l} className="flip-translation">
                <span className="flip-flag">{LANG_FLAG[l]}</span>
                <span className="flip-word-back">{card[l]}</span>
                <span
                  className="speak-btn"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(card[l], l);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && speak(card[l], l)}
                  aria-label="Anhören"
                >
                  🔊
                </span>
              </span>
            ))}
          </div>
        </button>
      </div>

      {flipped ? (
        <div className="flash-actions">
          <button className="btn btn-again" onClick={() => answer(false)}>
            🔄 Nochmal üben
          </button>
          <button className="btn btn-known" onClick={() => answer(true)}>
            ✅ Gewusst!
          </button>
        </div>
      ) : (
        <div className="flash-actions-placeholder">Weißt du, was das heißt?</div>
      )}
    </div>
  );
}
