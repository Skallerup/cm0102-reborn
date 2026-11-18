// Lejelisten (+0x4e bit 2, trupplanen 0x83cb40) og lejeaftalerne over en periode i ægte tilstand: hvor mange computerspillere der står med
// "Loa", hvor mange lejeaftaler der laves (og med hvilken lønandel), pr. uge og i alt.
//   npx tsx scripts/cm-loanlist-count.ts [2001|2026] [til-dato] [frø = 1]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { isHumanClub } from '../src/game/humans';
import { cmMarketOn } from '../src/game/cmPlayerData';

const which = process.argv[2] ?? '2001';
const until = process.argv[3] ?? (which === '2026' ? '2027-01-01' : '2002-01-01');
const w = JSON.parse(readFileSync(which === '2026' ? 'public/data/world.json' : 'public/data/world-original.json', 'utf8')) as WorldData;
if (which === '2026') Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const club = which === '2026' ? 'Brentford' : 'Wrexham';
createGame(w, { managerName: 'Lab', managerNation: eng, clubId: w.clubs.find((c) => c[1] === club || c[2] === club)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
g.options.engine = 'original';
console.log(`${which} start ${g.date} · cmMarketOn ${cmMarketOn(g)}`);
const everListed = new Set<number>(), loans = new Map<number, { share?: number; until: string; from: number; to: number }>();
let lastWeek = '';
const line = () => {
  const ps = Object.values(g.players).filter((p) => p.club && !isHumanClub(p.loan?.from ?? p.club));
  const listed = ps.filter((p) => p.loanListed);
  for (const p of listed) everListed.add(p.id);
  for (const p of ps) if (p.loan && !loans.has(p.id)) loans.set(p.id, { share: p.loan.share, until: p.loan.until, from: p.loan.from, to: p.club });
  const onLoan = ps.filter((p) => p.loan).length;
  console.log(`${g.date} Loa ${listed.length} (England ${listed.filter((p) => g.clubs[p.loan?.from ?? p.club]?.nation === eng).length}) · på leje ${onLoan} · Loa+på leje ${listed.filter((p) => p.loan).length}`);
};
line();
while (g.date < until) {
  const r = continueGame();
  if (r.match) quickPlayUserMatch();
  const wk = g.date.slice(0, 8) + (Number(g.date.slice(8)) < 15 ? 'a' : 'b');
  if (wk !== lastWeek) { lastWeek = wk; line(); }
}
const sh = [...loans.values()].reduce<Record<string, number>>((a, l) => { const k = l.share === undefined ? '–' : `${Math.round(l.share * 100)}%`; a[k] = (a[k] ?? 0) + 1; return a; }, {});
console.log(`I ALT: spillere sat til leje (Loa) på et tidspunkt ${everListed.size} · lejeaftaler ${loans.size} · lønandel ${JSON.stringify(sh)}`);
