// Kohorte (K7b #3): engelske spillere, hvis kontrakt udløber senest 30/6-02 (stand 14/7-01) – hvad sker der med dem, og hvornår.
// Oraklet: billeder fra s1-3.9.60-e1 (hver STEP. dag) + 14/7-02 fra y23; vores spil: samme datoer. ONLY_ORACLE=1 kun oraklet. WORLD=world (CM_DBSIZE=2).
//   WORLD=<scratch>/world-dbs2.json node scripts/measure.mjs -- npx tsx scripts/k7-expiry-cohort.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import type { GameState } from '../src/game/types';

const E = `${homedir()}/cm0102-engine`;
const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const STEP = Number(process.env.STEP ?? 7);
interface P { key: string; club: string; eng: boolean; exp: string; ca: number; age: number }
interface T { key: string; date: string; to: string; from: string; fee: number; art: number }
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
function oracle(m: SparseMem, T: Map<string, T>) {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const date = dayIso(m.s16(0xae2c90), m.s16(0xae2c92));
  const cName = (ix: number) => (ix >= 0 && ix < nc ? str(m, C + 0x245 * ix + 4, 51) : '');
  const cEng = (ix: number) => ix >= 0 && ix < nc && str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51) === 'England';
  const contractAt = (ix: number) => (ix < 0 ? 0 : m.u32(m.u32(0xae1050)) + 80 * ix);
  const out = new Map<string, P>(), byId = new Map<number, string>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const common = str(m, m.u32(st + 0xc)), f = str(m, m.u32(st + 4)), l = str(m, m.u32(st + 8));
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
    const row = m.u32(0xae2d0c) + 79 * id, k = contractAt(m.s32(row));
    const key = `${common || f + ' ' + l}|${dob}`;
    byId.set(id, key);
    out.set(key, { key, club: cName(cix), eng: cEng(cix), exp: k ? dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)) : '', ca: m.s16(pr + 5), age: yrs(date, dob) });
  }
  const tmA = m.u32(0xde1f54), arr = m.u32(tmA + 0x862), nT = m.s32(tmA + 0x86a);
  for (let i = 0; i < nT; i++) {
    const r = arr + 37 * i, d = dayIso(m.s16(r + 0x1d), m.s16(r + 0x1f)), art = m.u8(r + 0x1c);
    if (!d) continue;
    const to = m.s32(r + 0x10), from = m.s32(r + 0x14), key = byId.get(m.s32(r)) ?? String(m.s32(r));
    const tk = `${key}|${d}|${to}|${art}`;
    if (!T.has(tk)) T.set(tk, { key, date: d, to: cName(to), from: cName(from), fee: m.s32(r + 0x18), art });
  }
  return { date, ps: out };
}
let g!: GameState;
function ours(T: Map<string, T>) {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const out = new Map<string, P>();
  for (const p of Object.values(g.players)) {
    if (p.virtual) continue;
    const c = g.clubs[p.club], key = `${p.first} ${p.last}|${p.dob}`;
    out.set(key, { key, club: c?.name ?? '', eng: !!c && c.nation === eng, exp: p.contract?.expires.slice(0, 10) ?? '', ca: p.ca, age: yrs(g.date, p.dob) });
    for (const mv of p.moves ?? []) {
      const tk = `${key}|${mv.date}|${mv.to}`;
      if (!T.has(tk)) T.set(tk, { key, date: mv.date, to: g.clubs[mv.to]?.name ?? '', from: g.clubs[mv.from]?.name ?? '', fee: mv.fee, art: mv.loan ? 2 : !mv.from || !mv.to ? 3 : mv.fee ? 0 : 9 });
    }
  }
  return out;
}
const ix1 = readDaySnapIndex(DEFAULT_DAYSNAP)!, ix2 = readDaySnapIndex(`${E}/oracle/daysnap/s1-3.9.60-y23-e14`)!;
const t0 = Date.parse('2001-07-14');
const snaps = [...ix1.snaps.filter((e) => ((Date.parse(e.iso) - t0) / 86400000) % STEP === 0 || e.iso === '2002-06-30').map((e) => ({ iso: e.iso, load: () => loadDaySnap(ix1, e) })),
  ...ix2.snaps.filter((e) => e.iso === '2002-07-14').map((e) => ({ iso: e.iso, load: () => loadDaySnap(ix2, e) }))].sort((a, b) => a.iso.localeCompare(b.iso));
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
type Side = { hist: Map<string, P>[]; dates: string[]; T: Map<string, T> };
const O: Side = { hist: [], dates: [], T: new Map() }, U: Side = { hist: [], dates: [], T: new Map() };
for (const s of snaps) {
  if (!ONLY_ORACLE) {
    const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== '2001-07-14') while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
      if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
    U.hist.push(ours(U.T)); U.dates.push(s.iso);
  }
  O.hist.push(oracle(s.load(), O.T).ps); O.dates.push(s.iso);
  process.stderr.write(`${s.iso} `);
}
const mon = (iso: string) => iso.slice(0, 7);
function report(name: string, S: Side) {
  const H = S.hist, D = S.dates, i30 = D.indexOf('2002-06-30'), iJ = D.indexOf('2002-07-14');
  const coh = [...H[0].values()].filter((p) => p.eng && p.exp && p.exp <= '2002-06-30');
  const cnt = new Map<string, number>(); const inc = (k: string) => cnt.set(k, (cnt.get(k) ?? 0) + 1);
  const renewM = new Map<string, number>(), moveM = new Map<string, number>(), expM = new Map<string, number>();
  for (const p of coh) {
    expM.set(mon(p.exp), (expM.get(mon(p.exp)) ?? 0) + 1);
    let renewed = '', moved = '';
    for (let i = 1; i < H.length; i++) {
      const q = H[i].get(p.key);
      if (!q) continue;
      if (!moved && q.club !== p.club) { moved = D[i]; break; }
      if (!renewed && q.club === p.club && q.exp > p.exp) renewed = D[i];
    }
    const e30 = H[i30].get(p.key), eJ = iJ >= 0 ? H[iJ].get(p.key) : undefined;
    let cat: string;
    if (moved && moved <= '2002-06-30') {
      const tr = [...S.T.values()].filter((t) => t.key === p.key && t.date >= '2001-07-14' && t.date <= moved).sort((a, b) => a.date.localeCompare(b.date))[0];
      const q = H[D.indexOf(moved)].get(p.key)!;
      const art = tr ? `art ${tr.art}${tr.fee ? ' m. sum' : ''}` : (!q.club ? 'klubløs (ingen handel)' : 'ingen handel');
      cat = `flyttet før 30/6 (${art})${renewed ? ' efter forlængelse' : ''}`;
      moveM.set(mon(moved), (moveM.get(mon(moved)) ?? 0) + 1);
    } else if (renewed) { cat = 'forlænget'; renewM.set(mon(renewed), (renewM.get(mon(renewed)) ?? 0) + 1); }
    else if (!e30) cat = 'væk før 30/6';
    else cat = 'uafklaret 30/6';
    inc(cat);
    if (cat === 'uafklaret 30/6') inc(`  → 14/7-02: ${!eJ ? 'væk' : !eJ.club ? 'klubløs' : eJ.club === p.club ? (eJ.exp > '2002-06-30' ? 'forlænget i klubben' : 'samme klub, udløbet') : 'anden klub'}`);
  }
  console.log(`\n## ${name}: kohorte ${coh.length}`);
  for (const [k, v] of [...cnt].sort()) console.log(`${k}: ${v}`);
  console.log('udløbsmåned:', JSON.stringify([...expM].sort()));
  console.log('forlænget pr. måned:', JSON.stringify([...renewM].sort()));
  console.log('flyttet pr. måned:', JSON.stringify([...moveM].sort()));
  const kset = new Set(coh.map((p) => p.key));
  const tr = [...S.T.values()].filter((t) => kset.has(t.key) && t.date >= '2001-07-14' && t.date <= '2002-07-14');
  const am = new Map<string, number>(); for (const t of tr) { const k = `art ${t.art}${t.fee ? '+' : ''} ${mon(t.date)}`; am.set(k, (am.get(k) ?? 0) + 1); }
  console.log('kohortens handler (art, måned):', JSON.stringify([...am].sort()));
  const all = [...S.T.values()].filter((t) => t.date >= '2001-07-14' && t.date <= '2002-07-14');
  const al = new Map<string, number>(); for (const t of all) { const k = `art ${t.art}${t.fee ? '+' : ''}`; al.set(k, (al.get(k) ?? 0) + 1); }
  console.log('alle handler (art):', JSON.stringify([...al].sort()));
}
report('oraklet', O);
if (!ONLY_ORACLE) report('vores', U);
