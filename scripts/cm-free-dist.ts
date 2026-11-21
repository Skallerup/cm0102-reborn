// Klubløse spillere ved spilstarten: fordeling (fødselsår, engelsk/andet land, CA, omdømme) i originalens hukommelse (pre-194-2001.bin, frø 1,
// databasestørrelse 2) mod spillets (WORLD = world bygget med CM_DBSIZE=2).   WORLD=<world-dbs2.json> npx tsx scripts/cm-free-dist.ts [dage=0]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';

const m = loadSnap(process.env.SNAP ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const staff = m.u32(0xae23bc), n = m.s32(0xae2364);
const str = (a: number) => { let s = ''; for (let i = 0; i < 54; i++) { const ch = m.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
type R = { y: number; eng: boolean; ca: number; pa: number; rep: number };
const o: R[] = [];
for (let id = 0; id < n; id++) {
  const st = staff + 0x6e * id, pr = m.u32(st + 0x61);
  if (!pr || m.u32(st + 0x39)) continue;
  o.push({ y: m.s16(st + 0x12), eng: str(m.u32(st + 0x1a) + 4) === 'England', ca: m.s16(pr + 5), pa: m.s16(pr + 7), rep: m.s16(pr + 0xd) });
}
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: +(process.env.SEED ?? 1), mode: 'authentic' });
const g = gs();
const days = +(process.argv[2] ?? 0);
for (let d = 0; d < days; d++) { const to = g.date; while (g.date === to || g.pendingFixture) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); } }
const u: R[] = [];
for (const p of Object.values(g.players)) {
  if (p.club || p.virtual || !cmInMemory(g, p)) continue;
  u.push({ y: +p.dob.slice(0, 4), eng: p.nation === eng, ca: p.ca, pa: p.pa, rep: (p as { cmCurRep?: number }).cmCurRep ?? -1 });
}
const band = (xs: R[], f: (r: R) => string) => { const c: Record<string, number> = {}; for (const r of xs) c[f(r)] = (c[f(r)] ?? 0) + 1; return Object.entries(c).sort().map(([k, v]) => `${k}:${v}`).join(' '); };
const yb = (r: R) => (r.y >= 1982 ? '1982+' : r.y >= 1979 ? '79-81' : r.y >= 1975 ? '75-78' : r.y >= 1970 ? '70-74' : '<1970');
const cb = (r: R) => (r.ca < 20 ? 'a<20' : r.ca < 50 ? 'b20-49' : r.ca < 90 ? 'c50-89' : r.ca < 130 ? 'd90-129' : 'e130+');
for (const [k, xs] of [['originalen', o], [`spillet ${g.date}`, u]] as const) {
  console.log(`${k}: ${xs.length} klubløse (engelske ${xs.filter((r) => r.eng).length})`);
  console.log(`  fødselsår  ${band(xs, yb)}\n  CA        ${band(xs, cb)}\n  eng × år  ${band(xs.filter((r) => r.eng), yb)}\n  eng × CA  ${band(xs.filter((r) => r.eng), cb)}`);
}
