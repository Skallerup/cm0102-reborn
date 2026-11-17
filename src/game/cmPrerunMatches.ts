// Forkørslens kampe (trinnet 'matches' = MATCH_DAY 0x6b3c10/0x6b4360 i 0x5cc850 – cmPrerun.ts): de konkurrencekampe, originalen spiller fra
// databasens dato (1/1-2001) til spilstarten (14/7-2001). Kun den originale database i ægte tilstand (cmActive), startåret 2001.
//
// Målt i oraklet (fit1, frø 1, 3.9.60: Injury::record_match 0x62c080 = én linje pr. kamp; kun turneringer med kampe før dag 194):
//   390  VM-kvalifikation, Oceanien: 20 gruppekampe (dag 93 ×4, 96 ×2, 100 ×4, 103 ×2, 107 ×4, 113 ×2, 114 ×2) + en dobbeltkamp (dag 170 og 174)
//   407  Copa América: alle 18 gruppekampe (dag 184 ×1, 185 ×1, 186–193 ×2); slutspillet efter starten (dag 195–202) – cmIntlFinals.ts
//   330  Intertoto Cup: dag 173 ×20, 177 ×20, 180 ×16, 187 ×16 · 326 Champions League, 1. kvalifikationsrunde: dag 191 ×9  (cmEurope.ts)
//   U21 (401) begynder først dag 201; alle andre turneringer (ligaer, pokaler, de øvrige VM-zoner) har ingen kampe i forkørslen.
// Dagene er oraklets (doy, 0 = 1/1). Holdene i Oceanien er *estimeret* (nationerne vælges efter styrke som i international.ts). Landsholdenes
// fyldspillere er originalens 0x90dc66 (cmVirtual.ts – playNation).
// Kampene spilles med landskampsmotoren (international.ts playNation) med g.date sat til dagen.
// Resultaterne står i g.intl.results (kind 'wcq'/'copa'), g.intl.cont (Copa-tabellerne) og g.intl.ofcq (Oceaniens grupper og finale).
import type { GameState } from './types';
import { cmActive } from './cmPlayerData';
import { dayNum } from './cmFitness';
import { registerPrerun } from './cmPrerun';
import { compHooks } from './hooks';
import { intlState, nationStrength, playNation, type IntlRow } from './international';
import { cmFinalsDay } from './cmIntlFinals';

export const PRERUN_YEAR = 2001;
const OFC_GROUP_DAYS = [93, 93, 93, 93, 96, 96, 100, 100, 100, 100, 103, 103, 107, 107, 107, 107, 113, 113, 114, 114];
const OFC_FINAL_DAYS = [170, 174];
const OFC_NATIONS = ['Australia', 'New Zealand', 'Fiji', 'Solomon Islands', 'Papua New Guinea', 'Vanuatu', 'Tahiti', 'New Caledonia', 'Samoa', 'Tonga', 'Cook Islands', 'American Samoa'];

export const cmPrerunMatchesOn = (g: GameState) => cmActive(g) && !g.draft;

const row = (n: number): IntlRow => ({ n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
function book(t: Record<number, IntlRow>, a: number, b: number, hg: number, ag: number): void {
  const x = t[a], y = t[b];
  x.p++; y.p++; x.gf += hg; x.ga += ag; y.gf += ag; y.ga += hg;
  if (hg > ag) { x.w++; x.pts += 3; y.l++; } else if (hg < ag) { y.w++; y.pts += 3; x.l++; } else { x.d++; y.d++; x.pts++; y.pts++; }
}

// ---------------------------------------------------------------- VM-kvalifikationen i Oceanien (turnering 390)


function ofcDay(g: GameState, doy: number): void {
  const st = intlState();
  if (doy === OFC_GROUP_DAYS[0] && !st.ofcq) {
    const ids = OFC_NATIONS.map((nm) => g.nations.findIndex((n) => n.name === nm)).filter((i) => i >= 0).slice(0, 10);
    if (ids.length < 4) return;
    // Australien og New Zealand i hver sin gruppe; resten slangetrukket efter rækkefølgen (seedet af omdømmet = listens rækkefølge)
    const seeds = ids.slice().sort((a, b) => (nationStrength(b) - nationStrength(a)) || ids.indexOf(a) - ids.indexOf(b));
    const A: number[] = [], B: number[] = [];
    seeds.forEach((n, i) => (([0, 3, 4, 7, 8].includes(i) ? A : B).push(n)));
    const table: Record<number, IntlRow> = {};
    for (const n of ids) table[n] = row(n);
    st.ofcq = { year: PRERUN_YEAR, groups: [A, B], table, final: [] };
  }
  const q = st.ofcq;
  if (!q) return;
  const idx = OFC_GROUP_DAYS.indexOf(doy);
  if (idx >= 0) {
    // dagens kampe: de næste ubrugte grupperunder (to pr. gruppe pr. runde; rækkefølgen A-runde 1, B-runde 1, A-runde 2 …)
    const sched = ofcSchedule(q.groups);
    const first = OFC_GROUP_DAYS.indexOf(doy);
    const n = OFC_GROUP_DAYS.filter((d) => d === doy).length;
    const todays = sched.slice(first, first + n);
    for (const [a, b] of todays) {
      const r = playNation(a, b, 'wcq', 'G');
      book(q.table, a, b, r.hg, r.ag);
    }
    return;
  }
  const fi = OFC_FINAL_DAYS.indexOf(doy);
  if (fi >= 0) {
    if (!q.final.length) {
      const top = q.groups.map((grp) => grp.slice().sort((x, y) => q.table[y].pts - q.table[x].pts || (q.table[y].gf - q.table[y].ga) - (q.table[x].gf - q.table[x].ga) || q.table[y].gf - q.table[x].gf)[0]);
      if (top.length < 2) return;
      q.final.push({ stage: 'F1', a: top[0], b: top[1] }, { stage: 'F2', a: top[1], b: top[0] });
    }
    const tie = q.final[fi];
    const r = playNation(tie.a, tie.b, 'wcq', tie.stage, fi === 1);
    tie.hg = r.hg; tie.ag = r.ag; tie.pens = !!r.pens;
    if (fi === 1) {
      const [t1, t2] = q.final;
      const a = (t1.hg ?? 0) + (t2.ag ?? 0), b = (t1.ag ?? 0) + (t2.hg ?? 0);
      q.winner = a !== b ? (a > b ? t1.a : t1.b) : r.pens ? (r.pens[0] > r.pens[1] ? t2.a : t2.b) : (t2.ag ?? 0) > (t1.ag ?? 0) ? t1.a : t1.b;
      t1.winner = t2.winner = q.winner;
    }
  }
}
/** de 20 gruppekampe i spillerækkefølge: for hver runde (0–4) gruppe A's og B's to kampe (4 pr. runde) */
function ofcSchedule(groups: number[][]): [number, number][] {
  const per = groups.map((grp) => fiveRounds(grp));
  const out: [number, number][] = [];
  for (let r = 0; r < 5; r++) for (const p of per) out.push(...(p[r] ?? []));
  return out;
}
/** alle ti kampe i en gruppe à fem fordelt på fem runder à to kampe (cirkelmetoden med en hvilende) */
function fiveRounds(grp: number[]): [number, number][][] {
  const t = grp.length === 5 ? [...grp, -1] : grp.slice();
  const n = t.length, rounds: [number, number][][] = [];
  const arr = t.slice();
  for (let r = 0; r < n - 1; r++) {
    const rd: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i]; if (a >= 0 && b >= 0) rd.push(r % 2 ? [b, a] : [a, b]); }
    rounds.push(rd);
    arr.splice(1, 0, arr.pop()!);
  }
  return rounds;
}

// ---------------------------------------------------------------- trinnet

/** forkørslens dag: g.date sættes til dagen under kampene (landskampene, 0x62c080 og resultaterne læser den) */
export function cmPrerunMatchDay(g: GameState, day: number, iso: string): void {
  if (!cmPrerunMatchesOn(g) || +iso.slice(0, 4) !== PRERUN_YEAR) return;
  const doy = day - dayNum(`${PRERUN_YEAR}-01-01`);
  const keep = g.date;
  g.date = iso;
  try {
    if (doy >= OFC_GROUP_DAYS[0] && doy <= OFC_FINAL_DAYS[1]) ofcDay(g, doy);
    cmFinalsDay(g, true);                                                  // Copa América 2001 (cmIntlFinals.ts)
    compHooks.euroPrerunDay?.(g, iso);
    // den sidste forkørselsdag: Europas kampe før starten er spillet (cmEuroCatchUp i slutningen af createGame har intet at gøre)
    if (compHooks.euroPrerunDay && day === dayNum(g.cmFitStart ?? keep) - 1) g.cmEuroCatchUp = false;
  } finally {
    g.date = keep;
  }
}
registerPrerun('matches', (g, day, iso, slot) => { if (slot === 0) cmPrerunMatchDay(g, day, iso); });
