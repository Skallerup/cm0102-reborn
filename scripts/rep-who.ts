// Hvem skriver klubomdømmet (club +0x80 = g.cmClubRep)? Kører spillet (Arsenal på ferie, frø 1) til FROM og logger derefter hver ændring
// for klubberne i DIV (ligaens navn) med dato, ugedag, Δ og kaldestakkens øverste funktioner – til UNTIL. Summer pr. skriver til sidst.
//   WORLD=<world-dbs2.json> FROM=2001-10-01 UNTIL=2001-11-01 [DIV="English First Division"] npx tsx scripts/rep-who.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';

const FROM = process.env.FROM ?? '2001-10-01', UNTIL = process.env.UNTIL ?? '2001-11-01';
const DIV = process.env.DIV ?? 'English First Division';
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const step = (until: string) => {
  const g = gs(); let guard = 0;
  while ((g.date < until || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
    if (!g.userClub) {
      const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
      if (offer) applyAction({ t: 'acceptJob', club: offer });
      else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
};
step(FROM);
const g = gs();
const watch = new Set(Object.values(g.clubs).filter((c) => (g.comps[c.league]?.name ?? '') === DIV).map((c) => c.id));
const sums = new Map<string, [number, number]>();
const raw = g.cmClubRep!;
g.cmClubRep = new Proxy(raw, {
  set(t, k, v) {
    const id = Number(k), old = t[id];
    if (watch.has(id) && old !== v) {
      const st = (new Error().stack ?? '').split('\n').slice(2, 6).map((l) => l.trim().replace(/^at /, '').replace(/\(.*\/src\/game\//, '(').replace(/:\d+\)$/, ')')).join(' < ');
      const day = new Date(`${gs().date}T00:00:00Z`).toUTCString().slice(0, 3);
      console.log(gs().date, day, g.clubs[id].name.padEnd(22), String(v - old).padStart(5), st);
      const key = st.split(' < ').slice(0, 2).join(' < ');
      const s = sums.get(key) ?? [0, 0]; s[0] += v - old; s[1]++; sums.set(key, s);
    }
    t[id] = v; return true;
  },
});
step(UNTIL);
console.log('--- pr. skriver (Δ, antal)');
for (const [k, v] of [...sums].sort((a, b) => a[1][0] - b[1][0])) console.log(String(v[0]).padStart(6), String(v[1]).padStart(4), k);
