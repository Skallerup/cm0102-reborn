// Værdien +0x52 ved spilstarten: inddata til 0x4d0c60 (cmValue.ts) i spillets hukommelse (cmContractGame.ts buildWantMem) mod originalens
// hukommelse (oraklets spilstart pre-194-2001.bin) for de parrede spillere – hvilke felter afviger, når værdien afviger.
//   npx tsx scripts/cm-value-diff.ts [snapshot=pre-194-2001]      (EX=antal eksempler, WORLD=world-fil)
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { type CmCtx, type CmMem, SparseMem, G, getContract, clubAt } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import type { CMWorld } from '../src/game/data/cm0102';
import { gs } from '../src/game/state';
import { playerValue_4d0c60, seenRep_5407e0, judge_6e86d0, knowledge_5408c0 } from '../src/game/cmValue';
import { cmMemCall, humanClub_600a50 } from '../src/game/cmWageGame';
import type { Player } from '../src/game/types';
import { cmValuesGbp, cmValueMem } from '../src/game/cmValueGame';

const snap = process.argv[2] ?? 'pre-194-2001';
const MS = loadSnap(`${homedir()}/cm0102-engine/work-r3/snap-start/${snap}.bin`);
const EX = Number(process.env.EX ?? 8);
const str = (m: CmMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');

const oc: CmCtx = { m: MS, rand: () => 0, call: (adr, ...a) => cmMemCall(oc, adr, ...a) };
// originalens personer
const S = MS.u32(G.STAFF), n = MS.s32(G.STAFF_COUNT);
const orig = new Map<string, number[]>();
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id;
  if (!MS.u32(st + 0x61)) continue;
  const common = str(MS, MS.u32(st + 0xc)), f = str(MS, MS.u32(st + 4)), l = str(MS, MS.u32(st + 8));
  const first = common ? '' : f, last = common || l;
  const dob = dayIso(MS.s16(st + 0x10), MS.u16(st + 0x12));
  const yob = dob ? +dob.slice(0, 4) : MS.s16(st + 0x18);
  const nat = str(MS, MS.u32(st + 0x1a) + 4, 51);
  const k = `${first}|${last}|${yob}|${nat}`;
  (orig.get(k) ?? orig.set(k, []).get(k)!).push(st);
}

const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as CMWorld;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w as unknown as WorldData, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const ps = Object.values(g.players).filter((p) => p.club && p.contract && !p.virtual);
const vals = cmValuesGbp(g, ps);
const M = cmValueMem(g, new Set(ps.map((p) => p.loan?.from ?? p.club)));
const um = M.c.m, uc = M.c;

/** de felter 0x4d0c60 læser for (st, kontraktens klub) */
function inputs(c: CmCtx, st: number): Record<string, number | string> | null {
  const m = c.m;
  const k = getContract(m, st);
  if (!k) return null;
  const club = clubAt(m, m.s32(k + 4));
  const rec = m.u32(st + 0x61), nat = m.u32(st + 0x1a), cn = m.u32(club + 0x53), div = m.u32(club + 0x57), mgr = m.u32(club + 0xcf);
  const R = seenRep_5407e0(c, st, mgr, 0);
  const today = [m.s16(G.TODAY), m.u16(G.TODAY + 2)];
  const days = (m.u16(k + 0x2f) - today[1]) * 365 + m.s16(k + 0x2d) - today[0];
  return {
    pos: [0xf, 0x12, 0x13, 0x14, 0x15].map((o) => m.u8(rec + o)).join(','),
    attrs: [0x27, 0x28, 0x2d, 0x2f, 0x36, 0x43].map((o) => m.s8(rec + o)).join(','),
    ca: m.s16(rec + 5), pa: m.s16(rec + 7), rep: [9, 0xb, 0xd].map((o) => m.s16(rec + o)).join(','),
    age: m.u8(st + 0x18), caps: m.u8(st + 0x22), nat8e: nat ? m.s16(nat + 0x8e) : -1,
    divRep: div ? m.s16(div + 0x69) : -1, cn7e: cn ? m.s8(cn + 0x7e) : -1, cn85: cn ? m.s8(cn + 0x85) : -1, st64: m.s8(club + 0x64), crep: m.s16(club + 0x80),
    know: knowledge_5408c0(c, st, mgr), R, J: judge_6e86d0(c, mgr, st, club, 1, R),
    mgrJ: mgr && m.u32(mgr + 0x69) ? [4, 0x17, 0x18].map((o, i) => (i ? m.u8(m.u32(mgr + 0x69) + o) : m.s16(m.u32(mgr + 0x69) + o))).join(',') : 'ingen',
    days, type: m.u8(k + 0x35) & 0x3f, b3d: m.s8(k + 0x3d), clause: [0x1c, 0x1d, 0x1f].map((o) => m.u8(k + o)).join(','), fee: m.s32(k + 0x21),
    human: humanClub_600a50(c, club) ? 1 : 0,
    v: playerValue_4d0c60(c, st, club, 0, -1, 0) | 0, v52: m.s32(st + 0x52),
  };
}

const nat = (i: number) => g.nations[i]?.name ?? '';
let pairs = 0, ok = 0, okOrigSelf = 0;
const fieldBad = new Map<string, number>(), fieldBadWhenWrong = new Map<string, number>();
const ex: string[] = [];
for (const p of ps) {
  const r = w.ratings[p.id] as unknown as { ca: number; paRaw?: number; rep?: number[]; tf?: unknown; rd?: unknown } | undefined;
  const known = !!r && r.ca > 1 && r.paRaw === undefined && !r.tf && !!r.rep && r.rep[1] > 0 && !(r as { rd?: unknown }).rd;
  const NM = process.env.NAME;
  if (NM ? `${p.first} ${p.last}` !== NM : !known) continue;
  const os = orig.get(`${p.first}|${p.last}|${p.dob.slice(0, 4)}|${nat(p.nation)}`);
  if (!os || os.length !== 1) continue;
  const ost = os[0];
  const mv = MS.s32(ost + 0x52);
  if (mv <= 0) continue;
  const ust = M.W.staffOf(p as Player);
  if (!ust) continue;
  const a = inputs(oc, ost), b = inputs(uc, ust);
  if (!a || !b) continue;
  pairs++;
  const ours = vals.get(p.id) ?? 0;
  const good = Math.abs(ours / mv - 1) <= 0.1;
  if (good) ok++;
  if (Math.abs((a.v as number) / mv - 1) <= 0.1) okOrigSelf++;
  for (const f of Object.keys(a)) {
    if (f === 'v' || f === 'v52') continue;
    const d = f === 'days' ? Math.abs((a[f] as number) - (b[f] as number)) > 2 : a[f] !== b[f];
    if (d) { fieldBad.set(f, (fieldBad.get(f) ?? 0) + 1); if (!good) fieldBadWhenWrong.set(f, (fieldBadWhenWrong.get(f) ?? 0) + 1); }
  }
  const exf = process.env.EXF; if ((!process.env.CLUB || g.clubs[p.club]?.name === process.env.CLUB) && (exf ? a[exf] !== b[exf] : !good) && ex.length < EX) ex.push(`${p.first} ${p.last} (${g.clubs[p.club]?.name}) vores £${ours} orig +0x52 £${mv} (0x4d0c60 på orig. hukommelse £${a.v})\n   orig ${JSON.stringify(a)}\n   vores ${JSON.stringify(b)}`);
}
console.log(`par ${pairs}, inden for ±10 %: ${ok} (${Math.round((100 * ok) / pairs)} %); 0x4d0c60 på originalens hukommelse = +0x52 ±10 %: ${okOrigSelf}`);
console.log('afvigende felter (alle / når værdien afviger):');
for (const [f, c] of [...fieldBad].sort((x, y) => y[1] - x[1])) console.log(`  ${f.padEnd(8)} ${c} / ${fieldBadWhenWrong.get(f) ?? 0}`);
for (const e of ex) console.log(e);
void SparseMem;
if (process.env.IDS) {
  console.log('seed orig', MS.s32(0xdd7120), 'vores', um.s32(0xdd7120), 'staff count orig', MS.s32(G.STAFF_COUNT), 'vores', um.s32(G.STAFF_COUNT));
  let i = 0, same = 0, tot = 0;
  for (const p of ps) {
    const os = orig.get(`${p.first}|${p.last}|${p.dob.slice(0, 4)}|${nat(p.nation)}`);
    if (!os || os.length !== 1) continue;
    tot++; if (MS.s32(os[0]) === p.id) same++;
    if (i++ < 10) console.log(p.first, p.last, 'vores id', p.id, 'orig id', MS.s32(os[0]), 'mgr orig', MS.s32(MS.u32(clubAt(MS, MS.s32(getContract(MS, os[0]) + 4)) + 0xcf)));
  }
  console.log('samme id', same, '/', tot);
}
if (process.env.SUBST) {
  // hvor mange kommer inden for ±10 %, når én gruppe inddata tages fra originalens hukommelse
  type Patch = (ost: number, ust: number, ok: number, uk: number) => (() => void) | number;
  const copy = (ua: number, oa: number, n: number) => { const old: number[] = []; for (let i = 0; i < n; i++) { old.push(um.u8(ua + i)); um.w8(ua + i, MS.u8(oa + i)); } return () => { for (let i = 0; i < n; i++) um.w8(ua + i, old[i]); }; };
  const multi = (...fs: (() => void)[]) => () => fs.forEach((f) => f());
  const recO = (st: number, mm: CmMem) => mm.u32(st + 0x61);
  const origJ = (ost: number) => { const k = getContract(MS, ost), cl = clubAt(MS, MS.s32(k + 4)), mg = MS.u32(cl + 0xcf); return judge_6e86d0(oc, mg, ost, cl, 1, seenRep_5407e0(oc, ost, mg, 0)); };
  const P: Record<string, Patch> = {
    none: () => () => {},
    b3d: (_o, _u, ok, uk) => copy(uk + 0x3d, ok + 0x3d, 1),
    attrs: (o, u) => multi(...[0x27, 0x28, 0x2d, 0x2f, 0x36, 0x43].map((x) => copy(recO(u, um) + x, recO(o, MS) + x, 1))),
    rep: (o, u) => copy(recO(u, um) + 9, recO(o, MS) + 9, 6),
    days: (_o, _u, ok, uk) => copy(uk + 0x2d, ok + 0x2d, 4),
    capsNat: (o, u) => multi(copy(u + 0x22, o + 0x22, 1), copy(um.u32(u + 0x1a) + 0x8e, MS.u32(o + 0x1a) + 0x8e, 2)),
    pos: (o, u) => copy(recO(u, um) + 0xf, recO(o, MS) + 0xf, 7),
    mgrNp: (o, u, ok, uk) => { const oc2 = clubAt(MS, MS.s32(ok + 4)), uc2 = clubAt(um, um.s32(uk + 4)); const om = MS.u32(oc2 + 0xcf), umg = um.u32(uc2 + 0xcf); if (!om || !umg || !MS.u32(om + 0x69) || !um.u32(umg + 0x69)) return () => {}; void o; void u; return multi(copy(um.u32(umg + 0x69) + 4, MS.u32(om + 0x69) + 4, 2), copy(um.u32(umg + 0x69) + 0x17, MS.u32(om + 0x69) + 0x17, 2)); },
    J: (o) => origJ(o),
  };
  const ALL = Object.keys(P).filter((k) => k !== 'none');
  const combos: [string, string[]][] = [['none', []], ...ALL.map((k) => [k, [k]] as [string, string[]]), ['alt undtagen J', ALL.filter((k) => k !== 'J')], ['alt', ALL], ['b3d+J', ['b3d', 'J']]];
  for (const [name, ks] of combos) {
    let tot = 0, good = 0;
    for (const p of ps) {
      const r = w.ratings[p.id] as unknown as { ca: number; paRaw?: number; rep?: number[]; tf?: unknown; rd?: unknown } | undefined;
      if (!(r && r.ca > 1 && r.paRaw === undefined && !r.tf && r.rep && r.rep[1] > 0 && !r.rd)) continue;
      const os = orig.get(`${p.first}|${p.last}|${p.dob.slice(0, 4)}|${nat(p.nation)}`);
      if (!os || os.length !== 1) continue;
      const ost = os[0], mv = MS.s32(ost + 0x52);
      if (mv <= 0) continue;
      const ust = M.W.staffOf(p as Player);
      const ok = getContract(MS, ost), uk = getContract(um, ust);
      if (!ust || !ok || !uk) continue;
      let judge = -1;
      const undo: (() => void)[] = [];
      for (const k of ks) { const x = P[k](ost, ust, ok, uk); if (typeof x === 'number') judge = x; else undo.push(x); }
      const club = clubAt(um, um.s32(uk + 4));
      const v = playerValue_4d0c60(uc, ust, club, 0, judge, 0) | 0;
      undo.reverse().forEach((f) => f());
      tot++; if (Math.abs(v / mv - 1) <= 0.1) good++;
    }
    console.log(`${name.padEnd(16)} ${good}/${tot} = ${Math.round((100 * good) / tot)} %`);
  }
}
