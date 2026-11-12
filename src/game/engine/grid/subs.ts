// Udskiftninger i kampen – cm0102.exe 3.9.68, afkodet fra disassemblyen (tools/cmdis.py) og den registerniveau-oversatte C
// (~/cm0102-engine/.bosman-repo/build/recomp/gen/*.c). Noten: ~/cm0102-engine/notes/6d0b60-substitutions.md.
// Rene funktioner – ingen import af gridMatch.ts/adapter.ts; kalderen giver spillerne som SubPlayer og et rand.
//
//   sub_6c54a0 0x6c581f/0x6c59c8  ved hver dødbold: computerens genvalg, når minut > rand(50) + 10 og > 55 tik siden sidst
//   sub_6e1090                    genvalget: de k = min(udskiftninger tilbage, n) svageste på banen + bænken → sub_6e2000
//   sub_6e2000                    fordelingen spillere → pladser (grådig + konfliktløsning + parvise ombytninger)
//   sub_6e2f20                    udvælgelsesværdien = stillingsfaktor P × kvalitet s (P sikker, s delvist – se selectionQuality)
//   sub_6e1aa0                    omrokering af markspillerne efter et skift (sub_6e2000 med flag 0x8800)
//   sub_6d0b60                    behandlingen af skadede (efter et tik med engine+0x8eb5)
//   sub_6cda20 (slutningen)       efter et rødt kort: omrokering + genvalg
//   sub_6cdd50                    spilleren forlader banen; computeren sætter en markspiller i mål, når keeperen går
//   0x945333 / 0x945487           MSVC-qsort (CUTOFF 8, shortsort = udvælgelse af max) – rækkefølgen ved lige værdier betyder noget
//
// Konstanter er læst i exe'en (VA − 0x400000) og står ved deres adresser. "?" = usikker tolkning.

export type Rand = (n: number) => number;
export type Side = 0 | 1;

/** Kampspilleren (engine+0x4796 + side·8920 + idx·0x1be) – de felter udskiftningerne læser og skriver. */
export interface SubPlayer {
  /** staff-id (+0x69 → staff+0) – identiteten i sub_6e2000's lister */
  id: number;
  /** +0x00: pladsen i truppen 0..19 (< 11 = startede) – også rækkefølgen, spillerne gennemløbes i */
  idx: number;
  /** +0x19: ≥ 0 på banen (taktikkens plads), −1 bænk, −2 skadet ude (venter på afløser), −3 udvist, −4 skiftet ud */
  slot: number;
  /** +0x1a: pladsen før −2 (sub_6d0b60) */
  prevSlot: number;
  /** float +0x4d, 0..10000 */
  condition: number;
  /** float +0x59: kondition, der kommer tilbage (knock) – sub_6e2f20 bruger 2·pend + cond */
  pendingCondition: number;
  /** word +0x35: kampkarakteren (start 6400 for bænken; −500 ved straffe) */
  rating: number;
  /** spillerpost +0x0f: målmandsevnen 1..20 */
  gkRating: number;
  /** +0x1c: skal ud (sat af sub_6d0980, når konditionen < 5000) */
  mustLeave: boolean;
  /** +0x1d: skal behandles (sub_6d0980) */
  treat: boolean;
  /** +0x1e: allerede skiftet ud (sat sammen med slot −4) */
  substituted: boolean;
  /** +0x1f: minuttet han kom ind (−1 = startede) */
  minuteOn: number;
  /** +0x20: minuttet han blev skiftet ud (−1) */
  minuteOff: number;
  /** +0x22: minuttet han måtte ud skadet (−1) */
  minuteInjured: number;
  /** +0x55: den, der skadede ham (null = ingen) */
  injuredBy: number | null;
}

// ---------------------------------------------------------------- tid

/** Minuttet som byte: trunc(clock / 11) (0x6d0c5e, magisk 0x2e8ba2e9 sar 1), loftet af periodens slut +0x8ed4
 *  (495 → 45, 990 → 90, 1155 → 105, 1320 → 120; andre værdier: intet loft). */
export function cappedMinute(clock: number, periodEnd: number): number {
  const m = (Math.trunc(clock / 11) << 24) >> 24;
  const cap = periodEnd === 495 ? 45 : periodEnd === 990 ? 90 : periodEnd === 1155 ? 105 : periodEnd === 1320 ? 120 : 127;
  return m < cap ? m : cap;
}

// ---------------------------------------------------------------- sub_6c54a0: tidspunktet

export interface GateInput {
  /** computeren vælger for holdet: managerposten (hold+0x1b) er ikke et menneske, eller mennesket har en assistent (+0x19) og det er
   *  ikke et landshold (0x53b900) og 0x5fd480(manager) = 0. Ellers trækkes intet. */
  aiControlled: boolean;
  /** engine+0x8ed0 nu (efter evt. tillægstid lagt til i sub_6c54a0 0x6c5727) */
  clock: number;
  /** engine+0x8ed0 ved indgangen til sub_6c54a0 – minuttet læses der (0x6c55b5); standard = clock */
  entryClock?: number;
  /** engine+0x8ecc+2·side: uret ved holdets seneste genvalg (0 ved kampstart – kun init_match rører det ?) */
  lastChange: number;
}
/** sub_6c54a0 0x6c581f (side 0) / 0x6c59c8 (side 1), ved hver dødbold efter tilstandsberegningen og "knackered"-kommentaren:
 *  rand(50) trækkes for hvert computerhold (også uden udskiftninger tilbage); genvalget (sub_6e1090(0)) sker, når
 *  trunc(clock/11) > rand(50) + 10 og clock − lastChange > 55. Bagefter: lastChange = clock, sub_6bbb60(side), sub_6bbf60(). (sikker) */
export function deadBallGate(rand: Rand, g: GateInput): boolean {
  if (!g.aiControlled) return false;
  const r = rand(50) + 10;
  const minute = (Math.trunc((g.entryClock ?? g.clock) / 11) << 24) >> 24;   // bl = byte [esp+0x24]
  return minute > r && g.clock - g.lastChange > 0x37;
}

// ---------------------------------------------------------------- MSVC-qsort (0x945333) og sammenligningerne (0x6e0df0/0x6e0fe0)

/** CRT-qsort fra VC6 (0x945333): CUTOFF 8 → shortsort (0x945487: største bagerst, `cmp(p, max) > 0`), ellers midten byttes til lo,
 *  loguy/higuy-løkkerne, og den mindste del lægges på stakken. Ikke stabil – derfor porteret 1:1. (sikker) */
export function msvcQsort<T>(a: T[], cmp: (x: T, y: T) => number): void {
  const swap = (i: number, j: number) => { if (i !== j) { const t = a[i]; a[i] = a[j]; a[j] = t; } };
  const shortsort = (lo: number, hi: number) => {
    while (hi > lo) {
      let max = lo;
      for (let p = lo + 1; p <= hi; p++) if (cmp(a[p], a[max]) > 0) max = p;
      swap(max, hi); hi--;
    }
  };
  if (a.length < 2) return;
  const lostk: number[] = [], histk: number[] = [];
  let lo = 0, hi = a.length - 1;
  for (;;) {
    const size = hi - lo + 1;
    if (size <= 8) shortsort(lo, hi);
    else {
      swap(lo + (size >> 1), lo);
      let loguy = lo, higuy = hi + 1;
      for (;;) {
        do loguy++; while (loguy <= hi && cmp(a[loguy], a[lo]) <= 0);
        do higuy--; while (higuy > lo && cmp(a[higuy], a[lo]) >= 0);
        if (higuy < loguy) break;
        swap(loguy, higuy);
      }
      swap(lo, higuy);
      if (higuy - 1 - lo >= hi - loguy) {
        if (lo + 1 < higuy) { lostk.push(lo); histk.push(higuy - 1); }
        if (loguy < hi) { lo = loguy; continue; }
      } else {
        if (loguy < hi) { lostk.push(loguy); histk.push(hi); }
        if (lo + 1 < higuy) { hi = higuy - 1; continue; }
      }
    }
    if (!lostk.length) return;
    lo = lostk.pop()!; hi = histk.pop()!;
  }
}

/** Positionsflag for en plads (0x717410 → sub_6c38c0: 1 GK, 2 SW, 4 D, 8 DM, 0x10 M, 0x20 AM, 0x40 F; sider 0x80 R, 0x100 ?, 0x200 C,
 *  0x400 ?, 0x800 L, 0x1000 fri rolle). Kalderen slår dem op i taktikken. */
export type PosFlagsOf = (p: SubPlayer) => number;

const ftol = (x: number) => Math.trunc(x);                         // 0x945640 (_ftol, trunkering)
const key = (p: SubPlayer) => ftol(p.rating + Math.fround(p.condition));   // fild word +0x35; fadd dword +0x4d (x87, ingen afrunding)

/** 0x6e0fe0 (n ≥ 11): −2-spillere først; en ikke-målmand (GK-evne < 20) på målmandspladsen først; ellers stigende
 *  int(+0x35 + +0x4d) – de svageste først. (sikker) */
export function compareFull(posOf: PosFlagsOf) {
  return (a: SubPlayer, b: SubPlayer): number => {
    if (a.slot === -2) return -1;
    if (b.slot === -2) return 1;
    if (posOf(a) === 1 && a.gkRating < 20) return -1;
    if (posOf(b) === 1 && b.gkRating < 20) return 1;
    return key(a) - key(b);
  };
}
/** 0x6e0df0 (n < 11, efter udvisninger/skader): som compareFull, men værdien ganges med en faktor efter positionen – b's faktor vælges
 *  efter a's position (sic, 0x6e0f1f kalder 0x717410 på a igen), og DM-faktoren for b er 1,25 (0x968928) mod a's 1,2 (0x968978).
 *  pos == 4 eller 2 (lighed, ikke bit): ×1,35 (0x969588); 8: ×1,2/1,25; 0x10: ×1,1 (0x9689c0); 0x20/0x40: ×1; andet (fx GK): rå. (sikker) */
export function compareFew(posOf: PosFlagsOf) {
  return (a: SubPlayer, b: SubPlayer): number => {
    if (a.slot === -2) return -1;
    if (b.slot === -2) return 1;
    if (posOf(a) === 1 && a.gkRating < 20) return -1;
    if (posOf(b) === 1 && b.gkRating < 20) return 1;
    const pa = posOf(a);
    const f = (k: number, dm: number) => pa === 4 || pa === 2 ? ftol(k * 1.35) : pa === 8 ? ftol(k * dm) : pa === 0x10 ? ftol(k * 1.1) : k;
    return f(key(a), 1.2) - f(key(b), 1.25);
  };
}

// ---------------------------------------------------------------- sub_6e2000: fordelingen

/** Udvælgelsesværdien for kandidat i på position j (sub_6e2f20 med positionens flag, instruktioner og taktikbyte). Skal være
 *  deterministisk (originalen kalder den flere gange for samme par). */
export type ScoreFn = (j: number, i: number) => number;

/** sub_6e2000 for n ≥ k (ingen ekstra pladser, a5 = 0; grenen n < k forekommer ikke i kampen, da bænken altid er med):
 *  1) for hver position j: den første kandidat med højest værdi (strengt større afløser) – samme kandidat kan vælges flere gange;
 *  2) konflikter (brugt > 1): for hver kandidat i med brugt > 1 og hver position j, han har: den bedste anden kandidat i2 (værdi
 *     under hans, eller ubrugt), tabet = værdi(j,i) − værdi(j,i2); den første j tages altid, senere kun ved tab under det mindste tab
 *     hidtil – NB det mindste tab ([esp+0x64], start 10000) nulstilles aldrig, hverken pr. kandidat eller pr. runde (sic). Højst 10000 runder.
 *  3) ombytninger: byt out[j] og out[j2] (j < j2), når v(j,b) + v(j2,a) > v(j,a) + v(j2,b); efter hver ombytning startes forfra, højst
 *     100 gennemløb. Returnerer kandidatindekset pr. position (null = ingen). (sikker) */
export function assignPlayers(n: number, k: number, score: ScoreFn): (number | null)[] {
  const out: (number | null)[] = new Array(k).fill(null);
  if (n < 1 || k < 1) return out;
  const used = new Array(n).fill(0);
  assignPhase12(n, k, score, out, used);
  // 3) 0x6e2b58 (uden bænkpladser – med dem: pickTeam.ts assignSquad)
  for (let pass = 0; pass < 100; pass++) {
    let swapped = false;
    for (let j = 0; j < k && !swapped; j++) {
      const a = out[j];
      if (a === null) continue;
      const va = score(j, a);
      for (let j2 = j + 1; j2 < k && !swapped; j2++) {
        const b = out[j2];
        if (b === null) continue;
        const vjb = score(j, b), vj2a = score(j2, a), vj2b = score(j2, b);
        if (vj2a + vjb > va + vj2b) { out[j] = b; out[j2] = a; swapped = true; }
      }
    }
    if (!swapped) break;
  }
  return out;
}
/** Trin 1 og 2 af sub_6e2000 for n ≥ k (out/used fyldes; også brugt af pickTeam.ts assignSquad). */
export function assignPhase12(n: number, k: number, score: ScoreFn, out: (number | null)[], used: number[]): void {
  let conflicts = 0;
  // 1) 0x6e264e
  for (let j = 0; j < k; j++) {
    let best: number | null = null, bestScore = 0;
    for (let i = 0; i < n; i++) {
      const s = score(j, i);
      if (best === null || s > bestScore) { best = i; bestScore = s; }
    }
    if (best !== null && ++used[best] > 1) conflicts++;
    out[j] = best;
  }
  // 2) 0x6e2789
  let minLoss = 10000, iter = 0;
  while (conflicts > 0 && iter < 10000) {
    iter++;
    for (let i = 0; i < n; i++) {
      let repl: number | null = null, rj = -1;
      for (let j = 0; j < k; j++) {
        if (!(used[i] > 1) || out[j] !== i) continue;
        const cur = score(j, i);
        let cand: number | null = null, cs = 0;
        for (let i2 = 0; i2 < n; i2++) {
          if (i2 === i) continue;
          const s2 = score(j, i2);
          if (cand !== null && !(s2 > cs)) continue;
          if (s2 < cur || used[i2] === 0) { cand = i2; cs = s2; }
        }
        const loss = cur - (cand === null ? 0 : cs);
        if (repl === null || loss < minLoss) { rj = j; repl = cand; minLoss = (loss << 16) >> 16; }   // movsx eax, ax
      }
      if (repl !== null) {
        if (++used[repl] > 1) conflicts++;
        out[rj] = repl;
        used[i]--; conflicts--;
      }
    }
  }
}

// ---------------------------------------------------------------- sub_6e2f20: udvælgelsesværdien

/** Tabellen 0xa15cfc (positionsevne 0..20 → værdi). */
export const POS_TABLE = [-150, -124, -107, -84, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

/** Spillerpostens positionsfelter (+0x0f..+0x1a) og fødderne (+0x30/+0x3b), rå 1..20. */
export interface PositionRecord {
  gk: number; sw: number; d: number; dm: number; m: number; am: number; f: number; wb: number;   // +0x0f..+0x16
  l: number; r: number; c: number; free: number;                                                 // +0x17..+0x1a
  foot30: number; foot3b: number;                                                                // +0x30 / +0x3b
}
export function positionRecord(rec: ArrayLike<number>): PositionRecord {
  const s = (o: number) => (rec[o] << 24) >> 24;
  return { gk: s(0xf), sw: s(0x10), d: s(0x11), dm: s(0x12), m: s(0x13), am: s(0x14), f: s(0x15), wb: s(0x16), l: s(0x17), r: s(0x18), c: s(0x19), free: s(0x1a), foot30: s(0x30), foot3b: s(0x3b) };
}
/** 0x5b7d20: spillerens naturlige positioner – den højeste tærskel 15..10, hvor mindst én evne når (GK 1, D 4, SW 2, DM 8 ellers AM 0x20
 *  ellers M 0x10, F 0x40), og siderne for sig (L 0x800, R 0x80, C 0x200). (sikker) */
export function naturalPositions(r: PositionRecord): number {
  let s = 0;
  for (let t = 15; t >= 10 && !s; t--) {
    if (r.gk >= t) s |= 1;
    if (r.d >= t) s |= 4;
    if (r.sw >= t) s |= 2;
    if (r.dm >= t) s |= 8; else if (r.am >= t) s |= 0x20; else if (r.m >= t) s |= 0x10;
    if (r.f >= t) s |= 0x40;
  }
  for (let t = 15, hit = false; t >= 10 && !hit; t--) {
    if (r.l >= t) { s |= 0x800; hit = true; }
    if (r.r >= t) { s |= 0x80; hit = true; }
    if (r.c >= t) { s |= 0x200; hit = true; }
  }
  return s;
}
const T = (v: number) => POS_TABLE[Math.max(0, Math.min(20, v))];
const tdiv = (a: number, b: number) => Math.trunc(a / b);
function roleValue(r: PositionRecord, p: number, nat: number, attacking: boolean): number {
  const lo = p & 0xff, wide = (p & 0x800) !== 0 || (lo & 0x80) !== 0;
  if (lo & 1) return r.gk * r.gk - 300;
  if (nat & 1) return -200;
  if (lo & 2) return T(r.sw);
  if (lo & 4) return T(r.d);
  if (!attacking && p === 8) return T(Math.max(r.wb, r.d, r.dm, r.m));          // 0x6e30f6 (kun forsvarsdelen)
  if (lo & 8) return wide ? T(r.wb) : T(r.dm);
  if (lo & 0x10) {
    if (attacking) return T(Math.max(r.am - 5, r.m, r.dm - 5));               // 0x6e3352: angrebsdelen tester ikke 0x800/0x80
    if (!wide) return p === 0x10 ? T(Math.max(r.am, r.dm, r.m)) : T(Math.max(r.am - 5, r.m, r.dm - 5));
    return T(Math.max(r.am, r.m));
  }
  if (lo & 0x20) return wide ? T(r.am) : T(ftol(Math.max(r.am, (r.am + r.free) * 0.5)));   // 0x968968
  if (lo & 0x40) return T(r.f);
  return 100;
}
function sideValue(r: PositionRecord, p: number): number {
  if (p & 0x1000) return 10 * (r.free - 10);
  if (p & 0x80) return 10 * (r.r - 10);
  if (p & 0x100) return r.foot30 + 10 * Math.max(tdiv(r.r, 2), r.c) - 120;
  if (p & 0x200) return 10 * (r.c - 10);
  if (p & 0x400) return r.foot3b + 10 * Math.max(tdiv(r.l, 2), r.c) - 120;
  if (p & 0x800) return 10 * (r.l - 10);
  return 100;
}
/** sub_6e2f20 0x6e3088–0x6e361f: stillingsfaktoren P for spilleren på en plads med forsvarsflag `pos` (0x717410) og angrebsflag `att`
 *  (0x717450; 0 = samme). P = rolle + side (+ −100 uden naturlig position); med en anden angrebsrolle: trunc((P_att + 2·P_pos)/3).
 *  Flag 0x400: rollen = +100; flag 0x200: siden = +100. Kontrolleret mod 0,9 mio. kald i kampsporet subs1 (99,3 % passer; resten er
 *  sandsynligvis de tidlige returveje). (sikker) */
export function positionFactor(r: PositionRecord, pos: number, att: number, flags: number): number {
  const nat = naturalPositions(r);
  let e = nat ? 0 : -100, b = 0;
  const other = att !== 0 && att !== pos;
  if (flags & 0x400) e += 100;
  else { e += roleValue(r, pos, nat, false); if (other) b = roleValue(r, att, nat, true); }
  if (flags & 0x200) return e + 100;
  e += sideValue(r, pos);
  if (other) return tdiv(b + sideValue(r, att) + 2 * e, 3);           // 0x6e3604: (ebp + 2·edi)/3
  return e;
}
/** Slutningen af sub_6e2f20 (0x6e611d): værdien = P·s, når P ≥ 0 og s ≥ 1; s + P når s < 1; (500 − s)·P når P < 0; flag == 0x800 → P.
 *  (De sidste justeringer for en landsholdsliste a15 ≠ 0 er ikke med – a15 = 0 i kampen.) (sikker) */
export function combineScore(P: number, s: number, flags: number): number {
  if (flags === 0x800) return P;
  if (P < 0) return (500 - s) * P;
  if (s < 1) return s + P;
  return P * s;
}

/** Indgangene til kvaliteten s i sub_6e2f20 for et kald under kampen. De statiske led (omdømme, opfattet evne 0x6e86d0, egenskaberne
 *  efter instruktionerne 0x8000, kontrakt/trupstatus 0x10000, …) læser staff-/kontraktposter, som porten ikke har – de gives samlet. */
export interface QualityInput {
  flags: number;
  /** summen og antallet af de øvrige gennemsnitsled (0x40 omdømme +0xb/25, 0x80 0x6e86d0, 0x100, 0x2 …) */
  staticSum: number;
  staticCount: number;
  /** de øvrige additive led efter gennemsnittet (0x8 +0x45, 0x8000 egenskaber, 0x80000/0x20000, kontrakt …) */
  staticAdd: number;
  /** 0x10000: trupstatus-bonussen [esp+0x90] før aftagningen (1 − clock/1200) – *estimeret* 0 uden kontraktdata */
  statusBonus: number;
  /** 0x62c3d0(staff): sæsonens kondition fra databasen; > 1000 trækker fra (500 − v). 0 = intet. */
  dbFitness: number;
  /** spillerens individuelle instruktioner (lo) og holdflagene – 0x8000 eller 0x2000 + holdflag 0x100 kvadrerer konditionen */
  instrLo: number;
  teamFlags: number;
  /** a15 (landsholdsliste) ≠ 0: statusbonus × 0,25 – 0 i kampen */
  nationalList?: boolean;
  /** staff+0x39 == klubben (altid i en klubkamp): s = max(s + 5, 1,05·s) før ×P. Standard sand. */
  ownClub?: boolean;
}
export interface QualityContext {
  clock: number;
  /** engine+0x8ed4 (495 i 1. halvleg) */
  periodEnd: number;
  /** menneskets hold uden assistent (eller landshold/0x5fd480): startere får grundværdien −2000 hele kampen, ikke kun i 1. halvleg */
  humanControlled: boolean;
}

/** Leddet for flag 0x1 (0x6e3845–0x6e3a15): kun for en spiller i kampen, der ikke er naturlig målmand (0x5b7d20 & 1).
 *  base = −2000 for en starter (idx < 11) i 1. halvleg (eller hos et menneske); bænk: e = base + min(150·(60 − minut), 3000), +3500 for en
 *  spiller med GK-evne > 1, ellers mindst −2000; på banen: e = base + 40·(d − 60) for d = minut − minutIn < 60 (byte), ellers base;
 *  leddet = trunc((+0x35 − e)/25). (sikker) */
export function ratingTerm(p: SubPlayer, ctx: QualityContext): number {
  const minute = (Math.trunc(ctx.clock / 11) << 24) >> 24;
  const base = (ctx.periodEnd === 495 || ctx.humanControlled) && p.idx < 11 ? -2000 : 0;
  let e = base;
  if (p.slot === -1) {
    e = base + Math.min(150 * (60 - minute), 3000);
    if (p.gkRating > 1) e += 3500;
    else if (e < -2000) e = -2000;
  } else if (p.slot >= 0) {
    const d = ((minute - p.minuteOn) << 24) >> 24;
    if (d < 60) e = base + 40 * (d - 60);
  }
  return tdiv(p.rating - e, 25);
}

/** Konditionen i sub_6e2f20 (0x6e50b9–0x6e5232): c = trunc(2·pend + cond) (+1500, højst 10000, i 1. halvleg), − (v − 500) når
 *  databasens v > 1000. c < 5750 → hele værdien er c + 100·P − 25000 (c ≥ 3500) eller den − 500000 – returneres straks. Ellers
 *  (instruktion 0x8000, eller 0x2000 med holdflag 0x100: c = trunc(c²·0,0001)) leddet 3c/100 − 280 under 9000, −(10000 − c)/100 over.
 *  Returnerer { add } eller { final }. −2-spillere: final −1000000. (sikker) */
export function conditionTerm(p: SubPlayer, q: QualityInput, ctx: QualityContext, P: number): { add: number } | { final: number } {
  if (p.slot === -2) return { final: -1000000 };                         // 0x6e50ca
  let c = ftol(2 * Math.fround(p.pendingCondition) + Math.fround(p.condition));   // fld +0x59; fadd st0; fadd +0x4d (x87)
  if (ctx.periodEnd === 495) c = Math.min(c + 1500, 10000);
  if (!(q.flags & 0x200000) && q.dbFitness > 1000) c += 500 - q.dbFitness;
  if (c < 5750) {
    const v = c + 20 * (5 * P - 1250);
    return { final: c >= 3500 ? v : v - 500000 };
  }
  if (q.instrLo & 0x8000 || (q.instrLo & 0x2000 && q.teamFlags & 0x100)) c = ftol(c * 0.0001 * c);   // 0x96a5c0
  return { add: c < 9000 ? tdiv(3 * c, 100) - 280 : 0 - tdiv(10000 - c, 100) };
}

/** Kvaliteten s og den samlede værdi for et kald under kampen: gennemsnittet af de statiske led + ratingTerm (flag 0x1), over 150
 *  strakt ×1,5 (0x968940/0x968f50), + de additive led + konditionen + trupstatus·(1 − clock/1200) (0x96d268), × P (combineScore).
 *  Rækkefølgen af de additive led er forenklet (originalen trunkerer hvert for sig – samme resultat, da de er heltal). */
export function selectionScore(p: SubPlayer, r: PositionRecord, pos: number, att: number, q: QualityInput, ctx: QualityContext): number {
  const P = positionFactor(r, pos, att, q.flags);
  let sum = q.staticSum, cnt = q.staticCount;
  if (q.flags & 1 && !(naturalPositions(r) & 1)) { sum += ratingTerm(p, ctx); cnt++; }
  let s = cnt ? Math.trunc(sum / cnt) : 0;
  if (cnt && s > 150) s = ftol((s - 150) * 1.5 + 150);
  s += q.staticAdd;
  if (!(q.flags & 0x800)) {
    const ct = conditionTerm(p, q, ctx, P);
    if ('final' in ct) return ct.final;
    s += ct.add;
  }
  if (q.flags & 0x10000) {
    let b = ftol((1 - ctx.clock * 0.0008333333333333334) * q.statusBonus);
    if (q.nationalList) b = ftol(b * 0.25);
    s += b;
  }
  if (q.ownClub ?? true) s = ftol(Math.max(s + 5, s * 1.05));          // 0x6e60d2: staff+0x39 == klubben (0x9689b8)
  return combineScore(P, s, q.flags);
}

/** *estimeret*: de statiske led, når staff-/kontraktposterne mangler – lineær tilpasning af s mod 25.626 kald i kampsporet subs2
 *  (R² 0,62): s ≈ 0,24·CA + 0,24·omdømme/25 + 0,16·ratingTerm + 0,84·konditionsled − 0,0096·clock − 16 (bænk) + 21,7.
 *  Brug den kun som standard; den rigtige s kræver resten af sub_6e2f20 (se noten). */
export function estimatedQuality(p: SubPlayer, ca: number, currentRep: number, ctx: QualityContext): number {
  const ct = conditionTerm(p, { flags: 0, staticSum: 0, staticCount: 0, staticAdd: 0, statusBonus: 0, dbFitness: 0, instrLo: 0, teamFlags: 0 }, ctx, 100);
  if ('final' in ct) return ct.final < -400000 ? -1000 : 0;
  const base = p.slot === -1 ? -16.1 : 0;
  return Math.round(0.2408 * ca + 0.2371 * (currentRep / 25) + 0.1571 * ratingTerm(p, ctx) + 0.8429 * ct.add - 0.0096 * ctx.clock + base + 21.69);
}

// ---------------------------------------------------------------- sub_6e1090: genvalget

/** Taktikken for en plads: positionsflag (0x717410/0x717430), angrebsflag (0x717450), individuelle instruktioner (0x5b5270) og
 *  taktikbyten (0x5b57c0). */
export interface SlotSpec { slot: number; pos: number; att: number; instrLo: number; instrHi: number; tacticByte: number }

export interface FlagInput {
  /** 0x53b900(egen klub) ≠ 0: landshold */
  national: boolean;
  /** hold+0x19: menneskets hold med assistent (?) – |0x20100 ^0x80000, ingen rand */
  assisted: boolean;
  /** (hold+0x37)+0x3a: turneringstypen; 1 og 9 trækker rand(2000) + rand(−4000) først */
  compType: number;
  /** club+0x80 for egen og modstanderens klub */
  ownRep: number; oppRep: number;
  /** hold+0x1a == 3 og (turneringens id ≤ −1 eller 0x48f150(turnering, klub) ≠ 0) → 0x10000 i stedet for 0x100 ^0x80000 */
  leagueBranch: boolean;
  /** hold+0x16 → 0x800000 */
  b16: boolean;
  /** 0x600a50(klub,1,1,0,0) og klubbens +0xcf er et menneske (0x5fd210) og 0x5fea50(3, …) → 0x400000 */
  humanClubOption: boolean;
}
/** sub_6e1090 0x6e1262–0x6e13bd: flagene til sub_6e2000/sub_6e2f20 og de tilfældige tal (eneste rand i genvalget uden kommentarer).
 *  Grundflag 0x8a0cb (landshold 0x208a09d). (sikker; tolkningen af +0x1a/+0x19 "?") */
export function reselectFlags(rand: Rand, f: FlagInput): number {
  let fl = f.national ? 0x208a09d : 0x8a0cb;
  const diff = f.ownRep - f.oppRep;
  const nat = () => { if (!f.national) fl |= 0x10000; };
  done: {
    if (f.assisted) { fl |= 0x20100; fl ^= 0x80000; break done; }
    if (f.compType === 1 || f.compType === 9) {
      const r = rand(2000) + rand(-4000);
      if (diff > r) { fl |= 0x100; break done; }
    }
    const r = rand(3000) + 3000;
    if (diff > r) { fl |= 0x100; nat(); break done; }
    if (f.leagueBranch) { nat(); break done; }
    fl |= 0x100; fl ^= 0x80000;
  }
  if (f.b16) fl |= 0x800000;
  if (f.humanClubOption && !f.assisted) fl |= 0x400000;
  return fl;
}

export interface ReselectInput {
  /** holdets 20 kampspillere i idx-rækkefølge (tomme pladser udeladt) */
  players: SubPlayer[];
  /** hold+0x17 */
  subsLeft: number;
  /** antal navngivne udskiftere: (hold+0x37)+0x4d & 0xf – bænken er idx 11 .. 10+benchSize */
  benchSize: number;
  /** argumentet: 1 = keeperen er udvist – den første kandidat skal på plads 0 (sub_6cda20/sub_6d1210) */
  keeperOut: boolean;
  clock: number;
  periodEnd: number;
  posOf: PosFlagsOf;
  /** pladsen for en −2-spiller slås op med 0x717430 (forrige plads ?) – standard posOf af prevSlot */
  prevPosOf?: PosFlagsOf;
  slotSpec: (slot: number) => Omit<SlotSpec, 'slot' | 'pos' | 'att'>;
  attOf: PosFlagsOf;
  /** værdien af spiller p på positionen (sub_6e2f20) */
  score: (p: SubPlayer, spec: SlotSpec, flags: number) => number;
  flags: FlagInput;
}
export interface ReselectResult {
  /** flagene til sub_6e2f20 (efter rand) */
  flags: number;
  /** holdets spillere efter genvalget (kopier) */
  players: SubPlayer[];
  /** ind og ud i par (samme rækkefølge som originalens kommentarer 0x1f5b/0x20d7) */
  on: SubPlayer[]; off: SubPlayer[];
  subsLeft: number;
  /** kandidaterne i den sorterede rækkefølge (k svageste + bænken) og pladserne */
  candidates: SubPlayer[]; specs: SlotSpec[];
  /** der blev skiftet: kalderen kører sub_6e1aa0 (rearrange) og evt. kommentarerne; uden skift returnerer originalen straks */
  changed: boolean;
}

/** sub_6e1090(keeperOut) for et computerhold. Tom bænk / ingen udskiftninger: intet sker (ingen rand). (sikker, undtagen sub_6e2f20) */
export function reselect(rand: Rand, inp: ReselectInput): ReselectResult {
  const players = inp.players.map((p) => ({ ...p }));
  const res: ReselectResult = { flags: 0, players, on: [], off: [], subsLeft: inp.subsLeft, candidates: [], specs: [], changed: false };
  if (inp.subsLeft <= 0) return res;                                         // 0x6e10af
  // 0x6e10c4: på banen eller −2 (ikke allerede skiftet)
  const list = players.filter((p) => p.slot >= 0 || (p.slot === -2 && !p.substituted));
  const n0 = list.length;
  msvcQsort(list, n0 < 11 ? compareFew(inp.posOf) : compareFull(inp.posOf));
  const k = Math.min(inp.subsLeft, n0);
  const prevPos = inp.prevPosOf ?? ((p: SubPlayer) => inp.posOf({ ...p, slot: p.prevSlot }));
  const specs: SlotSpec[] = [];
  for (let i = 0; i < k; i++) {
    const p = list[i];
    const pos = p.slot === -2 ? prevPos(p) : inp.posOf(p);
    const att = p.slot === -2 ? 0 : inp.attOf(p);
    const slot = i === 0 && inp.keeperOut ? 0 : p.slot === -2 ? p.prevSlot : p.slot;
    specs.push({ slot, pos, att, ...inp.slotSpec(slot) });
  }
  // 0x6e11f4: bænken idx 11 .. 10+benchSize med slot −1
  const cands = list.slice(0, k);
  for (const p of players) if (p.idx >= 11 && p.idx < 11 + inp.benchSize && p.slot === -1) cands.push(p);
  res.candidates = cands; res.specs = specs;
  const flags = reselectFlags(rand, inp.flags);
  res.flags = flags;
  const memo = new Map<number, number>();
  const out = assignPlayers(cands.length, k, (j, i) => {
    const key2 = j * 64 + i;
    let v = memo.get(key2);
    if (v === undefined) { v = inp.score(cands[i], specs[j], flags); memo.set(key2, v); }
    return v;
  });
  // 0x6e1433: i kandidaternes rækkefølge
  const minute = cappedMinute(inp.clock, inp.periodEnd);
  for (let i = 0; i < cands.length; i++) {
    const p = cands[i];
    const j = out.indexOf(i);
    if (j >= 0) {
      if (p.slot === -1) { res.subsLeft--; p.minuteOn = minute; res.on.push(p); }   // 0x6cdd00: x 8, y 6
      if (p.slot >= 0 || p.slot === -1) p.slot = specs[j].slot;
    } else if (p.slot !== -1) {
      p.slot = -4; p.substituted = true; p.minuteOff = minute; res.off.push(p);    // 0x6cdd50(p, −1)
    }
  }
  res.changed = res.on.length > 0;
  return res;
}

// ---------------------------------------------------------------- sub_6e1aa0: omrokeringen

export interface RearrangeInput {
  players: SubPlayer[];
  posOf: PosFlagsOf; attOf: PosFlagsOf;
  slotSpec: (slot: number) => Omit<SlotSpec, 'slot' | 'pos' | 'att'>;
  /** værdien med flag 0x8800 (|0x400000 som i reselectFlags) */
  score: (p: SubPlayer, spec: SlotSpec, flags: number) => number;
  flags?: number;
}
/** sub_6e1aa0: markspillerne på banen (slot ≥ 0, ikke målmandspladsen pos 1) fordeles på deres egne pladser med sub_6e2000 (n = k).
 *  Med præcis 11 på banen kalder originalen først 0x6e0230(…, 0x8c1, 2) (→ 0x6ddab0, computerens taktik – aiPrematch.ts), som kalderen
 *  selv må køre. Bagefter 0x6eecb0(p, 0) for hver flyttet spiller (positionstilpasning og rul – helpers.ts). (sikker) */
export function rearrange(inp: RearrangeInput): { players: SubPlayer[]; moved: SubPlayer[] } {
  const players = inp.players.map((p) => ({ ...p }));
  const list = players.filter((p) => p.slot >= 0 && inp.posOf(p) !== 1);
  const specs: SlotSpec[] = list.map((p) => ({ slot: p.slot, pos: inp.posOf(p), att: inp.attOf(p), ...inp.slotSpec(p.slot) }));
  const flags = inp.flags ?? 0x8800;
  const memo = new Map<number, number>();
  const out = assignPlayers(list.length, list.length, (j, i) => {
    let v = memo.get(j * 64 + i);
    if (v === undefined) { v = inp.score(list[i], specs[j], flags); memo.set(j * 64 + i, v); }
    return v;
  });
  const moved: SubPlayer[] = [];
  list.forEach((p, i) => { const j = out.indexOf(i); if (j >= 0) { p.slot = specs[j].slot; moved.push(p); } });
  return { players, moved };
}

// ---------------------------------------------------------------- sub_6cdd50: en spiller forlader banen

/** sub_6cdd50(p, mode) fjerner p fra cellelisterne og markeringerne. Med mode ≠ −1 udfyldes hans plads af en markspiller, når
 *  (mode == −3 – udvist – eller p er holdets keeper +0xf59e/+0xf5a2), p's plads ikke er F/AM (0x40/0x20) og computeren vælger:
 *  den spiller på banen (ikke p) med højest værdi – F 70000, AM 50000, M 15000, ellers −5000, +5000 med side R/L (0x80/0x800); efter den
 *  første kandidat springes GK/D/SW over (sic) – får p's plads (hans egen bliver tom); var p keeper (pos 1), bliver han holdets keeper.
 *  Returnerer ham (null = ingen/ikke relevant). mode: −1 (genvalg følger), −2 (skadet, ingen udskiftninger), 0 (udvist og behandlet),
 *  −3 (udvist, sub_6cda20). (sikker) */
export function fillVacatedSlot(players: SubPlayer[], leaving: SubPlayer, mode: number, isKeeper: boolean, aiControlled: boolean, posOf: PosFlagsOf): SubPlayer | null {
  if (mode === -1 || !(mode === -3 || isKeeper) || !aiControlled) return null;
  const own = posOf(leaving);
  if (own & 0x40 || own & 0x20) return null;
  let best: SubPlayer | null = null, bestV = -10000;
  for (const q of players) {
    if (q.slot < 0 || q.id === leaving.id) continue;
    const f = posOf(q);
    if (best && (f & 1 || f & 4 || f & 2)) continue;
    let v = f & 0x40 ? 70000 : f & 0x20 ? 50000 : f & 0x10 ? 15000 : -5000;
    if (f & 0x80 || f & 0x800) v += 5000;
    if (v > bestV || !best) { bestV = v; best = q; }
  }
  return best;
}

// ---------------------------------------------------------------- sub_6d0b60: behandlingen

export type TreatAction =
  | { kind: 'carriedOff'; id: number; mode: -1 | -2 | 0 }   // 0x1f56/0x1f57: 6cdd50(p, mode) (mode −2/0 = keeper erstattes af en markspiller)
  | { kind: 'continues'; id: number; comment: boolean }      // 0x1f58 hvis rand(4) == 0 eller en modspiller skadede ham
  | { kind: 'reselect'; side: Side }                         // sub_6e1090(0)
  | { kind: 'rearrange'; side: Side };                       // sub_6e1aa0 + keeperen findes igen (0x6ce110)

/** sub_6d0b60 (efter et tik med engine+0x8eb5; nulstilles til sidst): for hver side og hver spiller på banen (eller udvist, −3) med +0x1d:
 *  skal han ud (+0x1c): slot ≥ 0 → 6cdd50(p, udskiftninger ? −1 : −2), +0x1a = slot, slot = −2; udvist → 6cdd50(p, 0); +0x22 = minuttet.
 *  Ellers rand(4) (altid trukket) – kommentar 0x1f58 ved 0 eller en skadevolder; 0x20f6 med skadevolderen. +0x1d = 0. Var der nogen, og
 *  vælger computeren: genvalg med udskiftninger tilbage, ellers omrokering; lastChange = clock; 6bbb60(side); 6bbf60(). Muterer spillerne
 *  (som originalen) og returnerer handlingerne i rækkefølge. (sikker) */
export function treatInjured(rand: Rand, sides: { players: SubPlayer[]; subsLeft: number; aiControlled: boolean }[], clock: number, periodEnd: number,
  each?: (a: TreatAction) => void): TreatAction[] {
  // each: handlingen udføres straks (kommentarerne 0x1f56/0x1f57/0x1f58/0x20f6 trækker tal mellem spillernes rand(4) – 0x6d0bed–0x6d0d6f)
  const acts: TreatAction[] = [];
  const emit = (a: TreatAction) => { acts.push(a); each?.(a); };
  sides.forEach((s, side) => {
    let any = false;
    for (const p of s.players) {
      if (!(p.slot >= 0 || p.slot === -3) || !p.treat) continue;
      any = true;
      if (p.mustLeave) {
        if (p.slot >= 0) { emit({ kind: 'carriedOff', id: p.id, mode: s.subsLeft ? -1 : -2 }); p.prevSlot = p.slot; p.slot = -2; }
        else emit({ kind: 'carriedOff', id: p.id, mode: 0 });
        p.minuteInjured = cappedMinute(clock, periodEnd);
      } else {
        const r = rand(4);
        emit({ kind: 'continues', id: p.id, comment: r === 0 || p.injuredBy !== null });
      }
      p.treat = false;
    }
    if (any && s.aiControlled) emit({ kind: s.subsLeft ? 'reselect' : 'rearrange', side: side as Side });
  });
  return acts;
}

/** sub_6cda20 efter et rødt kort (engine+0 = 0 og ingen ventende hændelser +0x1a3): +0x23++, +0x21 = minuttet, 6cdd50(p, −3), slot −3;
 *  for et computerhold: keeper udvist og udskiftninger tilbage → genvalg(keeperOut = true); ellers omrokering og genvalg(false), og
 *  keeperen findes igen. lastChange = clock; 6bbb60; 6bbf60. (sikker) */
export function afterSendOff(wasKeeper: boolean, subsLeft: number): ('reselectKeeper' | 'rearrange' | 'reselect')[] {
  return wasKeeper && subsLeft ? ['reselectKeeper'] : ['rearrange', 'reselect'];
}
