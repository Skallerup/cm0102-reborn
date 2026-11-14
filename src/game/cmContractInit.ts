// Spilstartens kontrakter som i CM 01/02 – STAFF_CONTRACT::generate_initial_contract 0x85e960 (cm0102.exe 3.9.68, læst instruktion for
// instruktion 14/11-2026), kaldt for hver person med klub og job 0/8/0xb af CONTRACT_MANAGER::initialise_all_staff_contracts 0x4c7560
// (0x4c78a2) med personens værdi +0x52. Kun den originale database i ægte tilstand (cmActive) – spillets egne data i stedet for hukommelsen.
//
// Kontrakten (80 bytes): +0xc ugeløn (£), +0x10 målbonus, +0x14 assistbonus, +0x18 clean sheet-bonus (−1 = ingen), +0x1c..+0x20 klausulerne
// (0x85f940's tekster: 0 Non Promotion, 1 Minimum Fee, 2 Non Playing, 3 Relegation, 4 Manager Job Release Clause), +0x21 klausulens beløb (£,
// fælles for alle – den sidst satte vinder), +0x35 bit 7 (klubstatus 2 = semiprofessionel → "Part Time Contract").
//
// Hvad funktionen gør (adresser i 0x85e960):
//   bl (0x85eaa2): trunc(klubbens omdømme +0x80 / 500) + 1 (0x10624dd3 + sar 5 = /500); semiprofessionel klub (+0x64 = 2): bl − 1 i [1, 4].
//      Landsholdsspillere (+0x22 ≠ 0): bl += ftol(nation +0x85 · 0,25 · landskampe · 0,125) i [1, 4] (uden land: 1).
//   lønnen (0x85eb69): databasens løn staff +0x4e, hvis den er sat og ≤ 15 · omdømmet (spillerpost +0xb) – ellers −1, som 0x83a1b0's
//      0x862720 fylder ud senere; bonusserne regnes da af standardlønnen 0x864550 (ikke koblet til spillet: spillets løn, *estimeret*).
//   klausulerne (0x85edf4, kun med spillerpost):
//      Manager Job (+0x20) – alder > 32, omdømme > 3250, id % 3 = 0 og Prof + Determination + Ambition + id % 10 + alder − 28 > 45
//         (eller en ikke-spillerpost – spillets spillere har ingen);
//      Non Promotion (+0x1c, 0x85ee5b) – omdømme > 2750: rand(20) + 2·Amb − 3·Loy + omdømme/50 > 12·bl, ligaen (+0x43 = 2) har oprykning
//         (vtbl +0x98 = 0x684790): beløb = værdi + rand(værdi/4), mindst 250.000;
//      Non Playing (+0x1e, 0x85ef1a) – omdømme > 6500: omdømme/50 − 4·Loy − rand(20) > 14·bl: f = værdi + rand(værdi/4),
//         t = max(0,95·f + 150.000, 2·f) (> 12 mio. → 0,21·t + 9,5 mio.), beløb f + t, mindst 250.000;
//      Relegation (+0x1f, 0x85f014) – omdømme > 1750: omdømme/50 − 2·Loy + 3·Amb − rand(20) > 10·bl, ligaen har nedrykning (vtbl +0x9c =
//         0x6847b0): v = værdi − rand(værdi/2), mindst 50.000; Loy < 5 og Amb > 10 → ·0,5, Loy ≥ 5 og Amb > 10 → ·0,75, ellers Loy < 15 → ·0,85.
//      Minimum Fee (+0x1d) sættes aldrig her (0).
//   bonusserne (0x85f12d, w = lønnen i hele pund): b = trunc(w/20) − rand(trunc(w/40)) + 25 –
//      mål: angriber (+0x15) ≥ 15 · assist: midtbane/offensiv midtbane/angriber (+0x13/+0x14/+0x15) ≥ 15 · clean sheet: målmand (+0xf) = 20.
//   klubstatus 3 (amatør, 0x85f75e): ingen klausuler eller bonusser.
// Rækkefølgen af rand-kald er originalens (rand(20) og beløbet pr. klausul, så de tre bonusser); talrækken er spillets egen pr. spiller
// (cmRand – originalens globale rækkefølge over alle personer kan ikke genskabes uden hele hukommelsen).
// *Estimeret* (ikke fundet/ikke koblet): ligaens op-/nedrykningsflag (+0xbe/+0xd9/+0xc1) = spillets regler (promoted/playoff/relegated;
// nederste række i et spilbart land med flere rækker: nedrykning),
// skjulte ligaer = ingen ligapost; kontraktens startdato +0x25 (0x85eba8–0x85ec92) bruges ikke (spillets Started = ankomstdatoen).
import type { Contract, GameState, Player } from './types';
import { ageOn } from './dates';
import { ATTRS } from './attributes';
import { rulesFor } from './leagues';
import { cmActive, cmRand, clubRepMem } from './cmPlayerData';

/** £ → € som newgame.ts (databasens beløb er pund) */
export const GBP = 0.86;

const attr = (p: Player, k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10);
const tdiv = (a: number, b: number) => Math.trunc(a / b);
const ftol = (x: number) => Math.trunc(x);

/** inddata pr. person (alt i originalens enheder) */
export interface InitContractIn {
  id: number;
  age: number;
  /** spillerpost +0xb (0..10000) */
  rep: number;
  /** staff +0x52, værdien (£) */
  value: number;
  /** staff +0x4e, databasens ugeløn (£, 0 = ingen) */
  dbWage: number;
  /** spillets løn (£) – bruges som 0x864550's standardløn til bonusserne, når databasens løn ikke gælder (*estimeret*) */
  fallbackWage: number;
  caps: number;
  /** nation +0x85 for spillerens land (null = intet land) */
  nation85: number | null;
  amb: number; loy: number; det: number; prof: number;
  /** spillerpostens +0xf..+0x15 (GK, SW, D, DM, M, AM, ST) */
  pos: number[];
  clubRep: number;
  /** klub +0x64: 1 professionel, 2 semiprofessionel, 3 amatør */
  status: number;
  /** klubbens liga: null = ingen ligapost ([0xadadfc][division] = 0 eller ikke en liga) */
  league: { promotion: boolean; relegation: boolean } | null;
}
export interface InitContractOut {
  /** +0xc: databasens løn (£) eller −1 (= ikke sat) */
  wage: number;
  goal: number; assist: number; cleanSheet: number;
  /** +0x1c..+0x20 */
  clauses: [number, number, number, number, number];
  fee: number;
  partTime: boolean;
}

/** 0x85e960 (spillerens del) – ren funktion */
export function initialContract_85e960(x: InitContractIn, rand: (n: number) => number): InitContractOut {
  const cl: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let fee = 0;
  // 0x85eaa2: klubbens niveau (byte)
  let bl = (tdiv(x.clubRep, 500) + 1) << 24 >> 24;
  if (x.status === 2) { bl -= 1; if (bl < 1) bl = 1; else if (bl > 4) bl = 4; }
  if (x.caps) {
    let al: number;
    if (x.nation85 === null) al = 1;
    else { al = ftol(x.nation85 * 0.25 * (Math.min(255, x.caps) * 0.125)) << 24 >> 24; if (al > 4) al = 4; else if (al === 0) al = 1; }
    bl = (bl + al) << 24 >> 24;
  }
  const rep = x.rep << 16 >> 16;
  // 0x85eb69: databasens løn (flaget [esp+0x13] = 1, fordi 0x4c7560 giver værdien med)
  let wage = -1, w: number;
  if (x.dbWage && x.dbWage <= rep * 15) { wage = ftol(Math.fround(x.dbWage)); w = wage; } else w = Math.round(x.fallbackWage);
  // 0x85edf4: klausulerne
  if (x.age > 0x20 && rep > 0xcb2 && x.id % 3 === 0 && x.prof + x.det + x.amb + (x.id % 10) + x.age - 0x1c > 0x2d) cl[4] = 1;
  if (rep > 0xabe) {
    const r = rand(0x14) + 2 * x.amb - 3 * x.loy + tdiv(rep, 50);
    if (r > 12 * bl && x.league?.promotion) { let e = rand(tdiv(x.value, 4)) + x.value; if (e < 250000) e = 250000; cl[1] = 0; cl[0] = 1; fee = e; }
    else cl[0] = 0;
  }
  if (rep > 0x1964) {
    const r = rand(0x14);
    if (tdiv(rep, 50) - 4 * x.loy - r > 14 * bl) {
      const f = rand(tdiv(x.value, 4)) + x.value;
      let t = ftol(Math.max(f * 0.95 + 150000, 2 * f));
      if (t > 12000000) t = ftol(t * 0.21 + 9500000);
      let e = f + t; if (e < 250000) e = 250000;
      cl[1] = 0; cl[2] = 1; fee = e;
    }
  }
  if (rep > 0x6d6) {
    const r = rand(0x14);
    if (tdiv(rep, 50) - 2 * x.loy + 3 * x.amb - r > 10 * bl && x.league?.relegation) {
      let v = x.value - rand(tdiv(x.value, 2));
      if (v < 50000) v = 50000;
      const k = x.loy < 5 ? (x.amb > 10 ? 0.5 : 0.85) : x.amb > 10 ? 0.75 : x.loy < 15 ? 0.85 : 1;
      cl[1] = 0; cl[3] = 1; fee = k === 1 ? v : ftol(v * k);
    }
  }
  // 0x85f12d: bonusserne
  const bonus = () => tdiv(w, 20) - rand(tdiv(w, 40)) + 25;
  const goal = x.pos[6] >= 15 ? bonus() : -1;
  const assist = x.pos[4] >= 15 || x.pos[5] >= 15 || x.pos[6] >= 15 ? bonus() : -1;
  const cleanSheet = x.pos[0] === 20 ? bonus() : -1;
  // 0x85f751: klubstatus
  if (x.status === 3) return { wage, goal: -1, assist: -1, cleanSheet: -1, clauses: [0, 0, 0, 0, 0], fee: 0, partTime: false };
  return { wage, goal, assist, cleanSheet, clauses: cl, fee, partTime: x.status === 2 };
}

/** klubstatus +0x64 efter Finance::init_for_club (cmFinance.ts) – uden den: club.dat +100 */
function statusOf(g: GameState, club: number): number {
  return g.cmFin?.[club]?.status ?? g.cmClubStat?.[club]?.[0] ?? 1;
}

/** ligaposten for klubbens liga: op-/nedrykning efter spillets regler (*estimeret* for originalens +0xbe/+0xd9/+0xc1) */
function leagueOf(g: GameState, club: number): InitContractIn['league'] {
  const c = g.clubs[club];
  const comp = c && g.comps[c.league];
  if (!comp || comp.type !== 'league' || g.leagues[c.league]?.hidden) return null;
  const rules = g.customRules?.[c.league] ?? rulesFor(c.league, comp.clubs.length);
  const playoffUp = !!rules.playoff?.seeds.some(([l]) => l === c.league) && rules.playoff?.winnerTo !== c.league;
  // nederste række i et spilbart land rykker ned i "A Lower Division" (originalen: England Third Division → Conference, +0xc1 ≠ 0)
  const lg = g.leagues[c.league];
  const bottom = !!lg && !Object.values(g.leagues).some((x) => x.nation === lg.nation && !x.hidden && x.tier > lg.tier);
  return { promotion: (rules.promoted ?? 0) > 0 || playoffUp, relegation: (rules.relegated ?? 0) > 0 || (bottom && lg.tier > 1) };
}

/** spillerens inddata af spillets data */
export function initContractInput(g: GameState, p: Player, dbWageGbp: number): InitContractIn | null {
  const club = p.loan?.from ?? p.club;
  if (!club || !g.clubs[club] || !p.contract) return null;
  const repMem = (p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[1] * 50;
  return {
    id: p.id, age: ageOn(p.dob, g.date), rep: repMem, value: ftol((p.value ?? 0) * GBP), dbWage: dbWageGbp,
    fallbackWage: (p.contract.wage ?? 0) * GBP, caps: p.caps ?? 0,
    nation85: p.nation !== undefined && p.nation >= 0 && g.nations[p.nation] ? g.cmNation85?.[p.nation] ?? 0 : null,
    amb: attr(p, 'ambition'), loy: attr(p, 'loyalty'), det: attr(p, 'determination'), prof: attr(p, 'professionalism'),
    pos: p.pos.slice(0, 7), clubRep: clubRepMem(g, club), status: statusOf(g, club), league: leagueOf(g, club),
  };
}

/** resultatet ind i spillets kontrakt (beløbene i €) */
export function applyInitialContract(c: Contract, o: InitContractOut): void {
  const eur = (v: number) => Math.max(0, Math.round(v / GBP));
  c.goalBonus = o.goal > 0 ? eur(o.goal) : undefined;
  c.cmAssistBonus = o.assist > 0 ? eur(o.assist) : undefined;
  c.cleanSheetBonus = o.cleanSheet > 0 ? eur(o.cleanSheet) : undefined;
  c.appBonus = undefined;
  c.cmClauses = o.clauses.some((v) => v) ? o.clauses.slice() : undefined;
  c.cmClauseFee = o.clauses.some((v) => v) && o.fee > 0 ? eur(o.fee) : undefined;
  if (o.partTime) c.partTime = true;
  c.cmBonusGbp = o.goal > 0 || o.assist > 0 || o.cleanSheet > 0 ? [o.goal, o.assist, o.cleanSheet] : undefined;
}

/** nyt spil: alle databasens spillere med klub og kontrakt (kun cmActive). `dbWage`: spiller-id → databasens ugeløn (£). */
export function cmContractsNewGame(g: GameState, dbWage: Map<number, number>, seed: number): { n: number; dbRejected: number } {
  if (!cmActive(g) || g.draft) return { n: 0, dbRejected: 0 };
  let n = 0, dbRejected = 0;
  for (const p of Object.values(g.players)) {
    if (p.regen || !p.contract) continue;
    const x = initContractInput(g, p, dbWage.get(p.id) ?? 0);
    if (!x) continue;
    const o = initialContract_85e960(x, cmRand(seed, p.id, 0x85e960));
    if (x.dbWage && o.wage < 0) dbRejected++;
    applyInitialContract(p.contract, o);
    n++;
  }
  return { n, dbRejected };
}

/** CONTRACT_MANAGER::update_after_match 0x4ca6d0: betales holdets bonusser i denne kamp? Venskabskampe (fixture +0x3a = 1, 0x4ca7bc): kun mod
 *  en klub med omdømme ≥ max(1,25 · eget, eget + 1500); reserveturneringen [0x9cf684] og landshold (0x53b900) aldrig. Spillets klubkampe
 *  har ingen 0x5c6710-turneringer (de landsholdsturneringer, den udelukker, spilles ikke gennem applyMatchResult). */
export function cmBonusPaid(g: GameState, f: { comp: string; home: number; away: number }, team: number): boolean {
  if (g.comps[f.comp]) return true;
  const own = clubRepMem(g, team === 0 ? f.home : f.away), opp = clubRepMem(g, team === 0 ? f.away : f.home);
  return !(Math.max(own * 1.25, own + 1500) > opp);
}
