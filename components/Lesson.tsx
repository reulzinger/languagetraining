"use client";

import { useMemo, useState } from "react";
import { Category, Lang, LangMode, Word, LANG_FLAG } from "@/lib/types";
import { Question, buildLessonBatches, makeQuestion, shuffle } from "@/lib/game";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playWin } from "@/lib/sound";
import { Confetti, ProgressBar, TopNav } from "./ui";
import { ReportFn } from "./Quiz";

const XP_PER_CHECK = 8;
const XP_COMPLETE_BONUS = 20;

type Phase = "teach" | "check";

export default function Lesson({
  cat,
  words,
  lessonNumber,
  langMode,
  report,
  awardXp,
  onLessonDone,
  onExit,
}: {
  cat: Category;
  words: Word[];
  lessonNumber: number;
  langMode: LangMode;
  report: ReportFn;
  awardXp: (xp: number) => void;
  onLessonDone: () => void;
  onExit: () => void;
}) {
  const [round, setRound] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const batches = useMemo(() => buildLessonBatches(words, 5), [words, round]);
  const langs: Lang[] = langMode === "both" ? ["en", "es"] : [langMode];

  const [batchIdx, setBatchIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("teach");
  const [teachIdx, setTeachIdx] = useState(0);
  const [checkQuestions, setCheckQuestions] = useState<Question[]>([]);
  const [checkIdx, setCheckIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [finished, setFinished] = useState(false);
  const [justDoneCalled, setJustDoneCalled] = useState(false);

  const batch = batches[batchIdx];
  const teachWord = batch?.[teachIdx];
  const checkQ = checkQuestions[checkIdx];

  function startCheck(forBatch: typeof batch) {
    setCheckQuestions(shuffle(forBatch.map((w) => makeQuestion(cat, w, langMode, { dir: "de2x" }))));
    setCheckIdx(0);
    setPicked(null);
    setPhase("check");
  }

  function nextTeachWord() {
    if (teachIdx + 1 >= batch.length) {
      startCheck(batch);
    } else {
      setTeachIdx((i) => i + 1);
    }
  }

  function pickCheckAnswer(opt: string) {
    if (picked !== null || !checkQ) return;
    const correct = opt === checkQ.answer;
    setPicked(opt);
    report(checkQ.catId, checkQ.word.de, checkQ.lang, correct, correct ? XP_PER_CHECK : 0);
    if (correct) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + XP_PER_CHECK);
      playCorrect();
    } else {
      playWrong();
    }
  }

  function nextAfterCheck() {
    if (checkIdx + 1 < checkQuestions.length) {
      setCheckIdx((i) => i + 1);
      setPicked(null);
      return;
    }
    if (batchIdx + 1 >= batches.length) {
      if (!justDoneCalled) {
        setJustDoneCalled(true);
        awardXp(XP_COMPLETE_BONUS);
        setXpEarned((x) => x + XP_COMPLETE_BONUS);
        onLessonDone();
      }
      setFinished(true);
      playWin();
    } else {
      setBatchIdx((b) => b + 1);
      setTeachIdx(0);
      setPhase("teach");
    }
  }

  function restart() {
    setRound((r) => r + 1);
    setBatchIdx(0);
    setPhase("teach");
    setTeachIdx(0);
    setCheckQuestions([]);
    setCheckIdx(0);
    setPicked(null);
    setCorrectCount(0);
    setXpEarned(0);
    setFinished(false);
    setJustDoneCalled(false);
  }

  const totalWords = words.length;
  const wordsDoneBefore = batchIdx * 5;
  const overallProgress =
    (wordsDoneBefore + (phase === "teach" ? teachIdx : batch?.length ?? 0)) / totalWords;

  if (finished) {
    const totalChecks = batches.reduce((n, b) => n + b.length, 0);
    const great = correctCount >= totalChecks * 0.7;
    return (
      <div className="screen">
        <Confetti />
        <TopNav title={`${cat.emoji} Lektion ${lessonNumber}`} onBack={onExit} />
        <div className="card end-card pop">
          <div className="end-emoji">{great ? "🎓" : "🌱"}</div>
          <div className="end-title">Lektion {lessonNumber} geschafft!</div>
          <div className="end-score">
            {totalWords} Wörter · {correctCount}/{totalChecks} beim ersten Mal richtig
          </div>
          <div className="end-xp">+{xpEarned} XP</div>
          <div className="end-actions">
            <button className="btn btn-primary btn-big" onClick={restart}>
              🔄 Nochmal üben
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
      <TopNav title={`${cat.emoji} Lektion ${lessonNumber}`} onBack={onExit} />
      <div className="quiz-progress">
        <ProgressBar value={overallProgress} className="quizbar" />
        <span className="quiz-count">Gruppe {batchIdx + 1}/{batches.length}</span>
      </div>

      {phase === "teach" && teachWord && (
        <>
          <div className="card lesson-teach pop" key={`teach-${batchIdx}-${teachIdx}`}>
            <span className="lesson-step-tag">Wort {teachIdx + 1} von {batch.length}</span>
            <span className="flip-emoji">{teachWord.emoji}</span>
            <span className="flip-word" style={{ color: "var(--ink)" }}>
              {teachWord.de}
            </span>
            {langs.map((l) => (
              <span key={l} className="flip-translation">
                <span className="flip-flag">{LANG_FLAG[l]}</span>
                <span className="flip-word-back">{teachWord[l]}</span>
                <button className="speak-btn" onClick={() => speak(teachWord[l], l)} aria-label="Anhören">
                  🔊
                </button>
              </span>
            ))}
          </div>
          <button className="btn btn-primary btn-big" onClick={nextTeachWord}>
            {teachIdx + 1 >= batch.length ? "Jetzt abfragen 🎯" : "Weiter ➡️"}
          </button>
        </>
      )}

      {phase === "check" && checkQ && (
        <>
          <div className="card quiz-card pop" key={`check-${batchIdx}-${checkIdx}`}>
            <div className="quiz-label">
              <span className="lesson-step-tag">Frage {checkIdx + 1} von {checkQuestions.length}</span>
              <br />
              Wie heißt das auf {checkQ.lang === "en" ? "Englisch" : "Spanisch"}? {LANG_FLAG[checkQ.lang]}
            </div>
            <div className="quiz-prompt-emoji">{checkQ.word.emoji}</div>
            <div className="quiz-prompt">{checkQ.prompt}</div>
          </div>

          <div className="options">
            {checkQ.options.map((opt) => {
              let cls = "btn option-btn";
              if (picked !== null) {
                if (opt === checkQ.answer) cls += " correct";
                else if (opt === picked) cls += " wrong";
                else cls += " faded";
              }
              return (
                <button key={opt} className={cls} onClick={() => pickCheckAnswer(opt)} disabled={picked !== null}>
                  {opt}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <button className="btn btn-primary btn-big pop" onClick={nextAfterCheck}>
              {checkIdx + 1 >= checkQuestions.length && batchIdx + 1 >= batches.length
                ? "Lektion beenden 🎉"
                : "Weiter ➡️"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
