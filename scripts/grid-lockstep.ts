// Låsetrin mod originalen: npx tsx scripts/grid-lockstep.ts <spor> [kamp=0] [tik=alle]   (sporet fra match_trace.c med RECOMP_MATCH_TRACE_RAND=1)
// Viser, hvor langt porten følger originalen (tik, tilfældige tal), og ved første afvigelse originalens kaldsted, portens stak og forskellene.
// Findes <spor uden .txt>-aimode.txt (tools/aimode_trace.c fra samme kørsel), får 0x6df460 originalens indgange (spillets data).
import { readAiModeCalls, readMatch, runLockstep } from './lockstep';
const [file, k = '0', max] = process.argv.slice(2);
const tr = await readMatch(file, +k, max ? +max + 1 : Infinity);
const aimode = readAiModeCalls(file.replace(/\.txt(\.gz)?$/, '-aimode.txt'), tr.M[0], tr.M[1]);
const r = runLockstep(tr, { maxTicks: max ? +max : undefined, aimode });
console.log(`kamp ${k} (${tr.M.join(' ')}): ${r.ok ? 'ens' : 'afviger'} – ${r.ticks} tik, ${r.rands} tal${r.finished ? ', kampen slut' : ''}`);
if (!r.ok) {
  console.log(r.at);
  if (r.diff) console.log(r.diff.slice(0, 30).join('\n'));
  if (r.stack) console.log(r.stack.split('\n').slice(1, 14).join('\n'));
}
