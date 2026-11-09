// "Player Initialisation" som i det originale CM 01/02 (sub_535a80, Database.cpp) – kører for hver spiller, når et nyt
// spil bygges fra en CM-database. Porteret fra ejerens Bosman-projekt (player_generation/player_generation.ts +
// PLAYER_GENERATION.md, læst i cm0102.exe):
//  * PA: negativ PA (-2/-1), manglende PA og de tilfældige omslag, alle spillere får i hvert nyt spil
//  * CA over PA → CA = PA − rand(40)
//  * egenskaber databasen ikke har sat (0): kopieret fra den mest lignende af 250 tilfældige spillere ("skabelon")
// Ikke porteret (ukendt i originalen): afbalanceringen sub_538ec0/538bc0 og positionstabellen for spillere helt uden
// position. Udfyldningen sker på databasens 1-20-skala; world-filen har de viste værdier ved spilstart (cm0102.ts
// convert), så de 18 omregnede egenskaber regnes tilbage først og frem igen bagefter.
import { ATTRS, type AttrKey } from './attributes';

/** sub_90cfc0: rand(n) = 0..n−1 for n > 0, 0 for n = 0, −(|n|−1)..0 for n < 0 */
export function makeRand(next: () => number) {
  return (n: number): number => {
    n = Math.trunc(n);
    if (n === 0) return 0;
    const r = Math.floor(next() * Math.abs(n));
    return n > 0 ? r : -r;
  };
}
type Rand = (n: number) => number;
const trunc = Math.trunc;

// ---------------------------------------------------------------- PA (0x53621b..0x536c5d)

/** PA-tabellen ved omslag (0x9b5988) */
const PA_LEVEL = [1, 5, 8, 10, 15, 20, 25, 33, 45, 65, 90, 110, 127, 135, 142, 149, 155, 161, 166, 171, 175];

/** Originalens PA for en spiller i et nyt spil. `paDb` = databasens PA (kan være −2, −1, 0 eller 1-200). */
export function initialisePA(paDb: number, ca: number, age: number, clubLevel: number, rand: Rand): number {
  let pa = paDb;
  // tilfældige omslag for ALLE spillere (0x53621b)
  if (rand(2000) === 0) pa = -2; else if (rand(750) === 0) pa = -1; else if (rand(100) === 0) pa = 0;
  const finish = (v: number) => Math.min(200, Math.max(10, Math.max(v, ca)));
  const minus2 = () => { let v = rand(10) !== 0 ? 120 + rand(81) : 160 + rand(41); if (rand(20) === 0) v -= rand(50); else if (v > 165) v -= rand(30); return finish(v); };
  const minus1 = () => { let v = rand(10) !== 0 ? 80 + rand(81) : 120 + rand(81); if (rand(20) === 0) v -= rand(50); else if (v > 140) v -= rand(30); return finish(v); };
  const reroll = () => {
    let L: number;
    if (rand(100) === 0) L = rand(21);
    else if (rand(2) === 0) L = 6 + rand(6);
    else if (rand(2000) === 0) L = 1 + rand(20);
    else L = 4 + rand(7);
    if (L < 1 || L > 20) L = 3 + rand(10);
    return finish(rand(60) + PA_LEVEL[L] - 30);
  };
  if (pa === -2) return minus2();
  if (pa === -1) return minus1();
  if (pa > 140 && age < rand(30) && ca < 170 && rand(10010 - clubLevel) === 0) return minus1();
  if (pa >= 1 && pa <= 200) return age >= 25 || rand(25) !== 0 ? pa : reroll();
  return reroll();
}

/** CA over PA (0x536e5d) */
export const capCA = (ca: number, pa: number, rand: Rand): number => {
  if (ca <= pa) return ca;
  const v = pa - rand(40);
  return v < 1 ? rand(5) + 1 : v;
};

// ---------------------------------------------------------------- egenskaber (0x537640..0x537bd3)

/** Originalens array-rækkefølge (sub_53a610) for de felter, vi har: [vores nøgle, rolle-flag 1 = målmand / 2 = markspiller] */
const ARR: [AttrKey, 0 | 1 | 2][] = [
  ['anticipation', 0], ['crossing', 2], ['decisions', 0], ['dribbling', 2], ['finishing', 2], ['handling', 1], ['heading', 2],
  ['longShots', 2], ['marking', 2], ['offTheBall', 2], ['oneOnOnes', 0], ['passing', 2], ['penalties', 2], ['positioning', 0],
  ['reflexes', 0], ['tackling', 2], ['throwIns', 0], ['creativity', 2],
  // herfra: ikke-tekniske (originalens indeks ≥ 32)
  ['flair', 2], ['corners', 2], ['freeKicks', 0], ['technique', 2], ['strength', 0], ['stamina', 0], ['pace', 0], ['jumping', 0],
  ['influence', 0], ['dirtiness', 0], ['balance', 0], ['bravery', 0], ['consistency', 0], ['acceleration', 2], ['aggression', 0],
  ['agility', 0], ['importantMatches', 0], ['injuryProneness', 0], ['versatility', 0], ['teamwork', 2], ['workRate', 2],
  ['naturalFitness', 0], ['determination', 0],
];
const TECH = 18; // de første 18 er originalens "tekniske" (indeks < 32) – de omregnes også med CA
const IDX = ARR.map(([k]) => ATTRS.indexOf(k));
const A_JUMP = ATTRS.indexOf('jumping');

// de 18 omregnede egenskaber: hvilke er "høje" (vist med fuld CA) for hhv. målmand og markspiller (som cm0102.ts)
const GK_ATTR = new Set<AttrKey>(['handling', 'reflexes', 'oneOnOnes']);
const OUT_ATTR = new Set<AttrKey>(['crossing', 'dribbling', 'finishing', 'marking', 'offTheBall', 'throwIns', 'creativity']);
const high = (k: AttrKey, keeper: boolean) => (GK_ATTR.has(k) ? keeper : OUT_ATTR.has(k) ? !keeper : true);

/** sub_544380 efter omregningen ved spilstart (samme som cm0102.ts convert) */
export function shownAtStart(stored: number, ca: number, hi: boolean): number {
  const intrinsic = trunc(Math.max(-200, Math.min(200, 10 * stored - ca)) / 2);
  const t = ((hi ? ca : 0.1 * ca) + 2 * intrinsic) * 0.05 + 10;
  return Math.max(1, Math.min(20, trunc((0.1 * t * t + t) / 3 + 0.5)));
}
/** Den gemte 1-20-værdi, der giver `shown` (midten, hvis flere giver samme tal) */
export function storedFromShown(shown: number, ca: number, hi: boolean): number {
  let best: number[] = [], bd = 99;
  for (let v = 1; v <= 20; v++) {
    const d = Math.abs(shownAtStart(v, ca, hi) - shown);
    if (d < bd) { bd = d; best = [v]; } else if (d === bd) best.push(v);
  }
  return best[best.length >> 1];
}

/** En spiller som originalens udpakkede array: positioner (12) + egenskaber; 0 = mangler. `stored` = egenskaberne står
 *  allerede på databasens skala (nye world-filer); ellers er de 18 de viste værdier og regnes tilbage (ældre filer). */
export interface InitRec { ca: number; pos: number[]; side: number[]; attrs: number[]; stored?: boolean }
interface Packed { ca: number; ent: Int16Array }
const NPOS = 11; // GK, SW, D, DM, M, AM, F, WB, R, L, C (fri rolle har vi ikke)

/** Pak en world-post ud på databasens skala (de 18 omregnede regnes tilbage fra den viste værdi) */
export function pack(r: InitRec): Packed {
  const keeper = (r.pos[0] ?? 0) >= 15;
  const ent = new Int16Array(NPOS + ARR.length);
  for (let i = 0; i < 8; i++) ent[i] = r.pos[i] ?? 0;
  ent[8] = r.side[2] ?? 0; ent[9] = r.side[0] ?? 0; ent[10] = r.side[1] ?? 0;
  ARR.forEach(([k], j) => {
    const v = r.attrs[IDX[j]] ?? 0;
    ent[NPOS + j] = v < 1 || v > 20 ? 0 : j < TECH && !r.stored ? storedFromShown(v, r.ca, high(k, keeper)) : v;
  });
  return { ca: r.ca, ent };
}

const ok = (v: number) => v >= 1 && v <= 20;

/**
 * Udfyld de manglende egenskaber som originalen. `attrs` (vores rækkefølge, viste værdier) ændres på stedet; kun
 * indgange med 0 udfyldes (og gyldige værdier i "forkert rolle" sænkes, som originalen gør, når noget mangler).
 * Returnerer false, hvis intet manglede.
 */
export function fillMissing(r: InitRec, age: number, pool: Packed[], rand: Rand): boolean {
  const me = pack(r);
  let missing = false;
  for (let j = 0; j < ARR.length; j++) if (!ok(me.ent[NPOS + j])) { missing = true; break; }
  if (!missing) return false;
  const keeper = me.ent[0] >= 15;
  // skabelon: den mest lignende af 250 tilfældige spillere (0x537640)
  let tpl: Packed | undefined, bestScore = Infinity;
  for (let n = 0; n < 250 && pool.length; n++) {
    const t = pool[rand(pool.length)];
    let score: number;
    if (me.ent[0] === 20 && t.ent[0] === 20) score = 0;
    else {
      score = trunc(Math.abs(me.ca - t.ca) * 2.5);
      for (let i = 0; i < me.ent.length; i++) {
        if (!ok(t.ent[i])) { score += 100; continue; }
        if (!ok(me.ent[i])) continue;
        const d = Math.abs(me.ent[i] - t.ent[i]);
        score += i === 0 ? d * 1000 : i < NPOS ? d * 25 : d * 16;
      }
    }
    if (score < bestScore) { bestScore = score; tpl = t; }
  }
  const wrong = (j: number) => (keeper && ARR[j][1] === 2) || (!keeper && ARR[j][1] === 1);
  const clampFill = (v: number) => (v < 1 ? rand(8) + 1 : v > 20 ? 20 : v);
  const out = new Int16Array(ARR.length);
  for (let j = 0; j < ARR.length; j++) {
    let v = me.ent[NPOS + j];
    if (ok(v)) { if (wrong(j)) v = Math.max(1, v - 10); out[j] = v; continue; }
    if (!tpl) {
      v = clampFill(rand(7) + trunc(me.ca / 5) - 3);
      if (wrong(j)) v = rand(5) + 1;
      out[j] = v;
      continue;
    }
    const t = tpl.ent[NPOS + j];
    if (ok(t)) {
      if (j < TECH) v = t + trunc((me.ca - tpl.ca) / 5);
      else { v = t; if (v <= 5) v += rand(5); else if (v >= 15) v -= rand(4); }
      v = clampFill(v + rand(6) - 3);
    } else v = clampFill(rand(11) + trunc(me.ca / 5) - 5);
    const k = ARR[j][0];
    if ((k === 'workRate' || k === 'naturalFitness') && v < 12) v += rand(13 - v);
    if ((k === 'strength' || k === 'stamina' || k === 'influence') && age < 22 && v > 15) v -= rand(5);
    if (wrong(j)) v = rand(10) + 1;
    out[j] = v;
  }
  // tilbage på vores skala: de 18 omregnede vises med CA
  for (let j = 0; j < ARR.length; j++) r.attrs[IDX[j]] = j < TECH && !r.stored ? shownAtStart(out[j], me.ca, high(ARR[j][0], keeper)) : out[j];
  if (me.ent[0] === 20 && r.attrs[A_JUMP] < 8) r.attrs[A_JUMP] = rand(6) + 5;
  return true;
}

/** Skabelonpuljen: alle databasens spillere med en CA (originalen tager tilfældige staff-poster med CA 1-200) */
export const makePool = (recs: InitRec[]): Packed[] => recs.filter((r) => r.ca >= 1 && r.ca <= 200).map(pack);

// =============================================================================================================
// Visningskæden ved nyt spil (Bosman-projektet identical/5_player_generation, læst i cm0102.exe – sikkert):
// gemt 1-20 → intern = trunc(clamp(10v − CA, ±200)/2) (sub_535a80 0x538a12) → sub_538ec0 (0x538a62) → sub_538bc0
// (0x538a68) → vist = display(CA + 2·intern) (sub_544380; målmand GK = 20: Crossing og Creativity bruger 0,1·CA,
// sub_5442f0 via sub_543540 0x543722/0x5436db). Afbalanceringen er deterministisk.
// =============================================================================================================

const idiv = (a: number, b: number) => Math.trunc(a / b);
const clampN = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const AI = (k: AttrKey) => ATTRS.indexOf(k);
/** arbejds-arrayets indeks 14..31 (sub_53a610) → vores egenskab og rolle (1 = målmand: kun Handling; 2 = markspiller) */
const WORK: [number, AttrKey, 0 | 1 | 2][] = [
  [14, 'anticipation', 0], [15, 'crossing', 2], [16, 'decisions', 0], [17, 'dribbling', 2], [18, 'finishing', 2], [19, 'handling', 1],
  [20, 'heading', 2], [21, 'longShots', 2], [22, 'marking', 2], [23, 'offTheBall', 2], [24, 'oneOnOnes', 0], [25, 'passing', 2],
  [26, 'penalties', 2], [27, 'positioning', 0], [28, 'reflexes', 0], [29, 'tackling', 2], [30, 'throwIns', 0], [31, 'creativity', 2],
];
export const INTRINSIC_KEYS: AttrKey[] = WORK.map(([, k]) => k);

/** display (sub_544380 0x544380): t = X·0,05 + 10 [0x967888, 0x9688b0]; (0,1t² + t)/3 + 0,5, 1..20, afkortet */
export function displayFromX(X: number): number {
  const t = X * 0.05 + 10;
  let v = (t * t * 0.1 + t) * (1 / 3) + 0.5;
  if (v <= 1) v = 1; else if (v >= 20) v = 20;
  return Math.trunc(v);
}
/** gemt → intern (sub_535a80 0x538a12, 16-bit) */
export const toIntrinsic = (stored: number, ca: number) => idiv(clampN(stored * 10 - ca, -200, 200), 2);

/** fælles kerne i sub_538ec0 (0x539184..0x5393de) og sub_538bc0 (0x538c2a..0x538e55); arr[14..31] = interne værdier */
function rebalanceCore(arr: number[], gk: number, skip: Set<number>, target: (mean: number) => number, dribFin: number): void {
  for (let pass = 0; pass < 2; pass++) {
    let r = 0, n = 0, thr = 30, sum = 0, cnt = 0, maxIdx = -1;      // tærskel 0x1e, +5 (0x539192)
    const sel: number[] = [];
    for (;;) {
      sum = 0; cnt = 0; maxIdx = -1;
      for (let i = 14; i < 32; i++) {
        if (skip.has(i)) continue;
        if (Math.abs(arr[i]) <= thr) { sum += arr[i]; cnt++; sel[i] = 1; }
        else { sel[i] = 0; if (maxIdx === -1 || arr[i] > arr[maxIdx]) maxIdx = i; }
      }
      if (cnt >= 12) break;                                           // 0xc
      thr += 5;
    }
    if (maxIdx > -1) sel[maxIdx] = 1;                                 // den højeste afviger flyttes aldrig
    const D = target(idiv(sum, cnt));
    for (let i = 14; i < 32; i++) {
      if (skip.has(i) || i === maxIdx) continue;
      if (sel[i] === 1) arr[i] = clampN(arr[i] + D, -125, 125);       // 0xff83 / 0x7d
      else if (pass === 0 && arr[i] > 0 && gk < 15) { n++; r += i === 17 || i === 18 ? Math.trunc(arr[i] * dribFin) : arr[i]; }
      else sel[i] = 1;
      if (gk < 15 && i === 19) arr[i] = -120;                         // 0xff88: Handling for markspillere (rolle 1)
    }
    if (n > 1 && r > 85) {                                            // 0x55
      for (let i = 14; i < 32; i++) {
        if (skip.has(i) || sel[i] === 1) continue;
        arr[i] = Math.max(0, arr[i] - idiv(r - 85, n));
      }
    }
  }
}
const byte = (v: number) => (v << 24) >> 24;                          // pakkes tilbage som bytes (sub_53aa10)

/** sub_538ec0: afbalancering mod fysik/mentalitet. `a` = vores egenskaber (de 18 allerede interne), feet = [venstre, højre] */
function sub_538ec0(a: number[], ca: number, gk: number, feet: [number, number]): void {
  const v = (k: AttrKey) => a[AI(k)];
  let s = Math.trunc(v('pace') * 1.5) - Math.trunc(v('influence') * -0.8);          // [0x968940]=1,5 [0x969548]=−0,8
  s -= Math.trunc(v('jumping') * -0.5);                                             // [0x969540]
  s -= Math.trunc(v('acceleration') * -1.2);                                        // [0x969538]
  s += Math.trunc(v('teamwork') * 0.8) - Math.trunc(v('technique') * -0.8) - Math.trunc(Math.min(feet[0], feet[1]) * -0.75); // [0x9689b0] [0x969530]
  const h = Math.trunc((v('workRate') + s) * 1.3605442176870748);                   // [0x969528] = 1/0,735
  const x = idiv(idiv(ca, 2) - h + 0x37, 2);                                        // +55 (0x538ff1)
  if (x < -14) {                                                                    // 0x538ffb
    const q = Math.max(idiv(x, 15), -2);
    for (const k of ['acceleration', 'pace', 'technique', 'workRate'] as AttrKey[]) a[AI(k)] = Math.max(1, a[AI(k)] + q);
  }
  let e = x - 20;
  const pa2 = idiv(v('pace') * v('acceleration'), 2);
  if (pa2 > ca) e -= Math.min(pa2 - ca, 25);                                        // 0x19
  const T = clampN(e, -40, 0);                                                      // 0x539120
  const arr: number[] = [];
  for (const [i, k] of WORK) arr[i] = a[AI(k)];
  rebalanceCore(arr, gk, new Set([24, 30]), (m) => T - m, 2.0);                     // spring One on Ones, Throw Ins over; ×2 (0x539331)
  for (const [i, k] of WORK) a[AI(k)] = byte(arr[i]);
  if (gk === 20) {                                                                  // 0x539401
    let m = idiv(v('handling') + v('reflexes'), 2);
    a[AI('handling')] -= m; a[AI('reflexes')] -= m;
    m = idiv(v('anticipation') + v('decisions') + v('positioning'), 3);
    a[AI('anticipation')] -= m; a[AI('decisions')] -= m; a[AI('positioning')] -= m;
  }
}
/** sub_538bc0: centrér de interne på −20 (0x538c2a; ×1,75 [0x968f98]) */
function sub_538bc0(a: number[], gk: number): void {
  const arr: number[] = [];
  for (const [i, k] of WORK) arr[i] = a[AI(k)];
  rebalanceCore(arr, gk, new Set(), (m) => -20 - m, 1.75);
  for (const [i, k] of WORK) a[AI(k)] = byte(arr[i]);
  if (gk >= 15) {                                                                   // 0x538e78 (≥ 15)
    const m = idiv(a[AI('handling')] + a[AI('reflexes')], 2);
    a[AI('handling')] -= m; a[AI('reflexes')] -= m;
  }
}

/**
 * Gemte (udfyldte) egenskaber → de viste ved spilstart. `stored` i vores rækkefølge; kun de 18 interne ændres
 * (og i sjældne tilfælde fart/acceleration/teknik/arbejdsrate −1/−2 i sub_538ec0).
 */
export function shownFromStored(stored: number[], ca: number, gk: number, feet: [number, number]): number[] {
  const a = stored.slice();
  for (const k of INTRINSIC_KEYS) a[AI(k)] = toIntrinsic(a[AI(k)], ca);
  sub_538ec0(a, ca, gk, feet);
  sub_538bc0(a, gk);
  for (const k of INTRINSIC_KEYS) {
    const i = AI(k);
    // målmænd: Indlæg og Kreativitet (Bosman, læst) og Off the Ball (MÅLT i originalen 9/11-2026: Seaman 4, med CA i stedet 11)
    a[i] = gk === 20 && (k === 'crossing' || k === 'creativity' || k === 'offTheBall') ? displayFromX(ca * 0.1 + 2 * a[i]) : displayFromX(ca + 2 * a[i]);
  }
  return a;
}

// ---------------- positioner (sub_535a80 0x536f01..0x5374f4 – sikkert) ----------------
/** pos = [GK SW D DM M AM F WB R L C] (11); ændres på stedet */
export function repairPositions(pos: number[], rand: Rand): void {
  const [GK, SW, D, DM, M, AM, F, WB, Rr, L, C] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  if (pos[GK] >= 16 && pos[GK] <= 19) {                                             // ren målmand
    pos[GK] = 20; for (const k of [SW, D, DM, M, AM, F, Rr, L, C]) pos[k] = 1;
  } else if (![GK, SW, D, DM, M, AM, F, WB].some((k) => pos[k] === 20)) {
    let best = -1;
    for (const k of [GK, SW, D, DM, M, AM, F, WB]) if (pos[k] > 5 && pos[k] < 20 && (best < 0 || pos[k] > pos[best])) best = k;
    if (best >= 0) pos[best] = 20;
    else if (rand(20) === 0) {                                                      // 0x536fbb: målmand
      pos[GK] = 20; for (const k of [SW, D, DM, AM, F, L, C, Rr, M]) pos[k] = 1;
      return;
    } else {
      const r15 = () => 15 + rand(6);
      const t = rand(182);                                                          // 0xb6 (0x537004)
      if (t < 1) pos[SW] = 20;
      else if (t < 7) { pos[SW] = r15(); pos[D] = 20; }
      else if (t < 11) { pos[SW] = r15(); pos[DM] = r15(); pos[D] = 20; }
      else if (t < 15) { pos[SW] = r15(); pos[WB] = r15(); pos[D] = 20; }
      else if (t < 16) { pos[SW] = r15(); pos[DM] = r15(); pos[M] = r15(); pos[D] = 20; }
      else if (t < 17) { pos[SW] = r15(); pos[WB] = r15(); pos[M] = r15(); pos[D] = 20; }
      else if (t < 37) pos[D] = 20;
      else if (t < 49) { pos[DM] = r15(); pos[D] = 20; }
      else if (t < 61) { pos[WB] = r15(); pos[D] = 20; }
      else if (t < 73) { pos[WB] = r15(); pos[M] = r15(); pos[D] = 20; }
      else if (t < 85) { pos[DM] = r15(); pos[M] = r15(); pos[D] = 20; }
      else if (t < 86) { pos[F] = r15(); pos[D] = 20; }
      else if (t < 101) { pos[DM] = r15(); pos[M] = 20; }
      else if (t < 103) { pos[DM] = r15(); pos[AM] = r15(); pos[M] = 20; }
      else if (t < 106) { pos[WB] = r15(); pos[AM] = r15(); pos[M] = 20; }
      else if (t < 126) pos[M] = 20;
      else if (t < 140) { pos[AM] = r15(); pos[M] = 20; }
      else if (t < 142) { pos[F] = r15(); pos[AM] = r15(); pos[M] = 20; }
      else if (t < 143) { pos[F] = r15(); pos[M] = 20; }
      else if (t < 149) { pos[M] = 20; pos[AM] = 20; }
      else if (t < 155) { pos[AM] = 20; pos[F] = r15(); }
      else if (t < 161) { pos[F] = 20; pos[AM] = r15(); }
      else pos[F] = 20;
    }
  }
  // 0x536f90..0x5374f4: sider og midtbane – for alle (målmand GK = 20 springer siderne over)
  if (pos[GK] !== 20) {
    if (pos[SW] >= 15) pos[C] = 20;
    else if (pos[WB] >= 15 && pos[Rr] < 15 && pos[L] < 15) { if (rand(10) < 3) pos[L] = 20; else pos[Rr] = 20; }
    if (pos[Rr] < 20 && pos[L] < 20 && pos[C] < 20) {
      for (;;) {
        if (rand(11) < 4 || rand(pos[C]) > 5) pos[C] = 20;
        if (rand(11) > 8 || rand(pos[L]) > 5) pos[L] = 20;
        if (rand(11) < 4 || rand(pos[Rr]) > 5) { pos[Rr] = 20; break; }
        if (pos[L] >= 20 || pos[C] >= 20) break;
      }
    }
  }
  let m = pos[M];
  if (pos[AM] >= 15 && pos[M] < 15 && pos[C] < 15) m = pos[AM];
  pos[M] = Math.max(m, idiv(pos[AM], 2));
  pos[D] = Math.max(pos[D], idiv(pos[SW], 2));
  if (pos[F] >= 15 && pos[C] < 15) {
    const mFloor = rand(11) + 10, amFloor = rand(7) + 14;
    pos[AM] = Math.max(pos[AM], amFloor);
    pos[M] = Math.max(pos[M], mFloor);
  }
}
