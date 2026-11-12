// 0x6e6340 (planScore.ts) og planlæggerens 0x6e2f20 (roleScore.ts med managerblokken 0x1000) mod den instrumenterede originals spor
// (RECOMP_PS_TRACE, ~/cm0102-engine/tools/match_trace.c): hvert P-/Q-kald regnes igen af konteksten (P-/Q-linjen) og opslagene (p-linjerne).
//   npx tsx scripts/ps-trace-check.ts [spor] [maks. kald]   (standard ~/cm0102-engine/oracle/runs/ps1.txt)
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { planScore, type ManagerBlockIn, type PlanInput } from '../src/game/engine/grid/planScore';
import { roleScore, type RoleInput } from '../src/game/engine/grid/roleScore';

interface Call { kind: 'P' | 'Q'; head: string[]; ctx: string[]; p: string[][]; result: number }

function hex(s: string): number[] { return s === '-' ? [] : s.match(/../g)!.map((x) => parseInt(x, 16)); }

function common(c: Call) {
  // det første spor (ps1) havde en %d for meget før L10/L18 (arm64-varargs: L10 tabt) – dér bruges 6,8
  const old = c.ctx.length === 43;
  const x = old ? [...c.ctx.slice(0, 38), '0', '0', ...c.ctx.slice(41)] : c.ctx;
  const n = (k: number) => +x[k];
  const q = (fn: number) => c.p.filter((t) => +t[1] === fn);
  const take = (fn: number) => { const l = q(fn); let k = 0; return () => l[k++]; };
  const p7 = q(7)[0], p9 = q(9)[0], p1 = q(1)[0];
  const nextAvg = take(5), nextJudge = take(10), nextLoad = take(2), nextInj = take(3), nextForm = take(4), next8 = take(8), next6 = take(6);
  const np = hex(x[40]);
  const L = n(39) ? n(38) / n(39) : 6.8;
  const mgr: ManagerBlockIn = { np: np.length ? np : null, j59: n(27), b59: n(22), b5b: n(23), rel: { d30: n(28) !== 0, d60: n(29) !== 0, m840: n(30) !== 0, m810: n(31) !== 0 } };
  return {
    n, rec: hex(x[41]), mgr, L, p7, p9, p1, nextAvg, nextJudge, nextLoad, nextInj, nextForm, next8, next6,
    today: { day: n(7), year: n(8) }, joined: { day: n(5), year: n(6) }, mgrJoined: n(26) ? { day: n(24), year: n(25) } : null,
  };
}

/** arg4/arg6 ≠ 0: nye spor skriver −1 uden klub; det første (ps1, 43 felter) skrev 0 – dér afgør klubbens land (klub 0 findes) */
const hasClubOf = (c: Call, club: number) => (c.ctx.length === 43 ? club !== 0 || c.ctx[14] === '1' : club !== -1);

function planInputOf(c: Call): PlanInput {
  const h = c.head, k = common(c), n = k.n, club = +h[5];
  return {
    id: n(0), real: n(9) === 1, age: n(1), joined: k.joined, rec: k.rec, pos: parseInt(h[3], 16), flags: parseInt(h[4], 16), thr: +h[6],
    hasClub: hasClubOf(c, club), atClub: n(2) === 1, stHasClub: n(3) === 1, sameNationClub: n(4) === 1, mgrJoined: k.mgrJoined, today: k.today,
    yearAgo: k.p7 ? { day: +k.p7[3], year: +k.p7[4] } : { day: 0, year: 0 },
    nationRep: n(10), british: n(11) === 0xe, caps: n(20), b56: n(21), langDiff: n(14) === 1 && n(15) !== n(12), lang: n(33), nationOfClub: n(17) === 1,
    clubRep: n(18), stClubRep: n(19), listed: n(32) !== 0, daysNoClub: n(34), league69: n(35) === -99999 ? null : n(35), mgr: k.mgr,
    data: {
      contract: k.p1 && k.p1[3] === '1' ? { b44: +k.p1[4], b45: +k.p1[5], b4f: +k.p1[6], b3e: +k.p1[7], b3f: +k.p1[8], b3d: +k.p1[9] } : null,
      condition: n(36), load: () => +(k.nextLoad()?.[3] ?? 0),
      injury: () => { const x = k.nextInj(); return x && x[3] === '1' ? { w28: +x[4], w2c: +x[5] } : null; },
      form: () => +(k.nextForm()?.[3] ?? 0), repSeen: +(k.p9?.[3] ?? 0), judge: () => +(k.nextJudge()?.[6] ?? 0),
      contractClubIsOwn: () => +(k.next8()?.[3] ?? 0) === club, avg: () => +(k.nextAvg()?.[7] ?? 6.5), leagueAvg: k.L,
      history: () => { const x = k.next6(); return x && x[3] === '1' ? { w4: +x[4], w6: +x[5], ok: n(37) !== 0 } : null; },
    },
  };
}

function roleInputOf(c: Call): RoleInput {
  const h = c.head, k = common(c), n = k.n, club = +h[5];
  // Q <ret> <staff> <pos> <flags> <club> <team?> <manager> <thr> <lo> <hi> <tb> <tf> <att> <list?> <cap> <sp1> <sp2> <sp3> <J>
  const id = n(0);
  return {
    id, age: n(1), atClub: n(2) === 1, joined: k.joined, realPlayer: n(9) === 1, rec: k.rec,
    pos: parseInt(h[3], 16), att: parseInt(h[13], 16), lo: parseInt(h[9], 16), hi: parseInt(h[10], 16), tb: parseInt(h[11], 16), tf: parseInt(h[12], 16),
    flags: parseInt(h[4], 16), mgrJoined: k.mgrJoined, today: k.today, yearAgo: k.p7 ? { day: +k.p7[3], year: +k.p7[4] } : { day: 0, year: 0 },
    captain: +h[15] === id, setPiece: +h[16] === id ? 1 : +h[17] === id ? 2 : +h[18] === id ? 3 : 0,
    nationRep: n(10), nationOfClub: n(17) === 1, nationFlag11c: n(16) !== 0, mgrBlock: k.mgr, hasClub: hasClubOf(c, club),
    data: {
      contract: k.p1 && k.p1[3] === '1' ? { b44: +k.p1[4], b45: +k.p1[5], b4f: +k.p1[6], b3e: +k.p1[7], b3f: +k.p1[8] } : null,
      condition: n(36), load: () => +(k.nextLoad()?.[3] ?? 0),
      injury: () => { const x = k.nextInj(); return x && x[3] === '1' ? { w28: +x[4] } : null; },
      form: () => +(k.nextForm()?.[3] ?? 0), repSeen: +(k.p9?.[3] ?? 0), judge: () => +(k.nextJudge()?.[6] ?? 0),
      contractClubIsOwn: () => +(k.next8()?.[3] ?? 0) === club, avg: () => +(k.nextAvg()?.[7] ?? 6.5), leagueAvg: k.L,
      sameNation: n(3) === 1 && n(4) === 1,
      history: () => { const x = k.next6(); return x && x[3] === '1' ? { w4: +x[4], w6: +x[5], ok: n(37) !== 0 } : null; },
    },
  };
}

export async function checkPs(file: string, max = Infinity) {
  const rl = createInterface({ input: createReadStream(file, 'latin1'), crlfDelay: Infinity });
  let cur: Call | null = null;
  const st = { P: { n: 0, ok: 0 }, Q: { n: 0, ok: 0 } };
  const bad = { P: new Map<string, number>(), Q: new Map<string, number>() };
  const ex: string[] = [];
  for await (const line of rl) {
    const t = line.split(' ');
    if (t[0] === 'P' || t[0] === 'Q') {
      const bar = t.indexOf('|');
      cur = { kind: t[0], head: t.slice(0, bar), ctx: t.slice(bar + 1).filter((v) => v !== ''), p: [], result: 0 };
    } else if (t[0] === 'p' && cur) cur.p.push(t);
    else if ((t[0] === 'P=' || t[0] === 'Q=') && cur) {
      cur.result = +t[1];
      const c = cur; cur = null;
      const s = st[c.kind];
      if (s.n >= max) continue;
      s.n++;
      const v = c.kind === 'P' ? planScore(planInputOf(c)) : roleScore(roleInputOf(c));
      if (v === c.result) s.ok++;
      else {
        const key = `${c.head[1]} ${c.head[4]}`;
        bad[c.kind].set(key, (bad[c.kind].get(key) ?? 0) + 1);
        if (ex.length < 16) ex.push(`${c.kind} ${c.head.slice(1).join(' ')} : port ${v} orig ${c.result} | ${c.p.map((x) => x.slice(1).join(',')).join(' ')}`);
      }
    }
  }
  return { st, bad, ex };
}

if (process.argv[1]?.endsWith('ps-trace-check.ts')) {
  const r = await checkPs(process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/ps1.txt`, +(process.argv[3] ?? Infinity));
  console.log(`0x6e6340: ${r.st.P.ok}/${r.st.P.n} ens; planlæggerens 0x6e2f20: ${r.st.Q.ok}/${r.st.Q.n} ens`);
  console.log('P afvigelser (kalder flag):', [...r.bad.P].slice(0, 20));
  console.log('Q afvigelser (kalder flag):', [...r.bad.Q].slice(0, 20));
  for (const e of r.ex) console.log(e);
}
