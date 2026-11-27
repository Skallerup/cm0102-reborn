// CM 01/02: lejereglerne pr. land – køberlandets TRANSFER_RULES +0x20 (Irland 0x63c3d0, Italien 0x661770, Spanien 0x859630) og sælgerlandets
// +0x24 i can_loan_player 0x8d0040 (Irland 0x63c530, Italien 0x6618f0) for hver måned i lejeperioden 0x8d0590.
import { afterAll, describe, expect, it } from 'vitest';
import type { Club, GameState, Player } from '../src/game/types';
import { setGame } from '../src/game/state';
import { cmLoanEndOk, cmLoanRules, cmLoanSellerOk } from '../src/game/rules2001';

const NATIONS = ['Republic of Ireland', 'Italy', 'Spain', 'England'];
const nat = (n: string) => NATIONS.indexOf(n);
const club = (id: number, nation: string, league: string, extra: Partial<Club> = {}) => ({ id, nation: nat(nation), league, name: `K${id}`, manager: 1, ...extra }) as unknown as Club;

function game(date: string, clubs: Club[], players: Player[] = []): GameState {
  const g = {
    date, season: 2001, dbKind: 'cm0102', dbYear: 2001, rng: 1,
    nations: NATIONS.map((name) => ({ name })),
    leagues: { CM119: { id: 'CM119', tier: 1 }, CM120: { id: 'CM120', tier: 2 }, CM24: { id: 'CM24', tier: 1 }, CM26: { id: 'CM26', tier: 3 },
      CM52: { id: 'CM52', tier: 1 }, CM53: { id: 'CM53', tier: 2 } },
    clubs: Object.fromEntries(clubs.map((c) => [c.id, c])),
    players: Object.fromEntries(players.map((p) => [p.id, p])),
    comps: {}, fixtures: [], offers: [], news: [],
  } as unknown as GameState;
  setGame(g);
  return g;
}
afterAll(() => setGame(null));

let pid = 100;
const player = (clubId: number, extra: Partial<Player> = {}) =>
  ({ id: pid++, club: clubId, first: 'A', last: 'B', dob: '1980-01-01', contract: { expires: '2005-06-30', wage: 1000 }, ...extra }) as unknown as Player;
/** en spiller med `n` kampe i ligaen i år (PlayerStats kategori 2) */
const withApps = (clubId: number, n: number) => { const st = new Array(32).fill(0); st[0] = n; return player(clubId, { cmStats: { 2: st } } as unknown as Partial<Player>); };
/** `n` spillere lejet ind til klubben nu (og i sæsonen) */
const loanedIn = (to: number, from: number, n: number, date = '2001-08-01') =>
  Array.from({ length: n }, () => player(to, { loan: { from, until: '2002-05-30' }, moves: [{ date, to, loan: true }] } as unknown as Partial<Player>));

describe('Irland 0x63c3d0', () => {
  const a = club(1, 'Republic of Ireland', 'CM119'), b = club(2, 'Republic of Ireland', 'CM119'), c = club(3, 'Republic of Ireland', 'CM120');
  it('samme division (enhver, ikke kun den bedste) → 0x1d; en anden division må – uden vindue (også 1/3)', () => {
    game('2002-03-01', [a, b, c]);
    expect(cmLoanRules(a, b)).toMatchObject({ ok: false, why: 0x1d });
    expect(cmLoanRules(c, b)).toEqual({ ok: true, why: 0 });
    expect(cmLoanRules(a, c)).toEqual({ ok: true, why: 0 });
  });
  it('fem lejer i sæsonen (siden 20/6) → 0x1e før divisionen', () => {
    game('2001-09-01', [a, b, c], loanedIn(3, 2, 5));
    expect(cmLoanRules(c, a)).toMatchObject({ ok: false, why: 0x1e });
    game('2001-09-01', [a, b, c], loanedIn(3, 2, 5, '2001-06-19'));
    expect(cmLoanRules(c, a).ok).toBe(true);
  });
});

describe('Italien 0x661770', () => {
  const a = club(1, 'Italy', 'CM26'), b = club(2, 'Italy', 'CM24'), s = club(3, 'Italy', 'CM24');
  it('kun de to første vinduer (1/7–27/10, 2/1–31/1) → ellers 9 (det tredje vindue til 30/4 gælder ikke lejer)', () => {
    game('2001-10-20', [a, b, s]); expect(cmLoanRules(b, s).ok).toBe(true);
    game('2001-11-15', [a, b, s]); expect(cmLoanRules(b, s)).toMatchObject({ ok: false, why: 9 });
    game('2002-01-15', [a, b, s]); expect(cmLoanRules(b, s).ok).toBe(true);
    game('2002-03-15', [a, b, s]); expect(cmLoanRules(b, s)).toMatchObject({ ok: false, why: 9 });
  });
  it('Serie C1/C2 (turnering 26–30): fire lejet ind → 0x25; Serie A ingen grænse', () => {
    game('2001-08-01', [a, b, s], [...loanedIn(1, 3, 4), ...loanedIn(2, 3, 4)]);
    expect(cmLoanRules(a, s)).toMatchObject({ ok: false, why: 0x25 });
    expect(cmLoanRules(b, s).ok).toBe(true);
    game('2001-08-01', [a, b, s], loanedIn(1, 3, 3));
    expect(cmLoanRules(a, s).ok).toBe(true);
  });
  it('en skjult C2-klub: divisionen fra club.dat (cmFinRaw)', () => {
    const h = club(4, 'Italy', 'HCM28');
    const g = game('2001-08-01', [h, s], loanedIn(4, 3, 4));
    (g as unknown as { cmFinRaw: Record<number, number[]> }).cmFinRaw = { 4: [28] };
    expect(cmLoanRules(h, s)).toMatchObject({ ok: false, why: 0x25 });
  });
});

describe('Spanien 0x859630', () => {
  const a = club(1, 'Spain', 'CM52'), b = club(2, 'Spain', 'CM52'), c = club(3, 'Spain', 'CM53');
  it('vinduet → 9; samme division og over 5 ligakampe → 0x1f; 5 kampe eller en anden division må', () => {
    game('2001-08-01', [a, b, c]);
    expect(cmLoanRules(a, b, withApps(2, 6))).toMatchObject({ ok: false, why: 0x1f });
    expect(cmLoanRules(a, b, withApps(2, 5)).ok).toBe(true);
    expect(cmLoanRules(c, b, withApps(2, 20)).ok).toBe(true);
    expect(cmLoanRules(a, b, player(2)).ok).toBe(true);
    game('2001-10-01', [a, b, c]);
    expect(cmLoanRules(a, b, withApps(2, 0))).toMatchObject({ ok: false, why: 9 });
  });
});

describe('sælgerlandets +0x24 i 0x8d0040', () => {
  const eng = club(1, 'England', 'CM7'), ire = club(2, 'Republic of Ireland', 'CM119'), ita = club(3, 'Italy', 'CM24');
  it('Irland 0x63c530: en måned i perioden i Irlands vindue (10/5–31/1) → må; ellers nej', () => {
    // engelsk køber (32 år: start + 3 måneder) 14/3: perioden april–juli – 14/4 lukket, 14/5 åbent → må
    game('2002-03-14', [eng, ire]);
    expect(cmLoanSellerOk(eng, ire, player(2, { dob: '1970-01-01' }))).toBe(true);
    // 1/3: april–juli: 1/4 og 1/5 (før 10/5) lukket, 1/6 åbent → må
    game('2002-03-01', [eng, ire]);
    expect(cmLoanSellerOk(eng, ire, player(2, { dob: '1970-01-01' }))).toBe(true);
    // 5/1: februar–maj: 5/2, 5/3, 5/4 og 5/5 lukket – slutmåneden prøves også – → nej
    game('2002-01-05', [eng, ire]);
    expect(cmLoanSellerOk(eng, ire, player(2, { dob: '1970-01-01' }))).toBe(false);
    // 4/3 med kontrakten til 10/4: perioden trækkes tilbage til april alene (start = slut) → må, selv om 4/4 er lukket
    game('2002-03-04', [eng, ire]);
    expect(cmLoanSellerOk(eng, ire, player(2, { dob: '1970-01-01', contract: { expires: '2002-04-10', wage: 1 } } as unknown as Partial<Player>))).toBe(true);
  });
  it('Italien 0x6618f0: juni eller de to første vinduer', () => {
    // 5/1: februar–maj, intet italiensk lånevindue → nej; 4/3: april–juli, 4/6 (juni) → må
    game('2002-01-05', [eng, ita]);
    expect(cmLoanSellerOk(eng, ita, player(3, { dob: '1970-01-01' }))).toBe(false);
    game('2002-03-04', [eng, ita]);
    expect(cmLoanSellerOk(eng, ita, player(3, { dob: '1970-01-01' }))).toBe(true);
  });
  it('andre sælgerlande (0x40a610): må', () => {
    game('2002-02-04', [eng, club(4, 'Spain', 'CM52')]);
    expect(cmLoanSellerOk(eng, club(4, 'Spain', 'CM52'), player(4, { dob: '1970-01-01' }))).toBe(true);
  });
});

describe('sælgerlandets +0x24: Finland 0x5a9ba0, Frankrig 0x5c1ed0, Tyskland 0x5e0210', () => {
  const FN = ['England', 'Finland', 'France', 'Germany', 'Italy', 'Republic of Ireland'];
  const c2 = (id: number, nation: string, league = 'X') => ({ id, nation: FN.indexOf(nation), league, name: `K${id}`, short: `K${id}`, manager: 1 }) as unknown as Club;
  const g2 = (date: string, clubs: Club[]) => { const g = game(date, clubs); g.nations = FN.map((name) => ({ name, code: '' })); return g; };
  const eng = c2(1, 'England'), fin = c2(2, 'Finland'), fin2 = c2(3, 'Finland'), fra = c2(4, 'France'), fra2 = c2(5, 'France'), ger = c2(6, 'Germany'), ger2 = c2(7, 'Germany');
  const ita = c2(8, 'Italy'), ita2 = c2(9, 'Italy'), ire = c2(10, 'Republic of Ireland'), ire2 = c2(11, 'Republic of Ireland');
  const all = [eng, fin, fin2, fra, fra2, ger, ger2, ita, ita2, ire, ire2];
  const short = (clubId: number, expires: string) => player(clubId, { dob: '1970-01-01', contract: { expires, wage: 1 } } as unknown as Partial<Player>);
  it('Finland: nej, når hver måned i perioden ligger mellem 18/8 og 15/11', () => {
    // 20/8 med kontrakten til 25/10: perioden september–oktober – 20/9 og 20/10 → nej
    g2('2002-08-20', all);
    expect(cmLoanSellerOk(eng, fin, short(2, '2002-10-25'))).toBe(false);
    // uden kontraktgrænsen: september–december – 20/11 (efter 15/11) → må
    expect(cmLoanSellerOk(eng, fin, player(2, { dob: '1970-01-01' }))).toBe(true);
    // 10/7: august–oktober – 10/8 (før 18/8) → må
    g2('2002-07-10', all);
    expect(cmLoanSellerOk(eng, fin, short(2, '2002-10-25'))).toBe(true);
  });
  it('Frankrig: en måned i perioden i Frankrigs vindue', () => {
    // 15/1: februar–maj – lukket (11/1–29/6) → nej; 4/3: april–juli – 4/7 åbent → må
    g2('2002-01-15', all);
    expect(cmLoanSellerOk(eng, fra, player(4, { dob: '1970-01-01' }))).toBe(false);
    g2('2002-03-04', all);
    expect(cmLoanSellerOk(eng, fra, player(4, { dob: '1970-01-01' }))).toBe(true);
  });
  it('Tyskland: can_loan_player kalder med femte argument 1 → altid må', () => {
    g2('2002-01-15', all);
    expect(cmLoanSellerOk(eng, ger, player(6, { dob: '1970-01-01' }))).toBe(true);
  });
  it('Recall 0x8fbcc0 → 0x8d0530(klub, staff, besked, i dag, 0): kun mellem klubber i samme land', () => {
    const lent = (home: Club, at: Club) => player(at.id, { loan: { from: home.id, until: '2003-05-30' } } as unknown as Partial<Player>);
    g2('2002-09-01', all);
    expect(cmLoanEndOk(fin, lent(fin, fin2))).toEqual({ ok: false, msg: { key: 'cl.loanr.recallNov' } });
    expect(cmLoanEndOk(fin, lent(fin, eng))).toEqual({ ok: true });                       // udlejet til England: ingen regel
    expect(cmLoanEndOk(ger, lent(ger, ger2))).toEqual({ ok: false, msg: { key: 'cl.loanr.recallGer', params: { nat: 'German' } } });
    expect(cmLoanEndOk(fra, lent(fra, fra2)).ok).toBe(true);                               // 1/9: vinduet åbent
    g2('2002-12-01', all);
    expect(cmLoanEndOk(fin, lent(fin, fin2)).ok).toBe(true);
    g2('2002-02-01', all);
    expect(cmLoanEndOk(fra, lent(fra, fra2))).toEqual({ ok: false, msg: { key: 'cl.loanr.recallDeadline', params: { nat: 'French' } } });
    expect(cmLoanEndOk(ire, lent(ire, ire2))).toEqual({ ok: false, msg: { key: 'cl.loanr.recallDeadline', params: { nat: 'Irish' } } });   // 10/5–31/1
  });
  it('Italien med femte argument 0: juni tæller ikke (kun de to første vinduer)', () => {
    const lent = player(9, { loan: { from: 8, until: '2003-05-30' } } as unknown as Partial<Player>);
    g2('2002-06-10', all);
    expect(cmLoanEndOk(ita, lent).ok).toBe(false);
    g2('2002-07-10', all);
    expect(cmLoanEndOk(ita, lent).ok).toBe(true);
    void ita2;
  });
  it('beskederne fra +0x20 (England 0x579d60)', () => {
    const p1 = c2(20, 'England', 'CM7'), p2 = c2(21, 'England', 'CM7');
    const g = g2('2001-08-01', [p1, p2]);
    (g.leagues as Record<string, unknown>).CM7 = { id: 'CM7', tier: 1, name: 'English Premier Division' };
    expect(cmLoanRules(p1, p2)).toEqual({ ok: false, why: 0x1d, msg: { key: 'cl.loanr.sameComp', params: { comp: 'English Premier Division' } } });
  });
});
