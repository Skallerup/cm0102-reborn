// K7: 0x4d0c60's inddata (staff +0x52) for de samme spillere – oraklets spilstart 14/7-01 mod spillets hukommelse (cmValueMem): klubbens
// +0x57 division (→ +0x69), +0x53 land (+0x7e, +0x85), +0x64 status, +0x80 omdømme; spillerens alder, positioner, omdømme +9/+0xb/+0xd, +0x52.
//   WORLD=<world-dbs2.json> NAMES="Tony Roberts,Bill Edwards" npx tsx scripts/k7-value-inputs.ts     (LEAGUE=HN60: alle i ligaen, N=20)
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, clubAt, type SparseMem, type CmMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmValueMem, cmValueAt } from '../src/game/cmValueGame';

const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const om = loadDaySnap(ix, ix.snaps.find((x) => x.iso === (process.env.DATE ?? '2001-07-14'))!);
const S = om.u32(0xae23bc), n = om.s32(0xae2364);
const byName = new Map<string, number[]>();
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id; if (!om.u32(st + 0x61)) continue;
  const nm = str(om, om.u32(st + 0xc)) || `${str(om, om.u32(st + 4))} ${str(om, om.u32(st + 8))}`;
  (byName.get(nm) ?? byName.set(nm, []).get(nm)!).push(st);
}
const desc = (m: CmMem, st: number, k: number) => {
  const club = k ? clubAt(m as SparseMem, m.s32(k + 4)) : 0, rec = m.u32(st + 0x61);
  const div = club ? m.u32(club + 0x57) : 0, cn = club ? m.u32(club + 0x53) : 0;
  return `v ${String(m.s32(st + 0x52)).padStart(8)} | alder ${m.u8(st + 0x18)} pos ${[0xf, 0x12, 0x13, 0x14, 0x15].map((o) => m.u8(rec + o)).join('/')} omd ${m.s16(rec + 9)}/${m.s16(rec + 0xb)}/${m.s16(rec + 0xd)} ` +
    `inj ${m.u8(rec + 0x2d)} | mgr ${club ? (m.u32(club + 0xcf) ? 'ja' : '0') : '-'} klub omd ${club ? m.s16(club + 0x80) : '-'} st ${club ? m.u8(club + 0x64) : '-'} div ${div ? m.s16(div + 0x69) : 'null'} land ${cn ? `${m.u8(cn + 0x7e)}/${m.u8(cn + 0x85)}` : '-'} ` +
    `udløb ${k ? `${m.s16(k + 0x2d)}/${m.u16(k + 0x2f)}` : '-'} +35 ${k ? m.u8(k + 0x35) & 0x3f : '-'} +3d ${k ? (m.u8(k + 0x3d) << 24) >> 24 : '-'}`;
};
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
let ps = Object.values(g.players).filter((p) => p.club && p.contract);
if (process.env.NAMES) { const want = new Set(process.env.NAMES.split(',')); ps = ps.filter((p) => want.has(`${p.first} ${p.last}`.trim())); }
else ps = ps.filter((p) => g.clubs[p.club]?.league === (process.env.LEAGUE ?? 'HN60') && g.clubs[p.club].nation === eng).slice(0, Number(process.env.N ?? 20));
const M = cmValueMem(g, new Set(ps.map((p) => p.loan?.from ?? p.club)));
const um = M.c.m;
for (const p of ps) {
  const nm = `${p.first} ${p.last}`.trim(), st = M.W.staffOf(p);
  console.log(`\n${nm} (${g.clubs[p.club].name})  CA ${p.ca} PA ${p.pa}  spillets værdi £${Math.round(cmValueAt(M, st!))}`);
  if (st) console.log(`  V ${desc(um, st, getContract(um as SparseMem, st))}`);
  for (const o of byName.get(nm) ?? []) console.log(`  O ${desc(om, o, getContract(om, o))}  (${str(om, clubAt(om, om.s32(getContract(om, o) + 4)) + 4)})`);
}
