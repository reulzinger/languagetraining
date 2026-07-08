import { Lang } from "./types";

const LOCALE: Record<Lang, string> = { en: "en-US", es: "es-ES" };

export function speak(text: string, lang: Lang) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = LOCALE[lang];
  utt.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((v) => v.lang.replace("_", "-") === LOCALE[lang]) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  if (voice) utt.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
