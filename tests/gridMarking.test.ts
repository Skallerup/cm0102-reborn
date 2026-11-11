// Markeringen i gittermotoren: markeringsrunden i sub_6b98c0 (0x6ba140–0x6ba345), følg-testen sub_6bce20 og synstesten sub_6fa140 –
// efter disassembly af cm0102.exe 3.9.68 (11/11)
import { describe, expect, it } from 'vitest';
import * as L from '../src/game/engine/grid/loop';
import { facingOk } from '../src/game/engine/grid/helpers';

const roll = () => ({ pace: 5, anticipation: 5, decisions: 5, offTheBall: 5, marking: 5, flair: 5, positioning: 5, creativity: 5, agility: 5, workRate: 5 });
const P = (side: 0 | 1, slot: number, x: number, y: number, pos: number, o: Partial<L.Player> = {}): L.Player => ({
  side, slot, active: true, x, y, action: L.ACT.none, rating: 6100, condition: 10000, pendingCond: 0, busy: 0, matchCA: 100, form: 0, morale: 10,
  injury: 0, agitation: 0, pos, tacticByte: 0, instr: 0n, freeRoleRating: 1, a: {} as L.Attr, cap: {} as L.Caps, roll: roll(), marks: null, markers: [], ...o,
});
const match = (players: L.Player[], o: Partial<L.Match> = {}): L.Match => ({
  players, ballX: 4, ballY: 6, ballH: 0, ballSpeed: 0, ballDir: 0, lastTouch: 0, poss: 1, state: 0, shootout: 0, clock: 0, stoppage: 0, subTick: 0,
  paused: false, carrier: null, receiver: null, chaser: [null, null], keeperOut: [false, false], lineSide1: 11, lineSide0: 0, counterFlag: [false, false],
  teamFlags: [0, 0], aiMode: [2, 2], touchCount: [0, 0], loftCountdown: 0, order: players.slice(), prio: null, ...o,
});
const hooks = (pick: (p: L.Player) => L.Player | null, mm: (p: L.Player) => L.Player | null = () => null) =>
  ({ zonalPick: pick, manMarkTarget: mm }) as unknown as L.Hooks;

describe('markeringsrunden (sub_6b98c0 0x6ba140)', () => {
  it('zonevalget kaldes for alle, når BOLDEN er i eget felt – ikke når kun spilleren står der', () => {
    const am = P(0, 9, 4, 8, 0x40 | 0x200), opp = P(1, 9, 4, 8, 0x40 | 0x200);
    const calls: L.Player[] = [];
    const pick = (p: L.Player) => { calls.push(p); return opp; };
    // angriberen (side 0) står langt fremme; bolden i side 0's felt (x 2..6, y 0..1)
    L.assignMarking(match([am, opp], { ballX: 3, ballY: 1, poss: 1 }), hooks(pick));
    expect(calls).toContain(am);
    expect(am.marks).toBe(opp);
    calls.length = 0;
    const st = P(0, 10, 4, 1, 0x40 | 0x200);                                                  // angriber i eget felt, bolden i midten
    L.assignMarking(match([st, opp], { ballX: 4, ballY: 6, poss: 1 }), hooks(pick));
    expect(calls).not.toContain(st);
  });

  it('forsvarere på egen halvdel og midtbanen med bolden i egen tredjedel', () => {
    const d = P(0, 2, 3, 3, 0x4 | 0x200), mid = P(0, 6, 4, 5, 0x10 | 0x200), opp = P(1, 9, 4, 4, 0x40 | 0x200);
    const calls: L.Player[] = [];
    L.assignMarking(match([d, mid, opp], { ballX: 4, ballY: 6, poss: 1 }), hooks((p) => { calls.push(p); return null; }));
    expect(calls).toEqual([d]);
    calls.length = 0;
    L.assignMarking(match([d, mid, opp], { ballX: 0, ballY: 2, poss: 1 }), hooks((p) => { calls.push(p); return null; }));
    expect(calls).toEqual([d, mid]);
  });

  it('eget hold med bolden uden for egen tredjedel: ingen markering; målmand og boldholder aldrig', () => {
    const d = P(0, 2, 3, 3, 0x4 | 0x200), gk = P(0, 0, 4, 0, 0x1), opp = P(1, 9, 4, 4, 0x40 | 0x200);
    const calls: L.Player[] = [];
    L.assignMarking(match([gk, d, opp], { ballY: 5, poss: 0 }), hooks((p) => { calls.push(p); return opp; }));
    expect(calls).toEqual([]);
    L.assignMarking(match([gk, d, opp], { ballY: 2, poss: 0, carrier: d }), hooks((p) => { calls.push(p); return opp; }));
    expect(calls).toEqual([]);
  });

  it('+0x1aa sættes også, når manden allerede har 3 markører (0x6ba220) – men han kommer ikke på listen', () => {
    const opp = P(1, 9, 4, 3, 0x40 | 0x200);
    const ds = [0, 1, 2, 3].map((i) => P(0, 1 + i, 4, 3, 0x4 | 0x200));
    L.assignMarking(match([...ds, opp], { poss: 1 }), hooks(() => opp));
    expect(ds.map((d) => d.marks)).toEqual([opp, opp, opp, opp]);
    expect(opp.markers).toEqual(ds.slice(0, 3));
  });

  it('mandsopdækningen går forud og gælder også målmanden', () => {
    const gk = P(0, 0, 4, 0, 0x1), opp = P(1, 9, 4, 3, 0x40 | 0x200);
    L.assignMarking(match([gk, opp], { poss: 1 }), hooks(() => null, (p) => (p === gk ? opp : null)));
    expect(gk.marks).toBe(opp);
  });

  it('taktikbyte bit 1: ingen markering', () => {
    const d = P(0, 2, 3, 3, 0x4 | 0x200, { tacticByte: 1 }), opp = P(1, 9, 4, 4, 0x40 | 0x200);
    L.assignMarking(match([d, opp], { poss: 1 }), hooks(() => opp));
    expect(d.marks).toBeNull();
  });
});

describe('følg-testen sub_6bce20', () => {
  it('ingen afstandsgrænse; kun felt, busy, boldholder/modtager, markeringsrul og bold i spil', () => {
    const mk = P(0, 2, 0, 0, 0x4 | 0x200), man = P(1, 9, 8, 11, 0x40 | 0x200);
    const m = match([mk, man]);
    expect(L.canFollow(m, mk, 8, 11)).toBe(true);                       // hele banen væk
    expect(L.canFollow(m, mk, 0, 0)).toBe(false);                       // står allerede der
    expect(L.canFollow(m, null, 8, 11)).toBe(false);
    mk.busy = 2; expect(L.canFollow(m, mk, 8, 11)).toBe(false); mk.busy = 1;
    expect(L.canFollow(match([mk, man], { carrier: mk }), mk, 8, 11)).toBe(false);
    expect(L.canFollow(match([mk, man], { receiver: mk }), mk, 8, 11)).toBe(false);
    expect(L.canFollow(match([mk, man], { state: 3 }), mk, 8, 11)).toBe(false);
    mk.roll.marking = 0; expect(L.canFollow(m, mk, 8, 11)).toBe(false);
    mk.tacticByte = 2; expect(L.canFollow(m, mk, 8, 11)).toBe(true);    // sub_6f4600: positioneringsrullet med bit 2
    mk.roll.positioning = 0; expect(L.canFollow(m, mk, 8, 11)).toBe(false);
  });
});

describe('synstesten sub_6fa140', () => {
  it('samme felt → nej; grænsen ftol(2,25·agility-rul + 45)', () => {
    const p = { x: 4, y: 4, facing: 0, roll: { agility: 0 } };
    expect(facingOk(p, 4, 4)).toBe(false);
    expect(facingOk(p, 4, 5)).toBe(true);                               // samme retning (0°)
    expect(facingOk(p, 5, 4)).toBe(false);                              // 90° ≥ 45
    expect(facingOk(p, 5, 5)).toBe(false);                              // 45° – strengt mindre kræves
    p.roll.agility = 1;
    expect(facingOk(p, 5, 5)).toBe(true);                               // grænsen 47
  });
});

describe('mandsopdækningen sub_7160f0', () => {
  it('kun med taktikbyte bit 4; bit 0x10 opgiver ved formationsbit/angrebsposition og decisions-rul', () => {
    const mk = P(0, 2, 4, 3, 0x4 | 0x200, { markRef: 77 }), t = P(1, 9, 4, 4, 0x20 | 0x200, { ref: 77, posAttack: 0x20 | 0x200 });
    const m = match([mk, t]);
    expect(L.manMarkTarget(m, mk)).toBeNull();
    mk.tacticByte = 4; expect(L.manMarkTarget(m, mk)).toBe(t);
    t.active = false; expect(L.manMarkTarget(m, mk)).toBeNull(); t.active = true;
    mk.tacticByte = 4 | 0x10; expect(L.manMarkTarget(m, mk)).toBe(t);
    expect(L.manMarkTarget(match([mk, t], { formationWord: [0, 0x10000000] }), mk)).toBeNull();
    expect(L.manMarkTarget(match([mk, t], { bAf: [0, 2] }), mk)).toBeNull();
    t.posAttack = 0x10 | 0x200; expect(L.manMarkTarget(m, mk)).toBeNull();    // rykker ned, ikke angriber
    t.posAttack = 0x40 | 0x200; expect(L.manMarkTarget(m, mk)).toBe(t);       // rykker op som angriber
    mk.roll.decisions = 0; t.posAttack = 0x10; expect(L.manMarkTarget(match([mk, t], { bAf: [0, 2] }), mk)).toBe(t);
  });
});
