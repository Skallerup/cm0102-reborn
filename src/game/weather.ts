// Vejr og bane: fast pr. kamp (afhænger af land og måned), så det kan vises i optakten og ændrer kampen.
import { hash01, Rng } from './rng';
import { randomName } from './data/generate';
import { gs } from './state';
import type { Fixture } from './types';

export type Weather = 'clear' | 'cloudy' | 'rain' | 'heavyRain' | 'wind' | 'snow' | 'hot';

const SOUTH = new Set(['Spain', 'Italy', 'Portugal', 'Greece', 'Türkiye', 'Turkey', 'Cyprus', 'Saudi Arabia', 'Qatar', 'United Arab Emirates', 'Mexico', 'Brazil', 'Argentina', 'Egypt', 'Morocco']);
const COLD = new Set(['Norway', 'Sweden', 'Finland', 'Iceland', 'Russia', 'Ukraine', 'Poland', 'Czech Republic', 'Austria', 'Switzerland', 'Belarus', 'Denmark', 'Scotland', 'Kazakhstan']);

/** Vejret til en kamp (deterministisk: samme kamp giver altid samme vejr) */
export function weatherFor(f: Fixture): Weather {
  const g = gs();
  const nation = g.nations[g.clubs[f.home]?.nation]?.name ?? '';
  const m = Number(f.date.slice(5, 7));
  const winter = m === 12 || m === 1 || m === 2;
  const summer = m >= 6 && m <= 8;
  const u = hash01(g.seed, f.id, 77);
  const south = SOUTH.has(nation), cold = COLD.has(nation);
  // sandsynligheder i rækkefølge – resten er klart vejr
  const table: [Weather, number][] = south
    ? [['hot', summer ? 0.45 : m === 5 || m === 9 ? 0.2 : 0], ['rain', winter ? 0.18 : 0.06], ['heavyRain', winter ? 0.05 : 0.01], ['wind', 0.05], ['cloudy', 0.15]]
    : [['snow', winter ? (cold ? 0.22 : 0.07) : m === 3 || m === 11 ? (cold ? 0.06 : 0.01) : 0], ['heavyRain', winter || m >= 10 ? 0.08 : 0.04], ['rain', winter || m >= 10 ? 0.22 : 0.14],
      ['wind', m >= 10 || m <= 3 ? 0.12 : 0.06], ['hot', summer && !cold ? 0.08 : 0], ['cloudy', 0.25]];
  let acc = 0;
  for (const [w, p] of table) { acc += p; if (u < acc) return w; }
  return 'clear';
}

/** Hvordan vejret påvirker kampen (bruges af motoren) */
export interface WeatherFx {
  /** til afleveringernes basissandsynlighed */
  pass: number;
  /** logit-straf for lange bolde og indlæg */
  air: number;
  /** faktor på trætheden */
  fatigue: number;
  /** faktor på målchancen (glat bold er svær for målmanden) */
  finish: number;
}

export function weatherFx(w: Weather | undefined): WeatherFx {
  switch (w) {
    case 'rain': return { pass: -0.02, air: -0.1, fatigue: 1.03, finish: 1.04 };
    case 'heavyRain': return { pass: -0.045, air: -0.25, fatigue: 1.07, finish: 1.07 };
    case 'wind': return { pass: -0.01, air: -0.4, fatigue: 1.02, finish: 0.97 };
    case 'snow': return { pass: -0.05, air: -0.2, fatigue: 1.09, finish: 1.03 };
    case 'hot': return { pass: 0, air: 0, fatigue: 1.2, finish: 1 };
    default: return { pass: 0, air: 0, fatigue: 1, finish: 1 };
  }
}

export const WEATHER_ICON: Record<Weather, string> = { clear: '☀️', cloudy: '☁️', rain: '🌧️', heavyRain: '⛈️', wind: '💨', snow: '❄️', hot: '🔥' };

/** Banens tilstand (som i CM 01/02): afhænger af vejret, årstiden og landet */
export type Pitch = 'normal' | 'damp' | 'muddy' | 'waterlogged' | 'frozen' | 'snowy' | 'hard';

export function pitchFor(f: Fixture, w: Weather = weatherFor(f)): Pitch {
  const g = gs();
  const nation = g.nations[g.clubs[f.home]?.nation]?.name ?? '';
  const m = Number(f.date.slice(5, 7));
  const winter = m === 12 || m === 1 || m === 2;
  const u = hash01(g.seed, f.id, 91);
  if (w === 'snow') return u < 0.7 ? 'snowy' : 'frozen';
  if (w === 'heavyRain') return u < 0.35 ? 'waterlogged' : 'muddy';
  if (w === 'rain') return winter && u < 0.4 ? 'muddy' : 'damp';
  if (winter && COLD.has(nation) && u < 0.25) return 'frozen';
  if (w === 'hot' || (SOUTH.has(nation) && m >= 6 && m <= 8 && u < 0.5)) return 'hard';
  return 'normal';
}

/** Banens virkning: lægges oven i vejret. drib = logit for driblinger, touch = ekstra risiko ved førsteberøring */
export function pitchFx(p: Pitch | undefined): WeatherFx & { drib: number; touch: number } {
  switch (p) {
    case 'damp': return { pass: 0.01, air: 0, fatigue: 1, finish: 1.03, drib: 0.05, touch: 0 };
    case 'muddy': return { pass: -0.03, air: 0, fatigue: 1.06, finish: 1.02, drib: -0.2, touch: 0.02 };
    case 'waterlogged': return { pass: -0.07, air: 0.05, fatigue: 1.1, finish: 1.05, drib: -0.35, touch: 0.04 };
    case 'frozen': return { pass: -0.03, air: -0.05, fatigue: 1.02, finish: 1.04, drib: -0.15, touch: 0.05 };
    case 'snowy': return { pass: -0.02, air: 0, fatigue: 1.03, finish: 1.02, drib: -0.1, touch: 0.03 };
    case 'hard': return { pass: 0.01, air: -0.08, fatigue: 1.02, finish: 1, drib: 0.05, touch: 0.02 };
    default: return { pass: 0, air: 0, fatigue: 1, finish: 1, drib: 0, touch: 0 };
  }
}

export const PITCH_ICON: Record<Pitch, string> = { normal: '', damp: '💧', muddy: '🟫', waterlogged: '🌊', frozen: '🧊', snowy: '❄️', hard: '🏜️' };

/** Dagens dommer: en fast gruppe dommere pr. land, hver med sin strenghed (deterministisk pr. kamp) */
export function refereeFor(f: Fixture): { name: string; strict: number } {
  const g = gs();
  const nation = g.clubs[f.home]?.nation ?? 0;
  const idx = Math.floor(hash01(g.seed, f.id, 13) * 18);
  const r = new Rng(Math.floor(hash01(g.seed, nation, idx, 29) * 4294967296));
  let first = '', last = `Ref ${idx + 1}`;
  // draft-spil og ældre gemte spil har ikke altid navnepuljer
  try { if (g.names && Object.keys(g.names).length) [first, last] = randomName(g.names, nation, r); } catch { /* standardnavn */ }
  const strict = Math.max(0.7, Math.min(1.35, r.normal(1, 0.14)));
  return { name: `${first} ${last}`.trim(), strict: Math.round(strict * 100) / 100 };
}
