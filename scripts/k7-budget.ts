// Transferbudgettet (Funds = Finance::get_transfer_budget 0x598800(0, 0, 0, 1, 0)) og saldoen for de engelske ligaklubber på faste datoer mod
// oraklets dagsbilleder (frø 1, 3.9.60, Arsenal med mennesket): på oraklets side 0x598800 kørt på billedets hukommelse (som cm-budget-check.ts),
// på vores Club.transferBudget (det gemte tal, som bestyrelsen/skærmene læser) og cmTransferBudget (0x598800 live på dagen).
//   WORLD=<world CM_DBSIZE=2> [DATES=2001-07-14,2001-09-01,…] [ONLY_ORACLE=1] npx tsx scripts/k7-budget.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { CmCtx, SparseMem } from '../src/game/cmMem';
import { genCtx } from '../src/game/cmGen/impls';
import { GEN } from '../src/game/cmGen/index';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { cmTransferBudget } from '../src/game/cmBudget';
import { cmGbp } from '../src/game/cmMoney';
import type { GameState } from '../src/game/types';

const DATES = (process.env.DATES ?? '2001-07-14,2001-09-01,2002-01-01,2002-02-01,2002-06-20,2002-07-14').split(',');
const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const DIVS = ['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division'];
interface Row { div: string; bal: number; tb: number; live?: number }
type W = Map<string, Row>;

const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
function oracle(m: SparseMem): W {
  const base: CmCtx = { m, rand: () => 0, call: (adr, ...a) => (adr === 0x5a0590 ? getClubFinance_5a0590(base, a[0]) : cmMemCall(base, adr, ...a)) };
  const c = genCtx(base);
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const out: W = new Map();
  for (let ix = 0; ix < nc; ix++) {
    const adr = C + 0x245 * ix;
    if (str(m, m.u32(adr + 0x53) + 4, 51) !== 'England') continue;
    const dv = m.u32(adr + 0x57), div = dv ? str(m, dv + 4, 51) : '';
    if (!DIVS.includes(div)) continue;
    const fin = getClubFinance_5a0590(base, adr);
    if (!fin) continue;
    const bal = m.u32(fin) + m.s32(fin + 4) * 4294967296;
    const tb = Math.max(0, GEN[0x598800](c, fin, [0, 0, 0, 1, 0]) | 0);
    out.set(str(m, adr + 4, 51), { div, bal, tb });
  }
  return out;
}
let g!: GameState;
function ours(): W {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const out: W = new Map();
  for (const comp of Object.values(g.comps)) {
    if (comp.type !== 'league' || comp.nation !== eng || !DIVS.includes(comp.name)) continue;
    for (const t of comp.table) {
      const cl = g.clubs[t.club]; if (!cl) continue;
      const f = cmGbp(g, cl.id);
      out.set(cl.name, { div: comp.name, bal: Math.round(cl.balance * f), tb: Math.round(cl.transferBudget * f), live: cmTransferBudget(g, cl.id) ?? undefined });
    }
  }
  return out;
}

const ixs = [readDaySnapIndex(DEFAULT_DAYSNAP)!, readDaySnapIndex(join(homedir(), 'cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14'))].filter(Boolean);
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
const M = (v: number | undefined) => (v === undefined ? '-' : (v / 1e6).toFixed(2));
const tot: string[] = [];
for (const iso of DATES) {
  if (!ONLY_ORACLE) {
    const pv = new Date(Date.parse(iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (iso !== '2001-07-14') while ((g.date < pv || !g.dayDone || g.pendingFixture) && guard++ < 20000) {
      if (!g.userClub) {
        const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
        if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
      }
      g = gs();
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
    g = gs();
  }
  const u = ONLY_ORACLE ? new Map() as W : ours();
  const ix = ixs.find((x) => x!.snaps.some((s) => s.iso === iso));
  const ent = ix?.snaps.find((s) => s.iso === iso);
  const o = ix && ent ? oracle(loadDaySnap(ix, ent)) : new Map() as W;
  console.log(`\n== ${iso} (vores dato ${g?.date ?? '-'}) – £M: orakel saldo/Funds | vores saldo/gemt/live`);
  const names = [...new Set([...o.keys(), ...u.keys()])].sort((a, b) => (o.get(b)?.bal ?? 0) - (o.get(a)?.bal ?? 0));
  const sum = { ob: 0, ot: 0, ub: 0, ut: 0, ul: 0, d: 0, dl: 0, n: 0 };
  for (const n of names) {
    const a = o.get(n), b = u.get(n);
    if (a && b) { sum.n++; sum.ob += a.bal; sum.ot += a.tb; sum.ub += b.bal; sum.ut += b.tb; sum.ul += b.live ?? 0; sum.d += Math.abs(a.tb - b.tb); sum.dl += Math.abs(a.tb - (b.live ?? 0)); }
    if (DIVS.indexOf(a?.div ?? b?.div ?? '') <= 0 || n === 'Arsenal') console.log(`${n.padEnd(24)} ${M(a?.bal).padStart(7)} ${M(a?.tb).padStart(7)} | ${M(b?.bal).padStart(7)} ${M(b?.tb).padStart(7)} ${M(b?.live).padStart(7)}`);
  }
  const line = `${iso}: ${sum.n} klubber · orakel Σsaldo ${M(sum.ob)} ΣFunds ${M(sum.ot)} · vores Σsaldo ${M(sum.ub)} Σgemt ${M(sum.ut)} Σlive ${M(sum.ul)} · |Δ| gemt ${M(sum.d)} live ${M(sum.dl)}`;
  console.log(line); tot.push(line);
}
console.log('\n' + tot.join('\n'));
