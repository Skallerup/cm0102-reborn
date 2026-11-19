// Player Search-filteret "Interested" (Filters for Player Search: "Any" / " Interested" – strengene 0xa7fd50/0xa7fd70, knapperne bit 0x8000/
// 0x10000 i filterets +4, dialogen 0x8178b8–0x8179d0) som originalen: filterfunktionen 0x807450, grenen 0x807e23–0x807ecc:
//   – ingen menneskeklub (managerens +0x39) → ikke med
//   – spiller (staff +0x61): spillerpostens omdømme +0xd > klubbens +0x80 + 5000 → ikke med
//     ellers Shortlist_Manager 0x846920(staff, klub, 1, 0, 1, NULL) – under 3,15 ([0x968e58]) → ikke med
//   (ikke-spillere: 0x844780 med +0xc mod +0x80 + 5000 – Staff Search bruger stadig staff.ts' willJoin)
// En CM-database i ægte tilstand (cmLogic – den originale og 2026/27, pengene via cmMoney.ts); ellers spillets eget skøn (transfers.ts playerInterest).
// Hukommelsen er ønskelisternes (buildSlMem: alle klubber og de klubløse) – bygget én gang pr. dag og klub, svarene gemt pr. spiller.
// 0x846920 trækker ingen tilfældige tal og skriver kun til sin ud-parameter (her NULL), så spillets forløb er uberørt.
import type { GameState, Player } from './types';
import { onGameSwitch } from './state';
import { cmLogic, cmRand } from './cmPlayerData';
import { buildSlMem, type SlMem } from './cmShortlistGame';
import { slCall, slmOf } from './cmShortlist';

/** [0x968e58] */
export const SEARCH_INTEREST_MIN = 3.15;

let cache: { g: GameState; date: string; club: number; S: SlMem | null; ans: Map<number, number> } | null = null;
onGameSwitch(() => { cache = null; });

function day(g: GameState, club: number) {
  if (!cache || cache.g !== g || cache.date !== g.date || cache.club !== club) cache = { g, date: g.date, club, S: null, ans: new Map() };
  return cache;
}

/** 0x846920(staff, klub, 1, 0, 1, NULL) for menneskets klub – −1, når spilleren ikke er i hukommelsen; null uden for cmActive */
export function cmSearchInterestValue(g: GameState, p: Player, clubId = g.userClub): number | null {
  if (!cmLogic(g) || !g.clubs[clubId]) return null;
  if (p.club === clubId) return SEARCH_INTEREST_MIN;
  const C = day(g, clubId);
  const hit = C.ans.get(p.id);
  if (hit !== undefined) return hit;
  if (!C.S) C.S = buildSlMem(g, { noStale: true });
  const M = C.S.M, m = M.c.m;
  const st = M.W.staffOf(p), club = M.W.clubOf(clubId);
  let x = -1;
  if (st && club) {
    const pl = m.u32(st + 0x61);
    // 0x807e57: spillerens omdømme +0xd mod klubbens +0x80 + 5000 (0x1388)
    if (pl && m.s16(pl + 0xd) > m.s16(club + 0x80) + 5000) x = 0;
    else {
      M.setRand(cmRand(g.seed ?? 0, p.id, clubId, 0x807450));
      x = slCall(M.c, 0x846920, slmOf(m), st, club, 1, 0, 1, 0);
    }
  }
  C.ans.set(p.id, x);
  return x;
}

/** "Interested": vil spilleren skifte til menneskets klub? (originalen i ægte tilstand med den originale database, ellers null) */
export function cmSearchInterested(g: GameState, p: Player, clubId = g.userClub): boolean | null {
  const x = cmSearchInterestValue(g, p, clubId);
  return x === null ? null : x >= SEARCH_INTEREST_MIN;
}
