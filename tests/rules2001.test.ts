// 2001/02-regler gælder kun den originale database: tilbagekald fra leje og udeblivende spillere.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad, setClub } from '../src/game/state';
import { recallLoan } from '../src/game/transfers';
import { awolMonthly } from '../src/game/rules2001';
import { addDays } from '../src/game/dates';

const start = (f: string, club: string) => {
  const w = JSON.parse(readFileSync(`public/data/${f}`, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === club)![0], activeNations: [eng], lang: 'en', masking: true, seed: 3 });
  return gs();
};
const loanAway = () => {
  const g = gs();
  const p = squad(g.userClub).sort((a, b) => a.ca - b.ca)[0];
  const to = Object.values(g.clubs).find((c) => c.id !== g.userClub && g.comps[c.league])!;
  setClub(p, to.id); p.loan = { from: g.userClub, until: addDays(g.date, 300) }; p.joined = g.date;
  return p;
};

describe('2001-regler', () => {
  it('original database: kald hjem fra leje efter 28 dage, utilfredse spillere kan udeblive', () => {
    const g = start('world-original.json', 'Leeds United');
    const p = loanAway();
    expect(recallLoan(p.id)).toBe('loan.recallTooSoon');
    for (let i = 0; i < 30; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    expect(recallLoan(p.id)).toBe('loan.recalled');
    expect(p.club).toBe(g.userClub);
    for (const x of squad(g.userClub)) x.unhappy = 100;
    for (let i = 0; i < 6; i++) awolMonthly();
    expect(squad(g.userClub).some((x) => x.injury?.key === 'awol')).toBe(true);
  }, 60_000);
  it('den moderne database har ingen af reglerne', () => {
    const g = start('world.json', 'Brentford FC');
    const p = loanAway();
    p.joined = addDays(g.date, -60);
    expect(recallLoan(p.id)).toBe('error');
    for (const x of squad(g.userClub)) x.unhappy = 100;
    for (let i = 0; i < 6; i++) awolMonthly();
    expect(squad(g.userClub).some((x) => x.injury?.key === 'awol')).toBe(false);
  }, 60_000);
});
