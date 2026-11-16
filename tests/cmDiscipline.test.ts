// CM 01/02's karantæner og appel (discipline.cpp/RulingBody/manager_manager.cpp i cm0102.exe 3.9.68) – cmDiscipline.ts.
// Ejerens fund 16/11: "Klaus Eskildsen banned for 3 match(es)" efter en VENSKABSKAMP 5/7-2001 og en Appeal-knap med en opfundet tekst.
// Originalen: 0x55ca00 sender venskabskampe til holdenes liga-organ uden afsoning, og 0x7e8270 springer kortene over (kun overfald på
// dommeren, kode 12, giver karantæne).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { addDays } from '../src/game/dates';
import { cmAppealAsk, cmAppealOpen, cmBanLeft, cmBansOf, cmDiscAfterMatch, cmDiscDaily, rbOfComp } from '../src/game/cmDiscipline';
import type { Fixture, MatchReport, Player, PlayerMatchLine } from '../src/game/types';
import { cmBanAnswerBody, cmBanBody } from '../src/ui/cmBanText';
import { setLang } from '../src/i18n';
import type { NewsItem } from '../src/game/types';
const newsBody = (n: NewsItem) => (n.key.startsWith('cmban.h') ? cmBanBody(n) : cmBanAnswerBody(n));

let fid = 9_000_000;
function match(comp: string, home: number, away: number, lines: Partial<PlayerMatchLine>[], score: [number, number] = [1, 2]): [Fixture, MatchReport] {
  const g = gs();
  const f = { id: fid++, comp, home, away, date: g.date } as unknown as Fixture;
  const rep = {
    stats: [{ goals: score[0] }, { goals: score[1] }],
    players: lines.map((l) => ({ team: 0, yellow: 0, red: false, ...l })),
    events: [],
  } as unknown as MatchReport;
  return [f, rep];
}
const card = (p: Player, l: Partial<PlayerMatchLine>): Partial<PlayerMatchLine> => ({ id: p.id, team: 0, ...l });
const banNews = (pid: number) => gs().news.filter((n) => n.key.startsWith('cmban.h') && Number(n.params.pid) === pid);

describe('karantæner som originalen (3.9.68, ægte tilstand)', { timeout: 120_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original-3968.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  const ars = world.clubs.find((c) => c[1] === 'Arsenal')![0];
  const pick = (k: number) => squad(mu).filter((p) => !p.virtual).sort((a, b) => a.id - b.id)[k];

  it('venskabskamp: rødt kort giver ingen karantæne og ingen nyhed (0x55ca00 → 0x7e8270)', () => {
    setLang('en');
    createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const p = pick(0);
    const [f, rep] = match('FRIENDLY', mu, ars, [card(p, { red: true, cy: 0, cw: [10, 0xff] })]);
    cmDiscAfterMatch(gs(), f, rep);
    expect(cmBansOf(gs(), p.id)).toEqual([]);
    expect(p.banned).toBe(0);
    expect(banNews(p.id)).toEqual([]);
    // overfald på dommeren (kode 12) giver også i en venskabskamp en verdensomspændende karantæne (0x55e300)
    const q = pick(1);
    const [f2, rep2] = match('FRIENDLY', mu, ars, [card(q, { red: true, cy: 0, cw: [12, 0xff] })]);
    cmDiscAfterMatch(gs(), f2, rep2);
    expect(cmBansOf(gs(), q.id)[0]).toMatchObject({ m: -1, why: 3, rb: [-1, -1, -1, 0] });
    expect([90, 180]).toContain(cmBansOf(gs(), q.id)[0].d);
    expect(banNews(q.id)[0]?.key).toBe('cmban.hD');
    expect(cmAppealOpen(gs(), banNews(q.id)[0])).toBe(false);               // bit 1: overfald kan ikke appelleres
  });

  it('ligakamp: lige rødt (kode ≥ 9) = 3 kampe fra om 14 dage, kun engelske turneringer; nyheden er originalens', () => {
    const g = gs();
    const lg = g.clubs[mu].league;
    expect(rbOfComp(g, lg)).toBe(9);
    const p = pick(2);
    const [f, rep] = match(lg, mu, ars, [card(p, { red: true, cy: 0, cw: [9, 0xff] })], [1, 2]);
    cmDiscAfterMatch(g, f, rep);
    const b = cmBansOf(g, p.id)[0];
    expect(b).toMatchObject({ m: 3, s: 0, d: -1, why: 2, rb: [9, -1, -1, -1], st: addDays(g.date, 14) });
    expect(cmBanLeft(g, p, 9)).toBe(0);                                      // før startdatoen må han spille
    const n = banNews(p.id)[0];
    expect(n.key).toBe('cmban.hN');
    expect(n.params.m).toBe(3);
    expect(newsBody(n)).toMatch(/has been banned for 3 English matches starting on the \d+(st|nd|rd|th) \w+ 2001, after being sent off in Manchester United's 2-1 defeat by Arsenal\./);
    // efter startdatoen: udelukket i ligaen, men ikke i Europa (organ 1)
    g.date = addDays(g.date, 14);
    expect(cmBanLeft(g, p, 9)).toBe(3);
    expect(cmBanLeft(g, p, 1)).toBe(0);
    // en ligakamp afsoner én kamp for hele truppen (0x7e80a6) – også for den, der ikke spillede
    const [f2, rep2] = match(lg, mu, ars, [], [0, 0]);
    cmDiscAfterMatch(g, f2, rep2);
    expect(cmBansOf(g, p.id)[0].s).toBe(1);
    expect(cmBanLeft(g, p, 9)).toBe(2);
    // andet røde kort i sæsonen (uden kode): 1 + tidligere røde = 2, lagt oven i den løbende (bit 0 "further")
    const [f3, rep3] = match(lg, mu, ars, [card(p, { red: true, cy: 2 })], [2, 0]);
    cmDiscAfterMatch(g, f3, rep3);
    expect(cmBansOf(g, p.id)[0].m).toBe(5);
    expect(newsBody(banNews(p.id)[0])).toContain('has been banned for a further 2 English matches after being sent off');
  });

  it('advarsler: 5 før 1. marts = 1 kamp; nyheden kan ikke appelleres (grund 1)', () => {
    const g = gs();
    const lg = g.clubs[mu].league;
    const p = pick(3);
    for (let i = 0; i < 4; i++) { const [f, rep] = match(lg, mu, ars, [card(p, { yellow: 1, cy: 1 })]); cmDiscAfterMatch(g, f, rep); }
    expect(cmBansOf(g, p.id)).toEqual([]);
    const [f, rep] = match(lg, mu, ars, [card(p, { yellow: 1, cy: 1 })], [3, 1]);
    cmDiscAfterMatch(g, f, rep);
    expect(cmBansOf(g, p.id)[0]).toMatchObject({ m: 1, why: 1, n: 5 });
    const n = banNews(p.id)[0];
    expect(n.key).toBe('cmban.h1');
    expect(newsBody(n)).toMatch(/has been banned for one English match starting on the .+, after collecting 5 yellow cards\.$/);
    expect(cmAppealOpen(g, n)).toBe(false);
    // efter 1. marts giver den 5. advarsel ingen karantæne (0x7dd14e)
    const q = pick(4);
    g.date = `${g.season + 1}-03-02`;
    for (let i = 0; i < 5; i++) { const [f2, rep2] = match(lg, mu, ars, [card(q, { yellow: 1, cy: 1 })]); cmDiscAfterMatch(g, f2, rep2); }
    expect(cmBansOf(g, q.id)).toEqual([]);
  });

  it('Europa (organ 1): rødt kort = 1 kamp fra i dag, kun i Europa', () => {
    const g = gs();
    const eu = Object.values(g.comps).find((c) => c.type === 'continental')!;
    expect(rbOfComp(g, eu.id)).toBe(1);
    const p = pick(5);
    const [f, rep] = match(eu.id, mu, ars, [card(p, { red: true, cy: 1 })]);
    cmDiscAfterMatch(g, f, rep);
    expect(cmBansOf(g, p.id)[0]).toMatchObject({ m: 1, rb: [-1, 1, -1, -1], st: g.date });
    expect(cmBanLeft(g, p, 1)).toBe(1);
    expect(cmBanLeft(g, p, 9)).toBe(0);
    expect(newsBody(banNews(p.id)[0])).toContain('has been banned for one European match after being sent off in');
  });

  it('appel: knappen Appeal, "Appeal against the 3 game ban …", svaret fra FA efter 2 dage (0x6ab800/0x6abef0/0x6ac190)', () => {
    const g = gs();
    g.date = `${g.season}-09-01`;
    const lg = g.clubs[mu].league;
    const p = pick(6);
    const [f, rep] = match(lg, mu, ars, [card(p, { red: true, cy: 0, cw: [10, 0xff] })], [2, 2]);
    cmDiscAfterMatch(g, f, rep);
    const n = banNews(p.id)[0];
    expect(cmAppealOpen(g, n)).toBe(true);
    const ask = cmAppealAsk(n);
    expect(ask).toMatchObject({ key: 'cmban.ask.games', n: 3 });
    expect(act({ t: 'cmAppeal', news: n.id })).toBe('ok');
    expect(n.params.appealed).toBe(1);
    expect(cmAppealOpen(g, n)).toBe(false);
    expect(newsBody(n)).toContain('You have appealed against this decision, the Football Association have indicated that they will announce their decision on this matter in the near future.');
    expect(g.cmDisc!.appeals).toHaveLength(1);
    expect(g.cmDisc!.appeals[0].due).toBe(addDays(g.date, 2));
    g.date = addDays(g.date, 1); cmDiscDaily(g);
    expect(gs().news.some((x) => x.key.startsWith('cmban.fa.'))).toBe(false);
    g.date = addDays(g.date, 1); cmDiscDaily(g);
    const ans = gs().news.find((x) => x.key.startsWith('cmban.fa.'))!;
    expect(ans).toBeTruthy();
    const a = { dismiss: 'have dismissed your request for the repeal of the ban against', reduce: 'has been reduced by', revoke: 'has been revoked' };
    const kind = ans.key.slice('cmban.fa.'.length) as keyof typeof a;
    expect(newsBody(ans)).toContain(a[kind]);
    expect(newsBody(ans)).toContain('The English Football Association');
    if (kind === 'dismiss') expect(cmBansOf(g, p.id)[0].m).toBe(3);
    if (kind === 'reduce') expect(cmBansOf(g, p.id)[0].m).toBeLessThan(3);
  });
});
