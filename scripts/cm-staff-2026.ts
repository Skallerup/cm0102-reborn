// 2026/27 i ægte tilstand (MODERN_PARITY 13): staben over en sæson – stabsskifterne (cmStaffMove.ts: klub → klub, ledig → klub, fyrede),
// de ledige stabspladser (assistent 1, trænere 5, fysioterapeut 1, spejdere 7 – 0x83cad4) og stabens ugeløn i de engelske ligaer, Staff Search's
// størrelse (0x7afa70) og menneskets kontrakttilbud til en stabsperson (0x4e06e0).
// npx tsx scripts/cm-staff-2026.ts [til-dato] [klub] [frø]
import { readFileSync, existsSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmStaffInSearch } from '../src/game/cmStaff';
import { regionOf } from '../src/game/leagues';
import { cmGbp } from '../src/game/cmMoney';
import type { Staff, StaffRole } from '../src/game/types';

const until = process.argv[2] ?? '2027-06-30';
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
if (existsSync('public/data/world-cm-staff.json')) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm-staff.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
const t0 = performance.now();
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const me = g.userClub;
const tier = (cid: number) => g.leagues[g.clubs[cid]?.league]?.tier ?? 9;
const shown = () => Object.values(g.clubs).filter((c) => c.nation === eng && g.comps[c.league]?.type === 'league' && !g.leagues[c.league]?.hidden);
const SLOTS: Partial<Record<StaffRole, number>> = { assistant: 1, coach: 5, physio: 1, scout: 7 };
function snapshot(label: string) {
  const clubs = shown().filter((c) => c.id !== me);
  let vac = 0;
  const wages: Record<number, number[]> = {};
  const byRole: Record<string, number> = {};
  for (const c of clubs) {
    const st = Object.values(g.staff).filter((s) => s.club === c.id && !s.cmExtra);
    for (const [role, n] of Object.entries(SLOTS)) vac += Math.max(0, n! - st.filter((s) => s.role === role).length);
    for (const s of st) if (s.role !== 'manager') {
      (wages[tier(c.id)] ??= []).push(s.wage);
      byRole[s.role] = (byRole[s.role] ?? 0) + 1;
    }
  }
  const med = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const wl = Object.entries(wages).sort().map(([t, xs]) => `række ${t}: ${xs.length} stk, sum €${Math.round(sum(xs) / 1000)}k/uge, median €${Math.round(med(xs))} (£${Math.round(med(xs) * cmGbp(g, clubs.find((c) => tier(c.id) === +t)?.id))})`);
  const region = regionOf(g.nations[g.clubs[me]?.nation ?? eng]?.name);
  const search = Object.values(g.staff).filter((s) => cmStaffInSearch(g, s, region)).length;
  console.log(`${label} ${g.date}: ledige stabspladser ${vac} (i ${clubs.length} klubber) · stab ${JSON.stringify(byRole)} · ${wl.join(' · ')} · Staff Search ${search} (cmExtra ${Object.values(g.staff).filter((s) => s.cmExtra).length})`);
}
console.log(`start ${g.date} (${Math.round((performance.now() - t0) / 1000)} s) · cmStaffMem ${g.cmStaffMem ? 'ja' : 'nej'} · stab i alt ${Object.keys(g.staff).length}`);
snapshot('start');
let last = new Map(Object.values(g.staff).map((s) => [s.id, s.club]));
const moves = { cc: 0, fc: 0, fired: 0, fee: 0 };
const log: string[] = [];
const nm = (s: Staff) => `${s.first} ${s.last}`.trim();
let days = 0;
while (g.date < until && days++ < 420) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  for (const s of Object.values(g.staff)) {
    if (s.role === 'manager') { last.set(s.id, s.club); continue; }
    const was = last.get(s.id);
    if (was !== undefined && was !== s.club) {
      if (s.club && s.club !== me) {
        if (was) moves.cc++; else moves.fc++;
        if (log.length < 40) log.push(`${g.date} ${s.role.padEnd(9)} ${nm(s).padEnd(24)} ${(g.clubs[was]?.name ?? '(ledig)').padEnd(22)} → ${g.clubs[s.club]?.name} €${s.wage}/uge til ${s.expires}`);
      } else if (!s.club && s.career?.at(-1)?.why === 'sacked') moves.fired++;
    }
    last.set(s.id, s.club);
  }
  if (g.date.endsWith('-01')) snapshot('måned');
}
console.log(`--- slut ${g.date} (${Math.round((performance.now() - t0) / 1000)} s)`);
snapshot('slut');
console.log(`stabsskifter (uden managere, til computerklubber): klub → klub ${moves.cc}, ledig → klub ${moves.fc}, fyret ${moves.fired}; ventende bud ${g.cmStaffMoves?.length ?? 0}`);
for (const l of log) console.log('  ' + l);
