// 2026/27 i ægte tilstand (MODERN_PARITY 12): vejr, priser, reserve-/B-hold, venskabskampe og sprog over en sæson – vejrfordelingen i de
// spillede kampe, prisernes antal (originalens cmAw og spillets egne), venskabskampe, reservekampe (RES og spillets res.*-nyheder), B-hold og
// sprogtabellen.  npx tsx scripts/cm-misc-2026.ts [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { weatherFor } from '../src/game/weather';
import { cmWxOn } from '../src/game/cmWeather';
import { linkedClub } from '../src/game/cmBTeam';

const until = process.argv[2] ?? '2027-06-30';
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const t0 = performance.now();
const langPlayers = Object.values(g.players).filter((p) => p.cmLang).length;
console.log(`start ${g.date} · vejr ${cmWxOn(g) ? 'originalens' : 'spillets'} · spillere med sprogtabel ${langPlayers}`);
const news: Record<string, number> = {};
let lastNews = g.nextId.news;
const wx: Record<string, number> = {}, prec: Record<string, number> = {}, temp: Record<string, number> = {};
const fr: Record<string, number> = {};
let days = 0;
const done = new Set<number>();
while (g.date < until && days++ < 420) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  for (const n of g.news) { if (n.id < lastNews) break; news[n.key] = (news[n.key] ?? 0) + 1; }
  lastNews = g.nextId.news;
  for (const f of Object.values(g.fixtures)) {
    if (!f.played || done.has(f.id)) continue;
    done.add(f.id);
    const c = g.comps[f.comp];
    const kind = f.comp === 'FRIENDLY' || f.comp.startsWith('FR') ? 'venskab' : f.comp === 'RES' ? 'reserve' : c?.type ?? f.comp;
    fr[kind] = (fr[kind] ?? 0) + 1;
    if (c?.type !== 'league' || g.clubs[f.home]?.nation !== eng) continue;
    const v = weatherFor(f);
    wx[v] = (wx[v] ?? 0) + 1;
    if (f.wx) { prec[f.wx[1]] = (prec[f.wx[1]] ?? 0) + 1; const b = `${Math.floor(f.wx[2] / 5) * 5}`; temp[b] = (temp[b] ?? 0) + 1; }
  }
}
console.log(`--- slut ${g.date} (${Math.round((performance.now() - t0) / 1000)} s)`);
console.log(`kampe pr. slags: ${JSON.stringify(fr)}`);
console.log(`vejr (engelske ligakampe, grov type): ${JSON.stringify(wx)}`);
if (Object.keys(prec).length) console.log(`  nedbør 0x923010 (0 tørt, 1 vådt, 2 støv, 3 byger, 5 skybrud, 6–9 sne/slud/hagl): ${JSON.stringify(prec)} · temperatur (5 °C-bånd): ${JSON.stringify(temp)}`);
const aw = g.cmAw?.won ?? [];
const byKind: Record<string, number> = {};
for (const a of aw) { const k = a.team ? 'hold' : a.m ? 'måned' : 'år'; byKind[k] = (byKind[k] ?? 0) + 1; }
console.log(`originalens priser: ${aw.length} ${JSON.stringify(byKind)} · spillets månedspriser: ${g.monthAwards?.length ?? 0}`);
const pick = (re: RegExp) => Object.entries(news).filter(([k]) => re.test(k)).sort((a, b) => b[1] - a[1]);
console.log(`nyheder (pris/res/venskab/sprog): ${JSON.stringify(pick(/award|aw\.|potm|gala|res\.|friend|cmFr|lang|reserve|teamOf/i))}`);
console.log(`B-hold-par: ${Object.keys(g.clubs).filter((c) => linkedClub(g, +c)?.first).length} · reserver: ${Object.values(g.players).filter((p) => p.reserves).length} · sprogtabel ${Object.values(g.players).filter((p) => p.cmLang).length}`);
