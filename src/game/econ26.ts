// Den moderne økonomi (2026/27-databasen og andre ikke-originale databaser), kalibreret mod virkelighedens tal for 2024/25 (docs/ECONOMY_2026.md).
// Slås til ved spilstart (`GameState.m26`) – ældre gemte spil og den originale 01/02-database (g.econ) berøres ikke.
// Alle beløb er i € pr. år (klubbens regnskab); tallene er afrundede medianer af virkelighedens klubber, derfor (skøn).
//   Kilder: Deloitte Football Money League 2026 (jan. 2026), Deloitte Annual Review of Football Finance 2026 (jul. 2026),
//   UEFA European Club Finance and Investment Landscape 2025, DFL Economic Report 24-25, Premier League/UEFA udbetalinger.
import { gs } from './state';
import { rulesFor } from './leagues';
import { wageCurve } from './econ';
import type { GameState, Modern26 } from './types';


/** Pr. liga: medianklubbens samlede omsætning (mio. €), andele af omsætningen for en klub med ligaens median-omdømme og
 *  hvor stejlt indtægterne vokser med omdømmet (kTv/kCom = ln-vækst pr. omdømmepunkt), løn/omsætning (Deloitte/DFL 24/25) */
interface Row { med: number; gate: number; tv: number; prize: number; kTv: number; kCom: number; wage: number }
// Landenes navne som spillets nations (England, Holland …). com (sponsor + merchandise) = resten.
const TOP: Record<string, Row> = {
  England: { med: 310, gate: 0.15, tv: 0.40, prize: 0.11, kTv: 0.02, kCom: 0.065, wage: 0.70 },
  Spain: { med: 100, gate: 0.20, tv: 0.45, prize: 0.10, kTv: 0.05, kCom: 0.10, wage: 0.58 },
  Germany: { med: 190, gate: 0.18, tv: 0.36, prize: 0.08, kTv: 0.035, kCom: 0.07, wage: 0.54 },
  Italy: { med: 108, gate: 0.18, tv: 0.45, prize: 0.10, kTv: 0.045, kCom: 0.10, wage: 0.66 },
  France: { med: 66, gate: 0.20, tv: 0.38, prize: 0.06, kTv: 0.04, kCom: 0.10, wage: 0.77 },
  Holland: { med: 45, gate: 0.27, tv: 0.28, prize: 0.05, kTv: 0.035, kCom: 0.09, wage: 0.60 },
  Portugal: { med: 30, gate: 0.15, tv: 0.33, prize: 0.10, kTv: 0.05, kCom: 0.09, wage: 0.60 },
  Denmark: { med: 22, gate: 0.20, tv: 0.36, prize: 0.08, kTv: 0.04, kCom: 0.09, wage: 0.55 },
};
const M = 1_000_000;
/** stabens løn som andel oven i spillernes (createClubStaff: højst 20 %, i snit ca. 12 %) */
const STAFF = 1.12;

export interface Target {
  /** medianklubbens omsætning, € */
  med: number; repMed: number; tv: number; prize: number; com: number; gate: number;
  kTv: number; kCom: number; wage: number; price: number;
}
const cache = new WeakMap<GameState, Map<string, Target>>();

export function leagueTarget(league: string): Target {
  const g = gs();
  let byLeague = cache.get(g);
  if (!byLeague) cache.set(g, (byLeague = new Map()));
  const key = `${league}|${g.season}`;
  const hit = byLeague.get(key);
  if (hit) return hit;
  const lg = g.leagues[league];
  const clubs = Object.values(g.clubs).filter((c) => c.league === league);
  const n = Math.max(2, clubs.length);
  const rules = rulesFor(league, n);
  const nation = lg ? g.nations[lg.nation]?.name ?? '' : '';
  const row = lg?.tier === 1 ? TOP[nation] : undefined;
  // øvrige ligaer: Premier League-medianen skaleret med ligaens wealth (2,2 = den observerede hældning mellem de otte kalibrerede ligaer)
  const med = (row?.med ?? 310 * Math.pow(rules.wealth / 2, 2.2)) * M;
  const gate = row?.gate ?? 0.17, tv = row?.tv ?? 0.40, prize = row?.prize ?? 0.10;
  const reps = clubs.map((c) => c.rep).sort((a, b) => a - b);
  const repMed = reps.length ? reps[Math.floor(reps.length / 2)] : 50;
  const seats = clubs.map((c) => c.seats).sort((a, b) => a - b);
  const seatsMed = seats.length ? seats[Math.floor(seats.length / 2)] : 10_000;
  const fill = Math.min(1, 0.3 + repMed / 160 + 45 / 800);
  const home = Math.max(1, (n - 1) * rules.rounds / 2);
  const t: Target = {
    med, repMed, tv: med * tv, prize: med * prize, gate: med * gate, com: med * (1 - gate - tv - prize),
    kTv: row?.kTv ?? 0.04, kCom: row?.kCom ?? 0.09, wage: row?.wage ?? (lg?.tier === 1 ? 0.62 : 0.8),
    price: (med * gate) / (Math.max(1000, seatsMed) * fill * home),
  };
  byLeague.set(key, t);
  return t;
}

/** Klubbens faste TV-indtægt pr. år (ligaens centrale rettigheder; vokser med omdømmet) */
export function tvYear(rep: number, league: string): number {
  const t = leagueTarget(league);
  return t.tv * Math.exp(t.kTv * (rep - t.repMed));
}
/** Sponsor- og merchandiseindtægt pr. år (kommercielt; vokser stejlt med omdømmet) */
export function commercialYear(rep: number, league: string): number {
  const t = leagueTarget(league);
  return t.com * Math.exp(t.kCom * (rep - t.repMed));
}
/** Retfærdig billetpris: en median-klub fylder ca. 83 % af stadionet og får ligaens matchday-andel; dyrere for større klubber */
export function fairPrice(rep: number, league: string): number {
  const t = leagueTarget(league);
  return Math.max(1, Math.round(t.price * Math.exp(0.022 * (rep - t.repMed))));
}
/** Ligapræmie (placering 0 = vinder): 1,6 × medianen for vinderen, 0,4 × for sidstepladsen (Premier League: merit + facility fee, £53m til nr. 1) */
export function leaguePrize(league: string, place: number, n: number): number {
  const t = leagueTarget(league);
  return Math.round(t.prize * (0.4 + 1.2 * (n - 1 - place) / Math.max(1, n - 1)));
}

/** Ved spilstart: ligaens kalibrering, så medianklubbens lønsum rammer virkelighedens løn/omsætning × omsætningen */
export function calibrateWages(g: GameState, squadValues: (cid: number) => number[]): Modern26 {
  const kw: Record<string, number> = {};
  const byLeague = new Map<string, number[]>();
  for (const c of Object.values(g.clubs)) {
    const vals = squadValues(c.id);
    if (vals.length < 11) continue;
    const week = vals.reduce((s, v) => s + wageCurve(v), 0);
    if (!byLeague.has(c.league)) byLeague.set(c.league, []);
    byLeague.get(c.league)!.push(week * 52);
  }
  const ks: number[] = [];
  for (const [lg, sums] of byLeague) {
    sums.sort((a, b) => a - b);
    const medSum = sums[Math.floor(sums.length / 2)];
    const t = leagueTarget(lg);
    // spillernes lønsum; stabens løn (≈ 12 %) kommer oven i og gør regnskabets løn/omsætning lig med tabellens
    kw[lg] = (t.wage * t.med) / STAFF / Math.max(1, medSum);
    if (g.leagues[lg]?.tier === 1) ks.push(kw[lg]);
  }
  ks.sort((a, b) => a - b);
  kw['*'] = ks.length ? ks[Math.floor(ks.length / 2)] : 1;
  return { kw };
}

/** Europapræmier pr. kamp (UEFA 2025/26, € – CL: 18,62 mio. deltagelse, 2,1 sejr, 0,7 uafgjort, 11/12,5/15/18,5 mio. i 1/8-/kvart-/semi-/finale
 *  og 6,5 til vinderen; EL/ECL ca. en fjerdedel/en ottendedel – (skøn)). Værdisøjlen (koefficient/omdømme) kommer oven i. */
const EURO: Record<string, { part: number; win: number; draw: number; ko: Record<string, number>; champ: number; value: number }> = {
  CL: { part: 18.62, win: 2.1, draw: 0.7, ko: { PO: 1, R16: 11, QF: 12.5, SF: 15, F: 18.5 }, champ: 6.5, value: 1.2 },
  UEFA: { part: 4.31, win: 0.45, draw: 0.15, ko: { PO: 0.3, R16: 1.2, QF: 1.8, SF: 3.1, F: 4.6 }, champ: 1.0, value: 0.15 },
  UECL: { part: 3.17, win: 0.4, draw: 0.13, ko: { PO: 0.2, R16: 0.6, QF: 1.0, SF: 1.5, F: 2.5 }, champ: 0.5, value: 0 },
};
/** Hvad en klub får for én europæisk kamp (inkl. sin andel af deltagelsen og værdisøjlen i ligafasen) */
export function euroPrize(comp: string, stage: string | undefined, legs: number, rep: number, nLP: number, gf: number, ga: number): number {
  const e = EURO[comp];
  if (!e) return 0;
  if (!stage || stage === 'LP' || stage.startsWith('G')) {
    const base = gf > ga ? e.win : gf === ga ? e.draw : 0;
    return (base + (e.part + e.value * Math.max(0, rep - 60) * (comp === 'CL' ? 1 : 0.5)) / Math.max(1, nLP)) * M;
  }
  const fee = (e.ko[stage] ?? 0) / Math.max(1, legs);
  return (fee + (stage === 'F' && gf > ga ? e.champ : 0)) * M;
}
