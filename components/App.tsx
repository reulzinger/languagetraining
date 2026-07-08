"use client";

import { useCallback, useEffect, useState } from "react";
import { categoryById } from "@/lib/data";
import {
  Profile,
  addXp,
  loadActiveId,
  loadProfiles,
  newProfile,
  recordWord,
  saveActiveId,
  saveProfiles,
  touchStreak,
} from "@/lib/storage";
import { Lang, LangMode } from "@/lib/types";
import Profiles from "./Profiles";
import Home from "./Home";
import ModeSelect from "./ModeSelect";
import Quiz from "./Quiz";
import Flashcards from "./Flashcards";
import Blitz from "./Blitz";
import { BgDeco } from "./ui";

export type GameMode = "flash" | "quiz" | "blitz";

type Screen =
  | { name: "profiles" }
  | { name: "home" }
  | { name: "mode"; catId: string }
  | { name: "play"; catId: string | null; mode: GameMode };

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  useEffect(() => {
    const ps = loadProfiles();
    setProfiles(ps);
    const id = loadActiveId();
    if (id && ps.some((p) => p.id === id)) setActiveId(id);
    else setScreen({ name: "profiles" });
    // Stimmen der Web Speech API früh anwärmen (laden asynchron)
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
  }, []);

  const active = profiles.find((p) => p.id === activeId) ?? null;

  const persist = useCallback((ps: Profile[]) => {
    setProfiles(ps);
    saveProfiles(ps);
  }, []);

  const updateActive = useCallback(
    (fn: (p: Profile) => void) => {
      setProfiles((prev) => {
        const next = prev.map((p) => {
          if (p.id !== activeId) return p;
          const copy: Profile = { ...p, strength: { ...p.strength } };
          fn(copy);
          return copy;
        });
        saveProfiles(next);
        return next;
      });
    },
    [activeId]
  );

  const report = useCallback(
    (catId: string, de: string, lang: Lang, correct: boolean, xp: number) => {
      updateActive((p) => {
        touchStreak(p);
        recordWord(p, catId, de, lang, correct);
        if (xp > 0) addXp(p, xp);
      });
    },
    [updateActive]
  );

  function createProfile(name: string, avatar: string) {
    const p = newProfile(name, avatar);
    persist([...profiles, p]);
    setActiveId(p.id);
    saveActiveId(p.id);
    setScreen({ name: "home" });
  }

  function selectProfile(id: string) {
    setActiveId(id);
    saveActiveId(id);
    setScreen({ name: "home" });
  }

  function deleteProfile(id: string) {
    persist(profiles.filter((p) => p.id !== id));
    if (id === activeId) {
      setActiveId(null);
      saveActiveId(null);
    }
  }

  function setLang(mode: LangMode) {
    updateActive((p) => {
      p.lang = mode;
    });
  }

  let content: React.ReactNode;

  if (!active || screen.name === "profiles") {
    content = (
      <Profiles
        profiles={profiles}
        onSelect={selectProfile}
        onCreate={createProfile}
        onDelete={deleteProfile}
      />
    );
  } else if (screen.name === "mode") {
    const cat = categoryById(screen.catId);
    content = cat ? (
      <ModeSelect
        cat={cat}
        profile={active}
        onPlay={(mode) => setScreen({ name: "play", catId: cat.id, mode })}
        onBack={() => setScreen({ name: "home" })}
      />
    ) : null;
  } else if (screen.name === "play") {
    const cat = screen.catId ? categoryById(screen.catId) ?? null : null;
    const exit = () =>
      cat ? setScreen({ name: "mode", catId: cat.id }) : setScreen({ name: "home" });
    if (screen.mode === "quiz" && cat) {
      content = <Quiz cat={cat} langMode={active.lang} report={report} onExit={exit} />;
    } else if (screen.mode === "flash" && cat) {
      content = <Flashcards cat={cat} langMode={active.lang} report={report} onExit={exit} />;
    } else {
      content = <Blitz cat={cat} langMode={active.lang} report={report} onExit={exit} />;
    }
  } else {
    content = (
      <Home
        profile={active}
        profiles={profiles}
        onOpenCategory={(id) => setScreen({ name: "mode", catId: id })}
        onBlitz={() => setScreen({ name: "play", catId: null, mode: "blitz" })}
        onProfiles={() => setScreen({ name: "profiles" })}
        onLangChange={setLang}
      />
    );
  }

  return (
    <div className="app">
      <BgDeco />
      {content}
    </div>
  );
}
