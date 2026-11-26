// K7: hukommelsens id (+0) for spillerne og managerne i ønskelisternes hukommelse (buildSlMem) mod spillets id'er – til sammenligning med
// oraklets dagsbillede ($S/k7i/oids.py). Skriver { ids: { "navn|klub": [memId, p.id] }, mgr: { klub: [memId, staff.id, navn] }, seed }.
//   WORLD=<world-dbs2.json> D=2001-07-14 OUT=<u.json> npx tsx scripts/k7-memids.ts
import { readFileSync, writeFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import { buildSlMem } from '../src/game/cmShortlistGame';
import { aiPickCtx } from '../src/game/engine/grid/aiTeam';

const WF = process.env.WORLD!, w = JSON.parse(readFileSync(WF, 'utf8')) as WorldData;
const g = loadOrCreate({ world: w, worldFile: WF, club: 'Arsenal', date: process.env.D ?? '2001-07-14', seed: 1, mode: 'authentic', managerName: 'Test Smoke' });
const S = buildSlMem(g);
const smi = (S.M as unknown as { staffMemId?: (sid: number) => number | undefined }).staffMemId;
const ids: Record<string, [number, number]> = {};
for (const p of Object.values(g.players)) { const id = S.memOf.get(p.id); if (id !== undefined) ids[`${p.first} ${p.last}|${g.clubs[p.club]?.name ?? '-'}`] ??= [id, p.id]; }
const mgr: Record<string, [number | undefined, number, string]> = {};
for (const c of Object.values(g.clubs)) { const s = g.staff[c.manager ?? -1]; if (s) mgr[c.name] = [smi?.(s.id), s.id, `${s.first} ${s.last}`]; }
writeFileSync(process.env.OUT!, JSON.stringify({ ids, mgr, seed: g.seed }));
for (const c of Object.values(g.clubs).filter((c) => g.comps[c.league]?.name === 'English Premier Division' || g.leagues[c.league]?.name === 'English Premier Division').sort((a, b) => a.name.localeCompare(b.name))) console.log(c.name, JSON.stringify(aiPickCtx(c.id)?.judge));
console.log(Object.keys(ids).length, 'spillere, seed', g.seed);
