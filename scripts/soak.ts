// Langtidstest af motoren: spil N sæsoner og tjek, at verden hænger sammen efter hver sæson.
// Kør: npx tsx scripts/soak.ts [sæsoner] [world-fil] [klubnavn]   (MODE=authentic = ægte CM 01/02)
// Skriver en rapport med fejl (✗) og advarsler (⚠) – exit 1, hvis der er fejl.
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs, squad } from '../src/game/state';
import { ageOn } from '../src/game/dates';
import { naturalRole } from '../src/game/attributes';
import { en } from '../src/i18n/en';
import { da } from '../src/i18n/da';

const seasons = Number(process.argv[2] ?? 5);
const file = process.argv[3] ?? 'public/data/world.json';
const clubName = process.argv[4];
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = (clubName && world.clubs.find((c) => c[1] === clubName)?.[0]) || world.clubs.find((c) => c[3] === eng)![0];
createGame(world, { managerName: 'Soak', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 11, mode: process.env.MODE === 'authentic' ? 'authentic' : undefined });
const g = gs();
const errors: string[] = [], warns: string[] = [];
const err = (s: string) => { if (errors.length < 400) errors.push(s); };
const warn = (s: string) => { if (warns.length < 400) warns.push(s); };
const bad = (v: unknown) => typeof v !== 'number' || !Number.isFinite(v);
const m = (v: number) => `${(v / 1e6).toFixed(1)}m`;
const newsCount: Record<string, number> = {};
const seenNews = new Set<number>();
let lastNewsId = 0;

function check(label: string) {
  const played = Object.values(g.comps).filter((c) => c.type === 'league');
  const playedClubs = new Set(played.flatMap((c) => c.clubs));
  // ligaer
  for (const c of played) {
    if (c.clubs.length < 4) err(`${label}: liga ${c.name} har kun ${c.clubs.length} klubber`);
    if (new Set(c.clubs).size !== c.clubs.length) err(`${label}: liga ${c.name} har dubletter`);
  }
  // klubber
  let negative = 0;
  for (const c of Object.values(g.clubs)) {
    for (const k of ['balance', 'transferBudget', 'wageBudget', 'rep', 'seats', 'ticketPrice'] as const) if (bad(c[k])) err(`${label}: ${c.name}.${k} = ${c[k]}`);
    if (c.balance < 0) negative++;
    if (!playedClubs.has(c.id)) continue;
    const sq = squad(c.id);
    if (sq.length < 16) err(`${label}: ${c.name} har kun ${sq.length} spillere`);
    if (sq.length > 50) warn(`${label}: ${c.name} har ${sq.length} spillere`);
    const gks = sq.filter((p) => naturalRole(p) === 'GK').length;
    if (gks < 2) warn(`${label}: ${c.name} har ${gks} målmand(e)`);
    const nums = sq.map((p) => p.number).filter((n) => n);
    if (new Set(nums).size !== nums.length) err(`${label}: ${c.name} har dobbelte trøjenumre`);
  }
  // spillere
  let old = 0, expired = 0;
  for (const p of Object.values(g.players)) {
    if (bad(p.ca) || bad(p.pa) || bad(p.value) || bad(p.morale) || bad(p.condition)) { err(`${label}: ${p.first} ${p.last} har ugyldige tal (ca ${p.ca} pa ${p.pa} værdi ${p.value})`); continue; }
    if (p.ca < 1 || p.ca > 200 || p.pa > 200) err(`${label}: ${p.last} ca/pa uden for 1-200 (${p.ca}/${p.pa})`);
    if (p.attrs.some((a) => bad(a) || a < 0.5 || a > 20.5)) err(`${label}: ${p.last} har egenskaber uden for 1-20`);
    if (p.contract && bad(p.contract.wage)) err(`${label}: ${p.last} løn ${p.contract.wage}`);
    if (p.club && !g.clubs[p.club]) err(`${label}: ${p.last} spiller for en klub, der ikke findes (${p.club})`);
    if (p.club && p.contract && p.contract.expires < g.date && !p.loan) expired++;
    if (p.club && ageOn(p.dob, g.date) > 42) old++;
  }
  if (expired) warn(`${label}: ${expired} spillere med udløbet kontrakt er stadig på en klub`);
  if (old) warn(`${label}: ${old} spillere over 42 år er stadig aktive`);
  // nyheder
  for (const n of g.news) {
    if (seenNews.has(n.id)) continue;
    seenNews.add(n.id);
    newsCount[n.key] = (newsCount[n.key] ?? 0) + 1;
    if (!(n.key in en)) err(`${label}: nyheden ${n.key} mangler engelsk tekst`);
    else if (!(n.key in da)) warn(`${label}: nyheden ${n.key} mangler dansk tekst`);
  }
  const me = g.clubs[g.userClub];
  const ps = Object.values(g.players);
  const fees = ps.flatMap((p) => (p.moves ?? []).filter((mv) => mv.date >= `${g.season - 1}-07-01` && (mv.fee ?? 0) > 0).map((mv) => mv.fee!));
  console.log(`${label} · ${g.date} · spillere ${ps.length} (frie ${ps.filter((p) => !p.club).length}) · klubber i minus ${negative} · transfers ${fees.length} (max ${m(Math.max(0, ...fees))})`
    + ` · min klub ${me?.name ?? 'ARBEJDSLØS'} saldo ${me ? m(me.balance) : '-'} tillid ${Math.round(g.board.confidence)} · nyheder ${seenNews.size - lastNewsId}`);
  lastNewsId = seenNews.size;
}

check('start');
const t0 = Date.now();
const end = g.season + seasons;
let days = 0, lastSeason = g.season, jobs = 0;
while (g.season < end && days++ < 400 * seasons) {
  let r;
  // fyret: tag det første jobtilbud (ellers søg en ledig stilling), så hele perioden spilles med en klub
  if (!g.userClub) {
    const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
    if (offer) { applyAction({ t: 'acceptJob', club: offer }); console.log(`  ${g.date}: nyt job i ${g.clubs[offer].name}`); jobs++; }
    else if (days % 7 === 0) for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    for (const id of Object.keys(g.manager.jobTalks ?? {})) if (g.manager.jobTalks![Number(id)].stage === 'offer') applyAction({ t: 'acceptJob', club: Number(id) });
  }
  try { r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
  catch (e) { err(`${g.date}: undtagelse ${(e as Error).stack?.split('\n').slice(0, 3).join(' | ')}`); break; }
  if (g.season !== lastSeason) {
    lastSeason = g.season;
    check(`sæson ${g.season}`);
    // sæsonens afslutning: mestre, pokalvindere, europæiske vindere og priser
    const prev = Object.values(g.comps);
    if (!prev.some((c) => c.type === 'league')) err(`sæson ${g.season}: ingen ligaer sat op`);
    if (!g.comps.CL) warn(`sæson ${g.season}: ingen Champions League`);
    if (!g.manager.history.length && g.season > end - seasons + 1) warn(`sæson ${g.season}: managerens historik er tom`);
  }
}
console.log(`\njob efter fyring: ${jobs}`);
console.log(`\n${seasons} sæsoner på ${Math.round((Date.now() - t0) / 1000)} s`);
const spam = Object.entries(newsCount).filter(([, v]) => v / seasons > 60).sort((a, b) => b[1] - a[1]);
if (spam.length) warn(`mange nyheder pr. sæson: ${spam.map(([k, v]) => `${k} ${Math.round(v / seasons)}`).join(', ')}`);
console.log(`nyhedstyper set: ${Object.keys(newsCount).length}`);
for (const w2 of warns) console.log(`⚠ ${w2}`);
for (const e of errors) console.log(`✗ ${e}`);
console.log(errors.length ? `\n${errors.length} fejl, ${warns.length} advarsler` : `\nIngen fejl · ${warns.length} advarsler`);
process.exit(errors.length ? 1 : 0);
