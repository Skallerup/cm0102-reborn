// Udbudsprisen 0x4d1600 på originalens hukommelse 14/7-2001 (pre-194-2001.bin) mod porten på spillets hukommelse for de samme spillere
// (parret som cm-want-diff.ts: klub + fødselsdato). Med WHO="Fornavn Efternavn" logges læsningerne (pc, adresse, værdi) i begge, og de
// første afvigelser vises.   npx tsx scripts/cm-asking-diff.ts [antal]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { G, getContract, type CmMem, type CmCtx, SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildWantMem } from '../src/game/cmContractGame';
import { genCtx } from '../src/game/cmGen/impls';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';
import { slCall, slmOf } from '../src/game/cmShortlist';
import { TRACE } from '../src/game/cmGen/x86';
import { SL_ON, buildSlMem } from '../src/game/cmShortlistGame';
SL_ON.on = true;

const om = loadSnap(`${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const rnd = (n: number) => (n > 1 ? Math.floor(n / 2) : 0);
const ob: CmCtx = {
  m: om, rand: rnd,
  call: (adr, ...a) => {
    switch (adr) {
      case 0x5a0590: return getClubFinance_5a0590(ob, a[a.length - 1]);
      case 0x846920: case 0x849f00: case 0x844780: return slCall(oc, adr, slmOf(om), ...a);
      case 0x8cca10: return slCall(oc, adr, om.u32(0xde1f54), ...a);
    }
    try { return cmMemCall(ob, adr, ...a); } catch { return 0; }
  },
};
const oc = genCtx(ob);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const str = (m: CmMem, a: number) => { let s = ''; for (let i = 0; i < 54; i++) { const ch = m.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
const okey = new Map<string, number | null>();
for (let id = 0; id < om.s32(G.STAFF_COUNT); id++) {
  const st = (om.u32(G.STAFF) + 0x6e * id) >>> 0;
  if (om.u8(st + 0x3d) !== 0xb || !om.u32(st + 0x61) || !om.u32(st + 0x39) || !getContract(om, st)) continue;
  const k = `${str(om, om.u32(st + 0x39) + 4)}|${om.s16(st + 0x10)}|${om.u16(st + 0x12)}`;
  okey.set(k, okey.has(k) ? null : st);
}
const clubs = Object.values(g.clubs).filter((c) => c.nation === eng && !g.leagues[c.league]?.hidden).map((c) => c.id);
const S = process.env.WANT ? null : buildSlMem(g);
const M = S ? S.M : buildWantMem(g, clubs);
const gm = M.W.c.m;
M.setRand(rnd);
const isoDay = (iso: string) => { const y = +iso.slice(0, 4); return [Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000), y]; };

// læselog (stakken og skrabepladsen 0x2f0000–0x400000 udelades)
type Rd = [number, number, number, number];
let log: Rd[] | null = null, pcNow = 0;
function hook(m: SparseMem) {
  const p = m as unknown as Record<string, (a: number) => number>;
  for (const [k, sz] of [['u8', 1], ['u16', 2], ['u32', 4]] as const) {
    const f = p[k].bind(m);
    p[k] = (a: number) => { const v = f(a); const u = a >>> 0; if (log && (u < 0x2f0000 || u >= 0x400000)) log.push([pcNow, u, sz, v]); return v; };
  }
}
hook(om); hook(gm as SparseMem);
const WHO = process.env.WHO;
const N = +(process.argv[2] ?? 400);
const rs: number[] = [], vr: number[] = [];
let n = 0;
const rows: string[] = [];
const ps = Object.values(g.players).filter((p) => p.contract && !p.regen && clubs.includes(p.loan?.from ?? p.club)).sort((a, b) => b.value - a.value);
const step = Math.max(1, Math.floor(ps.length / N / 2));
for (let i = 0; i < ps.length; i += WHO ? 1 : step) {
  const p = ps[i];
  if (n >= N) break;
  if (WHO && `${p.first} ${p.last}` !== WHO) continue;
  const home = p.loan?.from ?? p.club;
  const [d, y] = isoDay(p.dob);
  const ost = okey.get(`${g.clubs[home].name}|${d}|${y}`);
  if (!ost) continue;
  const gst = M.W.staffOf(p);
  if (!gst) continue;
  if (!S) gm.w32(gst + 0x52, Math.round(p.value * 0.86));
  const run = (c: CmCtx, m: CmMem, st: number, club: number) => slCall(c, 0x4d1600, m.u32(G.CM), club, 0, st, 0, 1, 1) | 0;
  const lg: Rd[][] = [[], []];
  if (WHO) { TRACE.on = true; TRACE.f = (pc) => { pcNow = pc; }; log = lg[0]; }
  const gv = run(M.c, gm, gst, M.W.clubOf(home));
  if (WHO) log = lg[1];
  const ov = run(oc, om, ost, om.u32(ost + 0x39));
  log = null; TRACE.on = false;
  n++;
  if (ov > 0) rs.push(gv / ov);
  if (om.s32(ost + 0x52) > 0) vr.push(gm.s32(gst + 0x52) / om.s32(ost + 0x52));
  const slotOf = (m: CmMem, club: number, id: number) => {
    const ent = (m.u32(m.u32(m.u32(0xde1f54) + 0x856) + 0xdc) + 9 * m.s32(club)) >>> 0, base = m.u32(ent);
    if (!base) return 'ingen liste';
    for (let i = 0; i < 40; i++) { const a = base + 0x25 * i; if (m.u8(a) === 0xb && m.s32(a + 0x13) === id) return `plads ${i} maske ${m.u16(a + 1).toString(16)} +3 ${m.s32(a + 3)} +7 ${m.s32(a + 7)} +b ${m.s32(a + 0xb)} idx ${m.u8(a + 0x23)}`; }
    return `ikke på (tilstand ${m.u8(ent + 4)})`;
  };
  const k1 = getContract(om, ost), k2 = M.W.contractOf(p);
  rows.push(`${(gv / Math.max(1, ov)).toFixed(2)} ${p.first} ${p.last} (${g.clubs[home].name}): orig £${ov} spil £${gv} (værdi orig ${om.s32(ost + 0x52)} spil ${gm.s32(gst + 0x52)}) | orig ${slotOf(om, om.u32(ost + 0x39), om.s32(ost))} k3d ${om.u8(k1 + 0x3d)} k4e ${om.u8(k1 + 0x4e)} | spil ${slotOf(gm, M.W.clubOf(home), gm.s32(gst))} k3d ${gm.u8(k2 + 0x3d)} k4e ${gm.u8(k2 + 0x4e)}`);
  if (WHO) {
    const [PLO, PHI] = (process.env.PCS ?? '0-ffffffff').split('-').map((x) => parseInt(x, 16));
    const [a, b] = lg.map((l) => l.filter((r) => r[0] >= PLO && r[0] <= PHI));
    let shown = 0;
    for (let j = 0; j < Math.min(a.length, b.length) && shown < +(process.env.SHOWN ?? 30); j++) {
      if (a[j][0] !== b[j][0]) { console.log(`spor skilles ved ${j}: pc ${a[j][0].toString(16)} / ${b[j][0].toString(16)}`); break; }
      if (a[j][3] !== b[j][3]) { shown++; console.log(`#${j} pc ${a[j][0].toString(16)} spil [${a[j][1].toString(16)}]=${a[j][3]} orig [${b[j][1].toString(16)}]=${b[j][3]} (${a[j][2]})`); }
    }
    console.log(`læsninger ${a.length}/${b.length}`);
    if (process.env.GROUP) {
      const grp = (l: Rd[]) => { const r = new Map<number, number[]>(); for (const x of l) { const k = x[0]; if (!r.has(k)) r.set(k, []); r.get(k)!.push(x[3]); } return r; };
      const ga = grp(a), gb = grp(b);
      for (const pc of [...new Set([...ga.keys(), ...gb.keys()])].sort((x, y) => x - y)) {
        const va = ga.get(pc) ?? [], vb = gb.get(pc) ?? [];
        if (va.join() !== vb.join()) console.log(`pc ${pc.toString(16)}: spil ${va.slice(0, 8).join(',')}${va.length > 8 ? '…' + va.length : ''} | orig ${vb.slice(0, 8).join(',')}${vb.length > 8 ? '…' + vb.length : ''}`);
      }
    }
    if (process.env.DUMP) for (let j = 0; j < Math.max(a.length, b.length); j++) { const x = a[j], y = b[j]; console.log(`${j} ${x ? `${x[0].toString(16)} [${x[1].toString(16)}]=${x[3]}` : '-'}  |  ${y ? `${y[0].toString(16)} [${y[1].toString(16)}]=${y[3]}` : '-'}`); }
  }
}
if (process.env.SORT) rows.sort((x, y) => Math.abs(Math.log(+y.split(' ')[0] || 1e-3)) - Math.abs(Math.log(+x.split(' ')[0] || 1e-3)));
for (const r of rows.slice(0, +(process.env.ROWS ?? 25))) console.log(r);
rs.sort((a, b) => a - b); vr.sort((a, b) => a - b);
console.log(`+0x52 spil/orig 10/50/90 %: ${[0.1, 0.5, 0.9].map((q) => vr[Math.floor(q * (vr.length - 1))]?.toFixed(2)).join(' / ')}; inden for 2 %: ${vr.filter((r) => Math.abs(r - 1) <= 0.02).length}/${vr.length}`);
console.log(`${n} spillere; spil/orig 10/50/90 %: ${[0.1, 0.5, 0.9].map((q) => rs[Math.floor(q * (rs.length - 1))]?.toFixed(2)).join(' / ')}; inden for 2 %: ${rs.filter((r) => Math.abs(r - 1) <= 0.02).length}`);
