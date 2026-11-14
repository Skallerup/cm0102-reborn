// Gittercellernes lister engine+0x215e (gittermotoren). Egen fil, så gridMatch.ts og matchSubs.ts kan dele dem uden cirkulær import.
import type { GP, GridMatchState } from './gridMatch';
import { MOVES, olMoved } from './loop';

// ------------------------------------------------------------------ gittercellerne engine+0x215e
// 90 bytes pr. felt (12·x + y): 11 pegere side 0 (+0), 11 side 1 (+0x2c), antallet +0x58/+0x59. Listen er i indsættelsesorden med
// "byt med den sidste" ved udtagning – rækkefølgen bestemmer, hvem der behandles først i 0x6c87e0 og andre feltløkker.
export const cellIx = (x: number, y: number, side: number) => (12 * x + y) * 2 + side;
const onPitch = (x: number, y: number) => x >= 0 && x <= 8 && y >= 0 && y <= 11;
/** feltets liste for siden (tom uden for banen). En tilstand uden lister (testenes håndbyggede kampe) får feltets aktive spillere i m.gp's
 *  rækkefølge */
export function cellList(m: GridMatchState, x: number, y: number, side: number): GP[] {
  if (!onPitch(x, y)) return [];
  if (!m.cells) return (m.gp ?? []).filter((q) => q.active && q.side === side && q.x === x && q.y === y);
  return m.cells[cellIx(x, y, side)];
}
/** udtag af feltets liste (0x6f3a93–0x6f3b19, 0x6f46e9–0x6f47e6, 0x6cdda5–0x6cddec): den sidste flyttes ind på hans plads */
export function cellRemove(m: GridMatchState, q: GP): void {
  if (!m.cells || !(q.cell >= 0)) return;
  const l = cellList(m, q.x, q.y, q.side);
  const last = l.pop();
  if (last && last !== q && q.cell < l.length) { l[q.cell] = last; last.cell = q.cell; }
  q.cell = -1;
}
/** sub_6f46b0 / skridtet 0x6f3a67–0x6f3b9a: ny position – uændret felt rører ikke listerne; ellers ud af den gamle og bagerst i den nye */
export function setPos(m: GridMatchState, q: GP, x: number, y: number): void {
  if (q.x === x && q.y === y) return;
  MOVES.n++;                                                                                  // (ydelse) gridMatch's situation (se _pass)
  olMoved(m, q, q.y, y);                                                                      // (ydelse) loop.ts' offsidelinjer efter turen
  cellRemove(m, q);
  q.x = x; q.y = y;
  if (!m.cells || !onPitch(x, y)) return;
  const l = m.cells[cellIx(x, y, q.side)];
  q.cell = l.length; l.push(q);
}
/** sat ind på banen uden liste (init og indskiftning): bagerst i feltets liste */
export function cellAdd(m: GridMatchState, q: GP): void {
  if (!m.cells || q.cell >= 0 || !onPitch(q.x, q.y)) return;
  const l = m.cells[cellIx(q.x, q.y, q.side)];
  q.cell = l.length; l.push(q);
}

