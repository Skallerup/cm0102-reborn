// 2001/02-regel (kun den originale database): britiske klubber skal have arbejdstilladelse til spillere uden for EU/EØS.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { needsWorkPermit, permitOk } from '../src/game/rules2001';
import { playerInterest } from '../src/game/transfers';

const start = (f: string, club: string) => {
  const w = JSON.parse(readFileSync(`public/data/${f}`, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === club)![0], activeNations: [eng], lang: 'en', masking: true, seed: 3 });
  return gs();
};

describe('arbejdstilladelse', () => {
  it('original database: uden landskampe ingen tilladelse – etablerede landsholdsspillere og EU-spillere frit', () => {
    const g = start('world-original.json', 'Leeds United');
    const leeds = g.clubs[g.userClub];
    const nat = (n: string) => g.nations.findIndex((x) => x.name === n);
    const unknownBrazilian = Object.values(g.players).find((p) => p.nation === nat('Brazil') && p.caps === 0 && p.rep < 50)!;
    const star = Object.values(g.players).find((p) => p.nation === nat('Brazil') && p.caps >= 15)!;
    const dane = Object.values(g.players).find((p) => p.nation === nat('Denmark'))!;
    expect(needsWorkPermit(unknownBrazilian, leeds)).toBe(true);
    expect(playerInterest(unknownBrazilian, leeds)).toBe('permit');
    expect(permitOk(star, leeds)).toBe(true);
    expect(needsWorkPermit(dane, leeds)).toBe(false);
  }, 30_000);
  it('den moderne database har ingen arbejdstilladelser', () => {
    const g = start('world.json', 'Brentford FC');
    const p = Object.values(g.players).find((x) => x.caps === 0 && g.nations[x.nation]?.name === 'Brazil')!;
    expect(needsWorkPermit(p, g.clubs[g.userClub])).toBe(false);
  }, 30_000);
});
