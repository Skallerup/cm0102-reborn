// Nyheden 0xfbd "<spiller> watched" (ejerens fejlmelding 24/11: Gillingham "spottede" Michael Clegg hver anden dag i forsæsonen).
// Originalen: kun fra ønskelisternes 0x83f3a0 @0x840a79 → 0x587220 (rand(3) = en af tre tekster 0x587370) → spillerens (menneskets) klub.
// Det tidligere estimat i sim.ts (30 % efter hver kamp) er fjernet.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });

import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmShortlistApply } from '../src/game/transfers';
import { en } from '../src/i18n/en';
import { da } from '../src/i18n/da';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;

describe('0xfbd "<spiller> watched"', { timeout: 300_000 }, () => {
  it('ønskelistens begivenhed giver nyheden til menneskets klub med originalens tre tekster', () => {
    const c = world.clubs.find((x) => x[1] === 'Manchester United')!;
    createGame(world, { managerName: 'M S', managerNation: c[3] as number, clubId: c[0], activeNations: [c[3] as number], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    const mine = Object.values(g.players).find((p) => p.club === g.userClub)!;
    const other = Object.values(g.players).find((p) => p.club && p.club !== g.userClub)!;
    const scout = Object.values(g.clubs).find((x) => x.id !== g.userClub)!;
    const before = g.news.length;
    cmShortlistApply([0, 1, 2].map((v) => ({ kind: 'spotted' as const, club: scout.id, player: mine.id, v })));
    cmShortlistApply([{ kind: 'spotted', club: scout.id, player: other.id, v: 1 }]);
    const got = g.news.slice(0, g.news.length - before).reverse().filter((n) => /^scout\.spotted/.test(n.key ?? '')); // addNews lægger forrest
    expect(got.map((n) => n.key)).toEqual(['scout.spotted.seen', 'scout.spotted', 'scout.spotted.star']);
    expect(got.every((n) => n.params?.club === scout.name && n.link?.id === mine.id)).toBe(true);
    for (const k of ['scout.spotted.seen', 'scout.spotted', 'scout.spotted.star']) {
      expect(en[k]).toBe('{player} watched');
      expect(da[k]).toBeTruthy();
      expect(da[k + '.body']).toBeTruthy();
    }
    expect(en['scout.spotted.body']).toBe("A scout from {club} was spotted at your last match.\n\nHe is thought to have been impressed with {player}'s performance.");
  });

  it('sim.ts sender den ikke længere efter hver kamp', () => {
    const src = readFileSync('src/game/sim.ts', 'utf8');
    expect(src).not.toMatch(/key: 'scout\.spotted'/);
  });
});
