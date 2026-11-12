// Runde 8: spillets egne inddata til gittermotoren (gameInputs.ts) og kampens spiller sub_6d0f80.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { gameInputsCtx, matchValuesEnvOf, recordBytes, staffBytes } from '../src/game/engine/grid/gameInputs';
import { manOfTheMatch6d0f80, randOf, runGridMatch, type GP } from '../src/game/engine/grid/gridMatch';
import { aiTactic } from '../src/game/sim';
import { Rng } from '../src/game/rng';
import { ageOn } from '../src/game/dates';

describe('kampens spiller sub_6d0f80', () => {
  const q = (o: Partial<GP>) => ({ slot: 0, rating: 6000, goals: 0, penGoalsWon: 0, assists: 0, b6: 0, ...o }) as GP;
  it('scoren = karakter + 250·mål + 125·+0x10 + 50·assists + 35·+6; en afløser skal have større score OG mindst samme karakter/1000', () => {
    const a = q({ rating: 7400 }), b = q({ rating: 6900, goals: 2 }), c = q({ rating: 7600, assists: 1 });
    // b har større score (7400 < 7400+?): 6900 + 500 = 7400 – ikke større end a's 7400 → a beholdes; c: 7650 > 7400 og 7 ≥ 7 → c
    expect(manOfTheMatch6d0f80([[a, b], [c]], () => -1)).toBe(c);
    // større score, men lavere karakter i hele tusinder (6 < 7): ingen afløsning
    const d = q({ rating: 6990, goals: 3 });
    expect(manOfTheMatch6d0f80([[a, d]], () => -1)).toBe(a);
    // ubrugte udskiftere (plads < 0, aldrig skiftet ud) tæller ikke; de udskiftede gør
    const bench = q({ slot: -1, rating: 9000 }), off = q({ slot: -4, rating: 8000 });
    expect(manOfTheMatch6d0f80([[a, bench]], () => -1)).toBe(a);
    expect(manOfTheMatch6d0f80([[a, off]], (x) => (x === off ? 60 : -1))).toBe(off);
  });
});

describe('spillets inddata (original database, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const ars = Object.values(g.clubs).find((c) => c.name === 'Arsenal')!.id, mu = Object.values(g.clubs).find((c) => c.name === 'Manchester United')!.id;

  it('spiller- og staffposten: id, alder, de skjulte egenskaber og ankomsten (databasens dato)', () => {
    const p = squad(ars)[0];
    const r = recordBytes(p), s = staffBytes(p, g.date);
    expect(((r[0] & 0xff) | ((r[1] & 0xff) << 8) | ((r[2] & 0xff) << 16)) >>> 0).toBe(p.id);
    expect(((r[5] & 0xff) | (r[6] << 8))).toBe(p.ca);
    expect(s[0x18]).toBe(ageOn(p.dob, g.date));
    if (p.cmJoined) expect((s[0x40] & 0xff) | (s[0x41] << 8)).toBe(+p.cmJoined.slice(0, 4));
  }, 60_000);

  it('sub_6ec010s omgivelser: Premier League (comp +0x69 = 18), ligakamp, klubbens rå omdømme, kontrakten', () => {
    const p = squad(ars).find((x) => x.contract)!;
    const env = matchValuesEnvOf(p, { club: ars, human: false, manager: null, clubRep: g.cmClubRep![ars] }, { fx3a: 2, comp: { rep: 18, mls: false }, homeLeagueIsComp: true },
      { us: 196, can: 36, mex: 121 });
    expect(env.comp?.rep).toBe(18);
    expect(env.ownClubRep).toBe(g.cmClubRep![ars]);
    expect(env.contract).not.toBeNull();
    expect(env.inDb).toBe(true);
    const ctx = gameInputsCtx(ars, mu, { compId: Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && c.nation === eng)!.id, human: [false, false] });
    expect(ctx.compRep).toBe(18);
    expect(ctx.compType).toBe(2);
    expect(ctx.rep).toEqual([g.cmClubRep![ars], g.cmClubRep![mu]]);
  }, 60_000);

  it('en kamp med spillets inddata: kampværdierne sub_6ec010 regnes (posterne findes) og kampen spilles færdig', () => {
    const rng = new Rng(5);
    const r = runGridMatch({ players: squad(ars), tactic: aiTactic(ars, mu, true) }, { players: squad(mu), tactic: aiTactic(mu, ars, false) }, randOf(() => rng.next()),
      { ...gameInputsCtx(ars, mu, { human: [false, false] }) });
    expect(r.ticks).toBeGreaterThan(989);
    expect(r.home.passes + r.away.passes).toBeGreaterThan(300);
  }, 120_000);
});
