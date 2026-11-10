// Lyd under kampen med originalens egne lyde fra CM 01/02 (public/sounds, scripts/build-match-sounds.py):
// hver kommentarlinje spiller lyden fra sin variant i events_eng.cfg, fxloop2 kører som tilskuerbrus hele kampen,
// "GOAL FOR …" (goalmono) ved mål og tilskuersange i de stille perioder. Slås til/fra i indstillingerne.
const KEY = 'cm-match-sound';
export const matchSound = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } };
// slås lyden til, fløjter dommeren én gang som prøve
export const setMatchSound = (on: boolean) => { const was = matchSound(); try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignorér */ } if (!on) { stopCrowd(); stopAll(); } else if (!was) playSample('newref'); };

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
let crowd: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
let crowdWanted = false;
/** den lange lyd, der spiller nu (en ny lang lyd afløser den – korte spark og fløjt lægges ovenpå) */
let current: { src: AudioBufferSourceNode; gain: GainNode; prio: number; until: number } | null = null;

// browsere (især Safari) starter først lyd efter et klik: lås op ved første tryk på siden
if (typeof window !== 'undefined') {
  const unlock = () => { if (matchSound()) { const c = ac(); if (c?.state === 'running') { window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); } } };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

function ac(): AudioContext | null {
  if (!matchSound()) return null;
  try {
    ctx ??= new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    if (!out) { out = ctx.createGain(); out.gain.value = 0.9; out.connect(ctx.destination); }
    return ctx;
  } catch { return null; }
}

function load(name: string): Promise<AudioBuffer | null> {
  const c = ac();
  if (!c) return Promise.resolve(null);
  let p = buffers.get(name);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}sounds/${name}.m4a`).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((b) => c.decodeAudioData(b)).catch(() => null);
    buffers.set(name, p);
  }
  return p;
}

/** Hent de lyde, der bruges hele tiden, i forvejen (kampstart) */
export function preloadMatchSounds() {
  for (const n of ['fxloop2', 'startgam', 'goalmono', 'halfwhis', 'kickoff', 'lowpass', 'shot2mon', 'passurge', 'passnew', 'newurge', 'whist3', 'newref']) void load(n);
}

/** Spil en af originalens lyde. prio: 2 = mål/fløjt/kort (afbryder alt), 1 = almindelig lyd, 0 = kort spark (lægges ovenpå) */
export function playSample(name: string, prio = 1, volume = 1, layer = false) {
  const c = ac();
  if (!c || !out) return;
  void load(name).then((buf) => {
    if (!buf || !out || !matchSound()) return;
    // layer: et eget lag (tilskuersange), der hverken afbryder eller afbrydes af kommentarens lyde
    const short = layer || buf.duration < 1.2;
    const now = c.currentTime;
    // en vigtigere lyd kører stadig: spring almindelige lyde over (ellers bliver det en kakofoni ved høj hastighed)
    if (!short && current && current.until > now && current.prio > prio) return;
    if (!short && current) { const old = current; old.gain.gain.setTargetAtTime(0, now, 0.12); old.src.stop(now + 0.6); current = null; }
    const src = c.createBufferSource(); src.buffer = buf;
    const gain = c.createGain(); gain.gain.value = volume * (short && !layer ? 0.8 : 1);
    src.connect(gain).connect(out);
    src.start();
    if (!short) current = { src, gain, prio, until: now + buf.duration };
  });
}

function stopAll() {
  if (current && ctx) { current.src.stop(); current = null; }
}

/** Tilskuerbrus (originalens fxloop2) i løkke, så længe kampen kører */
export function startCrowd() {
  crowdWanted = true;
  const c = ac();
  if (!c || crowd || !out) return;
  void load('fxloop2').then((buf) => {
    if (!buf || crowd || !crowdWanted || !out) return;
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const gain = c.createGain(); gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.55, c.currentTime + 1.5);
    src.connect(gain).connect(out);
    src.start();
    crowd = { src, gain };
  });
}
export function stopCrowd() {
  crowdWanted = false;
  if (!crowd || !ctx) return;
  const { src, gain } = crowd; crowd = null;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
  src.stop(ctx.currentTime + 0.9);
}

/** Tilskuersange (CM 01/02: "Silent random chant" og klubbernes egne sange) – hjemmeholdets, ellers en tilfældig */
const CLUB_CHANTS: [RegExp, string[]][] = [
  [/newcastle/i, ['newcastl', 'shearer']], [/sunderland/i, ['sund2', 'sund3', 'sunder7']], [/middlesbrough/i, ['middles']],
  [/aston villa/i, ['villa']], [/^manchester united$|^man utd$/i, ['united2']], [/^metz|fc metz/i, ['metzchan', 'metzchn2', 'metzsing']],
];
const GENERIC = ['chant50', 'chant52', 'chant55', 'chant59', 'chant69', 'chant70', 'chant71', 'lordch', 'oohoohch', 'smlchant'];
const LATIN = ['brazch10', 'brazcha8', 'brazcha9', 'brazdrm', 'brzfire2'];
export function chant(homeClub: string, latin = false) {
  const own = CLUB_CHANTS.find(([re]) => re.test(homeClub))?.[1];
  const pool = own && Math.random() < 0.6 ? own : latin ? LATIN : GENERIC;
  playSample(pool[Math.floor(Math.random() * pool.length)], 0, 0.7, true);
}
