// CM 01/02: lejeperioden (TRANSFER_MANAGER::get_loan_period 0x8d0590 + landenes regler) og menneskets lejebud (0x8be300 → 0x8c63a0 → 0x84af00).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cmLoanBar, cmLoanPeriod, cmLoanRefuses, loanDate } from '../src/game/cmLoan';
import type { Fixture } from '../src/game/types';
import type { GameState, Player } from '../src/game/types';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { act } from '../src/game/actions';
import { processOffers } from '../src/game/transfers';
import { cmLoanAnswerNow } from '../src/game/cmShortlistGame';
import type { TransferOffer } from '../src/game/types';

const mini = (date: string, nation: string) => ({ date, nations: [{ name: nation }], clubs: { 1: { id: 1, nation: 0 } } }) as unknown as GameState;
const pl = (dob: string, expires = '2005-06-30') => ({ dob, contract: { expires, wage: 1000 } }) as unknown as Player;

describe('lejeperioden 0x8d0590', () => {
  it('England efter 19/6, under 24 år: næste måned til sæsonslut (ejerens billede: 20.6.02 → "20th Jul 2002")', () => {
    const r = cmLoanPeriod(mini('2002-06-20', 'England'), 1, pl('1982-05-20'));
    expect(r).toEqual({ sm: 6, sy: 2002, em: 5, ey: 2003 });
    expect(loanDate('2002-06-20', r.sm, r.sy)).toBe('2002-07-20');
  });
  it('England ellers: tre måneder fra næste måned', () => {
    expect(cmLoanPeriod(mini('2002-06-20', 'England'), 1, pl('1970-01-01'))).toEqual({ sm: 6, sy: 2002, em: 9, ey: 2002 });
    expect(cmLoanPeriod(mini('2001-11-14', 'England'), 1, pl('1982-05-20'))).toEqual({ sm: 11, sy: 2001, em: 5, ey: 2002 });
  });
  it('kontraktens udløb trækker slutningen tilbage; Wales: start = slut', () => {
    expect(cmLoanPeriod(mini('2002-06-20', 'England'), 1, pl('1982-05-20', '2002-12-01'))).toEqual({ sm: 6, sy: 2002, em: 10, ey: 2002 });
    expect(cmLoanPeriod(mini('2001-09-10', 'Wales'), 1, pl('1982-05-20'))).toEqual({ sm: 4, sy: 2002, em: 4, ey: 2002 });
  });
  it('dagen er højst den 28.', () => { expect(loanDate('2002-01-31', 1, 2002)).toBe('2002-02-28'); });
});

describe('spillerens svar 0x4cc930 og lejekontraktens +0x1c/+0x1d (0x8e8a60)', () => {
  it('nej kun når trunc(omdømme / 500) > lejeklubbens omdømme', () => {
    const g = { cmClubRep: { 1: 19, 2: 20, 3: 5000 } } as unknown as GameState;
    const p = { cmRep: [0, 200, 0] } as unknown as Player;            // +0xb = 10000 → 20
    expect(cmLoanRefuses(g, p, 1)).toBe(true);
    expect(cmLoanRefuses(g, p, 2)).toBe(false);
    expect(cmLoanRefuses(g, p, 3)).toBe(false);
  });
  const g = {
    nations: [{ name: 'England' }, { name: 'Austria' }, { name: 'Mexico' }],
    clubs: { 1: { id: 1, league: 'CM10' }, 2: { id: 2 }, 3: { id: 3 } },
    comps: { CM10: { type: 'league', nation: 0 }, CM11: { type: 'league', nation: 0 }, FAC: { type: 'cup', nation: 0 }, AUT: { type: 'cup', nation: 1 },
      MEX: { type: 'cup', nation: 2 }, CL: { type: 'continental', nation: -1 } },
    cmClubStat: { 1: [1, 0, 11, 3] },
  } as unknown as GameState;
  const fx = (comp: string, home = 1, away = 3) => ({ comp, home, away }) as unknown as Fixture;
  const p = (l: Partial<NonNullable<Player['loan']>>) => ({ club: 1, loan: { from: 2, until: '2002-06-30', ...l } }) as unknown as Player;
  it('uden pokalkampe: kun divisionen og sidste sæsons division (+0x57/+0x5b)', () => {
    expect(cmLoanBar(g, p({ noCup: true }), fx('CM10'))).toBe(0);
    expect(cmLoanBar(g, p({ noCup: true }), fx('CM11'))).toBe(0);
    expect(cmLoanBar(g, p({ noCup: true }), fx('FAC'))).toBe(0xa);
    expect(cmLoanBar(g, p({}), fx('FAC'))).toBe(0);
  });
  it('ikke mod moderklubben; europæisk land uden eget regelsæt følger Europas, andre lande og Europa-turneringerne ingen', () => {
    expect(cmLoanBar(g, p({ noAgainst: true }), fx('CM10', 2, 1))).toBe(0xb);
    expect(cmLoanBar(g, p({ noAgainst: true }), fx('CM10', 1, 3))).toBe(0);
    expect(cmLoanBar(g, p({ noCup: true }), fx('AUT'))).toBe(0xa);
    expect(cmLoanBar(g, p({ noCup: true }), fx('MEX'))).toBe(0);
    expect(cmLoanBar(g, p({ noCup: true, noAgainst: true }), fx('CL', 2, 1))).toBe(0);
  });
});

describe('menneskets lejebud til en computerklub (3.9.60, ægte tilstand, Man Utd)', { timeout: 600_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((n) => n.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  createGame(world, { managerName: 'M S', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  const g = gs();

  it('svaret er originalens 0x84af00 på svardagen; udløb og lønandel følger med til lejen', () => {
    const p = Object.values(g.players).find((x) => x.loanListed && x.club && x.club !== mu && g.clubs[x.club]?.nation === eng && !x.loan && x.contract)
      ?? Object.values(g.players).find((x) => x.club && x.club !== mu && g.clubs[x.club]?.nation === eng && !x.loan && x.contract && x.ca < 90)!;
    const expected = cmLoanAnswerNow(g, p.id, mu, p.club);
    const r = act<TransferOffer | string>({ t: 'bid', pid: p.id, fee: 0, loan: true, loanUntil: '2001-10-14', loanShare: 0.3, loanNoCup: true });
    expect(typeof r).toBe('object');
    const o = r as TransferOffer;
    expect(o.cmLoan).toBe(1);
    const ids0 = new Set(g.news.map((n) => n.id));
    for (let i = 0; i < 40 && o.status === 'pending'; i++) { processOffers(); if (o.status === 'pending') g.date = new Date(Date.parse(g.date) + 86400000).toISOString().slice(0, 10); }
    const fresh = g.news.filter((n) => !ids0.has(n.id)).map((n) => n.key);
    if (expected === 0) {
      expect(fresh).toContain('transfer.cmLoanAccepted');
      expect(p.club).toBe(mu);
      expect(p.loan).toMatchObject({ until: '2001-10-14', share: 0.3, noCup: true });
      expect(p.loan?.noAgainst).toBeUndefined();
    } else {
      expect(o.status).toBe('rejected');
      expect(fresh).toContain('transfer.cmLoanRejected');
    }
  });
});
