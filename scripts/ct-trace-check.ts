// Kontraktens utilfredse skridt 0x4cb250 (cmPlayerData.ts unhappyCore) mod den instrumenterede original (match_trace.c RECOMP_CT_TRACE:
// "cv"-linjerne = rand inde i kaldet, "cu"-linjen = input og +0x44/+0x45 bagefter). Regner hvert kald igen af originalens input og tal.
//   npx tsx scripts/ct-trace-check.ts [spor]   (standard ~/cm0102-engine/oracle/runs/ct3.txt)
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { unhappyCore, type CmContract } from '../src/game/cmPlayerData';

const file = process.argv[2] || `${homedir()}/cm0102-engine/oracle/runs/ct3.txt`;
let rands: number[] = [];
let n = 0, ok44 = 0, ok45 = 0, flagCalls = 0, flagOk = 0;
const bad: string[] = [];
for await (const line of createInterface({ input: createReadStream(file, 'latin1'), crlfDelay: Infinity })) {
  if (line.startsWith('cv ')) { rands.push(+line.split(' ')[4]); continue; }
  if (!line.startsWith('cu ')) continue;
  const [a, b] = line.slice(3).split(' | ');
  const t = a.split(' ').map(Number);
  const [inj, loan, ret, place, season, b44a, b45a] = b.replace('=', '').split(/\s+/).filter(Boolean).map(Number);
  const c: CmContract = { b3d: t[13], b3e: t[12], b3f: 0, b44: t[14], b45: t[15] };
  const q = rands; rands = [];
  let k = 0;
  unhappyCore({ age: t[1], amb: t[2], loyalty: t[3], caps: t[4], repCur: t[5], repWorld: t[6], clubRep: t[7], nationRep: t[8], daysAt: t[9], daysContract: t[10],
    status: t[11], injury: inj, onLoan: !!loan, retiring: !!ret, b49: t[16], placement: place, inSeason: season === 1 }, c, () => q[k++] ?? 0);
  n++;
  if (c.b44 === b44a) ok44++;
  if (c.b45 === b45a) ok45++;
  if (b45a !== t[15]) { flagCalls++; if (c.b45 === b45a) flagOk++; }
  if ((c.b44 !== b44a || c.b45 !== b45a) && bad.length < 10) bad.push(`${line} → port ${c.b44} ${c.b45} rand ${q}`);
}
console.log(`0x4cb250: ${n} kald – +0x44 ens ${ok44}, +0x45 ens ${ok45}; kald der ændrede flagene ${flagCalls}, ens ${flagOk}`);
for (const x of bad) console.log(x);
