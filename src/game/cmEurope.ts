// Europas turneringer i originalens 2001/02-format (kalender runde 10C, 13/11-2026) – kun den originale database i ægte tilstand (cmCalendarOn).
//
//   Rundetabellerne er originalens (data/cmEuroTables.ts, kørt i unicorn med året som eneste inddata – ~/cm0102-engine/tools/sched/gen_euro.py):
//     Champions League EuropeanCup::create_round_table 0x583c50: stage −1 = de tre kvalifikationsrunder (id 250/260/270), 0–7 = 1. gruppespil
//     (skema à 0x41 bytes, 6 spilledage, stage-id 0x43d + gruppe = fixture +0x32 1085–1092; gruppe 0–3 tirsdag først, 4–7 onsdag), 8–11 =
//     2. gruppespil (1093–1096), 12 = knockout (kvartfinale 120, semifinale 130, finale 150 på neutral bane).
//     UEFA Cup UefaCup::create_round_table 0x9025c0 (+0xb2 = 0): kvalifikationsrunde 220 (82 hold), 1.–4. runde (10/20/30/40), kvartfinale,
//     semifinale og finale (én kamp, neutral bane). Super Cup EurSuperCup::create_round_table 0x57a3c0 (én kamp, neutral bane).
//   Rundeposten (0x68 bytes, cup-round-record): +0/+3 lodtrækning/kampdato, +6 tidspunkt, +7 runde-id (→ fixture +0x30, +3/+4 for 1./2. ben),
//     +9 indeks (→ +0x34), +0xb lodtrækningsregler (→ +0x36; bit 4: lande holdes adskilt), +0xd kampflag (→ +0x38; 0x400 seedet lodtrækning,
//     0x200 fast parring), +0xf flag for den afgørende kamp (OR'es ind i andet ben), +0x13 spillested (4/0x8000 neutral → +0x3c = 1), +0x17
//     kamptype (→ +0x3a: 8, UEFA Cup 7 før 3. runde), +0x18/+0x1a/+0x1c/+0x1e hold/kampe/nye hold/første nye, +0x21 ben, +0x22 dage til andet ben.
//     Kontrolleret mod oraklets fixtures_2001/2002.tmp (crowd1): alle datoer og koderne +0x30/+0x32/+0x34/+0x36/+0x38/+0x3a/+0x3c for alle runder.
//   Lodtrækningen Cup::draw_round 0x51c410 (læst): på lodtrækningsdatoen; er et hold ukendt (forrige runde ikke afgjort), udskydes den dag for dag
//     (og de senere runders datoer med), ellers 0x400 → sort_round_teams 0x51d2d0 (seedet), +0xb & 4 → 0x51d9f0 (lande adskilt), ellers uden
//     0x200 → 0x51e220 (tilfældig); så hjemmeholdene 0x51e870. Gruppespillene: draw_phase1_groups 0x585290 (4 seedningslag, lande adskilt),
//     draw_phase2_groups 0x585ab0 (vindere og toere, ikke samme gruppe/land), draw_quarter_finals 0x586330 (vinder mod toer fra en anden gruppe).
//     CL's Q3-tabere går til UEFA Cup'ens 1. runde (0x585920), 1. gruppespils treere til 3. runde (0x586286).
//   Pladserne pr. land efter koefficientrang (UefaSeeding 0x903cc0/0x904210/0x904580 – tabellerne efter Bosman-projektets læsning, sweep-europe §3.2),
//     koefficienterne fra nation.dat +0xe0..+0x108 (roll_coefficients 0x903b50, læst: summen af de fem første; i 2001 ingen forskydning), euro.cfg
//     i første sæson (apply_euro_cfg_order 0x9059e0), point 2/1 pr. sejr/uafgjort + 1 pr. gruppespil (0x9058b0).
//
//   Intertoto (runde 10D): IntertotoCup::create_round_table 0x633300 (5 runder, juni–august: 40/12/8 nye hold), assign_intertoto_places 0x904e30
//     (læst: kode +0x1df = 1 for rang 0–7, 2 for 8–11, ellers 3, landets anden klub +1; pladserne +0xe efter Bosman-projektets læsning af 0x903cc0),
//     sorteret efter koden faldende (cup_compare_entries_by_level_desc 0x522190), finalens 3 vindere til UEFA Cup'ens 1. runde (0x633d40).
//     Fra 2. sæson ligger 1.–2. runde før sæsonskiftet 1/7 – de spilles som forkørslen ved sæsonskiftet (*afvigelse*).
// IKKE porteret (se ENGINE_PORT_PLAN.md "Kalender og turneringer"): sort_round_teams/0x51d9f0/0x51e220/0x51e870 og gruppelodtrækningerne er porteret efter deres regler, ikke instruktion for instruktion
// (seedningen bruger klubbens omdømme i stedet for postens seed-byte, og originalens tilfældige tal er spillets), kamppræmierne er spillets egne
// (sim.ts), gruppekampenes parring er spillets cirkelmetode (League_Stage::create_fixtures / 0x68a030 ikke porteret), klubber fra lande uden
// klubber i world-filen erstattes af de næstbedste klubber (originalen har alle lande), collect_european_clubs' sortering bruger sidste sæsons
// tabel/omdømmet (databasens sidste placering findes ikke i world-filen).
import type { Competition, Fixture, GameState, Tie } from './types';
import { addDays } from './dates';
import { rng } from './rng';
import { addNews, gs } from './state';
import { asOwner } from './humans';
import { cmCalendarOn, cmPlaceFixture } from './cmCalendar';
import { CM_EURO_DATES, CM_EURO_ROUNDS } from './data/cmEuroTables';
import { CM_EURO_CFG, CM_NATION_COEF } from './data/cmEuroData';
import { emptyRow, newFixture, sortTable } from './competitions';

export const cmEuroOn = (g: GameState): boolean => cmCalendarOn(g);

interface Rnd { slot: number; id: number; idx: number; b0b: number; f0d: number; f0f: number; venue: number; b17: number; teams: number; ties: number; nw: number; first: number; legs: number; gap: number }
const rnd = (key: string, i: number): Rnd => {
  const r = CM_EURO_ROUNDS[key][i];
  // slot, id, idx, b0b, f0d, f0f, f11, venue, b17, teams, ties, new, first, replays, legs, gap, pay, prizeW, prizeL
  return { slot: r[0], id: r[1], idx: r[2], b0b: r[3], f0d: r[4], f0f: r[5], venue: r[7], b17: r[8], teams: r[9], ties: r[10], nw: r[11], first: r[12], legs: r[14], gap: r[15] };
};
/** tabellerne dækker 2001–2040; senere år: samme kalender 28 år før */
const tblYear = (y: number) => { while (y > 2040) y -= 28; return Math.max(2001, y); };
/** datoerne efter 2040: samme ugedage som 28 år før (kalenderen gentager sig hvert 28. år inden for 1901–2099) */
const dates = (year: number, key: string): number[][] => CM_EURO_DATES[tblYear(year)][key];
const iso = (year: number, doy: number) => addDays(`${year}-01-01`, doy);

/** trinene: [nøgle, rundetabel, indeks] – 'G1'/'G2' = gruppespillene */
const STEPS: Record<string, [string, string, number][]> = {
  CL: [['Q1', 'CLQ', 0], ['Q2', 'CLQ', 1], ['Q3', 'CLQ', 2], ['G1', 'CLG1', 0], ['G2', 'CLG2', 0], ['QF', 'CLKO', 0], ['SF', 'CLKO', 1], ['F', 'CLKO', 2]],
  UEFA: [['Q', 'UEFA', 0], ['R1', 'UEFA', 1], ['R2', 'UEFA', 2], ['R3', 'UEFA', 3], ['R4', 'UEFA', 4], ['QF', 'UEFA', 5], ['SF', 'UEFA', 6], ['F', 'UEFA', 7]],
  ESC: [['F', 'ESC', 0]],
  UIC: [['R1', 'UIC', 0], ['R2', 'UIC', 1], ['R3', 'UIC', 2], ['SF', 'UIC', 3], ['F', 'UIC', 4]],
};

interface EuroMeta { cmEuro: string; year: number; step: number; entry: Record<string, number[]>; drawn: Record<string, string>; [k: string]: unknown }
const metaOf = (c: Competition) => c.meta as unknown as EuroMeta;

// ---------------------------------------------------------------- pladserne (UefaSeeding)

/** CL-pladser pr. rang (gruppespil, Q3, Q2, Q1) og UEFA Cup (1. runde, kvalifikation) – 0x904210/0x904580 */
function clBand(r: number): number[] {
  return r <= 2 ? [2, 2, 0, 0] : r <= 5 ? [2, 1, 0, 0] : r <= 8 ? [1, 1, 0, 0] : r === 9 ? [1, 0, 1, 0] : r <= 14 ? [0, 1, 1, 0] : r === 15 ? [0, 1, 0, 0] : r <= 28 ? [0, 0, 1, 0] : [0, 0, 0, 1];
}
function uefaBand(r: number): number[] {
  return r <= 5 ? [3, 0] : r <= 7 ? [4, 0] : r <= 14 ? [1, 1] : r <= 16 ? [1, 2] : r <= 20 ? [0, 3] : r <= 47 ? [0, 2] : [0, 1];
}
const FAIR_PLAY_2001 = ['Finland', 'Slovakia', 'Belarus'];

/** spillets lagrede seedingtilstand: koefficienterne pr. land (seks sæsoner) og sæsonens point/deltagere */
export interface CmUefaState { year: number; coef: Record<string, number[]>; pts: Record<string, number>; entered: Record<string, number>; holders?: { cl?: number; uefa?: number } }

function uefaState(g: GameState, season: number): CmUefaState {
  let s = g.cmUefa;
  if (!s) s = g.cmUefa = { year: season, coef: JSON.parse(JSON.stringify(CM_NATION_COEF)), pts: {}, entered: {} };
  if (s.year !== season) {
    // roll_coefficients 0x903b50: +0xe0..+0x100 ← +0xe8..+0x108, +0x108 ← sæsonens point / deltagere
    for (const [n, v] of Object.entries(s.coef)) {
      const e = s.entered[n] ?? 0;
      s.coef[n] = [...v.slice(1), e ? (s.pts[n] ?? 0) / e : 0];
    }
    for (const n of Object.keys(s.pts)) if (!s.coef[n]) s.coef[n] = [0, 0, 0, 0, 0, s.entered[n] ? s.pts[n] / s.entered[n] : 0];
    s.pts = {}; s.entered = {}; s.year = season;
  }
  return s;
}
const total = (v: number[]) => Math.fround(v[0] + v[1] + v[2] + v[3] + v[4]);

/** add_nation_points 0x9058b0 */
export function cmEuroAddPoints(g: GameState, club: number, points: number): void {
  const n = g.nations[g.clubs[club]?.nation ?? -1]?.name;
  if (!n || !g.cmUefa) return;
  g.cmUefa.pts[n] = (g.cmUefa.pts[n] ?? 0) + points;
}

/** brugbare klubber: en trup med målmand og mindst 11 spillere (skjulte klubber har højst 16) */
function playable(g: GameState, counts: Map<number, [number, number]>, cid: number): boolean {
  const c = counts.get(cid);
  return !!c && c[0] >= 11 && c[1] >= 1 && !!g.clubs[cid];
}

/** Klubberne pr. land i seedingens rækkefølge (collect_european_clubs 0x904040: division, placering, omdømme; første sæson euro.cfg først) */
function nationOrder(g: GameState, nationName: string, prevTables: Record<string, number[]>, first: boolean, ok: (c: number) => boolean): number[] {
  const nation = g.nations.findIndex((x) => x.name === nationName);
  if (nation < 0) return [];
  const clubs = Object.values(g.clubs).filter((c) => c.nation === nation && g.leagues[c.league] && ok(c.id));
  const tier = (c: (typeof clubs)[number]) => (g.leagues[c.league].hidden ? 9 : g.leagues[c.league].tier);
  const pos = (c: (typeof clubs)[number]) => { const t = prevTables[c.league]; const i = t ? t.indexOf(c.id) : -1; return i < 0 ? 999 : i; };
  clubs.sort((a, b) => tier(a) - tier(b) || pos(a) - pos(b) || b.rep - a.rep);
  let ids = clubs.map((c) => c.id);
  if (first) {
    const cfg = CM_EURO_CFG[nationName] ?? [];
    const listed = cfg.map((nm) => clubs.find((c) => c.name === nm)?.id).filter((x): x is number => x !== undefined);
    ids = [...listed, ...ids.filter((x) => !listed.includes(x))];
  }
  return ids;
}

interface Entrants { cl: number[][]; uefa: number[][]; uic: number[][] }

function seedEuro(g: GameState, season: number, prevTables: Record<string, number[]>, cupWinners: Record<number, number>): Entrants {
  const s = uefaState(g, season);
  const first = !g.seasonHistory?.length;
  const counts = new Map<number, [number, number]>();
  for (const p of Object.values(g.players)) {
    if (!p.club) continue;
    const c = counts.get(p.club) ?? [0, 0];
    c[0]++; if ((p.pos?.[0] ?? 0) >= 15) c[1]++;
    counts.set(p.club, c);
  }
  const ok = (cid: number) => playable(g, counts, cid);
  const ranked = Object.entries(s.coef).sort((a, b) => total(b[1]) - total(a[1])).map(([n]) => n);
  const placed = new Set<number>();
  const cl: number[][] = [[], [], [], []];
  const CL_CAP = [16, 18, 19, 18];
  const orders = new Map<string, number[]>();
  const order = (n: string) => { let o = orders.get(n); if (!o) { o = nationOrder(g, n, prevTables, first, ok); orders.set(n, o); } return o; };
  const next = (n: string) => order(n).find((c) => !placed.has(c));
  const enter = (n: string) => { s.entered[n] = (s.entered[n] ?? 0) + 1; };
  // CL: titelforsvareren i gruppespillet (lofterne 15 + 1)
  const holderCl = s.holders?.cl;
  if (holderCl !== undefined && ok(holderCl)) { cl[0].push(holderCl); placed.add(holderCl); enter(g.nations[g.clubs[holderCl].nation].name); }
  ranked.forEach((n, r) => {
    clBand(r).forEach((k, round) => {
      for (let i = 0; i < k; i++) {
        let rr = round;
        while (rr < 4 && cl[rr].length >= CL_CAP[rr]) rr++;
        if (rr >= 4) return;
        const c = next(n);
        if (c === undefined) return;
        cl[rr].push(c); placed.add(c); enter(n);
      }
    });
  });
  // UEFA Cup: [1. runde (36 seedede + 3 Intertoto-pladser), kvalifikation (82)]
  const uefa: number[][] = [[], []];
  const holderU = s.holders?.uefa;
  if (holderU !== undefined && ok(holderU) && !placed.has(holderU)) { uefa[0].push(holderU); placed.add(holderU); enter(g.nations[g.clubs[holderU].nation].name); }
  ranked.forEach((n, r) => {
    const band = uefaBand(r).slice();
    if (season === 2001 ? FAIR_PLAY_2001.includes(n) : false) band[1]++;
    if (holderU !== undefined && g.nations[g.clubs[holderU]?.nation ?? -1]?.name === n && band[0] > 0) band[0]--;
    const nation = g.nations.findIndex((x) => x.name === n);
    let firstPlace = true;
    band.forEach((k, round) => {
      for (let i = 0; i < k; i++) {
        let c: number | undefined;
        // første plads: pokalvinderen (er han placeret, går pladsen videre efter tabellen)
        if (firstPlace) { firstPlace = false; const w = cupWinners[nation]; if (w !== undefined && !placed.has(w) && ok(w)) c = w; }
        c ??= next(n);
        if (c === undefined) return;
        uefa[round].push(c); placed.add(c); enter(n);
      }
    });
  });
  // pladser fra lande uden klubber i world-filen: de næste klubber efter rang (originalen: build_entrants fylder op til 118 – *afvigelse*)
  const spare = () => { for (const n of ranked) { const c = next(n); if (c !== undefined) return c; } return undefined; };
  const fill = (arr: number[], n: number, nat?: boolean) => { while (arr.length < n) { const c = spare(); if (c === undefined) break; arr.push(c); placed.add(c); if (nat) enter(g.nations[g.clubs[c].nation].name); } arr.length = Math.min(arr.length, n); };
  cl.forEach((a, i) => fill(a, CL_CAP[i], true));
  fill(uefa[1], rnd('UEFA', 0).nw, true);
  // Intertoto (0x904e30): pladserne +0xe – de 16 første lande uden faste tal 2, de næste 27 1; faste: Liechtenstein, San Marino, Moldova, Andorra,
  // Bosnien 0, Skotland 1, England 1 efter 2001 (0 i 2001: ingen engelsk klub, 0x9038af); 2001: Frankrig 4, Tyskland 3, Portugal/Norge/Spanien/
  // Rusland 0, Italien 1
  const FIX: Record<string, number> = { Liechtenstein: 0, 'San Marino': 0, Moldova: 0, Andorra: 0, 'Bosnia-Herzegovina': 0, Bosnia: 0, Scotland: 1, England: season === 2001 ? 0 : 1,
    ...(season === 2001 ? { France: 4, Germany: 3, Portugal: 0, Norway: 0, Spain: 0, Russia: 0, Italy: 1 } : {}) };
  const uicE: [number, number][] = [];
  let free = 0;
  ranked.forEach((n, r) => {
    const places = n in FIX ? FIX[n] : free++ < 16 ? 2 : free <= 43 ? 1 : 0;
    const base = r < 8 ? 1 : r < 12 ? 2 : 3;
    for (let k = 0; k < places && uicE.length < 60; k++) { const c = next(n); if (c === undefined) break; uicE.push([c, base + k]); placed.add(c); enter(n); }
  });
  while (uicE.length < 60) { const c = spare(); if (c === undefined) break; uicE.push([c, 3]); placed.add(c); }
  // 0x522190: koden faldende, så omdømmet stigende
  uicE.sort((a, b) => b[1] - a[1] || (g.clubs[a[0]].rep - g.clubs[b[0]].rep));
  const u = rnd('UIC', 0).nw, u2 = rnd('UIC', 1).nw;
  const uic = [uicE.slice(0, u).map((x) => x[0]), uicE.slice(u, u + u2).map((x) => x[0]), uicE.slice(u + u2).map((x) => x[0])];
  fill(uefa[0], rnd('UEFA', 1).nw - 16 - (uic[0].length ? 3 : 0), true);
  return { cl, uefa, uic };
}

// ---------------------------------------------------------------- opsætningen

/** setupSeasonComps (newgame.ts) i ægte tilstand med den originale database: CL, UEFA Cup og Super Cup i originalens format */
export function cmSetupEurope(season: number, prevTables: Record<string, number[]>, cupWinners: Record<number, number>): void {
  const g = gs();
  const s = uefaState(g, season);
  // forrige sæsons vindere (Super Cup og titelforsvarerne); første sæson: databasens 2000/01-vindere
  const byName = (nm: string) => Object.values(g.clubs).find((c) => c.name === nm)?.id;
  const clW = g.comps.CL?.meta?.cmEuro ? g.comps.CL.winner : season === 2001 ? byName('FC Bayern München') : undefined;
  const uW = g.comps.UEFA?.meta?.cmEuro ? g.comps.UEFA.winner : season === 2001 ? byName('Liverpool') : undefined;
  s.holders = { cl: clW, uefa: uW };
  for (const id of ['CL', 'UEFA', 'UECL', 'ESC', 'UIC']) delete g.comps[id];
  const ent = seedEuro(g, season, prevTables, cupWinners);
  const mk = (id: string, name: string, clubs: number[], entry: Record<string, number[]>) => {
    const comp: Competition = { id, name, type: 'continental', nation: -1, tier: 0, clubs, table: [], ties: [], stage: '', finished: false, pending: 0,
      meta: { cmEuro: id, year: season, step: 0, entry, drawn: {}, roundsTotal: STEPS[id].length } };
    g.comps[id] = comp;
    return comp;
  };
  const [grp, q3, q2, q1] = ent.cl;
  mk('CL', 'Champions League', [...grp, ...q3, ...q2, ...q1], { Q1: q1, Q2: q2, Q3: q3, G1: grp });
  mk('UEFA', 'UEFA Cup', [...ent.uefa[0], ...ent.uefa[1]], { Q: ent.uefa[1], R1: ent.uefa[0] });
  if (ent.uic[0].length) mk('UIC', 'Inter-Toto Cup', ent.uic.flat(), { R1: ent.uic[0], R2: ent.uic[1], R3: ent.uic[2] });
  if (clW !== undefined && uW !== undefined && clW !== uW) mk('ESC', 'European Super Cup', [clW, uW], { F: [clW, uW] });
  for (const [ids, name] of [[ent.cl.flat(), 'Champions League'], [ent.uefa.flat(), 'UEFA Cup']] as const) {
    for (const c of ids) asOwner(c, () => addNews({ cat: 'match', key: 'comp.qualified', params: { club: g.clubs[c]?.name ?? '', comp: name }, link: { kind: 'club', id: c } }));
  }
  g.cmEuroCatchUp = true;
}

// ---------------------------------------------------------------- dagen (Cup::update_for_date 0x51f890)

const drawDate = (m: EuroMeta, idx: number, table: string) => (table === 'CLG1' || table === 'CLG2' ? null : iso(m.year, dates(m.year, table)[idx][0]));

function stageTies(c: Competition, stage: string): Tie[] { return c.ties.filter((t) => t.stage === stage); }
const decided = (c: Competition, stage: string) => { const t = stageTies(c, stage); return t.length > 0 && t.every((x) => x.winner !== undefined); };
/** gruppespil 1 eller 2 er trukket og alle dets kampe spillet */
const groupsDone = (c: Competition, phase: '1' | '2') => {
  const keys = Object.keys(c.groups ?? {}).filter((k) => (phase === '2') === k.endsWith('2'));
  return keys.length > 0 && !Object.values(gs().fixtures).some((f) => f.comp === c.id && !f.result && f.stage?.startsWith('G') && (phase === '2') === f.stage.endsWith('2'));
};
const loserOf = (t: Tie) => (t.winner === t.a ? t.b : t.a);
function groupOrder(c: Competition, key: string): number[] { return sortTable((c.groups?.[key] ?? []).slice()).map((r) => r.club); }

/** holdene til et trin, eller null når et af dem endnu er ukendt (lodtrækningen udskydes – 0x51c4e9) */
function teamsFor(g: GameState, c: Competition, step: number): number[] | null {
  const m = metaOf(c);
  const [key] = STEPS[m.cmEuro][step];
  const prev = step > 0 ? STEPS[m.cmEuro][step - 1][0] : null;
  const entry = m.entry[key] ?? [];
  if (m.cmEuro === 'CL') {
    if (key === 'Q1') return entry;
    if (key === 'G1') return decided(c, 'Q3') ? [...entry, ...stageTies(c, 'Q3').map((t) => t.winner!)] : null;
    if (key === 'G2') return groupsDone(c, '1') ? [] : null;
    if (key === 'QF') return groupsDone(c, '2') ? [] : null;
    return prev && decided(c, prev) ? [...entry, ...stageTies(c, prev).map((t) => t.winner!)] : null;
  }
  if (m.cmEuro === 'UEFA') {
    if (key === 'Q') return entry;
    if (!prev || !decided(c, prev)) return null;
    const winners = stageTies(c, prev).map((t) => t.winner!);
    const cl = g.comps.CL;
    if (key === 'R1') {
      // CL's Q3-tabere (0x585920) og Intertoto-finalens vindere (IntertotoCup::update_for_date 0x633d40)
      const uic = g.comps.UIC;
      if ((cl && !decided(cl, 'Q3')) || (uic && !decided(uic, 'F'))) return null;
      return [...entry, ...(cl ? stageTies(cl, 'Q3').map(loserOf) : []), ...(uic ? stageTies(uic, 'F').map((t) => t.winner!) : []), ...winners];
    }
    if (key === 'R3') { if (!cl || !groupsDone(cl, '1')) return cl ? null : winners; return [...winners, ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((k) => groupOrder(cl, k)[2]).filter((x) => x !== undefined)]; }
    return winners;
  }
  if (m.cmEuro === 'UIC' && key !== 'R1') return prev && decided(c, prev) ? [...entry, ...stageTies(c, prev).map((t) => t.winner!)] : null;
  return entry;
}

/** sim.ts newDay: lodtrækningerne på deres dato (eller dagen efter, at holdene kendes) */
export function cmEuroDay(g: GameState): void {
  if (!cmEuroOn(g)) return;
  for (const id of ['UIC', 'CL', 'UEFA', 'ESC']) {
    const c = g.comps[id];
    if (!c?.meta?.cmEuro || c.finished) continue;
    for (let guard = 0; guard < 3; guard++) {
      const m = metaOf(c);
      if (m.step >= STEPS[id].length) break;
      const [key, table, idx] = STEPS[id][m.step];
      const dd = drawDate(m, idx, table);
      if (dd && g.date < dd) break;
      const teams = teamsFor(g, c, m.step);
      if (!teams) break;
      drawStep(g, c, key, table, idx, teams);
      m.drawn[key] = g.date;
      m.step++;
    }
  }
}

// ---------------------------------------------------------------- lodtrækningerne

const nationOf = (g: GameState, c: number) => g.clubs[c]?.nation ?? -1;
const seedOf = (g: GameState, c: number) => g.cmClubRep?.[c] ?? (g.clubs[c]?.rep ?? 0) * 100;

/** parrer holdene: 0x400 seedet (bedste halvdel mod den anden), +0xb & 4 lande adskilt, ellers tilfældigt; hjemmeholdet tilfældigt */
function pairTeams(g: GameState, teams: number[], r: Rnd): [number, number][] {
  const list = rng.shuffle(teams.slice());
  const sep = (r.b0b & 4) !== 0;
  let pairs: [number, number][] = [];
  if (r.f0d & 0x400) {
    list.sort((a, b) => seedOf(g, b) - seedOf(g, a));
    const half = Math.floor(list.length / 2);
    const top = list.slice(0, half), bot = rng.shuffle(list.slice(half));
    pairs = top.map((t, i) => [t, bot[i]] as [number, number]);
    if (bot.length > half) pairs.push([bot[half], -1]);
  } else {
    for (let i = 0; i < list.length; i += 2) pairs.push([list[i], list[i + 1] ?? -1]);
  }
  if (sep) {
    for (const p of pairs) {
      if (p[1] < 0 || nationOf(g, p[0]) !== nationOf(g, p[1])) continue;
      const q = pairs.find((o) => o !== p && o[1] >= 0 && nationOf(g, o[1]) !== nationOf(g, p[0]) && nationOf(g, o[0]) !== nationOf(g, p[1]));
      if (q) [p[1], q[1]] = [q[1], p[1]];
    }
  }
  return pairs.map(([a, b]) => (b >= 0 && rng.chance(0.5) ? [b, a] : [a, b]) as [number, number]);
}

function codes(r: Rnd, leg: number): Fixture['cm'] {
  const two = r.legs === 2;
  return { w30: two ? r.id + (leg === 1 ? 3 : 4) : r.id, b34: r.idx, b3a: r.b17, b3c: r.venue & 0x8004 ? 1 : 0, f38: r.f0d, f38dec: two && leg === 2 ? r.f0f : undefined };
}

function createTies(g: GameState, c: Competition, stage: string, r: Rnd, date: string, pairs: [number, number][]): void {
  c.stage = stage;
  for (const [a, b] of pairs) {
    if (b < 0) {
      // et hold uden modstander (for få deltagere i world-filen): videre uden kamp
      c.ties.push({ id: g.nextId.tie++, a, b: a, legs: 1, stage, fx: [], winner: a });
      continue;
    }
    const tie: Tie = { id: g.nextId.tie++, a, b, legs: r.legs === 2 ? 2 : 1, stage, fx: [] };
    c.ties.push(tie);
    const f1 = newFixture(c.id, date, a, b, 1, { stage, tieId: tie.id, leg: 1, slot: r.slot, cm: codes(r, 1) });
    cmPlaceFixture(g, f1);
    if (tie.legs === 2) cmPlaceFixture(g, newFixture(c.id, addDays(date, r.gap), b, a, 2, { stage, tieId: tie.id, leg: 2, slot: r.slot, cm: codes(r, 2) }));
  }
}

const G1 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const G2 = ['A2', 'B2', 'C2', 'D2'];

function createGroup(g: GameState, c: Competition, key: string, gi: number, clubs: number[], days: number[], stageBase: number): void {
  c.groups ??= {};
  c.groups[key] = clubs.map(emptyRow);
  // 4 hold, dobbelt turnering: 6 spilledage (parringen er spillets cirkelmetode)
  const [a, b, cc, d] = clubs;
  const single: [number, number][][] = [[[a, d], [b, cc]], [[cc, a], [d, b]], [[a, b], [cc, d]]];
  const rounds = [...single, ...single.map((r) => r.map(([h, w]) => [w, h] as [number, number]))];
  rounds.forEach((pairs, ri) => {
    for (const [h, w] of pairs) {
      if (h === undefined || w === undefined) continue;
      const f = newFixture(c.id, iso(metaOf(c).year, days[ri]), h, w, ri + 1, { stage: `G${key}`, slot: 2, cm: { w30: 0, w32: stageBase + gi, b34: ri, b3a: 8, f38: 0 } });
      cmPlaceFixture(g, f);
    }
  });
}

/** fordel holdene i grupper á 4: én fra hvert seedningslag, lande (og 1. gruppespils grupper) adskilt når det kan lade sig gøre */
function drawGroups(pots: number[][], n: number, avoid: (c: number, grp: number[]) => boolean): number[][] {
  const groups: number[][] = Array.from({ length: n }, () => []);
  pots.forEach((pot, p) => {
    const order = rng.shuffle([...Array(n).keys()]);
    for (const c of rng.shuffle(pot.slice())) {
      const free = order.filter((i) => groups[i].length === p);
      const gi = free.find((i) => !avoid(c, groups[i])) ?? free[0] ?? order.find((i) => groups[i].length < 4)!;
      groups[gi].push(c);
    }
  });
  return groups;
}

function drawStep(g: GameState, c: Competition, key: string, table: string, idx: number, teams: number[]): void {
  const m = metaOf(c);
  if (table === 'CLG1') {
    // draw_phase1_groups 0x585290: 32 hold i 4 seedningslag à 8
    const sorted = teams.slice().sort((a, b) => seedOf(g, b) - seedOf(g, a));
    const pots = [0, 1, 2, 3].map((p) => sorted.slice(p * 8, p * 8 + 8));
    const groups = drawGroups(pots, 8, (cl, grp) => grp.some((o) => nationOf(g, o) === nationOf(g, cl)));
    const days = dates(m.year, 'CLG1');
    groups.forEach((grp, gi) => { createGroup(g, c, G1[gi], gi, grp, days[gi], 1085); for (const x of grp) cmEuroAddPoints(g, x, 1); });
    c.stage = 'G';
    return;
  }
  if (table === 'CLG2') {
    // draw_phase2_groups 0x585ab0: vindere og toere fra 1. gruppespil, 2 + 2 pr. gruppe, ikke samme gruppe eller land
    const from = new Map<number, string>();
    const win: number[] = [], run: number[] = [];
    for (const k of G1) { const o = groupOrder(c, k); if (o[0] !== undefined) { win.push(o[0]); from.set(o[0], k); } if (o[1] !== undefined) { run.push(o[1]); from.set(o[1], k); } }
    for (const k of G1) for (const [i, cl] of groupOrder(c, k).entries()) asOwner(cl, () => addNews({ cat: 'match', key: i < 2 ? 'comp.groupThrough' : 'comp.groupOut', params: { club: g.clubs[cl]?.name ?? '', comp: c.name, pos: i + 1 }, link: { kind: 'comp', id: c.id } }));
    const groups: number[][] = [[], [], [], []];
    for (const list of [rng.shuffle(win), rng.shuffle(run)]) {
      for (const cl of list) {
        const cap = list === win ? 2 : 4;
        const free = rng.shuffle([0, 1, 2, 3]).filter((i) => groups[i].length < cap);
        const gi = free.find((i) => !groups[i].some((o) => from.get(o) === from.get(cl) || nationOf(g, o) === nationOf(g, cl))) ?? free[0];
        groups[gi].push(cl);
      }
    }
    const days = dates(m.year, 'CLG2');
    groups.forEach((grp, gi) => { createGroup(g, c, G2[gi], gi, grp, days[gi], 1093); for (const x of grp) cmEuroAddPoints(g, x, 1); });
    c.stage = 'G2';
    return;
  }
  const r = rnd(table, idx);
  const date = iso(m.year, dates(m.year, table)[idx][1]);
  let pairs: [number, number][];
  if (m.cmEuro === 'CL' && key === 'QF') {
    // draw_quarter_finals 0x586330: hver gruppevinder mod en toer fra en anden gruppe (toeren først)
    for (const k of G2) for (const [i, cl] of groupOrder(c, k).entries()) asOwner(cl, () => addNews({ cat: 'match', key: i < 2 ? 'comp.groupThrough' : 'comp.groupOut', params: { club: g.clubs[cl]?.name ?? '', comp: c.name, pos: i + 1 }, link: { kind: 'comp', id: c.id } }));
    const win = G2.map((k) => groupOrder(c, k)[0]), run = G2.map((k) => groupOrder(c, k)[1]);
    for (let tries = 0; tries < 50; tries++) {
      const perm = rng.shuffle([0, 1, 2, 3]);
      if (perm.every((p, i) => p !== i) || tries === 49) { pairs = perm.map((p, i) => [run[p], win[i]] as [number, number]); break; }
    }
  } else if (key === 'F' && teams.length === 2 && m.cmEuro !== 'ESC') {
    pairs = [[teams[0], teams[1]]];
    if (rng.chance(0.5)) pairs = [[teams[1], teams[0]]];
  } else {
    pairs = pairTeams(g, teams, r);
  }
  createTies(g, c, key, r, date, pairs!);
}

// ---------------------------------------------------------------- resultaterne

/** recordResult (competitions.ts) for en europæisk kamp efter originalens format: point til landet (0x583b10/0x633290: 2 for sejr, 1 hver for uafgjort) */
export function cmEuroResult(f: Fixture): void {
  const g = gs();
  const res = f.result;
  if (!res) return;
  if (res.hg > res.ag) cmEuroAddPoints(g, f.home, 2);
  else if (res.ag > res.hg) cmEuroAddPoints(g, f.away, 2);
  else { cmEuroAddPoints(g, f.home, 1); cmEuroAddPoints(g, f.away, 1); }
}

/** finalen er spillet: titelforsvarerne til næste sæson */
export function cmEuroFinished(c: Competition): void {
  const g = gs();
  if (!g.cmUefa || !c.winner) return;
  g.cmUefa.holders = { ...(g.cmUefa.holders ?? {}), ...(c.id === 'CL' ? { cl: c.winner } : c.id === 'UEFA' ? { uefa: c.winner } : {}) };
}

/** Forkørslen 0x5cc850: de europæiske kampe før spillets startdato (CL's 1. kvalifikationsrunde 11/7-2001) spilles som computerkampe, dag for dag
 *  med lodtrækningerne imellem. `play` = sim.ts simulateFixture. */
export function cmEuroCatchUp(g: GameState, play: (f: Fixture) => void): void {
  if (!g.cmEuroCatchUp) return;
  g.cmEuroCatchUp = false;
  const today = g.date;
  const ids = new Set(['UIC', 'CL', 'UEFA', 'ESC']);
  let d = Object.values(g.fixtures).filter((f) => ids.has(f.comp) && !f.result).map((f) => f.date).sort()[0];
  const first = Object.values(g.comps).filter((c) => c.meta?.cmEuro).map((c) => drawDate(metaOf(c), 0, STEPS[c.id][0][1])).filter(Boolean).sort()[0];
  if (first && (!d || first < d)) d = first;
  if (!d || d >= today) return;
  const userClub = g.userClub;
  try {
    for (; d < today; d = addDays(d, 1)) {
      g.date = d;
      cmEuroDay(g);
      const todays = Object.values(g.fixtures).filter((f) => ids.has(f.comp) && !f.result && f.date === d);
      for (const f of todays) play(f);
    }
  } finally {
    g.date = today;
    g.userClub = userClub;
  }
  cmEuroDay(g);
}

