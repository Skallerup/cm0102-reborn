// Originalens ligakampprogram – hvem der mødes i hvilken runde (League::create_fixtures 0x6835c0, 19/11-2026):
//
//   1. 0x6844b0 (thiscall(T, c), c = antal klubber rundet op til lige): tabellen T[1..c][1..c−1] – T[i][r] = modstanderen i runde r (> 0 og < 0
//      giver hjemme/ude sammen med benet og årets paritet, se 4). Første løkke: hold 1..c−1 mod hold c (runde c−1, 2, 4 … – 0x684533), anden løkke
//      fra hold c−1 ned til 2 de resterende par (skiftevis fortegn).
//   2. 0x686a70 (thiscall(c)) – ikke for turneringerne [0x9cf79c]/[0x9cf7a4] (404/406): r = rand(30000) + 1 (spillets tal), srand(frø + året +0x40)
//      og n byt af to tilfældige klubrækker med C-bibliotekets rand (0x946a04: MSVC – (rand()·n) / 0x8000), så srand(r). Spillets frø [0xdd7120]
//      er kørslens -seed (oraklet: 1) – ombytningen er den samme for samme frø og år. Så (uden flaget +0xd9 & 0x100): Skotlands Premier League
//      (turnering [0x9cf5dc] = 34) lægger Celtic/Rangers ([0x9d0118] 652 / [0x9d011c] 1551) på plads 0 og c/2 (rand(2) vælger hvem), derefter
//      klubber med samme stadion (club +0x69) og dernæst stadioner, der er hinandens nabostadion (stadion +0x48 = stadium.dat +72) parvis på plads
//      s og s + c/2 (Berger-tabellens to halvdele – aldrig hjemme samme dag), resten på de ledige pladser i rækkefølge.
//   3. 0x68a030 (cdecl(forrige række, &tilstand, turnering, n, +0x3c, rækker +0xa9, flag +0xd9)): skemarækken for næste runde – +0x3c < 2 eller
//      n < 8 eller flag & 0x40 → forrige + 1; flag & 0x80 → +1 med midten/slutningen byttet; ellers (England m.fl., flag 3) blokke: fra en række
//      < rækker − 5 springer rand(4) ≥ 2 til +3, −1, −1, +3 (tre runder i omvendt orden), ellers +1 (rundt).
//   4. Runde k = 1..+0x3c·(c−1): Berger-runde b = k mod (c−1) (0 → c−1), ben q = ⌊(k−1)/(c−1)⌋ & 1; for hold t = 1..n med T[t][b] ≠ 0: modstanderen
//      o = |T[t][b]|, T[o][b] = 0, og hjemmeholdet efter (fortegn, q, (år + (s8)+0x44) & 1) – 0x683b56–0x683c13. Ligaens +0x24 (et stadion, der
//      bytter hjemme/ude) er −1 for alle ligaklasser (konstruktørerne skriver den ikke).
// Klassernes +0xd9 (League-konstruktøren 0x682200: 3; klassernes opsætning 0x41e9e0 m.fl. – CM_LEAGUE_FLAGS) og +0x44 (0xff for en liga uden etaper).
// Klubrækkernes rækkefølge før ombytningen: ligaens klubber efter klub-id (databasens orden) – kontrolleret mod oraklets kampprogram 14/7-2001.

/** MSVC's rand (0x946a04) med srand (0x9469fa) */
export class MsRand {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0; }
  next(): number {
    this.s = (Math.imul(this.s, 214013) + 2531011) >>> 0;
    return (this.s >>> 16) & 0x7fff;
  }
}

/** ligaklassernes +0xd9 (opsætningsfunktionerne) – resten har League-konstruktørens 3 */
export const CM_LEAGUE_FLAGS: Record<string, number> = {
  CM0: 0x43, CM65: 8, CM11: 0x83, CM12: 0x83, CM52: 0x43, CM53: 0x43, CM63: 0x41, CM69: 8,
};

/** 0x6844b0: T[i][r] (i 1..c, r 1..c−1) */
export function cmBergerTable(c: number): number[][] {
  const T: number[][] = [];
  for (let i = 0; i <= c; i++) T.push(new Array(c).fill(0));
  const half = (c / 2) | 0;
  let esi = c - 1;
  for (let edi = 1; edi < c; edi++) {
    if (edi <= half) { T[edi][esi] = c; T[c][esi] = -edi; } else { T[edi][esi] = -c; T[c][esi] = edi; }
    esi = esi === c - 2 ? 1 : esi === c - 1 ? 2 : esi + 2;
  }
  for (let b = c - 1; b >= 2; b--) {
    let odd = ((c - 1 - b) & 1) !== 0;
    let r = b - 1;
    for (let s = 1; s <= c; s++) {
      if (T[s][r] === 0) {
        if (odd) { T[s][r] = b; T[b][r] = -s; } else { T[s][r] = -b; T[b][r] = s; }
        odd = !odd;
      }
      r = r === c - 1 ? 1 : r + 1;
    }
  }
  return T;
}

export interface CmPairOpts {
  comp: number;               // turneringens id (club_comp)
  clubs: number[];            // klubrækkerne i oprettelsesrækkefølgen
  year: number;               // +0x40
  legs: number;               // +0x3c
  rows: number;               // +0xa9 (skemaets rækker)
  flags: number;              // +0xd9
  b44?: number;               // +0x44 (s8), −1 for en liga uden etaper
  seed: number;               // [0xdd7120]
  stadium: (club: number) => number | undefined;   // club +0x69 (stadion-id)
  near: (stadium: number) => number | undefined;   // stadion +0x48 (nabostadionets id)
  rand: (n: number) => number;                     // spillets rand (0x90cfc0)
}

/** 0x686a70: klubrækkernes rækkefølge (c = antal rundet op til lige) */
export function cmShuffleEntries(o: CmPairOpts): number[] {
  const n = o.clubs.length, c = n + (n & 1), E = o.clubs.slice();
  o.rand(30000);
  const ms = new MsRand(o.seed + o.year);
  for (let i = 0; i < n; i++) {
    const a = Math.floor((ms.next() * n) / 0x8000), b = Math.floor((ms.next() * n) / 0x8000);
    const t = E[a]; E[a] = E[b]; E[b] = t;
  }
  // (flag 0x100: klasserne placerer selv klubberne via vtable +0xa8/+0xac – ingen ligaklasse har det)
  const half = (c / 2) | 0, lim = (n / 2) | 0;
  const out: (number | undefined)[] = new Array(n).fill(undefined);
  const A = new Array(Math.max(n, c)).fill(false), B = new Array(n).fill(false);
  let s = 0;
  if (o.comp === 34) {
    const i1 = E.indexOf(652), i2 = E.indexOf(1551);
    if (i1 >= 0 && i2 >= 0) {
      const [x, y] = o.rand(2) ? [i1, i2] : [i2, i1];
      out[0] = E[x]; out[half] = E[y]; A[half] = A[0] = true; B[i1] = B[i2] = true; s = 1;
    }
  }
  const st = (k: number) => o.stadium(E[k]);
  // 0x686ec5: samme stadion (et manglende stadion springer kun den anden klub over)
  for (let i = 0; i < n - 1; i++) {
    if (B[i]) continue;
    for (let j = i + 1; j < n; j++) {
      if (B[j]) continue;
      const a = st(i), b = st(j);
      if (a === undefined || b === undefined || a !== b) continue;
      if (s >= lim) break;                                              // 0x686f7a: fejlbesked, klubben springes over
      out[s] = E[i]; out[s + half] = E[j]; A[s + half] = A[s] = true; B[j] = B[i] = true; s++;
      break;
    }
  }
  // 0x6870b4: nabostadioner (et manglende stadion afbryder søgningen for klubben i)
  for (let i = 0; i < n - 1; i++) {
    if (B[i]) continue;
    for (let j = i + 1; j < n; j++) {
      if (B[j]) continue;
      const a = st(i), b = st(j);
      if (a === undefined || b === undefined) break;
      if (o.near(a) !== b && o.near(b) !== a) continue;
      if (s >= lim) break;
      out[s] = E[i]; out[s + half] = E[j]; A[s + half] = A[s] = true; B[j] = B[i] = true; s++;
      break;
    }
  }
  // 0x6872b1: resten på de første ledige pladser
  for (let i = 0; i < n; i++) {
    if (B[i]) continue;
    let k = 0;
    while (k < n && A[k]) k++;
    if (k >= n) continue;
    out[k] = E[i]; A[k] = true; B[i] = true;
  }
  return out.map((x, k) => x ?? E[k]);
}

/** 0x68a030: næste skemarække */
export function cmNextRow(prev: number, state: { s: number }, o: Pick<CmPairOpts, 'comp' | 'legs' | 'rows' | 'flags' | 'rand'>, n: number): number {
  const R = o.rows;
  if (o.comp === 326) return prev === 2 ? 4 : prev === 5 ? 3 : prev + 1;
  if (o.legs < 2 || n < 8 || o.flags & 0x40) return prev + 1;
  if (o.flags & 0x80) {
    const c = prev + 1;
    return c === ((R / 2) | 0) ? R - 1 : c === R ? (R / 2) | 0 : c;
  }
  const wrap = (c: number) => (c < R ? c : c - R);
  switch (state.s) {
    case 1: state.s = 2; return prev - 1 >= 0 ? prev - 1 : R - 1;
    case 2: state.s = 3; return prev - 1 >= 0 ? prev - 1 : R - 1;
    case 3: state.s = 0; return wrap(prev + 3);
    default:
      if (prev < R - 5 && o.rand(4) >= 2) { state.s = 1; return wrap(prev + 3); }
      return wrap(prev + 1);
  }
}

export interface CmPair { row: number; home: number; away: number }

/** 0x6835c0's kampe (rækken = skemaets række, datoen og tidspunktet derfra) i oprettelsesrækkefølgen */
export function cmLeaguePairs(o: CmPairOpts): CmPair[] {
  const n = o.clubs.length, c = n + (n & 1);
  const T = cmBergerTable(c);
  const E = o.comp === 404 || o.comp === 406 ? o.clubs.slice() : cmShuffleEntries(o);
  const par = (o.year + (o.b44 ?? -1)) & 1;
  const out: CmPair[] = [];
  const state = { s: 0 };
  let row = -1;
  for (let k = 1; k <= o.legs * (c - 1); k++) {
    row = cmNextRow(row, state, o, n);
    const b = k % (c - 1) || c - 1;
    const q = Math.floor((k - 1) / (c - 1)) & 1;
    for (let t = 0; t < n; t++) {
      const code = T[t + 1][b];
      if (!code) continue;
      const opp = Math.abs(code) - 1;
      // 0x683b56–0x683c13: hjemme = modstanderen, når (fortegn > 0) XOR q XOR paritet … (tabellen i noterne)
      const pos = code > 0;
      const oppHome = q === 0 ? (pos ? par === 0 : par !== 0) : (pos ? par !== 0 : par === 0);
      T[opp + 1][b] = 0;
      if (opp < 0 || opp > n - 1) continue;
      const [h, a] = oppHome ? [opp, t] : [t, opp];
      out.push({ row, home: E[h], away: E[a] });
    }
  }
  return out;
}
