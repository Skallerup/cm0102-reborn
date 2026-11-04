// Udfordringer / scenarier (forbedring #10): klubber fra de tre største ligaer (England, Spanien, Tyskland)
// og klassiske klubber, der skal tilbage (Wrexham, Sampdoria, Kaiserslautern …). Klubberne findes ud fra
// navnet i 2026/27-databasen, og målet tjekkes ved sæsonafslutning – efter op- og nedrykning.
import { finalOrder } from './competitions';
import type { GameState } from './types';

export interface Challenge {
  id: string;
  /** klubbens korte navn i 2026/27-databasen */
  clubName: string;
  nations: string[]; // aktive nationer (databasens navne)
  seasons: number;
  /** i18n-nøgler: challenge.<id>.title / .desc */
  setup?: (g: GameState, club: number) => void;
  /** Kaldes ved sæsonafslutning (efter op/nedrykning). true = vundet */
  check: (g: GameState, club: number) => boolean;
}

/** Placering i den liga, klubben spillede i denne sæson */
const leaguePos = (g: GameState, club: number): number => {
  const comp = Object.values(g.comps).find((c) => c.type === 'league' && c.clubs.includes(club));
  return comp ? finalOrder(comp).indexOf(club) + 1 : 99;
};
const tierOf = (g: GameState, club: number) => g.leagues[g.clubs[club]?.league]?.tier ?? 9;
const champion = (g: GameState, club: number) => Object.values(g.comps).some((c) => c.type === 'league' && c.tier === 1 && c.winner === club);
const BIG = ['England', 'Spain', 'Germany'];

export const CHALLENGES: Challenge[] = [
  { id: 'wrexham-dream', clubName: 'Wrexham', nations: ['England'], seasons: 3, check: (g, c) => tierOf(g, c) === 1 },
  { id: 'united-broke', clubName: 'Man Utd', nations: ['England'], seasons: 1,
    setup: (g, c) => { g.clubs[c].transferBudget = 0; }, check: (g, c) => leaguePos(g, c) <= 4 },
  { id: 'spurs-title', clubName: 'Tottenham', nations: ['England'], seasons: 3, check: champion },
  { id: 'forest-europe', clubName: 'Nottm Forest', nations: BIG, seasons: 5, check: (g, c) => g.comps.CL?.winner === c },
  { id: 'depor-return', clubName: 'Deportivo', nations: ['Spain'], seasons: 2, check: (g, c) => leaguePos(g, c) <= 4 && tierOf(g, c) === 1 },
  { id: 'barca-europe', clubName: 'Barcelona', nations: BIG, seasons: 2, check: (g, c) => g.comps.CL?.winner === c },
  { id: 'schalke-title', clubName: 'Schalke 04', nations: ['Germany'], seasons: 4, check: champion },
  { id: 'lautern-return', clubName: 'Kaiserslautern', nations: ['Germany'], seasons: 2, check: (g, c) => tierOf(g, c) === 1 },
  { id: 'sampdoria-return', clubName: 'Sampdoria', nations: ['Italy'], seasons: 2, check: (g, c) => tierOf(g, c) === 1 },
];

export function challengeById(id: string) {
  return CHALLENGES.find((c) => c.id === id);
}

/** Udfordringens klub-id i en database (ud fra navnet i landets ligaer) */
export function challengeClub(ch: Challenge, world: { clubs: [number, string, string, number, ...unknown[]][]; nations: { name: string }[] }): number {
  const nations = new Set(ch.nations.map((n) => world.nations.findIndex((x) => x.name === n)));
  return world.clubs.find((c) => c[2] === ch.clubName && nations.has(c[3]))?.[0] ?? world.clubs.find((c) => c[2] === ch.clubName)?.[0] ?? 0;
}
