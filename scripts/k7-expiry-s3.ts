// K7b #3, sæson 3: kohorten med udløb senest 27/6-04 (stand 29/6-03) – oraklet (y23-billederne) mod vores spil (snapshots 28/6-03 og 26/6-04,
// scripts/lib/snapshot.ts). Krydstabel: oraklets udfald × vores udfald for de samme personer + kontraktens trupstatus (+0x4f>>4), type og start.
//   WORLD=<world-dbs2.json> node scripts/measure.mjs -- npx tsx scripts/k7-expiry-s3.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { loadOrCreate } from './lib/snapshot';
import { statusCode } from '../src/game/cmPlayerData';
import type { GameState } from '../src/game/types';

const A0 = process.env.A ?? '2003-06-29', B0 = process.env.B ?? '2004-06-27';
const prevDay = (iso: string) => new Date(Date.parse(iso) - 86400000).toISOString().slice(0, 10);
interface P { key: string; club: string; eng: boolean; exp: string; st: number; type: number; start: string; age: number; ca: number; wage: number; loan: boolean }
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
function oracle(m: SparseMem) {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const date = dayIso(m.s16(0xae2c90), m.s16(0xae2c92));
  const cName = (ix: number) => (ix >= 0 && ix < nc ? str(m, C + 0x245 * ix + 4, 51) : '');
  const cEng = (ix: number) => ix >= 0 && ix < nc && str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51) === 'England';
  const contractAt = (ix: number) => (ix < 0 ? 0 : m.u32(m.u32(0xae1050)) + 80 * ix);
  const out = new Map<string, P>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const common = str(m, m.u32(st + 0xc)), f = str(m, m.u32(st + 4)), l = str(m, m.u32(st + 8));
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
    const row = m.u32(0xae2d0c) + 79 * id, k = contractAt(m.s32(row)), kl = m.s32(row + 4);
    const key = `${common || f + ' ' + l}|${dob}`;
    out.set(key, { key, club: cName(cix), eng: cEng(cix), exp: k ? dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)) : '', st: k ? m.u8(k + 0x4f) >> 4 : -1,
      type: k ? m.u8(k + 0x35) & 0x3f : -1, start: k ? dayIso(m.s16(k + 0x25), m.u16(k + 0x27)) : '', age: yrs(date, dob), ca: m.s16(pr + 5), wage: k ? m.s32(k + 0xc) : 0, loan: kl >= 0 });
  }
  return out;
}
function ours(g: GameState) {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const out = new Map<string, P>();
  for (const p of Object.values(g.players)) {
    if (p.virtual) continue;
    const c = g.clubs[p.club], key = `${p.first} ${p.last}|${p.dob}`;
    out.set(key, { key, club: c?.name ?? '', eng: !!c && c.nation === eng, exp: p.contract?.expires.slice(0, 10) ?? '', st: p.contract ? ((p.cmContract?.b4f ?? 0) >> 4) || -9 : -1,
      type: p.contract ? p.contract.cmType ?? 2 : -1, start: p.contract?.cmStart ?? p.joined ?? p.cmJoined ?? '', age: yrs(g.date, p.dob), ca: p.ca, wage: p.contract?.wage ?? 0, loan: !!p.loan });
    void statusCode;
  }
  return out;
}
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const advance = (g: GameState, until: string) => {
  let guard = 0;
  while ((g.date < until || !g.dayDone || g.pendingFixture) && guard++ < 100000) {
    if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
};
const opts = { world: w, worldFile: process.env.WORLD, club: 'Arsenal', seed: 1, mode: 'authentic' as const, managerName: 'Test Smoke', advanceTag: 'k7', advance };
const uA = ours(loadOrCreate({ ...opts, date: prevDay(A0) }));
const uB = ours(loadOrCreate({ ...opts, date: prevDay(B0) }));
const ix = readDaySnapIndex(`${homedir()}/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14`)!;
const oA = oracle(loadDaySnap(ix, ix.snaps.find((e) => e.iso === A0)!)), oB = oracle(loadDaySnap(ix, ix.snaps.find((e) => e.iso === B0)!));
const outcome = (p: P, B: Map<string, P>) => { const b = B.get(p.key); if (!b) return 'væk'; if (!b.club) return 'klubløs'; if (b.club !== p.club) return 'anden'; return b.exp > B0 ? 'forlænget' : 'uafklaret'; };
const coh = (A: Map<string, P>) => [...A.values()].filter((p) => p.eng && p.exp && p.exp <= B0 && !p.loan);
const tab = (name: string, xs: P[], B: Map<string, P>) => {
  const t = new Map<string, number>();
  for (const p of xs) { const k = `st ${p.st} type ${p.type} → ${outcome(p, B)}`; t.set(k, (t.get(k) ?? 0) + 1); }
  console.log(`\n## ${name}: ${xs.length}`);
  for (const [k, v] of [...t].sort()) console.log(`${k}: ${v}`);
  const sy = new Map<string, number>(); for (const p of xs) { const k = `start ${p.start.slice(0, 4)} → ${outcome(p, B)}`; sy.set(k, (sy.get(k) ?? 0) + 1); }
  for (const [k, v] of [...sy].sort()) console.log(`${k}: ${v}`);
  const ag = new Map<string, number>(); for (const p of xs) { const k = `alder ${p.age < 21 ? '<21' : p.age < 24 ? '21-23' : p.age < 28 ? '24-27' : p.age < 32 ? '28-31' : '32+'} → ${outcome(p, B)}`; ag.set(k, (ag.get(k) ?? 0) + 1); }
  for (const [k, v] of [...ag].sort()) console.log(`${k}: ${v}`);
};
const oc = coh(oA), uc = coh(uA);
tab('oraklet', oc, oB);
tab('vores', uc, uB);
// samme personer, samme klub og udløb på begge sider
const both = oc.filter((p) => { const q = uA.get(p.key); return q && q.club === p.club && q.exp === p.exp && !q.loan; });
const x = new Map<string, number>();
for (const p of both) { const k = `orakel ${outcome(p, oB)} × vores ${outcome(uA.get(p.key)!, uB)}`; x.set(k, (x.get(k) ?? 0) + 1); }
console.log(`\n## krydstabel (${both.length} fælles)`);
for (const [k, v] of [...x].sort()) console.log(`${k}: ${v}`);
const miss = both.filter((p) => outcome(p, oB) === 'forlænget' && outcome(uA.get(p.key)!, uB) !== 'forlænget').slice(0, 40);
console.log('\n## oraklet forlænger, vi ikke (40):');
for (const p of miss) { const q = uA.get(p.key)!, qb = uB.get(p.key); console.log(`${p.key} ${p.club} alder ${p.age.toFixed(1)} ca ${p.ca}/${q.ca} st ${p.st}/${q.st} start ${p.start}/${q.start} løn ${p.wage}/${Math.round(q.wage)} → vores: ${qb ? `${qb.club} ${qb.exp}` : 'væk'}`); }
