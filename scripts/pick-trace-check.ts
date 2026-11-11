// pick_team 0x6dbc50 (pickTeam.ts: bænkpladserne, 0x6e2000 med bænken) mod den instrumenterede originals spor: med originalens egne
// 0x6e2f20-værdier (G-linjerne) og dens tilfældige tal (q-linjerne) – samme 11, samme bænk og samme rækkefølge?
//   npx tsx scripts/pick-trace-check.ts [spor] [antal]
import { homedir } from 'node:os';
import { readPicks, inputOf } from './pick-trace-eval';
import { roleScore } from '../src/game/engine/grid/roleScore';
import { AI_TACTIC_LIST } from '../src/game/engine/grid/aiTacticChoice';
import { assignSquad, benchSlots } from '../src/game/engine/grid/pickTeam';

export function checkPicks(file: string, max = Infinity, est = false) {
  const picks = readPicks(file, max);
  let same11 = 0, sameBench = 0, sameAll = 0, n = 0, miss = 0;
  const bad: string[] = [];
  for (const pk of picks) {
    const e = AI_TACTIC_LIST[pk.tactic]; if (!e || !pk.s.length) continue;
    n++;
    const F = parseInt(pk.S[6], 16), bench = +pk.S[12] & 0xf;
    const tf = pk.calls.find((c) => c.phase === 2)?.tf ?? 0;
    const qs = pk.q.filter((x) => x[2] === '6dd241' || x[2] === '6dd26d').map((x) => +x[4]);
    let qi = 0;
    const bpos = benchSlots(() => qs[qi++] ?? 0, bench);
    const key = (st: number, pos: number, fl: number, lo: number, tb: number, att: number) => `${st}|${pos}|${fl}|${lo >>> 0}|${tb}|${att}`;
    const tab = new Map<string, number>();
    for (const c of pk.calls) if (c.phase === 2) tab.set(key(c.staff, c.pos, c.flags, c.lo, c.tb, c.att), est ? estScore(pk, c) : c.score);
    // bænkpladsernes angrebsflag: 0 – undtagen plads 11, hvis ord aldrig skrives (stakkens gamle indhold, sic; 0x6dd252 skriver plads + 1)
    const att11 = pk.calls.find((c) => c.phase === 2 && c.flags & 0x200)?.att ?? 0;
    const cand = pk.order;
    const look = (k: string) => { const v = tab.get(k); if (v === undefined) { miss++; return -1e9; } return v; };
    const slot = (j: number) => j < 11 ? { pos: e.masks[j], lo: e.lo[j], tb: e.tb[j], att: e.masks2[j] } : { pos: bpos[j - 11], lo: 0, tb: 0, att: j === 11 ? att11 : 0 };
    const out = assignSquad(cand.length, 11, bench,
      (j, i) => { const s = slot(j); return look(key(cand[i], s.pos, F, s.lo, s.tb, s.att)); },
      (j, i) => look(key(cand[i], bpos[j], F | 0x200, e.lo[j], e.tb[j], slot(11 + j).att)),
      (i) => (pk.staff.get(cand[i])?.rec[0xf] ?? 0), (j) => (slot(j).pos & 1) === 1);
    const mine = out.map((i) => (i === null ? 0 : cand[i]));
    const orig: number[] = []; for (const t of pk.s.slice(7)) { const [idx, st] = t.split(':').map(Number); orig[idx] = st; }
    const a11 = mine.slice(0, 11).join(), o11 = orig.slice(0, 11).join(), ab = mine.slice(11).join(), ob = orig.slice(11, 11 + bench).join();
    if (a11 === o11) same11++;
    if (ab === ob) sameBench++;
    if (a11 === o11 && ab === ob) sameAll++;
    else if (bad.length < 6) bad.push(`${pk.S[1]} t${pk.tactic}: port ${mine.join(',')} | orig ${orig.slice(0, 11 + bench).join(',')} bænk ${bpos.map((x) => x.toString(16))}`);
  }
  return { n, same11, sameBench, sameAll, miss, bad };
}
/** 0x6e2f20 af originalens spillerpost, men med de opslag, vores spil ikke har, som aiTeam.ts' roleDataOf giver dem (*estimeret*): kontraktens
 *  +0x44/+0x45/+0x3e/+0x3f = 0, træningsbelastningen 0, ingen skade/historik, kampstatistikken = standardværdien */
export function estScore(pk: ReturnType<typeof readPicks>[number], c: ReturnType<typeof readPicks>[number]['calls'][number]): number {
  const inp = inputOf(pk, c), d = inp.data;
  const only = process.env.EST_ONLY, on = (k: string) => !only || only === k;
  inp.data = { ...d,
    contract: on('contract') ? (d.contract ? { b3e: 0, b3f: 0, b44: 0, b45: 0, b4f: d.contract.b4f } : null) : d.contract,
    load: on('load') ? () => 0 : d.load, injury: on('load') ? () => null : d.injury, history: on('hist') ? () => null : d.history,
    avg: on('avg') ? (_cat, _kind, def) => def : d.avg };
  return roleScore(inp);
}
if (process.argv[1]?.endsWith('pick-trace-check.ts')) {
  const r = checkPicks(process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/pick2-pick.txt`, +(process.argv[3] ?? 200));
  console.log(`pick_team: ${r.n} udtagelser – samme 11 ${r.same11}, samme bænk ${r.sameBench}, alt ens ${r.sameAll}; manglende værdier ${r.miss}`);
  for (const b of r.bad) console.log(b);
  const e = checkPicks(process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/pick2-pick.txt`, +(process.argv[3] ?? 200), true);
  console.log(`med vores *estimerede* opslag (kontrakt/belastning/skade/statistik): samme 11 ${e.same11}, samme bænk ${e.sameBench}, alt ens ${e.sameAll} af ${e.n}`);
}

/** 0x6e0230 med originalens egne 0x6e2f20-værdier (fase 1): vælges samme taktik? Tilstanden er ikke i sporet – de tilstande, der giver valget */
import { chooseAiTactic } from '../src/game/engine/grid/aiTacticChoice';
export function checkChoice(file: string, max = Infinity, modeOf?: (pk: ReturnType<typeof readPicks>[number]) => number | undefined) {
  const picks = readPicks(file, max);
  let n = 0, hit = 0, anyMode = 0;
  for (const pk of picks) {
    if (pk.tactic < 0) continue;
    n++;
    const tab = new Map<string, number>();
    for (const c of pk.calls) if (c.phase === 1) tab.set(`${c.staff}|${c.pos}`, c.score);
    const players = pk.order.filter((id) => id).map((id) => ({ ratings: [], b30: 0, b3b: 0, quality: 0, score: (m: number) => tab.get(`${id}|${m}`) ?? -10000 }));
    // S3: managerens +0xe Attacking, +0x15 Free Roles, +0x1a Marking, +0x1c Offside, +0x1f Pressing, +0x43 yndlingsformation; listens statistik
    const m3 = pk.S3.slice(1, 7).map(Number);
    const manager = m3.length === 6 && m3[0] !== -99 ? { attacking: m3[0], freeRoles: m3[1], marking: m3[2], offside: m3[3], pressing: m3[4], favourite: m3[5] } : null;
    const stats = pk.S3.slice(8).map((x) => { const [, g, a, b2, c] = x.split(':').map(Number); return { games: g, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0, perf: [a, b2, c] as [number, number, number] }; });
    const res = [1, 2, 3, 4, 5].map((mode) => chooseAiTactic({ players, mode, manager, stats: stats.length === 45 ? stats : undefined, divisor: Math.max(8 * +pk.S[3], 2000) }).index);
    if (res.includes(pk.tactic)) anyMode++;
    const m = modeOf?.(pk) ?? pk.mode; if (m !== undefined && res[m - 1] === pk.tactic) hit++;
    else if (process.env.CHOICE_DEBUG && n < 40) console.log('valg', pk.S[1], 'tilstand', m, 'orig', pk.tactic, 'port', res.join(','));
  }
  return { n, anyMode, hit };
}
