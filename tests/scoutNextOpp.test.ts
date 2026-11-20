// Assign Scout ▸ Next Opposition som originalen (cmScoutAsg.ts: 0x7ae9c0/0x7b0050/0x7b3e20 med +0x19d, analysen 0x7b4ec1 og 0x549100–0x549a30;
// teksten 0x7be670 i src/ui/cmScoutOppNews.ts): rapportens valg for en lille konstrueret klub og et helt forløb på den originale database.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { addDays } from '../src/game/dates';
import { ATTRS } from '../src/game/attributes';
import { cmScoutDaily, coversNation } from '../src/game/cmScout';
import { cmAsgOf, cmAsgOn, cmNextOpponent, cmOppKeyRow, cmOppLevel, cmOppTeamFlags, type CmAsgRow } from '../src/game/cmScoutAsg';
import { cmNextOppBody } from '../src/ui/cmScoutOppNews';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import type { GameState, NewsItem, Player } from '../src/game/types';

// ---------------------------------------------------------------- en lille konstrueret verden

const POS = { GK: 0, D: 2, DM: 3, M: 4, AM: 5, F: 6 } as const;
function mkPlayer(id: number, club: number, pos: keyof typeof POS, ca: number, at: Partial<Record<(typeof ATTRS)[number], number>> = {}, side: [number, number, number] = [1, 20, 1]): Player {
  const pp = [1, 1, 1, 1, 1, 1, 1, 1];
  pp[POS[pos]] = 20;
  const attrs = ATTRS.map((k) => at[k] ?? 10);
  return { id, first: `F${id}`, last: `L${id}`, dob: '1975-01-01', nation: 0, club, foot: 'R', height: 180, attrs, pos: pp, side, ca, pa: ca, rep: 50,
    contract: null, condition: 100, morale: 10, form: [], injury: null, banned: 0, yellowCount: 0 } as unknown as Player;
}
function mkWorld(players: Player[], rep = 5000): GameState {
  return {
    date: '2001-10-01', seed: 1, options: { masking: false },
    clubs: { 1: { id: 1, name: 'Opp FC', short: 'Opp', league: 'L1', nation: 0, manager: 10 }, 2: { id: 2, name: 'Mine United', short: 'Mine', league: 'L1', nation: 0, manager: -1 } },
    players: Object.fromEntries(players.map((p) => [p.id, p])),
    staff: { 10: { id: 10, first: 'Gerard', last: 'Houllier', club: 1, role: 'manager', cmNp: [15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3] } },
    comps: { L1: { type: 'league', table: [] } }, leagues: {}, cmClubRep: { 1: rep, 2: 5000 }, fixtures: {}, news: [],
  } as unknown as GameState;
}
const row = (p: Player, ab: number, est = 9000): CmAsgRow => ({ pid: p.id, seen: '2001-10-01', f: 0, est, pot: 0, ab, pt: 0 });

describe('0x7b4f1a: nøglespillerens flag', () => {
  it('positionerne, luftspillet, farten og stabiliteten', () => {
    const st = mkPlayer(1, 1, 'F', 170, { jumping: 19, heading: 20, strength: 16, pace: 19, consistency: 16 });
    const w = mkWorld([st]);
    const k = cmOppKeyRow(w, st, row(st, 4));
    expect(k.fl & 0x100).toBe(0x100);     // angriber (Attacker 20, ingen midtbane)
    expect(k.fl & 0x20).toBe(0x20);       // Jumping > 18, Heading > 14 (intern værdi), Strength > 15
    expect(k.fl & 4).toBe(4);             // Pace > 18
    expect(k.fl & 0x80000).toBe(0x80000); // Consistency > 15
    expect(k.fl & 0x4000).toBe(0x4000);   // Strength > 14
    expect(k.ca).toBe(170);
    const wing = mkPlayer(2, 1, 'M', 150, { creativity: 16 }, [1, 1, 20]);
    const kw = cmOppKeyRow(w, wing, row(wing, 4));
    expect(kw.fl & 0x400).toBe(0x400);    // midtbane
    expect(kw.fl & 0x1000).toBe(0x1000);  // højre side 20 → kant
    expect(kw.fl & 1).toBe(0);            // Creativity er en intern værdi (spillerposten +0x43), ikke den viste
    const inj = mkPlayer(3, 1, 'D', 150);
    (inj as { injury: unknown }).injury = { type: 'x', days: 10 };
    expect(cmOppKeyRow(w, inj, row(inj, 4)).fl & 0x40200).toBe(0x40200);
  });
});

describe('0x549a30 / 0x549100–0x549940: holdets niveau og bytes', () => {
  it('niveauet af gennemsnits-CA for de bedste (n − 1, højst 16) og omdømmet', () => {
    const ps = [mkPlayer(1, 1, 'GK', 170), ...[2, 3, 4, 5].map((i) => mkPlayer(i, 1, 'D', 160)), ...[6, 7, 8, 9].map((i) => mkPlayer(i, 1, 'M', 160)),
      mkPlayer(10, 1, 'F', 160), mkPlayer(11, 1, 'F', 160), mkPlayer(12, 1, 'F', 50)];
    const w = mkWorld(ps);
    // de 11 bedste har snit > 155 (den sidste, CA 50, tæller ikke med – n − 1) → 6; egen klub 5000 (ikke > 7250, ikke < 4250)
    expect(cmOppLevel(w, 1, 2)).toBe(6);
    // egen klub > 7250: modstanderen under 7250 → −1; samme division, 3000 bedre omdømme og stemningerne 0 → −1 igen
    (w.cmClubRep as Record<number, number>)[2] = 8000;
    expect(cmOppLevel(w, 1, 2)).toBe(4);
    const f = cmOppTeamFlags(w, 1);
    expect(f[1]).toBe(1);    // over to forsvarere med CA > omdømme/65 + 40
    expect(f[2]).toBe(1);    // midtbanen
    expect(f[0]).toBe(1);    // over én angriber
    expect(f[10]).toBe(1);   // en målmand
    expect(f[7]).toBe(1);    // forsvarets fart: ingen med Pace > 15 (omdømme/500 + 5, højst 10)
  });
});

describe('0x7be670: rapportens tekst', () => {
  const news = (w: GameState, kp: string, tf: number[], lv: number): NewsItem =>
    ({ key: 'cmsn.a704f8', date: w.date, cat: 'scout', params: { oc: 1, mc: 2, kp, tf: tf.join(','), lv } } as unknown as NewsItem);
  const tf0 = new Array(13).fill(0);
  it('formationen af managerens ikke-spillerpost, niveauet og en verdensklasse-angriber', () => {
    const st = mkPlayer(1, 1, 'F', 170, { pace: 19 });
    const w = mkWorld([st]);
    const body = cmNextOppBody(w, news(w, `1:${0x100 | 4}:170`, tf0, 6));
    expect(body.split('\n\n')).toEqual([
      // Attacking 15, Directness 15 → "an attacking", +0x43 = 3 → 4-4-2
      'Gerard Houllier normally prefers Opp to play an attacking 4-4-2 formation.',
      'Opp have a world class team.',
      'F1 L1 is a world class striker with great pace. The Mine defence will have to pay close attention to his runs.',
    ]);
  });
  it('svagt hold: svaghederne i stedet for nøglespillerne; stemningen < −3 og Work Rate-byten', () => {
    const w = mkWorld([]);
    const tf = tf0.slice(); tf[7] = 1; tf[12] = -4;
    expect(cmNextOppBody(w, news(w, '', tf, 1)).split('\n\n').slice(1)).toEqual([
      "Opp's poor position in the league is not unexpected as their squad lacks any players of real quality.",
      'Their defence lacks pace. This is a weakness that Mine should be able to exploit.',
    ]);
  });
  it('stærkt hold uden nøglespillere: holdets styrke skrives over niveausætningen', () => {
    const w = mkWorld([]);
    const tf = tf0.slice(); tf[0] = 1; tf[1] = 1; tf[2] = 1;
    expect(cmNextOppBody(w, news(w, '', tf, 4)).split('\n\n').slice(1))
      .toEqual(['Opp have no obvious weaknesses which we can exploit.', 'Hard work and determination will be required in order to defeat them.']);
  });
  it('skadet nøglespiller og forsvarerparret', () => {
    const d1 = mkPlayer(1, 1, 'D', 150), d2 = mkPlayer(2, 1, 'D', 140);
    const w = mkWorld([d1, d2]);
    expect(cmNextOppBody(w, news(w, `1:${0x200 | 0x40000}:150|2:${0x200}:140`, tf0, 3)).split('\n\n')[2])
      .toBe('We are fortunate that key defender F1 L1 is currently injured.');
    expect(cmNextOppBody(w, news(w, `1:${0x200}:150|2:${0x200 | 0x80}:140`, tf0, 3)).split('\n\n')[2])
      .toBe('F1 L1 and F2 L2 perform key defensive duties for Opp.');
  });
  it('uden ikke-spillerpost: "… are expected to play a 4-4-2 formation."', () => {
    const w = mkWorld([]);
    (w.clubs as Record<number, { manager: number }>)[1].manager = -1;
    expect(cmNextOppBody(w, news(w, '', tf0, 2)).split('\n\n')).toEqual(['Opp are expected to play a 4-4-2 formation.', 'Opp have a reasonable team.']);
  });
});

describe('Assign Scout ▸ Next Opposition (den originale database, ægte tilstand)', () => {
  it('opgaven → tabellen af modstanderen → rapporten næste dag; opgaven bliver stående', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    const mu = w.clubs.find((c) => c[1] === 'Manchester United')![0];
    createGame(w, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs() as GameState;
    const scout = Object.values(g.staff).find((s) => s.club === g.userClub && s.role === 'scout')!;
    const opp = cmNextOpponent(g, g.userClub);
    expect(opp).not.toBeNull();
    expect(applyAction({ t: 'scout', staffId: scout.id, assignment: { kind: 'nextOpp', target: 0 } })).toBe('ok');
    const a = cmAsgOf(g, scout)!;
    expect(cmAsgOn(a)).toBe(true);
    expect(a.opp).toBe(true);
    expect(a.oppClub).toBe(opp);
    // 0x7aed83: rapportdagen i morgen, runde 1
    expect(a.round).toBe(1);
    expect(a.date).toBe(addDays(g.date, 1));
    // 0x7b0050: kun modstanderens spillere, alle nye
    expect(a.tab.length).toBeGreaterThan(10);
    for (const r of a.tab) { expect(g.players[r.pid].club).toBe(opp); expect(r.f & 1).toBe(1); }
    // dækker intet land (0x7b7576)
    expect(coversNation(g, scout, eng)).toBe(false);
    g.date = addDays(g.date, 1);
    cmScoutDaily(g);
    const n = g.news.find((x) => x.key === 'cmsn.a704f8');
    expect(n, 'rapporten').toBeTruthy();
    // ingen "search started" og ingen anbefalinger
    expect(g.news.some((x) => x.key === 'cmsn.a71028' || x.key === 'cmsn.a70304')).toBe(false);
    const c = g.clubs[opp!];
    expect(newsTitle(n!)).toBe(`${c.short || c.name} scouting completed`);
    const body = newsBody(n!);
    expect(body.split('\n\n').length).toBeGreaterThanOrEqual(2);
    expect(Number(n!.params.lv)).toBeGreaterThanOrEqual(0);
    expect(Number(n!.params.lv)).toBeLessThanOrEqual(6);
    // højst to nøglespillere, modstanderens, med 4+ stjerner (eller 3 og omdømme > 6750), faldende skøn
    const kp = String(n!.params.kp).split('|').filter(Boolean).map((x) => Number(x.split(':')[0]));
    expect(kp.length).toBeLessThanOrEqual(2);
    for (const pid of kp) { expect(g.players[pid].club).toBe(opp); expect(a.tab.find((r) => r.pid === pid)!.ab).toBeGreaterThanOrEqual(3); }
    // opgaven nulstilles ikke (0x7b59d9); runden 2
    expect(cmAsgOn(cmAsgOf(g, scout))).toBe(true);
    expect(cmAsgOf(g, scout)!.round).toBe(2);
    expect(a.tab.every((r) => !(r.f & 1))).toBe(true);
  }, 240000);
});
