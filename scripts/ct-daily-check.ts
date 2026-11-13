// Kontrol af CONTRACT_MANAGER::daily_update 0x4c7ac0 (src/game/cmContract.ts) mod originalen: porten kører på originalens hukommelse før dagen
// (pre-<dag>-<år>.bin), tilfældige tal og ikke-porterede kald afspilles af loggen (ct-replay.ts), og bagefter sammenlignes kontrakterne
// (80 bytes) og staff +0x52 (værdien) med hukommelsen efter dagen (post-…bin).
// Brug: npx tsx scripts/ct-daily-check.ts <snap-mappe> <dag> <år>   (RELAX=1: argumentafvigelser i kald tælles i stedet for at stoppe)
import { loadLog, loadSnap } from './ct-snap';
import { Replay, ReplayStop } from './ct-replay';
import { G } from '../src/game/cmMem';
import { contractDailyUpdate_4c7ac0 } from '../src/game/cmContract';

const [dir, day, year] = process.argv.slice(2);
const pre = loadSnap(`${dir}/pre-${day}-${year}.bin`), post = loadSnap(`${dir}/post-${day}-${year}.bin`);
const log = loadLog(`${dir}/log-${day}-${year}.txt`);
const R = new Replay(loadSnap(`${dir}/pre-${day}-${year}.bin`), log);
if (process.env.RELAX) R.strictArgs = false;
const t0 = Date.now();
let stopped: string | null = null;
try { contractDailyUpdate_4c7ac0(R, log.datePtr, log.slice, log.flag); }
catch (e) { if (e instanceof ReplayStop) stopped = e.message + `\n  ${e.mm.stack}`; else throw e; }
const rands = log.rands.length;
console.log(`dag ${day}/${year}: ${R.randCount}/${rands} tilfældige tal og ${R.callCount} kald i samme rækkefølge (${Date.now() - t0} ms), argumentafvigelser ${R.argMismatch}`);
{
  const rest = new Map<string, number>();
  for (let i = R.pos; i < log.seq.length; i++) { const it = log.seq[i]; const k = it.k === 'R' ? `R@${log.rands[it.i].ret.toString(16)}` : `${it.k}${log.calls[it.i].adr.toString(16)}@${log.calls[it.i].ret.toString(16)}`; rest.set(k, (rest.get(k) ?? 0) + 1); }
  if (rest.size) console.log('rest af loggen (pos ' + R.pos + '/' + log.seq.length + '): ' + [...rest].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k}×${n}`).join(' '));
}
for (const adr of [0x864550, 0x85fc50]) {
  const want = log.calls.filter((x) => !x.pre && x.adr === adr && (adr !== 0x864550 || [0x860315, 0x8604ad, 0x860528].includes(x.ret))).map((x) => (adr === 0x864550 ? Math.fround(x.st0!) : x.eax! | 0));
  const got = R.probes.filter((x) => x.adr === adr).map((x) => (adr === 0x864550 ? Math.fround(x.v) : x.v | 0));
  let eq = 0, first = -1;
  for (let i = 0; i < Math.min(want.length, got.length); i++) { if (want[i] === got[i] || (adr === 0x864550 && Math.abs(want[i] - got[i]) <= 1e-6 * Math.abs(want[i]))) eq++; else if (first < 0) first = i; }
  console.log(`${adr.toString(16)}: ${eq}/${want.length} resultater ens (porten ${got.length})` + (first >= 0 ? `, første afvigelse #${first}: originalen ${want[first]}, porten ${got[first]}` : ''));
}
if (stopped) {
  console.log('STOP: ' + stopped);
  const s = Math.max(0, R.pos - 4);
  for (let i = s; i < Math.min(log.seq.length, R.pos + 4); i++) {
    const it = log.seq[i];
    console.log(`  ${i === R.pos ? '>' : ' '} ${it.k} ${it.k === 'R' ? `rand(${log.rands[it.i].n}) @${log.rands[it.i].ret.toString(16)} = ${log.rands[it.i].r}` : `${log.calls[it.i].adr.toString(16)} @${log.calls[it.i].ret.toString(16)}`}`);
  }
}
// hukommelsen bagefter: kontrakterne og +0x52
const n = pre.s32(G.STAFF_COUNT), staff = pre.u32(G.STAFF), rows = pre.u32(G.ROWS), cm = pre.u32(pre.u32(G.CM));
let changed = 0, same = 0, wrong = 0, vChanged = 0, vSame = 0;
const bad: string[] = [];
for (let id = 0; id < n; id++) {
  const ix = post.s32(rows + 79 * id);
  if (ix >= 0) {
    const a = cm + 80 * ix;
    let diffOrig = false, diffOurs = false;
    for (let k = 0; k < 80; k++) {
      const o = post.u8(a + k), b = pre.u8(a + k);
      if (o !== b) diffOrig = true;
      if (o !== b && false) diffOurs = true;
    }
    if (diffOrig) {
      changed++;
      let ok = true;
      for (let k = 0; k < 80; k++) if (post.u8(a + k) !== R.m.u8(a + k)) { ok = false; if (bad.length < 12) bad.push(`staff ${id} kontrakt +0x${k.toString(16)}: originalen ${post.u8(a + k)}, porten ${R.m.u8(a + k)}`); break; }
      if (ok) same++; else wrong++;
    }
  }
  const s = staff + 0x6e * id;
  if (post.s32(s + 0x52) !== pre.s32(s + 0x52)) { vChanged++; if (post.s32(s + 0x52) === R.m.s32(s + 0x52)) vSame++; }
}
console.log(`kontrakter ændret af originalen: ${changed}, porten ens ${same}, forskellige ${wrong}; værdien +0x52 ændret ${vChanged}, ens ${vSame}`);
if (bad.length) console.log(bad.join('\n'));
