// Originalens vejr i en spillet sæson (cmWeather.ts): fordelingen af vind, nedbør, temperatur og bane i de spillede kampe pr. land og måned.
//   npx tsx scripts/cm-weather-season.ts [frø = 1] [slutdato = 2002-05-20] [klub = Man Utd]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { cmWeatherText } from '../src/game/cmWeather';

const seed = Number(process.argv[2] ?? 1), until = process.argv[3] ?? '2002-05-20', short = process.argv[4] ?? 'Man Utd';
const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[2] === short)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const EN: Record<string, string> = { 'cmwx.w1': 'Breezy', 'cmwx.w2': 'Gusty', 'cmwx.w3': 'Strong Wind', 'cmwx.w4': 'Gale', 'cmwx.p0': 'Dry', 'cmwx.p1': 'Wet', 'cmwx.p2': 'Drizzle',
  'cmwx.p3': 'Shower', 'cmwx.p5': 'Downpour', 'cmwx.p6': 'Sleet', 'cmwx.p7': 'Hail', 'cmwx.p8': 'Light Snow', 'cmwx.p9': 'Heavy Snow' };
const t = (k: string, p?: Record<string, string | number>) => (k === 'cmwx.temp' ? `${p!.n}°C` : EN[k] ?? k);
while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
const played = Object.values(g.fixtures).filter((f) => f.result && f.wx);
const by = (k: (f: (typeof played)[number]) => string) => { const m = new Map<string, number>(); for (const f of played) m.set(k(f), (m.get(k(f)) ?? 0) + 1); return [...m].sort((a, b) => b[1] - a[1]); };
console.log(`kampe med vejr: ${played.length} af ${Object.values(g.fixtures).filter((f) => f.result).length}`);
console.log('vind', by((f) => String(f.wx![0])));
console.log('nedbør', by((f) => String(f.wx![1])));
console.log('bane', by((f) => String(f.wx![4])));
const months = new Map<string, number[]>();
for (const f of played) { const k = f.date.slice(0, 7); (months.get(k) ?? months.set(k, []).get(k)!).push(f.wx![2]); }
for (const [k, v] of [...months].sort()) console.log(k, 'temp snit', (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1), 'min', Math.min(...v), 'max', Math.max(...v));
for (const f of played.filter((f) => f.home === g.userClub || f.away === g.userClub).slice(0, 12)) console.log(f.date, g.clubs[f.home].short, '-', g.clubs[f.away].short, cmWeatherText(f.wx!.slice(0, 4) as never, t), 'bane', f.wx![4]);
