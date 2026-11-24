// Personligheden ved spilstarten (sub_535a80 0x535ea4 – cmStaffInit.ts personality_535ea4): oraklets dagsbillede 14/7-01 (staff +0x57..+0x5d)
// mod vores nye spil (frø 1, Arsenal, world bygget med CM_DBSIZE=2), snit pr. egenskab for spillere med/uden databasens CA (entydigt navn + år).
//   TMPDIR=/private/tmp/x WORLD=<world-dbs2.json> npx tsx scripts/cm-pers-check.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { createGame } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { ATTRS } from '../src/game/attributes';
import { cmInMemory } from '../src/game/cmRetire';
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps.find((s) => s.iso === '2001-07-14')!);
const str = (a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const S = m.u32(0xae23bc), n = m.s32(0xae2364);
const s8 = (v: number) => (v << 24) >> 24;
const K = ['amb', 'det', 'loy', 'pres', 'prof', 'sport', 'temp'];
const O = new Map<string, number[]>(), oc = new Map<string, number>();
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id, pr = m.u32(st + 0x61);
  if (!pr || m.u8(st + 0x3d) === 16) continue;
  const k = `${str(m.u32(st + 4))} ${str(m.u32(st + 8))}|${(m.u16(st + 0x12) > 1850 && m.u16(st + 0x12) < 2100) ? m.u16(st + 0x12) : m.s16(st + 0x18)}`;
  oc.set(k, (oc.get(k) ?? 0) + 1);
  O.set(k, [0x57, 0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d].map((o) => s8(m.u8(st + o))));
}
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8'));
const eng = w.nations.findIndex((x: any) => x.name === 'England');
const user = w.clubs.find((c: any) => c[1] === 'Arsenal')![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const uc = new Map<string, number>();
const key = (p: any) => `${p.first} ${p.last}|${p.dob.slice(0, 4)}`;
for (const p of Object.values(g.players)) uc.set(key(p), (uc.get(key(p)) ?? 0) + 1);
const acc: Record<string, { n: number; u: number[]; o: number[]; eq: number[] }> = {};
for (const p of Object.values(g.players)) {
  if (p.virtual || !cmInMemory(g, p)) continue;
  const k = key(p); if (uc.get(k) !== 1 || oc.get(k) !== 1) continue;
  const o = O.get(k); if (!o) continue;
  const r = w.ratings[p.id];
  const grp = `${r?.caRaw !== undefined ? 'CA mangler' : 'CA i db'} ${new Date(g.date).getUTCFullYear() - +p.dob.slice(0, 4) < 21 ? '<21' : '21+'}`;
  const a = (acc[grp] ??= { n: 0, u: K.map(() => 0), o: K.map(() => 0), eq: K.map(() => 0) }); a.n++;
  K.forEach((kk, i) => { const v = Math.round(p.attrs[ATTRS.indexOf(['ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'][i] as never)] ?? 0); a.u[i] += v; a.o[i] += o[i]; if (v === o[i]) a.eq[i]++; });
}
for (const nm of ['Rio Ferdinand|1978', 'Thierry Henry|1977', 'Frank Lampard|1978', 'David Beckham|1975']) {
  const p = Object.values(g.players).find((x) => key(x) === nm);
  console.log(nm, 'o', O.get(nm)?.join(','), 'u', p ? ['ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'].map((k) => p.attrs[ATTRS.indexOf(k as never)]).join(',') : '-', 'world', p ? w.ratings[p.id]?.attrs.slice(41).join(',') : '');
}
for (const [k, a] of Object.entries(acc)) console.log(k, 'n', a.n, K.map((kk, i) => `${kk} ${(a.u[i] / a.n).toFixed(2)}/${(a.o[i] / a.n).toFixed(2)} (= ${(a.eq[i] / a.n).toFixed(2)})`).join('  '));
