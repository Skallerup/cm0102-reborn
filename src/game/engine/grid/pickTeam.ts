// Computerens holdudtagelse før kampen MATCH_MAN::pick_team 0x6dbc50(modstander, 2) (cm0102.exe 3.9.68) og den fulde fordeling
// 0x6e2000 (med bænkpladserne – grenen a5 > 0 og n < k, som subs.ts' assignPlayers ikke har). Afkodet 11/11-2026; noten
// ~/cm0102-engine/notes/6dbc50-pick-team.md har adresserne. Kontrolleret mod den instrumenterede originals pick-spor (scripts/pick-trace-eval.ts).
//
//   0x6dc9f1–0x6dcd7a  kandidaterne: truppen i klubbens rækkefølge uden skadede (0x62c400 = 2), udelukkede (0x55d270), på landsholdet (0x7757d0),
//                      ikke spilleberettigede (0x8cf5e0), udlejede (0x4cf6d0/0x4cf5a0) og under 16 år i turneringer med +0x69 > 10 – kalderen filtrerer
//   0x6dcd90–0x6dceb1  flagene og de tilfældige tal (pickFlags)
//   0x6dced9           anføreren 0x6e1940 over kandidaterne (roleScore.ts chooseCaptain) → hold +0x3b
//   0x6dcf5f–0x6dd035  dødboldsskytterne (flag 0x80000): de tre med højest verdens- + nuværende omdømme → hold +6/+0xa/+0xe
//   0x6dd057           taktikken 0x6e0230 (aiTacticChoice.ts) med kandidaterne
//   0x6dd07f–0x6dd2c3  pladserne: de 11 fra taktikken; bænkpladserne (11 .. 10 + turneringens +0x4d & 0xf) får rand(10) → D/M/F (0–2 D, 3–5 M,
//                      6–9 F), plads 12 målmand, når bænken har mindst 4, ellers når rand(10) = 0
//   0x6dd37e           0x6e2000(kandidater, n, pladser, 11, bænk, …) → ud[0..10] = de 11, ud[11..] = bænken i pladsrækkefølge
//   0x6dd6bf           anføreren igen over de 11 → 0x897760
// Ikke porteret: rotationen før en vigtigere kamp (0x6dbdc4–0x6dc59f, hold +0x1a ≠ 3 – kræver kampprogrammet; gælder klubber med omdømme
// ≥ 6000 og over 30 spillere) og turneringens udtagelsesregler 0x8cf880/0x6e8910 (udlændingekvoter – ingen i de engelske 2001-turneringer).

import { assignPhase12, memoScore, type ScoreFn } from './subs';

export type Rand = (n: number) => number;

// ---------------------------------------------------------------- flagene (0x6dcd90)

export interface PickFlagInput {
  /** 0x53b900(klub): landshold */
  national: boolean;
  /** hold+0x19: menneskets hold med assistent */
  assisted?: boolean;
  /** turneringens type (fixture+0x37 → +0x3a); 1 og 9 trækker rand(2000) + rand(−4000) først */
  compType: number;
  ownRep: number; oppRep: number;
  /** hold+0x1a (3 = ingen rotation) */
  b1a?: number;
  /** turneringens id ≤ −1, eller 0x48f150(turnering, klub) ≠ 0 – klubben hører til turneringen (ligakamp) */
  leagueMember: boolean;
  /** hold+0x16 (rotationen) */
  b16?: boolean;
}
/** 0x6dcd90–0x6dceb1: grundflag 0xca0ca (landshold 0x208a09c) og de tilfældige tal (sikker) */
export function pickFlags(rand: Rand, f: PickFlagInput): number {
  let F = f.national ? 0x208a09c : 0xca0ca;
  const diff = f.ownRep - f.oppRep;
  done: {
    if (f.assisted) { F |= 0x20100; F ^= 0x80000; break done; }
    if (f.compType === 1 || f.compType === 9) {
      const r = rand(2000) + rand(-4000);
      if (diff > r) { F |= 0x100; break done; }
    }
    const r = rand(3000) + 3000;
    if (diff > r) { F |= 0x100; if (!f.national) F |= 0x10000; break done; }
    if ((f.b1a ?? 3) === 3 && f.leagueMember) { if (!f.national) F |= 0x10000; break done; }
    F |= 0x100; F ^= 0x80000;
  }
  if (f.b16) F |= 0x800000;
  return F;
}

// ---------------------------------------------------------------- bænkpladserne (0x6dd214–0x6dd2bc)

/** Bænkpladsernes positionsflag: rand(10) pr. plads (0–2 D 4, 3–5 M 0x10, 6–9 F 0x40); plads 12 = målmand (1), når der er over 14 pladser,
 *  ellers når et ekstra rand(10) giver 0 (kun ét målmandsforsøg). Angrebsflag/instruktioner/taktikbyte 0. */
export function benchSlots(rand: Rand, benchSize: number): number[] {
  const total = 11 + benchSize, out: number[] = [];
  let gk = false;
  for (let s = 11; s < total; s++) {
    const r = rand(10);
    if (s === 12 && !gk && (total > 14 || rand(10) === 0)) { out.push(1); gk = true; continue; }
    out.push(r < 3 ? 4 : r < 6 ? 0x10 : 0x40);
  }
  return out;
}

// ---------------------------------------------------------------- 0x6e2000 med bænken

/** 0x6e2000(liste, n, pladser, k, ekstra, ud, flag, …): fordelingen af n kandidater på k pladser og derefter `extra` bænkpladser.
 *  `score(j, i)` = 0x6e2f20 for kandidat i på plads j (0 ≤ j < k + extra, kaldets flag; pladsens egne felter). `benchScore(j', i)` = kaldet i
 *  rekursionen for bænkplads j' (flag | 0x200 – intet sideled; NB originalen giver instruktioner/taktikbyte fra plads j' – ikke k + j' – med, sic).
 *  `gkOf(i)` = kandidatens målmandsevne (+0xf), `slotIsGk(j)` = pladsens flag & 1 (oprydningen når n < k). Returnerer kandidatindekset pr. plads. */
export function assignSquad(n: number, k: number, extra: number, score0: ScoreFn, benchScore: ScoreFn,
  gkOf: (i: number) => number, slotIsGk: (j: number) => boolean): (number | null)[] {
  const out: (number | null)[] = new Array(k + extra).fill(null);
  if (n < 1 || (k === 0 && extra === 0)) return out;
  const score = memoScore(n, k + extra, score0);                                             // (ydelse) deterministisk – husket i en tabel
  const used = new Array(n).fill(0);
  if (n >= k) assignPhase12(n, k, score, out, used);
  else {
    // 0x6e22ea: hver ubrugt kandidat på den første plads, hvor han slår den, der står der (eller den er tom); den fortrængte bliver ubrugt
    let placed = 0, iter = 0;
    while (placed < n && iter < 10000) {
      iter++;
      for (let i = 0; i < n; i++) {
        if (used[i]) continue;
        let bj = -1, bv = 0;
        for (let j = 0; j < k; j++) {
          const v = score(j, i);
          if (bj !== -1 && !(v > bv)) continue;
          const o = out[j];
          if (o !== null && score(j, o) >= v) continue;
          bj = j; bv = v;
        }
        if (bj > -1) {
          const o = out[bj];
          if (o !== null) { used[o] = 0; placed--; }
          out[bj] = i; used[i] = 1; placed++;
        }
      }
    }
    // 0x6e255b: ingen markspiller (GK < 10) i målet, ingen målmand (GK 20) på banen
    for (let j = 0; j < k; j++) {
      const o = out[j]; if (o === null) continue;
      if (slotIsGk(j) ? gkOf(o) < 10 : gkOf(o) === 20) { used[o] = 0; out[j] = null; }
    }
  }
  // 0x6e2a87: bænken af de ubrugte (i listens rækkefølge)
  if (extra > 0) {
    const rest: number[] = [];
    for (let i = 0; i < n; i++) if (!used[i]) rest.push(i);
    const sub = assignSquad(rest.length, extra, 0, (j, i) => benchScore(j, rest[i]), () => 0, (i) => gkOf(rest[i]), (j) => slotIsGk(k + j));
    sub.forEach((x, j) => { out[k + j] = x === null ? null : rest[x]; });
  }
  // 0x6e2b58: ombytninger – for j < k med alle senere pladser (også bænken: byt, når bænkspilleren er bedre på j), højst 100 gennemløb
  for (let pass = 0; pass < 100; pass++) {
    let swapped = false;
    for (let j = 0; j < k && !swapped; j++) {
      const a = out[j]; if (a === null) continue;
      const va = score(j, a);
      for (let j2 = j + 1; j2 < k + extra && !swapped; j2++) {
        const b = out[j2]; if (b === null) continue;
        const vjb = score(j, b);
        if (j2 < k ? vjb + score(j2, a) > va + score(j2, b) : vjb > va) { out[j] = b; out[j2] = a; swapped = true; }
      }
    }
    if (!swapped) break;
  }
  return out;
}

/** 0x6dcf6b–0x6dd035: dødboldsskytterne (kun med flag 0x80000) – tre gange den første med højest (verdens- + nuværende omdømme, word)
 *  over −10000 blandt rigtige spillere, uden de allerede valgte. */
export function setPieceTakers(cands: readonly { worldRep: number; curRep: number; real: boolean }[]): number[] {
  const picked: number[] = [];
  for (let k = 0; k < 3; k++) {
    let best = -1, bv = -10000;
    cands.forEach((c, i) => {
      if (!c.real || picked.includes(i)) return;
      const v = ((c.worldRep + c.curRep) << 16) >> 16;
      if (v > bv) { best = i; bv = v; }
    });
    if (best > -1) picked.push(best);
  }
  return picked;
}
