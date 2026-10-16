// Økonomi: løn, billetindtægter, TV-penge, sponsorer og præmiepenge.
import { finalOrder } from './competitions';
import { rulesFor } from './leagues';
import { gs, squad } from './state';
import { rng } from './rng';
import type { Club, Fixture } from './types';

export function weeklyWages() {
  const g = gs();
  const staffWages = new Map<number, number>();
  for (const s of Object.values(g.staff)) if (s.club) staffWages.set(s.club, (staffWages.get(s.club) ?? 0) + s.wage);
  for (const c of Object.values(g.clubs)) {
    let w = staffWages.get(c.id) ?? 0;
    for (const p of squad(c.id)) w += p.contract?.wage ?? 0;
    c.balance -= w;
    c.finance.wages += w;
  }
}

export function currentWageBill(clubId: number): number {
  return squad(clubId).reduce((s, p) => s + (p.contract?.wage ?? 0), 0);
}

/** Tilskuere og billetindtægt for en hjemmekamp */
export function gateReceipts(f: Fixture): number {
  const g = gs();
  const home = g.clubs[f.home];
  const away = g.clubs[f.away];
  if (!home || !away) return 0;
  const comp = g.comps[f.comp];
  const big = comp?.type === 'continental' ? 1.3 : comp?.type === 'cup' && f.stage === 'F' ? 1.5 : 1;
  const row = comp?.table.find((r) => r.club === home.id);
  const formBoost = row ? (row.form.split('W').length - 1) * 0.02 : 0;
  const fair = fairTicketPrice(home.rep, home.league);
  const priceF = Math.max(0.3, Math.min(1.2, 1 - (home.ticketPrice / fair - 1) * 0.5));
  const demand = Math.min(1, (0.3 + home.rep / 160 + away.rep / 800 + formBoost) * big * priceF);
  const att = Math.round(home.seats * Math.max(0.15, demand) * (0.95 + rng.next() * 0.05));
  const income = att * home.ticketPrice * (comp?.type === 'continental' ? 1.5 : 1);
  home.balance += income;
  home.finance.gate += income;
  if (comp?.type === 'cup' || f.stage === 'F') {
    // pokalkampe deles
    const half = income * 0.45;
    away.balance += half;
    away.finance.gate += half;
    home.balance -= half;
    home.finance.gate -= half;
  }
  return att;
}

export function monthlyIncome() {
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    const wealth = rulesFor(c.league, 20).wealth;
    const tier = g.leagues[c.league]?.tier ?? 2;
    const tv = Math.round((tier === 1 ? 1_200_000 : 250_000) * Math.pow(wealth, 2.5) * (0.6 + c.rep / 120));
    const sponsor = Math.round(Math.pow(c.rep, 2.5) * 25 * wealth);
    const merch = Math.round(c.rep * c.rep * 25 * wealth);
    c.balance += tv + sponsor + merch;
    c.finance.tv += tv;
    c.finance.sponsor += sponsor;
    c.finance.merch += merch;
  }
}

export function seasonPrizeMoney() {
  const g = gs();
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league') continue;
    const order = finalOrder(comp);
    const wealth = rulesFor(comp.id, order.length).wealth;
    order.forEach((cid, i) => {
      const c = g.clubs[cid];
      const prize = Math.round((order.length - i) * 400_000 * wealth * wealth * (comp.tier === 1 ? 1 : 0.3));
      c.balance += prize;
      c.finance.prize += prize;
    });
  }
}

export function addPrize(c: Club, amount: number) {
  c.balance += amount;
  c.finance.prize += amount;
}

/** Nyt budget ved sæsonstart */
export function newSeasonBudgets() {
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    const wealth = rulesFor(c.league, 20).wealth;
    const sv = squad(c.id).reduce((s, p) => s + p.value, 0);
    c.transferBudget = transferBudgetFor(sv, wealth, c.balance);
    const bill = currentWageBill(c.id);
    c.wageBudget = Math.round(Math.max(bill * 1.05, bill + 2000) / 500) * 500;
    c.finance = { gate: 0, tv: 0, prize: 0, sponsor: 0, merch: 0, transfersIn: 0, transfersOut: 0, wages: 0, other: 0 };
  }
}

export function fairTicketPrice(rep: number, league: string): number {
  return Math.round(10 + rep * 0.35 * Math.sqrt(Math.max(0.25, rulesFor(league, 20).wealth)));
}

export function transferBudgetFor(squadValue: number, wealth: number, balance: number): number {
  const base = squadValue * 0.08 * Math.min(1.5, wealth + 0.2) + Math.max(0, balance) * 0.25;
  const cap = Math.max(0, balance) * 0.8 + 1_000_000;
  return Math.round(Math.max(50_000, Math.min(base, cap)) / 50_000) * 50_000;
}
