// fill_shortlist_slot 0x83f3a0's lejegren 0x840c67–0x840d62 (en plads uden mål i gruppe 2/3 bliver en lejeplads, +0x24 bit 0) pr. klubbens liga:
// hvor ofte grenen nås, og hvor den stopper (pengeprøven 0x840cc7, budgettet +7 < £50.000 0x840cd2, England/omdømme 0x840cdb–0x840d09,
// nation +0x11c 0x840d0e, lodtrækningen 0x840d30). Budgettet +7 og +3/+0xb fordeles i spande.
//   [WORLD=…] npx tsx scripts/cm-loan-branch.ts [til-dato] [klub]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { TRACE } from '../src/game/cmGen/x86';

const until = process.argv[2] ?? '2026-08-20';
const wf = process.env.WORLD ?? 'public/data/world.json';
const w = JSON.parse(readFileSync(wf, 'utf8')) as WorldData;
if (!process.env.WORLD) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: 1, mode: 'authentic' });
const g = gs();
const lgOf = (cid: number) => { const c = g.clubs[cid]; if (!c) return `?${cid}`; const n = g.nations[c.nation]?.name; return n === 'England' ? `ENG ${c.league ?? '-'}` : n ?? '?'; };
const T: Record<string, Record<string, number>> = {};
const add = (k: string, f: string) => { const r = (T[k] ??= {}); r[f] = (r[f] ?? 0) + 1; };
const bucket = (v: number) => v <= 0 ? '≤0' : v < 50000 ? '<50k' : v < 250000 ? '<250k' : v < 1e6 ? '<1m' : v < 5e6 ? '<5m' : '≥5m';
let cur = '?', esi = 0;
TRACE.on = true;
TRACE.f = (pc, R) => {
  if (pc < 0x840c67 || pc > 0x840d62) return;
  switch (pc) {
    case 0x840c67: break;
    case 0x840c9c: { const cid = ((R.m.u32((R.ebp + 0xc) >>> 0) - 0x30000000) / 0x245); cur = lgOf(cid); } esi = R.esi; add(cur, 'a gruppe2/3 uden mål');
      add(cur, `+7 ${bucket(R.m.s32(esi + 7))}`); add(cur, `+3 ${bucket(R.m.s32(esi + 3))}`); add(cur, `+0xb ${bucket(R.m.s32(esi + 0xb))}`); break;
    case 0x840cd2: add(cur, 'b pengeprøven nej'); break;
    case 0x840cdb: add(cur, 'c +7 ≥ 50k'); break;
    case 0x840d0b: add(cur, 'd lejevej'); break;
    case 0x840d34: add(cur, 'e lejebit'); break;
  }
};
let days = 0;
while (g.date < until && days++ < 400) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
TRACE.on = false;
console.log(`${wf} → ${g.date}`);
for (const [k, r] of Object.entries(T).sort((a, b) => (b[1]['a gruppe2/3 uden mål'] ?? 0) - (a[1]['a gruppe2/3 uden mål'] ?? 0)).slice(0, 25))
  console.log(`  ${k}: ${Object.entries(r).sort().map(([a, b]) => `${a} ${b}`).join(', ')}`);
