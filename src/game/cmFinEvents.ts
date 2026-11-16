// CM 01/02: klubøkonomiens begivenheder – FinanceTable::process_club_finance_events 0x59ed70 (finance.cpp) med de fire begivenheder 0x59dd40,
// 0x59e050, 0x59e5a0 og 0x59e940, nyhederne 0x59f300 (0x1779, tekst 0x59f3e0), 0x59fc60 (0x177b, 0x59fcf0), 0x5a02f0 (0x1783, 0x5a0380),
// 0x59f900 (0x177a, 0x59f9c0) og 0x59ffb0 (0x177d, 0x5a0050). Kun den originale database i ægte tilstand (cmFinOn) – erstatter rules2001.ts'
// boardEventsSeason, der er slået fra der. Noter: ~/cm0102-engine/notes/finance.md "Begivenhederne".
//
// Hvornår (FinanceTable::daily_update 0x59b9c0): den sidste dag i måneden for alle aktive klubber (0x59cbfd, flag 1, efter Ground Maintenance),
// ellers dagligt for klubber i krise (+0x165 = 1 eller 2) med flaget rand(max(10, (11000 − omdømme)/250)) = 0 (0x59cd4d). Med flag 0 skifter
// kun krisetilstanden; begivenhederne og stadionet kræver flag 1.
//
// Tilstanden: +0x165 (CmFinRec.s165) 0 normal, 1 betalingsstandsning (formuebåndet −2 = dyb gæld), 2 gæld (båndet −1); +0x166 (s166) tæller
// forsømmelsen – stiger i gæld, når klubben ejer sit stadion (+0x6d), falder ellers; over 50 i en kørende liga: stadionet forfalder.
//
// Beløbene (£, 32 bit som originalen) bogføres som Investments (blok +0x44) og på saldoen. Bagefter regnes transferbudgettet 0x598800
// (cmBudget.ts, samme argumenter (0, 0, 0, 1, 0)) – det står i nyheden og bliver klubbens Transfer Funds (originalen regner budgettet
// løbende af saldoen, spillet gemmer det i Club.transferBudget).
//
// Ikke porteret: formandens nye navn ved en overtagelse (0x539c60/0x53a5b0/0x53a1b0 – navnet vises ikke i spillet), B-holdenes fælles økonomi
// (0x540a50), kontraktens +0x4e & 4's regel for bud på menneskets spillere i betalingsstandsning ("You are no longer in a position to refuse
// reasonable transfer offers") og den dybe gælds månedlige mediehistorie og salgsønsker 0x59c212 (0x74ae60, 0x867700).
import type { Club, GameState } from './types';
import { addNews } from './state';
import { asOwner, forEachHuman, isHumanClub } from './humans';
import { balGbp, book, GBP, K, wealthBand, type CmFinRec } from './cmFinance';
import { clubRepMem } from './cmPlayerData';
import { finHooks } from './hooks';

const trunc = Math.trunc;
const ftol = (x: number) => trunc(x);
const idiv = (a: number, b: number) => trunc(a / b);
const i32 = (x: number) => x | 0;
const s16 = (x: number) => (x << 16) >> 16;
const s8 = (x: number) => (x << 24) >> 24;
const repOf = (g: GameState, c: Club) => s16(clubRepMem(g, c.id));
const nationName = (g: GameState, n: number) => g.nations[n]?.name ?? '';
type Rand = (n: number) => number;

/** de nationer, hvis klubber ikke får 0x59e050's investering (0x59e06a–0x59e0b4) – og 0x59e5a0's gældsbetaling (de tre første) */
const NO_BOOST = new Set(['Wales', 'Republic of Ireland', 'Northern Ireland', 'Norway', 'Denmark', 'Sweden', 'Belgium']);
const NO_DEBT = new Set(['Wales', 'Republic of Ireland', 'Northern Ireland']);
/** 0x59e2c5: beløbet deles med 3 (de tre er allerede udelukket ovenfor – død kode i originalen, men med samme betingelse) */
const THIRD = new Set(['Sweden', 'Norway', 'Denmark']);

// ------------------------------------------------------------------------------------------------ data om klub, formand og stadion

/** club +0x82 PLC (cmFinRaw[1]) */
const plcOf = (g: GameState, c: Club) => (g.cmFinRaw?.[c.id]?.[1] ?? 0) !== 0;
function setPlc(g: GameState, c: Club, on: boolean): void {
  const raw = g.cmFinRaw?.[c.id];
  if (raw) raw[1] = on ? 1 : 0;
  c.plc = on;
}
/** +0x6d (0 for "Bright…"/"Wimble…", som cmFinance.ts) */
const b6d = (c: Club) => (/^(Bright|Wimble)/.test(c.name) ? 0 : 1);
/** formanden: ikke-spillerposten +0x0f Business, +0x20 Resources, personposten +0x57 Ambition (CmFinRec.chair) og +0x16 Interference,
 *  +0x1d Patience, +0x1a nationen (GameState.cmChair) */
interface Chair { business: number; resources: number; amb: number; interference: number }
function chairOf(g: GameState, c: Club, r: CmFinRec): Chair | null {
  if (!r.chair) return null;
  const x = g.cmChair?.[c.id];
  return { business: s8(r.chair[0]), resources: s8(r.chair[1]), amb: s8(r.chair[2]), interference: s8(x?.[0] ?? 0) };
}
/** klubbens liga er kørende ([0xadadfc][+0x57] ≠ 0) – den samme afgrænsning som cmFinance.ts' hasTable */
function leagueRunning(g: GameState, c: Club): boolean {
  const comp = g.comps[`CM${g.cmFinRaw?.[c.id]?.[0] ?? -1}`];
  if (!comp || comp.type !== 'league') return false;
  const n = comp.nation >= 0 ? comp.nation : c.nation;
  return g.activeNations?.length ? g.activeNations.includes(n) : true;
}

/** stadionet (club +0x69): kapaciteten +0x3c (cmCrowd[5]), sæderne +0x40 og udvidelsen +0x44 (stadium.dat +64/+68 – world-filens
 *  cmRaw.seats; i world-filer uden feltet står sæderne som kapaciteten, så en lukning lukker en del af tribunen) */
function stadiumOf(g: GameState, c: Club): { id: number; cap: number; seats: number } | null {
  const cr = g.cmCrowd?.[c.id];
  if (!cr || cr[3] < 0) return null;
  const s = (g.cmStadium ??= {})[cr[3]] ??= [cr[5], 0];
  return { id: cr[3], cap: cr[5], seats: s[0] };
}
/** stadionposten deles af alle klubber med samme stadion */
function forStadium(g: GameState, id: number, fn: (cid: number) => void): void {
  for (const [cid, cr] of Object.entries(g.cmCrowd ?? {})) if (cr[3] === id) fn(+cid);
}

// ------------------------------------------------------------------------------------------------ nyhederne

/** målinger: begivenheder pr. type (1–7), betalingsstandsninger ('r') og lukkede tribuner/jordvarme ('s'/'h') */
export const FE_STATS: Record<string, number> = {};

/** 0x59f300: nyhed 0x1779 [klub, beløb, transferbudget, type]. Amatørklubber (+0x64 = 3) ingen nyhed; type 2 (overtagelse) og 7 (PLC) til
 *  landets managere (send_to_nation_managers 0x7863f0: klub eller landshold i landet), resten til klubbens manager (0x7861e0 – kun et menneske) */
function eventNews(g: GameState, c: Club, r: CmFinRec, type: number, amount: number, funds: number): void {
  FE_STATS[type] = (FE_STATS[type] ?? 0) + 1;
  if (r.status === 3) return;
  const rep = repOf(g, c);
  const q = ftol(rep * rep * 0.025);
  let head: string, body: string;
  // overskrift 0x59f3e0 (tabel 0x59f8c8) og brødtekst (0x59f8e4)
  switch (type) {
    case 1: head = 'cmfe.h.funds'; body = funds > q ? (funds > 50000 ? 'fundsNow' : 'fundsSmall') : funds < 0 ? 'fundsNone' : 'fundsSmallClub'; break;
    case 2: head = 'cmfe.h.board'; body = funds > 50000 && funds > q ? 'boardFunds' : amount > 50000 ? 'boardDebts' : 'boardPackage'; break;
    case 3: head = 'cmfe.h.cash'; body = 'debts'; break;
    case 4: head = 'cmfe.h.cash'; body = 'running'; break;
    case 5: head = 'cmfe.h.shares'; body = 'shares'; break;
    case 6: head = 'cmfe.h.sponsor'; body = 'sponsor'; break;
    default: head = 'cmfe.h.plc'; body = 'plc';
  }
  const n = { cat: 'finance' as const, key: head, params: { club: c.name, amt: amount / GBP, funds: funds / GBP, body }, link: { kind: 'club' as const, id: c.id } };
  if (type === 2 || type === 7) {
    forEachHuman(() => {
      const me = g.clubs[g.userClub];
      if ((me && me.nation === c.nation) || g.manager.national?.nation === c.nation) addNews(n);
    });
  } else asOwner(c.id, () => addNews(n));
}
/** 0x59fc60: 0x177b [klub, rand(2)] – "Receivers called in" (1) / "Club in financial crisis" (0), til klubbens manager */
function crisisNews(c: Club, kind: number): void {
  asOwner(c.id, () => addNews({ cat: 'finance', key: kind ? 'cmfe.h.receivers' : 'cmfe.h.crisis', params: { club: c.name, body: kind ? 'receivers' : 'crisis' }, link: { kind: 'club', id: c.id } }));
}
/** 0x5a02f0: 0x1783 "Receivers appeased", til klubbens manager */
function appeasedNews(c: Club): void {
  asOwner(c.id, () => addNews({ cat: 'finance', key: 'cmfe.h.appeased', params: { club: c.name, body: 'appeased' }, link: { kind: 'club', id: c.id } }));
}

/** 0x5a02f0 kaldes, når klubben forlader betalingsstandsningen (+0x165 = 1) */
function leaveState(c: Club, r: CmFinRec, to: number): void {
  if (r.s165 === 1) appeasedNews(c);
  r.s165 = to;
}

// ------------------------------------------------------------------------------------------------ process_club_finance_events 0x59ed70

/** én klubs begivenheder (`flag` = 0x59ed70's andet argument) */
export function cmFinEvents(g: GameState, c: Club, r: CmFinRec, flag: boolean, rand: Rand): void {
  const rep = repOf(g, c);
  const band = wealthBand(balGbp(c), rep);
  const decay = () => { if (c.facilities === 20 && rep < 7250 && rand(10) === 0) c.facilities--; };
  if (band === -2) {
    if (r.s165 !== 1) {
      // 0x59eec4: betalingsstandsning – nyheden, PLC ophører, og menneskets spillere sættes ned til formelværdien (+0x4e |= 4)
      FE_STATS.r = (FE_STATS.r ?? 0) + 1;
      crisisNews(c, s16(rand(2)));
      setPlc(g, c, false);
      r.s165 = 1;
      if (isHumanClub(c.id)) finHooks.receivership?.(g, c.id);
      return;
    }
    if (!flag) return;
    if (!takeover(g, c, r, rand) && !payDebts(g, c, r, rand)) boost(g, c, r, rand);
    decay();
    if (b6d(c)) r.s166 = s8(r.s166 + 3);
  } else if (band === -1) {
    if (r.s165 !== 2) leaveState(c, r, 2);
    if (!flag) return;
    if (b6d(c)) r.s166 = s8(r.s166 + 1);
    decay();
    if (!injection(g, c, r, rand) && !payDebts(g, c, r, rand)) takeover(g, c, r, rand);
  } else {
    if (r.s165 === 1 || r.s165 === 2) leaveState(c, r, 0);
    if (!flag) return;
    if (band === 2) { if (r.s166 > 5) r.s166--; }
    else {
      if (band === 0) { if (r.s166 > 10) r.s166--; }
      else if (r.s166 > 0) r.s166--;
      if (!boost(g, c, r, rand) && !injection(g, c, r, rand)) payDebts(g, c, r, rand);
    }
  }
  neglect(g, c, r, rep, rand);
}

/** 0x59f14f: forsømmelsen over 50 i en kørende liga – jordvarmen fjernes (omdømme < 4250) eller en tribune lukkes */
function neglect(g: GameState, c: Club, r: CmFinRec, rep: number, rand: Rand): void {
  if (!leagueRunning(g, c) || r.s166 <= 50) return;
  const st = stadiumOf(g, c);
  if (!st) return;
  const raw = g.cmFinRaw?.[c.id];
  if (raw?.[3] && rep < 4250) {
    // 0x59f196: 0x177d [klub, 0, 7] "Stadium Facilities reduced" – jordvarmen (+0x4d) og træningsanlægget
    asOwner(c.id, () => addNews({ cat: 'finance', key: 'cmfe.h.facilities', params: { club: c.name, body: 'heating' }, link: { kind: 'club', id: c.id } }));
    FE_STATS.h = (FE_STATS.h ?? 0) + 1;
    forStadium(g, st.id, (cid) => { const x = g.cmFinRaw?.[cid]; if (x) x[3] = 0; });
    const f = c.facilities;
    if (f === 20) c.facilities = s8(f - 1 - rand(4));
    else if (f > 1 && rand(f) !== 0) c.facilities--;
    return;
  }
  if (st.cap <= 2750 || rand(rep) >= st.cap) return;
  // 0x59f22c: en tiendedel af kapaciteten (hele tiere) lukkes; sæderne først, ellers ståpladserne
  const red = s16(idiv(s16(ftol(st.cap * 0.1)), 10) * 10);
  const s = g.cmStadium![st.id];
  const seated = s[0] > red;
  if (seated) s[0] -= red;
  s[1] += red;
  const cap = st.cap - red;
  forStadium(g, st.id, (cid) => {
    const cr = g.cmCrowd![cid]; cr[5] = cap;
    const cl = g.clubs[cid]; if (cl && cl.seats > red) cl.seats -= red;
  });
  // 0x59f900: 0x177a [klub, stadion, antal, sæder?]; brødteksten 0x59f9c0 læser stadionet, når nyheden vises – kapaciteten er da allerede sat ned
  const body = seated ? (s[0] ? 'seats' : 'noSeats') : 'terrace';
  asOwner(c.id, () => addNews({ cat: 'finance', key: seated ? 'cmfe.h.stand' : 'cmfe.h.terrace', params: { club: c.name, n: seated ? red : cap - red, body }, link: { kind: 'club', id: c.id } }));
  r.s166 = 20;
  FE_STATS.s = (FE_STATS.s ?? 0) + 1;
  const f = c.facilities;
  if (f > 15) c.facilities = s8(f - 1 - rand(5));
  else if (f > 7) c.facilities--;
  else if (f > 1 && rand(f) !== 0) c.facilities--;
}

/** bogfør beløbet (Investments og saldoen) og regn transferbudgettet 0x598800 – det bliver klubbens Transfer Funds */
function invest(g: GameState, c: Club, amount: number): number {
  book(g, c, K.investments, amount);
  const tb = finHooks.budget?.(g, c.id) ?? 0;
  c.transferBudget = Math.max(0, tb) / GBP;
  return tb;
}

/** 0x59dd40: "The board has injected X to help with the club's running costs." (type 4) */
function injection(g: GameState, c: Club, r: CmFinRec, rand: Rand): boolean {
  const rep = repOf(g, c), bal = balGbp(c), band = wealthBand(bal, rep);
  let k: number;
  if (band === -2) k = 2.0;
  else if (band === -1) k = rep >= 3500 ? 0.4 : 2.0;
  else if (band === 0 && rep <= 3500 && bal < rep * 25) k = 0.4;
  else return false;
  if (rep >= rand(7000) + 3500) return false;
  const ch = chairOf(g, c, r);
  if (rand(ftol(6 / k)) !== 0) return false;
  if (ch) { if (rand(ch.resources) === 0) return false; }
  else if (rand(10) === 0) return false;
  const amount = rep < 1250 && bal < -450 * rep ? 450 * rep : bal < -300 * rep ? 300 * rep : 150 * rep;
  invest(g, c, amount);
  eventNews(g, c, r, 4, amount, 0);
  return true;
}

/** 0x59e050: investering – "Transfer funds made available" (1), aktieudstedelse (5), sponsoraftale (6) eller børsnotering (7) */
function boost(g: GameState, c: Club, r: CmFinRec, rand: Rand): boolean {
  const nn = nationName(g, c.nation);
  if (NO_BOOST.has(nn) || r.status === 2 || r.status === 3) return false;
  const rep = repOf(g, c), bal = balGbp(c), band = wealthBand(bal, rep);
  const ch = chairOf(g, c, r);
  let k: number;
  if (band === -2) k = rep > 3750 ? 0.125 : 0.075;
  else if (band === -1) k = rep > 5250 ? 0.1 : rep > 3250 ? 0.075 : 0.025;
  else if (band === 0) {
    const keen = !!ch && ch.resources > 15 && ch.amb > 15;
    k = rep > 4250 ? (rep < 6250 && keen ? 0.05 : 0.025) : keen ? 0.0125 : 0.0075;
  } else k = 0.001;
  let amount: number;
  const plc = plcOf(g, c);
  if (ch) {
    const a = rand(ftol(30 / k));
    if (rand(ch.business) <= a) return false;
    if (rand(ch.resources * 1_000_000) <= -bal) return false;
    if (rep >= 750 * ch.resources) return false;
    amount = ftol((Math.pow(ch.resources, 2) * 3 + 750) * rep + 1_000_000);
    // 0x59e28a: + saldoens nederste 32 bit med fortegn væk (gælden betales, en positiv saldo lægges til)
    amount = i32(amount + Math.abs(bal));
    if (rep < 2000 && amount > rep * rep + 1_500_000) amount = rep * rep + 1_500_000;
    if (THIRD.has(nn)) amount = idiv(amount, 3);
    const tb = invest(g, c, amount);
    let type: number;
    if (tb <= 0 && !plc) type = 3;
    else if (plc && rand(4) === 0) type = 5;
    else if (rand(4) === 0 && amount < ftol(0.3 * rep * rep) && amount > 50000) type = 6;
    else if (!plc && rep > 4750 && rand(4) === 0 && nn !== 'Italy') type = 7;
    else type = 1;
    if (type === 7) setPlc(g, c, true);
    eventNews(g, c, r, type, amount, tb);
    if (ch.resources > 5) r.chair![1] = ch.resources - 1;
  } else {
    if (rep <= rand(ftol(15000 / k))) return false;
    if (rand(8) !== 0) return false;
    amount = (rep + 1000) * 1000;
    if (THIRD.has(nn)) amount = idiv(amount, 3);
    const tb = invest(g, c, amount);
    let type: number;
    if (tb <= 0 && !plc) type = 3;
    else if (plc && rand(4) === 0) type = 5;
    else if (rand(4) === 0) type = 6;
    else if (!plc && rep > 4750 && rand(4) === 0) type = 7;
    else type = 1;
    if (type === 7) setPlc(g, c, true);
    eventNews(g, c, r, type, amount, tb);
  }
  r.s165 = 0;
  return true;
}

/** 0x59e5a0: "The board paid X of the clubs debts to keep the club from falling into receivership." (type 3) */
function payDebts(g: GameState, c: Club, r: CmFinRec, rand: Rand): boolean {
  const rep = repOf(g, c);
  if (rep < 4750 || plcOf(g, c) || NO_DEBT.has(nationName(g, c.nation))) return false;
  const bal = balGbp(c), band = wealthBand(bal, rep);
  const k = band === -2 ? 0.25 : band === -1 ? 0.1 : 0.001;
  const ch = chairOf(g, c, r);
  let amount: number;
  if (ch) {
    if (ch.business <= rand(ftol(30 / k))) return false;
    if (ch.resources <= rand(5) + 10) return false;
    amount = i32((ch.resources * 20 + 150) * rep + 750_000);
  } else {
    if (rand(ftol(4 / k)) !== 0) return false;
    amount = i32(250 * rep + 750_000);
  }
  // højst en tiendedel af gælden, når beløbet er under en tiendedel af den
  if (amount * 10 < -bal) amount = ftol(-(bal * 0.1));
  if (rep < 2000) { if (amount > rep * rep + 1_500_000) amount = rep * rep + 1_500_000; }
  else {
    // 0x59e71d: loftet 4.000.000 (+1, når beløbet er over en fjerdedel af omdømmet²)
    const lim = 4_000_000 + (amount > rep * rep * 0.25 ? 1 : 0);
    if (amount > lim) amount = lim;
  }
  const tb = invest(g, c, amount);
  eventNews(g, c, r, 3, amount, tb);
  r.s165 = 0;
  return true;
}

/** 0x59e940: "New Board take control of X" (type 2) – gælden ryddes, ny formand */
function takeover(g: GameState, c: Club, r: CmFinRec, rand: Rand): boolean {
  const rep = repOf(g, c), bal = balGbp(c), band = wealthBand(bal, rep);
  const k = band === -2 ? (rep > 4250 ? 0.4 : 0.25) : band === -1 ? (rep > 4250 ? 0.2 : 0.05) : 0.001;
  let q: number;
  const div = g.cmFinRaw?.[c.id]?.[0] ?? -1;
  if (div >= 0) {
    // klubbens division +0x57 → turneringens omdømme +0x69 (club_comp.dat +105)
    q = rep * 0.002 / s16(g.cmCompRep?.[div] ?? 0);
    if (!(q >= 0.75)) q = 0.75;
  } else q = 0.5;
  const ch = chairOf(g, c, r);
  if (ch) { if (rand(ch.interference) !== 0) return false; }
  else if (rand(20) !== 0) return false;
  if (!(rand(ftol(15000 / k)) < rep * q)) return false;
  let amount = i32((rep + 1000) * 1000 - bal);
  if (amount > 40_000_000 && rep < rand(2500) + 2000) amount = i32(-bal);
  const tb = invest(g, c, amount);
  if (ch) {
    // 0x59eb31: den nye formand – landet (klubbens, 1/1000 et tilfældigt), navnet og ikke-spillerpostens fire egenskaber
    const x = g.cmChair?.[c.id];
    const nat = rand(1000) !== 0 ? c.nation : rand(g.nations.length);
    const patience = rand(20) + 1, business = rand(20) + 1, interference = rand(20) + 1;
    let resources = rand(20) + 1;
    if (resources < 5) resources = rand(20) + 1;
    r.chair![0] = business; r.chair![1] = resources;
    if (x) { x[0] = interference; x[1] = patience; x[3] = nat; }
  }
  eventNews(g, c, r, 2, amount, tb);
  r.s165 = 0;
  return true;
}
