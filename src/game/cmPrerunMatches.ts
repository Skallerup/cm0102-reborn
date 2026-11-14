// Forkørslens kampe (trinnet 'matches' = MATCH_DAY 0x6b3c10/0x6b4360 i 0x5cc850 – cmPrerun.ts): de konkurrencekampe, originalen spiller fra
// databasens dato (1/1-2001) til spilstarten (14/7-2001). Kun den originale database i ægte tilstand (cmActive), startåret 2001.
//
// Målt i oraklet (fit1, frø 1, 3.9.60: Injury::record_match 0x62c080 = én linje pr. kamp; kun turneringer med kampe før dag 194):
//   390  VM-kvalifikation, Oceanien: 20 gruppekampe (dag 93 ×4, 96 ×2, 100 ×4, 103 ×2, 107 ×4, 113 ×2, 114 ×2) + en dobbeltkamp (dag 170 og 174)
//   407  Copa América: 18 gruppekampe (dag 184 ×1, 185 ×1, 186–193 ×2); de sidste 6 (dag 195, 196, 198) og slutspillet ligger efter starten
//   330  Intertoto Cup: dag 173 ×20, 177 ×20, 180 ×16, 187 ×16 · 326 Champions League, 1. kvalifikationsrunde: dag 191 ×9  (cmEurope.ts)
//   U21 (401) begynder først dag 201; alle andre turneringer (ligaer, pokaler, de øvrige VM-zoner) har ingen kampe i forkørslen.
// Dagene er oraklets (doy, 0 = 1/1). Holdene i Oceanien/Copa er *estimeret* (nationerne vælges efter styrke som i international.ts, grupperne
// trækkes af spillets frø); landsholdsspillere uden nok rigtige spillere fyldes op med genererede (originalens 0x90dc66-gren er ikke læst).
// Kampene spilles med landskampsmotoren (international.ts playNation → MatchSim, 0x62c080 via cmFitMatch) med g.date sat til dagen.
// Resultaterne står i g.intl.results (kind 'wcq'/'copa'), g.intl.cont (Copa-tabellerne) og g.intl.ofcq (Oceaniens grupper og finale).
import type { GameState, Player } from './types';
import { cmActive } from './cmPlayerData';
import { dayNum } from './cmFitness';
import { registerPrerun } from './cmPrerun';
import { Rng, hash } from './rng';
import { regionOf } from './leagues';
import { randomName, emptyStats } from './data/generate';
import { compHooks } from './hooks';
import {
  intlState, nationSquad, nationStrength, playNation, ranked, setNationFillers,
  type IntlRow, type IntlTournament,
} from './international';

export const PRERUN_YEAR = 2001;
const OFC_GROUP_DAYS = [93, 93, 93, 93, 96, 96, 100, 100, 100, 100, 103, 103, 107, 107, 107, 107, 113, 113, 114, 114];
const OFC_FINAL_DAYS = [170, 174];
const COPA_DAYS = [184, 185, 186, 186, 187, 187, 188, 188, 189, 189, 190, 190, 191, 191, 192, 192, 193, 193];
/** Copa Américas slutspil (efter starten): tredje gruppekamprunde og slutspillet – *estimeret* (oraklet: dag 195–198 og 201–202) */
const COPA_DAYS_AFTER = { g: ['07-03', '07-08', '07-16'], ko: { QF: '07-20', SF: '07-24', F: '07-28' } };
const OFC_NATIONS = ['Australia', 'New Zealand', 'Fiji', 'Solomon Islands', 'Papua New Guinea', 'Vanuatu', 'Tahiti', 'New Caledonia', 'Samoa', 'Tonga', 'Cook Islands', 'American Samoa'];

export const cmPrerunMatchesOn = (g: GameState) => cmActive(g) && !g.draft;

const row = (n: number): IntlRow => ({ n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
function book(t: Record<number, IntlRow>, a: number, b: number, hg: number, ag: number): void {
  const x = t[a], y = t[b];
  x.p++; y.p++; x.gf += hg; x.ga += ag; y.gf += ag; y.ga += hg;
  if (hg > ag) { x.w++; x.pts += 3; y.l++; } else if (hg < ag) { y.w++; y.pts += 3; x.l++; } else { x.d++; y.d++; x.pts++; y.pts++; }
}

// ---------------------------------------------------------------- fyldspillere til små landshold (*estimeret*)

const FILL_ID0 = 30_000_000;
/** positionsgruppen af spillerposten (+0xf GK, D/SW/WB, DM/M/AM, F) */
const kindOf = (p: Player): 'GK' | 'D' | 'M' | 'F' => { const i = p.pos.indexOf(Math.max(...p.pos)); return i === 0 ? 'GK' : i === 6 ? 'F' : i === 1 || i === 2 || i === 7 ? 'D' : 'M'; };
const WANT = { GK: 2, D: 6, M: 7, F: 5 };
/** et landshold uden nok rigtige spillere fyldes op til 20 (2 målmænd, 6 forsvar, 7 midtbane, 5 angreb); CA 60–70 */
function fillersFor(g: GameState, nation: number, have: Player[], cache: Map<number, Player[]>): Player[] {
  const hit = cache.get(nation);
  if (hit) return hit;
  const out: Player[] = [];
  if (have.length < 20) {
    const r = new Rng(hash(g.seed ?? 0, 0x90dc66, nation));
    const tpl = Object.values(g.players).filter((p) => !p.regen && !p.virtual).slice(0, 3000);
    const cnt = { GK: 0, D: 0, M: 0, F: 0 };
    for (const p of have) cnt[kindOf(p)]++;
    const roles: (keyof typeof WANT)[] = [];
    for (const k of ['GK', 'D', 'M', 'F'] as const) for (let i = cnt[k]; i < WANT[k]; i++) roles.push(k);
    const y = +g.date.slice(0, 4);
    roles.forEach((role, k) => {
      let t: Player | undefined;
      for (let i = 0; i < 400 && tpl.length; i++) { const c = tpl[Math.floor(r.next() * tpl.length)]; if (kindOf(c) === role) { t = c; break; } }
      if (!t) return;
      const [first, last] = randomName(g.names, nation, r);
      const ca = 60 + Math.floor(r.next() * 11);
      const { cmFit: _f, cmInt: _i, ...rest } = t;
      void _f; void _i;
      const k2 = t.ca;
      out.push({
        ...rest, id: FILL_ID0 + nation * 64 + k, first, last, nation, club: 0, ca, pa: ca, rep: 0, cmRep: [0, 0, 0], cmRepMem: [0, 0, 0], value: 0,
        dob: `${y - 20 - Math.floor(r.next() * 12)}-0${1 + Math.floor(r.next() * 9)}-1${Math.floor(r.next() * 9)}`,
        attrs: t.attrs.map((a) => Math.max(1, Math.min(20, Math.round(a * (ca / Math.max(60, k2)))))), condition: 1, morale: 10, form: [], injury: null,
        banned: 0, yellowCount: 0, listed: false, loan: null, stats: emptyStats(), history: [], caps: 0, intGoals: 0, number: 0, virtual: 'other',
      } as Player);
    });
  }
  cache.set(nation, out);
  return out;
}

/** kør `f` med fyldspillere til de nævnte landshold */
function withFillers<T>(g: GameState, nations: number[], cache: Map<number, Player[]>, f: () => T): T {
  const m = new Map<number, Player[]>();
  setNationFillers(null);
  for (const n of nations) { const list = fillersFor(g, n, nationSquad(n), cache); if (list.length) m.set(n, list); }
  setNationFillers(m);
  try { return f(); } finally { setNationFillers(null); }
}

// ---------------------------------------------------------------- VM-kvalifikationen i Oceanien (turnering 390)

const pairsOf = (grp: number[]): [number, number][][] => [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]].map((r) => r.map(([i, j]) => [grp[i], grp[j]] as [number, number]));

function ofcDay(g: GameState, doy: number, cache: Map<number, Player[]>): void {
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
      const r = withFillers(g, [a, b], cache, () => playNation(a, b, 'wcq', 'G'));
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
    const r = withFillers(g, [tie.a, tie.b], cache, () => playNation(tie.a, tie.b, 'wcq', tie.stage, fi === 1));
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

// ---------------------------------------------------------------- Copa América 2001 (turnering 407)

function copaStart(g: GameState): IntlTournament | undefined {
  const st = intlState();
  const field0 = ranked((n) => { const r = regionOf(g.nations[n]?.name); return r === 'southAmerica' || r === 'northAmerica'; });
  const sa = field0.filter((n) => regionOf(g.nations[n]?.name) === 'southAmerica');
  const na = field0.filter((n) => regionOf(g.nations[n]?.name) === 'northAmerica');
  const pool = [...sa, ...na];
  const size = pool.length >= 16 ? 16 : pool.length >= 8 ? 8 : pool.length >= 4 ? 4 : 0;
  if (!size) return undefined;
  const field = pool.slice(0, size).sort((a, b) => nationStrength(b) - nationStrength(a));
  const r = new Rng(hash(g.seed ?? 0, 0xc0a, PRERUN_YEAR));
  const pots = [0, 1, 2, 3].map((k) => r.shuffle(field.slice(k * size / 4, (k + 1) * size / 4)));
  const groups = pots[0].map((_, i) => pots.map((pot) => pot[i]));
  const t: IntlTournament = { name: 'copa', year: PRERUN_YEAR, groups, table: {}, ko: [], stage: 'G1', days: COPA_DAYS_AFTER, played: [] };
  for (const n of field) t.table[n] = row(n);
  st.cont = [...(st.cont ?? []).filter((x) => x.name !== 'copa'), t];
  return t;
}

function copaDay(g: GameState, doy: number): void {
  const i0 = COPA_DAYS.indexOf(doy);
  if (i0 < 0) return;
  const st = intlState();
  let t = st.cont?.find((x) => x.name === 'copa' && x.year === PRERUN_YEAR);
  if (!t) t = copaStart(g);
  if (!t) return;
  // gruppekampene i rundernes rækkefølge (runde 1, 2, 3 · gruppe A–D · to kampe pr. gruppe) – de første 18 spilles i forkørslen
  const all: [number, number][] = [];
  for (let r = 0; r < 3; r++) for (const grp of t.groups) for (const p of pairsOf(grp)[r]) all.push(p);
  const n = COPA_DAYS.filter((d) => d === doy).length;
  for (const [a, b] of all.slice(i0, i0 + n)) {
    const res = playNation(a, b, 'copa');
    book(t.table, a, b, res.hg, res.ag);
    t.played!.push(`${a}-${b}`);
  }
  // efter de to første runder venter tredje rundes dag (tournamentDay)
  const rounds = Math.floor(t.played!.length / (t.groups.length * 2));
  t.stage = rounds >= 2 ? 'G3' : rounds >= 1 ? 'G2' : 'G1';
}

// ---------------------------------------------------------------- trinnet

/** forkørslens dag: g.date sættes til dagen under kampene (landskampene, 0x62c080 og resultaterne læser den) */
export function cmPrerunMatchDay(g: GameState, day: number, iso: string): void {
  if (!cmPrerunMatchesOn(g) || +iso.slice(0, 4) !== PRERUN_YEAR) return;
  const doy = day - dayNum(`${PRERUN_YEAR}-01-01`);
  const keep = g.date;
  g.date = iso;
  try {
    const cache = (fillCache.get(g) ?? fillCache.set(g, new Map()).get(g)!);
    if (doy >= OFC_GROUP_DAYS[0] && doy <= OFC_FINAL_DAYS[1]) ofcDay(g, doy, cache);
    copaDay(g, doy);
    compHooks.euroPrerunDay?.(g, iso);
    // den sidste forkørselsdag: Europas kampe før starten er spillet (cmEuroCatchUp i slutningen af createGame har intet at gøre)
    if (compHooks.euroPrerunDay && day === dayNum(g.cmFitStart ?? keep) - 1) g.cmEuroCatchUp = false;
  } finally {
    g.date = keep;
  }
}
const fillCache = new WeakMap<GameState, Map<number, Player[]>>();

registerPrerun('matches', (g, day, iso, slot) => { if (slot === 0) cmPrerunMatchDay(g, day, iso); });
