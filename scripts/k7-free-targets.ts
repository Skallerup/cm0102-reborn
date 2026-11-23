// K7: klubløse som MÅL i trupplanerne (0x83cb40-posten, Shortlist_Manager [[0xde1f54]+0x856] +0xdc, spillerpladser +0xf ≥ 0) dag for dag mod
// oraklet (s1-3.9.60-e1, daglige billeder): nye (klub, klubløs)-par pr. måned og klubklasse, med budmærke (+0x17 ≥ 0), og om de klubløse,
// der skriver under, var mål for klubben dagene før.
//   ONLY_ORACLE=1 npx tsx scripts/k7-free-targets.ts
//   node scripts/measure.mjs -- env TMPDIR=/tmp/x WORLD=<world-dbs2.json> UNTIL=2001-11-30 npx tsx scripts/k7-free-targets.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract } from '../src/game/cmMem';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { fromRow } from '../src/game/cmSquadPlanGame';
import { cmInMemory } from '../src/game/cmRetire';
import type { GameState } from '../src/game/types';
import { CM_AIAI } from '../src/game/transfers';

const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const FROM = process.env.FROM ?? '2001-07-14', UNTIL = process.env.UNTIL ?? '2001-11-30';
const DAYSNAP = process.env.DAYSNAP ?? DEFAULT_DAYSNAP;
/** udløber senest ved sæsonens slutning (30/6) */
const EXPBY = (iso: string) => `${Number(iso.slice(0, 4)) + (iso.slice(5, 7) >= '07' ? 1 : 0)}-06-30`;
const TIER: Record<string, string> = { 'English Premier Division': 'E1', 'English First Division': 'E2', 'English Second Division': 'E3', 'English Third Division': 'E4' };
interface Tgt { club: string; cls: string; p: string; bid: boolean; b7: number }
interface Fa { key: string; ca: number; age: number; nat: string; rep: number }
interface Day { iso: string; ex: Tgt[]; tg: Tgt[]; free: Map<string, Fa>; clubOf: Map<string, string>; clsOf: Map<string, string> }
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);

function oracle(m: SparseMem, iso: string): Day {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(0xae23bc), n = m.s32(0xae2364);
  const slm = m.u32(m.u32(0xde1f54) + 0x856);
  const key = new Map<number, string>(), free = new Map<string, Fa>(), clubOf = new Map<string, string>(), clsOf = new Map<string, string>(), expOf = new Map<string, string>();
  const cName = (ix: number) => str(m, C + 0x245 * ix + 4);
  const cls = (ix: number) => { const a = C + 0x245 * ix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'U'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'En'; };
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const common = str(m, m.u32(st + 0xc), 60), f = str(m, m.u32(st + 4), 60), l = str(m, m.u32(st + 8), 60);
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const k = `${common || f + ' ' + l}|${dob}`;
    key.set(id, k);
    const kc = getContract(m, st);
    if (!kc) free.set(k, { key: k, ca: m.s16(pr + 5), age: yrs(iso, dob), nat: str(m, m.u32(st + 0x1a) + 4), rep: m.s16(pr + 0xb) });
    else { const c = m.s32(kc + 4); if (c >= 0 && c < nc) { clubOf.set(k, cName(c)); clsOf.set(k, cls(c)); } expOf.set(k, dayIso(m.s16(kc + 0x2d), m.u16(kc + 0x2f))); }
  }
  const tg: Tgt[] = [], ex: Tgt[] = [];
  for (let ix = 0; ix < nc; ix++) {
    const c = cls(ix); if (c === 'U') continue;
    const base = m.u32(m.u32(slm + 0xdc) + 9 * ix);
    if (!base) continue;
    for (let i = 0; i < 40; i++) {
      const s = base + 0x25 * i;
      if (m.u8(s) !== 0xb) continue;
      const t = m.s32(s + 0xf);
      if (t < 0) continue;
      const k = key.get(t);
      if (k && free.has(k)) tg.push({ club: cName(ix), cls: c, p: k, bid: m.s32(s + 0x17) >= 0, b7: m.s32(s + 7) });
      else if (k && clubOf.get(k) !== cName(ix) && (expOf.get(k) ?? '9') <= EXPBY(iso)) ex.push({ club: cName(ix), cls: c, p: k, bid: m.s32(s + 0x17) >= 0, b7: m.s32(s + 7) });
    }
  }
  return { iso, ex, tg, free, clubOf, clsOf };
}
let g!: GameState;
function ours(): Day {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const free = new Map<string, Fa>(), clubOf = new Map<string, string>(), clsOf = new Map<string, string>(), key = new Map<number, string>();
  const cls = (cid: number) => { const c = g.clubs[cid]; if (!c || c.nation !== eng) return 'U'; const lg = g.leagues[c.league]; const nm = lg?.hidden ? '' : g.comps[c.league]?.name ?? lg?.name ?? ''; return TIER[nm] ?? 'En'; };
  for (const p of Object.values(g.players)) {
    if (p.virtual || !cmInMemory(g, p)) continue;
    const k = `${p.first} ${p.last}|${p.dob}`;
    key.set(p.id, k);
    if (!p.club) free.set(k, { key: k, ca: p.ca, age: yrs(g.date, p.dob), nat: g.nations[p.nation]?.name ?? '', rep: (p as { cmRep?: number }).cmRep ?? 0 });
    else { clubOf.set(k, g.clubs[p.club]?.name ?? ''); clsOf.set(k, cls(p.club)); }
  }
  const tg: Tgt[] = [], ex: Tgt[] = [];
  for (const c of Object.values(g.clubs)) {
    const cl = cls(c.id); if (cl === 'U') continue;
    const st = g.cmPlan?.[c.id]; if (!st) continue;
    for (const s of st.s.map(fromRow)) {
      if (s.role !== 0xb || s.f < 0) continue;
      const k = key.get(s.f);
      if (k && free.has(k)) tg.push({ club: c.name, cls: cl, p: k, bid: s.s17 >= 0, b7: s.b7 ?? 0 });
      else if (k && g.players[s.f]?.club && g.players[s.f].club !== c.id && (g.players[s.f].contract?.expires.slice(0, 10) ?? '9') <= EXPBY(g.date)) ex.push({ club: c.name, cls: cl, p: k, bid: s.s17 >= 0, b7: s.b7 ?? 0 });
    }
  }
  return { iso: g.date, ex, tg, free, clubOf, clsOf };
}

const ix = readDaySnapIndex(DAYSNAP)!;
const snaps = ix.snaps.filter((e) => e.iso >= FROM && e.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso));
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
const O: Day[] = [], U: Day[] = [];
for (const s of snaps) {
  O.push(oracle(loadDaySnap(ix, s), s.iso));
  if (!ONLY_ORACLE) {
    const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== FROM) while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
    U.push(ours());
  }
  process.stderr.write(`${s.iso} `);
}
const inc = (m: Map<string, number>, k: string, v = 1) => m.set(k, (m.get(k) ?? 0) + v);
const fmt = (m: Map<string, number>) => [...m].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${v}`).join(' ');
const bandC = (c: number) => (c < 40 ? '<40' : c < 70 ? '40-69' : c < 100 ? '70-99' : '100+');
const bandA = (a: number) => (a < 19 ? '<19' : a < 23 ? '19-22' : a < 27 ? '23-26' : a < 31 ? '27-30' : '31+');
const out: Record<string, unknown> = {};
function report(name: string, D: Day[]) {
  const L: string[] = [`\n## ${name} (${D.length} dage ${D[0]?.iso}–${D[D.length - 1]?.iso})`];
  const seen = new Map<string, string>();            // club|p → første dag
  const newBy = new Map<string, number>(), newMon = new Map<string, number>(), bidBy = new Map<string, number>(), caBy = new Map<string, number>(), ageBy = new Map<string, number>();
  const bidSeen = new Set<string>();
  const sign = new Map<string, number>(), signTgt = new Map<string, number>(), signMon = new Map<string, number>();
  const examples: string[] = [];
  const signClub = new Map<string, number>(), tgtClub = new Map<string, number>();
  let poolDays = 0;
  for (let i = 0; i < D.length; i++) {
    const d = D[i];
    poolDays += d.free.size;
    for (const t of d.tg) {
      const k = `${t.club}|${t.p}`;
      if (!seen.has(k)) { seen.set(k, d.iso); inc(newBy, t.cls); inc(tgtClub, `${t.club}(${t.cls})`); inc(newMon, d.iso.slice(0, 7)); const f = d.free.get(t.p)!; inc(caBy, bandC(f.ca)); inc(ageBy, bandA(f.age)); }
      if (t.bid && !bidSeen.has(k)) { bidSeen.add(k); inc(bidBy, t.cls); }
    }
    if (i === 0) continue;
    const prev = D[i - 1];
    for (const [p] of prev.free) {
      const club = d.clubOf.get(p); if (!club) continue;
      const cl = d.clsOf.get(p)!;
      inc(sign, cl); inc(signMon, d.iso.slice(0, 7)); inc(signClub, `${club}(${cl})`);
      if (seen.has(`${club}|${p}`)) inc(signTgt, cl);
      else if (examples.length < 15) examples.push(`  ${d.iso} ${p} → ${club} (${cl}) uden at have været mål`);
    }
  }
  { const sx = new Map<string, string>(), bx = new Set<string>(), mx = new Map<string, number>(), cx = new Map<string, number>();
    for (const d of D) for (const t of d.ex) { const k = `${t.club}|${t.p}`; if (!sx.has(k)) { sx.set(k, d.iso); inc(mx, process.env.BYDAY ? d.iso : d.iso.slice(0, 7)); inc(cx, t.cls); } if (t.bid) bx.add(k); }
    L.push(`udløbende (≤ 30/6) i anden klub som mål: ${sx.size} | klasse ${fmt(cx)} | pr. måned ${fmt(mx)} | med budmærke ${bx.size}`); }
  L.push(`klubløse i hukommelsen gns. pr. dag: ${(poolDays / D.length).toFixed(0)}`);
  L.push(`nye (klub, klubløs)-mål: ${seen.size} | klasse ${fmt(newBy)} | pr. måned ${fmt(newMon)}`);
  L.push(`  målenes CA ${fmt(caBy)} | alder ${fmt(ageBy)}`);
  L.push(`  med budmærke (+0x17): ${bidSeen.size} | ${fmt(bidBy)}`);
  L.push(`klubløse, der skriver under: ${[...sign.values()].reduce((a, b) => a + b, 0)} | ${fmt(sign)} | pr. måned ${fmt(signMon)}`);
  L.push(`  heraf mål for klubben før: ${fmt(signTgt)}`);
  const top = (mm: Map<string, number>) => [...mm].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => `${k}=${v}`).join(' ');
  L.push(`  underskrifter pr. klub: ${top(signClub)}`);
  L.push(`  mål pr. klub: ${top(tgtClub)}`);
  L.push(...examples);
  console.log(L.join('\n'));
  out[name] = { targets: [...seen].map(([k, v]) => `${v} ${k}`) };
}
report('oraklet', O);
if (!ONLY_ORACLE) { report('vores', U); console.log('CM_AIAI', JSON.stringify(CM_AIAI)); }
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(out));
