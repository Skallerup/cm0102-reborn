// Kontrakttallene fra scripts/cm-contract-days.ts (originalen) i VORES spil: ægte tilstand, den originale database, frø 1, England spilbart
// (Arsenal), 14/7-2001 → 30/6-2002 (+ dagen efter, 1/7, hvor spillets sæsonskifte kører). Engelske klubbers spillere: forlængelser i samme
// klub pr. måned og længde, de kontrakter, der udløb inden 30/6 (forlænget/skiftet/fri/udløbet efter trupstatus), frie skifter.
// Brug: npx tsx scripts/cm-contract-days-game.ts [world-fil] [slutdato]   (CM_DAILY=0 slår cmContractDaily fra)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { CMD_STATS } from '../src/game/cmContractManager';

const file = process.argv[2] ?? 'public/data/world-original.json';
const stop = process.argv[3] ?? '2002-07-01';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === 'Arsenal')?.[0] ?? world.clubs.find((c) => c[3] === eng)![0];
const t0 = Date.now();
createGame(world, { managerName: 'Ct', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const start = g.date;
console.log(`nyt spil ${((Date.now() - t0) / 1000).toFixed(1)} s, start ${start}`);
const isEng = (cid: number) => !!cid && g.clubs[cid]?.nation === eng && !g.leagues[g.clubs[cid].league]?.hidden;
const cnt = (xs: string[]) => { const o: Record<string, number> = {}; for (const x of xs) o[x] = (o[x] ?? 0) + 1; return Object.entries(o).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => `${k}:${v}`).join(' '); };
const st0 = new Map<number, { club: number; end: string; status: number }>();
for (const p of Object.values(g.players)) if (isEng(p.club) && p.contract && !p.loan) st0.set(p.id, { club: p.club, end: p.contract.expires, status: (p.cmContract?.b4f ?? 0) >> 4 });
console.log(`engelske kontrakter ved start ${st0.size}; udløb 30/6: ${cnt([...st0.values()].filter((r) => r.end.slice(5) === '06-30').map((r) => r.end.slice(0, 4)))}`);
console.log(`udløb (år-måned): ${cnt([...st0.values()].map((r) => r.end.slice(0, 7)))}`);
// forlængelser i samme klub: udløbet ændres, klubben er den samme
const last = new Map<number, { club: number; end: string }>();
for (const [id, r] of st0) last.set(id, { club: r.club, end: r.end });
const renewMonth: string[] = [], renewYears: string[] = [];
let freeMoves = 0; const freeMonth: string[] = [];
let days = 0, dayMs = 0;
const snap = (label: string) => {
  const res: string[] = [], byStatus = new Map<number, string[]>();
  let renewed = 0, moved = 0, gone = 0, same = 0;
  for (const [id, r0] of st0) {
    const p = g.players[id];
    const now = p && p.club ? { club: p.club, end: p.contract?.expires ?? '' } : null;
    if (!now) gone++; else if (now.club !== r0.club) moved++; else if (now.end !== r0.end) renewed++; else same++;
    if (r0.end <= '2002-06-30') {
      const k = !now ? 'fri' : now.club !== r0.club ? 'skiftet' : now.end !== r0.end ? 'forlænget' : 'udløbet';
      res.push(k); (byStatus.get(r0.status) ?? byStatus.set(r0.status, []).get(r0.status)!).push(k);
    }
  }
  console.log(`${label} ${g.date}: forlænget i samme klub ${renewed}, skiftet klub ${moved}, uden klub ${gone}, samme udløb ${same}`);
  console.log(`  de ${res.length} kontrakter, der udløb senest 30/6-2002: ${cnt(res)}`);
  for (const s of [...byStatus.keys()].sort()) console.log(`    trupstatus ${s}: ${cnt(byStatus.get(s)!)}`);
  console.log(`  frie spillere i alt ${Object.values(g.players).filter((p) => !p.club).length}; frie skifter til/fra engelske klubber ${freeMoves} (${cnt(freeMonth)})`);
};
while (g.date < stop) {
  const d0 = g.date, t = Date.now();
  const r = continueGame();
  if (r?.match) quickPlayUserMatch();
  if (g.date !== d0) { days++; dayMs += Date.now() - t; }
  for (const p of Object.values(g.players)) {
    const l = last.get(p.id);
    if (!l) continue;
    if (p.club === l.club && p.contract && p.contract.expires !== l.end && !p.loan) {
      renewMonth.push(g.date.slice(0, 7)); renewYears.push(String(+p.contract.expires.slice(0, 4) - +g.date.slice(0, 4) - (g.date.slice(5) > '06-30' ? 1 : 0)));
      l.end = p.contract.expires;
    } else if (p.club !== l.club) {
      const mv = p.moves?.[p.moves.length - 1];
      if (mv && !(mv.fee ?? 0) && !mv.loan && (isEng(mv.to) || isEng(l.club))) { freeMoves++; freeMonth.push(g.date.slice(0, 7)); }
      if (!p.club) { freeMoves++; freeMonth.push(g.date.slice(0, 7)); }
      l.club = p.club; l.end = p.contract?.expires ?? '';
    }
  }
  if (g.date === '2002-02-01' && d0 !== g.date) snap('1/2');
  if (g.date === '2002-06-30' && d0 !== g.date) snap('30/6');
}
snap('slut');
console.log(`forlængelser pr. måned ${cnt(renewMonth)}; længde (år efter sæsonen) ${cnt(renewYears)}`);
console.log(`dage ${days}, ${(dayMs / Math.max(1, days)).toFixed(0)} ms pr. dag; cmContractDaily ${JSON.stringify(CMD_STATS)}`);
