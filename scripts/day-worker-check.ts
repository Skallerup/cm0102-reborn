// Kontrol af dagens Web Worker (ui/dayRunner.ts): spillet sendes til arbejderen og tilbage som en struktureret kopi (postMessage) med
// indeksernes rækkefølge. Giver det præcis det samme som at spille videre i hovedtråden? Kør to gange og sammenlign sha1 pr. dag:
//   npx tsx scripts/day-worker-check.ts            (A: i ét stræk, som hovedtråden)
//   CLONE=1 npx tsx scripts/day-worker-check.ts    (B: kopi af spillet + indekserne før hver dag, som arbejderen)
// DAYS=n (standard 8), WORLD=fil. Udskriver også kopiens pris (serialize/deserialize = postMessage's to halvdele) og dagenes tid.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { serialize, deserialize } from 'node:v8';
import { createGame, type WorldData } from '../src/game/newgame';
import { runUntil } from '../src/game/sim';
import { gs, setGame, indexSnapshot, restoreIndexes, notify } from '../src/game/state';
import { SL_STATS } from '../src/game/cmShortlistGame';
import { rng } from '../src/game/rng';

const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === (process.env.CLUB ?? 'Arsenal'))![0];
let t = performance.now();
createGame(world, { managerName: 'Ct', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
console.log(`createGame ${Math.round(performance.now() - t)} ms (ønskelisternes start ${Math.round(SL_STATS.startMs)} ms)`);
// BOTS=n: lokalt spil mod n AI-managere (g.localMp – Ranking.tsx' "tilføj AI-manager"), som dagens Worker også kører (ui/dayRunner.ts)
if (+(process.env.BOTS ?? 0) > 0) {
  const { enableMultiplayer } = await import('../src/game/humans');
  const { setupBots } = await import('../src/game/bots');
  enableMultiplayer('host', 'Ct');
  gs().localMp = true;
  setupBots(+process.env.BOTS!, 'league');
  console.log('AI-managere', (gs().humans ?? []).filter((h) => h.bot).map((h) => `${h.name} ${gs().clubs[h.userClub]?.name}`).join(', '));
}
const days = +(process.env.DAYS ?? 8);
// PROF=fil.cpuprofile: CPU-profil af dagene (efter spilstarten)
const insp = process.env.PROF ? new (await import('node:inspector')).Session() : null;
const post = (m: string, p?: object) => new Promise<unknown>((ok, no) => insp!.post(m, p ?? {}, (e, r) => (e ? no(e) : ok(r))));
// PROF_FROM=n: profilen først fra dag n (fx en kampuge i august)
const profFrom = +(process.env.PROF_FROM ?? 0);
const startProf = async () => { insp!.connect(); await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 500 }); await post('Profiler.start'); };
if (insp && !profFrom) await startProf();
const tAll = performance.now();
const clone = process.env.CLONE === '1';
const sha = () => { gs().rng = rng.state; return createHash('sha1').update(JSON.stringify({ ...gs(), id: 0 })).digest('hex').slice(0, 12); };
for (let i = 0; i < days; i++) {
  if (insp && profFrom && i === profFrom) await startProf();
  if (clone) {
    notify();
    let t1 = performance.now();
    const buf = serialize({ game: gs(), idx: indexSnapshot() });
    const ser = performance.now() - t1; t1 = performance.now();
    const back = deserialize(buf) as { game: never; idx: ReturnType<typeof indexSnapshot> };
    const de = performance.now() - t1;
    // POISON=1: den gamle kopi fryses – skriver noget i den efter skiftet (en cache med gamle objekter), kaster det med stakken
    if (process.env.POISON === '1') { const seen = new Set<object>(); const fr = (o: unknown) => { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); Object.freeze(o); for (const v of Object.values(o)) fr(v); }; fr(gs()); }
    setGame(back.game);
    restoreIndexes(back.idx);
    console.log(`  kopi: serialize ${Math.round(ser)} ms, deserialize ${Math.round(de)} ms, ${(buf.length / 1e6).toFixed(1)} MB`);
  }
  t = performance.now();
  // som Shell: Continue Game kører runUntil (hele uger på én gang her: én dag ad gangen, autoPlay spiller egne kampe)
  await runUntil({ maxDays: 1, autoPlay: true });
  console.log(`${gs().date} ${Math.round(performance.now() - t)} ms sha1 ${sha()}`);
}
console.log(`${days} dage: ${Math.round((performance.now() - tAll) / days)} ms pr. dag`);
if (insp) { const r = (await post('Profiler.stop')) as { profile: unknown }; (await import('node:fs')).writeFileSync(process.env.PROF!, JSON.stringify(r.profile)); }
if (process.env.DUMP) (await import('node:fs')).writeFileSync(process.env.DUMP, JSON.stringify(gs()));
