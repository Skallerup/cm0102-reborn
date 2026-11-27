// Spilleberettigelsen (ejeren 27/11: "en spiller vælges til holdopstillingen, trods han ikke er spilleberettiget"): TRANSFER_MANAGER::
// get_ineligibility_code 0x8cf5e0 (cmEligibility.ts – ENGLAND_RULES 0x57a090 pokalbundne, EUROPE_RULES 0x5832e0 tilmeldingen, 0x8e8a60
// lejeklausulerne, 0x418f60 udeblevne), pick_team 0x6dbc50's kandidatregler (sim.ts matchOnly – computeren og assistenten), menneskets
// "Pick Team" (pickableFor) og Team Selection 0x7260f0 (teamSelection.ts): en spiller med en af grundene kommer hverken i de 11 eller på
// bænken ved en automatisk udtagelse, og kampen kan ikke starte med ham.
import { readFileSync } from 'node:fs';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { cmCupTiedAfterMatch, cmIneligible } from '../src/game/cmEligibility';
import { matchOnly, pickableFor, prepareMatch, quickReport, userTactic } from '../src/game/sim';
import { autoSelect, newTactic } from '../src/game/tactics';
import { teamSelectionProblem } from '../src/game/teamSelection';
import { cmNeedsPermit } from '../src/game/cmPermit';
import { playerStatusTag } from '../src/game/cmStatusCode';
import { naturalRole } from '../src/game/attributes';
import { ageOn } from '../src/game/dates';
import type { Fixture, MatchReport, Player } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((n) => n.name === 'England');
const muId = world.clubs.find((c) => c[1] === 'Manchester United')![0];

let fid = 900000;
function fixture(comp: string, home: number, away: number, w30?: number): Fixture {
  const g = gs();
  const f: Fixture = { id: ++fid, comp, date: g.date, home, away, round: 1, ...(w30 !== undefined ? { cm: { w30, b34: 0, b3a: 0, f38: 0 } } : {}) };
  g.fixtures[f.id] = f;
  return f;
}
/** de bedste udespillere først – dem, en automatisk udtagelse ellers tager */
const best = (club: number) => squad(club).filter((p) => !p.injury && !(p.banned > 0) && !p.reserves && naturalRole(p) !== 'GK').sort((a, b) => b.ca - a.ca);
const picked = (t: { lineup: number[]; bench: number[] }) => new Set([...t.lineup, ...t.bench]);

describe('spilleberettigelsen 0x8cf5e0 og udtagelsen', () => {
  let mu: number, ars: number, lc: string, fa: string;
  const touched = new Map<number, Pick<Player, 'loan' | 'injury' | 'banned'>>();
  const keep = (...ps: Player[]) => { for (const p of ps) if (!touched.has(p.id)) touched.set(p.id, { loan: p.loan, injury: p.injury, banned: p.banned }); };
  afterEach(() => {
    const g = gs();
    for (const [id, v] of touched) Object.assign(g.players[id], v);
    touched.clear();
    g.cmCupTied = {}; delete g.clubs[mu].euroSquad; g.tactic = null; g.pendingFixture = null;
  });
  beforeAll(() => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: muId, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    const g = gs();
    mu = g.userClub;
    ars = Object.values(g.clubs).find((c) => c.name === 'Arsenal')!.id;
    lc = `LC-${eng}`; fa = `CUP-${eng}`;
    expect(g.comps[lc] && g.comps[fa]).toBeTruthy();
  }, 120000);

  it('ENGLAND_RULES 0x57a090: pokalbunden (Comp_Stats +8 = en anden klub) i FA Cup og League Cup – ikke i ligaen', () => {
    const g = gs();
    const p = best(mu)[0];
    const f = fixture(lc, mu, ars);
    expect(cmIneligible(g, p, f)).toBe(0);
    // record_match_result 0x4a0bdb: han spillede ligacuppen for Arsenal
    cmCupTiedAfterMatch(g, fixture(lc, ars, mu), { players: [{ id: p.id, team: 0 }] } as unknown as MatchReport);
    expect(cmIneligible(g, p, f)).toBe(1);
    expect(cmIneligible(g, p, fixture(fa, mu, ars))).toBe(0);                      // FA Cup'en har sin egen post
    expect(cmIneligible(g, p, fixture(g.clubs[mu].league, mu, ars))).toBe(0);       // ligaen: ingen regel
    // spiller han for sin nuværende klub i turneringen, er posten hans klub
    cmCupTiedAfterMatch(g, f, { players: [{ id: p.id, team: 0 }] } as unknown as MatchReport);
    expect(cmIneligible(g, p, f)).toBe(0);
  });

  it('EUROPE_RULES 0x5832e0: ikke tilmeldt (20+ år) → 8; under 20 år og runde 230/160 fri; Inter-Toto kun i finalen', () => {
    const g = gs();
    const grown = best(mu).find((p) => ageOn(p.dob, g.date) >= 20)!;
    const young = squad(mu).find((p) => ageOn(p.dob, g.date) < 20)!;
    g.clubs[mu].euroSquad = { season: g.season, ids: best(mu).filter((p) => p !== grown && p !== young).slice(0, 20).map((p) => p.id) };
    expect(cmIneligible(g, grown, fixture('CL', mu, ars, 1085))).toBe(8);
    expect(cmIneligible(g, young, fixture('CL', mu, ars, 1085))).toBe(0);
    expect(cmIneligible(g, grown, fixture('UEFA', mu, ars, 233))).toBe(0);         // runde-id 230 (0x4b0870: 233 → 230)
    expect(cmIneligible(g, grown, fixture('UEFA', mu, ars, 163))).toBe(0);
    expect(cmIneligible(g, grown, fixture('UIC', mu, ars, 40))).toBe(0);           // Inter-Toto før finalen: grundreglen
    expect(cmIneligible(g, grown, fixture('UIC', mu, ars, 150))).toBe(8);
    expect(cmIneligible(g, grown, fixture('ESC', mu, ars, 150))).toBe(0);          // Super Cup'en: grundreglen
    // computerens klubber regnes som tilmeldte (0x85aae0 ikke porteret)
    expect(cmIneligible(g, best(ars)[0], fixture('CL', ars, mu, 1085))).toBe(0);
  });

  it('0x8e8a60: lejeklausulerne 0xa (pokalkampe) og 0xb (mod moderklubben); 0x418f60: udeblevet → 9', () => {
    const g = gs();
    const [a, b, c] = best(mu);
    keep(a, b, c);
    a.loan = { from: ars, until: '2002-06-30', noCup: true };
    b.loan = { from: ars, until: '2002-06-30', noAgainst: true };
    c.injury = { key: 'awol', days: 3, total: 3 };
    expect(cmIneligible(g, a, fixture(fa, mu, ars))).toBe(0xa);
    expect(cmIneligible(g, a, fixture(g.clubs[mu].league, mu, ars))).toBe(0);
    expect(cmIneligible(g, b, fixture(g.clubs[mu].league, ars, mu))).toBe(0xb);
    expect(cmIneligible(g, c, fixture(g.clubs[mu].league, mu, ars))).toBe(9);
    expect(playerStatusTag(g, a)).toBe('Cup');                                     // 0x484c20: næste kamp (FA Cup-kampen i dag) → 0xa
  });

  it('matchOnly/pick_team: computerens og assistentens udtagelse tager aldrig en uberettiget spiller (11 + bænk)', () => {
    const g = gs();
    const f = fixture(lc, ars, mu);
    const bad = [best(ars)[0], best(ars)[1], best(mu)[0], best(mu)[1]];
    keep(...bad);
    cmCupTiedAfterMatch(g, fixture(lc, mu, ars), { players: [{ id: bad[0].id, team: 0 }, { id: bad[2].id, team: 1 }] } as unknown as MatchReport);
    bad[1].loan = { from: mu, until: '2002-06-30', noAgainst: true };
    bad[3].loan = { from: ars, until: '2002-06-30', noCup: true };
    for (const p of bad) expect(cmIneligible(g, p, f)).not.toBe(0);
    expect(matchOnly(ars, f.comp, f)?.has(bad[0].id)).toBe(false);
    g.pendingFixture = f.id;
    g.tactic = null;
    const m = prepareMatch(f, true);
    for (const p of bad) { expect(m.home.players.has(p.id)).toBe(false); expect(m.away.players.has(p.id)).toBe(false); }
    expect(picked(m.away.tactic).has(bad[2].id) || picked(m.away.tactic).has(bad[3].id)).toBe(false);
    // hele kampen (gittermotoren: computerens pick_team og indskiftningerne)
    const rep = quickReport()!;
    for (const p of bad) expect(rep.players.some((l) => l.id === p.id)).toBe(false);
    for (const side of [0, 1] as const) for (const id of rep.bench?.[side] ?? []) expect(bad.some((p) => p.id === id)).toBe(false);
  });

  it('"Pick Team" (pickableFor) og Team Selection 0x7260f0: pokalbundne, lejeklausul, karantæne, skade, ikke tilmeldt', () => {
    const g = gs();
    const f = fixture(lc, mu, ars);
    g.pendingFixture = f.id;
    const [a, b] = best(mu);
    keep(a, b);
    cmCupTiedAfterMatch(g, fixture(lc, ars, mu), { players: [{ id: a.id, team: 0 }] } as unknown as MatchReport);
    b.loan = { from: ars, until: '2002-06-30', noAgainst: true };
    const t = autoSelect(newTactic('4-4-2'), pickableFor(mu, squad(mu)));
    expect(picked(t).has(a.id) || picked(t).has(b.id)).toBe(false);
    expect(picked(t).size).toBeGreaterThanOrEqual(14);
    // mennesket sætter dem selv ind: Team Selection melder den første grund – de pokalbundne (kode 1), ikke lejeklausulen (0xb)
    const mine = { ...t, lineup: [a.id, ...t.lineup.slice(1)], bench: [b.id, ...t.bench] };
    expect(teamSelectionProblem(g, mu, f, [...mine.lineup, ...mine.bench])).toEqual({ key: 'cup', ids: [a.id] });
    expect(teamSelectionProblem(g, mu, f, [...t.lineup, b.id])).toEqual({ key: 'loanM', ids: [b.id] });
    const [c, d] = best(mu).filter((p) => !picked(t).has(p.id) && p !== a && p !== b);
    keep(a, b, c, d);
    c.banned = 1; d.injury = { key: 'knee', days: 10, total: 10 };
    expect(teamSelectionProblem(g, mu, f, [...t.lineup, c.id, d.id])).toEqual({ key: 'ban', ids: [c.id] });
    expect(teamSelectionProblem(g, mu, f, [...t.lineup, d.id])).toEqual({ key: 'inj', ids: [d.id] });
    expect(teamSelectionProblem(g, mu, f, t.lineup)).toBeNull();
    // kampen spilles med assistentens udfyldning: de uberettigede fjernes (validateTactic over matchOnly)
    g.tactic = mine;
    const ut = userTactic(false, matchOnly(mu, f.comp, f));
    expect(picked(ut).has(a.id) || picked(ut).has(b.id)).toBe(false);
    // European Squad: ikke tilmeldt
    const cl = fixture('CL', mu, ars, 1085);
    g.pendingFixture = cl.id;
    const grown = best(mu).filter((p) => ageOn(p.dob, g.date) >= 20);
    g.clubs[mu].euroSquad = { season: g.season, ids: squad(mu).filter((p) => p !== grown[4]).map((p) => p.id) };
    expect(picked(autoSelect(newTactic('4-4-2'), pickableFor(mu, squad(mu)))).has(grown[4].id)).toBe(false);
    expect(teamSelectionProblem(g, mu, cl, [grown[4].id])).toEqual({ key: 'unreg', ids: [grown[4].id] });
  });

  it('0x8c7560: en spiller uden arbejdstilladelse kommer ikke i computerens kandidater', () => {
    const g = gs();
    const f = fixture(g.clubs[mu].league, ars, mu);
    const nonEu = best(ars).find((p) => cmNeedsPermit(g, p, ars, true));
    expect(nonEu).toBeTruthy();
    const p = nonEu as Player;
    expect(matchOnly(ars, f.comp, f)).toBeNull();
    const rec = g.cmPermit![p.id];
    delete g.cmPermit![p.id];                                                     // ingen post i historikken → skal have tilladelse
    expect(cmNeedsPermit(g, p, ars, false)).toBe(true);
    expect(matchOnly(ars, f.comp, f)?.has(p.id)).toBe(false);
    g.cmPermit![p.id] = rec;
  });
});
