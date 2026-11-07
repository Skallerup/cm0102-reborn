// Reserveholdets kampe (CM 01/02: "Man Utd Reserves win" – "Man Utd Reserves have beaten Leeds Reserves 4-2 at Old Trafford").
// Én kamp om ugen (onsdag) i sæsonen mod en klub fra samme liga, afgjort af styrken blandt spillerne uden for de 16
// (*estimeret*: Poisson med 1,4 mål i snit, forskudt efter styrken). Eget frø, så den øvrige simulering ikke ændres.
import { addDays } from './dates';
import { hash01 } from './rng';
import { addNews, fixturesOn, gs, squad } from './state';
import { forEachHuman } from './humans';

const poisson = (mean: number, u: number) => { let k = 0, p = Math.exp(-mean), s = p; while (u > s && k < 9) { k++; p *= mean / k; s += p; } return k; };

function reserveStrength(club: number): number {
  const g = gs();
  const firstTeam = new Set(club === g.userClub && g.tactic ? [...g.tactic.lineup, ...g.tactic.bench] : []);
  const rest = squad(club).filter((p) => !firstTeam.has(p.id) && !p.injury).sort((a, b) => b.ca - a.ca);
  // AI-klubber: de 16 bedste spiller på førsteholdet
  const pool = club === g.userClub ? rest : rest.slice(16);
  const xi = pool.slice(0, 11);
  return xi.length ? xi.reduce((s, p) => s + p.ca, 0) / 11 : 40;
}

/** Kaldes hver dag fra newDay */
export function reservesDaily() {
  const g = gs();
  if (g.draft || new Date(`${g.date}T12:00:00Z`).getUTCDay() !== 3) return;
  forEachHuman(() => {
    const me = g.clubs[g.userClub];
    if (!me) return;
    // kun i sæsonen: ligaen har kampe inden for en uge, og førsteholdet spiller ikke i dag
    const near = [-3, -2, -1, 1, 2, 3, 4].some((d) => fixturesOn(addDays(g.date, d)).some((id) => g.fixtures[id]?.comp === me.league));
    if (!near || fixturesOn(g.date).some((id) => { const f = g.fixtures[id]; return f && (f.home === me.id || f.away === me.id); })) return;
    const rivals = Object.values(g.clubs).filter((c) => c.league === me.league && c.id !== me.id);
    if (!rivals.length) return;
    const day = Math.floor(Date.parse(`${g.date}T12:00:00Z`) / 86400000);
    const opp = rivals[Math.floor(hash01(g.seed, me.id, day, 71) * rivals.length)];
    const home = hash01(g.seed, me.id, day, 72) < 0.5;
    const diff = (reserveStrength(me.id) - reserveStrength(opp.id)) / 25;
    const mine = poisson(Math.max(0.3, 1.4 + diff + (home ? 0.2 : 0)), hash01(g.seed, me.id, day, 73));
    const theirs = poisson(Math.max(0.3, 1.4 - diff + (home ? 0 : 0.2)), hash01(g.seed, opp.id, day, 74));
    const key = mine > theirs ? 'res.win' : mine === theirs ? 'res.draw' : 'res.loss';
    addNews({ cat: 'match', key, params: { team: me.short, opp: opp.short, a: mine, b: theirs, venue: (home ? me : opp).stadium ?? '' } });
  });
}
