// Måling: hvad nyt spils trin-arbejdere sender til hinanden (newGameWorker.ts PhaseHandoff) – v8.serialize som stedfortræder for structured clone.
// Pr. overdragelse: spillet (med carry.ts' tilstand), ctx uden ønskelisternes tabeller, de Transferable tabeller; og spillets største felter.
// Brug: npx tsx scripts/handoff-size.ts [world-fil] [portioner=12]
import { readFileSync } from 'node:fs';
import { serialize } from 'node:v8';
import { createHash } from 'node:crypto';
import { createGameBase, createGamePhase, type NewGamePhase, type WorldData } from '../src/game/newgame';
import { gs, packCarry } from '../src/game/state';
import { slResumeTransfer } from '../src/game/cmShortlistGame';

const [file = 'public/data/world-original-normal.json', nS = '12'] = process.argv.slice(2);
const n = Number(nS);
const w = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const ctx = createGameBase(w, { managerName: 'M', managerNation: eng, clubId: w.clubs.find((c) => c[3] === eng)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const mb = (x: number) => (x / 1048576).toFixed(1);
const report = (label: string, top = false) => {
  const g = gs();
  packCarry(g);
  const carry = g.cmCarry; 
  const sl = ctx.sl ?? null;
  const tr = slResumeTransfer(sl).reduce((s, b) => s + b.byteLength, 0);
  const ctxNoSl = { ...ctx, sl: undefined };
  const gSize = serialize(g).length;
  console.log(`${label}: spil ${mb(gSize)} MB (heraf carry ${mb(serialize(carry ?? {}).length)}), ctx ${mb(serialize(ctxNoSl).length)} MB, sl uden tabeller ${mb(sl ? serialize({ ...sl, want: undefined, values: { ...sl.values, v: 0, skipped: 0, lazy: 0 } }).length : 0)} MB, Transferable ${mb(tr)} MB`);
  if (top) {
    const rows = Object.entries(g).map(([k, v]) => [k, serialize(v ?? null).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 14);
    console.log('  største felter: ' + rows.map(([k, s]) => `${k} ${mb(s)}`).join(', '));
    if (carry) console.log('  carry: ' + Object.entries(carry).map(([k, v]) => [k, serialize(v ?? null).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, s]) => `${k} ${mb(s)}`).join(', '));
  }
  delete g.cmCarry;
};
report('efter base', true);
createGamePhase('fitness', ctx); report('efter fitness');
createGamePhase('plan', ctx); report('efter plan', true);
let prev = '';
for (let k = 0; k < n; k++) {
  createGamePhase(`shortlists:${k}/${n}` as NewGamePhase, ctx);
  const g = gs();
  // hvilke af spillets felter ændrede sig i portionen (sha1 af det serialiserede felt)
  const sig = JSON.stringify(Object.fromEntries(Object.entries(g).map(([kk, v]) => [kk, createHash('sha1').update(serialize(v ?? null)).digest('hex')])));
  report(`portion ${k}`, k === 0);
  if (prev) {
    const a = JSON.parse(prev), b = JSON.parse(sig);
    const ch = Object.keys(b).filter((kk) => a[kk] !== b[kk]);
    console.log(`  ændrede felter: ${ch.join(', ') || '(ingen)'}`);
  }
  prev = sig;
}
