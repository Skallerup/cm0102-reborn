// Fiktive AI-managere til forsidens rangliste, så listen ikke står tom. De vises tydeligt som "AI" og sendes
// aldrig til den globale rangliste (api/rank.ts) – de rigtige managere står altid i deres egen ret.
import type { RankRow } from '../online/rank';

const AI: [string, string, string, number, number][] = [
  ['Lars Kjærgaard', 'FC Midtjylland', 'Superligaen', 812, 9],
  ['Sofia Marchetti', 'Napoli', 'Serie A', 744, 8],
  ['Tom Ashworth', 'Leeds', 'Premier League', 691, 7],
  ['Jonas Weber', 'Freiburg', 'Bundesliga', 655, 8],
  ['Pablo Arriaga', 'Real Sociedad', 'LaLiga', 602, 7],
  ['Mette Holm', 'Brøndby IF', 'Superligaen', 548, 6],
  ['Ruben Vos', 'AZ', 'Eredivisie', 511, 6],
  ['Callum Reid', 'Hearts', 'Scottish Premiership', 466, 6],
  ['Henrik Lund', 'Rosenborg', 'Eliteserien', 431, 5],
  ['Marco Ferreira', 'Braga', 'Liga Portugal', 398, 5],
  ['Ella Svensson', 'Malmö FF', 'Allsvenskan', 352, 4],
  ['Jamie Okafor', 'Wrexham', 'Championship', 319, 4],
  ['Kasper Nyborg', 'AGF', 'Superligaen', 288, 4],
  ['Lucas Moreau', 'Lens', 'Ligue 1', 254, 3],
  ['Diego Salas', 'Betis', 'LaLiga', 221, 3],
  ['Niklas Brandt', 'Schalke 04', 'Bundesliga', 187, 3],
  ['Oliver Grant', 'Sunderland', 'Premier League', 152, 2],
  ['Anders Riis', 'OB', '1. division', 118, 2],
  ['Ivan Petrov', 'Sampdoria', 'Serie B', 84, 1],
  ['Sara Lindqvist', 'Hammarby', 'Allsvenskan', 61, 1],
];

export const AI_RANK_ROWS: (RankRow & { ai: true })[] = AI.map(([name, club, league, points, seasons], i) => ({ id: `ai-${i}`, ai: true, name, club, league, points, seasons }));

/** De rigtige managere blandet med AI-managerne (sorteret efter point) */
export function withAiManagers(rows: RankRow[], n: number): (RankRow & { ai?: boolean })[] {
  return [...rows, ...AI_RANK_ROWS].sort((a, b) => b.points - a.points).slice(0, n);
}
