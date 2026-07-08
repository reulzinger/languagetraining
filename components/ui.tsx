"use client";

import { useMemo } from "react";

export function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${count} von 3 Sternen`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? "star on" : "star off"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`pbar ${className}`}>
      <div className="pbar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TopNav({ title, emoji, onBack }: { title: string; emoji?: string; onBack: () => void }) {
  return (
    <div className="topnav">
      <button className="back-btn" onClick={onBack} aria-label="Zurück">
        ←
      </button>
      <div className="topnav-title">
        {emoji && <span className="topnav-emoji">{emoji}</span>}
        {title}
      </div>
      <div className="topnav-spacer" />
    </div>
  );
}

const CONFETTI_COLORS = ["#fbbf24", "#f472b6", "#34d399", "#60a5fa", "#a78bfa", "#f87171", "#fde047"];

export function Confetti({ count = 90 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
        round: Math.random() < 0.4,
      })),
    [count]
  );
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.6),
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function BgDeco() {
  return (
    <div className="bg-deco" aria-hidden>
      <span style={{ top: "6%", left: "4%", animationDelay: "0s" }}>🌟</span>
      <span style={{ top: "14%", right: "6%", animationDelay: "1.2s" }}>🎈</span>
      <span style={{ bottom: "18%", left: "7%", animationDelay: "2.1s" }}>🦋</span>
      <span style={{ bottom: "8%", right: "9%", animationDelay: "0.7s" }}>🚀</span>
      <span style={{ top: "48%", left: "-1%", animationDelay: "1.7s" }}>☁️</span>
      <span style={{ top: "60%", right: "-1%", animationDelay: "2.6s" }}>🌈</span>
    </div>
  );
}
