# 🦸 Sprachhelden

Spielerischer Wortschatz-Trainer für die Familie: Deutsch → 🇬🇧 Englisch & 🇪🇸 Spanisch.

## Features

- 👨‍👩‍👧‍👦 Familienprofile mit Avatar – Fortschritt wird pro Person im Browser gespeichert (localStorage, kein Login)
- 📚 21 Kategorien mit 743 Wörtern (Deutsch / Englisch / Spanisch + Emoji)
- 6 Spielmodi: 🃏 Karteikarten, ❓ Quiz, 🧠 Memory, ⌨️ Wort tippen, 🎧 Hör-Quiz, ⚡ Blitzrunde (60 s, Combo-Bonus)
- 🔁 Wackelkandidaten: Wörter mit Fehlern kommen automatisch zur Wiederholung
- 🇬🇧/🇪🇸 pro Profil wählbar: Englisch, Spanisch oder gemischt
- ⭐ Sterne pro Kategorie, XP & Level, 🔥 Tages-Streak, 🎖️ 12 Abzeichen, Familien-Bestenliste
- 🔊 Aussprache über die Web Speech API (im Browser eingebaut)
- 🎉 Konfetti, Sounds und kindgerechtes Design

## Entwicklung

```bash
npm install
npm run dev
```

## Deployment

Das Repo ist mit Vercel verknüpft – jeder Push auf `main` deployt automatisch.
Wörter hinzufügen: einfach `lib/data.ts` erweitern und pushen.

Das vollständige Konzept (inkl. Ausbaustufen V2/V3) steht in [KONZEPT.md](./KONZEPT.md).
