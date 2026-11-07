// Landsholdsfodbold (CM 01/02: national_teams.cpp): landskampe i landsholdsvinduerne, VM hvert fjerde år (2002, 2006 …)
// og EM imellem (2004, 2008 …). Landene udtager deres bedste spillere, kampene spilles i kampmotoren, og landskampe,
// mål og skader tæller for spillerne. Datoer og udvælgelse er *estimeret* (originalens regler er ikke læst).
// Importerer ikke sim.ts (cirkulære imports) – sim.ts kalder intlDaily().
import { ageOn, addDays } from './dates';
import { MatchSim } from './engine/match';
import { naturalRole } from './attributes';
import { asOwner, forEachHuman, isHumanClub } from './humans';
import { regionOf } from './leagues';
import { Rng, hash, rng } from './rng';
import { addNews, gs } from './state';
import { autoSelect, newTactic } from './tactics';
import type { Player } from './types';

export interface IntlRow { n: number; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number }
export interface IntlTie { stage: string; a: number; b: number; hg?: number; ag?: number; pens?: boolean; winner?: number }
export type IntlName = 'wc' | 'euro' | 'copa' | 'afcon' | 'asian';
export interface IntlTournament {
  name: IntlName; year: number; groups: number[][]; table: Record<number, IntlRow>; ko: IntlTie[]; stage: string; winner?: number; runnerUp?: number;
  /** spilledage (MM-DD): gruppespillets runder og knockoutrunderne – udeladt = VM/EM i juni/juli */
  days?: { g: string[]; ko: Record<string, string> };
}
/** Kvalifikationen til næste VM/EM: grupper af fire i hver verdensdel, spillet i landsholdsvinduerne (*estimeret* format) */
export interface IntlQual { name: 'wc' | 'euro'; year: number; groups: number[][]; region: string[]; table: Record<number, IntlRow>; round: number; qualified?: number[] }
export interface IntlResult { date: string; home: number; away: number; hg: number; ag: number; kind: 'friendly' | 'wc' | 'euro' | 'copa' | 'afcon' | 'asian' | 'wcq' | 'euroq' | 'u21'; stage?: string }
export interface NatInfo { stadium: string; cap: number; fifa: number; coach: string; rep: number; titles: Record<string, number> }
export interface PastFinal { c: string; y: number; w: string; r: string; t?: string; h: string }
export interface IntlState {
  results: IntlResult[]; tournament?: IntlTournament; history: { year: number; name: IntlName; winner: number; runnerUp: number }[];
  /** kontinentale slutrunder (Copa América, Afrikamesterskabet, Asian Cup) */
  cont?: IntlTournament[];
  qual?: IntlQual;
  /** originalens data (kun den originale database): stadion, FIFA-koefficient, landstræner, titler og slutrunder før 2001 */
  info?: Record<number, NatInfo>; past?: PastFinal[];
  /** FIFA-point pr. nation (start: originalens koefficient eller styrken; opdateres efter hver landskamp – *estimeret* Elo) */
  fifa?: Record<number, number>;
  /** næste vindues venskabskampe, lagt fast ved udtagelsen (så nyheden kan nævne modstanderen) */
  plan?: { date: string; friendlies: [number, number][] };
}

const WINDOWS = ['09-05', '10-09', '11-13', '03-26'];
const GROUP_DAYS = ['06-10', '06-14', '06-18'];
const KO_DAYS: Record<string, string> = { R16: '06-23', QF: '06-27', SF: '07-01', F: '07-05' };
const INJ = ['bruise', 'hamstring', 'groin', 'calf', 'knee', 'back'];

const state = (): IntlState => (gs().intl ??= { results: [], history: [] });

/** Landets spillere pr. nation (bygges én gang pr. dag) */
let cache: { date: string; by: Map<number, Player[]> } | null = null;
function byNation(): Map<number, Player[]> {
  const g = gs();
  if (cache?.date === g.date) return cache.by;
  const by = new Map<number, Player[]>();
  for (const p of Object.values(g.players)) {
    const age = ageOn(p.dob, g.date);
    if (age < 17 || age > 36 || p.injury || p.ca < 60) continue;
    (by.get(p.nation) ?? by.set(p.nation, []).get(p.nation)!).push(p);
  }
  for (const list of by.values()) list.sort((a, b) => b.ca - a.ca);
  cache = { date: g.date, by };
  return by;
}

/** Landsholdstruppen: de 23 bedste, mindst 3 målmænd – eller landstrænerens egen udtagelse (skadede melder afbud) */
export function nationSquad(n: number): Player[] {
  const g = gs();
  const nj = g.manager?.national;
  if (nj?.nation === n && nj.picks?.length) {
    const picked = nj.picks.map((id) => g.players[id]).filter((p): p is Player => !!p && !p.injury && p.nation === n);
    // afbud: fyld op med de bedste, der ikke er udtaget
    const extra = (byNation().get(n) ?? []).filter((p) => !picked.includes(p)).slice(0, Math.max(0, 20 - picked.length));
    return [...picked, ...extra];
  }
  const all = byNation().get(n) ?? [];
  const gk = all.filter((p) => naturalRole(p) === 'GK').slice(0, 3);
  const out = all.filter((p) => naturalRole(p) !== 'GK').slice(0, 23 - gk.length);
  return [...gk, ...out];
}

/** Landets styrke: snit af de 16 bedste (bruges til udvælgelse af deltagere og seedning) */
export function nationStrength(n: number): number {
  const sq = nationSquad(n).slice(0, 16);
  // uden målmand kan landet ikke spille (kampmotoren kræver en)
  if (!sq.some((p) => naturalRole(p) === 'GK')) return 0;
  return sq.length >= 14 ? sq.reduce((s, p) => s + p.ca, 0) / sq.length : 0;
}

function ranked(filter?: (n: number) => boolean): number[] {
  const g = gs();
  return g.nations.map((_, i) => i).filter((i) => (!filter || filter(i)) && nationStrength(i) > 0).sort((a, b) => nationStrength(b) - nationStrength(a));
}

/** Spil en landskamp i kampmotoren og bogfør landskampe, mål og skader */
function play(home: number, away: number, kind: IntlResult['kind'], stage?: string, needsWinner = false): IntlResult & { pens?: [number, number] } {
  const g = gs();
  const u21 = kind === 'u21';
  const r = new Rng(hash(g.seed, home, away, Number(g.date.replace(/-/g, '')), u21 ? 21 : 0));
  const team = (n: number) => {
    const sq = (u21 ? u21Squad(n) : nationSquad(n)).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: Math.max(80, p.condition) }) as Player);
    return { club: -1 - n, tactic: autoSelect(newTactic('4-4-2'), sq), players: new Map(sq.map((p) => [p.id, p])) };
  };
  const sim = new MatchSim(team(home), team(away), { commentary: false, aiSubs: [true, true], importance: kind === 'friendly' ? 0.3 : 1, neutral: kind !== 'friendly', ...(needsWinner ? { needsWinner: () => true } : {}), date: g.date }, r);
  const rep = sim.runToEnd();
  const [hs, as] = rep.stats;
  for (const line of rep.players) {
    const p = g.players[line.id];
    if (!p || line.minutes <= 0 || u21) continue;
    p.caps = (p.caps ?? 0) + 1;
    p.intGoals = (p.intGoals ?? 0) + line.goals;
    // kampreferat til spillerens klub (CM 01/02: "scored", "hat-trick", "sent off", "man of the match")
    const pk = line.goals >= 3 ? 'intl.p.hattrick' : line.red ? 'intl.p.red' : line.goals > 0 ? 'intl.p.scored' : rep.mom === p.id ? 'intl.p.mom' : '';
    if (pk && isHumanClub(p.club)) asOwner(p.club, () => addNews({ cat: 'general', key: pk, params: { player: `${p.first} ${p.last}`.trim(), nation: g.nations[p.nation]?.name ?? '', opp: g.nations[p.nation === home ? away : home]?.name ?? '', n: line.goals }, link: { kind: 'player', id: p.id } }));
    p.condition = Math.max(50, p.condition - 8);
    if (line.injured && !p.injury) {
      const days = rng.int(4, 21);
      p.injury = { key: INJ[rng.int(0, INJ.length - 1)], days, total: days };
      (p.injuryLog ??= []).push({ d: g.date, k: p.injury.key, days });
      if (isHumanClub(p.club)) asOwner(p.club, () => addNews({ cat: 'injury', key: 'intl.injured', params: { player: `${p.first} ${p.last}`.trim(), nation: g.nations[p.nation]?.name ?? '', days }, link: { kind: 'player', id: p.id } }));
    }
  }
  const res: IntlResult & { pens?: [number, number] } = { date: g.date, home, away, hg: hs.goals, ag: as.goals, kind, stage, ...(rep.pens ? { pens: rep.pens } : {}) };
  const st = state();
  st.results = [res, ...st.results].slice(0, 150);
  if (u21) return res;
  updateFifa(home, away, res.hg, res.ag, kind);
  // brugerens landshold: resultat og statistik
  forEachHuman(() => {
    const nj = g.manager.national;
    if (!nj || (nj.nation !== home && nj.nation !== away)) return;
    const mine = nj.nation === home ? res.hg : res.ag, theirs = nj.nation === home ? res.ag : res.hg;
    nj.played++; if (mine > theirs) nj.won++;
    nj.form = [...(nj.form ?? []), mine > theirs ? 3 : mine === theirs ? 1 : 0].slice(-6);
    // CM 01/02: forbundet fyrer landstræneren "following a run of poor results" (grænsen er *estimeret*)
    if (nj.played >= 6 && nj.form.length >= 5 && nj.form.reduce((s2, v) => s2 + v, 0) <= 3) {
      g.manager.national = undefined;
      addNews({ cat: 'job', key: 'intl.sacked', params: { nation: g.nations[nj.nation]?.name ?? '', played: nj.played, won: nj.won } });
      return;
    }
    g.manager.rep = Math.max(0, Math.min(100, g.manager.rep + (mine > theirs ? 0.4 : mine < theirs ? -0.3 : 0)));
    addNews({ cat: 'match', key: mine > theirs ? 'intl.my.won' : mine < theirs ? 'intl.my.lost' : 'intl.my.drew', params: { nation: g.nations[nj.nation]?.name ?? '', opp: g.nations[nj.nation === home ? away : home]?.name ?? '', score: `${mine}-${theirs}` } });
  });
  return res;
}

/** CM 01/02: én nyhed pr. landshold med brugerens spillere – "Giggs selected in Wales squad" / "Man Utd players selected in
 *  England squad" – "… have been called up to the England squad for the match against Holland." (to dage før vinduet) */
function callUpNews(nations: number[], opp: Map<number, number> = new Map()) {
  const g = gs();
  const squads = new Map(nations.map((n) => [n, new Set(nationSquad(n).map((p) => p.id))]));
  forEachHuman(() => {
    const club = g.clubs[g.userClub];
    if (!club) return;
    for (const [n, ids] of squads) {
      const mine = Object.values(g.players).filter((p) => p.club === g.userClub && ids.has(p.id));
      if (!mine.length) continue;
      const o = opp.get(n);
      addNews({ cat: 'general', key: mine.length === 1 ? 'intl.sel1' : 'intl.selN', params: {
        player: mine[0].last, club: club.short, nation: g.nations[n]?.name ?? '', opp: o !== undefined ? g.nations[o]?.name ?? '' : '',
        names: mine.length <= 3 ? mine.map((p) => `${p.first} ${p.last}`.trim()).join(' & ') : '', n: mine.length, ...(o === undefined ? { noOpp: 1 } : {}),
      }, link: mine.length === 1 ? { kind: 'player', id: mine[0].id } : { kind: 'club', id: club.id } });
    }
  });
}

/** Næste vindues kampe: kvalifikationsrunden (fast rækkefølge) og venskabskampene (trukket nu og gemt i state().plan) */
function planWindow(date: string): Map<number, number> {
  const opp = new Map<number, number>();
  const q = state().qual;
  const busy = new Set<number>();
  if (q && q.round < 4) {
    const pairs = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]], [[1, 0], [3, 2]]][q.round];
    for (const grp of q.groups) for (const [i, j] of pairs) { opp.set(grp[i], grp[j]); opp.set(grp[j], grp[i]); busy.add(grp[i]); busy.add(grp[j]); }
  }
  const pairs = friendlyPairs(busy);
  state().plan = { date, friendlies: pairs };
  for (const [a, b] of pairs) { opp.set(a, b); opp.set(b, a); }
  return opp;
}

function friendlyPairs(busy: Set<number>): [number, number][] {
  // de 64 stærkeste lande spiller én kamp hver, mod et land fra samme verdensdel (lande i kvalifikation spiller den)
  const g = gs();
  const pool = ranked().slice(0, 64).filter((n) => !busy.has(n));
  const byRegion = new Map<string, number[]>();
  for (const n of pool) { const r = regionOf(g.nations[n]?.name); (byRegion.get(r) ?? byRegion.set(r, []).get(r)!).push(n); }
  const out: [number, number][] = [];
  for (const list of byRegion.values()) {
    const sh = rng.shuffle(list.slice());
    for (let i = 0; i + 1 < sh.length; i += 2) out.push([sh[i], sh[i + 1]]);
  }
  return out;
}

function friendlies(busy: Set<number> = new Set()) {
  // kampene, der blev trukket ved udtagelsen (ellers trækkes de nu)
  const plan = state().plan;
  const pairs = plan?.date === gs().date ? plan.friendlies.filter(([a, b]) => !busy.has(a) && !busy.has(b)) : friendlyPairs(busy);
  state().plan = undefined;
  for (const [a, b] of pairs) play(a, b, 'friendly');
}

/** VM 2002 i Sydkorea og Japan: de rigtige 32 deltagere og grupper A-H */
const WC2002 = [['France', 'Senegal', 'Uruguay', 'Denmark'], ['Spain', 'Slovenia', 'Paraguay', 'South Africa'], ['Brazil', 'Turkey', 'China PR', 'Costa Rica'],
  ['South Korea', 'Poland', 'United States', 'Portugal'], ['Germany', 'Saudi Arabia', 'Republic of Ireland', 'Cameroon'], ['Argentina', 'Nigeria', 'England', 'Sweden'],
  ['Italy', 'Ecuador', 'Croatia', 'Mexico'], ['Japan', 'Belgium', 'Russia', 'Tunisia']];

function startTournament(name: 'wc' | 'euro', year: number) {
  const g = gs();
  const real = name === 'wc' && year === 2002 ? WC2002.map((grp) => grp.map((nm) => g.nations.findIndex((x) => x.name === nm))) : null;
  const realOk = real && real.flat().every((n) => n >= 0 && nationSquad(n).length >= 11);
  // feltet: VM 2002 = de rigtige 32; ellers kvalifikationens vindere, fyldt op efter styrke
  const q = state().qual?.name === name && state().qual?.year === year ? state().qual!.qualified ?? [] : [];
  const size = name === 'wc' ? 32 : 16;
  const pool = name === 'wc' ? ranked() : ranked((n) => regionOf(g.nations[n]?.name) === 'europe');
  const qualified = [...q, ...pool.filter((n) => !q.includes(n))].slice(0, size).sort((a, b) => nationStrength(b) - nationStrength(a));
  const field = realOk ? real!.flat() : qualified;
  if (field.length < 16) return;
  const pots = [0, 1, 2, 3].map((k) => rng.shuffle(field.slice(k * field.length / 4, (k + 1) * field.length / 4)));
  const groups = realOk ? real! : pots[0].map((_, i) => pots.map((pot) => pot[i]));
  const t: IntlTournament = { name, year, groups, table: {}, ko: [], stage: 'G1' };
  for (const n of field) t.table[n] = { n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  state().tournament = t;
  state().qual = undefined;
  callUpNews(field);
  forEachHuman(() => addNews({ cat: 'general', key: `intl.start.${name}`, params: { year, n: field.length } }));
}

/** Kontinentale slutrunder: Afrikamesterskabet (januar, lige år), Copa América og Asian Cup (juli hvert 3. år fra 2004) */
const CONT: Record<'copa' | 'afcon' | 'asian', { regions: string[]; days: { g: string[]; ko: Record<string, string> } }> = {
  afcon: { regions: ['africa'], days: { g: ['01-20', '01-24', '01-28'], ko: { QF: '02-01', SF: '02-05', F: '02-09' } } },
  copa: { regions: ['southAmerica', 'northAmerica'], days: { g: ['07-08', '07-11', '07-14'], ko: { QF: '07-18', SF: '07-21', F: '07-25' } } },
  asian: { regions: ['asia'], days: { g: ['07-09', '07-12', '07-15'], ko: { QF: '07-19', SF: '07-22', F: '07-26' } } },
};
function startContinental(name: 'copa' | 'afcon' | 'asian', year: number) {
  const g = gs();
  const c = CONT[name];
  // Copa: Sydamerika først, gæster fra Nord- og Mellemamerika fylder op
  const pool = c.regions.flatMap((r) => ranked((n) => regionOf(g.nations[n]?.name) === r));
  // få lande med spillere nok i databasen: 8 (to grupper) eller 4 (én gruppe, nr. 1 og 2 spiller finalen)
  const size = pool.length >= 16 ? 16 : pool.length >= 8 ? 8 : pool.length >= 4 ? 4 : 0;
  if (!size) return;
  const field = pool.slice(0, size).sort((a, b) => nationStrength(b) - nationStrength(a));
  const pots = [0, 1, 2, 3].map((k) => rng.shuffle(field.slice(k * size / 4, (k + 1) * size / 4)));
  const groups = pots[0].map((_, i) => pots.map((pot) => pot[i]));
  const t: IntlTournament = { name, year, groups, table: {}, ko: [], stage: 'G1', days: c.days };
  for (const n of field) t.table[n] = { n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  const st = state();
  st.cont = [...(st.cont ?? []).filter((x) => x.name !== name), t];
  callUpNews(field);
  forEachHuman(() => addNews({ cat: 'general', key: `intl.start.${name}`, params: { year, n: field.length } }));
}

/** Kvalifikationen begynder i august året før slutrunden: grupper af fire pr. verdensdel (EM: kun Europa) */
function startQualification(name: 'wc' | 'euro', year: number) {
  const g = gs();
  const regions = name === 'wc' ? ['europe', 'southAmerica', 'africa', 'asia', 'northAmerica'] : ['europe'];
  const groups: number[][] = [], region: string[] = [];
  for (const r of regions) {
    const pool = ranked((n) => regionOf(g.nations[n]?.name) === r).slice(0, r === 'europe' ? 52 : 24);
    const n4 = Math.floor(pool.length / 4);
    if (!n4) continue;
    const use = pool.slice(0, n4 * 4);
    const pots = [0, 1, 2, 3].map((k) => rng.shuffle(use.slice(k * n4, (k + 1) * n4)));
    for (let i = 0; i < n4; i++) { groups.push(pots.map((pot) => pot[i])); region.push(r); }
  }
  if (!groups.length) return;
  const table: Record<number, IntlRow> = {};
  for (const n of groups.flat()) table[n] = { n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  state().qual = { name, year, groups, region, table, round: 0 };
  forEachHuman(() => addNews({ cat: 'general', key: `intl.qual.start.${name}`, params: { year } }));
}

/** En kvalifikationsrunde (i hvert landsholdsvindue); efter fjerde runde er de kvalificerede fundet */
function qualRound() {
  const g = gs();
  const q = state().qual;
  if (!q || q.round >= 4) return new Set<number>();
  const pairs = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]], [[1, 0], [3, 2]]][q.round];
  for (const grp of q.groups) for (const [i, j] of pairs) {
    const r = play(grp[i], grp[j], q.name === 'wc' ? 'wcq' : 'euroq');
    const a = q.table[grp[i]], b = q.table[grp[j]];
    a.p++; b.p++; a.gf += r.hg; a.ga += r.ag; b.gf += r.ag; b.ga += r.hg;
    if (r.hg > r.ag) { a.w++; a.pts += 3; b.l++; } else if (r.hg < r.ag) { b.w++; b.pts += 3; a.l++; } else { a.d++; b.d++; a.pts++; b.pts++; }
  }
  q.round++;
  if (q.round === 4) {
    // pladser pr. verdensdel (VM: Europa 14, Sydamerika 5, Afrika 5, Asien 4, Nord- og Mellemamerika 3 · EM: 16)
    const slots: Record<string, number> = q.name === 'wc' ? { europe: 14, southAmerica: 5, africa: 5, asia: 4, northAmerica: 3 } : { europe: 16 };
    const qualified: number[] = [];
    for (const [r, n] of Object.entries(slots)) {
      const gs2 = q.groups.filter((_, i) => q.region[i] === r).map((grp) => rowsOf2(q.table, grp));
      const firsts = gs2.map((x) => x[0]), seconds = gs2.map((x) => x[1]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga));
      qualified.push(...[...firsts, ...seconds].slice(0, n).map((x) => x.n));
    }
    q.qualified = qualified;
    forEachHuman(() => {
      const mine = g.clubs[g.userClub]?.nation;
      for (const n of qualified.filter((x) => x === mine || x === g.manager.national?.nation)) addNews({ cat: 'general', key: `intl.qual.done.${q.name}`, params: { nation: g.nations[n]?.name ?? '', year: q.year } });
    });
  }
  return new Set(q.groups.flat());
}
const rowsOf2 = (table: Record<number, IntlRow>, grp: number[]) => grp.map((n) => table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);

/** U21-landsholdet: de 20 bedste spillere på 21 år eller yngre */
export function u21Squad(n: number): Player[] {
  const g = gs();
  const all = (byNation().get(n) ?? []).filter((p) => ageOn(p.dob, g.date) <= 21);
  // to målmænd og 18 markspillere (uden målmand kan kampen ikke spilles)
  const gk = all.filter((p) => naturalRole(p) === 'GK').slice(0, 2);
  return gk.length ? [...gk, ...all.filter((p) => naturalRole(p) !== 'GK').slice(0, 18)] : [];
}
/** U21-landskampe i vinduerne for de 32 stærkeste europæiske lande (tæller ikke som landskampe) */
function u21Friendlies() {
  const g = gs();
  const pool = ranked((n) => regionOf(g.nations[n]?.name) === 'europe').filter((n) => u21Squad(n).length >= 14).slice(0, 32);
  const sh = rng.shuffle(pool.slice());
  for (let i = 0; i + 1 < sh.length; i += 2) play(sh[i], sh[i + 1], 'u21');
}

const rowsOf = (t: IntlTournament, grp: number[]) => grp.map((n) => t.table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);

function tournamentDay(t: IntlTournament | undefined) {
  const g = gs();
  if (!t || t.stage === 'done') return;
  const md = g.date.slice(5);
  const gdays = t.days?.g ?? GROUP_DAYS, kdays = t.days?.ko ?? KO_DAYS;
  const round = gdays.indexOf(md);
  if (round >= 0 && t.stage === `G${round + 1}`) {
    // runde 1: 1-2, 3-4 · runde 2: 1-3, 2-4 · runde 3: 1-4, 2-3
    const pairs = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]][round];
    for (const grp of t.groups) for (const [i, j] of pairs) {
      const r = play(grp[i], grp[j], t.name);
      const a = t.table[grp[i]], b = t.table[grp[j]];
      a.p++; b.p++; a.gf += r.hg; a.ga += r.ag; b.gf += r.ag; b.ga += r.hg;
      if (r.hg > r.ag) { a.w++; a.pts += 3; b.l++; } else if (r.hg < r.ag) { b.w++; b.pts += 3; a.l++; } else { a.d++; b.d++; a.pts++; b.pts++; }
    }
    t.stage = round < 2 ? `G${round + 2}` : t.groups.length >= 8 ? 'R16' : t.groups.length >= 4 ? 'QF' : t.groups.length >= 2 ? 'SF' : 'F';
    if (round === 2 && t.groups.length === 1) { const r = rowsOf(t, t.groups[0]); t.ko.push({ stage: 'F', a: r[0].n, b: r[1].n }); return; }
    if (round === 2) {
      // knockout: vinder gruppe A mod toer gruppe B osv.
      const firsts = t.groups.map((grp) => rowsOf(t, grp)[0].n), seconds = t.groups.map((grp) => rowsOf(t, grp)[1].n);
      const ties: IntlTie[] = [];
      for (let i = 0; i < firsts.length; i += 2) { ties.push({ stage: t.stage, a: firsts[i], b: seconds[i + 1] }); ties.push({ stage: t.stage, a: firsts[i + 1], b: seconds[i] }); }
      t.ko.push(...ties);
    }
    return;
  }
  const ko = t.ko.filter((x) => x.stage === t.stage && x.winner === undefined);
  if (!ko.length || kdays[t.stage] !== md) return;
  for (const tie of ko) {
    const r = play(tie.a, tie.b, t.name, tie.stage, true);
    tie.hg = r.hg; tie.ag = r.ag; tie.pens = !!r.pens;
    tie.winner = r.hg > r.ag ? tie.a : r.hg < r.ag ? tie.b : r.pens ? (r.pens[0] > r.pens[1] ? tie.a : tie.b) : rng.chance(0.5) ? tie.a : tie.b;
  }
  const winners = ko.map((x) => x.winner!);
  if (t.stage === 'F') {
    t.winner = winners[0]; t.runnerUp = ko[0].a === t.winner ? ko[0].b : ko[0].a; t.stage = 'done';
    state().history.unshift({ year: t.year, name: t.name, winner: t.winner, runnerUp: t.runnerUp });
    forEachHuman(() => addNews({ cat: 'general', key: `intl.winner.${t.name}`, params: { nation: g.nations[t.winner!]?.name ?? '', runnerUp: g.nations[t.runnerUp!]?.name ?? '', year: t.year } }));
    return;
  }
  const next = { R16: 'QF', QF: 'SF', SF: 'F' }[t.stage as 'R16' | 'QF' | 'SF'];
  for (let i = 0; i + 1 < winners.length; i += 2) t.ko.push({ stage: next, a: winners[i], b: winners[i + 1] });
  t.stage = next;
}

/** Hver dag (fra sim.ts): landsholdsvinduer og slutrunder */
export function intlDaily() {
  const g = gs();
  if (g.draft) return;
  const md = g.date.slice(5);
  const year = Number(g.date.slice(0, 4));
  if (WINDOWS.some((w) => addDays(g.date, 2).slice(5) === w)) { const opp = planWindow(addDays(g.date, 2)); callUpNews([...opp.keys()], opp); }
  if (WINDOWS.includes(md)) { const busy = qualRound(); friendlies(busy); u21Friendlies(); }
  // kvalifikation i august året før (VM i år ≡ 2, EM i år ≡ 0 mod 4)
  if (md === '08-20' && year % 2 === 1) startQualification((year + 1) % 4 === 2 ? 'wc' : 'euro', year + 1);
  // slutrunder: VM i år ≡ 2 (mod 4), EM i år ≡ 0 (mod 4) – lodtrækning 1. juni
  if (md === '06-01' && (year % 4 === 2 || year % 4 === 0)) startTournament(year % 4 === 2 ? 'wc' : 'euro', year);
  if (md === '01-10' && year % 2 === 0) startContinental('afcon', year);
  if (md === '07-06' && year % 3 === 0 && year >= 2004) { startContinental('copa', year); startContinental('asian', year); }
  tournamentDay(state().tournament);
  for (const c of state().cont ?? []) tournamentDay(c);
  if (md === '07-10' || md === '01-02') nationalOffers();
}

/**
 * Landstrænerjobbet (CM 01/02: man kan tage et landshold ved siden af klubben). Efter hver slutrunde og hver 1. januar
 * kan en manager med højt nok omdømme få et tilbud fra et land, hvis styrke passer til hans omdømme (*estimeret*).
 */
export function nationalOffers() {
  const g = gs();
  forEachHuman(() => {
    if (g.manager.national || g.manager.nationalOffer !== undefined || g.manager.rep < 55 || !rng.chance(0.35)) return;
    const own = g.manager.nation;
    const cands = ranked().slice(0, 60).filter((n) => Math.abs(nationStrength(n) - (60 + g.manager.rep)) < 25);
    const pick = cands.includes(own) && rng.chance(0.5) ? own : rng.pick(cands);
    if (pick === undefined) return;
    g.manager.nationalOffer = pick;
    addNews({ cat: 'job', key: 'intl.jobOffer', params: { nation: g.nations[pick]?.name ?? '' } });
  });
}

export function answerNationalOffer(accept: boolean): string {
  const g = gs();
  const n = g.manager.nationalOffer;
  if (n === undefined) return 'error';
  g.manager.nationalOffer = undefined;
  if (!accept) return 'ok';
  g.manager.national = { nation: n, since: g.date, played: 0, won: 0 };
  addNews({ cat: 'job', key: 'intl.jobTaken', params: { nation: g.nations[n]?.name ?? '' } });
  return 'ok';
}

export function resignNational(): string {
  const g = gs();
  const nj = g.manager.national;
  if (!nj) return 'error';
  g.manager.national = undefined;
  addNews({ cat: 'job', key: 'intl.jobLeft', params: { nation: g.nations[nj.nation]?.name ?? '', played: nj.played, won: nj.won } });
  return 'ok';
}

/** FIFA-point: start fra originalens koefficient (eller landets styrke), opdateret efter hver landskamp som Elo */
export function fifaPoints(n: number): number {
  const st = state();
  st.fifa ??= {};
  if (st.fifa[n] === undefined) st.fifa[n] = Math.round(st.info?.[n]?.fifa || nationStrength(n) * 5);
  return st.fifa[n];
}
function updateFifa(home: number, away: number, hg: number, ag: number, kind: IntlResult['kind']) {
  const a = fifaPoints(home), b = fifaPoints(away);
  const exp = 1 / (1 + Math.pow(10, (b - a) / 200));
  const score = hg > ag ? 1 : hg === ag ? 0.5 : 0;
  const k = kind === 'friendly' ? 10 : 25;
  const st = state();
  st.fifa![home] = Math.round(a + k * (score - exp));
  st.fifa![away] = Math.round(b - k * (score - exp));
}
/** FIFA-ranglisten: alle nationer med en trup, flest point først */
export function fifaRanking(): { n: number; pts: number }[] {
  const g = gs();
  return g.nations.map((_, n) => n).filter((n) => nationSquad(n).length >= 11 || state().info?.[n]).map((n) => ({ n, pts: fifaPoints(n) })).sort((x, y) => y.pts - x.pts);
}

/** Landstrænerens udtagelse: 20-24 spillere af nationaliteten (CM 01/02: "must have between 20 and 24 players") */
export function selectNationalSquad(pids: number[]): string {
  const g = gs();
  const nj = g.manager.national;
  if (!nj) return 'error';
  const ok = [...new Set(pids)].filter((id) => g.players[id]?.nation === nj.nation);
  if (ok.length < 20 || ok.length > 24) return 'intl.squadSize';
  nj.picks = ok;
  return 'intl.squadSaved';
}

/** Kandidaterne til landsholdet (de 45 bedste af nationaliteten, skadede udeladt) */
export const nationPool = (n: number): Player[] => (byNation().get(n) ?? []).slice(0, 45);

/** Er spilleren udtaget til sit landshold? (mærket "Int" i trupoversigterne som i CM 01/02) – gemt pr. spildag */
let intCache: { date: string; g: unknown; ids: Set<number> } | null = null;
export function isInternational(p: Player): boolean {
  const g = gs();
  if (!intCache || intCache.date !== g.date || intCache.g !== g) {
    const ids = new Set<number>();
    const nations = new Set(Object.values(g.players).filter((x) => x.club === g.userClub || x.caps > 0).map((x) => x.nation));
    for (const n of nations) for (const x of nationSquad(n)) ids.add(x.id);
    intCache = { date: g.date, g, ids };
  }
  return intCache.ids.has(p.id);
}
