// K7 klubløse som kohorte (sæson 1, dag for dag mod oraklet): hvem er klubløse, hvem skriver under (hvor, hvor hurtigt), hvem forsvinder.
// Oraklet: s1-3.9.60-e1 (hver STEP. dag); vores spil: samme datoer (spillet ved D−1 færdigspillet, som k7-seasons.ts). ONLY_ORACLE=1 kun oraklet.
//   node scripts/measure.mjs -- env TMPDIR=/tmp/x WORLD=<world-dbs2.json> STEP=7 UNTIL=2002-06-30 npx tsx scripts/k7-free-cohort.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';
import type { GameState } from '../src/game/types';

const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const STEP = Number(process.env.STEP ?? 7);
const UNTIL = process.env.UNTIL ?? '2002-06-30';
const DIV_TIER: Record<string, number> = { 'English Premier Division': 1, 'English First Division': 2, 'English Second Division': 3, 'English Third Division': 4, 'English Football Conference': 5 };
interface P { key: string; club: string; cls: string; nat: string; ca: number; pa: number; age: number; exp: string; mem: boolean }
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
const clsOf = (eng: boolean, div: string, nat: string) => (eng ? (DIV_TIER[div] ? `E${DIV_TIER[div]}` : 'En') : div ? `U:${nat}` : `Uh:${nat}`);

function oracle(m: SparseMem): Map<string, P> {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const date = dayIso(m.s16(0xae2c90), m.s16(0xae2c92));
  const cName = (ix: number) => (ix >= 0 && ix < nc ? str(m, C + 0x245 * ix + 4, 51) : '');
  const cNat = (ix: number) => str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51);
  const cDiv = (ix: number) => { const dv = m.u32(C + 0x245 * ix + 0x57); return dv ? str(m, dv + 4, 51) : ''; };
  const contractAt = (ix: number) => (ix < 0 ? 0 : m.u32(m.u32(0xae1050)) + 80 * ix);
  const out = new Map<string, P>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const common = str(m, m.u32(st + 0xc)), f = str(m, m.u32(st + 4)), l = str(m, m.u32(st + 8));
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
    const k = contractAt(m.s32(m.u32(0xae2d0c) + 79 * id));
    const key = `${common || f + ' ' + l}|${dob}`;
    const nat = str(m, m.u32(st + 0x1a) + 4, 51);
    out.set(key, { key, club: cName(cix), cls: cix >= 0 ? clsOf(cNat(cix) === 'England', cDiv(cix), cNat(cix)) : '', nat, ca: m.s16(pr + 5), pa: m.s16(pr + 7), age: yrs(date, dob),
      exp: k ? dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)) : '', mem: true });
  }
  return out;
}
let g!: GameState;
function ours(): Map<string, P> {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const out = new Map<string, P>();
  for (const p of Object.values(g.players)) {
    if (p.virtual) continue;
    const c = g.clubs[p.club], key = `${p.first} ${p.last}|${p.dob}`;
    const div = c ? (g.leagues[c.league]?.hidden ? '' : g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? '') : '';
    out.set(key, { key, club: c?.name ?? '', cls: c ? clsOf(c.nation === eng, div, g.nations[c.nation]?.name ?? '') : '', nat: g.nations[p.nation]?.name ?? '', ca: p.ca, pa: p.pa,
      age: yrs(g.date, p.dob), exp: p.contract?.expires.slice(0, 10) ?? '', mem: cmInMemory(g, p) });
  }
  return out;
}
const ix1 = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const FROM = process.env.FROM ?? '2001-07-14';
const t0 = Date.parse(FROM);
const snaps = ix1.snaps.filter((e) => e.iso >= FROM && e.iso <= UNTIL && (((Date.parse(e.iso) - t0) / 86400000) % STEP === 0 || e.iso === UNTIL)).sort((a, b) => a.iso.localeCompare(b.iso));
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
type Side = { hist: Map<string, P>[]; dates: string[] };
const O: Side = { hist: [], dates: [] }, U: Side = { hist: [], dates: [] };
for (const s of snaps) {
  if (!ONLY_ORACLE) {
    const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== '2001-07-14') while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
      if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
    U.hist.push(ours()); U.dates.push(s.iso);
  }
  O.hist.push(oracle(loadDaySnap(ix1, s))); O.dates.push(s.iso);
  process.stderr.write(`${s.iso} `);
}
const bandA = (a: number) => (a < 19 ? '<19' : a < 23 ? '19-22' : a < 27 ? '23-26' : a < 31 ? '27-30' : '31+');
const bandC = (c: number) => (c < 40 ? '<40' : c < 70 ? '40-69' : c < 100 ? '70-99' : '100+');
const grp = (c: string) => (c.startsWith('U:') ? 'U' : c.startsWith('Uh:') ? 'Uh' : c);
const inc = (m: Map<string, number>, k: string, v = 1) => m.set(k, (m.get(k) ?? 0) + v);
const fmt = (m: Map<string, number>) => [...m].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${v}`).join(' ');
const json: Record<string, unknown> = {};
function report(name: string, S: Side) {
  const H = S.hist, D = S.dates;
  const lines: string[] = [];
  const pool0 = [...H[0].values()].filter((p) => p.mem && !p.club);
  const poolEnd = [...H[H.length - 1].values()].filter((p) => p.mem && !p.club);
  lines.push(`\n## ${name}`);
  const comp = (ps: P[], lab: string) => {
    const a = new Map<string, number>(), c = new Map<string, number>(), n = new Map<string, number>();
    for (const p of ps) { inc(a, bandA(p.age)); inc(c, bandC(p.ca)); inc(n, p.nat === 'England' ? 'Eng' : ['Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland'].includes(p.nat) ? 'UK' : 'udl'); }
    lines.push(`${lab}: ${ps.length} | alder ${fmt(a)} | CA ${fmt(c)} | nation ${fmt(n)}`);
  };
  comp(pool0, `klubløse ${D[0]}`);
  comp(poolEnd, `klubløse ${D[D.length - 1]}`);
  // overgange pr. interval for de klubløse (i hukommelsen)
  const sign = new Map<string, number>(), signA = new Map<string, number>(), signC = new Map<string, number>(), gone = new Map<string, number>(), arrive = new Map<string, number>();
  const signMon = new Map<string, number>(), arrMon = new Map<string, number>(), expoA = new Map<string, number>(), expoC = new Map<string, number>(), signNat = new Map<string, number>(), expoNat = new Map<string, number>();
  const waits: number[] = [];
  const goneMon = new Map<string, number>(), goneA = new Map<string, number>(), goneC = new Map<string, number>();
  const since = new Map<string, string>();
  for (const p of pool0) since.set(p.key, D[0]);
  let weeks = 0;
  for (let i = 0; i + 1 < H.length; i++) {
    const A = H[i], B = H[i + 1];
    for (const p of A.values()) {
      if (!p.mem || p.club) continue;
      weeks++;
      inc(expoA, bandA(p.age)); inc(expoC, bandC(p.ca));
      const natG = p.nat === 'England' ? 'Eng' : ['Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland'].includes(p.nat) ? 'UK' : 'udl';
      inc(expoNat, natG);
      const q = B.get(p.key);
      if (!q) { inc(gone, p.age >= 30 ? 'væk 30+' : 'væk <30'); inc(goneMon, D[i + 1].slice(0, 7)); inc(goneA, bandA(p.age)); inc(goneC, bandC(p.ca)); continue; }
      if (q.club) {
        inc(sign, grp(q.cls)); inc(signA, bandA(p.age)); inc(signC, bandC(p.ca)); inc(signMon, D[i + 1].slice(0, 7)); inc(signNat, natG);
        const s0 = since.get(p.key); if (s0) waits.push((Date.parse(D[i + 1]) - Date.parse(s0)) / 86400000);
        since.delete(p.key);
      }
    }
    for (const q of B.values()) {
      if (!q.mem || q.club) continue;
      const p = A.get(q.key);
      if (p && !p.club) continue;
      inc(arrive, !p ? 'ny (regen/ind i hukommelsen)' : `fra ${grp(p.cls)}`); inc(arrMon, D[i + 1].slice(0, 7));
      since.set(q.key, D[i + 1]);
    }
  }
  const rate = (s: Map<string, number>, e: Map<string, number>) => [...e].sort().map(([k, v]) => `${k}=${(((s.get(k) ?? 0) / v) * 100).toFixed(1)}%(${s.get(k) ?? 0}/${v})`).join(' ');
  lines.push(`klubløs-intervaller i alt ${weeks} (STEP ${STEP})`);
  lines.push(`skriver under: ${[...sign.values()].reduce((a, b) => a + b, 0)} | hvor: ${fmt(sign)}`);
  lines.push(`skriver under pr. interval efter alder: ${rate(signA, expoA)}`);
  lines.push(`skriver under pr. interval efter CA: ${rate(signC, expoC)}`);
  lines.push(`skriver under pr. interval efter nation: ${rate(signNat, expoNat)}`);
  lines.push(`skriver under pr. måned: ${fmt(signMon)}`);
  waits.sort((a, b) => a - b);
  lines.push(`ventetid (dage, klubløs → klub): n=${waits.length} median ${waits[waits.length >> 1] ?? '-'} p25 ${waits[waits.length >> 2] ?? '-'} p75 ${waits[(waits.length * 3) >> 2] ?? '-'}`);
  lines.push(`forsvinder: ${fmt(gone)} | pr. måned: ${fmt(goneMon)} | alder: ${rate(goneA, expoA)} | CA: ${rate(goneC, expoC)}`);
  lines.push(`bliver klubløse: ${fmt(arrive)} | pr. måned: ${fmt(arrMon)}`);
  // de oprindelige klubløse: hvem skrev under ved slutningen
  const end = H[H.length - 1];
  const fate = new Map<string, number>();
  for (const p of pool0) { const q = end.get(p.key); inc(fate, !q ? 'væk' : !q.club ? 'stadig klubløs' : `klub ${grp(q.cls)}`); }
  lines.push(`startpuljens skæbne ${D[D.length - 1]}: ${fmt(fate)}`);
  console.log(lines.join('\n'));
  json[name] = { dates: D, pool0: pool0.map((p) => p.key), signedEnd: pool0.filter((p) => end.get(p.key)?.club).map((p) => `${p.key}→${end.get(p.key)!.club}`) };
}
report('oraklet', O);
if (!ONLY_ORACLE) {
  report('vores', U);
  // fælles startpulje: hvem skrev under hos oraklet men ikke hos os (og omvendt)
  const oEnd = O.hist[O.hist.length - 1], uEnd = U.hist[U.hist.length - 1];
  const common = [...O.hist[0].values()].filter((p) => p.mem && !p.club && U.hist[0].get(p.key) && !U.hist[0].get(p.key)!.club);
  const m = new Map<string, number>();
  const ex: string[] = [];
  for (const p of common) {
    const o = oEnd.get(p.key), u = uEnd.get(p.key);
    const k = `O:${!o ? 'væk' : o.club ? 'klub' : 'fri'} U:${!u ? 'væk' : u.club ? 'klub' : 'fri'}`;
    inc(m, k);
    if (k === 'O:klub U:fri' && ex.length < 40) ex.push(`${p.key} ${p.nat} ${p.age.toFixed(0)}år CA${p.ca} → O ${o!.club} (${o!.cls})`);
  }
  console.log(`\n## fælles startpulje (${common.length}): ${fmt(m)}`);
  console.log(ex.join('\n'));
}
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(json));
