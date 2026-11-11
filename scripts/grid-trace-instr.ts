// Sammenligner originalens instruktioner i hukommelsen (kampsporets I-linjer, ~/cm0102-engine/tools/match_trace.c) med .pct-forudindstillingernes
// værdier i presetTactics.ts. Kør: npx tsx scripts/grid-trace-instr.ts (kræver ~/cm0102-engine/oracle/runs/trace3.txt)
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { PRESET_TACTICS } from '../src/game/engine/grid/presetTactics';
import { presetTable } from '../src/game/engine/grid/tacticTable';
const lines = readFileSync(`${homedir()}/cm0102-engine/oracle/runs/trace3.txt`, 'utf8').split('\n');
const byTable = new Map<string, (typeof PRESET_TACTICS)[number]>();
for (const t of PRESET_TACTICS) byTable.set(Buffer.from(presetTable(t)).toString('hex'), t);
let side = -1, cur: (typeof PRESET_TACTICS)[number] | undefined, n = 0, lodiff = 0, hidiff = 0, tbdiff = 0, flagdiff = 0; const ex: string[] = [];
for (const l of lines) {
  if (l.startsWith('P ')) { const [, s, h] = l.split(' '); side = +s; cur = byTable.get(h); if (!cur && side === 1) { /* mirrored */ for (const t of PRESET_TACTICS) { const t0 = presetTable(t); const m = new Uint8Array(2376); for (let sl = 0; sl < 11; sl++) for (let a = 0; a < 2; a++) for (let bx = 0; bx < 9; bx++) for (let by = 0; by < 12; by++) { const c = t0[216 * sl + 108 * a + 12 * (8 - bx) + (11 - by)]; m[216 * sl + 108 * a + 12 * bx + by] = (8 - (c & 15)) | ((11 - (c >> 4)) << 4); } if (Buffer.from(m).toString('hex') === h) { cur = t; break; } } } continue; }
  if (!l.startsWith('I ') || !cur) continue;
  const f = l.split(' '); const flags = parseInt(f[2], 16);
  if (flags !== cur.flags) { flagdiff++; }
  for (let k = 0; k < 11; k++) {
    const [tb, lo, hi] = f[3 + k].split(':').map((x) => parseInt(x, 16)); n++;
    if (lo !== cur.lo[k] >>> 0) { lodiff++; if (ex.length < 8) ex.push(`${cur.name} slot ${k} lo orig ${lo.toString(16)} port ${(cur.lo[k] >>> 0).toString(16)}`); }
    if (hi !== cur.hi[k] >>> 0) { hidiff++; if (ex.length < 12) ex.push(`${cur.name} slot ${k} hi orig ${hi.toString(16)} port ${(cur.hi[k] >>> 0).toString(16)}`); }
    if (tb !== cur.tb[k]) tbdiff++;
  }
}
console.log({ slots: n, lodiff, hidiff, tbdiff, flagdiff }); console.log(ex.join('\n'));
