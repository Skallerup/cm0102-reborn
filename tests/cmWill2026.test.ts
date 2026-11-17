// 2026/27 i ægte tilstand (MODERN_PARITY 1+4): originalens vilje 0x846920 (Player Search "Interested" 0x807450, skiftet 0x8c0080) og
// kontraktlaget (kravet 0x85fc50, bestyrelsens loft 0x5968d0) på 2026/27-dataene, pengene omregnet med faktoren pr. liga (cmMoney.ts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmSearchInterested } from '../src/game/cmSearchInterest';
import { cmMoveInterest, cmTalkDemand } from '../src/game/cmContractGame';
import { cmBoardWageAllow } from '../src/game/cmBudget';
import { cmGbp, GBP_2001 } from '../src/game/cmMoney';
import { playerInterest } from '../src/game/transfers';
import type { GameState, Player } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
world.cmRaw = (JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw?: unknown }).cmRaw;
const nat = (n: string) => world.nations.findIndex((x) => x.name === n);
const clubId = (n: string) => world.clubs.find((c) => c[1] === n || c[2] === n)![0];

describe('2026/27 i ægte tilstand: originalens vilje og kontrakter', () => {
  createGame(world, { managerName: 'T', managerNation: nat('Denmark'), clubId: clubId('Vejle Boldklub'), activeNations: ['Denmark', 'Spain', 'England', 'Germany'].map(nat), lang: 'da', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();
  const find = (first: string, last: string) => Object.values(g.players).find((p) => p.first === first && p.last === last) as Player;
  const city = clubId('Manchester City');

  it('pengefaktoren er målt pr. liga ved spilstart (den originale database: 0,86)', () => {
    expect(g.cmGbp).toBeDefined();
    const f = cmGbp(g, city);
    expect(f).toBeGreaterThan(0.01);
    expect(f).toBeLessThan(2);
    expect(cmGbp({ clubs: {} } as unknown as GameState)).toBe(GBP_2001);
  });

  it('Player Search "Interested" og skiftet bruger 0x846920: stjernerne vil ikke til Vejle, men til Manchester City', () => {
    for (const p of [find('Javi', 'Guerra'), find('Kobbie', 'Mainoo'), find('Sacha', 'Boey')]) {
      expect(cmSearchInterested(g, p, g.userClub)).toBe(false);
      expect(cmMoveInterest(g, p, g.userClub)!).toBeLessThan(0.75);
    }
    expect(cmSearchInterested(g, find('Javi', 'Guerra'), city)).toBe(true);
    // computerens skøn (playerInterest) er det samme som for den originale database (dbRepGap kun i udvidet tilstand)
    expect(['yes', 'reputation', 'happy', 'abroad', 'permit']).toContain(playerInterest(find('Javi', 'Guerra'), g.clubs[g.userClub]));
  });

  it('kravet og bestyrelsens loft er moderne beløb (€) for egne spillere', () => {
    const own = Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0];
    const d = cmTalkDemand(g, own, g.userClub)!;
    expect(d.gbp).toBe(cmGbp(g, g.userClub));
    // kravet ligger om den nuværende løn (originalens krav i originalens enheder, tilbage i €)
    expect(d.wage).toBeGreaterThan(own.contract!.wage * 0.5);
    expect(d.wage).toBeLessThan(own.contract!.wage * 3);
    expect(cmBoardWageAllow(g, own, g.userClub)!).toBeGreaterThan(0);
  });
});
