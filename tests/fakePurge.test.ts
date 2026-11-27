// (27/11) gemte spil fra før 6c3386bb: sæsonskiftets opdigtede spillere i de ikke-valgte landes klubber fjernes én gang ved indlæsningen
// (save.ts repairFakePlayers → purgeFakes.ts) – kun de usynlige; en på menneskets shortliste og en udlejet til en valgt klub bliver.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { addPlayer, gs, setClub, squadIds } from '../src/game/state';
import { makePlayer } from '../src/game/data/generate';
import { repairFakePlayers } from '../src/game/save';
import { fakeCandidates } from '../src/game/purgeFakes';
import type { Club, Player } from '../src/game/types';

describe('opdigtede spillere i de ikke-valgte lande (3.9.68, ægte tilstand)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];

  it('fjerner de usynlige og rydder referencerne; shortlistet og udlejet bliver', () => {
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    // som season.ts fillSquad ved et sæsonskifte: regen-flaget uden regenOf, id fra spillets tæller, ingen klubskifter
    const fake = (c: Club, last: string): Player => {
      const p = makePlayer({ id: g.nextId.player++, first: 'Fake', last, dob: '1982-03-01', nation: c.nation, club: c.id, sub: 'CM', foot: 'R', height: 0, ca: 60, date: g.date, seed: g.seed, wealth: 1, regen: true });
      addPlayer(p);
      return p;
    };
    const other = Object.values(g.clubs).filter((c) => !g.activeNations.includes(c.nation) && squadIds(c.id).length > 5);
    const [it1, it2] = other;
    const engClub = Object.values(g.clubs).find((c) => c.nation === eng && c.id !== mu && squadIds(c.id).length > 15)!;
    const before = fakeCandidates(g).length;
    const plain = fake(it1, 'Plain'), listed = fake(it1, 'Listed'), loaned = fake(it1, 'Loaned'), refd = fake(it2, 'Refd');
    g.shortlist.push(listed.id);
    loaned.loan = { from: it1.id, until: `${g.season + 1}-05-31` };
    setClub(loaned, engClub.id);
    // referencer til en, der fjernes: computerens ønskeliste, kendskab, nyhedslink, bud mellem to ikke-valgte klubber, landsholdspuljen
    (it2.shortlist ??= []).push(refd.id, plain.id);
    g.knowledge[refd.id] = 50;
    g.news.unshift({ id: g.nextId.news++, date: g.date, cat: 'transfer', key: 'news.x', params: {}, read: false, link: { kind: 'player', id: refd.id } });
    g.offers.push({ id: g.nextId.offer++, player: refd.id, buyer: it1.id, seller: it2.id, fee: 1000, loan: false, status: 'pending', created: g.date, respondBy: g.date });
    const muSquad = JSON.stringify(squadIds(mu).map((id) => g.players[id]));
    const engSquad = JSON.stringify(squadIds(engClub.id));
    const real = squadIds(it1.id).filter((id) => id < 10_000_000);
    expect(fakeCandidates(g).length).toBe(before + 3);   // den udlejede står i en valgt klub

    repairFakePlayers();
    expect(g.players[plain.id]).toBeUndefined();
    expect(g.players[refd.id]).toBeUndefined();
    expect(g.players[listed.id]).toBeDefined();
    expect(g.players[loaned.id]?.club).toBe(engClub.id);
    expect(squadIds(it1.id)).not.toContain(plain.id);
    expect(squadIds(it1.id)).toEqual(expect.arrayContaining([...real, listed.id]));
    expect(it2.shortlist).not.toContain(refd.id);
    expect(it2.shortlist).not.toContain(plain.id);
    expect(g.knowledge[refd.id]).toBeUndefined();
    expect(g.news[0].link).toBeUndefined();
    expect(g.offers.some((o) => o.player === refd.id)).toBe(false);
    expect(g.shortlist).toContain(listed.id);
    expect(JSON.stringify(squadIds(mu).map((id) => g.players[id]))).toBe(muSquad);
    expect(JSON.stringify(squadIds(engClub.id))).toBe(engSquad);
    expect(g.fixes).toContain('fakePurge');
    // kun én gang
    const again = fake(it1, 'Later');
    repairFakePlayers();
    expect(g.players[again.id]).toBeDefined();
  });
});
