// Fejlsøgning af ønskekontraktens postbygger (src/game/cmContractGame.ts): for de parrede engelske spillere (som cm-want-game.ts) sammenlignes
// felterne i originalens hukommelse 14/7-2001 (pre-194-2001.bin) og i den byggede hukommelse – personposten, spillerposten, kontrakten,
// klubben, finansposten, divisionen og landet (pegere springes over). Tæller afvigelser pr. felt (alle / kun dem, hvis ønskeløn afviger).
//   npx tsx scripts/cm-want-diff.ts [frø]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { G, getContract, type CmMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildWantMem, cmAiTerms, WANT_DEBUG } from '../src/game/cmContractGame';
import { setToDesiredContract_85fc50 } from '../src/game/cmContractWant';
import { genCtx } from '../src/game/cmGen/impls';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';
import { slCall, slmOf } from '../src/game/cmShortlist';
import type { CmCtx } from '../src/game/cmMem';
import { TRACE } from '../src/game/cmGen/x86';
let cur = 0;
const [PLO, PHI] = (process.env.PCS ?? '0-ffffffff').split('-').map((x) => parseInt(x, 16));

const seed = +(process.argv[2] ?? 1);
const om = loadSnap(`${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const ob: CmCtx = {
  m: om, rand: () => 14,
  call: (adr, ...a) => {
    if (dbg) { const v = ocall(adr, a); console.log(`  orig 0x${adr.toString(16)}(${a.map((x) => (x >>> 0).toString(16)).join(',')}) = ${v}`); return v; }
    return ocall(adr, a);
  },
};
const ocall = (adr: number, a: number[]): number => {
    switch (adr) {
      case 0x5a0590: return getClubFinance_5a0590(ob, a[a.length - 1]);
      case 0x846920: case 0x849f00: case 0x844780: return slCall(oc, adr, slmOf(om), ...a);
      case 0x8cca10: return slCall(oc, adr, om.u32(0xde1f54), ...a);
    }
    try { return cmMemCall(ob, adr, ...a); } catch { return 0; }
};
let dbg = false;
const oc = genCtx(ob);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const str = (m: CmMem, a: number) => { let s = ''; for (let i = 0; i < 54; i++) { const ch = m.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
// originalens personer efter nøglen
const okey = new Map<string, number | null>();
for (let id = 0; id < om.s32(G.STAFF_COUNT); id++) {
  const st = (om.u32(G.STAFF) + 0x6e * id) >>> 0;
  if (om.u8(st + 0x3d) !== 0xb || !om.u32(st + 0x61) || !om.u32(st + 0x39) || !getContract(om, st)) continue;
  const k = `${str(om, om.u32(st + 0x39) + 4)}|${om.s16(st + 0x10)}|${om.u16(st + 0x12)}`;
  okey.set(k, okey.has(k) ? null : st);
}
const clubs = Object.values(g.clubs).filter((c) => c.nation === eng && !g.leagues[c.league]?.hidden).map((c) => c.id);
const M = buildWantMem(g, clubs);
const gm = M.W.c.m;
const isoDay = (iso: string) => { const y = +iso.slice(0, 4); return [Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000), y]; };
// pegerfelter, der ikke sammenlignes
const PTR: Record<string, number[]> = {
  staff: [0, 4, 8, 0xc, 0x1a, 0x1e, 0x24, 0x39, 0x61, 0x65, 0x69, 0x5c], club: [0x53, 0x57, 0x5b, 0x69, 0x83, 0x87, 0x8b, 0x8f, 0x93, 0x97, 0x9b, 0x9f, 0xa3, 0xa7, 0xab, 0xaf, 0xb3, 0xb7, 0xbb, 0xbf, 0xcf],
  contract: [0, 4], finance: [8], player: [], division: [0], nation: [0, 0x71],
};
// de felter, 0x85fc50 med kaldte funktioner læser (cm-want-check.ts FIELDS=1); id'erne (+0) sammenlignes ikke
const R = (s: string) => s.split(' ').flatMap((x) => { const [a, b] = x.split('-').map((v) => parseInt(v, 16)); return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i); });
const READ: Record<string, Set<number>> = {
  staff: new Set(R('10-13 18 1a-1d 22 24-28 39-41 46-4d 57-5b 5e 61-6c')), club: new Set(R('53-5a 64 69-6c 73-76 80-82 9b-a6 b3-c2 cf-d2 1db-1de 244')),
  contract: new Set(R('8-4f')), finance: new Set(R('0-7 c-17')), nation: new Set(R('71-77 7e 85 8e 8f')), player: new Set(R('4-45')), division: new Set(R('69 6a')),
};
const skip = (kind: string, o: number) => !READ[kind]?.has(o) || (PTR[kind] ?? []).some((b) => o >= b && o < b + 4);
const COPY = new Set((process.env.COPY ?? '').split(',').filter(Boolean));
const SHOW = new Set((process.env.SHOW ?? '').split(',').filter(Boolean)), shown = new Map<string, number>();
const diffAll = new Map<string, number>(), diffBad = new Map<string, number>();
let n = 0, bad = 0;
const L = 0x00310000;
for (const p of Object.values(g.players)) {
  const home = p.loan?.from ?? p.club;
  if (!home || !clubs.includes(home) || !p.contract || p.regen) continue;
  const [d, y] = isoDay(p.dob);
  const ost = okey.get(`${g.clubs[home].name}|${d}|${y}`);
  if (!ost) continue;
  const gst = M.W.staffOf(p);
  if (!gst) continue;
  const oclub = om.u32(ost + 0x39), gclub = M.W.clubOf(home);
  const pairs: [string, number, number, number][] = [
    ['staff', ost, gst, 0x6e], ['player', om.u32(ost + 0x61), gm.u32(gst + 0x61), 0x46], ['contract', getContract(om, ost), M.W.contractOf(p), 0x50],
    ['club', oclub, gclub, 0x245], ['finance', getClubFinance_5a0590(ob, oclub), M.W.finOf(home), 0x18],
    ['division', om.u32(oclub + 0x57), gm.u32(gclub + 0x57), 0x80], ['nation', om.u32(ost + 0x1a), gm.u32(gst + 0x1a), 0x100],
  ];
  // COPY=boss: formandens og managerens personpost +0x56..+0x5d og ikke-spillerpost, klubbens mål-omdømme (Shortlist +0xdc)
  if (COPY.has('boss')) {
    for (const o of [0xbf, 0xcf]) {
      const a = om.u32(oclub + o), b = gm.u32(gclub + o);
      if (!a || !b) continue;
      for (let q = 0x56; q < 0x5e; q++) gm.w8(b + q, om.u8(a + q));
      const na = om.u32(a + 0x69), nb = gm.u32(b + 0x69);
      if (na && nb) for (let q = 4; q < 0x40; q++) gm.w8(nb + q, om.u8(na + q));
    }
    const trA = (m: CmMem, c: number) => m.u32(m.u32(m.u32(0xde1f54) + 0x856) + 0xdc) + 9 * m.s32(c) + 5;
    gm.w16(trA(gm, gclub), om.s16(trA(om, oclub)));
  }
  // COPY=staff,player,…: originalens værdier for de læste felter (ikke pegere) skrives i den byggede hukommelse før kaldet
  for (const [kind, a, b, sz] of pairs) {
    if (!COPY.has(kind) || !a || !b) continue;
    for (let o = 0; o < sz; o++) if (!skip(kind, o)) gm.w8(b + o, om.u8(a + o));
  }
  const want = process.env.WHO && `${p.first} ${p.last}` === process.env.WHO;
  const tr: string[][] = [[], []];
  if (want) { TRACE.on = true; TRACE.f = (pc, R) => (pc < PLO || pc > PHI) ? 0 : tr[cur].push(`${pc.toString(16)} eax=${(R.eax >>> 0).toString(16)} ecx=${(R.ecx >>> 0).toString(16)} st0=${R.st[0]}`); }
  cur = 0;
  dbg = want;
  if (want) {
    const hx = (m: CmMem, a: number, n: number) => Array.from({ length: n }, (_, i) => m.u8(a + i).toString(16).padStart(2, '0')).join('');
    const [, , , oclub0, ofin0] = [0, 0, 0, om.u32(ost + 0x39), getClubFinance_5a0590(ob, om.u32(ost + 0x39))];
    const gclub0 = M.W.clubOf(home), gfin0 = M.W.finOf(home);
    console.log(`fin orig ${hx(om, ofin0, 0x18)} spil ${hx(gm, gfin0, 0x18)}`);
    console.log(`klub +0x64 ${om.u8(oclub0 + 0x64)}/${gm.u8(gclub0 + 0x64)} +0x80 ${om.s16(oclub0 + 0x80)}/${gm.s16(gclub0 + 0x80)} +0x82 ${om.u8(oclub0 + 0x82)}/${gm.u8(gclub0 + 0x82)} land ${om.s32(om.u32(oclub0 + 0x53))}=${om.s32(0x9cf2e4)} / ${gm.s32(gm.u32(gclub0 + 0x53))}=${gm.s32(0x9cf2e4)}; fin+8 → ${om.s32(ofin0 + 8)}=${om.s32(oclub0)} / ${gm.s32(gfin0 + 8)}=${gm.s32(gclub0)}`);
    const dv = (m: CmMem, c: number) => [m.u32(c + 0x57), m.u32(c + 0x5b)].map((d) => (d ? `${m.s32(d)}:${m.s16(d + 0x69)}` : '-')).join(' ');
    console.log(`divisioner orig ${dv(om, oclub0)} spil ${dv(gm, gclub0)}; land 7e/85 ${om.u8(om.u32(oclub0 + 0x53) + 0x7e)}/${om.u8(om.u32(oclub0 + 0x53) + 0x85)} spil ${gm.u8(gm.u32(gclub0 + 0x53) + 0x7e)}/${gm.u8(gm.u32(gclub0 + 0x53) + 0x85)}; alder ${om.u8(ost + 0x18)}/${gm.u8(gst + 0x18)}`);
    const trep = (m: CmMem, c: number) => m.s16(m.u32(m.u32(m.u32(0xde1f54) + 0x856) + 0xdc) + 9 * m.s32(c) + 5);
    const chair = (m: CmMem, c: number) => { const ch = m.u32(c + 0xbf), mg = m.u32(c + 0xcf); const np = ch ? m.u32(ch + 0x69) : 0, mp = mg ? m.u32(mg + 0x69) : 0; return `formand ${ch ? `${m.s8(ch + 0x57)}/${np ? `${m.s8(np + 0xf)},${m.s8(np + 0x20)}` : '-'}` : '-'} manager ${mg ? `${m.s8(mg + 0x57)}/${mp ? m.s16(mp + 0xa) : '-'}` : '-'}`; };
    console.log(`orig ${chair(om, oclub0)} | spil ${chair(gm, gclub0)}; cmFin.chair ${JSON.stringify(g.cmFin?.[home]?.chair)} cmChair ${JSON.stringify(g.cmChair?.[home])}`);
    const t2: string[][] = [[], []];
    TRACE.on = true; TRACE.f = (pc, R) => { t2[0].push(`${pc.toString(16)} eax=${(R.eax >>> 0).toString(16)}`); }; M.c.call(0x4d45f0, gclub0);
    TRACE.f = (pc, R) => { t2[1].push(`${pc.toString(16)} eax=${(R.eax >>> 0).toString(16)}`); }; oc.call(0x4d45f0, oclub0); TRACE.on = false;
    for (let j = 0; j < Math.max(t2[0].length, t2[1].length); j++) console.log(`   ${t2[0][j] ?? ''}  |  ${t2[1][j] ?? ''}`);
    console.log(`0x4d45f0 orig ${oc.call(0x4d45f0, oclub0)} spil ${M.c.call(0x4d45f0, gclub0)}; 0x669360 orig ${oc.call(0x669360, oclub0)} spil ${M.c.call(0x669360, gclub0)}`);
    for (const [nm2, mm, cc] of [['orig', om, oclub0], ['spil', gm, gclub0]] as const) { const n0 = mm.u32(cc + 0x53); let r = -1; for (let i = 0; i < 35; i++) if (mm.u32(0xb63d60 + 0x48 * i) === n0) r = i; console.log(`${nm2} række ${r}: ${r >= 0 ? Array.from({ length: 0x48 }, (_, i) => mm.u8(0xb63d60 + 0x48 * r + i).toString(16).padStart(2, '0')).join('') : ''}`); }
    console.log(`mål-omdømme orig ${trep(om, oclub0)} spil ${trep(gm, gclub0)}`);
    const ok = getContract(om, ost), gk = M.W.contractOf(p);
    console.log(`kontrakt orig ${hx(om, ok, 0x50)}\n      spil ${hx(gm, gk, 0x50)} (getContract ${getContract(gm, gst) === gk})`);
  }
  WANT_DEBUG.f = want ? (adr, v, a) => console.log(`  spil 0x${adr.toString(16)}(${a.map((x) => (x >>> 0).toString(16)).join(",")}) = ${v}`) : undefined;
  const t = cmAiTerms(g, p, home, { mem: M, desired: true })!;
  cur = 1;
  for (let q = 0; q < 0x50; q++) om.w8(L + q, 0);
  setToDesiredContract_85fc50(oc, L, ost, om.u32(ost + 0x39), -1, 0xff, 0xb, 0, 0);
  const ow = om.s32(L + 0xc);
  dbg = false;
  if (want) {
    TRACE.on = false;
    const keyOf = (x: string) => (process.env.STRICT ? x.split(' ').filter((y) => !y.startsWith('ecx') && !y.startsWith('eax')).join(' ') : x.split(' ')[0]);
    let i = 0; while (i < tr[0].length && i < tr[1].length && keyOf(tr[0][i]) === keyOf(tr[1][i])) i++;
    console.log(`spor ${tr[0].length}/${tr[1].length}, første afvigelse ved ${i}:`);
    for (let j = Math.max(0, i - 12); j < i + 3; j++) console.log(`  spil ${tr[0][j]}  |  orig ${tr[1][j]}`);
  }
  const isBad = Math.abs(ow - t.raw.wage) > Math.max(1, ow * 0.02);
  n++; if (isBad) bad++;
  if (isBad && process.env.LIST && bad <= 40) console.log(`  ${p.first} ${p.last} (${g.clubs[home].name}, CA ${p.ca}, ${g.leagues[g.clubs[home].league]?.tier}): £${t.raw.wage} mod £${ow}; år ${t.expires} mod ${om.u16(L + 0x2f)}:${om.s16(L + 0x2d)}; værdi ${t.raw.value} mod ${oc.call(0x4d0c60, ost, om.u32(ost + 0x39), 1, -1, 0)}`);
  for (const [kind, a, b, sz] of pairs) {
    if (!a || !b) { const k = `${kind}:mangler${!a ? 'O' : ''}${!b ? 'G' : ''}`; diffAll.set(k, (diffAll.get(k) ?? 0) + 1); if (isBad) diffBad.set(k, (diffBad.get(k) ?? 0) + 1); continue; }
    for (let o = 0; o < sz; o++) {
      if (skip(kind, o)) continue;
      if (om.u8(a + o) !== gm.u8(b + o)) {
        const k = `${kind}+${o.toString(16)}`;
        if (SHOW.has(k) && (shown.get(k) ?? 0) < 6) { shown.set(k, (shown.get(k) ?? 0) + 1); console.log(`${k} ${p.first} ${p.last}: orig ${[0, 1, 2, 3].map((i) => om.u8(a + o + i).toString(16).padStart(2, '0')).join('')} spil ${[0, 1, 2, 3].map((i) => gm.u8(b + o + i).toString(16).padStart(2, '0')).join('')}`); }
        diffAll.set(k, (diffAll.get(k) ?? 0) + 1);
        if (isBad) diffBad.set(k, (diffBad.get(k) ?? 0) + 1);
      }
    }
  }
}
console.log(`parret ${n}, ønskeløn afviger (> 2 %) ${bad}`);
const top = [...diffAll].sort((a, b) => b[1] - a[1]).slice(0, 120);
console.log(top.map(([k, v]) => `${k}:${v}/${diffBad.get(k) ?? 0}`).join('  '));
if (process.env.CHAIRS) {
  // formændenes +0x57/+0x59 (Ambition/Loyalty) i originalen mod spillets (cmFin.chair [2]/[3] = databasens)
  const rows: string[] = [];
  let zero = 0, same = 0, n2 = 0;
  for (let id = 0; id < om.s32(0xae235c); id++) {
    const oc0 = (om.u32(G.CLUBS) + 0x245 * id) >>> 0, ch = om.u32(oc0 + 0xbf);
    if (!ch || !om.u32(oc0 + 0x53) || om.s32(om.u32(oc0 + 0x53)) !== om.s32(0x9cf2e4)) continue;
    const gc0 = Object.values(g.clubs).find((c) => c.name === str(om, oc0 + 4));
    const f = gc0 && g.cmFin?.[gc0.id]?.chair;
    if (!f) continue;
    n2++;
    if (f[2] === 0) zero++;
    if (f[2] === om.s8(ch + 0x57) && f[3] === om.s8(ch + 0x59)) same++;
    if (rows.length < 30) rows.push(`${gc0!.name}: orig ${om.s8(ch + 0x57)}/${om.s8(ch + 0x59)} spil ${f[2]}/${f[3]}`);
  }
  console.log(`formænd ${n2}: spillets 0 ${zero}, ens ${same}\n${rows.join('\n')}`);
}
