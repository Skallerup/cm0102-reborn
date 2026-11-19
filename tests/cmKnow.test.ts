// CM 01/02's kendskab (fog_of_war, cmKnow.ts): startniveauet 0x5b03e0, det daglige gulv 0x5b06e0 og glemslen 0x5b0260, opslaget 0x5b02f0,
// "set" 0x5b09d0 og attribute masking 0x543280 – og budskærmens bestyrelseslinje (0x8ea327) som ejerens billeder 143/144 (Man Utd 18/8-2001):
// Harris (Millwall) "will allow transfer fees up to …" (fuldt kendskab = hele budgettet), Koch (Kaiserslautern) "… because they don't know
// anything about this player" med et loft på en tredjedel af værdien (11M af 33M DKr).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmBidBudget, cmBoardLine } from '../src/game/cmBudget';
import { cmKnowDaily, cmKnowLevel, cmKnowSee, floorLevel_5b06e0, maskVisible_543280 } from '../src/game/cmKnow';
import { attrMasked, knowledgeAfterMatch, knowledgeOf } from '../src/game/scouting';
import { A } from '../src/game/attributes';
import { addDays } from '../src/game/dates';

describe('attribute masking 0x543280', () => {
  it('niveau 3 viser alt, 0 intet; 1 og 2 altid de fem fysiske (Acceleration, Jumping, Pace, Stamina, Strength)', () => {
    for (let a = 1; a <= 31; a++) { expect(maskVisible_543280(3, 7, a)).toBe(true); expect(maskVisible_543280(0, 7, a)).toBe(false); }
    for (const lv of [1, 2]) for (const id of [0, 1, 2, 3]) for (const a of [1, 17, 21, 26, 27]) expect(maskVisible_543280(lv, id, a)).toBe(true);
  });
  it('niveau 2 viser flere end niveau 1, og mønsteret følger id % 4 (0x54330c/0x5433b4)', () => {
    const count = (lv: number, id: number) => Array.from({ length: 31 }, (_, i) => i + 1).filter((a) => maskVisible_543280(lv, id, a)).length;
    for (const id of [0, 1, 2, 3]) expect(count(2, id)).toBeGreaterThan(count(1, id));
    // id % 4 = 0, niveau 2: lige numre, ellers (a + 1) % 3 = 0 → 2 vises, 3 vises ikke (3+1=4), 5 vises (5+1=6)
    expect(maskVisible_543280(2, 4, 2)).toBe(true);
    expect(maskVisible_543280(2, 4, 3)).toBe(false);
    expect(maskVisible_543280(2, 4, 5)).toBe(true);
    // id % 4 = 1, niveau 1: x = a + 1; x % 4 = 0 eller x % 3 = 0 → a = 3 (4) og a = 2 (3) vises, a = 4 (5) ikke
    expect(maskVisible_543280(1, 5, 3)).toBe(true);
    expect(maskVisible_543280(1, 5, 2)).toBe(true);
    expect(maskVisible_543280(1, 5, 4)).toBe(false);
  });
});

describe('kendskabet i et spil (3.9.60, ægte tilstand, Man Utd, engelsk manager)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();
  const find = (first: string, last: string) => Object.values(g.players).find((p) => p.first === first && p.last === last)!;
  const harris = find('Neil', 'Harris'), koch = find('Georg', 'Koch');

  it('Harris (Millwall, engelsk liga, omdømme > 4250) er kendt: "will allow" og hele budgettet', () => {
    expect(cmKnowLevel(g, harris)).toBe(3);
    const b = cmBidBudget(g, harris, mu)!;
    expect(cmBoardLine(b)).toBe('cl.bid.board');
    expect(b.budget).toBeGreaterThan(harris.value);
    for (const k of ['finishing', 'passing', 'flair'] as const) expect(attrMasked(harris, A[k])).toBe(false);
  });

  it('Koch (Kaiserslautern, tysk) er ukendt: "don\'t know anything" og et loft på ~1/3 af værdien; alle egenskaber "-"', () => {
    expect(cmKnowLevel(g, koch)).toBe(0);
    const b = cmBidBudget(g, koch, mu)!;
    expect(cmBoardLine(b)).toBe('cl.bid.boardNothing');
    const ratio = b.budget / koch.value;
    expect(ratio).toBeGreaterThan(0.28);
    // ejerens billede 11M/33M = 0,33; Koch's viste værdi (+0x52, Kaiserslauterns syn) har 0x6e86d0's spredning af personernes hukommelses-id'er
    // (cmValueGame.ts – tilfældig fra spil til spil i originalen; Brehmes Staff.id 6541 → 10857 med de nye stabsfolk), budgettet
    // (købers syn) er uændret 1.087.584: main 0,315, med non-league/stab i world-filen 0,42
    expect(ratio).toBeLessThan(0.45);
    for (const k of ['acceleration', 'pace', 'finishing', 'handling', 'reflexes'] as const) expect(attrMasked(koch, A[k])).toBe(true);
    expect(knowledgeOf(koch)).toBe(0);
  });

  it('egen trup kendes altid (opslaget 0x5b02f0), og en modstander, der har spillet mod os, kendes fuldt (0x5afe00)', () => {
    const own = Object.values(g.players).find((p) => p.club === mu)!;
    expect(cmKnowLevel(g, own)).toBe(3);
    const p = Object.values(g.players).find((x) => x.club && x.club !== mu && cmKnowLevel(g, x) === 0 && !x.virtual)!;
    knowledgeAfterMatch(p.club, [p.id]);
    expect(cmKnowLevel(g, p)).toBe(3);
    expect(g.manager.cmKnowSeen?.[p.id]).toBe(g.date);
  });

  it('spejderen (0x5b09d0): Judging Player Ability 20 giver 2 eller 3 med det samme; uden spejder 3', () => {
    const ps = Object.values(g.players).filter((x) => x.club && x.club !== mu && cmKnowLevel(g, x) === 0 && !x.virtual).slice(0, 20);
    for (const p of ps) { cmKnowSee(g, p, 20); expect([2, 3]).toContain(cmKnowLevel(g, p)); }
    // en dårlig spejder (1): rand(1) = 0 → ét trin ad gangen
    const q = Object.values(g.players).find((x) => x.club && x.club !== mu && cmKnowLevel(g, x) === 0 && !x.virtual)!;
    cmKnowSee(g, q, 1); expect(cmKnowLevel(g, q)).toBe(1);
    cmKnowSee(g, q, 1); expect(cmKnowLevel(g, q)).toBe(2);
    cmKnowSee(g, q, null); expect(cmKnowLevel(g, q)).toBe(3);
  });

  it('glemsel (0x5b0260): mere end 540 dage siden sidst set → et trin ned, men aldrig under gulvet 0x5b06e0', () => {
    const m = { nat: g.manager.nation, club: g.userClub, nt: -1 };
    const p = Object.values(g.players).find((x) => x.club && x.club !== mu && !x.virtual && floorLevel_5b06e0(g, m, x) === 0)!;
    cmKnowSee(g, p, null);
    expect(cmKnowLevel(g, p)).toBe(3);
    g.manager.cmKnowSeen![p.id] = addDays(g.date, -541);
    cmKnowDaily(g);
    expect(cmKnowLevel(g, p)).toBe(2);
    expect(g.manager.cmKnowSeen![p.id]).toBe(g.date);
    // dagen efter: ingen ændring (datoen er nulstillet)
    cmKnowDaily(g);
    expect(cmKnowLevel(g, p)).toBe(2);
  });
});
