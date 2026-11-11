// 0x6e2f20 (roleScore.ts) mod den instrumenterede originals pick_team-spor (RECOMP_PICK_TRACE, ~/cm0102-engine/tools/match_trace.c):
// hver G-linje regnes igen af spillerposten (g-linjen), holdet (S-linjen) og de opslag, originalen gjorde under kaldet (h-linjerne).
//   npx tsx scripts/pick-trace-eval.ts [spor] [antal G-linjer]   (standard ~/cm0102-engine/oracle/runs/pick2-pick.txt)
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { roleScore, type RoleData, type RoleInput } from '../src/game/engine/grid/roleScore';

export interface PickCall { phase: number; staff: number; pos: number; flags: number; lo: number; hi: number; tb: number; tf: number; att: number; score: number; h: string[][] }
export interface PickStaff { id: number; age: number; atClub: boolean; jday: number; jyear: number; cond: number; b22: number; b56: number; b59: number; b5b: number; rec: number[] }
export interface PickRecord {
  S: string[]; S2: string[]; S3: string[]; mode?: number; staff: Map<number, PickStaff>; order: number[]; calls: PickCall[]; tactic: number; q: string[][]; s: string[];
}
export function readPicks(file: string, max = Infinity): PickRecord[] {
  const out: PickRecord[] = [];
  let cur: PickRecord | null = null, h: string[][] = [];
  for (const line of readFileSync(file, 'latin1').split('\n')) {
    const t = line.split(' ');
    switch (t[0]) {
      case 'S': if (out.length >= max) return out; cur = { S: t, S2: [], S3: [], staff: new Map(), order: [], calls: [], tactic: -1, q: [], s: [] }; out.push(cur); h = []; break;
      case 'S2': if (cur) cur.S2 = t; break;
      case 'S3': if (cur) cur.S3 = t; break;
      case 'g': if (cur && t[1] !== '0') {
        const rec = t[11].match(/../g)!.map((x) => parseInt(x, 16));
        const st = { id: +t[1], age: +t[2], atClub: t[3] === '1', jday: +t[4], jyear: +t[5], cond: +t[6], b22: +t[7], b56: +t[8], b59: +t[9], b5b: +t[10], rec };
        cur.staff.set(st.id, st); cur.order.push(st.id);
      } else if (cur) cur.order.push(0); break;
      case 'h': if (t[1] === '11') { if (cur) cur.mode = +t[3]; } else h.push(t); break;
      case 'G': if (cur) {
        const [, ph, id, pos, fl, lo, hi, tb, tf, att, , , , , sc] = t;
        cur.calls.push({ phase: +ph, staff: +id, pos: parseInt(pos, 16), flags: parseInt(fl, 16), lo: parseInt(lo, 16), hi: parseInt(hi, 16), tb: parseInt(tb, 16),
          tf: parseInt(tf, 16), att: parseInt(att, 16), score: +sc, h });
      } h = []; break;
      case 't': if (cur) cur.tactic = +t[1]; break;
      case 'q': if (cur) cur.q.push(t); break;
      case 's': if (cur) cur.s = t; break;
    }
  }
  return out;
}

/** RoleInput af sporet: opslagene i kaldets rækkefølge (h-linjerne) */
export function inputOf(pk: PickRecord, c: PickCall): RoleInput {
  const S = pk.S, st = pk.staff.get(c.staff)!;
  const q = (fn: number) => c.h.filter((x) => +x[1] === fn);
  const take = (fn: number) => { const l = q(fn); let k = 0; return () => l[k++]; };
  const h1 = q(1)[0], h7 = q(7)[0], h9 = q(9)[0];
  const nextAvg = take(5), nextJudge = take(10), nextLoad = take(2), nextInj = take(3), nextForm = take(4), next8 = take(8), next6 = take(6);
  const own = +S[1];
  const L = +S2(pk)[2] ? +S2(pk)[1] / +S2(pk)[2] : 6.8;
  const data: RoleData = {
    contract: h1 && h1[3] === '1' ? { b3e: +(h1[7] ?? 0), b3f: +(h1[8] ?? 0), b44: +h1[4], b45: +h1[5], b4f: +h1[6] } : null,
    condition: st.cond,
    load: () => +(nextLoad()?.[3] ?? 0),
    injury: () => { const x = nextInj(); return x && x[3] === '1' ? { w28: +x[4] } : null; },
    form: () => +(nextForm()?.[3] ?? 0),
    repSeen: +(h9?.[3] ?? 0),
    judge: () => +(nextJudge()?.[6] ?? 0),
    contractClubIsOwn: () => +(next8()?.[3] ?? 0) === own,
    avg: () => +(nextAvg()?.[7] ?? 6.5),
    leagueAvg: L,
    sameNation: false,
    history: () => { const x = next6(); return x && x[3] === '1' ? { w4: +x[4], w6: +x[5], ok: true } : null; },
  };
  return {
    id: st.id, age: st.age, atClub: st.atClub, realPlayer: st.id < 9000, nationFlag11c: true, joined: { day: st.jday, year: st.jyear }, rec: st.rec,
    pos: c.pos, att: c.att, lo: c.lo, hi: c.hi, tb: c.tb, tf: c.tf, flags: c.flags,
    mgrJoined: +S[17] ? { day: +S[18], year: +S[19] } : null, today: { day: +S[14], year: +S[15] },
    yearAgo: h7 ? { day: +h7[3], year: +h7[4] } : { day: 0, year: 0 },
    captain: +S[23] === st.id, setPiece: +S[24] === st.id ? 1 : +S[25] === st.id ? 2 : +S[26] === st.id ? 3 : 0, data,
  };
}
const S2 = (pk: PickRecord) => pk.S2;

if (process.argv[1]?.endsWith('pick-trace-eval.ts')) {
  const file = process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/pick2-pick.txt`;
  const picks = readPicks(file, +(process.argv[3] ?? 40));
  let ok = 0, n = 0;
  const bad = new Map<string, number>();
  const ex: string[] = [];
  for (const pk of picks) for (const c of pk.calls) {
    n++;
    const v = roleScore(inputOf(pk, c));
    if (v === c.score) ok++;
    else { const k = `${c.flags.toString(16)}`; bad.set(k, (bad.get(k) ?? 0) + 1); if (ex.length < 12) ex.push(`${c.staff} pos ${c.pos.toString(16)} fl ${c.flags.toString(16)} lo ${c.lo.toString(16)} tb ${c.tb} : port ${v} orig ${c.score} | ${c.h.map((x) => x.slice(1).join(',')).join(' ')}`); }
  }
  console.log(`0x6e2f20: ${ok}/${n} ens (${(100 * ok / n).toFixed(2)} %)`, [...bad]);
  for (const e of ex) console.log(e);
}
