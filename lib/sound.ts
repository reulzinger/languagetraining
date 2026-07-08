let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, delay = 0, type: OscillatorType = "sine", volume = 0.12) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t = ac.currentTime + delay;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export function playCorrect() {
  tone(660, 0.12);
  tone(880, 0.2, 0.1);
}

export function playWrong() {
  tone(220, 0.25, 0, "square", 0.06);
}

export function playWin() {
  tone(523, 0.15);
  tone(659, 0.15, 0.15);
  tone(784, 0.15, 0.3);
  tone(1047, 0.4, 0.45);
}

export function playTick() {
  tone(440, 0.06, 0, "triangle", 0.08);
}
