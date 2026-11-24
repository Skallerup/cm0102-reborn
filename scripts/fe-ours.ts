// Modstykket til scripts/fe-oracle.ts i vores spil: nyt spil som oraklet (frø 1, England, Arsenal på ferie), SEASONS sæsoner. Pr. 14. dag:
// klubber i krise (+0x165), bånd −1/−2, saldo < 0; Investments-stigninger ≥ 100.000 pr. klub; FE_STATS (begivenheder pr. type) pr. sæson.
// Kør: WORLD=public/data/world-original-normal.json SEASONS=1 npx tsx scripts/fe-ours.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { balGbp, K, wealthBand } from '../src/game/cmFinance';
import { clubRepMem } from '../src/game/cmPlayerData';
import { FE_STATS } from '../src/game/cmFinEvents';

const SEASONS = Number(process.env.SEASONS ?? 1);
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original-normal.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === (process.env.CLUB ?? 'Arsenal'))![0];
const nations = process.env.NATIONS ? process.env.NATIONS.split(',').map((n) => w.nations.findIndex((x) => x.name === n)) : [eng];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: nations, lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
if (process.env.HOLIDAY !== '0') gs().manager.holiday = {};
const g = gs();
const end = `${2001 + SEASONS}-06-30`;
const prevInv = new Map<number, number>();
const prevChair = new Map<number, string>();
const chairEv: string[] = [];
const inv: string[] = [];
let last = '', n = 0;
const s16 = (x: number) => (x << 16) >> 16;
const lastStats: Record<string, number> = {};
while (g.date < end && n++ < 5000) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  const step = Math.floor((Date.parse(g.date) - Date.parse('2001-07-14')) / 86400000 / 14);
  const iso = g.date;
  for (const c of Object.values(g.clubs)) {
    const f = g.cmFin?.[c.id]; if (!f) continue;
    const v = f.ty[K.investments] ?? 0, p = prevInv.get(c.id);
    if (p !== undefined && v - p >= 100000) inv.push(`${iso} ${c.name} (${g.nations[c.nation]?.name}, rep ${s16(clubRepMem(g, c.id))}) +${Math.round(v - p)} saldo ${balGbp(g, c)}`);
    prevInv.set(c.id, v);
    const key = f.chair ? `${f.chair[0]},${g.cmChair?.[c.id]?.[0]},${g.cmChair?.[c.id]?.[1]}` : '';
    const pc = prevChair.get(c.id);
    if (pc !== undefined && pc !== key && key) chairEv.push(`${iso} ${c.name} (${g.nations[c.nation]?.name}, rep ${s16(clubRepMem(g, c.id))}) formand ${pc} → ${key} saldo ${balGbp(g, c)}`);
    prevChair.set(c.id, key);
  }
  if (String(step) !== last) {
    last = String(step);
    let n1 = 0, n2 = 0, neg = 0, b1 = 0, b2 = 0, engN = 0, engB = 0;
    for (const c of Object.values(g.clubs)) {
      const f = g.cmFin?.[c.id]; if (!f) continue;
      const bal = balGbp(g, c), rep = s16(clubRepMem(g, c.id)), b = wealthBand(bal, rep);
      if (f.s165 === 1) n1++; else if (f.s165 === 2) n2++;
      if (bal < 0) neg++;
      if (b === -1) b1++; else if (b === -2) b2++;
      if (c.nation === eng && g.comps[c.league]) { engN++; if (b < 0) engB++; }
    }
    console.log(`${iso} +0x165=1: ${n1} =2: ${n2} | bånd −1 ${b1} −2 ${b2} | saldo<0 ${neg} | engelske ligaklubber ${engN}, i bånd<0 ${engB} | FE ${JSON.stringify(FE_STATS)}`);
  }
  if (iso.endsWith('-06-30')) Object.assign(lastStats, { [iso]: JSON.stringify(FE_STATS) });
}
console.log('\n== FE_STATS pr. 30/6', lastStats, 'slut', FE_STATS);
console.log('\n== nyheder cmfe (menneskets indbakke)');
for (const x of g.news ?? []) if (/^cmfe\.h\.(board|funds|cash|shares|sponsor|plc)/.test(x.key)) console.log(x.date, x.key, JSON.stringify(x.params));
console.log(`\n== formandsskift (overtagelser med formand) ${chairEv.length}`);
for (const s of chairEv) console.log(s);
console.log(`\n== Investments-stigninger (${inv.length})`);
for (const s of inv) console.log(s);
