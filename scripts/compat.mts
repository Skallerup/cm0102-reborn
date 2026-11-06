// Gamle gemte spil (JSON af GameState fra en ældre version) indlæses og spilles en sæson videre med dagens kode.
// Kør: npx tsx scripts/compat.mts <save.json> [...]  (lav et gammelt spil med `git worktree add <dir> <commit>`)
import { readFileSync } from 'node:fs';
import { setGame, gs, squad } from '../src/game/state';
import { upgradeLoaded } from '../src/game/save';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import type { GameState } from '../src/game/types';
import { en } from '../src/i18n/en';
for (const f of process.argv.slice(2)) {
  const g = JSON.parse(readFileSync(f, 'utf8')) as GameState;
  setGame(g); upgradeLoaded();
  const errs: string[] = [];
  let d = 0; const end = g.season + 1;
  try { while (g.season < end && d++ < 420) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); } }
  catch (e) { errs.push(`undtagelse ${g.date}: ${(e as Error).stack?.split('\n').slice(0, 3).join(' | ')}`); }
  const G = gs();
  for (const p of Object.values(G.players)) if (!Number.isFinite(p.value) || !Number.isFinite(p.ca) || (p.contract && !Number.isFinite(p.contract.wage))) { errs.push(`ugyldige tal: ${p.last}`); break; }
  for (const c of Object.values(G.clubs)) if (!Number.isFinite(c.balance)) { errs.push(`ugyldig saldo: ${c.name}`); break; }
  const missing = [...new Set(G.news.map((n) => n.key))].filter((k) => !(k in en));
  if (missing.length) errs.push(`nyheder uden tekst: ${missing.join(', ')}`);
  console.log(`${f.split('/').pop()}: ${G.date} · ${G.clubs[G.userClub]?.name ?? 'arbejdsløs'} · trup ${G.userClub ? squad(G.userClub).length : 0} · ${errs.length ? errs.join(' ; ') : 'OK'}`);
}
