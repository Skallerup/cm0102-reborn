// Originalens spejderanmodninger og -rapporter (cmScout.ts: 0x7f8ff0/0x7f9290/0x7f8750/0x7b5be0/0x7b62a0/0x7f9890; tekst ui/cmScoutNews.ts 0x7f9d10)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { scoutRequests } from '../src/game/cmScout';
import { cmScoutReportBody, positionWord, ratingCat } from '../src/ui/cmScoutNews';
import { t } from '../src/i18n';
import { en } from '../src/i18n/en';
import type { GameState, NewsItem } from '../src/game/types';

describe('0x7f9d10: spejderrapportens tekst', () => {
  it('positionsordet 0x5461b0 og vurderingens grupper', () => {
    expect(positionWord(1)).toBe('goalkeeper');
    expect(positionWord(0x4 | 0x200)).toBe('central defender');
    expect(positionWord(0x4 | 0x800)).toBe('full back');
    expect(positionWord(0x4 | 0x200 | 0x80)).toBe('defender');
    expect(positionWord(0x20 | 0x80)).toBe('left winger');
    expect(positionWord(0x20 | 0x80 | 0x800)).toBe('winger');
    expect(positionWord(0x10 | 0x20 | 0x200)).toBe('midfielder');   // AM kun uden andre positioner (0x546410)
    expect(positionWord(0x40 | 0x200)).toBe('forward');
    expect(positionWord(0x40)).toBe('player');
    expect(positionWord(0x2 | 0x4 | 0x200 | 0x10 | 0x40)).toBe('utility player');
    expect([ratingCat(5, 0), ratingCat(3, 5), ratingCat(2, 5), ratingCat(4, 4), ratingCat(1, 4), ratingCat(3, 3), ratingCat(2, 3), ratingCat(2, 1), ratingCat(1, 2), ratingCat(1, 1), ratingCat(0, 1)])
      .toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('én spejder uden kamp, to spejdere i en ligakamp (Both …) og arbejdstilladelsen', () => {
    const g = { clubs: { 1: { name: 'Arsenal', short: 'Arsenal' }, 2: { name: 'Chelsea', short: 'Chelsea' }, 3: { name: 'Leeds United', short: 'Leeds' } },
      comps: { PL: { type: 'league', name: 'Premier League' } }, nations: [] } as unknown as GameState;
    const one = { key: 'cmsr.a710f4', params: { n: 1, mode: 1, player: 'Alan Smith', last: 'Smith', age: 20, pos: 0x40 | 0x200, club: 1, permit: 1, granted: 0,
      s0: 'Mark Woodger', l0: 'Woodger', a0: 3, p0: 4 } } as unknown as NewsItem;
    expect(cmScoutReportBody(g, one)).toBe('Mark Woodger has been watching 20 year old forward Alan Smith during recent weeks.\n\n'
      + 'He is recommended as a good prospect for the future.\n\nHe also believes the player would have difficulty attaining a work permit.');
    const two = { key: 'cmsr.a7dccc', params: { n: 2, mode: 1, player: 'Alan Smith', last: 'Smith', age: 20, pos: 0x40 | 0x200, club: 1, permit: 0, granted: 0,
      s0: 'Mark Woodger', l0: 'Woodger', a0: 2, p0: 2, s1: 'Marc Duffy', l1: 'Duffy', a1: 2, p1: 3, mt: 3, mo: 2, gf: 1, ga: 2, rsv: 0, comp: 'PL', stg: '', rnd: 1 } } as unknown as NewsItem;
    // a = 5 læses pr. spejder, resten af valget af den første spejders stjerner (0x7fb438)
    expect(cmScoutReportBody(g, two)).toBe("Two of your scouts watched 20 year old forward Alan Smith during Leeds United's 2-1 defeat at the hands of Chelsea.\n\n"
      + 'Both Mark Woodger and Marc Duffy feel the player may be a useful addition to your squad.');
  });
});

describe('Scout Player (den originale database, ægte tilstand)', () => {
  it('anmodningen giver originalens rapport 0x138e, og anmodningen slettes', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    const mu = w.clubs.find((c) => c[1] === 'Manchester United')![0];
    createGame(w, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    const other = Object.values(g.clubs).find((c) => c.league === g.clubs[g.userClub].league && c.id !== g.userClub)!;
    const target = squad(other.id).sort((a, b) => b.ca - a.ca)[0];
    const st = applyAction({ t: 'scoutStatus', pid: target.id }) as unknown as number;
    expect(st).toBeLessThanOrEqual(1);
    expect(g.shortlist).toContain(target.id);
    expect(applyAction({ t: 'scoutReq', pid: target.id })).toBe('ok');
    expect(applyAction({ t: 'scoutStatus', pid: target.id })).toBe(3);
    expect(scoutRequests(g).map((r) => r.pid)).toEqual([target.id]);
    let news: NewsItem | undefined;
    for (let i = 0; i < 80 && !news; i++) {
      const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
      news = g.news.find((n) => n.key.startsWith('cmsr.') && n.params.pid === target.id);
    }
    expect(news, 'ingen rapport').toBeTruthy();
    expect(news!.key in en).toBe(true);
    expect(t(news!.key, news!.params)).toContain(target.last);
    const body = cmScoutReportBody(g, news!);
    expect(body).toContain(target.last);
    expect(body).not.toMatch(/\{|undefined/);
    // efter rapporten (0x7f9520: datoen 1969) slettes anmodningen ved næste daglige opdatering (datoen + 365 er passeret)
    for (let i = 0; i < 2; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    expect(scoutRequests(g).some((r) => r.pid === target.id)).toBe(false);
  }, 240_000);
});
