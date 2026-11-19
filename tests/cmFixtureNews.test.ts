// Originalens nyheder om tv-flytninger (type 3, 0x685640), flyttede kampe ved Europa-kampe (type 1, 0x5aac70/0x5aaf00) og pokalpræmier
// (0x1a, 0x48e3e0) med rundenavnet 0x4bfa30/0x4b4850.
import { describe, expect, it, vi } from 'vitest';
// en import trækker analytics.ts med (window ved indlæsning) – i Node en tom stand-in
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmMovedNews, cmTvNews } from '../src/game/cmCalendar';
import { cmPrizeNews } from '../src/game/cmFinance';
import { cmFixtureName, cmFixtureNameInText } from '../src/game/cmRoundName';
import { CM_ROUND_NAMES } from '../src/game/data/cmRoundNames';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import type { Fixture, GameState } from '../src/game/types';
import { compName, money } from '../src/i18n';
import { cmGbp } from '../src/game/cmMoney';

describe('rundenavnet 0x4bfa30 / 0x4b4850', () => {
  it('exe\'ens tabel: runder, ben, omkampe, bronzekampe og etaper', () => {
    expect(CM_ROUND_NAMES[30]).toBe('Third Round');
    expect(CM_ROUND_NAMES[124]).toBe('Quarter Final Second Leg');
    expect(CM_ROUND_NAMES[140]).toBe('Third Place Playoff');
    expect(CM_ROUND_NAMES[150]).toBe('Final');
    expect(CM_ROUND_NAMES[1055]).toBe('Group A');
    expect(CM_ROUND_NAMES[0]).toBeUndefined();
  });
  it('form 1 = langt navn, form 2 = club_comp.dat\'s korte; etape før runde; German Regional North/South; Friendly med lille f', () => {
    expect(cmFixtureName('English Premier Division', 0, 0, 2)).toBe('Premier Division');
    expect(cmFixtureName('English Premier Division', 0, 0, 1)).toBe('English Premier Division');
    expect(cmFixtureName('English FA Cup', 0, 40, 1)).toBe('English FA Cup Fourth Round');
    expect(cmFixtureName('European Champions Cup', 1055, 0, 2)).toBe('Champions Cup Group A');
    expect(cmFixtureName('European Champions Cup', 1055, 3, 2)).toBe('Champions Cup Group A First Leg');
    expect(cmFixtureName('German Regional', 0x453, 0, 2)).toBe('Regional Division North');
    expect(cmFixtureName(undefined, 0, 150, 2)).toBe('Final');
    expect(cmFixtureNameInText('Friendly')).toBe('friendly');
    expect(cmFixtureNameInText('Friendly Cup')).toBe('Friendly Cup');
  });
});

describe('nyhederne til menneskets klub', () => {
  const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g: GameState = gs();
  const ars = g.userClub;
  const lg = Object.values(g.fixtures).filter((f) => f.comp === 'CM7' && (f.home === ars || f.away === ars) && !f.result).sort((a, b) => (a.date < b.date ? -1 : 1));
  const name = (id: number) => g.clubs[id].name, short = (id: number) => g.clubs[id].short;
  const cash = (v: number) => money(v / cmGbp(g, ars));

  it('tv (0x77c46a): ny dag → "moved to {dato}", samme dag og nyt tidspunkt → "to the {tidspunkt}", ellers "chosen"', () => {
    const f = { ...lg[0], date: '2001-09-16', slot: 1 } as Fixture;
    const n0 = g.news.length;
    cmTvNews(g, f, '2001-09-15', 1, 1);
    expect(g.news.length).toBe(n0 + 1);
    expect(newsTitle(g.news[0])).toBe(`${short(f.home)} vs ${short(f.away)} match televised`);
    expect(newsBody(g.news[0])).toBe(`The ${name(f.home)} vs ${name(f.away)} Premier Division match has been moved to Sunday 16th September for live television coverage.`);
    cmTvNews(g, f, '2001-09-16', 1, 2);
    expect(newsBody(g.news[0])).toBe(`The ${name(f.home)} vs ${name(f.away)} Premier Division match has been moved to the evening for live television coverage.`);
    cmTvNews(g, f, '2001-09-16', 1, 1);
    expect(newsBody(g.news[0])).toBe(`The ${name(f.home)} vs ${name(f.away)} Premier Division match has been chosen for live television coverage.`);
  });

  it('flyttet kamp (0x5aac70): sammenstødet med Europa-kampen; samme kamp igen samme dag giver kun den nye dato (køen +0x1128)', () => {
    const f = { ...lg[1], date: '2001-09-23' } as Fixture;
    const other = Object.values(g.clubs).find((c) => c.nation !== g.clubs[ars].nation && c.short)!;
    const clash = { ...f, id: -5, home: other.id, away: ars, comp: 'CL', date: '2001-09-19', cm: undefined } as Fixture;
    const n0 = g.news.length;
    cmMovedNews(g, f, clash);
    expect(g.news.length).toBe(n0 + 1);
    expect(newsTitle(g.news[0])).toBe(`${short(f.home)} vs ${short(f.away)} match re-arranged`);
    const compShort = g.comps.CL?.name ?? '';
    expect(newsBody(g.news[0])).toBe(`The ${name(f.home)} vs ${name(f.away)} Premier Division match has been re-arranged for Sunday 23rd September due to the clash with the ${other.short} vs ${short(ars)} ${compShort} match on Wednesday 19th September.`);
    cmMovedNews(g, { ...f, date: '2001-09-24' }, clash);
    expect(g.news.length).toBe(n0 + 1);
    expect(newsBody(g.news[0])).toMatch(/re-arranged for Monday 24th September/);
  });

  it('præmien (0x48e3e0): kun beløb ≥ omdømme·50; næste runde → "qualifying for the …", finalen → "winning the …"', () => {
    const cup = Object.values(g.comps).find((c) => c.meta?.cmCup === 'ENG')!;
    const f = { ...lg[2], comp: cup.id } as Fixture;
    const opp = f.home === ars ? f.away : f.home;
    const n0 = g.news.length;
    cmPrizeNews(g, cup.id, f, g.clubs[ars], g.clubs[opp], 30000, [220, 10, 20, 30, 40, 50, 120, 130, 150], 3);
    expect(g.news.length).toBe(n0);                                              // Arsenals omdømme·50 > £30.000
    cmPrizeNews(g, cup.id, f, g.clubs[ars], g.clubs[opp], 1_000_000, [220, 10, 20, 30, 40, 50, 120, 130, 150], 3);
    expect(g.news.length).toBe(n0 + 1);
    expect(newsTitle(g.news[0])).toBe(`${short(ars)} awarded ${cash(1_000_000)}`);
    expect(newsBody(g.news[0])).toBe(`${short(ars)} have been awarded ${cash(1_000_000)} for qualifying for the ${compName(cup.name)} Fourth Round.`);
    cmPrizeNews(g, cup.id, f, g.clubs[ars], g.clubs[opp], 2_000_000, [220, 10, 20, 30, 40, 50, 120, 130, 150], 8);
    expect(newsBody(g.news[0])).toBe(`${short(ars)} have been awarded ${cash(2_000_000)} for winning the ${compName(cup.name)}.`);
    // semifinale, finale og bronzekamp (0x8c, sidst i tabellen): finalen er næstsidste runde; bronzekampen art 3 → sejren over modstanderen
    cmPrizeNews(g, cup.id, f, g.clubs[ars], g.clubs[opp], 2_000_000, [130, 150, 140], 0);
    expect(newsBody(g.news[0])).toBe(`${short(ars)} have been awarded ${cash(2_000_000)} for qualifying for the ${compName(cup.name)} Final.`);
    cmPrizeNews(g, cup.id, f, g.clubs[ars], g.clubs[opp], 2_000_000, [130, 150, 140], 1);
    expect(newsBody(g.news[0])).toBe(`${short(ars)} have been awarded ${cash(2_000_000)} for winning the ${compName(cup.name)}.`);
    cmPrizeNews(g, cup.id, f, g.clubs[ars], g.clubs[opp], 2_000_000, [130, 150, 140], 2);
    expect(newsBody(g.news[0])).toBe(`${short(ars)} have been awarded ${cash(2_000_000)} for their win against ${short(opp)} in the ${compName(cup.name)}.`);
  });
});
