// Kontrol af originalens udvikling (cmDevelop.ts developCore + cmTraining.ts normaliseRec) og træning (trainCore) mod den instrumenterede
// original: match_trace.c RECOMP_DV_TRACE (D0/Dh/Dr/D1/D2 og T0/Ts/Tc/Tr/T1). Hver udvikling/træning køres med originalens input og tal.
//   npx tsx scripts/dv-trace-check.ts ~/cm0102-engine/oracle/runs/dv1.txt [world-fil] [antal fejl der vises]
import { readFileSync } from 'node:fs';
import { developCore, type DevClub, type DevCoach, type DevPers } from '../src/game/cmDevelop';
import { normaliseRec, trainCore, type CmRec, type CmTrainEntry } from '../src/game/cmTraining';


const hex = (h: string) => Uint8Array.from(h.match(/../g)!.map((x) => parseInt(x, 16)));
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (u: Uint8Array, o: number) => ((u[o] | (u[o + 1] << 8)) << 16) >> 16;
function rec(h: string): CmRec {
  const u = hex(h), b = new Array(0x46).fill(0);
  for (let o = 0x0f; o < 0x46; o++) b[o] = s8(u[o]);
  return { ca: s16(u, 5), pa: s16(u, 7), rep: [s16(u, 9), s16(u, 0xb), s16(u, 0xd)], b };
}
function entry(h: string): CmTrainEntry { const u = hex(h); return { s: s8(u[0]), w: u[1] | (u[2] << 8), b3: u[3], b4: u[4], b5: u[5] }; }
function coach(t: string): DevCoach | null {
  if (t === '-') return null;
  const u = hex(t.split(':')[1]);
  return { ca: s16(u, 4), b10: s8(u[0x10]), b11: s8(u[0x11]), b14: s8(u[0x14]), b19: s8(u[0x19]), b1b: s8(u[0x1b]), b22: s8(u[0x22]) };
}
function diffRec(a: CmRec, b: CmRec): string[] {
  const out: string[] = [];
  if (a.ca !== b.ca) out.push(`CA ${a.ca}≠${b.ca}`);
  for (let k = 0; k < 3; k++) if (a.rep[k] !== b.rep[k]) out.push(`rep${k} ${a.rep[k]}≠${b.rep[k]}`);
  for (let o = 0x0f; o < 0x46; o++) if (a.b[o] !== b.b[o]) out.push(`+${o.toString(16)} ${a.b[o]}≠${b.b[o]}`);
  return out;
}
const pers = (u: Uint8Array, base: number): DevPers => ({ amb: s8(u[0x57 - base]), det: s8(u[0x58 - base]), loy: s8(u[0x59 - base]), pres: s8(u[0x5a - base]),
  prof: s8(u[0x5b - base]), sport: s8(u[0x5c - base]), temp: s8(u[0x5d - base]) });

export interface DvResult { devN: number; devOk: number; devRand: number; devNormOk: number; trN: number; trOk: number; trRand: number; firstBad: Record<string, number> }
/** sporets udviklinger og træninger med originalens input og tal; `humanIds` = menneskets klubber (oraklet: Arsenal) */
export function checkDvTrace(text: string, humanIds: Set<number>, SHOW = 0, log: (s: string) => void = console.log): DvResult {
const lines = text.split('\n');
// menneskets klub: spillere med træningspostens +5 bit 0x20 (menneskets skema) → deres klub i udviklingens D0-linjer (originalens klub-id'er)
const humanStaff = new Set<number>();
for (let i = 0; i + 1 < lines.length; i++) if (lines[i].startsWith('T0 ') && lines[i + 1] !== undefined) {
  let j = i + 1; while (j < lines.length && !lines[j].startsWith('T1')) j++;
  if (lines[j] && entry(lines[j].split(' ')[1]).b5 & 0x20) humanStaff.add(+lines[i].split(' ')[4]);
}
humanIds = new Set(humanIds);
for (const L of lines) if (L.startsWith('D0 ')) { const t = L.split(' '); if (humanStaff.has(+t[3]) && +t[6] >= 0) humanIds.add(+t[6]); }
let devN = 0, devOk = 0, devNormOk = 0, devRand = 0, trN = 0, trOk = 0, trRand = 0, shown = 0;
const firstBad: Record<string, number> = {};
for (let i = 0; i < lines.length; i++) {
  const L = lines[i];
  if (L.startsWith('D0 ')) {
    const t = L.split(' ');
    const id = +t[3], st = hex(t[4]), r = rec(t[5]);
    const clubId = +t[6];
    const club: DevClub | null = clubId < 0 ? null : {
      fac: +t[7], rep: +t[8], div: +t[9] === -9999 ? null : +t[9], human: humanIds.has(clubId),
      mgr22: coach(t[10])?.b22 ?? null, coaches: [coach(t[11]), coach(t[12]), coach(t[13]), coach(t[14]), coach(t[15]), coach(t[16])],
    };
    const e = t[17] === '-' ? null : entry(t[17]);
    const mean = +t[19];
    const rands: [number, number, string][] = []; let fat = 0; let inj: number | null = null; const stats: number[] = [];
    let j = i + 1;
    for (; j < lines.length && !lines[j].startsWith('D1 '); j++) {
      const u = lines[j].split(' ');
      if (u[0] === 'Dr') rands.push([+u[1], +u[4], u[2]]);
      else if (u[0] === 'Dh' && u[1] === '2') fat = +u[3];
      else if (u[0] === 'Dh' && u[1] === '3' && u[2] === '5d4330') inj = +u[3] ? +u[5] : null;
      else if (u[0] === 'Dh' && u[1] === '5') stats.push(+u[5]);
      else if (u[0] === 'D0') break;
    }
    if (!lines[j]?.startsWith('D1 ')) continue;
    const d1 = lines[j].split(' '), d2 = lines[j + 1].split(' ');
    i = j + 1;
    devN++;
    let k = 0, bad = '';
    const rand = (n: number) => {
      const x = rands[k++];
      if (!x) { bad ||= `ran out at rand(${n})`; return 0; }
      if (x[0] !== n && !bad) bad = `rand #${k} n ${n}≠${x[0]} (orig ${x[2]})`;
      return x[1];
    };
    const P = pers(st, 0); const dbgs: string[] = [];
    developCore({ id, age: s8(st[0x18]), club, stats: [stats[0], stats[1], stats[2], stats[3]] as [number, number, number, number], mean, fatigue: fat,
      injury: inj, train0: e ? s8((e.b3 & 0xf) << 4) >> 4 : 0, dbg: process.env.DVDBG && shown < SHOW ? (k2, v) => dbgs.push(`${k2}=${+v.toFixed(4)}`) : undefined }, r, P, rand);
    if (!bad && k !== rands.length) bad = `used ${k}/${rands.length} rand`;
    if (!bad) devRand++;
    const want1 = rec(d1[2]), wp = pers(hex(d1[3]), 0x56);
    const df = diffRec(r, want1);
    for (const kk of Object.keys(P) as (keyof DevPers)[]) if (P[kk] !== wp[kk]) df.push(`${kk} ${P[kk]}≠${wp[kk]}`);
    if (!bad && !df.length) devOk++;
    else if (shown < SHOW) { shown++; log(`D ${id} age ${s8(st[0x18])} ${bad} | ${df.join(' ')} ${dbgs.join(' ')} | ${JSON.stringify(club)?.slice(0, 300)}`); }
    if (bad) firstBad[bad.replace(/\d+/g, '#')] = (firstBad[bad.replace(/\d+/g, '#')] ?? 0) + 1;
    // 0x538bc0 fra originalens D1-post
    const r2 = rec(d1[2]), e2 = d1[4] === '-' ? null : entry(d1[4]);
    normaliseRec(r2, e2);
    const want2 = rec(d2[1]);
    const dn = diffRec(r2, want2);
    if (!dn.length) devNormOk++;
    else if (shown < SHOW) { shown++; log(`N ${id} | ${dn.join(' ')}`); }
  } else if (L.startsWith('T0 ')) {
    const t = L.split(' ');
    const e = entry(t[7]), r = rec(t[8]), st = hex(t[9]);
    const week = +t[6];
    let levels: number[] = [0, 0, 0, 0, 0]; const coachV: number[] = []; const rands: [number, number][] = [];
    let j = i + 1;
    for (; j < lines.length && !lines[j].startsWith('T1'); j++) {
      const u = lines[j].split(' ');
      if (u[0] === 'Ts' && u[2]) levels = [...hex(u[2])].map(s8);
      else if (u[0] === 'Tc') coachV.push(+u[3]);
      else if (u[0] === 'Tr') rands.push([+u[1], +u[4]]);
    }
    const t1 = lines[j]?.split(' ');
    i = j;
    if (!t1) continue;
    trN++;
    let k = 0, bad = '';
    const rand = (n: number) => { const x = rands[k++]; if (!x) { bad ||= 'ran out'; return 0; } if (x[0] !== n && !bad) bad = `rand #${k} n ${n}≠${x[0]}`; return x[1]; };
    let ci = 0;
    trainCore(r, e, week, { levels, coach: () => coachV[ci++] ?? 100, prof: s8(st[0x5b - 0x56]), det: s8(st[0x58 - 0x56]), gk: r.b[0x0f], human: !!(entry(t1[1]).b5 & 0x20) }, rand);
    if (!bad && k !== rands.length) bad = `used ${k}/${rands.length}`;
    if (!bad) trRand++;
    const we = entry(t1[1]), wr = rec(t1[2]);
    const df = diffRec(r, wr);
    if (e.b3 !== we.b3 || e.b4 !== we.b4 || e.b5 !== we.b5 || e.w !== we.w) df.push(`entry ${JSON.stringify(e)}≠${JSON.stringify(we)}`);
    if (!bad && !df.length) trOk++;
    else if (shown < SHOW) { shown++; log(`T ${t[4]} ${bad} | ${df.join(' ')}`); }
  }
}
return { devN, devOk, devRand, devNormOk, trN, trOk, trRand, firstBad };
}

if (process.argv[1]?.endsWith('dv-trace-check.ts')) {
  const [file, worldFile = 'public/data/world-original.json', showArg = '8'] = process.argv.slice(2);
  const world = JSON.parse(readFileSync(worldFile, 'utf8'));
  const humans = new Set<number>((world.clubs as { id: number; name: string }[]).filter((c) => c.name === 'Arsenal').map((c) => c.id));
  const r = checkDvTrace(readFileSync(file, 'utf8'), humans, +showArg);
  console.log(`udvikling: ${r.devOk}/${r.devN} helt ens (tallene ${r.devRand}/${r.devN}), 0x538bc0 ${r.devNormOk}/${r.devN}; træning: ${r.trOk}/${r.trN} (tallene ${r.trRand}/${r.trN})`);
  if (Object.keys(r.firstBad).length) console.log(r.firstBad);
}
