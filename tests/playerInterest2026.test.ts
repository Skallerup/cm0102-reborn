// 2026/27-databasen: spillerens interesse (transfers.ts playerInterest → dbRepGap) bruger databasens omdømme for spilleren og hans klub,
// så stjerner fra storklubber ikke vil til Vejle (ejerens fund 17/11: Player Search "Interested" viste Javi Guerra, Mainoo, Boey …).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { playerInterest } from '../src/game/transfers';
import type { Player } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const nat = (n: string) => world.nations.findIndex((x) => x.name === n);
const clubId = (n: string) => world.clubs.find((c) => c[1] === n || c[2] === n)![0];

describe('playerInterest – 2026/27-databasens omdømme', () => {
  createGame(world, { managerName: 'T', managerNation: nat('Denmark'), clubId: clubId('Vejle'), activeNations: ['Denmark', 'Spain', 'England', 'Germany'].map(nat), lang: 'da', masking: true, seed: 1 });
  const g = gs();
  const find = (first: string, last: string) => Object.values(g.players).find((p) => p.first === first && p.last === last) as Player;
  const stars = [find('Javi', 'Guerra'), find('Kobbie', 'Mainoo'), find('Sacha', 'Boey'), find('Jon', 'Martín')];

  it('stjernerne fra skærmbilledet vil ikke til Vejle, men gerne til Manchester City', () => {
    const vejle = g.clubs[g.userClub], city = g.clubs[clubId('Manchester City')];
    for (const p of stars) {
      expect(p?.cmRep).toBeDefined();
      expect(playerInterest(p, vejle)).toBe('reputation');
      expect(playerInterest(p, city)).toBe('yes');
    }
  });

  it('spillere på Vejles niveau i Superligaen vil gerne komme', () => {
    const vejle = g.clubs[g.userClub];
    const dk = Object.values(g.clubs).filter((c) => c.id !== vejle.id && g.nations[c.nation]?.name === 'Denmark' && c.rep <= vejle.rep);
    const ps = Object.values(g.players).filter((p) => dk.some((c) => c.id === p.club));
    expect(ps.length).toBeGreaterThan(50);
    expect(ps.filter((p) => playerInterest(p, vejle) === 'yes').length / ps.length).toBeGreaterThan(0.8);
  });
});
