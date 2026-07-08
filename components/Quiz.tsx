"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Category, Lang, LangMode, LANG_FLAG, LANG_LABEL } from "@/lib/types";
import { buildQuiz } from "@/lib/game";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playWin } from "@/lib/sound";
import { Confetti, ProgressBar, TopNav } from "./ui";

export type ReportFn = (catId: string, de: string, lang: Lang, correct: boolean, xp: number) => void;

const QUESTIONS = 10;
const XP_PER_CORRECT = 10;

export default function Quiz({
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
  const questions = useMemo(() => buildQuiz(cat, langMode, QUESTIONS), [cat, langMode, round]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[idx];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function pick(option: string) {
    if (picked !== null) return;
    const correct = option === q.answer;
    setPicked(option);
    report(cat.id, q.word.de, q.lang, correct, correct ? XP_PER_CORRECT : 0);
    if (correct) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
    }
    // Das fremdsprachige Wort immer einmal vorsprechen
    speak(q.word[q.lang], q.lang);
    timer.current = setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setDone(true);
        playWin();
      } else {
        setIdx(idx + 1);
        setPicked(null);
      }
    }, 1400);
  }

  function restart() {
    setRound((r) => r + 1);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const great = score >= questions.length * 0.7;
    return (
      <div className="screen">
        {great && <Confetti />}
        <TopNav title="Quiz" emoji="❓" onBack={onExit} />
        <div className="card end-card pop">
          <div className="end-emoji">{great ? "🏆" : score >= questions.length / 2 ? "💪" : "🌱"}</div>
          <div className="end-title">
            {great ? "Super gemacht!" : score >= questions.length / 2 ? "Gut dabei!" : "Weiter üben!"}
          </div>
          <div className="end-score">
            {score} von {questions.length} richtig
          </div>
          <div className="end-xp">+{score * XP_PER_CORRECT} XP</div>
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

  const questionLabel =
    q.dir === "de2x"
      ? `Wie heißt das auf ${LANG_LABEL[q.lang]}? ${LANG_FLAG[q.lang]}`
      : `Was bedeutet das auf Deutsch? 🇩🇪`;

  return (
    <div className="screen">
      <TopNav title={`${cat.emoji} Quiz`} onBack={onExit} />
      <div className="quiz-progress">
        <ProgressBar value={idx / questions.length} className="quizbar" />
        <span className="quiz-count">
          {idx + 1}/{questions.length}
        </span>
      </div>

      <div className="card quiz-card pop" key={idx}>
        <div className="quiz-label">{questionLabel}</div>
        <div className="quiz-prompt-emoji">{q.dir === "de2x" || picked ? q.word.emoji : "❔"}</div>
        <div className="quiz-prompt">
          {q.prompt}
          {q.dir === "x2de" && (
            <button className="speak-btn" onClick={() => speak(q.prompt, q.lang)} aria-label="Anhören">
              🔊
            </button>
          )}
        </div>
      </div>

      <div className="options">
        {q.options.map((opt) => {
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
