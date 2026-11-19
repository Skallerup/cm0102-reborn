// 2026/27 i ægte tilstand: spillere med ikke-spillerpost (cmRetire.ts npStaffOf) ved start, og hvor mange der bliver stab (0x7a59e0 0x7a62c2)
// til datoen. npx tsx scripts/cm-retire-staff-2026.ts [til-dato=2027-07-01]
import { readFileSync, existsSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { npStaffOf } from '../src/game/cmRetire';

const until = process.argv[2] ?? '2027-07-01';
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
if (existsSync('public/data/world-cm-staff.json')) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm-staff.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford' || c[2] === 'Brentford')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
console.log('spillere med ikke-spillerpost ved start:', Object.values(g.players).filter((p) => npStaffOf(g, p)).length);
while (g.date < until) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
const ex = Object.values(g.staff).filter((s) => s.exPlayer && !g.players[s.exPlayer.pid]);
const jobs: Record<string, number> = {};
for (const s of ex) { const k = `${s.role} ${s.club ? 'klub' : 'klubløs'}`; jobs[k] = (jobs[k] ?? 0) + 1; }
console.log(`blev stab til ${until}: ${ex.length} ${JSON.stringify(jobs)}; pensioneret i alt ${g.cmRetLog?.length ?? 0}`);
for (const s of ex.slice(0, 15)) console.log(`  ${s.first} ${s.last} ${s.role} ${s.club ? g.clubs[s.club]?.name : 'klubløs'}`);
