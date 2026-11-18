// Stabsskifterne over en sæson målt som scripts/oracle-staff.ts måler oraklet: personer med ikke-spillerpost og job 6–10 (assistent, træner,
// spejder, fysioterapeut), hvis klub skifter (ugentligt): til en engelsk klub fra en engelsk klub / klubløs / udenlandsk, og ud til klubløs;
// trupplanens stabspladser (rolle 6, 8, 9, 10 – ikke 7, som spillet ikke har) i de engelske klubber: uden indehaver (+0x13 = −1), med, mål.
// Kørsel: WORLD=<world-dbs2.json> npx tsx scripts/cm-staff-season.ts [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import type { Staff } from '../src/game/types';

const until = process.argv[2] ?? '2002-06-30';
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === (process.argv[3] ?? 'Arsenal'))![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const isEng = (cid: number) => !!cid && g.clubs[cid]?.nation === eng;
const tracked = (s: Staff) => !!s.cmNp && !s.cmExtra && s.role !== 'manager';
let prev = new Map(Object.values(g.staff).filter(tracked).map((s) => [s.id, s.club]));
const kinds: Record<string, number> = {};
let cc = 0, fc = 0, out = 0;
const log: string[] = [];
function slots(): string {
  let vac = 0, held = 0, tgt = 0, clubs = 0, recent = 0, hi = 0;
  for (const [k, st] of Object.entries(g.cmPlan ?? {})) {
    if (!isEng(+k)) continue;
    clubs++;
    if (st.c < 7) recent++; if (st.c >= 100) hi++;
    for (const r of st.s) {
      if (![6, 8, 9, 10].includes(r[0])) continue;
      if (r[4] < 0) vac++; else held++;
      if (r[3] >= 0 && r[3] !== r[4]) tgt++;
    }
  }
  return `eng. klubber med plan ${clubs}, stabspladser uden indehaver ${vac}, med ${held}, mål ${tgt}, tæller<7 ${recent}, ≥100 ${hi}`;
}
const step = () => {
  for (const s of Object.values(g.staff)) {
    if (!tracked(s)) continue;
    const was = prev.get(s.id) ?? 0;
    if (was === s.club) continue;
    if (s.club && isEng(s.club)) { if (was) cc++; else fc++; } else if (!s.club) out++;
    const k = `${was ? (isEng(was) ? 'eng' : 'utl') : 'ledig'}→${s.club ? (isEng(s.club) ? 'eng' : 'utl') : 'ledig'}`;
    kinds[k] = (kinds[k] ?? 0) + 1;
    if (log.length < 400) log.push(`${g.date} ${s.role.padEnd(9)} ${`${s.first} ${s.last}`.padEnd(24)} ${(g.clubs[was]?.name ?? '(ledig)').padEnd(22)} → ${g.clubs[s.club]?.name ?? '(ledig)'}`);
  }
  prev = new Map(Object.values(g.staff).filter(tracked).map((s) => [s.id, s.club]));
};
const t0 = Date.now();
console.log(`${g.date}: ${slots()}`);
let d = 0;
while (g.date < until) {
  const r = continueGame();
  if (r?.match) quickPlayUserMatch();
  if (++d % 7 === 0) { step(); console.log(`${g.date}: ${slots()} · skifter til eng. hidtil klub→klub ${cc}, ledig→klub ${fc}, →ledig ${out}`); }
}
step();
console.log(`${((Date.now() - t0) / 1000).toFixed(0)} s · ${JSON.stringify(kinds)} · ventende bud ${g.cmStaffMoves?.length ?? 0}`);
for (const l of log) console.log(l);
