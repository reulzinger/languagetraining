"use client";

import { useMemo, useState } from "react";
import { Category, Lang, LangMode, LANG_FLAG } from "@/lib/types";
import { Word } from "@/lib/types";
import { shuffle, stripArticle, typeableLang } from "@/lib/game";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playWin } from "@/lib/sound";
import { Confetti, ProgressBar, TopNav } from "./ui";
import { ReportFn } from "./Quiz";

const ROUNDS = 8;
const XP_PER_WORD = 10;

interface TypingTask {
  word: Word;
  lang: Lang;
  answer: string; // ohne Artikel
  tiles: string[];
}

function buildTasks(cat: Category, langMode: LangMode): TypingTask[] {
  const tasks: TypingTask[] = [];
  for (const word of shuffle(cat.words)) {
    const lang = typeableLang(word, langMode);
    if (!lang) continue;
    const answer = stripArticle(word[lang], lang);
    tasks.push({ word, lang, answer, tiles: shuffle(answer.split("")) });
    if (tasks.length === ROUNDS) break;
  }
  return tasks;
}

export default function Typing({
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
  const tasks = useMemo(() => buildTasks(cat, langMode), [cat, langMode, round]);
  const [idx, setIdx] = useState(0);
  const [used, setUsed] = useState<number[]>([]); // Indizes der benutzten Buchstaben-Kacheln
  const [fails, setFails] = useState(0);
  const [phase, setPhase] = useState<"input" | "correct" | "reveal">("input");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const task = tasks[idx];
  const built = task ? used.map((i) => task.tiles[i]).join("") : "";

  function nextTask(afterMs: number) {
    setTimeout(() => {
      if (idx + 1 >= tasks.length) {
        setDone(true);
        playWin();
      } else {
        setIdx(idx + 1);
        setUsed([]);
        setFails(0);
        setPhase("input");
      }
    }, afterMs);
  }

  function tapTile(i: number) {
    if (phase !== "input" || used.includes(i)) return;
    const nextUsed = [...used, i];
    setUsed(nextUsed);
    const attempt = nextUsed.map((j) => task.tiles[j]).join("");
    if (attempt.length < task.answer.length) return;
    if (attempt.toLowerCase() === task.answer.toLowerCase()) {
      setPhase("correct");
      setScore((s) => s + 1);
      report(task.word.catId ?? cat.id, task.word.de, task.lang, true, XP_PER_WORD);
      playCorrect();
      speak(task.word[task.lang], task.lang);
      nextTask(1100);
    } else {
      playWrong();
      if (fails + 1 >= 2) {
        setPhase("reveal");
        report(task.word.catId ?? cat.id, task.word.de, task.lang, false, 0);
        speak(task.word[task.lang], task.lang);
        nextTask(2000);
      } else {
        setFails(fails + 1);
        setTimeout(() => setUsed([]), 500);
      }
    }
  }

  function backspace() {
    if (phase !== "input") return;
    setUsed(used.slice(0, -1));
  }

  function restart() {
    setRound((r) => r + 1);
    setIdx(0);
    setUsed([]);
    setFails(0);
    setPhase("input");
    setScore(0);
    setDone(false);
  }

  if (tasks.length === 0) {
    return (
      <div className="screen">
        <TopNav title="Wort tippen" emoji="⌨️" onBack={onExit} />
        <div className="card end-card pop">
          <div className="end-emoji">🤷</div>
          <div className="end-title">Hier gibt es nichts zu tippen</div>
          <div className="end-score">Die Wörter dieser Kategorie sind zu lang – probier eine andere!</div>
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
    const great = score >= tasks.length * 0.7;
    return (
      <div className="screen">
        {great && <Confetti />}
        <TopNav title="Wort tippen" emoji="⌨️" onBack={onExit} />
        <div className="card end-card pop">
          <div className="end-emoji">{great ? "🏆" : "💪"}</div>
          <div className="end-title">{great ? "Tipp-Profi!" : "Gut gemacht!"}</div>
          <div className="end-score">
            {score} von {tasks.length} Wörtern richtig getippt
          </div>
          <div className="end-xp">+{score * XP_PER_WORD} XP</div>
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
      <TopNav title={`${cat.emoji} Wort tippen`} onBack={onExit} />
      <div className="quiz-progress">
        <ProgressBar value={idx / tasks.length} className="quizbar" />
        <span className="quiz-count">
          {idx + 1}/{tasks.length}
        </span>
      </div>

      <div className="card quiz-card pop" key={idx}>
        <div className="quiz-label">
          Tippe das Wort auf {task.lang === "en" ? "Englisch" : "Spanisch"} {LANG_FLAG[task.lang]}
        </div>
        <div className="quiz-prompt-emoji">{task.word.emoji}</div>
        <div className="quiz-prompt">{task.word.de}</div>

        <div className={`typing-slots ${phase === "correct" ? "ok" : ""} ${phase === "reveal" ? "reveal" : ""}`}>
          {phase === "reveal"
            ? task.answer.split("").map((ch, i) => (
                <span key={i} className="slot filled">
                  {ch}
                </span>
              ))
            : task.answer.split("").map((_, i) => (
                <span key={i} className={`slot ${built[i] ? "filled" : ""}`}>
                  {built[i] ?? ""}
                </span>
              ))}
        </div>
        {phase === "reveal" && <div className="typing-hint">Das war knifflig – merk es dir! 💜</div>}
        {fails > 0 && phase === "input" && <div className="typing-hint">Fast! Probier es nochmal 💪</div>}
      </div>

      <div className="typing-tiles">
        {task.tiles.map((ch, i) => (
          <button
            key={i}
            className={`tile ${used.includes(i) ? "used" : ""}`}
            onClick={() => tapTile(i)}
            disabled={phase !== "input" || used.includes(i)}
          >
            {ch}
          </button>
        ))}
        <button className="tile tile-back" onClick={backspace} disabled={phase !== "input" || used.length === 0}>
          ⌫
        </button>
      </div>
    </div>
  );
}
