// Baggrundsbilleder i det klassiske tema (Sunday League Pack, 800x600, konverteret fra .RGN til JPEG).
// Ét tilfældigt billede pr. spildag: det samme hele dagen, et nyt når man går videre – aldrig to dage i træk ens.

const NAMES = [
  'boardroom1', 'boardroom2', 'fans1', 'goalpost1', 'goalpost2', 'goalpost3',
  ...Array.from({ length: 20 }, (_, i) => `play${i + 1}`).filter((n) => n !== 'play12'),
  ...Array.from({ length: 7 }, (_, i) => `scramble${i + 1}`),
  'tackle2', 'tackle3', 'tackle4',
  ...Array.from({ length: 5 }, (_, i) => `team${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `training${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `trophy${i + 1}`),
];
export const BACKGROUNDS: readonly string[] = NAMES;

/** Lille, stabil hash (FNV-1a) → deterministisk "tilfældigt" valg uden at gemme noget */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
  return h >>> 0;
}

const N = NAMES.length;
const dayNo = (iso: string) => Math.floor(Date.parse(`${iso}T12:00:00Z`) / 86400000);

/** Seedet blanding af alle billeder for én "runde" på N dage (Fisher–Yates med xorshift) */
function cycle(c: number, seed: string): number[] {
  const a = Array.from({ length: N }, (_, i) => i);
  let x = hash(`${seed}|${c}`) || 1;
  for (let i = N - 1; i > 0; i--) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Indeks for dagens billede. Alle billeder vises én gang, før nogen gentages, og to dage i træk
 * er aldrig ens (heller ikke ved overgangen mellem to runder). Seed (fx klubben) giver hver karriere sin egen rækkefølge.
 */
export function backgroundIndex(iso: string, seed: string | number = ''): number {
  const d = dayNo(iso), c = Math.floor(d / N), k = d - c * N;
  const cur = cycle(c, String(seed));
  // runden starter med forrige rundes sidste billede → byt de to første
  if (cur[0] === cycle(c - 1, String(seed))[N - 1]) [cur[0], cur[1]] = [cur[1], cur[0]];
  return cur[k];
}

/** Valgt baggrundspakke fra fællesskabet (Spilindstillinger → Baggrunde); tom = spillets egne billeder */
const PACK_KEY = 'cm-bgpack';
export interface BgPack { id: number; title: string; images: string[] }
export function bgPack(): BgPack | null {
  try { const v = JSON.parse(localStorage.getItem(PACK_KEY) ?? 'null'); return v?.images?.length ? v : null; } catch { return null; }
}
export function setBgPack(p: BgPack | null) {
  try { if (p) localStorage.setItem(PACK_KEY, JSON.stringify(p)); else localStorage.removeItem(PACK_KEY); } catch { /* privat vindue */ }
}

export function backgroundUrl(iso: string, seed: string | number = ''): string {
  const pack = bgPack();
  if (pack) return pack.images[(dayNo(iso) + String(seed).length) % pack.images.length];
  return `${import.meta.env.BASE_URL}bg/${NAMES[backgroundIndex(iso, seed)]}.jpg`;
}
