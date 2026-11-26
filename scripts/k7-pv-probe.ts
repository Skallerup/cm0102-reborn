// K7: 0x6e6340(spiller, pos, maske, klub, a4, klubbens manager) på spillets data (planValue i ønskelisternes hukommelse) – spillets side af
// $S/k7i/o6340.py: svaret og 0x6e86d0-kaldene (PV_STATS.judge).
//   WORLD=<world-dbs2.json> D=2001-07-14 P="Paul Robinson" KLUB="Blackburn Rovers" [MASK=5902] [POS=1] [A4=-1] npx tsx scripts/k7-pv-probe.ts
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import { buildSlMem, PV_STATS } from '../src/game/cmShortlistGame';


const WF = process.env.WORLD!, w = JSON.parse(readFileSync(WF, 'utf8')) as WorldData;
const g = loadOrCreate({ world: w, worldFile: WF, club: 'Arsenal', date: process.env.D ?? '2001-07-14', seed: 1, mode: 'authentic', managerName: 'Test Smoke' });
const S = buildSlMem(g), m = S.m;
const names = (process.env.P ?? 'Paul Robinson').split(',');
const c = Object.values(g.clubs).find((x) => x.name === (process.env.KLUB ?? 'Blackburn Rovers'))!;
const club = S.clubAdr(c.id), J = m.u32(club + 0xcf);
const MASK = parseInt(process.env.MASK ?? '5902', 16), POS = parseInt(process.env.POS ?? '1', 16), A4 = +(process.env.A4 ?? -1);
PV_STATS.judge = (p, kind, hint, v) => console.log(`  0x6e86d0 ${p.first} ${p.last} kind ${kind} hint ${hint} → ${v} (CA ${p.ca} PA ${p.pa})`);
if (process.env.PID) { const [a, b] = process.env.PID.split(':'); PV_STATS.pid = (p) => (`${p.first} ${p.last}` === a ? +b : p.id); }
(globalThis as { __PS?: (...a: unknown[]) => void }).__PS = (...a) => console.log('   planScore', ...a);
{ const st = g.staff[c.manager ?? -1]; console.log('manager', st?.first, st?.last, 'cmNp', JSON.stringify(st?.cmNp), 'tac', JSON.stringify(st?.tac), 'attrs', JSON.stringify(st?.attrs)); }
for (const nm of names) {
  const p = Object.values(g.players).find((x) => `${x.first} ${x.last}` === nm);
  if (!p) { console.log('ingen', nm); continue; }
  const st = (m.u32(0xae23bc) + 0x6e * S.memOf.get(p.id)!) >>> 0;
  const v = S.c.call(0x6e6340, st, POS, MASK, club, A4, J);
  console.log(nm, 'id', p.id, 'resultat', v | 0, 'J', J ? m.s32(J) : 0);
}
