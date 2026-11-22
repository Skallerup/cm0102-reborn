// Kort K7-transfermåling: frø 1, England, Arsenal på ferie (som k7-seasons.ts), spil til <dato> og opgør køb med sum (England involveret).
//   npx tsx scripts/k7-fees.ts <world-dbs2.json> <til-dato> [mellemdato,...]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { GBP } from '../src/game/cmContractInit';
const [worldFile, until, mids = '', seedArg = '1'] = process.argv.slice(2);
const w = JSON.parse(readFileSync(worldFile, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: +seedArg, mode: 'authentic' });
const g = gs();
const empty0 = new Set<number>(); { const pc = new Set<number>(); for (const p of Object.values(g.players)) if (p.club) pc.add(p.club); for (const c of Object.values(g.clubs)) if (!pc.has(c.id)) empty0.add(c.id); }
const cls = (cid: number) => { const c = g.clubs[cid]; if (!c) return '-'; const e = c.nation === eng, h = !!g.leagues[c.league]?.hidden; return (e ? (h ? 'Enl' : 'E') : (h ? 'Uh' : 'U')) + (empty0.has(cid) ? '0' : ''); };
const stops = [...mids.split(',').filter(Boolean), until];
const LG = ['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division'];
function divReport(d: string) {
  for (const lg of LG) {
    const cl = Object.values(g.clubs).filter((c) => c.nation === eng && (g.comps[c.league]?.name ?? g.leagues[c.league]?.name) === lg);
    const ids = new Set(cl.map((c) => c.id));
    const ps = Object.values(g.players).filter((p) => !p.virtual && ids.has(p.loan?.from ?? p.club));
    const vals = ps.map((p) => Math.round(p.value * GBP));
    const sum = vals.reduce((a, b) => a + b, 0);
    const tb = cl.reduce((t, c) => t + Math.round((c.transferBudget ?? 0) * GBP), 0);
    const bal = cl.reduce((t, c) => t + Math.round((c.balance ?? 0) * GBP), 0);
    const ca = ps.reduce((t, p) => t + p.ca, 0) / Math.max(1, ps.length);
    const rep = cl.reduce((t, c) => t + (g.cmClubRep?.[c.id] ?? 0), 0) / Math.max(1, cl.length);
    const prep = ps.reduce((t, p) => t + ((p as unknown as { cmRep?: number[] }).cmRep?.[1] ?? p.rep ?? 0), 0) / Math.max(1, ps.length);
    console.log(`${d} ${lg}: klubber ${cl.length} spillere ${ps.length} værdi £${(sum / 1e6).toFixed(1)}M ≥1M ${vals.filter((v) => v >= 1e6).length} top ${Math.max(...vals)} | budget £${(tb / 1e6).toFixed(1)}M saldo £${(bal / 1e6).toFixed(1)}M | CA ${ca.toFixed(2)} klubomd ${rep.toFixed(0)} spilleromd ${prep.toFixed(1)}`);
  }
}
let prevStop = '';
function report(d: string) {
  divReport(d);
  const buys: { fee: number; to: string; from: string; ca: number; date: string; name: string }[] = [];
  let free = 0, loans = 0;
  for (const p of Object.values(g.players)) for (const mv of p.moves ?? []) {
    const fe = g.clubs[mv.from]?.nation === eng, te = g.clubs[mv.to]?.nation === eng;
    if (!(fe || te) || mv.date.slice(0, 10) <= prevStop) continue;
    if (mv.loan) { loans++; continue; }
    if (!mv.from && mv.to) { free++; continue; }
    if (!mv.from || !mv.to) continue;
    if (mv.fee > 0) buys.push({ fee: Math.round(mv.fee * GBP), to: g.clubs[mv.to].name, from: g.clubs[mv.from].name, ca: p.ca, date: mv.date, name: `${p.first} ${p.last}` });
  }
  const mx = new Map<string, [number, number]>();
  for (const p of Object.values(g.players)) for (const mv of p.moves ?? []) {
    const fe = g.clubs[mv.from]?.nation === eng, te = g.clubs[mv.to]?.nation === eng;
    if (!(fe || te) || mv.date.slice(0, 10) <= prevStop || mv.loan) continue;
    const k = `${cls(mv.from)}→${cls(mv.to)}${mv.fee > 0 ? '' : ' fri'}`; const o = mx.get(k) ?? [0, 0]; o[0]++; o[1] += Math.round(mv.fee * GBP); mx.set(k, o);
  }
  console.log('   art: ' + [...mx].sort((a, b) => b[1][1] - a[1][1] || b[1][0] - a[1][0]).map(([k, [n, f]]) => `${k} ${n}/£${(f / 1e6).toFixed(1)}M`).join(', '));
  const sum = buys.reduce((t, b) => t + b.fee, 0);
  const big = buys.filter((b) => b.fee >= 1e6);
  console.log(`== ${prevStop || 'start'} → ${d}: køb ${buys.length}, sum £${(sum / 1e6).toFixed(2)}M, snit £${Math.round(sum / Math.max(1, buys.length))}, ≥£1M ${big.length} (sum £${(big.reduce((t, b) => t + b.fee, 0) / 1e6).toFixed(2)}M), største £${Math.max(0, ...buys.map((b) => b.fee))}, klubløse skriver under ${free}, leje ${loans}`);
  prevStop = d;
  for (const b of buys.sort((a, b) => b.fee - a.fee).slice(0, 15)) console.log(`   ${b.date.slice(0, 10)} £${b.fee} ca${b.ca} ${b.name} ${b.from} → ${b.to}`);
}
let guard = 0;
for (const stop of stops) {
  while ((g.date < stop || !g.dayDone || g.pendingFixture) && guard++ < 20000) {
    if (!g.userClub) {
      const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
      if (offer) applyAction({ t: 'acceptJob', club: offer });
      else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
  report(stop);
}
