// Spillerens mærke i truplisterne – get_player_status_code 0x4849f0 (src/game/cmStatusCode.ts): hver kode og originalens rækkefølge.
// Ejerens billeder 24/11 (Man Utd Reserves 20/6-02): Trn (aftalt skifte), Unh, Loa, Ctr (Full Time Monthly Contract / Rolling).
import { describe, expect, it, vi } from 'vitest';
// landsholdsudtagelsen (0x7757d0) har sin egen test – her styres den af testen
vi.mock('../src/game/international', () => ({ isInternational: (p: { intl?: boolean }) => !!p.intl }));
import { setGame } from '../src/game/state';
import { arrangedMove, playerStatusTag } from '../src/game/cmStatusCode';
import type { GameState, Player } from '../src/game/types';

function mini(): GameState {
  const club = (id: number, name: string, nation = 0) => ({ id, name, short: name.slice(0, 4), nation, league: 'x', manager: 0, colors: ['#800000', '#ffffff'] });
  return {
    season: 2001, date: '2002-06-20', draft: false, options: { mode: 'authentic' }, userClub: 1, offers: [], news: [], nextId: { news: 1 }, fixtures: {}, comps: {},
    leagues: {}, nations: [{ name: 'England', code: 'ENG' }, { name: 'Brazil', code: 'BRA' }], players: {}, staff: {}, reports: {},
    clubs: { 1: club(1, 'Man Utd'), 2: club(2, 'Bolton') },
  } as unknown as GameState;
}

let nextId = 100;
function pl(extra: Partial<Player> = {}): Player {
  const p = {
    id: nextId++, first: 'A', last: 'B', dob: '1980-01-01', nation: 0, club: 1, condition: 100, banned: 0, yellowCount: 0, injury: null, loan: null,
    contract: { wage: 1000, expires: '2003-06-30' }, attrs: [], stats: {}, history: [], caps: 0, intGoals: 0,
    cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 0, b4e: 0, b4f: 0x20 },
    ...extra,
  } as unknown as Player;
  return p;
}

function tag(p: Player, g = mini(), club = p.club) {
  g.players[p.id] = p;
  setGame(g);
  return playerStatusTag(g, p, club);
}

describe('get_player_status_code 0x4849f0', () => {
  it('ingen kode: 0x19', () => expect(tag(pl())).toBeNull());

  it('Abs: udeblevet (AWOL) og ferie (skadetype 0x51) før skaden', () => {
    expect(tag(pl({ injury: { key: 'awol', days: 3 } }))).toBe('Abs');
    expect(tag(pl({ injury: { key: 'cm81', days: 7 } }))).toBe('Abs');
  });

  it('Wpm: britisk klub, ikke EU, uden post i historikken (kun med arbejdstilladelsesmodulet)', () => {
    const g = mini();
    g.cmWp = { b: {}, nt: {} } as never;
    const br = pl({ nation: 1 });
    expect(tag(br, g)).toBe('Wpm');
    g.cmPermit = { [br.id]: [0, 0, 2001, 0] } as never;
    expect(tag(br, g)).toBeNull();                                   // hovedkontrakt (type 2) med post → ingen
    expect(tag(pl({ nation: 1 }), mini())).toBeNull();              // uden modulet
  });

  it('Int (0x7757d0) før Sus og Inj – efter Abs', () => {
    expect(tag(pl({ intl: true, banned: 1 } as Partial<Player>))).toBe('Int');
    expect(tag(pl({ intl: true, injury: { key: 'awol', days: 2 } } as Partial<Player>))).toBe('Abs');
  });

  it('Sus, Inj, Tir og Yel i originalens rækkefølge', () => {
    expect(tag(pl({ banned: 2, injury: { key: 'cm3', days: 5 } }))).toBe('Sus');
    expect(tag(pl({ injury: { key: 'cm3', days: 5 }, condition: 50 }))).toBe('Inj');
    expect(tag(pl({ condition: 64, yellowCount: 4 }))).toBe('Tir');
    expect(tag(pl({ condition: 65, yellowCount: 4 }))).toBe('Yel');
  });

  it('Tir og Yel også for de genererede fyldspillere – de øvrige ikke', () => {
    expect(tag(pl({ virtual: 'active', condition: 60 }))).toBe('Tir');
    expect(tag(pl({ virtual: 'active', yellowCount: 4 }))).toBe('Yel');
    expect(tag(pl({ virtual: 'active', listed: true, cmContract: undefined }))).toBeNull();
  });

  it('Sct: menneskets spejderanmodning (0x7f8d70) før Yel', () => {
    const g = mini();
    const p = pl({ yellowCount: 4 });
    g.cmScoutReq = [{ pid: p.id, club: 1, n: 0, date: '2002-06-01' }] as never;
    expect(tag(p, g)).toBe('Sct');
  });

  it('Trn: aftalt skifte – "Bolton - transfer arranged for …" (ejerens billede: David May)', () => {
    const g = mini();
    const p = pl({ cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 4, b4e: 1, b4f: 0x20 } });
    g.offers = [{ id: 1, player: p.id, buyer: 2, seller: 1, fee: 0, status: 'accepted', cmFut: '2002-06-30' }] as never;
    expect(tag(p, g)).toBe('Trn');
    expect(arrangedMove(g, p)).toEqual({ club: 2, date: '2002-06-30' });
    expect(tag(pl({ contract: { wage: 1, expires: '2002-06-30', futureClub: 2 } }))).toBe('Trn');
  });

  it('Bid før Wnt/Req/Lst', () => {
    const g = mini();
    const p = pl({ cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 0, b4e: 9, b4f: 0x20 } });
    g.offers = [{ id: 1, player: p.id, buyer: 2, seller: 1, fee: 5, status: 'pending' }] as never;
    expect(tag(p, g)).toBe('Bid');
  });

  it('Req (+0x4e bit 8), Lst (bit 1), Loa (bit 2)', () => {
    const k = (b4e: number) => ({ b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 0, b4e, b4f: 0x20 });
    expect(tag(pl({ cmContract: k(8 | 1) }))).toBe('Req');
    expect(tag(pl({ cmContract: k(1 | 2) }))).toBe('Lst');
    expect(tag(pl({ cmContract: k(2) }))).toBe('Lon');
  });

  it('Ctr: kontrakttype 1 (Full Time Monthly Contract, "Rolling") – ejerens billede: Steven Robinson', () => {
    expect(tag(pl({ contract: { wage: 1, expires: '2002-06-30', cmType: 1 }, cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 3, b4e: 0, b4f: 0x60 } }))).toBe('Ctr');
  });

  it('Ret: pensioneringen meldt og over 30 år', () => {
    expect(tag(pl({ cmRetire: true, dob: '1970-06-24' }))).toBe('Ret');
    expect(tag(pl({ cmRetire: true, dob: '1975-01-01' }))).toBeNull();
  });

  it('Bos (+0x49), Unh (+0x45), Fut (type 2, trupstatus 0)', () => {
    expect(tag(pl({ contract: { wage: 1, expires: '2003-06-30', cmB49: 1 }, cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 2, b4e: 0, b4f: 0 } }))).toBe('Bos');
    expect(tag(pl({ cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 2, b4e: 0, b4f: 0 } }))).toBe('Unh');
    expect(tag(pl({ cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: 0, b45: 0, b4e: 0, b4f: 0x0 } }))).toBe('Fut');
    expect(tag(pl({ cmContract: { b3d: 0, b3e: 0, b3f: 0, b44: -80, b45: 0, b4e: 0, b4f: 0x20 } }))).toBeNull();
  });

  it('lejespiller i lejeklubben: lejekontrakten (ingen Ctr/Unh) – i moderklubbens trup hovedkontrakten', () => {
    const p = pl({ club: 2, loan: { from: 1, until: '2002-12-31' }, contract: { wage: 1, expires: '2002-06-30', cmType: 1 } });
    expect(tag(p, mini(), 2)).toBeNull();
    expect(tag(p, mini(), 1)).toBe('Ctr');
  });
});
