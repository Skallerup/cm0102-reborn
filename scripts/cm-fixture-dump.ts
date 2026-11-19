// Kampprogrammet (alle turneringer) som JSON – til sammenligning med oraklets fixtures_<år>.tmp / hukommelsens fixtures (0x4f-poster).
// Spillet startes som cm-day-lockstep.ts (England, Arsenal, frø 1). Brug:
//   WORLD=<world-dbs2.json> npx tsx scripts/cm-fixture-dump.ts <ud.json> [til-dato]   (uden dato: lige efter createGame)
// Med en dato spilles dagene frem (kampene i hele sæsonen gemmes løbende – sæsonskiftet fjerner dem fra g.fixtures).
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const [out, until] = process.argv.slice(2);
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === (process.env.CLUB ?? 'Arsenal'))![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const seen = new Map<number, Record<string, unknown>>();
const grab = () => {
  for (const f of Object.values(g.fixtures)) {
    const c = g.comps[f.comp];
    seen.set(f.id, { id: f.id, comp: f.comp, cname: c?.name, ctype: c?.type, stage: f.stage, date: f.date, slot: f.slot, tv: f.tv, home: g.clubs[f.home]?.name, away: g.clubs[f.away]?.name, b3a: f.cm?.b3a, w30: f.cm?.w30, w32: f.cm?.w32, played: !!f.result });
  }
};
grab();
if (until) {
  let last = '';
  while (g.date < until || !g.dayDone || g.pendingFixture) {
    const r = continueGame();
    if (r?.match) quickPlayUserMatch();
    if (g.date !== last) { grab(); last = g.date; }
  }
  grab();
}
writeFileSync(out, JSON.stringify([...seen.values()]));
console.log(`${seen.size} kampe → ${out} (spillets dato ${g.date})`);
