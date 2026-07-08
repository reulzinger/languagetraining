"use client";

import { useMemo, useState } from "react";
import { Category, Lang, LangMode, LANG_FLAG } from "@/lib/types";
import { pickLang, shuffle } from "@/lib/game";
import { playCorrect, playWrong, playWin } from "@/lib/sound";
import { Confetti, TopNav } from "./ui";
import { ReportFn } from "./Quiz";

const PAIRS = 8;
const XP_PER_PAIR = 5;

interface MemCard {
  id: number;
  wordDe: string;
  lang: Lang;
  side: "de" | "x";
  label: string;
}

function buildCards(cat: Category, langMode: LangMode): MemCard[] {
  const words = shuffle(cat.words).slice(0, PAIRS);
  const cards: MemCard[] = [];
  words.forEach((w, i) => {
    const lang = pickLang(langMode);
    cards.push({ id: i * 2, wordDe: w.de, lang, side: "de", label: `${w.emoji} ${w.de}` });
    cards.push({ id: i * 2 + 1, wordDe: w.de, lang, side: "x", label: `${LANG_FLAG[lang]} ${w[lang]}` });
  });
  return shuffle(cards);
}

export default function Memory({
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cards = useMemo(() => buildCards(cat, langMode), [cat, langMode, round]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  const done = matched.size === PAIRS;

  function flip(idx: number) {
    if (lock || open.includes(idx) || matched.has(cards[idx].wordDe)) return;
    const next = [...open, idx];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    setLock(true);
    const [a, b] = [cards[next[0]], cards[next[1]]];
    const isMatch = a.wordDe === b.wordDe && a.side !== b.side;
    setTimeout(() => {
      if (isMatch) {
        playCorrect();
        report(cat.id, a.wordDe, a.lang, true, XP_PER_PAIR);
        setMatched((prev) => {
          const s = new Set(prev);
          s.add(a.wordDe);
          if (s.size === PAIRS) playWin();
          return s;
        });
      } else {
        playWrong();
      }
      setOpen([]);
      setLock(false);
    }, isMatch ? 450 : 900);
  }

  function restart() {
    setRound((r) => r + 1);
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setLock(false);
  }

  if (done) {
    const perfect = moves <= PAIRS + 3;
    return (
      <div className="screen">
        <Confetti />
        <TopNav title="Memory" emoji="🧠" onBack={onExit} />
        <div className="card end-card pop">
          <div className="end-emoji">{perfect ? "🧠" : "🎉"}</div>
          <div className="end-title">{perfect ? "Elefantengedächtnis!" : "Alle Paare gefunden!"}</div>
          <div className="end-score">
            {PAIRS} Paare in {moves} Zügen
          </div>
          <div className="end-xp">+{PAIRS * XP_PER_PAIR} XP</div>
          <div className="end-actions">
            <button className="btn btn-primary btn-big" onClick={restart}>
              🔄 Nochmal
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
      <TopNav title={`${cat.emoji} Memory`} onBack={onExit} />
      <div className="memory-status">
        <span className="chip">🧩 {matched.size}/{PAIRS} Paare</span>
        <span className="chip">👆 {moves} Züge</span>
      </div>
      <div className="memory-grid">
        {cards.map((c, i) => {
          const isOpen = open.includes(i) || matched.has(c.wordDe);
          const isMatched = matched.has(c.wordDe);
          return (
            <button
              key={c.id}
              className={`mem-card ${isOpen ? "open" : ""} ${isMatched ? "matched" : ""}`}
              onClick={() => flip(i)}
              style={
                isOpen
                  ? undefined
                  : { background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }
              }
            >
              {isOpen ? <span className="mem-label">{c.label}</span> : <span className="mem-back">❓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
