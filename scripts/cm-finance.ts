// Originalens klubøkonomi måned for måned: spillet (cmFinance.ts, original DB i ægte tilstand) mod oraklet (finance.dat af originalens
// gemte spil – ~/cm0102-engine/oracle/out/fin/d<dag>.json, lavet af ~/cm0102-engine/oracle/tools/fin_runs.sh + scripts/orig-finance.py).
// Kør: npx tsx scripts/cm-finance.ts [world-fil] [klub …]   (standard: Arsenal er menneskeklubben som i oraklet; Man Utd, Leicester, Bury)
// Skriver pr. klub og måned "sidste måned"-blokken (spillets/originalens) for hver post og startsaldoen.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { K, type FinKey, balGbp } from '../src/game/cmFinance';

const file = process.argv[2] ?? 'public/data/world-original.json';
const names = process.argv.slice(3).length ? process.argv.slice(3) : ['Manchester United', 'Leicester City', 'Arsenal', 'Bury'];
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(world, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const ids = names.map((n) => Object.values(g.clubs).find((c) => c.name === n)?.id).filter((x): x is number => x !== undefined);
const KEYS = Object.keys(K) as FinKey[];

// oraklet
const OD = `${homedir()}/cm0102-engine/oracle/out/fin`;
type ORec = { name: string; balance: number; wageBill: number; stHolders: number; lastMonth: Record<string, number>; thisMonth: Record<string, number>; thisYear: Record<string, number> };
const oracle = new Map<number, Map<string, ORec>>();
if (existsSync(OD)) for (const f of readdirSync(OD).filter((x) => /^d\d+\.json$/.test(x))) {
  const day = Number(f.slice(1, -5));
  oracle.set(day, new Map((JSON.parse(readFileSync(`${OD}/${f}`, 'utf8').replace(/\bNaN\b/g, 'null')) as ORec[]).map((r) => [r.name, r])));
}
// RECOMP_SAVE_AFTER_DAYS = d → gemt d dage efter den første nyhed (14/7-2001): dag 1 = start, dag 20 = 1/8 …
const dayOf = (iso: string) => Math.round((Date.parse(iso) - Date.parse('2001-07-14')) / 86400000) + 1;
const fmt = (v: number) => (Math.abs(v) >= 1e6 ? `${(v / 1e6).toFixed(2)}m` : Math.abs(v) >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : String(v));

const line = (label: string, ours: number[], orig?: Record<string, number>) => {
  const parts = KEYS.map((k, i) => {
    const a = ours[i], b = orig?.[k] ?? 0;
    return a || b ? `${k} ${fmt(a)}${orig ? `/${fmt(b)}` : ''}` : '';
  }).filter(Boolean);
  console.log(`  ${label}: ${parts.join(' · ')}`);
};

const start = g.date;
console.log(`start ${start}`);
for (const id of ids) {
  const c = g.clubs[id], o = oracle.get(1)?.get(c.name);
  console.log(`${c.name}: saldo ${fmt(balGbp(c))}${o ? ` (originalen ${fmt(o.balance)})` : ''} · lønsum ${fmt(g.cmFin![id].wb)}${o ? ` (${fmt(o.wageBill)})` : ''} · tilhængere ${g.cmSup?.[id]}`);
}
let lastMonth = g.date.slice(0, 7);
for (let i = 0; i < 340 && g.date < '2002-06-10'; i++) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  const m = g.date.slice(0, 7);
  if (m !== lastMonth) {
    lastMonth = m;
    const d = dayOf(g.date);
    const od = [...oracle.keys()].find((k) => Math.abs(k - d) <= 1);
    console.log(`\n${g.date} (dag ${d}${od !== undefined ? `, oraklet d${od}` : ''}) – sidste måned spillet/originalen`);
    for (const id of ids) {
      const c = g.clubs[id], rec = g.cmFin![id], o = od !== undefined ? oracle.get(od)?.get(c.name) : undefined;
      console.log(` ${c.name}: saldo ${fmt(balGbp(c))}${o ? `/${fmt(o.balance)}` : ''} · sæsonkort ${rec.st}${o ? `/${o.stHolders}` : ''}`);
      line('LM', rec.lm, o?.lastMonth);
    }
  }
}
console.log('\nsæsonen (this year) spillet/originalen');
const last = oracle.get(Math.max(...oracle.keys()));
for (const id of ids) { const c = g.clubs[id]; console.log(` ${c.name}: saldo ${fmt(balGbp(c))}${last?.get(c.name) ? `/${fmt(last.get(c.name)!.balance)}` : ''}`); line('TY', g.cmFin![id].ty, last?.get(c.name)?.thisYear); }
