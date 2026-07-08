"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Category, LangMode, LANG_FLAG, LANG_LABEL } from "@/lib/types";
import { Question, makeQuestion, randomQuestion, shuffle } from "@/lib/game";
import { playCorrect, playWrong, playWin } from "@/lib/sound";
import { Confetti, TopNav } from "./ui";
import { ReportFn } from "./Quiz";

const SECONDS = 60;

function nextQuestion(cat: Category | null, langMode: LangMode, exclude?: string): Question {
  if (cat) {
    let word = cat.words[Math.floor(Math.random() * cat.words.length)];
    if (word.de === exclude) word = cat.words[(cat.words.indexOf(word) + 1) % cat.words.length];
    return makeQuestion(cat, word, langMode);
  }
  return randomQuestion(langMode, exclude);
}

export default function Blitz({
  cat,
  langMode,
  report,
  onExit,
}: {
  cat: Category | null;
  langMode: LangMode;
  report: ReportFn;
  onExit: () => void;
}) {
  const [time, setTime] = useState(SECONDS);
  const [q, setQ] = useState<Question>(() => nextQuestion(cat, langMode));
  const [picked, setPicked] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nur 3 Antwortmöglichkeiten für hohes Tempo
  const options = useMemo(() => {
    const wrong = q.options.filter((o) => o !== q.answer).slice(0, 2);
    return shuffle([q.answer, ...wrong]);
  }, [q]);

  useEffect(() => {
    if (done) return;
    if (time <= 0) {
      setDone(true);
      playWin();
      return;
    }
    const id = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, done]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function pick(option: string) {
    if (picked !== null || done) return;
    const correct = option === q.answer;
    setPicked(option);
    const gained = correct ? 10 + Math.min(combo, 5) * 2 : 0;
    report(q.catId, q.word.de, q.lang, correct, gained);
    if (correct) {
      setPoints((p) => p + gained);
      setHits((h) => h + 1);
      setCombo((c) => {
        const n = c + 1;
        setBestCombo((b) => Math.max(b, n));
        return n;
      });
      playCorrect();
    } else {
      setMisses((m) => m + 1);
      setCombo(0);
      playWrong();
    }
    timer.current = setTimeout(() => {
      setQ(nextQuestion(cat, langMode, q.word.de));
      setPicked(null);
    }, correct ? 350 : 800);
  }

  function restart() {
    setTime(SECONDS);
    setQ(nextQuestion(cat, langMode));
    setPicked(null);
    setPoints(0);
    setHits(0);
    setMisses(0);
    setCombo(0);
    setBestCombo(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="screen">
        {hits >= 10 && <Confetti />}
        <TopNav title="Blitzrunde" emoji="⚡" onBack={onExit} />
        <div className="card end-card pop">
          <div className="end-emoji">{hits >= 15 ? "🏆" : hits >= 8 ? "⚡" : "🐢"}</div>
          <div className="end-title">Zeit ist um!</div>
          <div className="end-score">
            {hits} richtig · {misses} daneben
            {bestCombo >= 3 ? ` · beste Serie: ${bestCombo} 🔥` : ""}
          </div>
          <div className="end-xp">+{points} XP</div>
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
      <TopNav title={cat ? `${cat.emoji} Blitzrunde` : "⚡ Blitzrunde"} onBack={onExit} />

      <div className="blitz-status">
        <div className={`blitz-timerbar ${time <= 10 ? "low" : ""}`}>
          <div className="blitz-timerfill" style={{ width: `${(time / SECONDS) * 100}%` }} />
        </div>
        <div className="blitz-numbers">
          <span className="chip">⏱️ {time}s</span>
          <span className="chip chip-points">⭐ {points}</span>
          {combo >= 3 && <span className="chip chip-combo">🔥 {combo}er-Serie!</span>}
        </div>
      </div>

      <div className="card quiz-card blitz-card" key={`${q.word.de}-${time <= 0}`}>
        <div className="quiz-label">
          {q.dir === "de2x"
            ? `Auf ${LANG_LABEL[q.lang]}? ${LANG_FLAG[q.lang]}`
            : "Auf Deutsch? 🇩🇪"}
        </div>
        <div className="quiz-prompt-emoji">{q.dir === "de2x" || picked ? q.word.emoji : "❔"}</div>
        <div className="quiz-prompt">{q.prompt}</div>
      </div>

      <div className="options">
        {options.map((opt) => {
          let cls = "btn option-btn";
          if (picked !== null) {
            if (opt === q.answer) cls += " correct";
            else if (opt === picked) cls += " wrong";
            else cls += " faded";
          }
          return (
            <button key={opt} className={cls} onClick={() => pick(opt)} disabled={picked !== null}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
