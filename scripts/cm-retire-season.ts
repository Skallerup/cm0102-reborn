// Pensioneringerne i sæson 1 (cmRetire.ts – PLAYER_REGEN) mod oraklet: spillet startes som K2 (England, Arsenal, frø 1, ægte tilstand) og
// spilles til TIL (standard 2002-07-21). Sammenlignes på de klubber, begge har med fuld trup: de synlige engelske ligaer (originalens øvrige
// engelske klubber – Conference og nedefter – findes ikke eller har højst 16 spillere i spillets world-fil).
//   • listen ved 14/7, 1/2 og 30/6 (oraklets billeder: PLAYER_REGEN [0xb7434c]);
//   • de gennemførte pensioneringer til 30/6 og til 20/7-2002 med alder – oraklet: alle poster i billederne med stopdato i perioden
//     (pensioneringen sker dagen efter stopdatoen; poster, der både kom og gik mellem to billeder, ses ikke – oraklets tal er en nedre grænse).
// Kørsel: WORLD=<world-dbs2.json> npx tsx scripts/cm-retire-season.ts [til-dato]
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import type { GameState } from '../src/game/types';
import { ageOn } from '../src/game/dates';

const until = process.argv[2] ?? '2002-07-21';
const E = `${homedir()}/cm0102-engine`;
const SNAPS: [string, string][] = [[`${E}/work-r3/snap-start/pre-194-2001.bin`, '2001-07-14'], [`${E}/oracle/runs/xfer3-snap/pre-31-2002.bin`, '2002-02-01'], [`${E}/oracle/runs/xfer3-snap/pre-180-2002.bin`, '2002-06-30']];
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === (process.env.CLUB ?? 'Arsenal'))![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g: GameState = gs();
/** de fælles klubber: synlige engelske ligaer */
const shared = new Set(Object.values(g.clubs).filter((c) => c.nation === eng && !g.leagues[c.league]?.hidden).map((c) => c.id));
const sharedNames = new Set([...shared].map((id) => g.clubs[id].name));
const hist = (xs: number[]) => { const h: Record<number, number> = {}; for (const x of xs) h[x] = (h[x] ?? 0) + 1; return JSON.stringify(h); };

const ours: Record<string, string> = {};
function listStat(iso: string) {
  const L = (g.cmRet?.list ?? []).filter((x) => shared.has(x.club) && g.players[x.id]);
  ours[iso] = `${L.length} (meldt ${L.filter((x) => x.ann).length}) alder ${hist(L.map((x) => ageOn(g.players[x.id].dob, g.date)))}`;
}
listStat(g.date);
// spillere med en ikke-spillerpost (Staff med samme person-id – 0x7a59e0 0x7a62c2: de bliver stab, når de stopper)
const npPl = new Set(Object.values(g.staff).filter((s) => s.cmId !== undefined && g.players[s.cmId] && g.players[s.cmId].last === s.last).map((s) => s.cmId!));
console.log(`spillere med ikke-spillerpost ved start: ${npPl.size}`);
const marks = ['2002-02-01', '2002-06-30'];
const t0 = Date.now();
while (g.date < until) {
  const r = continueGame();
  if (r?.match) quickPlayUserMatch();
  if (marks[0] && g.date >= marks[0] && g.dayDone) { listStat(marks[0]); marks.shift(); }
}
const log = g.cmRetLog ?? [];
console.log(`spillet: ${((Date.now() - t0) / 1000).toFixed(0)} s; pensioneret i alt ${log.length} (alle lande), i de fælles klubber:`);
for (const to of ['2002-06-30', until]) {
  const xs = log.filter(([d, , , c]) => d <= to && shared.has(c));
  console.log(`  til ${to}: ${xs.length} årsager ${hist(xs.map((x) => x[2]))} alder ${hist(xs.map((x) => x[1]))}`);
}
{
  const ex = Object.values(g.staff).filter((s) => s.exPlayer && !g.players[s.exPlayer.pid]);
  const jobs: Record<string, number> = {};
  for (const s of ex) { const k = `${s.role} ${s.club ? 'klub' : 'klubløs'}`; jobs[k] = (jobs[k] ?? 0) + 1; }
  console.log(`  blev stab (alle lande) til ${until}: ${ex.length} ${JSON.stringify(jobs)}`);
  if (process.env.LIST) for (const s of ex) console.log(`    ${s.first} ${s.last} ${s.role} ${s.club ? g.clubs[s.club]?.name : 'klubløs'}`);
}
const freeEng = log.filter(([d, , , c, n]) => d <= until && !c && n === eng);
console.log(`  klubløse englændere til ${until}: ${freeEng.length} årsager ${hist(freeEng.map((x) => x[2]))}`);

// ------------------------------------------------------------------ oraklet
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const union = new Map<number, [number, number]>();
for (const [f, iso] of SNAPS) {
  if (!existsSync(f)) { console.log('mangler', f); continue; }
  const m = loadSnap(f);
  const PR = m.u32(0xb7434c), S = m.u32(0xae23bc), C = m.u32(0xae23b4), arr = m.u32(PR + 4), cnt = m.s32(PR + 8);
  const ages: number[] = [];
  let ann = 0;
  for (let i = 0; i < cnt; i++) {
    const e = arr + 26 * i, id = m.s32(e), club = m.s32(e + 4), st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || club < 0 || !sharedNames.has(str(m, C + 0x245 * club + 4, 51))) continue;
    ages.push(m.s8(st + 0x18)); if (m.u8(e + 0x19)) ann++;
    union.set(id, [m.u16(e + 0x12) * 1000 + m.s16(e + 0x10), m.s8(st + 0x18)]);
  }
  console.log(`listen ${iso}: oraklet ${ages.length} (meldt ${ann}) alder ${hist(ages)}\n              spillet ${ours[iso] ?? '-'}`);
}
for (const [to, lim] of [['2002-06-30', 2002179], [until, 2002000 + 199]] as const) {
  const xs = [...union.values()].filter(([r]) => r <= lim && r >= 2001194);
  console.log(`oraklet, stop til ${to}: ${xs.length} alder ${hist(xs.map((x) => x[1]))}`);
}
