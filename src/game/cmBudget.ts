// CM 01/02: Finance::get_transfer_budget 0x598800 (mekanisk oversat, cmGen/f_598800.ts) på spillets hukommelse – klubbens Transfer Funds i ægte
// tilstand med den originale database. Bruges ved spilstart (newgame.ts) og ved sæsonens nye budget (finance.ts newSeasonBudgets).
// Argumenterne er de samme som originalens kaldere (0x83b6e0/0x6a4f80: (0, 0, 0, 1, 0) – uden spiller, uden klausul, med kontrollen "1").
import type { GameState } from './types';
import { buildWantMem } from './cmContractGame';
import { GEN } from './cmGen/index';
import { ensureImpls } from './cmGen/impls';
import { cmActive } from './cmPlayerData';
import { cmKnowLevel } from './cmKnow';

const GBP = 0.86;

/** transferbudgettet i £ for en klub (null uden for ægte tilstand/uden finansposten) – 64 bit i originalen, her de nederste 32 + fortegn */
export function cmTransferBudget(g: GameState, cid: number): number | null {
  const v = cmTransferBudgetRaw(g, cid);
  return v === null ? null : Math.max(0, v);
}
/** som cmTransferBudget, men med originalens fortegn (negativ i gæld) – begivenhederne 0x59ed70 vælger nyhedens tekst efter det */
export function cmTransferBudgetRaw(g: GameState, cid: number): number | null {
  if (!cmActive(g) || !g.clubs[cid]) return null;
  const M = buildWantMem(g, [cid]);
  const fin = M.W.finOf(cid);
  if (!fin) return null;
  // felterne, 0x598800 læser ud over lønportenes: træningsanlægget +0x7f, +0x6d (0 for "Bright…"/"Wimble…"), stadionets kapacitet +0x3c
  const club = M.W.clubOf(cid), m = M.c.m, cl = g.clubs[cid], cr = g.cmCrowd?.[cid];
  m.w8(club + 0x7f, cl.facilities);
  m.w8(club + 0x6d, /^(Bright|Wimble)/.test(cl.name) ? 0 : 1);
  const sa = m.u32(club + 0x69);
  if (sa && cr && cr[3] >= 0) m.w32(sa + 0x3c, cr[5]);
  ensureImpls();
  return GEN[0x598800](M.c, fin, [0, 0, 0, 1, 0]) | 0;
}

/** i spillets valuta (€) */
export function cmTransferFunds(g: GameState, cid: number): number | null {
  const v = cmTransferBudget(g, cid);
  return v === null ? null : v / GBP;
}

/** Budskærmens bestyrelseslinje (transfer_screens 0x8e9760, 0x8ea28e–0x8ea3d5): 0x598800(spiller, 0, &begrænset, 1, 0) – med attribute masking
 *  trækker 0x598800 (0x5994c0–0x5997d8) budgettet ned for en spiller, menneskets manager ikke kender fuldt: kendskabet 0x5b02f0 (cmKnow.ts – 0 intet,
 *  1 meget lidt, 2 noget, 3 fuldt) giver et loft af klubbens omdømme (+0x80)² × 0,01/0,02/0,04 (niveau 0/1/2; 0,005/0,01 for 0/1, når landets
 *  +0x85 < 9 og omdømmet under 4250), ganget med managerens omdømme/klubbens (ikke-spillerpost +0xa, klemt til 0,1..1) og landets +0x85 × 0,05
 *  (klemt til 0,25..1); budgettet bliver loftet + 1/8 af resten (højst 1,75 × loftet, fra £125.000). Niveau 3 = hele budgettet. Linjen vælges af
 *  niveauet alene (0x8ea327): 1 "know very little", 2 "only allow", 3 "will allow", 0 "don't know anything"; beløbet 0 → free-transfer-teksterne
 *  (0xa9e5e4/0xa9e6d0/0xa9e7b8). Beløbet i linjen er 0x598800's svar. */
export interface CmBidBudget { budget: number; level: number; limited: boolean }
export function cmKnowledgeLevel(g: GameState, p: import('./types').Player): number {
  return cmKnowLevel(g, p);
}
export function cmBidBudget(g: GameState, p: import('./types').Player, buyer: number): CmBidBudget | null {
  if (!cmActive(g) || !g.clubs[buyer] || !p.club) return null;
  const level = cmKnowledgeLevel(g, p);
  const KOBJ = 0x6a000000, OUTF = 0x6a000100, MNP = 0x6a000200;
  const M = buildWantMem(g, [buyer, p.club], {
    useLog: (adr) => adr === 0x600a50 || adr === 0x849f00 || adr === 0x5afde0 || adr === 0x5b02f0,
    call: (adr) => (adr === 0x5afde0 ? KOBJ : adr === 0x5b02f0 ? level : undefined),
  });
  const fin = M.W.finOf(buyer);
  let st = M.W.staffOf(p);
  if (!st) st = M.W.addGenerated(p, 0);
  if (!fin || !st) return null;
  const club = M.W.clubOf(buyer), m = M.c.m, cl = g.clubs[buyer], cr = g.cmCrowd?.[buyer];
  m.w8(club + 0x7f, cl.facilities);
  m.w8(club + 0x6d, /^(Bright|Wimble)/.test(cl.name) ? 0 : 1);
  const sa = m.u32(club + 0x69);
  if (sa && cr && cr[3] >= 0) m.w32(sa + 0x3c, cr[5]);
  // menneskets manager (+0xcf): ikke-spillerposten med hans aktuelle omdømme +0xa (0x599618–0x599683: omdømme / klubbens, klemt 0,1..1)
  const ms = m.u32(club + 0xcf), rep = g.manager.cmRep?.[1];
  if (ms && rep !== undefined && !m.u32(ms + 0x69)) { m.w32(ms + 0x69, MNP); m.w16(MNP + 0xa, rep); }
  const old = m.u32(0xae2a60);
  m.w32(0xae2a60, KOBJ); m.w32(OUTF, 0);
  ensureImpls();
  let v: number;
  try { v = GEN[0x598800](M.c, fin, [st, 0, OUTF, 1, 0]) | 0; } finally { m.w32(0xae2a60, old); }
  const limited = m.u32(OUTF) === 1;
  return { budget: Math.max(0, v) / GBP, level, limited };
}

/** bestyrelseslinjen på budskærmen (0x8ea327–0x8ea3c8): kendskabet vælger teksten, beløbet 0 free-transfer-varianten */
export function cmBoardLine(b: CmBidBudget): string {
  const zero = b.budget < 1;
  if (b.level === 3) return zero ? 'cl.bid.boardFree' : 'cl.bid.board';
  if (b.level === 2) return zero ? 'cl.bid.boardFree' : 'cl.bid.boardOnly';
  if (b.level === 1) return zero ? 'cl.bid.boardFreeLittle' : 'cl.bid.boardLittle';
  return zero ? 'cl.bid.boardFreeNothing' : 'cl.bid.boardNothing';
}
