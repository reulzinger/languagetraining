"use client";

import { useState } from "react";
import { Profile } from "@/lib/storage";
import { levelInfo } from "@/lib/storage";

const AVATARS = [
  "🦸", "🦸‍♀️", "🧑‍🚀", "🦖", "🦄", "🐼",
  "🦊", "🐸", "👑", "🧜‍♀️", "🤖", "👽",
  "🐙", "🦕", "⚽", "🎸", "🐶", "🐱",
];

export default function Profiles({
  profiles,
  onSelect,
  onCreate,
  onDelete,
}: {
  profiles: Profile[];
  onSelect: (id: string) => void;
  onCreate: (name: string, avatar: string) => void;
  onDelete: (id: string) => void;
}) {
  const [creating, setCreating] = useState(profiles.length === 0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);

  function submit() {
    const n = name.trim();
    if (!n) return;
    onCreate(n, avatar);
    setName("");
    setCreating(false);
  }

  return (
    <div className="screen profiles-screen">
      <div className="hero">
        <div className="hero-emoji">🦸</div>
        <h1 className="hero-title">Sprachhelden</h1>
        <p className="hero-sub">
          Gemeinsam Englisch 🇬🇧 &amp; Spanisch 🇪🇸 lernen – wer spielt heute?
        </p>
      </div>

      {profiles.length > 0 && (
        <div className="profile-list">
          {profiles.map((p) => (
            <div key={p.id} className="profile-card card pop">
              <button className="profile-main" onClick={() => onSelect(p.id)}>
                <span className="profile-avatar">{p.avatar}</span>
                <span className="profile-info">
                  <span className="profile-name">{p.name}</span>
                  <span className="profile-meta">
                    Level {levelInfo(p.xp).level} · {p.xp} XP {p.streak > 0 ? `· 🔥 ${p.streak}` : ""}
                  </span>
                </span>
                <span className="profile-go">▶</span>
              </button>
              <button
                className="profile-delete"
                aria-label={`${p.name} löschen`}
                onClick={() => {
                  if (window.confirm(`Profil „${p.name}" wirklich löschen?`)) onDelete(p.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {creating ? (
        <div className="card create-card pop">
          <h2 className="card-title">Neues Profil</h2>
          <input
            className="input"
            placeholder="Wie heißt du?"
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button
                key={a}
                className={`avatar-pick ${a === avatar ? "selected" : ""}`}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-big" onClick={submit} disabled={!name.trim()}>
            Los geht&apos;s! 🚀
          </button>
        </div>
      ) : (
        <button className="btn btn-ghost btn-big" onClick={() => setCreating(true)}>
          ➕ Neues Profil anlegen
        </button>
      )}
    </div>
  );
}
