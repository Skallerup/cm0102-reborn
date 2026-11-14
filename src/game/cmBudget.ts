// CM 01/02: Finance::get_transfer_budget 0x598800 (mekanisk oversat, cmGen/f_598800.ts) på spillets hukommelse – klubbens Transfer Funds i ægte
// tilstand med den originale database. Bruges ved spilstart (newgame.ts) og ved sæsonens nye budget (finance.ts newSeasonBudgets).
// Argumenterne er de samme som originalens kaldere (0x83b6e0/0x6a4f80: (0, 0, 0, 1, 0) – uden spiller, uden klausul, med kontrollen "1").
import type { GameState } from './types';
import { buildWantMem } from './cmContractGame';
import { GEN } from './cmGen/index';
import { ensureImpls } from './cmGen/impls';
import { cmActive } from './cmPlayerData';

const GBP = 0.86;

/** transferbudgettet i £ for en klub (null uden for ægte tilstand/uden finansposten) – 64 bit i originalen, her de nederste 32 + fortegn */
export function cmTransferBudget(g: GameState, cid: number): number | null {
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
  const v = GEN[0x598800](M.c, fin, [0, 0, 0, 1, 0]) | 0;
  return Math.max(0, v);
}

/** i spillets valuta (€) */
export function cmTransferFunds(g: GameState, cid: number): number | null {
  const v = cmTransferBudget(g, cid);
  return v === null ? null : v / GBP;
}
