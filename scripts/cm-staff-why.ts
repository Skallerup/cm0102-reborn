// Stabsbuddene ved spilstarten (cmStaffMove.ts): hvorfor bliver de ikke til skifter? Tæller hvert buds første afslag i cmStaffMovesDaily's
// rækkefølge – pladsen fuld, viljen 0x844780 < 0,75, kontrakten 0x4cda70/0x85fc50 afvist – pr. job og for personer med/uden klub.
// Kørsel: npx tsx scripts/cm-staff-why.ts   (WORLD=<world-fil>, CLUB=<klub>)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { boardEnv, staffJobInterest } from '../src/game/cmBoardGame';
import { cmStaffTerms } from '../src/game/cmContractGame';

const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === (process.env.CLUB ?? 'Arsenal'))![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const env = boardEnv(g, g.date, undefined, true);
const tally: Record<string, number> = {};
const add = (k: string) => { tally[k] = (tally[k] ?? 0) + 1; };
const ex: string[] = [];
for (const m of g.cmStaffMoves ?? []) {
  const s = g.staff[m.s];
  const tag = `${m.job}/${m.from ? 'klub' : 'ledig'}`;
  const p = env.person(s.id);
  const wi = p ? staffJobInterest(g, env, p, m.c, m.job) : -1;
  if (wi < 0.75) { add(`${tag} vilje<0,75`); if (m.from && ex.length < 40) ex.push(`vilje ${wi.toFixed(3)} ${s.first} ${s.last} (${g.clubs[m.from]?.name ?? '-'}) → ${g.clubs[m.c].name} job ${m.job}`); continue; }
  const t = cmStaffTerms(g, s, m.c, m.job);
  if (!t) { add(`${tag} ingen kontrakt`); continue; }
  if (t.refuse) { add(`${tag} afvist`); continue; }
  add(`${tag} ja${t.offered ? '' : ' (krav)'}`);
}
console.log(`bud ${g.cmStaffMoves?.length ?? 0}`);
for (const [k, v] of Object.entries(tally).sort()) console.log(`  ${k.padEnd(28)} ${v}`);
for (const e of ex) console.log('  ' + e);
// de personer, buddene går til: job +0x3d, landsholdsjobbet +0x28, nationen
const who = new Map<number, number>();
for (const m of g.cmStaffMoves ?? []) who.set(m.s, (who.get(m.s) ?? 0) + 1);
console.log(`personer ${who.size}`);
for (const [id, n] of [...who.entries()].sort((a, b) => b[1] - a[1])) {
  const s = g.staff[id], p = env.person(id);
  console.log(`  ${String(n).padStart(3)} × ${`${s.first} ${s.last}`.padEnd(22)} ${(g.clubs[s.club]?.name ?? 'ledig').padEnd(20)} ${w.nations[s.nation]?.name ?? s.nation} +0x3d ${p?.job} +0x28 ${p?.natJob} +0x22 ${p ? p.b22 & 0xff : "-"} id ${s.cmId ?? s.id}`);
}

// BIDS=<dato>: spil videre og tæl buddene pr. person (samme person igen og igen?)
if (process.env.BIDS) {
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const per = new Map<number, number>(); let total = 0;
  const seen = new Set<string>();
  const note = () => { for (const m of g.cmStaffMoves ?? []) { const k = `${m.s}|${m.c}|${m.due}`; if (!seen.has(k)) { seen.add(k); total++; per.set(m.s, (per.get(m.s) ?? 0) + 1); } } };
  note();
  while (g.date < process.env.BIDS) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); note(); }
  const top = [...per.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  console.log(`${g.date}: bud i alt ${total}, personer ${per.size}, med klub ${[...per.keys()].filter((s) => g.staff[s]?.club).length}`);
  for (const [s, n] of top) console.log(`  ${n} × ${g.staff[s].first} ${g.staff[s].last} (${g.clubs[g.staff[s].club]?.name ?? 'ledig'})`);
}

// PLAN=1: trupplanens stabspladser (rolle 6–10) efter ønskelisterne – mål (+0xf) og indehaver (+0x13)
if (process.env.PLAN) {
  let n = 0, tgt = 0; const ex2: string[] = [];
  for (const [cid, st] of Object.entries(g.cmPlan ?? {})) for (const r of st.s) {
    if (r[0] < 6 || r[0] > 10) continue;
    n++;
    if (r[3] >= 0) { tgt++; if (ex2.length < 20) ex2.push(`${g.clubs[+cid]?.name} rolle ${r[0]} mål ${r[3]} (${g.staff[r[3]]?.last ?? g.players[r[3]]?.last ?? '?'}) indehaver ${r[4]} +7 ${r[10]} +0xb ${r[11]}`); }
  }
  console.log(`stabspladser ${n}, med mål ${tgt}`); for (const e of ex2) console.log('  ' + e);
}
