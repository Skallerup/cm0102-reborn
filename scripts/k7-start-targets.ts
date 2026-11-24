// K7: ønskelisternes mål ved spilstart (oraklets dagsbillede 14/7-01 mod createGame, frø 1, Arsenal) – pr. engelsk ligaklub og spillerplads:
// budget +7, værdi +0xb, maske, målet (navn, klub, alder, CA, værdi +0x52). GROUPS=P,1 (standard alle fire ligaer).
//   WORLD=<world-dbs2.json> npx tsx scripts/k7-start-targets.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { fromRow } from '../src/game/cmSquadPlanGame';

const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const GROUPS = new Set((process.env.GROUPS ?? 'P,1,2,3').split(','));
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps.find((x) => x.iso === (process.env.DATE ?? '2001-07-14'))!);
const C = m.u32(0xae23b4), nc = m.s32(0xae235c), St = m.u32(0xae23bc);
const cname = (cix: number) => (cix >= 0 && cix < nc ? str(m, C + 0x245 * cix + 4) : '(klubløs)');
const grpO = (cix: number) => { if (cix < 0 || cix >= nc) return '-'; const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
const pdesc = (id: number) => {
  const st = St + 0x6e * id, pr = m.u32(st + 0x61);
  const nm = str(m, m.u32(st + 0xc)) || `${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}`;
  const k = getContract(m, st);
  const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12));
  return `${nm} (${dob.slice(0, 4)}) ${k ? cname(m.s32(k + 4)) : '(klubløs)'} CA ${pr ? m.s16(pr + 5) : '?'} v ${pr ? m.s32(pr + 0x52) : '?'}`;
};
const O = new Map<string, string[]>();
const slm = m.u32(m.u32(0xde1f54) + 0x856);
for (let cix = 0; cix < nc; cix++) {
  if (!GROUPS.has(grpO(cix))) continue;
  const base = m.u32(m.u32(slm + 0xdc) + 9 * cix); if (!base) continue;
  const L: string[] = [];
  for (let i = 0; i < 40; i++) {
    const s = base + 0x25 * i; if (m.u8(s) !== 0xb) continue;
    const b7 = m.s32(s + 7), f = m.s32(s + 0xf), h = m.s32(s + 0x13);
    if (b7 <= 0 && !(f >= 0 && f !== h)) continue;
    L.push(`#${i} m${m.u16(s + 1).toString(16)} b7 ${b7} bb ${m.s32(s + 0xb)} b3 ${m.s32(s + 3)} → ${f >= 0 && f !== h ? pdesc(f) : '-'}`);
  }
  O.set(cname(cix), L);
}
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const grpU = (cid: number) => { const c = g.clubs[cid]; if (!c) return '-'; if (c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
for (const c of Object.values(g.clubs).sort((a, b) => a.name.localeCompare(b.name))) {
  if (!GROUPS.has(grpU(c.id))) continue;
  const st = g.cmPlan?.[c.id];
  const L: string[] = [];
  if (st) st.s.map(fromRow).forEach((s, i) => {
    if (s.role !== 0xb) return;
    const b7 = s.b7 ?? 0;
    if (b7 <= 0 && !(s.f >= 0 && s.f !== s.s13)) return;
    const p = s.f >= 0 && s.f !== s.s13 ? g.players[s.f] : undefined;
    L.push(`#${i} m${s.mask.toString(16)} b7 ${b7} bb ${s.bb} b3 ${s.b3} → ${p ? `${p.first} ${p.last} (${p.dob.slice(0, 4)}) ${g.clubs[p.club]?.name ?? '(klubløs)'} CA ${p.ca} v ${p.value}` : '-'}`);
  });
  console.log(`\n== ${c.name} [${grpU(c.id)}]`);
  for (const x of O.get(c.name) ?? []) console.log(`  O ${x}`);
  for (const x of L) console.log(`  V ${x}`);
}
