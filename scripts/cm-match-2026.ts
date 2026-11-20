// Kamptallene i ægte tilstand (MODERN_PARITY §0 C+D): mål/kamp, kort, nye skader og bænk/udskiftninger pr. turneringstype og motor
// (gittermotoren = de aktive landes hjemlige kampe, zonemotoren = resten) – 2026/27 (world.json + world-cm.json) eller 2001 (world-original.json).
//   npx tsx scripts/cm-match-2026.ts [2026|2001] [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch, gridEngineOn, gridFixture } from '../src/game/sim';
import { gs } from '../src/game/state';
import { benchSize, maxSubs } from '../src/game/rules';

const db = process.argv[2] ?? '2026';
const until = process.argv[3] ?? (db === '2001' ? '2001-12-31' : '2026-12-31');
const w = JSON.parse(readFileSync(db === '2001' ? 'public/data/world-original.json' : 'public/data/world.json', 'utf8')) as WorldData;
if (db !== '2001') Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[4] ?? 'Brentford';
const club = w.clubs.find((c) => c[1] === name || c[2] === name);
if (!club) throw new Error(`klub ${name}?`);
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: club[0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[5] ?? 1), mode: 'authentic' });
const g = gs();
console.log(`${db} ${name} start ${g.date} · udskiftninger ${maxSubs()} · bænk ${benchSize()} · cmMatch ${g.cmMatch ?? '-'} · gitter ${gridEngineOn(g)}`);
type S = { n: number; goals: number; y: number; r: number; inj: number; big: number };
const st: Record<string, S> = {};
const done = new Set<number>();
let days = 0;
let injured = new Set(Object.values(g.players).filter((p) => p.injury).map((p) => p.id));
while (g.date < until && days++ < 400) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  const nowInj = new Set(Object.values(g.players).filter((p) => p.injury && p.injury.key !== 'awol').map((p) => p.id));
  const fresh = [...nowInj].filter((id) => !injured.has(id));
  injured = nowInj;
  const today: string[] = [];
  for (const f of Object.values(g.fixtures)) {
    if (!f.result || done.has(f.id)) continue;
    done.add(f.id);
    const c = g.comps[f.comp];
    const kind = `${c?.type ?? f.comp}/${gridEngineOn(g) && gridFixture(f.home, f.away, f.id) ? 'gitter' : 'zone'}`;
    const s = (st[kind] ??= { n: 0, goals: 0, y: 0, r: 0, inj: 0, big: 0 });
    s.n++; s.goals += f.result.hg + f.result.ag; s.y += f.result.cards?.[0] ?? 0; s.r += f.result.cards?.[1] ?? 0;
    if (f.result.hg + f.result.ag >= 7) s.big++;
    today.push(kind);
    // nye skader i dag tilskrives klubbernes kamp i dag
    for (const id of fresh) { const p = g.players[id]; if (p && (p.club === f.home || p.club === f.away)) s.inj++; }
  }
}
console.log(`slut ${g.date}`);
for (const [k, s] of Object.entries(st).sort()) {
  const f = (v: number) => (v / Math.max(1, s.n)).toFixed(2);
  console.log(`${k.padEnd(20)} kampe ${String(s.n).padStart(4)} · mål/kamp ${f(s.goals)} · gule ${f(s.y)} · røde ${f(s.r)} · skader ${f(s.inj)} · 7+ ${s.big}`);
}
