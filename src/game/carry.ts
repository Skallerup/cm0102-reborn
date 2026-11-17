// Modulernes tilstand, der lever videre fra dag til dag uden at ligge i GameState (som originalens globale variabler: kampens knocks, en
// sværhed fra forrige kald, club +0x5b …) og caches, hvis indhold afhænger af forløbet (ikke kun af GameState). Den følger med spillet,
// når det kopieres eller gemmes, så et kopieret/gemt og indlæst spil spiller præcis som det samme spil uden afbrydelse:
//   - captureCarry() lægges i GameState.cmCarry ved gem (snapshot.ts), i dagens/nyt spils Web Worker (ui/dayWorker.ts, newGameWorker.ts),
//     i scripts/lib/snapshot.ts og tests/helpers/gameCache.ts;
//   - setGame (state.ts) lægger den tilbage (restoreCarry) – og uden cmCarry (gamle gemte spil, nyt spil) nulstilles alt til en ny proces'
//     tilstand, så intet lækker fra et spil til det næste i samme fane.
// Kontrol: scripts/snap-verify.ts (kopi/gem midt i forløbet = uafbrudt) og tests/snapCarry.test.ts.
type Carry = { get: () => unknown; set: (v: unknown) => void; reset: () => void };
const CARRY = new Map<string, Carry>();
export const NO_CARRY: unique symbol = Symbol('no-carry');
/** `get` giver en struktureret kopierbar (og JSON-sikker) værdi – eller `NO_CARRY` (intet at gemme: `reset` giver samme tilstand).
 *  `reset` = tilstanden i en ny proces. */
export function registerCarry<T>(name: string, get: () => T | typeof NO_CARRY, set: (v: T) => void, reset: () => void): void {
  CARRY.set(name, { get, set: set as (v: unknown) => void, reset });
}
export function captureCarry(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, c] of CARRY) { const v = c.get(); if (v !== NO_CARRY) out[k] = v; }
  return out;
}
/** læg tilstanden tilbage; moduler uden en gemt værdi nulstilles */
export function restoreCarry(s: Record<string, unknown> | undefined): void {
  for (const [k, c] of CARRY) {
    if (s && k in s) c.set(s[k]);
    else c.reset();
  }
}
export const carryNames = (): string[] => [...CARRY.keys()].sort();
