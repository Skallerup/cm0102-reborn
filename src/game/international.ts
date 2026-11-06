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
export interface IntlTournament { name: 'wc' | 'euro'; year: number; groups: number[][]; table: Record<number, IntlRow>; ko: IntlTie[]; stage: string; winner?: number; runnerUp?: number }
export interface IntlResult { date: string; home: number; away: number; hg: number; ag: number; kind: 'friendly' | 'wc' | 'euro'; stage?: string }
export interface NatInfo { stadium: string; cap: number; fifa: number; coach: string; rep: number; titles: Record<string, number> }
export interface PastFinal { c: string; y: number; w: string; r: string; t?: string; h: string }
export interface IntlState {
  results: IntlResult[]; tournament?: IntlTournament; history: { year: number; name: 'wc' | 'euro'; winner: number; runnerUp: number }[];
  /** originalens data (kun den originale database): stadion, FIFA-koefficient, landstræner, titler og slutrunder før 2001 */
  info?: Record<number, NatInfo>; past?: PastFinal[];
  /** FIFA-point pr. nation (start: originalens koefficient eller styrken; opdateres efter hver landskamp – *estimeret* Elo) */
  fifa?: Record<number, number>;
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
  return sq.length >= 14 ? sq.reduce((s, p) => s + p.ca, 0) / sq.length : 0;
}

function ranked(filter?: (n: number) => boolean): number[] {
  const g = gs();
  return g.nations.map((_, i) => i).filter((i) => (!filter || filter(i)) && nationStrength(i) > 0).sort((a, b) => nationStrength(b) - nationStrength(a));
}

/** Spil en landskamp i kampmotoren og bogfør landskampe, mål og skader */
function play(home: number, away: number, kind: IntlResult['kind'], stage?: string, needsWinner = false): IntlResult & { pens?: [number, number] } {
  const g = gs();
  const r = new Rng(hash(g.seed, home, away, Number(g.date.replace(/-/g, ''))));
  const team = (n: number) => {
    const sq = nationSquad(n).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: Math.max(80, p.condition) }) as Player);
    return { club: -1 - n, tactic: autoSelect(newTactic('4-4-2'), sq), players: new Map(sq.map((p) => [p.id, p])) };
  };
  const sim = new MatchSim(team(home), team(away), { commentary: false, aiSubs: [true, true], importance: kind === 'friendly' ? 0.3 : 1, neutral: kind !== 'friendly', ...(needsWinner ? { needsWinner: () => true } : {}), date: g.date }, r);
  const rep = sim.runToEnd();
  const [hs, as] = rep.stats;
  for (const line of rep.players) {
    const p = g.players[line.id];
    if (!p || line.minutes <= 0) continue;
    p.caps = (p.caps ?? 0) + 1;
    p.intGoals = (p.intGoals ?? 0) + line.goals;
    // kampreferat til spillerens klub (CM 01/02: "scored", "hat-trick", "sent off", "man of the match")
    const pk = line.goals >= 3 ? 'intl.p.hattrick' : line.red ? 'intl.p.red' : line.goals > 0 ? 'intl.p.scored' : rep.mom === p.id ? 'intl.p.mom' : '';
    if (pk && isHumanClub(p.club)) asOwner(p.club, () => addNews({ cat: 'general', key: pk, params: { player: `${p.first} ${p.last}`.trim(), nation: g.nations[p.nation]?.name ?? '', opp: g.nations[p.nation === home ? away : home]?.name ?? '', n: line.goals }, link: { kind: 'player', id: p.id } }));
    p.condition = Math.max(50, p.condition - 8);
    if (line.injured && !p.injury) {
      const days = rng.int(4, 21);
      p.injury = { key: INJ[rng.int(0, INJ.length - 1)], days, total: days };
      if (isHumanClub(p.club)) asOwner(p.club, () => addNews({ cat: 'injury', key: 'intl.injured', params: { player: `${p.first} ${p.last}`.trim(), nation: g.nations[p.nation]?.name ?? '', days }, link: { kind: 'player', id: p.id } }));
    }
  }
  const res: IntlResult & { pens?: [number, number] } = { date: g.date, home, away, hg: hs.goals, ag: as.goals, kind, stage, ...(rep.pens ? { pens: rep.pens } : {}) };
  const st = state();
  st.results = [res, ...st.results].slice(0, 150);
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

/** Brugerens spillere, der er udtaget til landsholdet (nyhed to dage før vinduet) */
function callUpNews(nations: number[]) {
  const g = gs();
  const picked = new Set(nations.flatMap((n) => nationSquad(n).map((p) => p.id)));
  forEachHuman(() => {
    const mine = Object.values(g.players).filter((p) => p.club === g.userClub && picked.has(p.id));
    if (mine.length) addNews({ cat: 'general', key: 'intl.callup', params: { n: mine.length, players: mine.slice(0, 6).map((p) => `${p.first} ${p.last}`.trim()).join(', ') } });
  });
}

function friendlies() {
  // de 64 stærkeste lande spiller én kamp hver, mod et land fra samme verdensdel
  const g = gs();
  const pool = ranked().slice(0, 64);
  const byRegion = new Map<string, number[]>();
  for (const n of pool) { const r = regionOf(g.nations[n]?.name); (byRegion.get(r) ?? byRegion.set(r, []).get(r)!).push(n); }
  for (const list of byRegion.values()) {
    const sh = rng.shuffle(list.slice());
    for (let i = 0; i + 1 < sh.length; i += 2) play(sh[i], sh[i + 1], 'friendly');
  }
}

/** VM 2002 i Sydkorea og Japan: de rigtige 32 deltagere og grupper A-H */
const WC2002 = [['France', 'Senegal', 'Uruguay', 'Denmark'], ['Spain', 'Slovenia', 'Paraguay', 'South Africa'], ['Brazil', 'Turkey', 'China PR', 'Costa Rica'],
  ['South Korea', 'Poland', 'United States', 'Portugal'], ['Germany', 'Saudi Arabia', 'Republic of Ireland', 'Cameroon'], ['Argentina', 'Nigeria', 'England', 'Sweden'],
  ['Italy', 'Ecuador', 'Croatia', 'Mexico'], ['Japan', 'Belgium', 'Russia', 'Tunisia']];

function startTournament(name: 'wc' | 'euro', year: number) {
  const g = gs();
  const real = name === 'wc' && year === 2002 ? WC2002.map((grp) => grp.map((nm) => g.nations.findIndex((x) => x.name === nm))) : null;
  const realOk = real && real.flat().every((n) => n >= 0 && nationSquad(n).length >= 11);
  const field = realOk ? real!.flat() : name === 'wc' ? ranked().slice(0, 32) : ranked((n) => regionOf(g.nations[n]?.name) === 'europe').slice(0, 16);
  if (field.length < 16) return;
  const pots = [0, 1, 2, 3].map((k) => rng.shuffle(field.slice(k * field.length / 4, (k + 1) * field.length / 4)));
  const groups = realOk ? real! : pots[0].map((_, i) => pots.map((pot) => pot[i]));
  const t: IntlTournament = { name, year, groups, table: {}, ko: [], stage: 'G1' };
  for (const n of field) t.table[n] = { n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  state().tournament = t;
  callUpNews(field);
  forEachHuman(() => addNews({ cat: 'general', key: `intl.start.${name}`, params: { year, n: field.length } }));
}

const rowsOf = (t: IntlTournament, grp: number[]) => grp.map((n) => t.table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);

function tournamentDay() {
  const g = gs();
  const t = state().tournament;
  if (!t || t.stage === 'done') return;
  const md = g.date.slice(5);
  const round = GROUP_DAYS.indexOf(md);
  if (round >= 0 && t.stage === `G${round + 1}`) {
    // runde 1: 1-2, 3-4 · runde 2: 1-3, 2-4 · runde 3: 1-4, 2-3
    const pairs = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]][round];
    for (const grp of t.groups) for (const [i, j] of pairs) {
      const r = play(grp[i], grp[j], t.name);
      const a = t.table[grp[i]], b = t.table[grp[j]];
      a.p++; b.p++; a.gf += r.hg; a.ga += r.ag; b.gf += r.ag; b.ga += r.hg;
      if (r.hg > r.ag) { a.w++; a.pts += 3; b.l++; } else if (r.hg < r.ag) { b.w++; b.pts += 3; a.l++; } else { a.d++; b.d++; a.pts++; b.pts++; }
    }
    t.stage = round < 2 ? `G${round + 2}` : t.groups.length >= 8 ? 'R16' : 'QF';
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
  if (!ko.length || KO_DAYS[t.stage] !== md) return;
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
  if (WINDOWS.some((w) => addDays(g.date, 2).slice(5) === w)) callUpNews(ranked().slice(0, 64));
  if (WINDOWS.includes(md)) friendlies();
  // slutrunder: VM i år ≡ 2 (mod 4), EM i år ≡ 0 (mod 4) – lodtrækning 1. juni
  if (md === '06-01' && (year % 4 === 2 || year % 4 === 0)) startTournament(year % 4 === 2 ? 'wc' : 'euro', year);
  tournamentDay();
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
