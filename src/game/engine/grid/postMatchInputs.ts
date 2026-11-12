// Kamprapportens MATCH_PLAYER-felter (postMatch.ts PmPlayer) af gittermotorens tilstand efter slutfløjtet – fælles for adapteren og
// låsetrinsscriptet (scripts/lockstep-post.ts kontrollerer dem felt for felt mod oraklets MATCH_PLAYER-dump ved 0x6d26b0's indgang).
import type { GP, GridMatch } from './gridMatch';
import type { PmPlayer, PmStaff } from './postMatch';

/** +0x1f/+0x20/+0x21/+0x22 af udskiftningernes bytes (matchSubs.ts); +0x23 (røde kort, 0x6cda20 tæller op) = udvist */
export function pmPlayerOf(g: GridMatch, q: GP, staff: PmStaff | null): PmPlayer & { slot: number } {
  const st = g.subState(q);
  const minRed = st?.minuteRed ?? -1;
  const rb = q.recRaw ? (((q.recRaw[0xb] & 0xff) | ((q.recRaw[0xc] & 0xff) << 8)) << 16) >> 16 : null;
  return {
    staff, recRb: rb ?? (staff?.rec ? staff.rec.rb : null),
    goals: q.goals & 0xff, pensTaken: q.pensTaken & 0xff, penGoals: q.penGoals & 0xff, b10: q.penGoalsWon & 0xff, morale: q.morale,
    ratingByte: q.b1b, minOn: st?.minuteOn ?? -1, minOff: st?.minuteOff ?? -1, minRed, minInj: st?.minuteInjured ?? -1,
    reds: minRed >= 0 ? 1 : 0, yellows: q.yellows & 0xff, w31: q.w31, rating: q.rating, condition: q.condition, agitation: q.agitation, slot: q.slot,
  };
}

/** 0x6d4a20's inddata: engine+0xf5ba = dommerens ord (engine+0xf5b2 +8) – portens humør (pass.ts) plus linjevogterens ændringer (0x6ea760
 *  skriver det samme ord), 16 bit; holdblokkenes +0xf (Σ +0x23, de røde) og +0x10 (Σ +0x24, de gule) som sub_6ce460 summerer dem for de 20
 *  (0x6ce5c6–0x6ce5e0 – gridMatch.ts' watchedStats nulstiller +0xf uden at summere: *afvigelse* der, derfor regnet her af spillerne). */
export function refereeInputs(g: GridMatch, sides: [GP[], GP[]]): { mark: number; reds: [number, number]; yellows: [number, number] } {
  const sum = (s: number, f: (p: PmPlayer) => number) => sides[s].reduce((a, q) => (a + f(pmPlayerOf(g, q, null))) & 0xff, 0);
  return {
    mark: ((g.m.official.mood + g.m.linesmanMark) << 16) >> 16,
    reds: [sum(0, (p) => p.reds), sum(1, (p) => p.reds)],
    yellows: [sum(0, (p) => p.yellows), sum(1, (p) => p.yellows)],
  };
}

/** spillerne pr. side i indeksrækkefølge (MATCH_PLAYER +0x2e) – 20 pladser */
export function pmSides(g: GridMatch): [GP[], GP[]] {
  return [0, 1].map((s) => g.m.gp.filter((q) => q.side === s)) as [GP[], GP[]];
}
