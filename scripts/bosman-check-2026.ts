// Bosman 0.7.2-tjeklisten på 2026/27 (docs/MODERN_PARITY.md): ligaernes klubber/runder/datoer, pokalernes deltagere pr. række, databasens
// lejer/skader ved starten og den historik, et nyt spil får – så et kort stykke af sæsonen (ingen nedbrud).
//   [ALL=1] npx tsx scripts/bosman-check-2026.ts [til-dato] [klub] [frø]   (ALL=1: alle lande med en liga aktive, ellers England)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const until = process.argv[2] ?? '2026-08-31';
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
const club = w.clubs.find((c) => c[1] === name || c[2] === name);
if (!club) throw new Error(`klub ${name}?`);
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: club[0], activeNations: process.env.ALL ? [...new Set(w.leagues.filter((l) => !l.hidden).map((l) => l.nation))] : [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const ps = Object.values(g.players);
console.log(`start ${g.date} · lejede ${ps.filter((p) => p.loan).length} · skadede ${ps.filter((p) => p.injury).length} · historik ${Object.keys(g.cmCompHist ?? {}).length} turneringer`);
const ph = g.cmCompHist?.CM7?.slice(0, 3).map(([y, a]) => `${y} ${g.clubs[a]?.name ?? g.cmClubNames?.[a]?.[0] ?? a}`).join(', ');
console.log(`Premier League-historik: ${ph}`);
const leagueOf = (c: number) => Object.values(g.comps).find((x) => x.type === 'league' && x.clubs.includes(c));
const report = (label: string) => {
  console.log(`--- ${label} ${g.date}`);
  for (const c of Object.values(g.comps).sort((a, b) => a.id.localeCompare(b.id))) {
    const fx = Object.values(g.fixtures).filter((f) => f.comp === c.id);
    const dates = fx.map((f) => f.date).sort();
    if (c.type === 'league') {
      const rounds = Math.max(0, ...fx.map((f) => f.round ?? 0));
      console.log(`liga ${c.id.padEnd(6)} ${String(c.clubs.length).padStart(3)} klubber · ${String(rounds).padStart(2)} runder · ${dates[0] ?? '-'} → ${dates.at(-1) ?? '-'} · ${c.name}`);
    } else if (c.type === 'cup') {
      const cl = new Set<number>([...c.clubs, ...c.ties.flatMap((t) => [t.a, t.b])]);
      const by: Record<string, number> = {};
      for (const x of cl) { const l = leagueOf(x); const k = l ? `${l.tier}` : 'uden'; by[k] = (by[k] ?? 0) + 1; }
      console.log(`pokal ${c.id.padEnd(10)} ${String(cl.size).padStart(3)} klubber (række ${Object.entries(by).map(([k, v]) => `${k}:${v}`).join(' ')}) · ${dates[0] ?? '-'} · ${c.name}`);
    }
  }
};
report('start');
let days = 0;
while (g.date < until && days++ < 400) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
}
const played = Object.values(g.fixtures).filter((f) => f.result).length;
const stale = Object.values(g.fixtures).filter((f) => !f.result && f.date < g.date);
const staleBy: Record<string, number> = {};
for (const f of stale) staleBy[g.comps[f.comp]?.name ?? f.comp] = (staleBy[g.comps[f.comp]?.name ?? f.comp] ?? 0) + 1;
console.log(`uspillede kampe før ${g.date}: ${stale.length} ${JSON.stringify(staleBy)}`);
console.log(`slut ${g.date} · ${played} kampe spillet · lejede ${Object.values(g.players).filter((p) => p.loan).length}`);
