// K7: engelske klubbers manager i spillet (Staff.cmMem) mod oraklets +0xcf ved spilstart.  WORLD=<world-dbs2.json> npx tsx scripts/k7-mgr-probe.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps.find((x) => x.iso === '2001-07-14')!);
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const O = new Map<string, string>();
for (let i = 0; i < nc; i++) {
  const a = C + 0x245 * i; if (str(m, m.u32(a + 0x53) + 4) !== 'England') continue;
  const mg = m.u32(a + 0xcf);
  O.set(str(m, a + 4), mg ? (str(m, m.u32(mg + 0xc)) || `${str(m, m.u32(mg + 4))} ${str(m, m.u32(mg + 8))}`) : '');
}
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const tally: Record<string, number> = {};
const ex: string[] = [];
for (const c of Object.values(g.clubs)) {
  if (c.nation !== eng || !O.has(c.name)) continue;
  const s = c.manager !== undefined && c.manager !== null ? g.staff[c.manager] : undefined;
  const us = s && s.cmMem ? 'mem' : s ? 'ikke-mem' : 'ingen';
  const os = O.get(c.name) ? 'mgr' : '0';
  const k = `${String(c.league).startsWith('CM') ? 'liga' : 'NL'} orakel ${os} / vores ${us}`;
  tally[k] = (tally[k] ?? 0) + 1;
  if (os !== (us === 'mem' ? 'mgr' : '0') && ex.length < 20) ex.push(`${c.name}: orakel ${O.get(c.name) || '-'} / vores ${s ? `${s.first} ${s.last} (cmMem ${s.cmMem}, extra ${s.cmExtra}, rolle ${s.role})` : '-'}`);
}
console.log(tally); console.log(ex.join('\n'));
