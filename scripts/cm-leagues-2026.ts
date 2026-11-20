// Ligaernes kampskema på 2026/27 (MODERN_PARITY, Bosman 0.7.2-tjeklistens punkt 1): for hver liga antal klubber, møder, runder, skemaets
// rækker (cmLeagueSchedule), kampe pr. hold, første/sidste dato, dobbeltbookinger (en klub med to kampe samme dag) og uspillede kampe.
//   npx tsx scripts/cm-leagues-2026.ts [til-dato[,til-dato…]] [frø] [world-fil]   (til-dato = 'start': kun skemaet ved spilstart)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmLeagueSchedule } from '../src/game/cmCalendar';
import type { Fixture } from '../src/game/types';

const until = process.argv[2] ?? 'start';
const seed = Number(process.argv[3] ?? 1);
const file = process.argv[4] ?? 'public/data/world.json';
const w = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
if (file.endsWith('world.json')) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const club = w.clubs.find((c) => c[1] === 'Brentford' || c[2] === 'Brentford') ?? w.clubs[0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: club[0], activeNations: [...new Set(w.leagues.filter((l) => !l.hidden).map((l) => l.nation))], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const leagues = Object.values(g.comps).filter((c) => c.type === 'league').sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
// alle ligakampe ved start (en liga, der er færdig, kan blive ryddet senere)
const fxAt = new Map<string, Fixture[]>();
const snap = () => { for (const c of leagues) fxAt.set(c.id, Object.values(g.fixtures).filter((f) => f.comp === c.id)); };
snap();
const row = (label: string) => {
  console.log(`--- ${label} ${g.date}`);
  console.log('liga   | klubber | runder | skema | kampe/hold | første → sidste | dobbelt | uspillet | navn');
  for (const c of leagues) {
    const fx = Object.values(g.fixtures).filter((f) => f.comp === c.id);
    const all = fx.length ? fx : fxAt.get(c.id) ?? [];
    const rounds = Math.max(0, ...all.map((f) => f.round ?? 0));
    const per = new Map<number, number>();
    for (const f of all) { per.set(f.home, (per.get(f.home) ?? 0) + 1); per.set(f.away, (per.get(f.away) ?? 0) + 1); }
    const pv = [...per.values()];
    const dates = all.map((f) => f.date).sort();
    const sched = cmLeagueSchedule(c.id, (c.meta?.cmYear as number | undefined) ?? g.season);
    // dobbeltbookinger: klubben har to kampe (alle turneringer) samme dag
    let dbl = 0;
    for (const id of c.clubs) {
      const ds = Object.values(g.fixtures).filter((f) => f.home === id || f.away === id).map((f) => f.date).sort();
      for (let i = 1; i < ds.length; i++) if (ds[i] === ds[i - 1]) dbl++;
    }
    const stale = fx.filter((f) => !f.result && f.date < g.date).length;
    console.log(`${c.id.padEnd(6)} | ${String(c.clubs.length).padStart(7)} | ${String(rounds).padStart(6)} | ${String(sched?.length ?? '-').padStart(3)}${c.meta?.cmSched ? ' ✓' : '  '} | ${pv.length ? `${Math.min(...pv)}–${Math.max(...pv)}` : '-'} | ${dates[0] ?? '-'} → ${dates.at(-1) ?? '-'} | ${dbl} | ${stale} | ${c.name}`);
  }
};
row('start');
// flere datoer (kommasepareret): tabellen ved hver – fx før kalenderårslandenes sæsonskifte (Norge 27/11) og før Europas (20/6)
if (until !== 'start') for (const to of until.split(',')) {
  let days = 0;
  while (g.date < to && days++ < 800) {
    const r = continueGame();
    if (r.match !== undefined) quickPlayUserMatch();
  }
  row('til');
}
