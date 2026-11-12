// Computerens trupplan 0x83cb40 (src/game/cmSquadPlan.ts) mod den instrumenterede originals spor (match_trace.c RECOMP_SQ_TRACE):
// hvert kald genspilles med originalens egne input (SA/SP-linjerne), dens 0x6e6340-værdier (SV), 0x6e86d0 (SJ), rand (SR), 0x7bca90 (SB) og
// fordelingen 0x6e2000 (pladsernes indehavere +0x13 efter kaldet, SZ) – samme trupstatus, lejeliste, transferliste og +0x3d/+0x3e/+0x3f bagefter (SQ)?
//   npx tsx scripts/sq-trace-check.ts [spor] [maks kald]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { newPlanEntry, planSquad, type PlanContract, type PlanEntry, type PlanPlayer, type PlanSlot } from '../src/game/cmSquadPlan';

interface Call { sa: string[]; slotsBefore: string[]; sp: string[][]; ev: string[][]; sq: Map<number, number[]>; sz: string[]; slotsAfter: string[] }
export function readCalls(file: string, max = Infinity): Call[] {
  const out: Call[] = [];
  let cur: Call | null = null;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const tag = line.slice(0, 2);
    if (tag === 'SA') {
      if (out.length >= max) break;
      const [h, sl] = line.split(' | ');
      cur = { sa: h.split(' '), slotsBefore: (sl ?? '').trim().split(' ').filter(Boolean), sp: [], ev: [], sq: new Map(), sz: [], slotsAfter: [] };
      out.push(cur);
    } else if (!cur) continue;
    else if (tag === 'SP') cur.sp.push(line.split(' | ').map((x) => x.trim()));
    else if (tag === 'SV' || tag === 'SJ' || tag === 'SR' || tag === 'SB') cur.ev.push(line.split(' '));
    else if (tag === 'SQ') { const t = line.split(' ').map(Number); cur.sq.set(t[1], t.slice(2)); }
    else if (tag === 'SZ') { const [h, sl] = line.split(' | '); cur.sz = h.split(' '); cur.slotsAfter = (sl ?? '').trim().split(' ').filter(Boolean); }
  }
  return out;
}
const hexb = (h: string) => Array.from({ length: h.length / 2 }, (_, i) => parseInt(h.slice(2 * i, 2 * i + 2), 16));
const s8 = (v: number) => (v << 24) >> 24;
function slotOf(t: string): PlanSlot {
  const [role, mask, b24, f, s13, s17, idx, , , , day, year] = t.split(':');
  return { role: +role, mask: parseInt(mask, 16), b24: parseInt(b24, 16), f: +f, s13: +s13, s17: +s17, idx: +idx, day: +day, year: +year };
}
function contractOf(h: string): PlanContract | null {
  if (h === '-' || !h) return null;
  const b = hexb(h), w = (o: number) => ((b[o] | (b[o + 1] << 8)) << 16) >> 16, d = (o: number) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24);
  return { b3d: s8(b[0x3d]), b3e: s8(b[0x3e]), b3f: s8(b[0x3f]), b45: d(0x45) >>> 0, b49: b[0x49], b4e: b[0x4e], b4f: b[0x4f], b35: b[0x35],
    endDay: w(0x2d), endYear: (b[0x2f] | (b[0x30] << 8)), wage: d(0xc) };
}

export function checkCalls(file: string, max = Infinity) {
  const calls = readCalls(file, max);
  const entries = new Map<number, PlanEntry>();
  let lenMiss = 0, n = 0, ran = 0, okStatus = 0, totStatus = 0, ok4e = 0, ok3d = 0, okCalls = 0, evMiss = 0;
  const bad: string[] = [];
  for (const c of calls) {
    const sa = c.sa;
    const [day, year] = sa[1].split(':').map(Number);
    const club = +sa[2], a3 = +sa[3], a4 = +sa[4];
    n++;
    // pladserne før kaldet (planlæggerens egen tilstand) – genbrug vores, når vi har dem, ellers sporets
    let e = entries.get(club);
    if (!e) { e = newPlanEntry(); e.slots = c.slotsBefore.map(slotOf); e.state = +sa[5]; e.form = +sa[6]; e.counter = +sa[7]; entries.set(club, e); }
    else { e.slots = c.slotsBefore.map(slotOf); e.state = +sa[5]; e.form = +sa[6]; }
    const squad: PlanPlayer[] = c.sp.map(([h, ch, rh]) => {
      const t = h.split(' ');
      const [jd, jy] = t[9].split(':').map(Number);
      return { id: +t[1], generated: false, job: +t[2], age: +t[3], clubId: +t[4] === 4294967295 ? -1 : +t[4], b5a: +t[5], b5b: +t[6], value: +t[8],
        joinedDay: jd, joinedYear: jy, rec: hexb(rh), contract: contractOf(ch), injW2c: +t[11] === -999 ? null : +t[11], recurring: +t[12], retiring: +t[13] === 1,
        loan: +t[14] === 1, inTransfer: +t[15] !== 0, bid: +t[16] !== 0, deal1: +t[18] !== 0, deal2: +t[19] !== 0, fatigue: t[20] !== undefined ? +t[20] : 0 };
    });
    const byId = new Map(squad.map((p) => [p.id, p]));
    // fordelingen fra sporet: indehaverne (+0x13) pr. plads efter kaldet, gruppevis i pladsrækkefølge
    const after = c.slotsAfter.map(slotOf);
    // pladser, gennemgangen springer over (et fremtidigt mål +0xf eller +0x17 ≠ −1), beholder den gamle indehaver – de er ikke med i fordelingen
    const skipped = new Set(c.slotsBefore.map(slotOf).filter((s) => s.f > -1 && (s.s17 !== -1 || !(s.year < year || (s.year === year && s.day < day)))).map((s) => s.idx));
    const occ = (g: (x: number) => boolean) => after.filter((s) => s.role === 0xb && !skipped.has(s.idx) && g((s.b24 >> 1) & 0xf)).map((s) => s.s13);
    const want = { A: occ((x) => x === 2 || x === 3), B: occ((x) => x === 4), C: occ((x) => x === 5) };
    let ei = 0;
    const dbg = process.env.SQ_DEBUG === String(n);
    if (dbg) console.log(c.ev.map((x) => x.join(' ')).join('\n'));
    const next = (tag: string) => { while (ei < c.ev.length && c.ev[ei][0] !== tag) ei++; const r = ei < c.ev.length ? c.ev[ei++] : null; return r; };
    const T = c.ev.find((x) => x[0] === 'SB');
    const mgr = +sa[19];
    const res = planSquad(e, {
      clubId: club, daily: a3 === 1, first: a4 === 1, rep: +sa[8], status: +sa[10], national: false, hasNation: +sa[12] !== -1,
      activeLeague: !c.ev.some((x) => x[0] === 'SR' && x[2] === '83cca4'), human1: +sa[13] !== 0, human2: +sa[14] !== 0, humanSettings: +sa[13] === 0 && +sa[14] !== 0,   // [esp+0x30] = 0x5fd210(…) – ikke i sporet; ved spilstart er den 0 i kaldet lige efter overtagelsen (P1 = 1)
      bTeam: +sa[16] !== -1 && +sa[17] !== 0 && +sa[17] !== -559038737, partnerIsParent: +sa[16] !== -1 && +sa[17] === 0,
      x18: (+sa[9] > -1 && (+sa[9] !== 330 || +sa[8] < 5000)) || +sa[18] > -1, managerId: mgr === 4294967295 ? null : mgr, managerForm: +c.sz[2] || 0, managerJoinedDay: 0, managerJoinedYear: 1900,
      T: T ? +T[4] : 0, R: T ? +T[2] : 0, daysSinceStart: +sa[20], today: { day, year }, squad,
    }, {
      rand: (k) => { if (dbg) console.log('> SR', k); const r = next('SR'); if (!r || +r[1] !== k) evMiss++; return r ? +r[4] : 0; },
      value: (p, mask, flags) => { if (dbg) console.log('> SV', p.id, mask.toString(16), flags.toString(16)); const r = next('SV'); if (!r || +r[2] !== p.id || ((+r[3]) & 0xffff) !== (mask & 0xffff) || parseInt(r[4], 16) !== flags) evMiss++; return r ? +r[9] : 0; },
      role: () => 0,
      judge: (p, kind, hint) => { if (dbg) console.log('> SJ', p.id, kind, hint); const r = next('SJ'); if (!r || +r[3] !== kind || +r[4] !== hint) evMiss++; return r ? +r[6] : 0; },
      promote: () => {}, demote: () => {}, transferList: () => {}, release: () => {}, unhappy: () => {}, leaguePos: () => +sa[21],
      assign: (masks, flags) => {
        const g = (flags & 0x1c0) === 0x1c0 ? want.B : flags & 0x40 ? want.A : want.C;
        if (g.length !== masks.length) { lenMiss++; if (dbg) console.log('længde', flags.toString(16), masks.length, g.length); }
        return masks.map((_, j) => byId.get(g[j]) ?? null);
      },
    });
    if (res.ran) ran++;
    if (dbg) console.log("groups", JSON.stringify(res.groups), "want", JSON.stringify(want));
    let callOk = true;
    for (const p of squad) {
      const w = c.sq.get(p.id); if (!w || !p.contract) continue;
      totStatus++;
      const st = p.contract.b4f >> 4, ws = w[0] >> 4;
      if (st === ws) okStatus++; else callOk = false;
      if ((p.contract.b4e & 3) === (w[1] & 3)) ok4e++; else callOk = false;
      if (s8(p.contract.b3d) === w[3] && s8(p.contract.b3e) === w[4] && s8(p.contract.b3f) === w[5]) ok3d++; else callOk = false;
      if (!callOk && bad.length < 12) bad.push(`#${n} ${sa[1]} klub ${club} a3 ${a3} a4 ${a4} p ${sa[13]}${sa[14]}: ${p.id} status ${st}/${ws} 4e ${p.contract.b4e & 3}/${w[1] & 3} 3d ${p.contract.b3d},${p.contract.b3e},${p.contract.b3f}/${w[3]},${w[4]},${w[5]}`);
    }
    if (callOk) okCalls++;
  }
  return { lenMiss, n, ran, okCalls, okStatus, totStatus, ok4e, ok3d, evMiss, bad };
}

if (process.argv[1]?.endsWith('sq-trace-check.ts')) {
  const r = checkCalls(process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/sq1.txt`, +(process.argv[3] ?? Infinity));
  console.log(`0x83cb40: ${r.n} kald (${r.ran} kørt) – alt ens ${r.okCalls}; trupstatus ${r.okStatus}/${r.totStatus}, +0x4e ${r.ok4e}, +0x3d/+0x3e/+0x3f ${r.ok3d}; afvigende opslag ${r.evMiss}, gruppelængder ${r.lenMiss}`);
  for (const b of r.bad) console.log(b);
}
