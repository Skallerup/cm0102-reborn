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
  // Lejede spillere: lejeklubben betaler sin andel, moderklubben resten
  const parentPays = new Map<number, number>();
  for (const c of Object.values(g.clubs)) {
    let w = staffWages.get(c.id) ?? 0;
    for (const p of squad(c.id)) {
      const wage = p.contract?.wage ?? 0;
      if (p.loan) {
        const share = p.loan.share ?? 1;
        w += wage * share;
        parentPays.set(p.loan.from, (parentPays.get(p.loan.from) ?? 0) + wage * (1 - share));
      } else w += wage;
    }
    c.balance -= w;
    c.finance.wages += w;
  }
  for (const [cid, w] of parentPays) {
    const c = g.clubs[cid];
    if (!c || !w) continue;
    c.balance -= w;
    c.finance.wages += w;
  }
}

export function currentWageBill(clubId: number): number {
  const g = gs();
  let bill = squad(clubId).reduce((s, p) => s + (p.contract?.wage ?? 0) * (p.loan ? p.loan.share ?? 1 : 1), 0);
  // udlejede spillere hvor vi stadig betaler en del
  for (const p of Object.values(g.players)) if (p.loan?.from === clubId) bill += (p.contract?.wage ?? 0) * (1 - (p.loan.share ?? 1));
  return bill;
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
  const demand = ticketDemand(home, home.ticketPrice, away.rep, formBoost, big);
  const att = Math.round(home.seats * demand * (0.95 + rng.next() * 0.05));
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
    // ligaer der ikke simuleres har ingen kampe – giv dem et skøn over billetindtægterne (≈2 hjemmekampe/md.)
    if (!g.comps[c.league] && g.date.slice(5, 7) !== '06' && g.date.slice(5, 7) !== '07') {
      const att = c.seats * Math.min(1, 0.3 + c.rep / 160 + 0.06);
      const gate = Math.round(att * c.ticketPrice * 2);
      c.balance += gate;
      c.finance.gate += gate;
    }
    c.finance.tv += tv;
    c.finance.sponsor += sponsor;
    c.finance.merch += merch;
  }
}

export function seasonPrizeMoney() {
  const g = gs();
  // ligaer der ikke simuleres: præmie efter omdømme-rangering
  const unsim = new Map<string, Club[]>();
  for (const c of Object.values(g.clubs)) {
    if (g.comps[c.league]) continue;
    if (!unsim.has(c.league)) unsim.set(c.league, []);
    unsim.get(c.league)!.push(c);
  }
  for (const [lg, clubs] of unsim) {
    const wealth = rulesFor(lg, clubs.length).wealth;
    const tier = g.leagues[lg]?.tier ?? 1;
    clubs.sort((a, b) => b.rep - a.rep).forEach((c, i) => {
      const prize = Math.round((clubs.length - i) * 400_000 * wealth * wealth * (tier === 1 ? 1 : 0.3));
      c.balance += prize;
      c.finance.prize += prize;
    });
  }
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

/** Andel af stadion der fyldes (0.15-1) ved en given billetpris */
export function ticketDemand(home: Club, price: number, awayRep = 40, formBoost = 0, big = 1): number {
  const fair = fairTicketPrice(home.rep, home.league);
  // tilskuerne er mere følsomme over for dyre end for billige billetter
  const ratio = price / fair;
  const priceF = Math.max(0.15, Math.min(1.25, ratio > 1 ? 1 - (ratio - 1) * 0.95 : 1 + (1 - ratio) * 0.45));
  return Math.max(0.15, Math.min(1, (0.3 + home.rep / 160 + awayRep / 800 + formBoost) * big * priceF));
}

/** Forventet tilskuertal og indtægt pr. ligakamp ved en given pris (mod en gennemsnitlig modstander) */
export function estimateGate(club: Club, price: number): { attendance: number; income: number; fill: number } {
  const fill = ticketDemand(club, price, 45);
  const attendance = Math.round(club.seats * fill);
  return { attendance, income: attendance * price, fill };
}
