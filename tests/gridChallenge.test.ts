// Udfordringen (sub_6c87e0/sub_70d690/sub_6eecb0) og dommeren (sub_6e9820/sub_6ea4e0) i gittermotoren – deterministiske tilfælde.
import { describe, expect, it } from 'vitest';
import { actionSkills, challengeValue, getOppositionChallenge, lin, postSkill, randS, rawActionSkills, sq } from '../src/game/engine/grid/challenge';
import { GRID_UNKNOWN, type GP, type GridMatchState } from '../src/game/engine/grid/gridMatch';
import { cardFor, decideFoulPunishment, foulGiven, isHardChallenge, judgeTackle, type FoulPlayer } from '../src/game/engine/cm0102-original-rules';

const F = { technique: 10, agility: 8, balance: 6, strength: 7, acceleration: 9, pace: 9, dribbling: 11, anticipation: 10, tackling: 12, jumping: 13,
  handling: 5, positioning: 10, decisions: 10, bravery: 9, aggression: 5, heading: 10, stamina: 15 };
const roll = { pace: 0, anticipation: 0, decisions: 0, offTheBall: 0, marking: 0, flair: 0, positioning: 5, creativity: 0, agility: 0, workRate: 5 };
function gp(side: 0 | 1, x: number, y: number, o: Partial<GP> = {}): GP {
  const p = { side, x, y, slot: 1, active: true, busy: 0, instr: 0n, grudge: null, marks: null, markers: [], roll: { ...roll }, f: { ...F }, gkRating: 1,
    condition: 10000, pos: 0x4, action: 0x68, yellows: 0, temperCount: 0, agitation: 0, sportsmanship: 10, temperament: 10, rating: 6100, momentum: 0,
    facing: 0, fouls: 0, foulsSuffered: 0, reasons: [0, 0], b16: 0, w31: 0, isKeeper: false, ...o } as unknown as GP;
  p.skill = actionSkills(p);
  return p;
}
const match = (players: GP[], o: Partial<GridMatchState> = {}) =>
  ({ gp: players, players, ballX: 4, ballY: 10, ballH: 0, ballSpeed: 0, ballDir: 0, carrier: null, teamFlags: [0, 0], aiMode: [2, 2], shootout: 0, ...o }) as unknown as GridMatchState;
const zero = () => 0;
const top = (n: number) => (n > 0 ? n - 1 : 0);

describe('handlingsevnerne (sub_6eecb0)', () => {
  it('lin/sq og råværdierne for 19, 33, 0x11, 0x12, keeperen', () => {
    expect(lin(12)).toBe(120); expect(sq(12)).toBe(72); expect(sq(0)).toBe(0);
    const s = rawActionSkills({ f: F, gkRating: 18 } as unknown as GP);
    expect(s[19]).toBe(Math.trunc((sq(9) + 60 + 100 + 144) / 5));          // (sq(pace)+lin(balance)+lin(anticipation)+tackling²)/5
    expect(s[33]).toBe(Math.trunc((144 + 60 + 100) / 4));
    expect(s[0x11]).toBe(Math.trunc((sq(10) + 200 + 90) * 0.22989));
    expect(s[0x12]).toBe(Math.trunc((180 + 220 + sq(11) + 100) * 0.15385));
    expect(s[1]).toBe(Math.trunc((sq(20) + 50 + 100 + 130 + 100 + 100) / 6)); // keeper-pladsevne 18 > 15 → gk 20
    expect([s[42], s[44], s[45], s[43]]).toEqual([200, 400, 400, 270]);
  });
  it('efterbehandlingen 0x6f0426 kører for alle koder (f = positionstilpasningen +0x37)', () => {
    const raw = rawActionSkills({ f: F, gkRating: 18 } as unknown as GP);
    const s = actionSkills({ f: F, gkRating: 18, form: -4 } as unknown as GP);
    expect(s[19]).toBe(Math.trunc(5 * (-4 + 45) + raw[19] * 0.5));          // case 1
    expect(s[0x15]).toBe(Math.trunc(raw[0x15] * 3.5));                      // case 6 (hovedstød)
    expect(s[0xb]).toBe(Math.trunc(raw[0xb] * 2.1 - 4 * 2.5 + 75));         // case 3 (kort aflevering)
    expect(s[0x34]).toBe(Math.trunc(raw[0x34] * 1.8 + 50));                 // case 5 (hjørne, uden f)
    expect(s[1]).toBe(Math.trunc(10 * (-4 + 25) + raw[1] * 2.5));           // case 0 (keeper)
    expect(postSkill(0x27, 100, 0)).toBe(Math.trunc(7 * 30 + 77.5));        // case 7
  });
  it('rand med negativt n er aldrig positivt', () => {
    expect(randS(top, -50)).toBe(-49); expect(randS(top, 0)).toBe(0); expect(randS(top, 7)).toBe(6);
  });
});

describe('get_opposition_challenge (sub_6c87e0)', () => {
  it('kun modstandere i boldens felt kan udfordre', () => {
    const car = gp(0, 4, 10), near = gp(1, 4, 9), mate = gp(0, 4, 10);
    const m = match([car, near, mate], { carrier: car });
    expect(getOppositionChallenge(m, car, 0, 0x11, 0, zero, () => 0).d).toBeNull();
    near.y = 10;
    const c = getOppositionChallenge(m, car, 0, 0x11, 0, zero, () => 0);
    expect(c.d).toBe(near);
    // rand ≡ 0: ren tackling i løb (19), sidste mand uden medspillere foran → klar chance; ventetiderne for 19 er 2/2
    expect(c.type).toBe(19); expect(c.clear).toBe(true); expect(c.value).toBe(0);
    expect([c.delayCarrier, c.delayChallenger]).toEqual([2, 2]);
    expect(near.condition).toBeLessThan(10000);                              // sub_6f56c0 for den valgte
  });
  it('en optaget (busy ≥ 2) eller udvist spiller går ikke ind', () => {
    const car = gp(0, 4, 10), q = gp(1, 4, 10, { busy: 2 }), r = gp(1, 4, 10, { active: false });
    expect(getOppositionChallenge(match([car, q, r], { carrier: car }), car, 0, 0x11, 0, zero, () => 0).d).toBeNull();
  });
  it('keeperen holder bolden: ingen udfordring', () => {
    const gk = gp(0, 4, 0, { pos: 0x1, isKeeper: true }), q = gp(1, 4, 0);
    expect(getOppositionChallenge(match([gk, q], { carrier: gk, ballY: 0, ballH: -1 }), gk, 0, 0xf, 0, zero, () => 0).d).toBeNull();
  });
});

describe('udfordringsværdien (sub_70d690)', () => {
  it('keeperen i eget felt får type 1 (greb) – 41 i hovedhøjde', () => {
    const k = gp(1, 4, 11, { pos: 0x1, isKeeper: true, gkRating: 20 });
    const car = gp(0, 4, 11);
    expect(challengeValue(match([k, car], { carrier: car }), k, 0x13, zero).type).toBe(1);
    expect(challengeValue(match([k, car], { carrier: car, ballH: 4 }), k, 0x13, zero).type).toBe(0x29);
  });
  it('en tackling under 2 bliver til 45 ("går i gulvet") når rand(2) ≠ 0', () => {
    const q = gp(1, 4, 10);
    q.skill = actionSkills(q); q.skill[0x13] = 1;                            // efterbehandlet er evnen ≥ 225 – sæt den lav
    const car = gp(0, 4, 10);
    const v = challengeValue(match([q, car], { carrier: car }), q, 0x13, top);
    expect(v.type).toBe(45); expect(v.V).toBe(q.skill[0x2d] - 0);           // træthed 0 ved fuld kondition
  });
  it('langt fra eget mål: holder sig tilbage (−20), når aggressionsrullet taber', () => {
    const q = gp(1, 4, 3), car = gp(0, 4, 3);
    let i = 0; const seq = (n: number) => (i++ === 0 ? 0 : n - 1);         // rand(aggr+2) = 0 < rand(2d)
    expect(challengeValue(match([q, car], { carrier: car }), q, 0x21, seq).V).toBe(-20);
  });
});

const fp = (o: Partial<FoulPlayer> = {}): FoulPlayer => ({ side: 1, x: 4, y: 6, isKeeper: false, fouls: 0, foulsSuffered: 0, yellows: 0, reasons: [0, 0], b16: 0,
  w31: 0, agitation: 0, temperCount: 0, grudge: null, rating: 6100, sportsmanship: 10, temperament: 10, ...o });
const off = () => ({ discipline: 10, b24: 10, b27: 10, b28: 10, mood: 0 });

describe('dommeren (sub_6e9820/sub_6ea4e0)', () => {
  it('rand ≡ 0: dommeren ser det ikke (+0x28) – humøret −250', () => {
    const o = off();
    expect(judgeTackle(zero, { official: o, minute: 50, teamFouls: 0 }, fp(), fp({ side: 0 }), 42).ret).toBe(0);
    expect(o.mood).toBe(-250);
  });
  it('type 42 uden for feltet dømmes med sværhed rand(fouls) + 4 (ingen bias), 43 giver 7', () => {
    const j = judgeTackle(top, { official: off(), minute: 50, teamFouls: 0 }, fp(), fp({ side: 0 }), 42);
    expect(j).toMatchObject({ ret: 1, severity: 4, kind: 4 });
    expect(judgeTackle(top, { official: off(), minute: 50, teamFouls: 0 }, fp(), fp({ side: 0 }), 43).ret).toBe(7);
    expect(isHardChallenge(42) && isHardChallenge(37) && !isHardChallenge(19)).toBe(true);
  });
  it('foulGiven: 44 har gulvet 50, ikke et loft', () => {
    const seen: number[] = []; foulGiven((n) => { seen.push(n); return 1; }, 1, 44);
    expect(seen).toEqual([50]);
  });
  it('kortet: sværhed 4 → intet kort (−25), 10 → gult, alvorligt (klar chance) → rødt', () => {
    const add = { minute: 30, addTeamFoul: () => {} };
    const a = fp(); expect(decideFoulPunishment(top, add, a, fp(), 1, 4, 4, false).code).toBe(1); expect(a.rating).toBe(6075); expect(a.fouls).toBe(1);
    const b = fp(); expect(decideFoulPunishment(top, add, b, fp(), 1, 4, 10, false).code).toBe(2); expect(b.rating).toBe(6100 - 225); expect(b.yellows).toBe(1);
    expect(decideFoulPunishment(top, add, fp({ yellows: 1 }), fp(), 1, 4, 10, false).code).toBe(3);
    expect(decideFoulPunishment(top, add, fp(), fp(), 1, 4, 0, true).code).toBe(5);
    expect(decideFoulPunishment(top, add, fp(), fp(), 7, 4, 99, false).code).toBe(7);
  });
  it('cardFor(professionelt): 0..50 kun gult i eget felt, 51..375 altid gult (rettet)', () => {
    expect(cardFor(() => 30, 0, true, false)).toBeNull();
    expect(cardFor(() => 30, 0, true, true)).toBe('yellow');
    expect(cardFor(() => 100, 0, true, false)).toBe('yellow');
    expect(cardFor(() => 2999, 0, true, false)).toBe('red');
  });
});

describe('dødboldskytten (sub_6ceb90)', () => {
  it('målspark = keeperen; kickoff = nærmest bolden (ikke keeperen)', () => {
    const k = gp(0, 4, 0, { pos: 0x1, isKeeper: true, slot: 0 }), a = gp(0, 4, 5, { slot: 1 }), b = gp(0, 3, 5, { slot: 2 });
    const m = match([k, a, b], { ballX: 4, ballY: 5, tactics: [{ corners: -1, freeKicks: -1, penalties: -1 }, {}] } as never);
    for (const p of [k, a, b]) (p as { src: unknown }).src = { id: p.slot, attrs: [], rep: 50 };
    expect(GRID_UNKNOWN.pickTaker(m, 0, 4, zero)).toBe(k);
    expect(GRID_UNKNOWN.pickTaker(m, 0, 8, zero)).toBe(a);
  });
});
