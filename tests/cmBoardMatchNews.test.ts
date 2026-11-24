// Bestyrelsens kampreaktion (0x695240 → 0x6a5fa0, nyhed 0x138c; tekst 0x6a6310/0x6a69c0): ejerens melding 24/11 – en storsejr over en topklub
// gav ingen nyhed (cmBoardGame.ts boardNews smed 'match' væk).
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { afterMatch, matchRunSentence, newRec, MATCH_TEXT, type BoardEnv, type BoardNews, type CmBoardState, type MatchIn } from '../src/game/cmBoard';
import { matchReactionText } from '../src/game/cmBoardText';

const MU = 1, ARS = 2;
/** 11 startere à 90 minutter med karakteren r og omdømmet 8000 (+0xb set af modstanderen) */
const side = (club: number, r: number) => ({ club, b8: 10, b9: 10, rows: Array.from({ length: 11 }, () => ({ rating: r, minutes: 90, redAt: -1, rep: 8000 })) });
function run(gh: number, ga: number, o: { derby?: 0 | 0x40 | 0x80; w6?: number; friendly?: boolean } = {}): BoardNews[] {
  const news: BoardNews[] = [];
  const env = {
    today: { day: 300, year: 2001 }, gameStart: { day: 360, year: 2001 },                // før spillets start → considerDeparture går ud straks
    manager: () => ({ id: 9, np: null, human: true, rep: [5000, 5000, 5000] }),
    clubRep: (c: number) => (c === MU ? 9000 : 8800), clubNation: () => 0, isHumanClub: (c: number) => c === MU, isNat: () => false,
    chair: () => null, canBeManaged: () => true, retiring: () => false, entry: () => null, division: () => null, league: () => null,
    news: (n: BoardNews) => news.push(n),
  } as unknown as BoardEnv;
  const st: CmBoardState = { rec: { [MU]: { ...newRec(), w6: o.w6 ?? 7000, w8: 7000, wa: 7000, wc: 7000 }, [ARS]: { ...newRec(), w6: 7000 } }, dep: [], vac: [], ult: [], month: 0 };
  const m: MatchIn = {
    home: MU, away: ARS, len: 90, b3a: 0, w30: 0, w32: 0, w38: 0, gh, ga, aggH: 0xff, aggA: 0xff, penH: 0, penA: 0, compRep: 15,
    isDivision: () => true, friendly: !!o.friendly, inContention: () => true, derby: () => o.derby ?? 0, venueHome: true, sides: [side(MU, 8), side(ARS, 6)], compName: 'Premier Division',
  };
  afterMatch(env, st, m, () => 0);
  return news.filter((n) => n.t === 'match');                                 // (modstanderens 'protest' tæller ikke)
}
const text = (n: BoardNews) => {
  if (n.t !== 'match') throw new Error(n.t);
  return matchReactionText({ k: 'm', f: n.flags, tpl: n.tpl, run: n.run, club: 'Manchester United', nat: '', opp: 'Arsenal', cs: 'Man Utd', os: 'Arsenal', sc: `${Math.max(n.gf, n.ga)}-${Math.min(n.gf, n.ga)}`, comp: n.comp });
};

describe('bestyrelsens kampreaktion (0x138c)', () => {
  it('storsejr 6-2 over en topklub → nyhed med originalens tekst', () => {
    const n = run(6, 2);
    expect(n).toHaveLength(1);
    const t = text(n[0]);
    expect(n[0].t === 'match' && n[0].flags & 0x800).toBeTruthy();
    expect(t.title).toMatch(/^Board delighted after Arsenal game$|^Arsenal match pleases board$/);
    expect(t.body).toMatch(/^The Manchester United board of directors are (absolutely )?delighted with the (magnificent|excellent) 6-2 (Premier Division )?victory over Arsenal/);
  });
  it('rivalerne (0x80): derbyteksten', () => {
    const n = run(6, 2, { derby: 0x80 });
    expect(n).toHaveLength(1);
    expect(text(n[0]).body).toContain('6-2 victory over Arsenal in the Premier Division.');
  });
  it('lokalderby (0x40): derbyoverskriften', () => {
    const n = run(6, 2, { derby: 0x40 });
    expect(text(n[0]).title).toMatch(/derby/);
  });
  it('flag uden tekst i 0x6a69c0 → ingen nyhed (uafgjort uden reaktion)', () => {
    expect(run(1, 1)).toHaveLength(0);
  });
  it('MATCH_TEXT og stimens sætning', () => {
    expect(MATCH_TEXT[0x808]).toEqual([29, 29]);
    expect(MATCH_TEXT[0x1004]).toBeUndefined();
    expect(matchRunSentence(2, 3, 2, 1, 0, null)).toBe('impressed');
    expect(matchRunSentence(2, 3, 5, 1, 0, null)).toBe('');                // placeringen dårligere end ventet: ingen sætning (sic)
    expect(matchRunSentence(-2, 3, 8, 1, 0, null)).toBe('newMgr');
    expect(matchRunSentence(-2, 3, 6, 1, 2, null)).toBe('lChamp');
  });
});
