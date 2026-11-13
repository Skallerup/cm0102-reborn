// Egenskabsfilteret i "Filters for Player Search" / "Filters for Staff Search" (fanen Attributes som i CM 01/02): en minimumsværdi pr.
// egenskab (1 = intet krav). Minimumsværdierne gemmes som en kort tekst ("0:12,5:14" = egenskab nr. 0 mindst 12, nr. 5 mindst 14), så
// filtrene stadig kan sammenlignes og huskes som almindelige værdier.
import { A } from '../../game/attributes';
import { attrRange } from '../../game/scouting';
import type { Player, Staff, StaffAttrs } from '../../game/types';

/** Spillerfilterets 31 egenskaber i originalens rækkefølge (alfabetisk; felterne fyldes skiftevis venstre/højre). "Set Pieces" = snit af
 *  frispark, hjørnespark og straffespark (spillet har dem hver for sig). */
export const FL_ATTRS: { key: string; idx: number[] }[] = [
  'acceleration', 'aggression', 'agility', 'anticipation', 'balance', 'bravery', 'creativity', 'crossing', 'decisions', 'determination', 'dribbling',
  'finishing', 'flair', 'handling', 'heading', 'influence', 'jumping', 'longShots', 'marking', 'offTheBall', 'pace', 'passing', 'positioning',
  'reflexes', 'setPieces', 'stamina', 'strength', 'tackling', 'teamwork', 'technique', 'workRate',
].map((key) => ({ key, idx: key === 'setPieces' ? [A.freeKicks, A.corners, A.penalties] : [A[key as keyof typeof A]] }));

/** Stabens egenskaber (alfabetisk efter visningsnavn) */
export const SF_ATTRS: (keyof StaffAttrs)[] = ['coaching', 'discipline', 'judgingAbility', 'judgingPotential', 'motivating', 'physio', 'tactics'];

export function parseMins(s: string): Record<number, number> {
  const out: Record<number, number> = {};
  for (const part of s ? s.split(',') : []) { const [i, v] = part.split(':').map(Number); if (v > 1) out[i] = v; }
  return out;
}
export function encodeMins(m: Record<number, number>): string {
  return Object.entries(m).filter(([, v]) => v > 1).sort((a, b) => Number(a[0]) - Number(b[0])).map(([i, v]) => `${i}:${v}`).join(',');
}
export const countMins = (s: string) => Object.keys(parseMins(s)).length;

/** Spillerens værdi (midten af scoutens interval) i en af filterets egenskaber */
export const GK_ATTRS = [A.handling, A.reflexes, A.oneOnOnes];
/** Målmandsegenskaberne (Handling, Reflexes, One on Ones) findes kun for målmænd – markspillere står på 1 (CM 01/02) */
export const gkOnlyMiss = (p: Player, idx: number) => GK_ATTRS.includes(idx) && p.pos[0] < 20;

export function playerAttrMid(p: Player, i: number): number {
  const idx = FL_ATTRS[i].idx;
  if (idx.some((k) => gkOnlyMiss(p, k))) return 1;
  return idx.reduce((sum, k) => { const [lo, hi] = attrRange(p, k); return sum + (lo + hi) / 2; }, 0) / idx.length;
}

export const staffAttrValue = (s: Staff, i: number): number => s.attrs[SF_ATTRS[i]] ?? 0;
