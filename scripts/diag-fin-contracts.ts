// Diagnose: klubber i minus og spillere med udløbet kontrakt pr. sæson, fordelt på grupper (ægte tilstand, original DB, Arsenal og frø 1 som
// oraklet), og på oraklets dage (d1, d112, d323) de på navnet parrede klubber i minus pr. gruppe mod originalens finance.dat
// (~/cm0102-engine/oracle/out/fin-max/d<dag>.json = databasestørrelse Maximum som spillet; ORACLE_FIN=fin = oraklets størrelse 2).
// Kør: npx tsx scripts/diag-fin-contracts.ts [sæsoner] [world-fil]
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmCmScope } from '../src/game/cmContractManager';
import { K, balGbp } from '../src/game/cmFinance';
import { isHumanClub } from '../src/game/humans';

const seasons = Number(process.argv[2] ?? 3);
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(world, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const rep = (cid: number) => g.cmClubRep?.[cid] ?? 0;
function report(label: string) {
  const neg: Record<string, number> = {}, exp: Record<string, number> = {};
  const add = (o: Record<string, number>, k: string) => { o[k] = (o[k] ?? 0) + 1; };
  for (const c of Object.values(g.clubs)) {
    if (c.balance >= 0 || !g.cmFin?.[c.id]) continue;
    const act = g.activeNations?.includes(c.nation);
    const hid = g.leagues[c.league]?.hidden;
    add(neg, act ? 'aktivt land' : `${hid ? 'skjult' : 'andet land'} ${rep(c.id) >= 5000 ? 'rep≥5000' : 'rep<5000'}${(g.cmCrowd?.[c.id]?.[0] ?? 0) <= 0 ? ' tilsk=0' : ''}`);
  }
  for (const p of Object.values(g.players)) {
    if (!(p.club && p.contract && p.contract.expires < g.date && !p.loan)) continue;
    const c = g.clubs[p.club];
    const k = isHumanClub(p.club) ? 'menneske' : cmCmScope(g, p) ? (g.activeNations?.includes(c.nation) ? 'scope aktivt' : 'scope cmMem') : g.leagues[c.league]?.hidden ? 'skjult liga' : g.activeNations?.includes(c.nation) ? 'aktivt udenfor scope' : `andet land${p.cmMem === 1 ? ' cmMem' : ''}`;
    add(exp, `${k}${p.contract.cmType === 1 ? ' type1' : ''}`);
  }
  const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
  console.log(`${label} ${g.date} · minus ${sum(neg)} ${JSON.stringify(neg)}\n   udløbne ${sum(exp)} ${JSON.stringify(exp)}`);
}
type ORec = { name: string; balance: number; thisYear: Record<string, number> };
const OD = `${homedir()}/cm0102-engine/oracle/out/${process.env.ORACLE_FIN ?? "fin-max"}`;   // fin-max: databasestørrelse Maximum som spillet (fin: størrelse 2)
/** oraklets finance.dat (frø 1, 3.9.60 – klubberne parres på navnet) mod spillet: klubber i minus pr. gruppe (spillet/originalen) */
function compare(day: number) {
  const OF = `${OD}/d${day}.json`;
  if (!existsSync(OF)) return;
  const o = new Map((JSON.parse(readFileSync(OF, 'utf8').replace(/\bNaN\b/g, 'null')) as ORec[]).map((r) => [r.name, r]));
  const grp: Record<string, [number, number, number]> = {};
  const rows: string[] = [];
  for (const c of Object.values(g.clubs)) {
    const r = g.cmFin?.[c.id], or = o.get(c.name);
    if (!r || !or) continue;
    const act = g.activeNations?.includes(c.nation), hid = g.leagues[c.league]?.hidden;
    const k = act ? 'aktivt land' : `${hid ? 'skjult' : 'andet land'} ${rep(c.id) >= 5000 ? 'rep≥5000' : 'rep<5000'}`;
    const e = (grp[k] ??= [0, 0, 0]); e[0]++; if (c.balance < 0) e[1]++; if (or.balance < 0) e[2]++;
    if (c.balance < 0 && or.balance >= 0 && rows.length < 30) rows.push(`  ${c.name} (${g.nations[c.nation]?.name}${hid ? ', skjult' : ''}) rep ${rep(c.id)} tilsk ${g.cmCrowd?.[c.id]?.[0]} · saldo ${Math.round(balGbp(g, c))}/${or.balance} · billet ${r.ty[K.gate]}/${or.thisYear.gate} · tv ${r.ty[K.tv]}/${or.thisYear.tv} · løn ${r.ty[K.wages]}/${or.thisYear.wages} · merch ${r.ty[K.merch]}/${or.thisYear.merch}`);
  }
  console.log(`d${day} ${g.date} parrede klubber [antal, i minus spillet, i minus originalen]: ${JSON.stringify(grp)}`);
  console.log(rows.join('\n'));
}
report('start');
compare(1);
const end = g.season + seasons;
let days = 0, last = g.season;
const cmpDays = [112, 323];
const t0 = Date.now();
while (g.season < end && days++ < 400 * seasons) {
  let r;
  try { r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
  catch (e) { console.log(`UNDTAGELSE ${g.date}: ${(e as Error).stack?.split('\n').slice(0, 4).join(' | ')}`); break; }
  const dn = Math.round((Date.parse(g.date) - Date.parse('2001-07-14')) / 86400000) + 1;
  if (cmpDays.length && dn >= cmpDays[0]) { compare(cmpDays.shift()!); if (process.env.STOP_AT && g.date >= process.env.STOP_AT) process.exit(0); }
  if (g.date === '2002-06-30') {
    // oraklets øjebliksbillede post-180-2002 (scripts/cm-contract-days.ts): de engelske klubbers kontrakter efter typen
    const t: Record<string, number> = {};
    for (const p of Object.values(g.players)) if (p.club && p.contract && !p.loan && g.clubs[p.club]?.nation === eng && cmCmScope(g, p)) { const k = String(p.contract.cmType ?? 2); t[k] = (t[k] ?? 0) + 1; }
    console.log(`30/6-2002 engelske computerklubbers kontrakter efter type: ${JSON.stringify(t)}`);
  }
  if (g.season !== last) { last = g.season; report(`sæson ${g.season}`); }
  if (days % 120 === 0) report(`dag ${days}`);
}
console.log(`${Math.round((Date.now() - t0) / 1000)} s`);
