// Ejerens melding 25/11 (Man Utd, ægte tilstand): "The board are unhappy with results – If things don't improve soon, you will be sacked" dagen
// før "generally satisfied with your performance", og "Ronaldinho impressing at Manchester United" hver måned.
// A: de tre originale nyheder bag den opfundne advarsel – 0x6a0e70/0x6a1190 (0x1777), 0x6a5d10/0x6a5e30 (0x1782), 0x6ac700/0x6ac880 (0x178d).
// B: CM Reborns månedsklumme (media.ts monthlyColumn) kører ikke i ægte tilstand – "impressing at" findes ikke i exe'en.
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { readFileSync } from 'node:fs';
import { confidenceBand, considerDeparture, isoToCm, newRec, npShown, type BoardEnv, type BoardNews, type CmBoardState } from '../src/game/cmBoard';
import { boardCmText, confidenceText, pressureText } from '../src/game/cmBoardText';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { monthlyColumn } from '../src/game/media';

const MU = 1;
const seq = (...xs: number[]) => { let i = 0; return (n: number) => { const v = xs[i++] ?? 0; return n > 0 ? v % n : 0; }; };
/** 0x69aba0 for Man Utd uden division (ingen ligasituation), menneskemanager ansat for 400 dage siden, formand med Patience 10 */
function sack(w6: number, rands: number[], o: { w8?: number; chair?: boolean } = {}): { news: BoardNews[]; st: CmBoardState } {
  const news: BoardNews[] = [];
  const env = {
    today: isoToCm('2002-11-30'), gameStart: isoToCm('2001-07-14'),
    manager: () => ({ id: 9, np: true, human: true, rep: [3000, 3000, 3000], joined: isoToCm('2001-07-14'), ca: 0, at: () => 0, pres: 10 }),
    clubRep: () => 9000, isNat: () => false, chair: () => (o.chair === false ? null : { b16: 10, b1d: 10, amb: 15, nation: 0 }),
    division: () => null, league: () => null, entry: () => null, retiring: () => false, news: (n: BoardNews) => news.push(n),
  } as unknown as BoardEnv;
  const st: CmBoardState = { rec: { [MU]: { ...newRec(), w6, w8: o.w8 ?? 7000, wa: 7000, wc: 7000 } }, dep: [], vac: [], ult: [], month: 0 };
  considerDeparture(env, st, MU, false, seq(...rands));
  return { news, st };
}
const pp = (n: BoardNews, ch = 'Martin Edwards') => {
  if (n.t !== 'pressure') throw new Error(n.t);
  return pressureText({ k: 'pp', kind: n.kind, v: n.v, t: n.tt, cs: 'Man Utd', club: 'Manchester United', m: 'Bo Ek', ch, nat: '' });
};

describe('A: 0x6a0e70 "manager under pressure" i stedet for den opfundne advarsel', () => {
  it('tillid 4275 (originalens beskyttelsesværdi): vurderingen kører (≤ 4275) og giver "vote of confidence", månedens tekst "generally satisfied"', () => {
    // (e) rand(500) = 0 ≤ 10, (f) rand(11) = 1 → intet ultimatum, (h) uden division ingen beslutning → 0x6a0e70(c, 2): v = 0, t = rand(10) = 3
    const { news, st } = sack(4275, [0, 1, 3]);
    expect(news).toHaveLength(1);
    const n = news[0];
    expect(n).toMatchObject({ t: 'pressure', kind: 2, v: 0, tt: 3 });
    const t = pp(n);
    expect(t.title).toBe('Man Utd board give Bo Ek vote of confidence');
    expect(t.body).toBe("Manchester United chairman Martin Edwards has announced that Bo Ek's job as manager is safe.");
    expect(st.rec[MU].d18).toEqual(isoToCm('2002-11-30'));
    // dagen efter: samme tal (+0x06 = 4275) i 0x690b70 → bånd 3, og 0x690d80 (formue 1–2, ligabånd ≥ 3) → "generally satisfied"
    expect(confidenceBand(4275)).toBe(3);
    expect(confidenceText({ club: 'Manchester United', days: 500, wealth: 2, leagueBand: 3, confBand: 3, runType: 5, runLen: 0, arrogDays: 9999, conf: 4275, fans: 0 }))
      .toMatch(/^The Manchester United directors are generally satisfied with your performance as manager\./);
  });
  it('tilhængerne halter (w8 < w6 − 500, rand(3) = 0): "despite increasing supporter unrest"', () => {
    const { news } = sack(4000, [0, 1, 0, 5], { w8: 2000 });
    expect(news[0]).toMatchObject({ kind: 2, v: 2, tt: 5 });
    expect(pp(news[0]).body).toBe("Manchester United chairman Martin Edwards has announced that despite increasing supporter unrest, Bo Ek's job as manager is safe.");
    expect(pp(news[0], '').body).toBe("The Manchester United Board have announced that despite increasing supporter unrest, Bo Ek's job as manager is safe.");
  });
  it('t = 0 med formand: "publicly warned" – overskriften er stadig "vote of confidence" (0x6a13a3 skriver oven i "told to stop the rot")', () => {
    const { news } = sack(4275, [0, 1, 0]);
    const t = pp(news[0]);
    expect(t.title).toBe('Man Utd board give Bo Ek vote of confidence');
    expect(t.body).toMatch(/^Bo Ek has been publicly warned by Manchester United chairman Martin Edwards that he expects results to improve dramatically/);
  });
  it('kind 1 (bestyrelsen beholder manageren): "board consider … position" og t 0/1/andet', () => {
    const d = (t: number) => boardCmText({ k: 'pp', kind: 1, v: 0, t, cs: 'Man Utd', club: 'Manchester United', m: 'Bo Ek', ch: 'Martin Edwards', nat: '' });
    expect(d(0).title).toBe("Man Utd board consider Bo Ek's position");
    expect(d(0).body).toMatch(/^The Manchester United board have held a meeting with Bo Ek during which[^\n]+\n\nMedia commentators have interpreted this as an ultimatum to Bo Ek/);
    expect(d(1).body).toBe('The Manchester United board have made it clear that it expects boss Bo Ek to start producing some positive results shortly.');
    expect(d(4).body).toBe('It is rumoured that Manchester United are shortlisting managers as possible replacements for Bo Ek.');
    const fa = boardCmText({ k: 'pp', kind: 1, v: 0, t: 0, cs: 'England', club: 'England', m: 'Bo Ek', ch: '', nat: 'English' });
    expect(fa).toEqual({ title: "English FA consider Bo Ek's position", body: 'It is rumoured that the English FA are shortlisting managers for replacing Bo Ek.' });
  });
  it('supporterprotesten og ultimatummet med originalens tekster', () => {
    expect(boardCmText({ k: 'sp', club: 'Manchester United', m: 'Bo Ek' })).toEqual({ title: 'Supporter Protest',
      body: "Manchester United supporters gathered outside the training ground today to protest against Bo Ek's poor handling of club affairs." });
    expect(boardCmText({ k: 'ul', cs: 'Man Utd', club: 'Manchester United', m: 'Bo Ek', opp: 'Arsenal', comp: 'Premier Division' })).toEqual({
      title: 'Man Utd manager given ultimatum by board',
      body: 'The Manchester United board appear to finally be losing patience with manager Bo Ek.\n\nIt is rumoured in the press that a bad result against Arsenal in the forthcoming Premier Division match would seal his fate.' });
  });
  it('0x544410: menneskets post (CA 0, Motivating 0) → 7, så slot 11 er rand(10)', () => {
    expect(npShown(0, 0)).toBe(7);
    expect(npShown(150, 40)).toBeGreaterThan(10);
  });
});

describe('B og i spillet (3.9.60, ægte tilstand)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  it('ingen "impressing at"-klumme den 1., selv for et nyindkøb med høj snitkarakter', () => {
    createGame(world, { managerName: 'Bo Ek', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    // ligaen har spillet 4 runder, og et nyindkøb har snit 7,5 (før: 'column.signingImpresses' hver måned i 150 dage)
    const comp = g.comps[g.clubs[mu].league];
    if (comp.type === 'league') for (const r of comp.table) r.p = 4;
    const p = Object.values(g.players).find((x) => x.club === mu)!;
    p.joined = g.date;
    p.stats.ratingSum = 7.5 * 5; p.stats.ratingCount = 5;
    const before = g.news.length;
    monthlyColumn();
    expect(g.news.slice(0, Math.max(0, g.news.length - before)).filter((n) => n.key.startsWith('column.'))).toEqual([]);
  }, 600000);
});
