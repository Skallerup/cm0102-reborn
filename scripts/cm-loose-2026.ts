// MODERN_PARITY §0 E: hvad de tidligere løse cmActive-moduler gør i et nyt spil i ægte tilstand – transfervinduet (England), fyldspillerne,
// værdierne +0x52, klubomdømmet fra club +0x80, nyhederne fra spillets egne systemer og transfers pr. måned.
//   npx tsx scripts/cm-loose-2026.ts [2026|2001] [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { windowOpen } from '../src/game/transfers';

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
const me = g.userClub;
const lg = g.clubs[me].league;
const plValue = () => {
  const ps = Object.values(g.players).filter((p) => p.club && g.clubs[p.club]?.league === lg && !p.virtual);
  return { n: ps.length, avg: Math.round(ps.reduce((s, p) => s + p.value, 0) / Math.max(1, ps.length)) };
};
const reps0 = Object.fromEntries(Object.values(g.clubs).filter((c) => c.league === lg).map((c) => [c.id, c.rep]));
const v0 = plValue();
console.log(`${db} ${name} start ${g.date} · markører cmVirt ${g.cmVirt ?? '-'} cmMatch ${g.cmMatch ?? '-'} cmCmMgr ${g.cmCmMgr ?? '-'} · formation ${g.tactic?.formation}`);
const winDays: Record<string, number> = {};
let virtMax = 0, virtDays = 0, days = 0;
const moves: Record<string, number> = {};
const clubOf = new Map(Object.values(g.players).map((p) => [p.id, p.club]));
let err = '';
try {
  while (g.date < until && days++ < 400) {
    const r = continueGame();
    if (r.match !== undefined) quickPlayUserMatch();
    const m = g.date.slice(0, 7);
    if (windowOpen(g.date, me)) winDays[m] = (winDays[m] ?? 0) + 1;
    const virt = Object.values(g.players).filter((p) => p.virtual).length;
    if (virt) { virtDays++; virtMax = Math.max(virtMax, virt); }
    for (const p of Object.values(g.players)) {
      if (p.virtual) continue;
      const was = clubOf.get(p.id);
      if (was !== undefined && was !== p.club && p.club) moves[m] = (moves[m] ?? 0) + 1;
      clubOf.set(p.id, p.club);
    }
  }
} catch (e) { err = String((e as Error)?.stack ?? e).slice(0, 600); }
console.log(`slut ${g.date}${err ? ` · NEDBRUD ${err}` : ' · intet nedbrud'}`);
console.log(`vinduet åbent (dage pr. måned, ${name}): ${Object.entries(winDays).map(([k, v]) => `${k.slice(5)}:${v}`).join(' ')}`);
console.log(`klubskifter pr. måned: ${Object.entries(moves).sort().map(([k, v]) => `${k.slice(5)}:${v}`).join(' ')}`);
console.log(`fyldspillere: dage med ${virtDays}, højst ${virtMax} på én gang`);
const v1 = plValue();
console.log(`ligaens gns. værdi € ${v0.avg} → ${v1.avg} (${v0.n} → ${v1.n} spillere)`);
const repCh = Object.values(g.clubs).filter((c) => c.league === lg).map((c) => c.rep - (reps0[c.id] ?? c.rep));
console.log(`klubomdømme i ligaen: ændret for ${repCh.filter((x) => x !== 0).length}/${repCh.length}, største ±${Math.max(0, ...repCh.map(Math.abs))}`);
const keys: Record<string, number> = {};
for (const n of g.news) { const k = n.key.split('.').slice(0, 2).join('.'); keys[k] = (keys[k] ?? 0) + 1; }
const pick = ['window.', 'news.reservesPromoted', 'achievement', 'story', 'transfer.bidAccepted', 'transfer.o', 'transfer.cm'];
console.log(`nyheder: ${Object.entries(keys).filter(([k]) => pick.some((x) => k.startsWith(x))).map(([k, v]) => `${k} ${v}`).join(' · ') || '-'} · i alt ${g.news.length}`);
