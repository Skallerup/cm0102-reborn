// Player Search-filteret "Interested" som originalen (cmSearchInterest.ts: 0x807450 → 0x846920(staff, klub, 1, 0, 1) ≥ 3,15): med Vejle er
// næsten ingen fra de store ligaer interesseret (ejerens fund 16/11: 36.985 af 40.270 med spillets skøn), med Man Utd mange.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmSearchInterested } from '../src/game/cmSearchInterest';
import type { GameState, Player } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const BIG = new Set(['Italy', 'Spain', 'England', 'Germany']);

function start(name: string) {
  const c = world.clubs.find((x) => x[1] === name)!;
  createGame(world, { managerName: 'M S', managerNation: c[3] as number, clubId: c[0], activeNations: [c[3] as number], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  return gs();
}
const find = (g: GameState, last: string, club: string): Player => Object.values(g.players).find((p) => p.last === last && g.clubs[p.club]?.name === club)!;
function count(g: GameState) {
  let all = 0, yes = 0, top = 0, topYes = 0;
  for (const p of Object.values(g.players)) {
    if (p.club === g.userClub) continue;
    all++;
    const y = cmSearchInterested(g, p);
    if (y) yes++;
    const c = g.clubs[p.club];
    if (c && p.ca >= 140 && g.leagues[c.league]?.tier === 1 && BIG.has(g.nations[c.nation]?.name)) { top++; if (y) topYes++; }
  }
  return { all, yes, top, topYes };
}

describe('Player Search "Interested" (0x807450/0x846920, 3.9.60, ægte tilstand)', { timeout: 900_000 }, () => {
  it('Vejle: ingen topspillere fra Serie A/La Liga/PL/Bundesliga, Man Utd: mange', () => {
    let g = start('Vejle Boldklub');
    for (const [last, club] of [['Klose', '1.FC Kaiserslautern'], ['Agali', 'FC Schalke 04'], ['Duff', 'Blackburn Rovers'], ['Bellamy', 'Newcastle United'],
      ['Chevantón', 'Lecce'], ['Vieri', 'Internazionale'], ['Zidane', 'Real Madrid C.F.']] as const) expect(cmSearchInterested(g, find(g, last, club)), last).toBe(false);
    const v = count(g);
    expect(v.topYes).toBe(0);
    expect(v.yes / v.all).toBeLessThan(0.3);       // målt: 8.434 af 40.638 (spillets skøn: 38.149)
    expect(v.yes).toBeGreaterThan(1000);           // klubløse og mindre klubber vil gerne
    expect(cmSearchInterested(g, find(g, 'Klose', '1.FC Kaiserslautern'))).toBe(false);   // gemt pr. dag – samme svar

    g = start('Manchester United');
    // (20/11) ikke Seedorf: hans svar afhænger af spilstartens tilfældige tal (målt med den gamle world-fil: frø 1/2 → 3,5, frø 3 → 0,21) og
    // skiftede med Europas skjulte klubber HE<land>; Klose og Vieri er stabile (3,5+ for alle målte frø)
    for (const [last, club] of [['Klose', '1.FC Kaiserslautern'], ['Vieri', 'Internazionale']] as const)
      expect(cmSearchInterested(g, find(g, last, club)), last).toBe(true);
    expect(cmSearchInterested(g, find(g, 'Zidane', 'Real Madrid C.F.'))).toBe(false);
    const m = count(g);
    expect(m.topYes).toBeGreaterThan(100);        // målt: 183 af 675
    expect(m.yes / m.all).toBeGreaterThan(0.6);   // målt: 32.038 af 41.801
  });
});
