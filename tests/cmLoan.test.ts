// CM 01/02: lejeperioden (TRANSFER_MANAGER::get_loan_period 0x8d0590 + landenes regler) og menneskets lejebud (0x8be300 → 0x8c63a0 → 0x84af00).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cmLoanPeriod, loanDate } from '../src/game/cmLoan';
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
    const r = act<TransferOffer | string>({ t: 'bid', pid: p.id, fee: 0, loan: true, loanUntil: '2001-10-14', loanShare: 0.3 });
    expect(typeof r).toBe('object');
    const o = r as TransferOffer;
    expect(o.cmLoan).toBe(1);
    const ids0 = new Set(g.news.map((n) => n.id));
    for (let i = 0; i < 40 && o.status === 'pending'; i++) { processOffers(); if (o.status === 'pending') g.date = new Date(Date.parse(g.date) + 86400000).toISOString().slice(0, 10); }
    const fresh = g.news.filter((n) => !ids0.has(n.id)).map((n) => n.key);
    if (expected === 0) {
      expect(fresh).toContain('transfer.cmLoanAccepted');
      expect(p.club).toBe(mu);
      expect(p.loan).toMatchObject({ until: '2001-10-14', share: 0.3 });
    } else {
      expect(o.status).toBe('rejected');
      expect(fresh).toContain('transfer.cmLoanRejected');
    }
  });
});
