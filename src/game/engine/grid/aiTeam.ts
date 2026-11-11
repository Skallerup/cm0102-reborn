// Computerholdets opstilling før kampen som i originalen: taktikvalget 0x6e0230 (aiTacticChoice.ts – en af de 45 faste taktikker:
// 17 "Set To Default" + 28 CM3_TACTICS) og fordelingen af spillerne på taktikkens pladser 0x6e2000 (subs.ts assignPlayers, med
// pladsfaktoren 0x6e2f20 P og kvaliteten). Kaldes af createGridMatch for computerstyrede hold (ctx.ai).
// *estimeret*: spillerpostens bytes +0x30/+0x3b/+0x45 findes ikke i vores data (0/0/10); kvaliteten = estimateQuality (CA, omdømme);
// taktikhistorikken (0x896290) starter tom i hver kamp, når kalderen ikke giver den.

import type { Player } from '../../types';
import { AI_TACTIC_LIST, chooseAiTactic, estimateQuality, type AiTacticEntry, type ChoiceManager, type ChoicePlayer, type TacticStat } from './aiTacticChoice';
import { assignPlayers, combineScore, positionFactor, type PositionRecord } from './subs';

/** spillerens 12 positionsevner som spillerposten +0x0f..+0x1a: GK SW D DM M AM F WB, højre (+0x17, maske 0x800), venstre (+0x18, 0x80),
 *  midt (+0x19, 0x200), fri rolle (+0x1a). Vores Player.side er [L, C, R]. */
export function recordRatings(p: Player): number[] {
  return [...p.pos.slice(0, 8), p.side[2], p.side[0], p.side[1], 1];
}
function posRecord(r: number[]): PositionRecord {
  return { gk: r[0], sw: r[1], d: r[2], dm: r[3], m: r[4], am: r[5], f: r[6], wb: r[7], r: r[8], l: r[9], c: r[10], free: r[11], foot30: 0, foot3b: 0 };
}

export interface AiTeamInput {
  /** kandidaterne: truppen uden skadede/udelukkede (pick_teams liste) */
  squad: Player[];
  /** managerens taktiske egenskaber (Staff.tac: [Attacking, Directness, Free Roles, Marking, Offside, Pressing, Tactics, yndlingsformation]) */
  tac: number[] | null;
  /** computerens tilstand før kampen (0x6df460 med inMatch = false) */
  mode: number;
  /** klubbens omdømme i originalens skala (club +0x80, 0–10000) */
  rep: number;
  stats?: TacticStat[];
}
export interface AiTeamResult { index: number; entry: AiTacticEntry; presetIndex: number; lineup: (number | null)[] }

export function aiTeamSetup(o: AiTeamInput): AiTeamResult {
  const players: ChoicePlayer[] = o.squad.map((p) => ({
    ratings: recordRatings(p), b30: 0, b3b: 0,
    quality: estimateQuality({ ca: p.ca, rep: (p.rep ?? 50) * 100, b45: 10, condition: Math.round((p.condition ?? 100) * 100) }),
  }));
  const manager: ChoiceManager | null = o.tac ? { attacking: o.tac[0], freeRoles: o.tac[2], marking: o.tac[3], offside: o.tac[4], pressing: o.tac[5], favourite: o.tac[7] } : null;
  const { index } = chooseAiTactic({ players, mode: o.mode, manager, stats: o.stats, divisor: Math.max(8 * o.rep, 2000) });
  const entry = AI_TACTIC_LIST[index];
  const recs = players.map((p) => posRecord(p.ratings));
  // 0x6e2000: hver plads j (taktikkens maske/angrebsmaske) får den bedste kandidat i; konflikter løses som i originalen
  const pick = assignPlayers(players.length, 11, (j, i) => combineScore(positionFactor(recs[i], entry.masks[j], entry.masks2[j], 0), players[i].quality, 0));
  return { index, entry, presetIndex: entry.preset, lineup: pick.map((i) => (i === null ? null : o.squad[i].id)) };
}
