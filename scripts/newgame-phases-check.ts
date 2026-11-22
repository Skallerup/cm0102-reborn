// Kontrol (22/11): spilstarten i trin – hvert trin i sin egen arbejder (ui/newGameWorker.ts, startGame.ts newGameStages) – giver bit for bit det
// samme spil som createGame i ét forløb: spillets sha efter oprettelsen og efter N dage (spillet fortsat i en frisk arbejder som hovedtråden).
// Brug: npx tsx scripts/newgame-phases-check.ts [world-fil] [land=England] [dage=2] [preview=0]
import { Worker } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { WorldData } from '../src/game/newgame';

const [file = 'public/data/world-original.json', nat = 'England', daysS = '2', previewS = '0'] = process.argv.slice(2);
const days = Number(daysS), preview = previewS === '1';
const w0 = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const act = [w0.nations.findIndex((x) => x.name === nat)];
const eng = w0.nations.findIndex((x) => x.name === 'England');
const clubId = w0.clubs.find((c) => c[3] === act[0])![0];
const opts = { managerName: 'Check', managerNation: eng, clubId, activeNations: act, lang: 'en' as const, masking: true, seed: 1, mode: 'authentic' as const, ...(preview ? { preview: true } : {}) };
const sha = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const url = new URL('./lib/ng-phase-worker.ts', import.meta.url);
function run(data: object, msg: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = new Worker(url, { workerData: data, execArgv: ['--import', 'tsx'] });
    w.once('message', (m) => { resolve(m); void w.terminate(); });
    w.once('error', reject);
    w.postMessage(msg);
  });
}
const shaGame = (g: any) => { const { cmCarry, ...rest } = g; return `${sha({ ...rest, id: 0 })}/${sha(cmCarry ?? null)}`; };
// (g.id = tidsstemplet ved oprettelsen)
const noId = (g: any) => ({ ...g, id: 0 });

const all = await run({ kind: 'all', file, opts }, {});
const allSha = shaGame(all.game);
const allDays = (await run({ kind: 'continue', days }, { game: all.game })).days;
console.log(`ét forløb:  ${allSha}  ${allDays.join('  ')}`);

const stages: string[][] = preview ? [['base'], ['fitness'], ['plan', 'shortlists', 'rest']] : [['base'], ['fitness'], ['plan'], ['shortlists', 'rest']];
let h: any = {};
for (let i = 0; i < stages.length; i++) h = await run({ kind: 'phases', phases: stages[i], file: i === 0 ? file : undefined, opts, last: i === stages.length - 1 }, h);
const phSha = shaGame(h.game);
const phDays = (await run({ kind: 'continue', days }, { game: h.game })).days;
console.log(`i trin:     ${phSha}  ${phDays.join('  ')}`);
const ok = allSha === phSha && allDays.join() === phDays.join();
if (allSha !== phSha) {
  // de første forskelle (sti) mellem de to spil
  const diffs: string[] = [];
  const cmp = (a: any, b: any, path: string) => {
    if (diffs.length > 25) return;
    if (a === b) return;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) { diffs.push(`${path}: ${JSON.stringify(a)?.slice(0, 80)} ≠ ${JSON.stringify(b)?.slice(0, 80)}`); return; }
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.join() !== kb.join()) { const sa = new Set(ka), sb = new Set(kb); diffs.push(`${path}: nøgler kun ét forløb [${ka.filter((k) => !sb.has(k)).slice(0, 8)}] kun trin [${kb.filter((k) => !sa.has(k)).slice(0, 8)}]${ka.length === kb.length ? ' (rækkefølge)' : ''}`); }
    for (const k of ka) if (k in b) cmp(a[k], b[k], `${path}.${k}`);
  };
  cmp(noId(all.game), noId(h.game), 'g');
  console.log(diffs.join('\n'));
}
console.log(ok ? 'ENS' : 'FORSKEL');
process.exit(ok ? 0 : 1);
