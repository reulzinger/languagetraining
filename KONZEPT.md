# Wortschatz-Trainer für die Familie 🇩🇪 → 🇬🇧 🇪🇸

Konzept für eine spielerische Vokabel-Lernapp (nur Wörter, keine Grammatik) für Eltern und Kinder. Muttersprache Deutsch, Zielsprachen Englisch und Spanisch.

## 1. Grundidee

Jedes Wort wird als **Trio** gespeichert: Deutsch – Englisch – Spanisch (+ Emoji als Bild).
Dadurch lernt die ganze Familie beide Sprachen am **selben Wortschatz** – man kann pro Runde wählen, ob man Englisch, Spanisch oder sogar beide gemischt trainiert.

```
{ de: "der Hund", en: "dog", es: "el perro", emoji: "🐶", level: 1 }
```

## 2. Technik (passend zu GitHub + Vercel)

- **Next.js / React**, komplett statisch – kein Backend, keine Kosten, kein Login
- Wörter als **JSON/TypeScript-Dateien** im Repo → neue Wörter = einfacher Commit, Vercel deployt automatisch
- **Fortschritt in localStorage** pro Familienprofil → keine Anmeldung, kein Datenschutzthema für Kinder
- **Web Speech API** für Aussprache (Englisch + Spanisch, im Browser eingebaut, kostenlos)
- **Emojis statt Bilder** → hunderte "Bilder" ohne Asset-Aufwand, laden sofort
- Optional als **PWA** → auf Tablet/Handy wie eine App installierbar, offline nutzbar

## 3. Familienprofile

- Jeder wählt beim Start ein Profil (Name + Avatar-Emoji), z. B. 👨 Papa, 👧 Emma, 🦖 Ben
- Eigener Fortschritt, eigene Sterne, eigener Streak pro Profil
- **Familien-Bestenliste** auf der Startseite (Wochenpunkte) → gesunder Wettkampf

## 4. Kategorien (Ziel: 800–1000+ Wörter)

Jede Kategorie mit Emoji-Icon, 30–50 Wörter, in 2–3 Schwierigkeitsstufen:

| | | |
|---|---|---|
| 🐶 Tiere | 🍎 Essen & Trinken | 👨‍👩‍👧 Familie & Menschen |
| 🎨 Farben & Formen | 🔢 Zahlen | 👕 Kleidung |
| 🏠 Haus & Möbel | 🧸 Spielzeug & Spiele | 🏫 Schule |
| 💪 Körper | 😀 Gefühle | 🌳 Natur & Wetter |
| 🚗 Fahrzeuge & Verkehr | 🏙️ Stadt & Orte | ⚽ Sport & Hobbys |
| 👩‍🚒 Berufe | 🕐 Zeit & Kalender | ✈️ Urlaub & Reisen |
| 🏃 Alltagsverben | ✨ Wichtige Adjektive | 🗣️ Erste Sätze/Floskeln |

Stufen: **Level 1** (Grundwortschatz, für Kinder) · **Level 2** (Aufbau) · **Level 3** (kniffliger, für die Großen).

## 5. Spielmodi

1. **Karteikarten** – Karte antippen zum Umdrehen, mit Aussprache-Button 🔊, "wusste ich / wusste ich nicht"
2. **Quiz (Multiple Choice)** – 4 Antworten, in beide Richtungen (DE→EN/ES und EN/ES→DE)
3. **Memory / Paare finden** – deutsches Wort + Übersetzung (oder Emoji + Fremdwort) zusammenbringen
4. **Wort tippen** – Übersetzung eingeben, mit Buchstaben-Hilfe für Kinder (Buchstabensalat zum Antippen)
5. **Blitzrunde** ⚡ – 60 Sekunden, so viele Wörter wie möglich, perfekt für den Familien-Wettkampf
6. **Hör-Quiz** 🔊 – Wort wird vorgesprochen (Web Speech API), richtige Bedeutung wählen
7. **Duell-Modus** 🥊 – zwei Spieler abwechselnd am selben Gerät, wer hat nach 10 Fragen mehr Punkte?

## 6. Motivation & Lernsystem

- **Punkte & Level** pro Profil, XP für jede richtige Antwort
- **Sterne pro Kategorie** (1–3 ⭐ je nach Beherrschung) → "Alles auf 3 Sterne bringen" als Langzeitziel
- **Streak** 🔥 – an wie vielen Tagen hintereinander geübt
- **Abzeichen** – z. B. "100 Wörter gelernt", "Tier-Profi", "7-Tage-Streak"
- **Leitner-System light** (Spaced Repetition): falsche Wörter kommen häufiger wieder, gekonnte seltener → automatische "Wackelkandidaten"-Wiederholrunde
- **Wort des Tages** auf der Startseite in beiden Sprachen

## 7. Kindgerechtes Design

- Große bunte Buttons, viel Emoji, wenig Text
- Konfetti/Feier-Animation bei richtigen Antworten und Levelaufstieg
- Fehler werden freundlich behandelt (Lösung anzeigen, gleich nochmal probieren)
- Keine Werbung, keine Accounts, keine externen Dienste

## 8. Ausbaustufen

- **V1:** Profile, ~10 Kategorien (~400 Wörter), Karteikarten + Quiz + Blitzrunde, Punkte/Sterne/Streak, Aussprache
- **V2:** restliche Kategorien (800–1000+ Wörter), Memory, Wort tippen, Hör-Quiz, Abzeichen, Leitner-Wiederholung
- **V3:** Duell-Modus, PWA/offline, Statistik-Seite, evtl. eigene Wortlisten hinzufügen
