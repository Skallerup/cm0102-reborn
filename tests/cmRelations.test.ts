// Forholdene staff+0x65 / club +0x9b..+0xaf (cmRelations.ts) – primitiverne 0x547870–0x548082 efter disassemblyen, falmningen 0x547f90,
// spilstartens indlæsning (ikke-indlæste id'er → 0 på pladsen), 0x5d6d10 og kampens læsere (sub_6ec010's forhold, afleveringsmulighederne).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  addDisPerson, addFavClub, addFavPerson, addDisClub, captainRel, clubAddFav, clubDislikes, clubFavours, cmRelDaily, cmRelNewGame, dislikesClub,
  dislikesPerson, fadeRelations, favoursClub, favoursPerson, matchRelOf, removeDisPerson, removeFavClub, removeFavPerson,
} from '../src/game/cmRelations';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { staffStateDaily } from '../src/game/cmPlayerData';
import type { Club, GameState, Player } from '../src/game/types';

const P = (id: number, rel?: number[]): Player => ({ id, pos: [], attrs: [], cmRel: rel?.slice() } as unknown as Player);
const seq = (xs: number[]) => { let i = 0; return (n: number) => { const v = xs[i++]; expect(v, `rand(${n})`).toBeDefined(); return v; }; };
const none = () => { throw new Error('ingen tilfældige tal'); };

describe('primitiverne 0x547a10/0x547af0/0x547c10/0x547c50', () => {
  it('0x547a10: første tomme yndlingsplads; en uven fjernes i stedet; fuld + flag → rand(3)', () => {
    const o = P(1);
    addFavPerson(o, 7, true, none); expect(o.cmRel!.slice(6, 12)).toEqual([7, 0, 0, 0, 0, 0]);
    addFavPerson(o, 7, true, none); expect(o.cmRel!.slice(6, 9)).toEqual([7, 0, 0]);                  // findes allerede
    o.cmRel![10] = 9;
    addFavPerson(o, 9, true, none); expect(o.cmRel!.slice(6, 12)).toEqual([7, 0, 0, 0, 0, 0]);        // uven 9 fjernet, ikke yndling
    addFavPerson(o, 8, false, none); addFavPerson(o, 5, false, none); addFavPerson(o, 4, false, none);
    expect(o.cmRel!.slice(6, 9)).toEqual([7, 8, 5]);                                                   // fuld uden flag: intet
    addFavPerson(o, 4, true, seq([1])); expect(o.cmRel!.slice(6, 9)).toEqual([7, 4, 5]);
  });
  it('0x547af0: ikke sig selv; en yndling fjernes i stedet', () => {
    const o = P(3, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0]);
    addDisPerson(o, 3, true, none); expect(o.cmRel!.slice(9, 12)).toEqual([0, 0, 0]);
    addDisPerson(o, 6, true, none); expect(o.cmRel!.slice(6, 12)).toEqual([0, 0, 0, 0, 0, 0]);
    addDisPerson(o, 6, true, none); expect(o.cmRel!.slice(9, 12)).toEqual([6, 0, 0]);
    expect(dislikesPerson(o, 6)).toBe(true); expect(favoursPerson(o, 6)).toBe(false);
    removeDisPerson(o, 6); expect(dislikesPerson(o, 6)).toBe(false);
    addFavPerson(o, 2, false, none); removeFavPerson(o, 2); expect(favoursPerson(o, 2)).toBe(false);
  });
  it('klubberne 0x547d90/0x547e70/0x547f50 og klubbens personer 0x547870 (intet, hvis klubben har personen i den modsatte liste)', () => {
    const club = { id: 50, cmPrefs: [0, 0, 0, 0, 0, 0] } as unknown as Club;
    const g = { clubs: { 50: club } } as unknown as GameState;
    const o = P(4);
    addFavClub(g, o, 50, false, none); expect(favoursClub(o, 50)).toBe(true);
    addDisClub(g, o, 50, false, none); expect(favoursClub(o, 50)).toBe(false); expect(dislikesClub(o, 50)).toBe(false);   // den første fjernes
    addDisClub(g, o, 50, false, none); expect(dislikesClub(o, 50)).toBe(true);
    club.cmPrefs![0] = 4;                                                                              // klubben har ham i +0x9b
    addFavClub(g, o, 50, false, none); expect(dislikesClub(o, 50)).toBe(true);                         // 0x547d90 springer over
    expect(clubFavours(club, 4)).toBe(true); expect(clubDislikes(club, 4)).toBe(false);
    clubAddFav(club, 9, false, none); expect(club.cmPrefs).toEqual([4, 9, 0, 0, 0, 0]);
    const o2 = P(5); addFavClub(g, o2, 50, false, none); removeFavClub(o2, 50); expect(favoursClub(o2, 50)).toBe(false);
  });
  it('0x547f90: yndlinge med rand(Loyalty + 15) = 0, uvenner med rand(35 − Temperament) = 0 forsvinder', () => {
    const o = { id: 1, pos: [], attrs: [], cmRel: [0, 0, 0, 0, 0, 0, 11, 0, 12, 13, 0, 14] } as unknown as Player;
    const calls: number[] = [];
    fadeRelations(o, (n) => { calls.push(n); return calls.length === 1 || calls.length === 4 ? 0 : 1; });
    expect(calls).toEqual([25, 25, 25, 25]);                                                           // Loyalty/Temperament 10 (standard)
    expect(o.cmRel).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 12, 13, 0, 0]);
  });
});

describe('spillet (den originale database)', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData & { cmRaw: Record<string, unknown> };
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const arsenal = world.clubs.find((c) => c[1] === 'Arsenal')![0] as number;
  const spurs = world.clubs.find((c) => c[1] === 'Tottenham')?.[0] as number | undefined;
  // databasens præferencer (3.9.60, staff.dat +97..+144) for Henry (29700) og Keown (55141), Arsenals personer (club.dat +155..+175) – 99999999
  // findes ikke i spillet (bliver 0 på sin plads)
  const prefs = { 29700: [arsenal, 0, 0, 6920, 0, 0, 99999999, 0, 55141, 0, 0, 0], 55141: [arsenal, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29700] };
  const clubPrefs = { [arsenal]: [55141, 0, 0, 99999999, 0, 29700] };
  createGame({ ...world, cmRaw: { ...world.cmRaw, prefs, clubPrefs } } as WorldData, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0] as number, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();
  it('indlæsningen: ikke-indlæste personer bliver 0, pladserne bevares', () => {
    expect(g.players[29700].cmRel).toEqual([arsenal, 0, 0, g.clubs[6920] ? 6920 : 0, 0, 0, 0, 0, 55141, 0, 0, 0]);
    expect(g.clubs[arsenal].cmPrefs).toEqual([55141, 0, 0, 0, 0, 29700]);
  });
  it('sub_6ec010s forhold: egen klub, modstanderen, anføreren', () => {
    const henry = g.players[29700], keown = g.players[55141];
    const r = matchRelOf(g, keown, arsenal, spurs ?? 0);
    expect(r.favoursOwn).toBe(true); expect(r.dislikesOwn).toBe(false); expect(r.favoursOpp).toBe(false);
    if (spurs) expect(matchRelOf(g, keown, spurs, arsenal).favoursOpp).toBe(true);
    expect(captainRel(keown, henry)).toEqual({ capDislikes: true, capFavours: false });
    expect(captainRel(henry, keown)).toEqual({ capDislikes: false, capFavours: true });
  });
  it('0x5d6d10 kører deterministisk og skriver kun i spillernes poster', () => {
    const before = JSON.stringify(Object.values(g.players).map((p) => p.cmRel ?? null));
    const flags: number[] = [];
    for (let d = 0; d < 60; d++) { cmRelDaily(g, squad, (_, f) => flags.push(f)); g.date = new Date(Date.parse(g.date) + 86400000).toISOString().slice(0, 10); }
    const after = Object.values(g.players).map((p) => p.cmRel ?? null);
    expect(JSON.stringify(after)).not.toBe(before);                                                    // 600 forsøg rammer nogle
    for (const b of after) if (b) { expect(b).toHaveLength(12); for (const x of b) expect(Number.isInteger(x) && x >= 0).toBe(true); }
    expect(flags).toEqual([]);                                                                         // kun person 0 kan få en klage
  });
});

describe('staffStatens ungdomsled 0x5ce8e1 (landets +0x85)', () => {
  const run = (clubYouth: number | null, b3f: number) => {
    const calls: number[] = [];
    staffStateDaily({ x: 0, fatigue: 0, contract: { b44: 0, b45: 0, b3f } as never, club: true, listed: false, age: 18, ca: 120, worldRep: 1000,
      gkRating: 1, pos2: 1, morale: 10, form: 27, id: 1, hid: { determination: 10, loyalty: 10, pressure: 10, professionalism: 10, adaptability: 10 },
      injured: false, job11: true, clubYouth }, (n) => { calls.push(n); return n === 200 ? 1 : 1; });
    return calls;
  };
  it('cl = ftol(Pressure/4 + 3) = 5; over 7750 −2 → 3 (+0x3f 4 > 3 → rand(4)), under 3750 +1 → 6 (+0x3f 4: intet)', () => {
    expect(run(8000, 4)).toContain(4);
    expect(run(1000, 4)).not.toContain(4);
    expect(run(null, 6)).toContain(2);                                                               // uden leddet: 6 > 5 → rand(max(7 − 5, 2))
  });
});
