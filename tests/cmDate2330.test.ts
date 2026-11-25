// [0xae2330] (exe-datoen 31/8-2001) i ønskelisternes hukommelse: 0x868210 (kontraktens start +0x25 før datoen → 1) åbner Bosman-vejen i 0x84b6f0,
// så computerklubberne giver forkontrakt-tilbud (build_bid +0x2f) til spillere med ≤ 6 måneder tilbage – også en mangeårig spiller hos menneskets
// klub (ejerens melding 25/11: Man Utd's spillere fik ingen tilbud). Før stod datoen kun i CONTRACT_MANAGER's hukommelse (her 1/1-1900 → 0).
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildSlMem } from '../src/game/cmShortlistGame';
import { slCall } from '../src/game/cmShortlist';
import { clubAt, getContract } from '../src/game/cmMem';

describe('[0xae2330] i ønskelisternes hukommelse', { timeout: 300_000 }, () => {
  const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  const mu = w.clubs.find((c) => c[1] === 'Manchester United')![0];
  createGame(w, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();

  it('31/8-2001, og 0x868210 = 1 for Irwins kontrakt (startet 1990) hos menneskets klub i december', () => {
    g.date = '2001-12-15';
    const S = buildSlMem(g, { noStale: true });
    const m = S.m;
    expect([m.s16(0xae2330), m.u16(0xae2332), m.u8(0xae233c)]).toEqual([242, 2001, 1]);
    const p = Object.values(g.players).find((x) => x.first === 'Denis' && x.last === 'Irwin' && x.club === mu)!;
    expect(p.contract!.expires.slice(0, 10)).toBe('2002-06-30');
    let st = 0;
    for (const [q, a] of S.M.W.players) if (q === p) st = a;
    expect(st).toBeGreaterThan(0);
    const k = getContract(m, st);
    expect(m.u16(k + 0x27)).toBeLessThan(2001);
    const villa = Object.values(g.clubs).find((c) => c.name === 'Aston Villa')!.id;
    expect(slCall(S.c, 0x868210, k, clubAt(m, villa), 0, 0)).toBe(1);
  });
});
