// Sæsonskiftet pr. land (16/11) – kun den originale database i ægte tilstand (cmCalendarOn), som det øvrige cm*-kode.
//
// Originalen: game_season_update_pass 0x5d5ae0 kører hver række i nøglelandstabellen 0xb63d60 (key_nation_build_table 0x667150) på dens
// +0x15-dag: Europa 20/6, Norge 27/11, Sverige/Finland/Rusland 27/12, Japan 25/1, Sydkorea 20/1, USA 20/2, Argentina/Australien 31/7. Dagen før
// arkiveres Club_Records 0x447880, PlayerStats 0x7c1350, Finance 0x59cdd0 og Staff_Records 0x86d6e0 (end_season_for_nation); på dagen rulles
// rækkens start/slut (+0x2a/+0x39, +0x1d år), og landets ligaer får deres nye sæson (tilskuere 0x5d6280, Discipline 0x556210, reserveligaerne
// 0x84b940). Kontrakterne udløber dagligt efter datoen (CONTRACT_MANAGER – cmContractManager.ts; spillets egne dagligt i season.ts).
//
// Her: season.ts seasonRollover(scope) kører for de lande, hvis dag det er – "hovedskiftet" (Europa og alle lande uden egen dag, 20/6) tæller
// g.season op og opretter Europas turneringer; et land med egen dag (Norge …) får kun sine egne ligaer/pokal, op-/nedrykning, priser, historik
// og spillernes sæsonstatistik skiftet og beholder sin sæson i `g.cmNatSeason`. Arkiveringen "dagen før" sker i begyndelsen af dagen (før
// dagens kampe) – samme tidspunkt som originalens slutning af dagen før.
// *Estimeret*: kampene fra før spilstarten spilles på én gang ved nyt spil (forkørslen 0x5cc850 spiller dem dag for dag), og den nye sæsons år =
// dagens år (+1 fra september). Ikke afkodet: Brasilien og de øvrige ikke-europæiske lande uden kendt dag følger Europa (20/6).
import type { GameState } from './types';
import { cmCalendarOn } from './cmCalendar';

/** nøglelandstabellens +0x15 (sæsonopdateringens dag, "MM-DD") – lande uden række: Europas 20/6 */
export const CM_UPDATE_DAY: Readonly<Record<string, string>> = {
  Finland: '12-27', Russia: '12-27', Sweden: '12-27', Norway: '11-27', Japan: '01-25', 'South Korea': '01-20',
  'United States': '02-20', Argentina: '07-31', Australia: '07-31',
};
export const MAIN_UPDATE_DAY = '06-20';

/** sæsonskiftet pr. land gælder: den originale database i ægte tilstand (ikke draft-ligaen) */
export const cmSeasonOn = (g: GameState): boolean => cmCalendarOn(g);

/** landets sæsonopdateringsdag "MM-DD" */
export function cmUpdateDay(g: GameState, nation: number): string {
  return CM_UPDATE_DAY[g.nations[nation]?.name ?? ''] ?? MAIN_UPDATE_DAY;
}
/** landet skifter sæson med Europa (hovedskiftet, der tæller g.season op) */
export const cmMainNation = (g: GameState, nation: number): boolean => cmUpdateDay(g, nation) === MAIN_UPDATE_DAY;

/** året for den sæson, der starter efter opdateringen på `iso` (dagen "MM-DD"): Norge 27/11-2001 → 2002, Japan 25/1-2002 → 2002, Europa 20/6-2002 → 2002 */
export const seasonYearAfter = (iso: string): number => Number(iso.slice(0, 4)) + (Number(iso.slice(5, 7)) >= 9 ? 1 : 0);

/** landets nuværende sæson (ligaernes år – create_schedule's comp +0x40) */
export function cmNatSeason(g: GameState, nation: number): number {
  return cmMainNation(g, nation) ? g.season : g.cmNatSeason?.[nation] ?? g.season;
}

/** sæsonen et land, der gøres spilbart midt i et spil (activateNation), skal starte i: den seneste opdatering, dog mindst g.season */
export function cmSeasonForNewNation(g: GameState, nation: number): number {
  if (cmMainNation(g, nation)) return g.season;
  const md = cmUpdateDay(g, nation), y = Number(g.date.slice(0, 4));
  const last = g.date.slice(5) >= md ? `${y}-${md}` : `${y - 1}-${md}`;
  return Math.max(g.season, seasonYearAfter(last));
}

/** Dagens sæsonskifter: hovedskiftet (Europa) og de spilbare lande med egen dag, hvis nye sæson er senere end den nuværende */
export function cmSeasonDue(g: GameState): { main: boolean; nations: number[] } {
  const md = g.date.slice(5);
  const main = md === MAIN_UPDATE_DAY && seasonYearAfter(g.date) > g.season;
  const nations: number[] = [];
  for (const n of g.activeNations) {
    if (cmMainNation(g, n) || cmUpdateDay(g, n) !== md) continue;
    if (seasonYearAfter(g.date) > cmNatSeason(g, n)) nations.push(n);
  }
  return { main, nations };
}
