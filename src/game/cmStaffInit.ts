// Originalens spilstart for stabens ikke-spillerpost (staff +0x69 → 68 bytes, DAT_00ae23c0) – "Player Initialisation" sub_535a80
// (Database.cpp), afsnittet for ikke-spillere 0x537d59–0x5388cf i hovedløkken og omregningen 0x538a70–0x538b2d i slutløkken, med
// 0x53a8b0 (posten → listen), 0x53a980 (listen → posten), 0x539490 (afbalanceringen) og 0x84b8b0 (navnet, 0x53dba0 tilstand 1).
// Læst i cm0102.exe 3.9.68 (12/11-2026, runde 9b) – sikker, undtagen hvor det står.
//
// Posten: +4 CA (word), +6 PA (word), +8/+0xa/+0xc tre omdømmer (word), +0x0e..+0x22 de 21 egenskaber (byte, alfabetisk: Attacking,
// Business, Coaching, Coaching GK, ?, Directness, Discipline, Free Roles, ?, Judging Ability, Judging Potential, ?, Marking, Motivating,
// Offside, Patience, Physiotherapy, Pressing, Resources, Tactics, Working with Youngsters), +0x43 yndlingsformation.
// 0x53a8b0's liste: 13 "rå" (+0x0e +0x0f +0x12 +0x13 +0x14 +0x15 +0x16 +0x1a +0x1c +0x1d +0x1f +0x20 +0x22) og fra indeks 13 de 8, der
// gemmes som INTERNE værdier i hukommelsen (+0x11 +0x10 +0x17 +0x18 +0x19 +0x1b +0x1e +0x21) – vist = 0x544410 = shown(CA + 2·intern).
//
// Spillets brug: newgame.ts (addDbStaff) → Staff.cmNp, gameInputs.ts (managerens np+0xe/0x544410), adapter.ts (GridManager.tac som i
// låsetrinet: +0x21 er den interne værdi). Talrækken er spillets egen (cmRand pr. staff-id); skabelonpuljen er world-filens stab
// (originalen: hele databasens ikke-spillertabel – *afvigelse* i puljen, ikke i reglerne).

import { staffShown } from './engine/grid/roleScore';

/** sub_90cfc0-semantik: rand(n) = 0..n−1 */
type Rand = (n: number) => number;
const trunc = Math.trunc;
const s8 = (x: number) => (x << 24) >> 24;
const s16 = (x: number) => (x << 16) >> 16;

/** ikke-spillerposten i hukommelsen (de felter, spilstarten rører) */
export interface NpRec {
  ca: number;
  pa: number;
  /** de 21 bytes +0x0e..+0x22 (indeks = offset − 0x0e), signerede */
  a: number[];
  /** +0x43 yndlingsformation */
  f43: number;
}
export interface StaffInitIn {
  np: NpRec;
  /** staff +0x3d (jobkoden: 5 manager, 6 assistent, 8 træner, 9 spejder, 10 fysioterapeut, 11 spiller) */
  job: number;
  /** staff +0x1a → nationens navn (nøglelandene [0x9cf2dc] … [0x9cf510], [0x9cf360]) */
  nation: string | null;
  /** klubbens +0x80 (staff +0x39 → club; null = ingen klub) */
  clubRep: number | null;
  /** 0x53dba0(staff, buf, 500, 1): kaldenavnet (+0xc), ellers "fornavn efternavn" */
  name: string;
  /** staff +0x61 (spillerpost) */
  hasPlayer: boolean;
}

/** 0x53a8b0: listens offsets (indeks → +offset); fra indeks START gemmes værdierne som interne */
export const NP_LIST = [0x0e, 0x0f, 0x12, 0x13, 0x14, 0x15, 0x16, 0x1a, 0x1c, 0x1d, 0x1f, 0x20, 0x22, 0x11, 0x10, 0x17, 0x18, 0x19, 0x1b, 0x1e, 0x21] as const;
export const NP_START = 13;
const PHYSIO = 19;                                                       // listeindeks for +0x1e
const at = (np: NpRec, off: number) => np.a[off - 0x0e];
const put = (np: NpRec, off: number, v: number) => { np.a[off - 0x0e] = s8(v); };
const npList = (np: NpRec) => NP_LIST.map((o) => at(np, o));
const npWrite = (np: NpRec, list: number[]) => NP_LIST.forEach((o, k) => put(np, o, list[k]));
const ok = (v: number) => v >= 1 && v <= 20;

// 0x53805a / 0x5380f9: de britiske øer + Norge (lange bolde) og Italien
const DIRECT = new Set(['Republic Of Ireland', 'England', 'Scotland', 'Northern Ireland', 'Wales', 'Norway']);
const ITALY = 'Italy';
// 0x5386fd–0x5387e9: navnelisten (0x84b8b0 = strcmp ==)
const NAMES_3 = new Set(['George Graham', 'Joe Kinnear', 'Arsene Wenger', 'Ruud Gullit']);
const NAMES_2 = new Set(['John Gregory', 'Harry Redknapp', 'Bryan Robson', 'Walter Smith', 'Jim Smith']);
// 0x53880b: rand(26) → byte-tabellen 0x538ba0 → springtabellen 0x538b7c (+0x43 = 0..8)
const F43_TABLE = [0, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8];

/** en skabelonkandidat: ikke-spillerpost i databasens rå form (CA og listen) */
export interface NpTemplate { ca: number; list: number[] }
export const npTemplate = (np: NpRec): NpTemplate => ({ ca: np.ca, list: npList(np) });

/**
 * sub_535a80 0x537d59–0x5388cf for én stab med ikke-spillerpost (uden omdømmerne +8/+a/+c og alderen): CA/PA, manglende
 * egenskaber (managerreglerne, skabelonen af 250 tilfældige, jobreglerne), navnelisten og +0x43, og jobkoden for jobløse.
 * Ændrer `s.np` på stedet; returnerer den (evt. nye) jobkode.
 */
export function staffInitRecord(s: StaffInitIn, pool: readonly NpTemplate[], rand: Rand): number {
  const np = s.np;
  // 0x537f75: CA uden for 1..200 → klubbens omdømme / 100 (landsholdsklubben +0x24 – ikke i spillet), ellers rand(100) + 1
  if (np.ca < 1 || np.ca > 200) np.ca = s.clubRep !== null ? trunc(s.clubRep / 100) : rand(100) + 1;
  // 0x537fdd: PA uden for 1..200 → max(CA, rand(200) + 1)
  if (np.pa < 1 || np.pa > 200) { const v = rand(200) + 1; np.pa = np.ca > v ? np.ca : v; }
  // 0x538009: Directness 0 med en nation
  if (s.nation !== null && at(np, 0x13) === 0) {
    if (DIRECT.has(s.nation)) { const b = 13 - rand(14); put(np, 0x13, b + rand(8)); }
    else { const b = 5 - rand(5); put(np, 0x13, b + rand(7)); }
  }
  const list = npList(np);
  if (!list.every(ok)) {
    // 0x5380b8: managerreglerne (job 5, klub med omdømme > 6250) – skrives i posten, men listen er læst før (0x53807d), så
    // 0x53a980 overskriver dem igen; de påvirker kun skabelonvalget (0x538292 læser posten på ny) og talrækken
    if (s.job === 5 && s.clubRep !== null && s.clubRep > 0x186a) {
      const it = s.nation === ITALY, big = s.clubRep > 0x1e46;
      if (!ok(at(np, 0x13))) put(np, 0x13, it ? rand(16) + 1 : rand(14) + 7);
      if (!ok(at(np, 0x0e))) put(np, 0x0e, big ? (it ? rand(4) + 13 : rand(8) + 13) : rand(9) + 12);
      if (!ok(at(np, 0x1b))) put(np, 0x1b, rand(13) + 8);
      if (!ok(at(np, 0x1f))) put(np, 0x1f, rand(13) + 8);
      if (!ok(at(np, 0x21))) put(np, 0x21, big ? (it ? rand(7) + 14 : rand(9) + 12) : rand(11) + 10);
    }
    // 0x538200: skabelonen – den mest lignende af 250 tilfældige (rand(antal stab); kun poster med CA 1..200)
    const own = npList(np);
    let tpl: NpTemplate | null = null, best = 0;
    for (let n = 0; n < 250 && pool.length; n++) {
      const c = pool[rand(pool.length)];
      if (!c || c.ca < 1 || c.ca > 200) continue;
      let sc = trunc(Math.abs(np.ca - c.ca) * 2.5);                               // 0x5382c8 ftol(|ΔCA|·2,5)
      for (let k = 0; k < own.length; k++) {
        if (!ok(c.list[k])) sc += 100;
        else if (ok(own[k])) sc += 16 * Math.abs(own[k] - c.list[k]);
      }
      if (sc < best || !tpl) { tpl = c; best = sc; }
    }
    const lo = () => rand(8) + 1;
    if (tpl) {
      // 0x5383bf: skabelonens værdi + (CA − skabelonens CA)/10 + rand(6) − 3; mangler den også: rand(6) + CA/10 − 3
      const caOwn = np.ca >= 1 && np.ca <= 200 ? np.ca : rand(100) + 1;          // 0x538386
      const caT = tpl.ca >= 1 && tpl.ca <= 200 ? tpl.ca : caOwn;
      for (let k = 0; k < list.length; k++) {
        if (ok(list[k])) continue;
        let b: number;
        if (ok(tpl.list[k])) { b = s8(trunc((caOwn - caT) / 10) + tpl.list[k]); b = s8(b + rand(6) - 3); }
        else { const r = rand(6); b = s8(r + trunc(np.ca / 10) - 3); }
        list[k] = b < 1 ? lo() : b > 20 ? 20 : b;
      }
    } else {
      // 0x5384bf: ingen skabelon – rand(7) + CA/10 − 3
      for (let k = 0; k < list.length; k++) {
        if (ok(list[k])) continue;
        const b = s8(rand(7) + trunc(np.ca / 10) - 3);
        list[k] = b < 1 ? lo() : b > 20 ? 20 : b;
      }
    }
  }
  npWrite(np, list);                                                               // 0x538555 0x53a980
  // 0x538561: jobreglerne (rand(100) ≠ 0)
  const cap = (off: number, max: number, n: number) => { if (at(np, off) > max) put(np, off, rand(n) + 1); };
  if (s.job === 9 && rand(100) !== 0) {
    put(np, 0x0f, 1); put(np, 0x1e, 1);
    if (at(np, 0x17) < 5) put(np, 0x17, rand(5) + 4);
    if (at(np, 0x18) < 4) put(np, 0x18, rand(5) + 3);
    cap(0x10, 8, 8); cap(0x11, 8, 8); cap(0x12, 5, 5); cap(0x13, 5, 5); cap(0x1a, 5, 5);
  } else if (s.job === 8 && rand(100) !== 0) {
    put(np, 0x0f, 1); put(np, 0x1e, 1);
  } else if (s.job === 10 && rand(100) !== 0) {
    put(np, 0x0f, 1);
    if (at(np, 0x1e) < 5) put(np, 0x1e, rand(10) + 4);
    for (const o of [0x10, 0x11, 0x12, 0x13, 0x17, 0x18, 0x1a]) cap(o, 5, 5);
  }
  // 0x5386fd: navnelisten og +0x43 (0 eller ≥ 10 → rand(26)-tabellen)
  if (s.name === 'Alex Ferguson') { np.f43 = 3; put(np, 0x13, 7); put(np, 0x0e, 0x11); }
  else if (NAMES_3.has(s.name)) np.f43 = 3;
  else if (NAMES_2.has(s.name)) np.f43 = 2;
  else if (s.name === 'Glenn Hoddle') np.f43 = 6;
  else if (s8(np.f43) === 0 || s8(np.f43) >= 10) np.f43 = F43_TABLE[rand(26)];
  // 0x538867: jobløse (+0x3d og +0x28 = 0)
  if (s.job === 0) {
    if (s.hasPlayer) return 11;
    const c = at(np, 0x10), g = at(np, 0x11), m = at(np, 0x1b), t = at(np, 0x21);
    if (t > 10 && m > 10) return 5;
    if ((c > 6 || g > 6) && m > 10 && t > 10) return 6;
    if (c <= 6 && g <= 6) return at(np, 0x1e) > 10 ? 10 : 9;
    return 8;
  }
  return s.job;
}

/** sub_535a80 0x538a70–0x538b20: de 8 fra indeks 13 → intern = trunc(clamp(10·v − CA, ±200)/2) (word-regning), så 0x539490 */
export function staffConvert(np: NpRec, job: number): void {
  const list = npList(np);
  for (let k = NP_START; k < list.length; k++) {
    let v = s16(s16(list[k] * 10) - np.ca);
    if (v > 200) v = 200; else if (v < -200) v = -200;
    list[k] = trunc(v / 2);
  }
  rebalance539490(list, job);
  npWrite(np, list);
}

/**
 * sub_539490 (sikker): de interne værdiers afbalancering. To gennemløb; i hvert vælges de, der ligger inden for ±tærsklen (40, +10 indtil
 * mindst 6 er med), og hele gruppen flyttes, så snittet bliver −5 (klemt til ±125); Physiotherapy (indeks 19) uden for tærsklen er
 * undtaget. Første gennemløb: de positive uden for gruppen samles, og over 28 i alt trækkes (sum − 28)/antal fra dem (ikke under 0).
 * Fysioterapeuter (job 10): alle andre ≤ −80, Physiotherapy ≥ 0.
 */
export function rebalance539490(list: number[], job: number): void {
  const n = list.length;
  const flag = new Array<number>(n).fill(0);
  for (let pass = 0; pass < 2; pass++) {
    let thr = 40, sum = 0, cnt = 0, best = -1;
    for (;;) {
      sum = 0; cnt = 0; best = -1;
      for (let k = NP_START; k < n; k++) {
        const v = list[k];
        if (Math.abs(v) <= thr) { sum += v; cnt++; flag[k] = 1; }
        else { flag[k] = 0; if (k === PHYSIO && (best === -1 || list[PHYSIO] > list[best])) best = PHYSIO; }
      }
      if (cnt >= 6) break;
      thr += 10;
    }
    if (best > -1) flag[best] = 1;
    const shift = -5 - trunc(sum / cnt);
    let posN = 0, posSum = 0;
    for (let k = NP_START; k < n; k++) {
      if (k === best) continue;
      if (flag[k] === 1) {
        let v = s16(list[k] + shift);
        if (v < -0x7d) v = -0x7d; else if (v > 0x7d) v = 0x7d;
        list[k] = v;
      } else if (pass === 0 && list[k] > 0) { posN++; posSum += list[k]; }
      else flag[k] = 1;
      if (job === 10) {
        if (k !== PHYSIO) { if (list[k] >= -0x50) list[k] = -0x50; }
        else if (list[k] < 0) list[k] = 0;
      }
    }
    if (posN && posSum > 0x1c) {
      for (let k = NP_START; k < n; k++) {
        if (flag[k] === 1) continue;
        list[k] = s16(list[k] - trunc((posSum - 0x1c) / posN));
        if (list[k] < 0) list[k] = 0;
      }
    }
  }
}

/** world-filens [11] (PA, de 21 rå, jobkoden) + CA + yndlingsformationen → ikke-spillerposten før spilstarten */
export function npFromWorld(ca: number, raw: readonly number[], f43: number): NpRec {
  return { ca, pa: raw[0], a: raw.slice(1, 22).map(s8), f43 };
}

/** Den viste Tactics (0x544410(np, np+0x21)) og de andre visninger bruger CA og den interne værdi – se roleScore.ts staffShown */
export const npIntrinsic = (np: { a: number[] }, off: number) => np.a[off - 0x0e];

// ---------------------------------------------------------------- brugen i spillet

/** managerens taktiske felter som i hukommelsen (GridManager.tac / AiPickCtx.manager.tac – samme form som låsetrinet, lockstep.ts):
 *  [+0x0e, +0x13, +0x15, +0x1a, +0x1c, +0x1f, +0x21 (intern), +0x43]. Uden Staff.cmNp (ældre spil/world-filer): `tac` som før. */
export const NP_TAC = [0x0e, 0x13, 0x15, 0x1a, 0x1c, 0x1f, 0x21] as const;
export function gridTacOf(st: { tac?: number[]; cmNp?: number[] } | undefined): number[] | null {
  if (!st?.tac) return null;
  if (!st.cmNp) return st.tac;
  return [...NP_TAC.map((o) => st.cmNp![o - 0x0e]), st.cmNp[21]];
}

/** sub_544410(np, np+off) for en af de 8 interne (+0x10 Coaching, +0x17 Judging Ability, +0x18 Judging Potential, +0x1e Physiotherapy,
 *  +0x21 Tactics …) af spilstartens post; null uden Staff.cmNp */
export function npShown(st: { ca?: number; cmNp?: number[] } | undefined, off: number): number | null {
  if (!st?.cmNp || !st.ca) return null;
  return staffShown(st.ca, st.cmNp[off - 0x0e]);
}

/** sub_535a80's personlige egenskaber (staff +0x56..+0x5f, 0x535ea4–0x5360xx) for alle personer: en værdi uden for 1..20 udfyldes – −1 (0xff)
 *  → rand(16) + 5, ellers to terninger a = rand(20) + 1, b = rand(20) + 1: Ambition (+0x57) og de fleste andre trunc((a + b)/2), Loyalty
 *  (+0x59) og +0x56 den mindste. Formændene (club +0xbf) har 0 hos 52 af 99 engelske klubber i databasen (cmFinance.ts, cmBoardGame.ts). */
export function personalFill_535a80(v: number, rand: Rand, kind: 'avg' | 'min'): number {
  const x = s8(v);
  if (x >= 1 && x <= 20) return x;
  if (x === -1) return rand(16) + 5;
  const a = rand(20) + 1, b = rand(20) + 1;
  return kind === 'min' ? Math.min(a, b) : trunc((a + b) / 2);
}
