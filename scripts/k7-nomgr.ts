// K7 "uden manager (slut)": spiller som k7-seasons.ts (frø 1, 3.9.60, England, Arsenal på ferie) og logger hver dag managerskifterne
// for de engelske klubber i Premier–Conference; til sidst klubberne uden manager og hvornår/hvorfor de mistede ham.
//   WORLD=<world-dbs2.json> UNTIL=2002-06-30 npx tsx scripts/k7-nomgr.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import type { GameState } from '../src/game/types';

const DIV_TIER: Record<string, number> = { 'English Premier Division': 1, 'English First Division': 2, 'English Second Division': 3, 'English Third Division': 4, 'English Football Conference': 5 };
const UNTIL = process.env.UNTIL ?? '2002-06-30';
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
gs().manager.holiday = {};
let g: GameState = gs();
const divOf = (cid: number) => { const c = g.clubs[cid]; return c ? g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? '' : ''; };
const nm = (id: number) => { const s = g.staff[id]; return s ? `${s.first} ${s.last} (${id}, ${s.role}, f. ${s.dob})` : id ? `#${id} (væk)` : '–'; };
const prev = new Map<number, number>();
const events: string[] = [];
const snap = () => {
  for (const c of Object.values(g.clubs)) {
    if (c.nation !== eng || !DIV_TIER[divOf(c.id)] || c.id === g.userClub) continue;
    const m = c.manager ?? 0, p = prev.get(c.id);
    if (p !== undefined && p !== m) {
      const gone = p && !g.staff[p];
      const ret = (g.cmRetLog ?? []).filter((r) => r[0] === g.date && r[2] === 0x20 && r[3] === c.id);
      events.push(`${g.date} ${c.name} [${divOf(c.id)}]: ${nm(p)} → ${nm(m)}${gone ? ' (personen væk)' : ''}${ret.length ? ' PENSION' : ''}`);
    }
    prev.set(c.id, m);
  }
};
snap();
const engClub = (c: number) => g.clubs[c]?.nation === eng && !!DIV_TIER[divOf(c)];
const caller = () => (new Error().stack ?? '').split('\n').slice(3, 6).map((l) => l.trim().replace(/^at /, '').replace(/\(.*\/src\/game\//, '(')).join(' < ');
const hook = (arr: unknown[] | undefined, tag: string, fmt: (x: any) => [number, string]) => {
  if (!arr || (arr as any).__h) return;
  (arr as any).__h = true;
  const orig = arr.push.bind(arr);
  arr.push = (...xs: any[]) => { for (const x of xs) { const [c, d] = fmt(x); if (engClub(c)) events.push(`${g.date} ${tag} ${g.clubs[c].name}: ${d} ← ${caller()}`); } return orig(...xs); };
};
let guard = 0;
while (g.date < UNTIL && guard++ < 1e7) {
  const st = g.cmBoard as any;
  if (st) { hook(st.dep, 'AFGANG', (x) => [x.club, `type ${x.type} grund ${x.reason}`]); hook(st.ult, 'ULTIMATUM', (x) => [x, '']); hook(st.vac, 'LEDIG', (x) => [x.club, `kand ${x.cand} dato1 ${x.date1?.day}/${x.date1?.year}`]); }
  if (!g.userClub) {   // som k7-seasons.ts: mennesket uden klub søger job
    const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
    if (offer) applyAction({ t: 'acceptJob', club: offer });
    else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    for (const id of Object.keys(g.manager.jobTalks ?? {})) if (g.manager.jobTalks![Number(id)].stage === 'offer') applyAction({ t: 'acceptJob', club: Number(id) });
  }
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  g = gs();
  if (g.dayDone && !g.pendingFixture) snap();
}
console.log('slut', g.date, 'runder', guard, 'userClub', g.userClub);
snap();
console.log(events.join('\n'));
console.log('\nUden manager', g.date, ':');
for (const c of Object.values(g.clubs)) {
  if (c.nation !== eng || !DIV_TIER[divOf(c.id)] || c.id === g.userClub) continue;
  if (!g.staff[c.manager ?? 0]) console.log(`  ${c.name} [${divOf(c.id)}] manager=${c.manager} ledig=${g.vacancies.includes(c.id)}`);
}
