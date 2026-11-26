// 0x83f3a0 fill_shortlist_slot @0x83fe2c–0x83febc (og make_club_bids 0x84a020 @0x84aa96–0x84aabb): på en LEJEPLADS (pladsens +0x24 bit 1)
// springes en spiller hos et aktivt menneske (0x600a50(kontraktens klub, 0, 1, 0, 0) ≠ 0) over, medmindre kontrakten har +0x4e bit 2 =
// "Listed for loan" (0x544590; sat/ryddet af Set Staff Transfer Status OK 0x8f806c → 0x8442b0 / 0x8f808f → 0x8442d0). Transferpladserne
// (forkontrakter, bud) har ingen sådan kontrol – menneskets spillere er kandidater som alle andre.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { act } from '../src/game/actions';
import { buildWantMem } from '../src/game/cmContractGame';
import { getContract, clubAt } from '../src/game/cmMem';
import { slCall } from '../src/game/cmShortlist';
import type { GameState, Player } from '../src/game/types';

let g: GameState;
let p: Player;
beforeAll(() => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const ars = world.clubs.find((c) => c[1] === 'Arsenal')![0];
  createGame(world, { managerName: 'T', managerNation: eng, clubId: ars, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
  // en spiller med udløbende kontrakt (som oraklets 11 hos Arsenal: +0x4e = 4)
  p = squad(ars).filter((x) => x.contract && !x.loan).sort((a, b) => a.contract!.expires.localeCompare(b.contract!.expires))[0];
}, 240_000);

/** kontrollen 0x83fe39–0x83febc: true = kandidaten afvises (0x840a81) på en lejeplads */
function loanSlotSkips(): { human: boolean; flag: number; b4e: number } {
  const M = buildWantMem(g, [p.club]);
  const m = M.c.m, st = M.W.staffOf(p);
  const k = getContract(m, st);
  const club = clubAt(m, m.s32(k + 4));
  const human = slCall(M.c, 0x600a50, 0, club, 0, 1, 0, 0) !== 0;
  return { human, flag: slCall(M.c, 0x544590, 0, st, 0), b4e: m.u8(k + 0x4e) };
}

describe('menneskets spillere på computerens lejepladser (+0x4e bit 2 = Listed for loan)', () => {
  it('uden lejelistning: menneskets klub, bit 2 ikke sat → afvist på lejepladsen', () => {
    const r = loanSlotSkips();
    expect(r.human).toBe(true);
    expect(r.b4e & 2).toBe(0);
    expect(r.flag).toBe(0);
  });
  it('transferlistet (bit 1) er ikke lejelistet: stadig afvist på lejepladsen', () => {
    expect(act({ t: 'cmTransferStatus', pid: p.id, status: 0, price: null, listed: true, loan: false, request: false })).toBe('ok');
    const r = loanSlotSkips();
    expect(r.b4e & 1).toBe(1);
    expect(r.flag).toBe(0);
  });
  it('Listed for loan (0x8442b0): bit 2 i hukommelsen, 0x544590 = 1 → kandidat; af igen (0x8442d0) → afvist', () => {
    expect(act({ t: 'cmTransferStatus', pid: p.id, status: 0, price: null, listed: false, loan: true, request: false })).toBe('ok');
    expect(p.loanListed).toBe(true);
    let r = loanSlotSkips();
    expect(r.b4e & 2).toBe(2);
    expect(r.flag).toBe(1);
    expect(act({ t: 'cmTransferStatus', pid: p.id, status: 0, price: null, listed: false, loan: false, request: false })).toBe('ok');
    r = loanSlotSkips();
    expect(r.b4e & 2).toBe(0);
    expect(r.flag).toBe(0);
  });
});
