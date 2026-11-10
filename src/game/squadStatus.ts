// Spillerens status i truppen (som "Squad Status" i CM 01/02): sat af manageren og brugt af motoren.
import type { Player } from './types';
import { ageOn } from './dates';

export const SQUAD_STATUSES = ['key', 'first', 'rotation', 'backup', 'prospect', 'young', 'surplus'] as const;
export type SquadStatus = (typeof SQUAD_STATUSES)[number];

/** Hvor hurtigt spilleren bliver utilfreds over ikke at spille: en nøglespiller forventer at spille hver gang */
const UNHAPPY: Record<SquadStatus, number> = { key: 2, first: 1.5, rotation: 1, backup: 0.5, prospect: 0.6, young: 0.4, surplus: 0.8 };
export const unhappyMult = (p: Player) => (p.squadStatus ? UNHAPPY[p.squadStatus] : 1);

/** "Hot prospect" og "decent young player" giver kun mening for unge spillere */
export function statusAllowed(p: Player, s: SquadStatus, date: string): boolean {
  if (s === 'prospect' || s === 'young') return ageOn(p.dob, date) <= 21;
  return true;
}

/** Hvad spilleren selv forventer (CM 01/02: "* Expected by the player") – efter hans plads i truppen målt på evne */
export function expectedStatus(p: Player, squadPlayers: Player[], date: string): SquadStatus {
  const age = ageOn(p.dob, date);
  const rank = squadPlayers.filter((x) => x.id !== p.id && x.ca > p.ca).length;
  if (rank < 3) return 'key';
  if (rank < 11) return 'first';
  if (age <= 21) return p.pa >= 150 ? 'prospect' : 'young';
  if (rank < 16) return 'rotation';
  return 'backup';
}
