// K7 regens som kohorte (3 sæsoner mod oraklet): hver ny person i hukommelsen fra første billede, han ses på – dato, alder, nation, klub
// (klasse), CA/PA, kilde (vores: 0x7abac0-vejen cmMem / køen spawnRegen) – og hvor han står ved hver sæsonslut (klub / klubløs / væk).
// Oraklet: s1-3.9.60-e1 (hver 14. dag) + s1-3.9.60-y23-e14; vores spil: samme datoer (som k7-seasons.ts). ONLY_ORACLE=1 kun oraklet.
//   node scripts/measure.mjs -- env TMPDIR=/tmp/x WORLD=<world-dbs2.json> SEASONS=3 npx tsx scripts/k7-regens.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex, type DaySnapEntry, type DaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';
import type { GameState } from '../src/game/types';

const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const SEASONS = Number(process.env.SEASONS ?? 3);
const Y23 = join(homedir(), 'cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14');
const DIV_TIER: Record<string, number> = { 'English Premier Division': 1, 'English First Division': 2, 'English Second Division': 3, 'English Third Division': 4, 'English Football Conference': 5 };
interface P { key: string; id: number; club: string; cls: string; nat: string; ca: number; pa: number; age: number; src: string }
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
const clsOf = (eng: boolean, div: string) => (eng ? (DIV_TIER[div] ? `E${DIV_TIER[div]}` : 'En') : div ? 'U' : 'Uh');
const seasonOf = (iso: string) => (+iso.slice(5, 7) >= 7 ? +iso.slice(0, 4) : +iso.slice(0, 4) - 1);

function oracle(m: SparseMem): Map<string, P> {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const date = dayIso(m.s16(0xae2c90), m.s16(0xae2c92));
  const cName = (ix: number) => (ix >= 0 && ix < nc ? str(m, C + 0x245 * ix + 4, 51) : '');
  const cNat = (ix: number) => str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51);
  const cDiv = (ix: number) => { const dv = m.u32(C + 0x245 * ix + 0x57); return dv ? str(m, dv + 4, 51) : ''; };
  const out = new Map<string, P>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const common = str(m, m.u32(st + 0xc)), f = str(m, m.u32(st + 4)), l = str(m, m.u32(st + 8));
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
    const key = `${common || f + ' ' + l}|${dob}`;
    out.set(key, { key, id, club: cName(cix), cls: cix >= 0 ? clsOf(cNat(cix) === 'England', cDiv(cix)) : '', nat: str(m, m.u32(st + 0x1a) + 4, 51),
      ca: m.s16(pr + 5), pa: m.s16(pr + 7), age: yrs(date, dob), src: '' });
  }
  return out;
}
let g!: GameState;
function ours(): Map<string, P> {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const out = new Map<string, P>();
  for (const p of Object.values(g.players)) {
    if (p.virtual || !cmInMemory(g, p)) continue;
    const c = g.clubs[p.club], key = `${p.first} ${p.last}|${p.dob}`;
    const div = c ? (g.leagues[c.league]?.hidden ? '' : g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? '') : '';
    out.set(key, { key, id: p.id, club: c?.name ?? '', cls: c ? clsOf(c.nation === eng, div) : '', nat: g.nations[p.nation]?.name ?? '', ca: p.ca, pa: p.pa,
      age: yrs(g.date, p.dob), src: !p.regen ? 'db' : p.cmMem === 1 ? 'cm' : 'kø' });
  }
  return out;
}
interface Snap { iso: string; load: () => SparseMem }
const ix1 = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const ix2 = readDaySnapIndex(Y23);
const t0d = Date.parse('2001-07-14');
const pick = (ix: DaySnapIndex, keep: (e: DaySnapEntry) => boolean): Snap[] => ix.snaps.filter(keep).map((e) => ({ iso: e.iso, load: () => loadDaySnap(ix, e) }));
const snaps: Snap[] = [
  ...pick(ix1, (e) => ((Date.parse(e.iso) - t0d) / 86400000) % 14 === 0 || e.iso === '2002-06-30'),
  ...(ix2 ? pick(ix2, () => true) : []),
].filter((s) => seasonOf(s.iso) < 2001 + SEASONS).sort((a, b) => a.iso.localeCompare(b.iso));
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
// kohorten: første observation + status pr. billede
interface Row { first: P; date: string; prevAtId?: string; seen: Map<string, P | null> }
type Side = { rows: Map<string, Row>; dates: string[]; base: Set<string>; prev?: Map<string, P>; idKey: Map<number, string> };
const mk = (): Side => ({ rows: new Map(), dates: [], base: new Set(), idKey: new Map() });
const O = mk(), U = mk();
function step(S: Side, iso: string, cur: Map<string, P>) {
  if (!S.dates.length) for (const k of cur.keys()) S.base.add(k);
  S.dates.push(iso);
  for (const p of cur.values()) {
    if (S.base.has(p.key)) continue;
    let r = S.rows.get(p.key);
    if (!r) { r = { first: p, date: iso, prevAtId: S.idKey.get(p.id), seen: new Map() }; S.rows.set(p.key, r); }
  }
  for (const r of S.rows.values()) r.seen.set(iso, cur.get(r.first.key) ?? null);
  for (const p of cur.values()) S.idKey.set(p.id, p.key);
}
for (const s of snaps) {
  if (!ONLY_ORACLE) {
    const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== '2001-07-14') while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
      if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
    step(U, s.iso, ours());
  }
  step(O, s.iso, oracle(s.load()));
  process.stderr.write(`${s.iso} `);
}
const inc = (m: Map<string, number>, k: string, v = 1) => m.set(k, (m.get(k) ?? 0) + v);
const fmt = (m: Map<string, number>) => [...m].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${v}`).join(' ');
const bandA = (a: number) => (a < 17 ? '<17' : a < 19 ? '17-18' : a < 21 ? '19-20' : a < 24 ? '21-23' : '24+');
const natG = (n: string) => (n === 'England' ? 'Eng' : ['Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland'].includes(n) ? 'UK' : 'udl');
const st = (p: P | null | undefined) => (p === undefined ? '-' : !p ? 'væk' : !p.club ? 'fri' : p.cls);
const json: Record<string, unknown> = {};
function report(name: string, S: Side) {
  const lines = [`\n## ${name}`];
  const ends = [...new Set(S.dates.map(seasonOf))].map((y) => S.dates.filter((d) => seasonOf(d) === y).pop()!);
  for (const y of [...new Set(S.dates.map(seasonOf))]) {
    const rows = [...S.rows.values()].filter((r) => seasonOf(r.date) === y && r.date !== S.dates[0]);
    const end = ends.find((d) => seasonOf(d) === y)!;
    const f1 = new Map<string, number>(), fA = new Map<string, number>(), fN = new Map<string, number>(), e1 = new Map<string, number>(), src = new Map<string, number>(), mon = new Map<string, number>();
    const freeByA = new Map<string, number>(), allByA = new Map<string, number>(), freeByN = new Map<string, number>(), allByN = new Map<string, number>(), trans = new Map<string, number>();
    const slot = new Map<string, number>();
    for (const r of rows) {
      const p = r.first;
      inc(f1, st(p)); inc(fA, bandA(p.age)); inc(fN, natG(p.nat)); inc(src, p.src || '?'); inc(mon, r.date.slice(0, 7));
      inc(allByA, bandA(p.age)); inc(allByN, natG(p.nat)); if (!p.club) { inc(freeByA, bandA(p.age)); inc(freeByN, natG(p.nat)); }
      const e = r.seen.get(end); inc(e1, st(e));
      inc(trans, `${p.club ? 'klub' : 'fri'}→${st(e) === 'fri' ? 'fri' : st(e) === 'væk' ? 'væk' : 'klub'}`);
      inc(slot, r.prevAtId ? 'post genbrugt' : 'ny post');
    }
    const share = (a: Map<string, number>, b: Map<string, number>) => [...b].sort().map(([k, v]) => `${k}=${(a.get(k) ?? 0)}/${v}`).join(' ');
    lines.push(`### sæson ${y}/${(y + 1) % 100} (nye fra ${rows.length ? rows.map((r) => r.date).sort()[0] : '-'}; slut ${end}): ${rows.length}`);
    lines.push(`  første billede: ${fmt(f1)}`);
    lines.push(`  ved sæsonslut: ${fmt(e1)} | overgang ${fmt(trans)}`);
    lines.push(`  klubløse ved første billede efter alder: ${share(freeByA, allByA)}`);
    lines.push(`  klubløse ved første billede efter nation: ${share(freeByN, allByN)}`);
    lines.push(`  kilde: ${fmt(src)} | post: ${fmt(slot)} | måned: ${fmt(mon)}`);
    const mean = (xs: number[]) => (xs.length ? (xs.reduce((t, x) => t + x, 0) / xs.length).toFixed(1) : '-');
    const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : '-'; };
    for (const [lab, f] of [['klub', (r: Row) => !!r.first.club], ['fri', (r: Row) => !r.first.club]] as const) {
      const rs = rows.filter(f);
      lines.push(`  ${lab} ved første billede: n=${rs.length} alder ${mean(rs.map((r) => r.first.age))} CA ${mean(rs.map((r) => r.first.ca))} PA ${mean(rs.map((r) => r.first.pa))} (median ${med(rs.map((r) => r.first.pa))})`);
    }
  }
  console.log(lines.join('\n'));
  json[name] = [...S.rows.values()].map((r) => ({ ...r.first, date: r.date, prevAtId: r.prevAtId, seen: Object.fromEntries([...r.seen].filter(([d]) => ends.includes(d)).map(([d, p]) => [d, p && p.club ? `${st(p)}:${p.club}` : st(p)])) }));
}
report('oraklet', O);
if (!ONLY_ORACLE) report('vores', U);
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(json));
