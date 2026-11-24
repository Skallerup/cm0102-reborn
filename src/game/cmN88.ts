// nation +0x88 (0x524d70): de indlæste spillere af nationaliteten – én optælling pr. spil, fælles for bestyrelsen (cmBoardGame.ts 0x844780) og
// regens (cmRegen.ts 0x7abea0). Eget modul (ingen tunge imports), så cmRegen ikke importerer cmBoardGame (cirkulær import).
import type { GameState } from './types';
import { gs } from './state';
import { NO_CARRY, registerCarry } from './carry';

/** nation +0x88: de indlæste spillere af nationaliteten (0x524d70) – én optælling pr. spil */
const n88Cache = new WeakMap<GameState, Record<number, number>>();
export function natPlayers(g: GameState, n: number): number {
  let m = n88Cache.get(g);
  if (!m) { m = {}; for (const p of Object.values(g.players)) if (!p.virtual) m[p.nation] = (m[p.nation] ?? 0) + 1; n88Cache.set(g, m); }
  return m[n] ?? 0;
}
// carry.ts: optællingen sker første gang (i createGame – cmBoardInit), og et gemt/kopieret spil skal bruge den samme, ikke en ny optælling efter
// spilstartens senere trin (fundet 24/11, da udlandets lande med 0x524d70 for alle lande kom under 350-grænsen i 0x7abea0/0x844780)
const gsOrNull = () => { try { return gs(); } catch { return null; } };
registerCarry('cmN88', () => { const g = gsOrNull(); const m = g ? n88Cache.get(g) : undefined; return m ? { ...m } : NO_CARRY; },
  (v: Record<number, number>) => { const g = gsOrNull(); if (g) n88Cache.set(g, { ...v }); }, () => {});
