// 2026/27 i ægte tilstand (MODERN_PARITY 8): forhold, medier, rygter, moral og nyhedsomfang over en sæson – menneskets nyheder pr. nøgle,
// mediets rygter (cm.rum), forholdenes poster og moralens fordeling (Premier League-spillerne) pr. måned.
// npx tsx scripts/cm-media-2026.ts [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

// WORLD=original: samme måling på 2001-databasen (world-original.json) til sammenligning
const orig = process.env.WORLD === 'original';
const until = process.argv[2] ?? (orig ? '2002-06-30' : '2027-06-30');
const w = JSON.parse(readFileSync(orig ? 'public/data/world-original.json' : 'public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
if (!orig) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const t0 = performance.now();
const keys: Record<string, number> = {};
let lastId = g.nextId.news - 1;
const rel = () => Object.values(g.players).filter((p) => p.cmRel).length;
console.log(`start ${g.date} · spillere med forhold ${rel()} · klubber med personer ${Object.values(g.clubs).filter((c) => c.cmPrefs).length}`);
function morale(label: string) {
  const ps = Object.values(g.players).filter((p) => !!p.club && g.clubs[p.club]?.nation === eng && g.leagues[g.clubs[p.club]?.league ?? '']?.tier === 1);
  const h = new Array(21).fill(0);
  let s = 0;
  for (const p of ps) { const m = Math.max(1, Math.min(20, Math.round(p.morale))); h[m]++; s += p.morale; }
  const pct = (a: number, b: number) => `${Math.round((100 * h.slice(a, b + 1).reduce((x, y) => x + y, 0)) / Math.max(1, ps.length))}%`;
  const own = Object.values(g.players).filter((p) => p.club === g.userClub);
  const om = own.length ? (own.reduce((x, p) => x + p.morale, 0) / own.length).toFixed(1) : '–';
  console.log(`${label} ${g.date}: PL ${ps.length} spillere · moral snit ${(s / Math.max(1, ps.length)).toFixed(2)} · 1–5 ${pct(1, 5)} · 6–9 ${pct(6, 9)} · 10–14 ${pct(10, 14)} · 15–20 ${pct(15, 20)} · egen trup ${om} · rygtekø ${g.cmRum?.q.length ?? '–'}`);
}
morale('start');
let days = 0;
while (g.date < until && days++ < 420) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  for (const n of g.news) { if (n.id <= lastId) break; keys[n.key] = (keys[n.key] ?? 0) + 1; }
  lastId = g.nextId.news - 1;
  if (g.date.endsWith('-01')) morale('måned');
}
console.log(`--- slut ${g.date} (${Math.round((performance.now() - t0) / 1000)} s) · klub ${g.clubs[g.userClub]?.name ?? 'ingen'} · spillere med forhold ${rel()}`);
const tot = Object.values(keys).reduce((a, b) => a + b, 0);
const byPre: Record<string, number> = {};
for (const [k, v] of Object.entries(keys)) { const p = k.split('.').slice(0, k.startsWith('cm') || k.startsWith('news') ? 2 : 1).join('.'); byPre[p] = (byPre[p] ?? 0) + v; }
console.log(`nyheder i alt ${tot} · rygter (cm.rum) ${keys['cm.rum'] ?? 0} · rumour.interest ${keys['rumour.interest'] ?? 0}`);
console.log('pr. gruppe: ' + Object.entries(byPre).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
console.log('pr. nøgle: ' + Object.entries(keys).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
