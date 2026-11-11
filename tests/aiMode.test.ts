// sub_6df460 (aiMode.ts) mod originalens egne kald: ~/cm0102-engine/oracle/runs/aimode1.txt (tools/aimode_trace.c – RT_WRAP af 0x6df460
// og dens kald 0x6e86d0/0x4a4850/0x54cdb0 i den instrumenterede original, seed 1, 40 dage, 3.9.60). Én linje "D" pr. kald med indgangene
// før kaldet og tilstand + r efter. De indlejrede linjer nedenfor kører altid; hele sporet kun, når filen findes.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { aiMode, perceivedAbility, type AiModeInput, type TableRow, type Side } from '../src/game/engine/grid/aiMode';

// aimode1: seed 1, 40 dage; aimode2: seed 2, 120 dage; aimode3: seed 3, 60 dage (med spillerne i Q-linjerne) (stimerne i tabelrækkerne og datoerne 0x54cdb0 når over 1)
const TRACES = ['aimode1', 'aimode2', 'aimode3'].map((n) => `${homedir()}/cm0102-engine/oracle/runs/${n}.txt`);

interface Call { input: AiModeInput; mode: number; r: number; line: string }

const pair = (s: string) => s.split(',').map(Number) as [number, number];
function row(s: string, d41: number, d55: number): TableRow | null {
  if (s === '-') return null;
  const [pos, c19, c2d, c41, c55] = s.split(':').map(Number);
  return { pos, c19, c2d, c41, c55, days41: d41 === -9999 ? 1e9 : d41, days55: d55 === -9999 ? 1e9 : d55 };
}

/** D side 8ea5 clock 8ed4 state g0 g1 c0 c1 repOwn,repOpp cnt0,cnt1 w1fc,w206,w210 sum0,sum1 n0,n1 fx30 fx4b,fx4c fx38 sameDiv c14
 *  c14==own57 comp comp3e compRep mgrAtt rivals judge ownMgr days55 days41 0 row0 row1 ca0,ca1 mode0 rOld mode rNew */
export function parseCall(line: string): Call {
  const f = line.trim().split(/\s+/);
  const n = (k: number) => Number(f[k]);
  const side = n(1) as Side, inMatch = n(2) === 1;
  const [repOwn, repOpp] = pair(f[10]);
  const rep: [number, number] = side === 0 ? [repOwn, repOpp] : [repOpp, repOwn];
  const sums = pair(f[13]);
  const strength: [number, number] = inMatch ? [Math.trunc(50 * sums[0] / 11), Math.trunc(50 * sums[1] / 11)] : rep;
  const [l0, l1] = pair(f[16]);
  const league = n(18) && n(19) && n(20) && n(21) === 2
    ? { teams: n(22), compRep: n(23), own: row(f[31], n(29), n(28)), opp: row(f[32], 1e9, 1e9) } : null;
  const input: AiModeInput = {
    side, inMatch, strength, rep,
    territory: f[12].split(',').map(Number) as [number, number, number],
    clock: n(3), periodEnd: n(4), goals: [n(6), n(7)], crowd: [n(8), n(9)],
    onPitch: pair(f[11]),
    fixtureKind: n(15), firstLeg: l0 === -1 ? null : [l0, l1], fixtureFlags: n(17),
    sameDivision: n(18) === 1, compLink: n(19) === 1, league,
    mgrAttacking: n(24) === -99 ? null : n(24), rivals: n(25) === 1,
    prevMode: n(34), prevR: n(35),
  };
  return { input, mode: n(36), r: n(37), line };
}

function replay(calls: Call[]) {
  let mode = 0, r = 0;
  const bad: string[] = [];
  for (const c of calls) {
    const out = aiMode(c.input);
    if (out.mode === c.mode) mode++;
    if (Math.abs(out.r - c.r) <= 5e-4 * Math.max(1, Math.abs(c.r))) r++;
    else if (bad.length < 10) bad.push(`${c.line}\n   → ${out.mode} ${out.r} (raw ${out.raw})`);
  }
  return { n: calls.length, mode, r, bad };
}

// et udsnit (første kamp i sporet med kald under kampen + et par ligakampe med tabelrækker)
const SAMPLE = `
D 0 1 0 495 8 0 0 0 5 7000,7000 11,11 0,0,0 1583,1563 11,11 33 -1,-1 0 1 1 0 2 60 8 10 0 1453 1453 -9999 -9999 0 - - 1583,1574 -1 -1000.0000 1 1.6515
D 1 1 0 495 8 0 0 0 5 7000,7000 11,11 0,0,0 1583,1574 11,11 33 -1,-1 0 1 1 0 2 60 8 17 0 5999 5999 -9999 -9999 0 - - 1583,1574 -1 -1000.0000 2 1.3198
D 0 1 23 495 6 0 0 0 5 7000,7000 11,11 0,8,3 1583,1563 11,11 33 -1,-1 0 1 1 0 2 60 8 10 0 1453 1453 -9999 -9999 0 - - 1583,1574 1 1.6515 1 1.6515
D 0 0 0 495 -47 0 0 0 0 500,5000 0,0 0,0,0 0,0 0,0 0 -1,-1 0 0 1 0 2 5 20 -99 0 -1 1923 -9999 -9999 0 - - 0,0 -1 -1000.0000 3 0.4345
D 1 0 0 495 -47 0 0 0 0 5000,500 11,0 0,0,0 0,0 0,0 0 -1,-1 0 0 1 0 2 5 20 13 0 6823 6823 -9999 -9999 0 - - 0,0 -1 -1000.0000 1 1.8900
`.trim().split('\n');

describe('sub_6df460 – computerens kamptilstand', () => {
  it('udsnittet af sporet', () => {
    const res = replay(SAMPLE.map(parseCall));
    expect(res.bad).toEqual([]);
    expect(res.mode).toBe(res.n);
  });
});

for (const TRACE of TRACES) describe.skipIf(!existsSync(TRACE))(`sub_6df460 mod hele sporet (${TRACE.split('/').pop()})`, () => {
  const calls = existsSync(TRACE) ? readFileSync(TRACE, 'utf8').split('\n').filter((l) => l.startsWith('D ')).map(parseCall) : [];
  it('r og tilstand pr. kald', () => {
    const all = replay(calls);
    const live = replay(calls.filter((c) => c.input.inMatch));
    const pre = replay(calls.filter((c) => !c.input.inMatch));
    const streak = replay(calls.filter((c) => c.input.league?.own && (c.input.league.own.c41 > 1 || c.input.league.own.c55 > 1)));
    console.log(`alle ${all.n}: tilstand ${(100 * all.mode / all.n).toFixed(2)} %, r ${(100 * all.r / all.n).toFixed(2)} %;` +
      ` under kampen ${live.n}: ${(100 * live.mode / live.n).toFixed(2)} % / ${(100 * live.r / live.n).toFixed(2)} %;` +
      ` før kampen ${pre.n}: ${(100 * pre.mode / pre.n).toFixed(2)} % / ${(100 * pre.r / pre.n).toFixed(2)} %;` +
      ` med stime ${streak.n}: ${streak.n ? (100 * streak.r / streak.n).toFixed(2) : '-'} %`);
    if (all.bad.length) console.log(all.bad.join('\n'));
    expect(all.mode / all.n).toBeGreaterThan(0.995);
    expect(all.r / all.n).toBeGreaterThan(0.995);
  });
});

// 0x6e86d0 (perceivedAbility): linjerne "Q side [0xdd7120] dommer-id v:CA:staff-id:rep(0x5407e0):JPA(0x544410, −99 = ikke kaldt) …" (aimode3)
const QTRACE = `${homedir()}/cm0102-engine/oracle/runs/aimode3.txt`;
describe.skipIf(!existsSync(QTRACE))('0x6e86d0 – den opfattede evne (aimode3)', () => {
  it('pr. spiller', () => {
    let n = 0, ok = 0;
    const bad: string[] = [];
    for (const l of readFileSync(QTRACE, 'utf8').split('\n')) {
      if (!l.startsWith('Q ')) continue;
      const f = l.split(' ');
      const glob = Number(f[2]), judge = Number(f[3]);
      for (const part of f.slice(4).join(' ').split(/ \| |;/)) {
        if (!part.includes(':')) continue;
        const [v, ca, id, rep, jpa] = part.split(':').map(Number);
        const seed = (id + glob + (judge === -1 ? 0 : judge)) | 0;
        // hver tiende (seed % 10 == 0) kalder ikke 0x544410 – dommeren har stadig en ikke-spillerpost, værdien bruges ikke
        const j = jpa !== -99 ? jpa : judge !== -1 && seed % 10 === 0 ? 10 : null;
        const got = perceivedAbility({ seed, ca, rep, jpa: j });
        n++; if (got === v) ok++; else if (bad.length < 8) bad.push(`${part} judge ${judge} → ${got}`);
      }
    }
    console.log(`0x6e86d0: ${n} spillere, ${(100 * ok / n).toFixed(2)} % ens`);
    if (bad.length) console.log(bad.join('\n'));
    expect(ok / n).toBeGreaterThan(0.995);
  });
});
