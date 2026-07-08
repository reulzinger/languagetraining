"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Lang, LANG_FLAG, LANG_LABEL } from "@/lib/types";
import { Question } from "@/lib/game";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playWin } from "@/lib/sound";
import { Confetti, ProgressBar, TopNav } from "./ui";

export type ReportFn = (catId: string, de: string, lang: Lang, correct: boolean, xp: number) => void;

const XP_PER_CORRECT = 10;

/**
 * Generische Quiz-Engine: normales Quiz, Hör-Quiz (listening) und
 * Wackelkandidaten-Wiederholung nutzen dieselbe Mechanik.
 */
export default function Quiz({
  title,
  makeQuestions,
  listening = false,
  report,
  onExit,
}: {
  title: string;
  makeQuestions: () => Question[];
  listening?: boolean;
  report: ReportFn;
  onExit: () => void;
}) {
  const [round, setRound] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => makeQuestions(), [round]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[idx];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Im Hör-Quiz jede Frage automatisch vorsprechen
  useEffect(() => {
    if (listening && q) speak(q.prompt, q.lang);
  }, [listening, idx, q]);

  function advance() {
    if (idx + 1 >= questions.length) {
      setDone(true);
      playWin();
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  function pick(option: string) {
    if (picked !== null || !q) return;
    const correct = option === q.answer;
    setPicked(option);
    report(q.catId, q.word.de, q.lang, correct, correct ? XP_PER_CORRECT : 0);
    if (correct) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
    }
    if (!listening) speak(q.word[q.lang], q.lang);
    // Im Hör-Quiz erst weiter, wenn per Button bestätigt – Zeit zum Lesen & Merken
    if (listening) return;
    timer.current = setTimeout(advance, 1400);
  }

  function restart() {
    setRound((r) => r + 1);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  if (questions.length === 0) {
    return (
      <div className="screen">
        <TopNav title={title} onBack={onExit} />
        <div className="card end-card pop">
          <div className="end-emoji">🎉</div>
          <div className="end-title">Nichts zu üben!</div>
          <div className="end-score">Gerade sitzen alle Wörter – spiel eine Runde, um Neues zu lernen.</div>
          <div className="end-actions">
            <button className="btn btn-primary btn-big" onClick={onExit}>
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const great = score >= questions.length * 0.7;
    return (
      <div className="screen">
        {great && <Confetti />}
        <TopNav title={title} onBack={onExit} />
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

  const questionLabel = listening
    ? `Hör gut zu! ${LANG_FLAG[q.lang]} Was bedeutet das?`
    : q.dir === "de2x"
      ? `Wie heißt das auf ${LANG_LABEL[q.lang]}? ${LANG_FLAG[q.lang]}`
      : `Was bedeutet das auf Deutsch? 🇩🇪`;

  return (
    <div className="screen">
      <TopNav title={title} onBack={onExit} />
      <div className="quiz-progress">
        <ProgressBar value={idx / questions.length} className="quizbar" />
        <span className="quiz-count">
          {idx + 1}/{questions.length}
        </span>
      </div>

      <div className="card quiz-card pop" key={idx}>
        <div className="quiz-label">{questionLabel}</div>
        {listening ? (
          <>
            <button className="listen-big" onClick={() => speak(q.prompt, q.lang)} aria-label="Nochmal anhören">
              🔊
            </button>
            <div className="quiz-prompt listen-reveal">{picked ? `${q.word.emoji} ${q.prompt}` : "Tippe zum Wiederholen"}</div>
          </>
        ) : (
          <>
            <div className="quiz-prompt-emoji">{q.dir === "de2x" || picked ? q.word.emoji : "❔"}</div>
            <div className="quiz-prompt">
              {q.prompt}
              {q.dir === "x2de" && (
                <button className="speak-btn" onClick={() => speak(q.prompt, q.lang)} aria-label="Anhören">
                  🔊
                </button>
              )}
            </div>
          </>
        )}
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

      {listening && picked !== null && (
        <button className="btn btn-primary btn-big pop" onClick={advance}>
          {idx + 1 >= questions.length ? "Fertig ✅" : "Weiter ➡️"}
        </button>
      )}
    </div>
  );
}
