// Klubomdømme (club +0x80) uge for uge mod oraklet (K7b-fund #5): for hver billeddato D (oraklets dagsbilleder, hver STEP. dag) skrives
// omdømmet for alle klubber, der findes på begge sider (samme navn), som JSON-linjer – analysen sker bagefter.
//   WORLD=<world-dbs2.json> OUT=<fil.jsonl> [STEP=7] [UNTIL=2002-06-30] [ONLY_ORACLE=1] npx tsx scripts/rep-trace.ts
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';

const STEP = Number(process.env.STEP ?? 7);
const UNTIL = process.env.UNTIL ?? '2002-06-30';
const OUT = process.env.OUT ?? 'rep-trace.jsonl';
const ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const Y23 = process.env.Y23 ?? `${homedir()}/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14`;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };

function oracle(m: SparseMem): Record<string, [number, string, string]> {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const out: Record<string, [number, string, string]> = {};
  for (let ix = 0; ix < nc; ix++) {
    const adr = C + 0x245 * ix, name = str(m, adr + 4, 51);
    const nat = str(m, m.u32(adr + 0x53) + 4, 51), dv = m.u32(adr + 0x57);
    out[name] = [m.s16(adr + 0x80), nat, dv ? str(m, dv + 4, 51) : ''];
  }
  return out;
}
function ours(): Record<string, [number, string, string]> {
  const g = gs();
  const out: Record<string, [number, string, string]> = {};
  for (const c of Object.values(g.clubs)) out[c.name] = [g.cmClubRep?.[c.id] ?? Math.round(c.rep * 100), g.nations[c.nation]?.name ?? '', g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''];
  return out;
}

const ix1 = readDaySnapIndex(DEFAULT_DAYSNAP)!, ix2 = readDaySnapIndex(Y23);
const t0 = Date.parse('2001-07-14');
const snaps = [...ix1.snaps.filter((e) => ((Date.parse(e.iso) - t0) / 86400000) % STEP === 0).map((e) => ({ iso: e.iso, load: () => loadDaySnap(ix1, e) })),
  ...(ix2 ? ix2.snaps.map((e) => ({ iso: e.iso, load: () => loadDaySnap(ix2, e) })) : [])]
  .filter((s) => s.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso));
writeFileSync(OUT, '');
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
}
for (const s of snaps) {
  let u: Record<string, [number, string, string]> | undefined;
  if (!ONLY_ORACLE) {
    const g = gs();
    const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== '2001-07-14') while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
      if (!g.userClub) {
        const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
        if (offer) applyAction({ t: 'acceptJob', club: offer });
        else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
      }
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
    u = ours();
  }
  appendFileSync(OUT, JSON.stringify({ iso: s.iso, o: oracle(s.load()), u }) + '\n');
  console.log(s.iso);
}
