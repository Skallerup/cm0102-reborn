// Lyd under kampen (klassisk og moderne): tilskuerbrus, dommerens fløjte, jubel ved mål og et "uhh" ved store chancer.
// Alt syntetiseres med Web Audio (ingen lydfiler – originalens lyde må vi ikke bruge). Slås til/fra i indstillingerne.
const KEY = 'cm-match-sound';
export const matchSound = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } };
// slås lyden til, fløjter dommeren én gang som prøve
export const setMatchSound = (on: boolean) => { const was = matchSound(); try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignorér */ } if (!on) stopCrowd(); else if (!was) whistle(1); };

let ctx: AudioContext | null = null;
let out: AudioNode | null = null;
// browsere (især Safari) starter først lyd efter et klik: lås op ved første tryk på siden
if (typeof window !== 'undefined') {
  const unlock = () => { if (matchSound()) { const c = ac(); if (c?.state === 'running') { window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); } } };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}
let noise: AudioBuffer | null = null;
let crowd: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

function ac(): AudioContext | null {
  if (!matchSound()) return null;
  try {
    ctx ??= new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    if (!out) {
      // fælles udgang med en kompressor, så jubel og brus kan være kraftige uden at skurre
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6;
      const master = ctx.createGain(); master.gain.value = 1.6;
      master.connect(comp).connect(ctx.destination); out = master;
    }
    if (!noise) {
      // lyserød støj (blødere end hvid) – grundlaget for brus og jubel
      noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const d = noise.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11;
      }
    }
    return ctx;
  } catch { return null; }
}

function noiseBurst(c: AudioContext, opts: { dur: number; peak: number; freq: number; q?: number; attack?: number }) {
  const src = c.createBufferSource(); src.buffer = noise; src.loop = true;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = opts.freq; f.Q.value = opts.q ?? 0.7;
  const g = c.createGain(); const now = c.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(opts.peak, now + (opts.attack ?? 0.25));
  g.gain.exponentialRampToValueAtTime(0.0001, now + opts.dur);
  src.connect(f).connect(g).connect(out!);
  src.start(now, Math.random() * 3); src.stop(now + opts.dur + 0.1);
}

/** Tilskuerbrus i baggrunden, så længe kampen kører */
export function startCrowd() {
  const c = ac();
  if (!c || crowd) return;
  const src = c.createBufferSource(); src.buffer = noise; src.loop = true;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
  const gain = c.createGain(); gain.gain.value = 0.0001;
  gain.gain.exponentialRampToValueAtTime(0.22, c.currentTime + 1.5);
  src.connect(f).connect(gain).connect(out!);
  src.start();
  crowd = { src, gain };
}
export function stopCrowd() {
  if (!crowd || !ctx) return;
  const { src, gain } = crowd; crowd = null;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
  src.stop(ctx.currentTime + 0.9);
}

/** Dommerens fløjte: kort (frispark), to korte (pause) eller tre (slutfløjt) */
export function whistle(blasts = 1, long = false) {
  const c = ac();
  if (!c) return;
  for (let i = 0; i < blasts; i++) {
    const t0 = c.currentTime + i * 0.42, dur = long || i === blasts - 1 ? 0.55 : 0.28;
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 2900;
    // fløjtens rullen (ærten i fløjten)
    const lfo = c.createOscillator(); lfo.frequency.value = 32; const lg = c.createGain(); lg.gain.value = 140;
    lfo.connect(lg).connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.02);
    g.gain.setValueAtTime(0.09, t0 + dur - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(out!);
    o.start(t0); lfo.start(t0); o.stop(t0 + dur + 0.05); lfo.stop(t0 + dur + 0.05);
  }
}

/** Mål: et brøl, der bygger op og klinger af over et par sekunder (lavere, når udeholdet scorer) */
export function goalRoar(home = true) {
  const c = ac();
  if (!c) return;
  noiseBurst(c, { dur: 5.5, peak: home ? 1.6 : 0.7, freq: 700, q: 0.5, attack: 0.35 });
  noiseBurst(c, { dur: 4.5, peak: home ? 0.9 : 0.4, freq: 1800, q: 0.8, attack: 0.3 });
}

/** Stor chance (redning, stolpe, forbi): et kort "uhh" fra tribunen */
export function ooh() {
  const c = ac();
  if (!c) return;
  noiseBurst(c, { dur: 1.6, peak: 0.7, freq: 420, q: 1.4, attack: 0.18 });
}
