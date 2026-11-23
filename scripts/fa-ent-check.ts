// FA Cup'en (g.cmCupPort) i et nyt spil: deltagerne pr. division, rundetabellens form og – med en til-dato – forløbet runde for runde
// (kampe, hold uden modstander, vinder). 2026 = world.json + world-cm.json (ægte tilstand), 2001 = world-original.json.
//   npx tsx scripts/fa-ent-check.ts [2026|2001] [til-dato] [klub=Brentford] [frø=1]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmFaCupEntrants, cmCupRoundShape } from '../src/game/cmCups';
import { cmRand } from '../src/game/cmPlayerData';
const db = process.argv[2] ?? '2026';
const until = process.argv[3];
const name = process.argv[4] ?? 'Brentford';
const seed = Number(process.argv[5] ?? 1);
const w = JSON.parse(readFileSync(db === '2001' ? 'public/data/world-original.json' : 'public/data/world.json', 'utf8')) as WorldData;
if (db !== '2001') Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const club = w.clubs.find((c) => c[1] === name || c[2] === name)![0] as number;
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const year = +g.date.slice(0, 4);
const ent = cmFaCupEntrants(g, eng, year, cmRand(g.seed ?? 0, 0x56fab0, year));
const per: Record<string, number> = {};
for (const id of ent) { const c = g.clubs[id]; const k = g.leagues[c.league]?.hidden ? `skjult ${g.cmFinRaw?.[id]?.[0]}` : g.leagues[c.league]?.name; per[k] = (per[k] ?? 0) + 1; }
console.log(`${db}: FA Cup-deltagere ${ent.length}`, per);
for (let r = 1; r <= 9; r++) console.log(`  runde ${r} [hold, kampe, nye, første nye]`, cmCupRoundShape('ENG', year, r));
if (until) {
  const fa = () => Object.values(g.comps).find((c) => c.meta?.cmFa);
  let seen = 0, days = 0, done = false;
  try {
    while (g.date < until && days++ < 420) {
      const r = continueGame();
      if (r.match !== undefined) quickPlayUserMatch();
      const c = fa();
      if (c && !done && (c.meta!.round as number) !== seen) {
        seen = c.meta!.round as number;
        const ties = c.ties.filter((t) => t.stage === c.stage);
        console.log(`${g.date} runde ${seen} (${c.stage}): ${ties.length} kampe, uden modstander ${((c.meta!.cmFaBye as number[]) ?? []).length}`);
      }
      if (c?.finished && !done) { console.log(`${g.date} vinder ${g.clubs[c.winner ?? -1]?.name}`); done = true; }
    }
    console.log(`OK til ${g.date}`);
  } catch (e) {
    console.log(`NEDBRUD ${g.date}: ${(e as Error).stack}`);
    process.exitCode = 1;
  }
}
