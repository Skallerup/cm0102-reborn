// K7 #7: klubbernes omdømme (club +0x80) dag for dag i sæson 1 mod oraklet (daglige billeder ~/cm0102-engine/oracle/daysnap/s1-3.9.60-e1).
// Pr. dag og engelsk ligaklub: Δomdømme, fordelt på «ligakampdag» (kampe +1 i tabellen; resultatet S/U/N af målene) og «andet». Vores side
// desuden pr. skriver (stakken ved hver skrivning i g.cmClubRep: kampen 0x6d3de0, klubskiftet 0x8c9720, Staff_Records …).
//   WORLD=<world CM_DBSIZE=2> [EVERY=1] [UNTIL=2002-06-30] [ONLY_ORACLE=1] npx tsx scripts/k7-clubrep.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import type { GameState } from '../src/game/types';

const UNTIL = process.env.UNTIL ?? '2002-06-30';
const EVERY = Number(process.env.EVERY ?? 1);
const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const DIVS = ['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division'];
interface Row { rep: number; div: string; p: number; gf: number; ga: number }
type W = Map<string, Row>;

const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
function oracle(m: SparseMem): W {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const out: W = new Map();
  for (let ix = 0; ix < nc; ix++) {
    const adr = C + 0x245 * ix;
    if (str(m, m.u32(adr + 0x53) + 4, 51) !== 'England') continue;
    const dv = m.u32(adr + 0x57), div = dv ? str(m, dv + 4, 51) : '';
    if (!DIVS.includes(div)) continue;
    const r: Row = { rep: m.s16(adr + 0x80), div, p: 0, gf: 0, ga: 0 };
    const cp = m.u32(m.u32(0xadadfc) + 4 * m.s32(dv)), sp = cp ? m.u32(cp + 8) : 0;
    if (sp) {
      const rows = m.u32(sp + 0xc), nr = m.s32(sp + 0x14);
      for (let i = 0; i < nr && i < 200; i++) if (m.s32(rows + 0x76 * i) === m.s32(adr)) { const q = rows + 0x76 * i; r.p = m.u8(q + 4); r.gf = m.u8(q + 0x69); r.ga = m.u8(q + 0x6a); break; }
    }
    out.set(str(m, adr + 4, 51), r);
  }
  return out;
}
let g!: GameState;
function ours(): W {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const out: W = new Map();
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league' || comp.nation !== eng || !DIVS.includes(comp.name)) continue;
    for (const t of comp.table) {
      const c = g.clubs[t.club]; if (!c) continue;
      out.set(c.name, { rep: g.cmClubRep?.[c.id] ?? 0, div: comp.name, p: t.p, gf: t.gf, ga: t.ga });
    }
  }
  return out;
}

// ------------------------------------------------------------------ vores skrivere (stakken)
const dayIx: { d: string; m: Map<number, any> } = { d: '', m: new Map() };
const byComp = new Map<string, [number, number, number, number]>();
const byMon = new Map<string, [number, number]>();
const oxDay = new Map<string, number>();
const oxChk = { n: 0, exp: 0, act: 0, lines: [] as string[] };
const oxMon = new Map<string, [number, number]>();
let oPrevK: Map<number, [number, number]> | undefined;
/** oraklet: klubskifter (kontraktens klub k+4) dag til dag → forventet +0x80-ændring trunc(+0xd/100) for ligaklubberne (W) */
function oracleXfer(m: SparseMem, iso: string, w: W) {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4);
  const contractAt = (ix: number) => (ix < 0 ? 0 : m.u32(m.u32(0xae1050)) + 80 * ix);
  const cur = new Map<number, [number, number]>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61); if (!pr) continue;
    const k = contractAt(m.s32(m.u32(0xae2d0c) + 79 * id));
    cur.set(id, [k ? m.s32(k + 4) : -1, m.s16(pr + 0xd)]);
  }
  oxDay.clear();
  if (oPrevK) {
    const nm = (ix: number) => { if (ix < 0) return ''; let s2 = ''; for (let i = 0; i < 51; i++) { const c = m.u8(C + 0x245 * ix + 4 + i); if (!c) break; s2 += String.fromCharCode(c); } return s2.trim(); };
    const mk = iso.slice(0, 7);
    for (const [id, [cl, rep]] of cur) {
      const q = oPrevK.get(id); if (!q || q[0] === cl) continue;
      const v = Math.trunc(q[1] / 100);
      const addD = (c2: string, d: number) => oxDay.set(c2, (oxDay.get(c2) ?? 0) + d);
      if (cl >= 0 && w.has(nm(cl))) addD(nm(cl), v);
      if (q[0] >= 0 && w.has(nm(q[0]))) addD(nm(q[0]), -v);
      const add = (k2: string, d: number) => { const e = oxMon.get(k2) ?? [0, 0]; e[0] += d; e[1]++; oxMon.set(k2, e); };
      if (cl >= 0 && w.has(nm(cl))) add(`in ${q[0] < 0 ? 'fri' : w.has(nm(q[0])) ? 'liga' : 'ude'} ${mk}`, v);
      if (q[0] >= 0 && w.has(nm(q[0]))) add(`ud ${cl < 0 ? 'fri' : w.has(nm(cl)) ? 'liga' : 'ude'} ${mk}`, -v);
    }
  }
  oPrevK = cur;
}
const bySrc = new Map<string, { n: number; sum: number; up: number; down: number }>();
const SRC = ['cmClubRepWeekly', 'recCupFinalist', 'recCupThird', 'cmApplyPost', 'cmStaffStateMove', 'recChampions', 'recPromotion', 'recRelegation', 'recCupWinners', 'repTowards', 'cmFinance', 'newSeason', 'promote'];
function install() {
  const reps = g.cmClubRep as Record<number, number> & { __p?: boolean };
  if (!reps || reps.__p) return;
  const lg = new Set(ours().keys());
  const engIds = new Set(Object.values(g.clubs).filter((c) => lg.has(c.name)).map((c) => c.id));
  g.cmClubRep = new Proxy(reps, {
    get: (t, k) => (k === '__p' ? true : (t as any)[k]),
    set: (t, k, v) => {
      const id = Number(k), old = (t as any)[k] ?? 0;
      if (engIds.has(id) && v !== old) {
        const st = new Error().stack ?? '';
        const src = SRC.find((s) => st.includes(s)) ?? (st.split('\n')[2] ?? '?').trim().split(' ')[1];
        const e = bySrc.get(src) ?? { n: 0, sum: 0, up: 0, down: 0 }; bySrc.set(src, e);
        if (src === 'cmApplyPost') {
          if (dayIx.d !== g.date) { dayIx.d = g.date; dayIx.m = new Map(); for (const fx of Object.values(g.fixtures)) if (fx.date === g.date) { dayIx.m.set(fx.home, fx); dayIx.m.set(fx.away, fx); } }
          const fx = dayIx.m.get(id), cp = fx ? g.comps[fx.comp] : undefined;
          const ck = fx ? `${cp?.type ?? '?'} ${cp?.name ?? fx.comp}` : '(ingen kamp i dag)';
          const e2 = byComp.get(ck) ?? [0, 0, 0, 0]; e2[0] += v - old; e2[1]++; if (v > old) e2[2] += v - old; else e2[3] += v - old; byComp.set(ck, e2);
        }
        const mk = `${src} ${g.date.slice(0, 7)}`; const em = byMon.get(mk) ?? [0, 0]; em[0] += v - old; em[1]++; byMon.set(mk, em);
        e.n++; e.sum += v - old; if (v > old) e.up += v - old; else e.down += v - old;
      }
      (t as any)[k] = v; return true;
    },
  });
}

// ------------------------------------------------------------------ dag for dag
interface Acc { match: Map<string, number[]>; other: Map<string, number>; month: Map<string, [number, number]>; cat: Map<string, [number, number]>; big: string[]; pos: string[]; posM: Map<string, [number, number]> }
const acc = (): Acc => ({ match: new Map(), other: new Map(), month: new Map(), cat: new Map(), big: [], pos: [], posM: new Map() });
const wd = (iso: string) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
const A = { o: acc(), u: acc() };
const prev: { o?: W; u?: W } = {};
const first: { o?: W; u?: W } = {};
function step(side: 'o' | 'u', iso: string, w: W) {
  const P = prev[side]; prev[side] = w; if (!first[side]) first[side] = w;
  if (!P) return;
  const a = A[side], mk = iso.slice(0, 7);
  for (const [name, r] of w) {
    const q = P.get(name); if (!q || q.div !== r.div) continue;
    const d = r.rep - q.rep;
    const mo = a.month.get(mk) ?? [0, 0]; a.month.set(mk, mo);
    if (side === 'o' && Math.abs(oxDay.get(name) ?? 0) >= 10 && r.p === q.p) { const e = oxDay.get(name)!; oxChk.n++; oxChk.exp += e; oxChk.act += d; if (oxChk.lines.length < 60) oxChk.lines.push(`${iso} ${name} forventet ${e} faktisk ${d}`); }
    if (r.p === q.p && Math.abs(d) >= 2 && Math.abs(d) < 300 && wd(iso) !== 2 && !(side === 'o' && oxDay.has(name))) { a.pos.push(`${iso} ${name} ${d}`); const pk = `${iso.slice(0, 7)} ${d > 0 ? '+' : '-'}`; const pe = a.posM.get(pk) ?? [0, 0]; pe[0] += d; pe[1]++; a.posM.set(pk, pe); }
    const tue = wd(iso) === 1, played = r.p === q.p + 1;
    const ck = Math.abs(d) >= 300 ? 'stor (|Δ| ≥ 300)' : `${played ? 'kampdag' : 'uden kamp'} ${tue ? 'tirsdag' : 'ikke tirsdag'}`;
    if (!played && d !== 0 && Math.abs(d) < 300) { const hk = `${mk} ${tue ? 'ti' : '  '} ${d === -1 ? '−1' : d === 1 ? '+1' : d < 0 ? '<−1' : '>+1'}`; const he = a.cat.get('hist ' + hk) ?? [0, 0]; he[0] += d; he[1]++; a.cat.set('hist ' + hk, he); }
    const ce = a.cat.get(ck) ?? [0, 0]; ce[0] += d; ce[1]++; a.cat.set(ck, ce);
    if (Math.abs(d) >= 300) a.big.push(`${iso} ${name} ${r.div.replace('English ', '')} ${d}${played ? ' (kamp)' : ''}`);
    if (played && !tue && Math.abs(d) < 300) { const k2 = `ren ${r.div.replace('English ', '')} ${r.gf - q.gf > r.ga - q.ga ? 'S' : r.gf - q.gf === r.ga - q.ga ? 'U' : 'N'}`; const x = a.match.get(k2) ?? []; x.push(d); a.match.set(k2, x); }
    if (r.p === q.p + 1) {
      const gf = r.gf - q.gf, ga = r.ga - q.ga, res = gf > ga ? 'S' : gf === ga ? 'U' : 'N';
      const k = `${r.div.replace('English ', '')} ${res}`;
      const x = a.match.get(k) ?? []; x.push(d); a.match.set(k, x);
      mo[0] += d;
    } else if (r.p === q.p) { a.other.set(mk, (a.other.get(mk) ?? 0) + d); mo[1] += d; }
  }
}

const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const t0d = Date.parse('2001-07-14');
const snaps = ix.snaps.filter((e) => e.iso <= UNTIL && Math.round((Date.parse(e.iso) - t0d) / 86400000) % EVERY === 0).sort((a, b) => a.iso.localeCompare(b.iso));
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
const t0 = Date.now();
for (const s of snaps) {
  if (!ONLY_ORACLE) {
    const pv = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== '2001-07-14') while ((g.date < pv || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
      if (!g.userClub) {
        const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
        if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
      }
      g = gs(); install();
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
    g = gs();
    step('u', s.iso, ours());
  }
  const om = loadDaySnap(ix, s);
  { const ow = oracle(om); if (!process.env.NO_OXFER) oracleXfer(om, s.iso, ow); step('o', s.iso, ow); }
  if (process.env.DAILYAVG) { const b = om.u32(0xb74350), dbl = (a: number) => { const x = Buffer.alloc(8); for (let i = 0; i < 8; i++) x[i] = om.u8(a + i); return x.readDoubleLE(0); };
    const o = [dbl(b + 0x10), dbl(b + 0x18)], u = g?.cmRatingAvg ?? [0, 0]; const P = (globalThis as any).__pa;
    if (P) console.log(`  ${s.iso} dagens snit vores ${((u[0] - P.u[0]) / (u[1] - P.u[1])).toFixed(3)} (${u[1] - P.u[1]})  oraklet ${((o[0] - P.o[0]) / (o[1] - P.o[1])).toFixed(3)} (${o[1] - P.o[1]})`);
    (globalThis as any).__pa = { u: [...u], o }; }
  if (s.iso.endsWith('-01') || s.iso.endsWith('-15')) {
    const b = om.u32(0xb74350), dbl = (a: number) => { const x = Buffer.alloc(8); for (let i = 0; i < 8; i++) x[i] = om.u8(a + i); return x.readDoubleLE(0); };
    const ua = g?.cmRatingAvg;
    console.log(`  ${s.iso} (${((Date.now() - t0) / 1000).toFixed(0)} s) karaktersnit vores ${ua ? `${ua[0]}/${ua[1]} = ${(ua[0] / ua[1]).toFixed(4)}` : '–'}  oraklet ${dbl(b + 0x10)}/${dbl(b + 0x18)} = ${(dbl(b + 0x10) / dbl(b + 0x18)).toFixed(4)}`);
  }
}

// ------------------------------------------------------------------ rapport
const f = (x: number) => (Number.isFinite(x) ? x.toFixed(1) : '–');
const mean = (xs: number[]) => (xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : NaN);
console.log('\n## ligakampdage: Δ pr. kamp (vores / oraklet), antal');
const keys = [...new Set([...A.o.match.keys(), ...A.u.match.keys()])].sort();
for (const k of keys) {
  const u = A.u.match.get(k) ?? [], o = A.o.match.get(k) ?? [];
  console.log(`${k.padEnd(18)} ${f(mean(u)).padStart(7)} / ${f(mean(o)).padStart(7)}   n ${u.length}/${o.length}   sum ${u.reduce((t, x) => t + x, 0)}/${o.reduce((t, x) => t + x, 0)}`);
}
console.log('\n## pr. måned: sum Δ på ligakampdage | andre dage (vores / oraklet)');
for (const mk of [...new Set([...A.o.month.keys(), ...A.u.month.keys()])].sort()) {
  const u = A.u.month.get(mk) ?? [0, 0], o = A.o.month.get(mk) ?? [0, 0];
  console.log(`${mk}  kamp ${String(u[0]).padStart(7)} / ${String(o[0]).padStart(7)}   andet ${String(u[1]).padStart(7)} / ${String(o[1]).padStart(7)}`);
}
console.log('\n## kategorier: sum Δ (antal) vores / oraklet');
for (const k of [...new Set([...A.o.cat.keys(), ...A.u.cat.keys()])].sort()) { const u = A.u.cat.get(k) ?? [0, 0], o = A.o.cat.get(k) ?? [0, 0]; console.log(`${k.padEnd(28)} ${u[0]} (${u[1]}) / ${o[0]} (${o[1]})`); }
console.log('\n## ikke-ligadage, ikke onsdag (uge), uden klubskifte, |Δ| ≥ 2: pr. måned sum (antal) vores / oraklet');
for (const k of [...new Set([...A.o.posM.keys(), ...A.u.posM.keys()])].sort()) { const u = A.u.posM.get(k) ?? [0, 0], o = A.o.posM.get(k) ?? [0, 0]; console.log(`  ${k} ${u[0]} (${u[1]}) / ${o[0]} (${o[1]})`); }
if (process.env.POSLIST) { console.log('vores:'); for (const x of A.u.pos) console.log('  ' + x); console.log('oraklet:'); for (const x of A.o.pos) console.log('  ' + x); }
console.log('\n## store spring vores'); for (const x of A.u.big) console.log('  ' + x);
console.log('\n## store spring oraklet'); for (const x of A.o.big) console.log('  ' + x);
console.log('\n## vores kamprapporter (0x6d3de0) pr. turnering: sum, antal, op, ned');
for (const [k, e] of [...byComp].sort((a, b) => a[1][0] - b[1][0])) console.log(`  ${k.padEnd(40)} ${e[0]} (${e[1]}) +${e[2]} ${e[3]}`);
console.log(`\n## oraklet: klubskifter (|forventet| ≥ 10, uden ligakamp) ${oxChk.n}: forventet ${oxChk.exp}, faktisk ${oxChk.act}`);
for (const l of oxChk.lines) console.log('  ' + l);
console.log('\n## vores skrivere pr. måned (sum, antal)');
for (const [k, e] of [...byMon].sort()) console.log(`  ${k.padEnd(30)} ${e[0]} (${e[1]})`);
console.log('\n## oraklets klubskifter (kontraktklub) pr. måned: forventet +0x80-sum (antal)');
for (const [k, e] of [...oxMon].sort((a, b) => a[0].slice(-7).localeCompare(b[0].slice(-7)) || a[0].localeCompare(b[0]))) console.log(`  ${k.padEnd(22)} ${e[0]} (${e[1]})`);
console.log('\n## vores skrivere (engelske klubber): antal, sum, op, ned');
for (const [k, e] of [...bySrc].sort((a, b) => b[1].n - a[1].n)) console.log(`${k.padEnd(22)} ${e.n} ${e.sum} +${e.up} ${e.down}`);
console.log('\n## pr. klub: Δ start→slut (vores / oraklet), sorteret efter vores − oraklet');
if (first.u && prev.u && first.o && prev.o) {
  const rows: [string, string, number, number, number, number][] = [];
  for (const [nm, r0] of first.o) {
    const o1 = prev.o.get(nm), u0 = first.u.get(nm), u1 = prev.u.get(nm); if (!o1 || !u0 || !u1) continue;
    rows.push([nm, r0.div.replace('English ', ''), u1.rep - u0.rep, o1.rep - r0.rep, u0.rep, r0.rep]);
  }
  rows.sort((a, b) => (a[2] - a[3]) - (b[2] - b[3]));
  const byDiv = new Map<string, [number, number, number]>();
  for (const r of rows) { const e = byDiv.get(r[1]) ?? [0, 0, 0]; e[0] += r[2]; e[1] += r[3]; e[2]++; byDiv.set(r[1], e); }
  for (const [d, e] of byDiv) console.log(`  ${d.padEnd(18)} gns. ${f(e[0] / e[2])} / ${f(e[1] / e[2])}  (n ${e[2]})`);
  for (const r of rows) console.log(`${r[0].padEnd(28)} ${r[1].padEnd(18)} ${String(r[2]).padStart(6)} / ${String(r[3]).padStart(6)}   diff ${String(r[2] - r[3]).padStart(6)}   start ${r[4]}/${r[5]}`);
}

