# 🦸 Sprachhelden

Spielerischer Wortschatz-Trainer für die Familie: Deutsch → 🇬🇧 Englisch & 🇪🇸 Spanisch.

## Features (V1)

- 👨‍👩‍👧‍👦 Familienprofile mit Avatar – Fortschritt wird pro Person im Browser gespeichert (localStorage, kein Login)
- 📚 10 Kategorien mit ~350 Wörtern (Deutsch / Englisch / Spanisch + Emoji)
- 🃏 Karteikarten, ❓ Quiz und ⚡ Blitzrunde (60 Sekunden)
- 🇬🇧/🇪🇸 pro Runde wählbar: Englisch, Spanisch oder gemischt
- ⭐ Sterne pro Kategorie, XP & Level, 🔥 Tages-Streak, Familien-Bestenliste
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
