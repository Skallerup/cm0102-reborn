// Landsholdene i ægte tilstand (MODERN_PARITY §0 A): landskampe pr. type og land, EM-kvalifikationens grupper, trupperne, landstrænerne,
// spillernes landskampe og menneskets landstrænerjob – 2026/27 (world.json + world-cm.json) eller 2001 (world-original.json).
//   npx tsx scripts/cm-intl-2026.ts [2026|2001] [til-dato] [klub] [frø] [landshold, mennesket tager jobbet 1/8 (fx Denmark; '-' = ingen)]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmIntlOn } from '../src/game/cmPlayerData';
import { nationalManager } from '../src/game/cmVirtual';
import { cmSquadOf } from '../src/game/cmIntlSquad';
import { answerNationalOffer } from '../src/game/international';

const db = process.argv[2] ?? '2026';
const until = process.argv[3] ?? (db === '2001' ? '2002-06-30' : '2027-06-30');
const w = JSON.parse(readFileSync(db === '2001' ? 'public/data/world-original.json' : 'public/data/world.json', 'utf8')) as WorldData;
if (db !== '2001') Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const idx = (nm: string) => w.nations.findIndex((x) => x.name === nm);
const eng = idx('England'), den = idx('Denmark');
const name = process.argv[4] ?? 'Brentford';
const club = w.clubs.find((c) => c[1] === name || c[2] === name);
if (!club) throw new Error(`klub ${name}?`);
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: club[0], activeNations: [eng, den], lang: 'en', masking: true,
  seed: Number(process.argv[5] ?? 1), mode: 'authentic' });
const g = gs();
const jobNat = (process.argv[6] ?? 'Denmark') === '-' ? -1 : idx(process.argv[6] ?? 'Denmark');
const nm = (n: number) => g.nations[n]?.name ?? `#${n}`;
const watch = ['England', 'Denmark', 'Spain', 'Brazil', 'Greece', 'Argentina'].map(idx).filter((n) => n >= 0);
console.log(`${db} ${name} start ${g.date} · cmIntl ${g.cmIntl ?? '-'} · cmIntlOn ${cmIntlOn(g)} · info ${Object.keys(g.intl?.info ?? {}).length} lande`);
for (const n of watch) { const m = nationalManager(g, n); console.log(`  ${nm(n).padEnd(10)} træner ${m ? `${m.first} ${m.last}` : '-'} · omdømme ${g.intl?.info?.[n]?.rep ?? '-'} · FIFA ${g.intl?.info?.[n]?.fifa ?? '-'}`); }
const caps0 = new Map(Object.values(g.players).map((p) => [p.id, p.caps ?? 0]));
let days = 0, took = false, crash = '';
// g.intl.results holder kun de seneste 150 – alle kampe samles her
const all: NonNullable<typeof g.intl>['results'] = [], seen = new Set<string>();
const collect = () => { for (const r of g.intl?.results ?? []) { const k = `${r.date}|${r.home}|${r.away}|${r.kind}|${r.stage ?? ''}`; if (!seen.has(k)) { seen.add(k); all.push(r); } } };
try {
  while (g.date < until && days++ < 420) {
    if (!took && jobNat >= 0 && g.date >= `${g.date.slice(0, 4)}-08-01`) {
      took = true;
      g.manager.nationalOffer = jobNat;
      console.log(`${g.date} mennesket tager ${nm(jobNat)}: ${answerNationalOffer(true)} · landshold ${g.manager.national ? nm(g.manager.national.nation) : '-'} · træner ${nationalManager(g, jobNat)?.last ?? '(mennesket)'}`);
    }
    const r = continueGame();
    if (r.match !== undefined) quickPlayUserMatch();
    collect();
  }
} catch (e) { crash = String((e as Error).stack ?? e).split('\n').slice(0, 6).join('\n'); }
console.log(`slut ${g.date}${crash ? `\nNEDBRUD:\n${crash}` : ' · intet nedbrud'}`);
collect();
const res = all;
const kinds: Record<string, number> = {};
for (const r of res) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
console.log(`landskampe i alt ${res.length}: ${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
const months: Record<string, number> = {};
for (const r of res) months[r.date.slice(0, 7)] = (months[r.date.slice(0, 7)] ?? 0) + 1;
console.log(`pr. måned: ${Object.entries(months).sort().map(([k, v]) => `${k} ${v}`).join(' · ')}`);
const playing = new Set(res.filter((r) => r.kind !== 'u21').flatMap((r) => [r.home, r.away]));
console.log(`A-landshold med mindst én kamp: ${playing.size}`);
for (const n of watch) {
  const mine = res.filter((r) => r.home === n || r.away === n);
  const by: Record<string, number> = {};
  for (const r of mine) by[r.kind] = (by[r.kind] ?? 0) + 1;
  const a = mine.filter((r) => r.kind !== 'u21').map((r) => `${r.date.slice(5)} ${nm(r.home).slice(0, 3)}-${nm(r.away).slice(0, 3)} ${r.hg}-${r.ag}${r.kind === 'euroq' ? 'q' : ''}`);
  console.log(`  ${nm(n).padEnd(10)} ${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(' · ')}\n      ${a.join(', ')}`);
}
const q = g.intl?.qual;
if (q) {
  console.log(`kvalifikation ${q.name} ${q.year}${q.cm ? ' (originalens)' : ''}: ${q.groups.length} grupper (${q.groups.map((x) => x.length).join('/')}), runde ${q.round}, værter ${(q.hosts ?? []).map(nm).join('+') || '-'}`);
  q.groups.forEach((grp, i) => {
    if (!grp.some((n) => n === eng || n === den) && i > 1) return;
    const rows = grp.map((n) => q.table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga));
    console.log(`  gruppe ${i + 1}: ${rows.map((x) => `${nm(x.n)} ${x.p}k ${x.pts}p`).join(' · ')}`);
  });
}
for (const n of [eng, den]) {
  const sq = cmSquadOf(g, n, 0);
  const ps = (sq?.ids ?? []).map((id) => g.players[id]).filter(Boolean).sort((a, b) => b.ca - a.ca);
  console.log(`trup ${nm(n)}: ${ps.length} spillere – ${ps.slice(0, 8).map((p) => `${p.last} (${p.caps})`).join(', ')}`);
}
const gained = Object.values(g.players).filter((p) => !p.virtual).map((p) => ({ p, d: (p.caps ?? 0) - (caps0.get(p.id) ?? 0) })).filter((x) => x.d > 0);
console.log(`spillere med nye landskampe: ${gained.length}, i alt ${gained.reduce((s, x) => s + x.d, 0)} · flest: ${gained.sort((a, b) => b.d - a.d).slice(0, 6).map((x) => `${x.p.last} (${nm(x.p.nation)}) +${x.d}`).join(', ')}`);
for (const n of [eng, den]) { const xs = gained.filter((x) => x.p.nation === n); console.log(`  ${nm(n)}: ${xs.length} spillere, +${xs.reduce((s, x) => s + x.d, 0)} landskampe`); }
const nj = g.manager.national;
if (nj) console.log(`mennesket landstræner for ${nm(nj.nation)} siden ${nj.since}: ${nj.played} kampe, ${nj.won} sejre · nyheder om truppen: ${g.news.filter((x) => /intl|squad|nat|cmint/i.test(x.key)).length}`);
