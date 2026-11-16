// FIFA-ranglisten som originalen (fifa_rankings.cpp; kun den originale database i ægte tilstand – cmIntlOn).
//
// Porteret:
//  - FIFA_RANKINGS::create_default_table 0x58dd50: hvert land starter med v = nation.dat +0xa8 (koefficienten) / 35 – scoren v og alle seks årstal ftol(v · 1000).
//  - record_match_result 0x58cf70 (efter hver A-landskamp, ikke 'B'/U21/OL – 0x76b7f6): styrkeklasserne 0x58e190 (omdømme +0x8e < 3000 og plads ≥ 50 → 3,
//    < 6000 og plads ≥ 15 → 2, ellers plads < 21 → 1, < 61 → 2, < 101 → 3, ellers 4), forskellen giver tabellen over vægte for hjemme/ude efter resultatet
//    (0x58d0ee), målene (højst 5) giver ×(1 + 0,06 · mål), udeholdet +0,3, når kampen spilles i hjemmeholdets land, turneringens vægt (VM 1,5; EM og verdens-
//    turneringer 1,25; andre slutrunder og kvalifikation 1,1; venskabskampe 1,0) og verdensdelens faktor (continent.dat +0xbe, kun samme verdensdel), grænserne
//    for lande med omdømme < 3500 (højst 3, mindst 2,5 – originalens rækkefølge), point = ftol(· 1000) med kampens måned og år (append_result 0x58dea0).
//  - update_rankings 0x58d460 (den 18. hver måned): resultater ældre end et år fjernes, qsort efter point 0x58e220, årsskiftet i spillets startmåned flytter
//    de seks årstal, recalculate_scores 0x58dfc0 (de 8 bedste; flere end 8: (alle · 8 / antal + de 8 bedste) / 2; det første år med færre end 9 kampe
//    (forrige år + de 8 bedste) / (antal + 8) · 8; scoren = år0 + 5/6 år1 + 4/6 år2 + 3/6 år3 + 2/6 år4 + 1/6 år5, · 0,001) og pladserne (0x58d610).
// Ikke originalt: se filhovedet i cmIntlSquad.ts (koefficientens decimaler, turneringsklassen 0x48dd70).
import type { GameState } from './types';
import { msvcQsort } from './engine/grid/subs';

/** continent.dat +0xbe (Afrika, Asien, Europa, Nord- og Mellemamerika, Oceanien, Sydamerika) */
const CONT_FACTOR = [0.95, 0.9, 1.0, 0.9, 0.85, 1.0];
const f32 = Math.fround;
const ftol = Math.trunc;

export interface CmFifaNation { r: [number, number, number][]; y: number[]; score: number; pos: number; prev: number }
export interface CmFifa { n: Record<number, CmFifaNation>; mon: number; startYear: number; last?: string }

const contOf = (g: GameState, n: number) => g.cmNationCont?.[n] ?? -1;
const repOf = (g: GameState, n: number) => g.cmNationRep?.[n] ?? 0;

function ranks(f: CmFifa): void {
  const list = Object.entries(f.n).map(([k, v]) => ({ k: +k, v }));
  msvcQsort(list, (a, b) => (a.v.score < b.v.score ? 1 : a.v.score > b.v.score ? -1 : 0));
  list.forEach((e, i) => { e.v.prev = e.v.pos; e.v.pos = i + 1; });
}

/** 0x58dd50 */
export function cmFifaInit(g: GameState): CmFifa {
  const st = (g.intl ??= { results: [], history: [] });
  if (st.cmFifa) return st.cmFifa;
  const start = g.cmStart ?? g.date;
  const f: CmFifa = { n: {}, mon: +start.slice(5, 7) - 1, startYear: +start.slice(0, 4) };
  for (let n = 0; n < g.nations.length; n++) {
    const v = (st.info?.[n]?.fifa ?? 0) * 0.028571428571428574;
    const y = ftol(v * 1000);
    f.n[n] = { r: [], y: [y, y, y, y, y, y], score: f32(v), pos: 0, prev: 0 };
  }
  ranks(f);
  st.cmFifa = f;
  return f;
}

/** 0x58e190 */
function tier(g: GameState, f: CmFifa, n: number): number {
  const rep = repOf(g, n), pos = f.n[n]?.pos ?? 999;
  if (rep < 3000 && pos >= 50) return 3;
  if (rep < 6000 && pos >= 15) return 2;
  if (pos < 21) return 1;
  if (pos < 61) return 2;
  return pos >= 101 ? 4 : 3;
}

/** turneringens vægt (0x58d06c–0x58d14f) */
export type FifaComp = 'wc' | 'world' | 'euro' | 'finals' | 'qual' | 'friendly';
const WEIGHT: Record<FifaComp, number> = { wc: 1.5, world: 1.25, euro: 1.25, finals: 1.1, qual: 1.1, friendly: 1.0 };

/** 0x58cf70: hjemme, ude, mål, turneringen, `inHome` = kampen spilles i hjemmeholdets land (stadionets by +0x1f) */
export function cmFifaRecord(g: GameState, home: number, away: number, hg: number, ag: number, comp: FifaComp, inHome: boolean, date: string): void {
  const f = cmFifaInit(g);
  if (contOf(g, home) < 0 || contOf(g, away) < 0) return;
  const C = contOf(g, home) === contOf(g, away) ? CONT_FACTOR[contOf(g, home)] ?? 1 : 1;
  const t1 = tier(g, f, home), t2 = tier(g, f, away);
  const c = t1 - 1 > t2 ? 2 : t2 - 1 > t1 ? -2 : t2 < t1 ? 1 : t2 <= t1 ? 0 : -1;
  let H = 0, A = 0;
  const win = hg > ag, draw = hg === ag;
  // 0x58d0ee: [c + 2] → (hjemme, ude) efter resultatet
  // 0x58d444: [c + 2] → (hjemme H, ude A) efter resultatet (c = hjemmeholdets klasse minus udeholdets, ±2 = mindst to klasser)
  const pick3 = (w: [number, number], d: [number, number], l: [number, number]) => (win ? w : draw ? d : l);
  [H, A] = c === 2 ? pick3([1, 1], [0, 2], [-1, 3])
    : c === 1 ? pick3([1.899999976158142, 0.10000000149011612], [0.8999999761581421, 1.100000023841858], [-0.10000000149011612, 2.0999999046325684])
    : c === 0 ? pick3([2, 0], [1, 1], [0, 2])
    : c === -1 ? pick3([2.0999999046325684, -0.10000000149011612], [1.100000023841858, 0.8999999761581421], [0.10000000149011612, 1.899999976158142])
    : pick3([3, -1], [2, 0], [1, 1]);
  const W = WEIGHT[comp];
  const hgc = Math.min(hg, 5), agc = Math.min(ag, 5);
  let Hp = f32(hgc * 0.2 * H * 0.3 + H);
  let Ap = f32(agc * 0.2 * A * 0.3 + A);
  if (inHome) Ap = f32(Ap + 0.30000001192092896);
  const WC = f32(W * C);
  let Ph = WC * Hp;
  let Pa = f32(WC * Ap);
  if (Ph < 0) Ph = 0;
  if (Pa < 0) Pa = 0;
  const hr = repOf(g, home), ar = repOf(g, away);
  if (hr < 3500 && Ph > 3) Ph = 3;
  if (ar < 3500) {
    if (Pa > 3) Pa = 3;
    if (!(Ph > 2.5)) Ph = 2.5;
  }
  if (hr < 3500) Pa = f32(Pa > 2.5 ? Pa : 2.5);
  const mon = +date.slice(5, 7) - 1, yr = +date.slice(0, 4);
  f.n[home]?.r.push([ftol(Ph * 1000), mon, yr]);
  f.n[away]?.r.push([ftol(Pa * 1000), mon, yr]);
}

/** 0x58d460 – hver dag (gør kun noget den 18.) */
export function cmFifaDaily(g: GameState): void {
  if (g.date.slice(8) !== '18') return;
  const f = cmFifaInit(g);
  if (f.last === g.date) return;
  f.last = g.date;
  const mon = +g.date.slice(5, 7) - 1, yr = +g.date.slice(0, 4);
  for (const v of Object.values(f.n)) {
    // fra enden: ældre end et år byttes med den sidste og fjernes
    for (let i = v.r.length - 1; i >= 0; i--) {
      const e = v.r[i];
      if (e[2] + 1 < yr || (e[2] + 1 === yr && e[1] < mon)) { v.r[i] = v.r[v.r.length - 1]; v.r.length--; }
    }
    msvcQsort(v.r, (a, b) => b[0] - a[0]);
  }
  if (mon === f.mon && yr !== f.startYear) for (const v of Object.values(f.n)) { v.y = [0, v.y[0], v.y[1], v.y[2], v.y[3], v.y[4]]; }
  recalc(g, f);
  ranks(f);
}

/** 0x58dfc0 */
function recalc(g: GameState, f: CmFifa): void {
  const start = g.cmStart ?? g.date;
  const yearAgo = new Date(Date.parse(g.date + 'T00:00:00Z') - 365 * 86400000).toISOString().slice(0, 10);
  const firstYear = start > yearAgo;
  for (const v of Object.values(f.n)) {
    const cnt = v.r.length;
    let best = 0, all = 0;
    for (let i = 0; i < cnt; i++) { if (i < 8) best += v.r[i][0]; all += v.r[i][0]; }
    v.y[0] = cnt > 8 ? Math.trunc((Math.trunc((all * 8) / cnt) + best) / 2) : best;
    if (firstYear && cnt < 9) v.y[0] = cnt ? Math.trunc((v.y[1] + best) / (cnt + 8)) * 8 : v.y[1];
    const t = v.y[0] + Math.trunc((5 * v.y[1]) / 6) + Math.trunc((4 * v.y[2]) / 6) + Math.trunc((3 * v.y[3]) / 6) + Math.trunc((2 * v.y[4]) / 6) + Math.trunc(v.y[5] / 6);
    v.score = f32(t * 0.001);
  }
}

/** ranglisten: alle lande med en plads, højeste score først */
export function cmFifaRanking(g: GameState): { n: number; pts: number; pos: number; prev: number }[] {
  const f = cmFifaInit(g);
  return Object.entries(f.n).map(([k, v]) => ({ n: +k, pts: v.score, pos: v.pos, prev: v.prev })).sort((a, b) => a.pos - b.pos);
}
