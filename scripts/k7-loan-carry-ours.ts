// K7c #2: modstykket til scripts/k7-loan-carry.ts – vores lejer fra engelske klubber på oraklets billeddatoer (spillet ved D−1 færdigspillet,
// som k7-seasons.ts: frø 1, Arsenal på ferie, world med CM_DBSIZE=2): slutdato, oprettelsesdato (lejens flytning), hovedkontraktens udløb.
//   WORLD=<world-dbs2.json> [V=<dato,dato>] [UNTIL=2004-06-27] node scripts/measure.mjs -- npx tsx scripts/k7-loan-carry-ours.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const UNTIL = process.env.UNTIL ?? '2004-06-27';
const V = new Set((process.env.V ?? '2002-06-30,2003-06-29,2004-06-27').split(','));
const dates: string[] = ['2002-06-30'];
for (let t = Date.parse('2002-07-14'); ; t += 14 * 86400000) { const d = new Date(t).toISOString().slice(0, 10); if (d > UNTIL) break; dates.push(d); }
const cDiv = (cid: number) => { const c = g.clubs[cid]; if (!c) return ''; const n = g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''; return c.nation === eng && n ? n.replace('English ', '') : n || 'nl'; };
let prevL: Map<number, string> | null = null;
for (const d of dates) {
  const prev = new Date(Date.parse(d) - 86400000).toISOString().slice(0, 10);
  let guard = 0;
  while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
    if (!g.userClub) {
      const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
      if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
      for (const id of Object.keys(g.manager.jobTalks ?? {})) if (g.manager.jobTalks![Number(id)].stage === 'offer') applyAction({ t: 'acceptJob', club: Number(id) });
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
  const out: string[] = [], curL = new Map<number, string>(), cnt: Record<string, number> = {};
  for (const p of Object.values(g.players)) {
    if (p.virtual || !p.loan || g.clubs[p.loan.from]?.nation !== eng) continue;
    const mv = [...(p.moves ?? [])].reverse().find((x) => x.loan && x.to === p.club);
    const k = p.loan.until.slice(0, 7);
    cnt[k] = (cnt[k] ?? 0) + 1; curL.set(p.id, p.loan.until);
    out.push(`  ${p.loan.until} start ${mv?.date ?? '?'} kontr ${p.contract?.expires.slice(0, 10) ?? ''} født ${p.dob} ${g.clubs[p.loan.from]?.name} (${cDiv(p.loan.from)}) → ${g.clubs[p.club]?.name} (${cDiv(p.club)}) ${p.last}`);
  }
  let nw = 0, early = 0, due = 0; if (prevL) { for (const id of curL.keys()) if (!prevL.has(id)) nw++; for (const [id, en] of prevL) if (!curL.has(id)) { if (en >= d) early++; else due++; } }
  prevL = curL;
  console.log(`ny ${nw} slut-til-tiden ${due} slut-før-tid ${early} | ${d} (spil ${g.date}): ${out.length} lejer fra engelske | slut ${Object.entries(cnt).sort().map(([a, b]) => `${a}:${b}`).join(' ')}`);
  if (V.has(d)) console.log(out.sort().join('\n'));
}
