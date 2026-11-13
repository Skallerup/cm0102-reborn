// Originalens klubøkonomi (cm0102.exe 3.9.68, finance.cpp – FinanceTable/Finance) – kun den originale database i ægte tilstand (cmActive).
// Afkodet 12/11-2026; noterne ~/cm0102-engine/notes/finance.md, docs/ENGINE_PORT_PLAN.md "Økonomi".
//
// Posten (0x167 bytes pr. klub, FinanceTable::get_club_finance 0x5a0590): +0 saldo (i64), +0xc ugens lønsum, +0x18 sæsonkortholdere,
// +0x20 sidste måned, +0x70 denne måned, +0xc0 sidste sæson, +0x110 denne sæson (blokke à 0x50 bytes, se K nedenfor), +0x160 sæsonkortandelen
// (float), +0x164 sæsonkortugen, +0x165 stadionets tilstand, +0x166.
//
// Porteret (adresser):
//   Finance::init_for_club 0x5961d0 (startsaldoen), get_wealth_band 0x5986b0, update_wage_bill 0x598370, sell_season_tickets 0x599a20,
//   finance_get_days_to_season_start 0x59b4c0, add_weekly_merchandising_income 0x59b7e0, FinanceTable::daily_update 0x59b9c0 (søndagens løn,
//   merchandise og sæsonkort; månedens stadion-/træningsanlæg, billetindtægt uden liga, renter, Other, Investments (PLC), Ground Maintenance,
//   blokkene), calc_gate_receipts 0x59af40 og process_match_income 0x59a5d0 (kampens billetindtægt, kampomkostninger og tv-penge),
//   League::pay_prize_money 0x682e10 + calc_prize_fund 0x682f70 (ligapræmien), League::pay_tv_rights 0x683010 (tv-pengene i create_table),
//   end_season_for_nation 0x59cdd0 + season_end_club_update 0x59cfa0's udbytte (0x59db58–0x59dd25), init_club_board_records 0x68f130's
//   tilhængertillid (MANAGER_MANAGER-posten +8 – sæsonkortene).
// Ikke porteret: se ENGINE_PORT_PLAN.md (transferbudgettet 0x598800, process_club_finance_events 0x59ed70, stadionudvidelserne i 0x59cfa0,
//   pokal-/Europapræmierne, bonusserne 0x4ca6d0, 2004-stadionflytningerne øverst i 0x59b9c0).
//
// Pengene: originalen regner i hele pund; spillet gemmer euro (Club.balance, newgame.ts GBP = 0,86). Posterne regnes i pund som i
// originalen og bogføres i rec.tm/ty (pund) og Club.balance/Club.finance (euro = pund / 0,86). Saldoen i pund = round(balance · 0,86).
// Talrækken er spillets egen (cmRand pr. klub og dag) – originalens kald af 0x90cfc0 i samme rækkefølge pr. klub.
import type { Club, Fixture, GameState, Player, Staff } from './types';
import { cmActive, cmRand, clubRepMem } from './cmPlayerData';
import { cmWeekday } from './cmCalendar';
import { seasonStartDay } from './cmFitness';
import { addDays } from './dates';
import { gs, squad } from './state';
import { compHooks } from './hooks';
import { npFromWorld, npTemplate, staffInitRecord, type NpTemplate } from './cmStaffInit';
import type { CMWorld } from './data/cm0102';

export const GBP = 0.86;
const trunc = Math.trunc;
const f32 = Math.fround;
/** _ftol 0x945640: mod nul */
const ftol = (x: number) => trunc(x);
/** idiv mod nul */
const idiv = (a: number, b: number) => trunc(a / b);

/** blokkens poster (blok +0x00 … +0x4c) */
export const K = {
  bought: 0, sold: 1, otherOut: 2, interestOut: 3, fines: 4, maintenance: 5, wages: 6, dividends: 7, bonuses: 8, signOn: 9,
  gate: 10, otherIn: 11, prize: 12, seasonTickets: 13, interestIn: 14, investments: 15, tv: 16, merch: 17,
} as const;
export type FinKey = keyof typeof K;
const N_KEYS = 18;
/** indtægterne (resten er udgifter) */
const INCOME = new Set<number>([K.sold, K.gate, K.otherIn, K.prize, K.seasonTickets, K.interestIn, K.investments, K.tv, K.merch]);
/** postens nøgle i Club.finance (euro) – så spillets egne skærme/historik ser originalens poster */
const CLUB_KEY: Record<number, keyof import('./types').ClubFinance> = {
  [K.otherOut]: 'other', [K.interestOut]: 'interestOut', [K.fines]: 'fines', [K.maintenance]: 'maintenance', [K.wages]: 'wages',
  [K.dividends]: 'dividends', [K.bonuses]: 'bonuses', [K.gate]: 'gate', [K.otherIn]: 'otherIncome', [K.prize]: 'prize',
  [K.seasonTickets]: 'seasonTickets', [K.interestIn]: 'interest', [K.investments]: 'investments', [K.tv]: 'tv', [K.merch]: 'merch',
};

export interface CmFinRec {
  /** +0xc ugens lønsum (£), +0x10 højeste løn */
  wb: number; top: number;
  /** +0x18 sæsonkortholdere, +0x160 andelen (float), +0x164 ugen (s8), +0x165, +0x166 */
  st: number; share: number; wk: number; s165: number; s166: number;
  /** club +0x64 (status efter init_for_club: amatør → semiprofessionel med en liga) */
  status: number;
  /** formanden (club +0xbf): ikke-spillerposten +0x0f (Business), +0x20, personposten +0x57/+0x59 – null = ingen */
  chair: [number, number, number, number] | null;
  /** blokkene (£): denne måned, sidste måned, denne sæson, sidste sæson */
  tm: number[]; lm: number[]; ty: number[]; ly: number[];
}

/** økonomien gælder (den originale database i ægte tilstand, ikke draft-ligaen) */
export const cmFinOn = (g: GameState): boolean => cmActive(g) && !g.draft && !!g.cmFin;

const blank = () => new Array(N_KEYS).fill(0);
export const balGbp = (c: Club) => Math.round(c.balance * GBP);
const repOf = (g: GameState, c: Club) => (clubRepMem(g, c.id) << 16) >> 16;
const nationName = (g: GameState, n: number) => g.nations[n]?.name ?? '';
const nation7e = (g: GameState, c: Club) => g.cmNation7e?.[c.nation] ?? 3;
/** stadionets kapacitet +0x3c (spillets tilskuerdata [5]; uden stadion −1) */
const capOf = (g: GameState, c: Club) => { const d = g.cmCrowd?.[c.id]; return d && d[3] >= 0 ? d[5] : -1; };
const avgOf = (g: GameState, c: Club) => g.cmCrowd?.[c.id]?.[0] ?? 0;
/** club +0x6d (0x8298fd: 0 for "Bright…"/"Wimble…", ellers 1) */
const b6d = (c: Club) => (/^(Bright|Wimble)/.test(c.name) ? 0 : 1);
/** de navngivne klubber i 0x599cc9/0x59b206 (nøgle-id'erne fra set_key_ids) */
const KEY_CLUB: Record<string, string> = { Chelsea: 'CHELSEA', Arsenal: 'ARSENAL', Everton: 'EVERTON', Liverpool: 'LIVERPOOL', 'Tottenham Hotspur': 'TOTTENHAM' };
const keyClub = (c: Club) => KEY_CLUB[c.name] ?? '';
const rawOf = (g: GameState, c: Club) => g.cmFinRaw?.[c.id] ?? [-1, 0, 0, 0];

/** klubbens liga er indlæst ([0xadadfc][division] ≠ 0) */
function hasTable(g: GameState, div: number): boolean {
  const comp = g.comps[`CM${div}`];
  return !!comp && comp.type === 'league';
}
/** nation +0x11c: landet har spilbare ligaer */
function nationLoaded(g: GameState, n: number): boolean {
  return Object.values(g.comps).some((x) => x.type === 'league' && g.leagues[x.id]?.nation === n && !g.leagues[x.id]?.hidden);
}
/** filtret i 0x59bf09/0x59c19e: klubben har land og division; indlæst land og ikke "A Lower Division", eller omdømme ≥ 5000 */
function active(g: GameState, c: Club): boolean {
  const div = rawOf(g, c)[0];
  if (div < 0) return false;
  if (nationLoaded(g, c.nation)) return div !== (g.cmLowerDiv ?? -1);
  return repOf(g, c) >= 5000;
}

/** bogfør en post (pund): blokkene, saldoen og Club.finance (euro) */
export function book(g: GameState, c: Club, key: number, amt: number): void {
  const r = g.cmFin?.[c.id];
  if (!r || !amt) return;
  r.tm[key] += amt; r.ty[key] += amt;
  const eur = amt / GBP, sign = INCOME.has(key) ? 1 : -1;
  c.balance += sign * eur;
  const ck = CLUB_KEY[key];
  if (ck) c.finance[ck] = (c.finance[ck] ?? 0) + eur;
}

// ------------------------------------------------------------------------------------------------ Finance::get_wealth_band 0x5986b0

/** −2 (dyb gæld) … 2 (rig): saldoen mod grænser efter klubbens omdømme */
export function wealthBand(bal: number, rep: number): number {
  if (bal > 2500 * rep + 5_000_000) return 2;
  if (bal > 1000 * rep + 3_500_000) return 1;
  if (bal < -2_500_000 - 1500 * rep) return -2;
  if (rep < 5000) return bal < -250 * rep ? -1 : 0;
  return bal < 1000 * (3750 - rep) ? -1 : 0;
}

// ------------------------------------------------------------------------------------------------ spilstarten

/** startsaldoens tabel 0x9c8290 (omdømme/500 − 1; 21 doubles) */
const START_TABLE = [-450000, -375000, -125000, 0, 150000, 350000, 750000, 1000000, 1500000, 3000000, 5000000, 6000000, 7000000, 8000000,
  9000000, 10000000, 12500000, 15000000, 17500000, 22500000, 27500000];

/** Finance::init_for_club 0x5961d0: startsaldoen (£) og postens felter. `dbBal` = club.dat +101 */
export function initForClub(g: GameState, c: Club, dbBal: number, rand: (n: number) => number): { bal: number; status: number } {
  const rep = repOf(g, c);
  let status = g.cmClubStat?.[c.id]?.[0] ?? 1;
  // 0x596280: amatørklub med en liga (division eller reservedivision) → semiprofessionel
  if (status === 3 && hasTable(g, rawOf(g, c)[0])) status = 2;
  let x: number;
  if (dbBal !== 0 && dbBal < 1.5 * rep * rep) {
    // 0x5962f3: databasens beløb ± rand(B/5)
    const a = rand(idiv(dbBal, 5)), b = rand(idiv(dbBal, 5));
    x = (b - a) + dbBal;
  } else if (c.name.slice(0, 6) === 'Rushde') {
    const a = rand(idiv(dbBal, 5)), b = rand(idiv(dbBal, 5));
    x = (b - a) + dbBal;
  } else {
    let idx = ((idiv(rep, 500) - 1) << 24) >> 24;
    if (idx < 0) idx = 0;
    let base = START_TABLE[Math.min(idx, START_TABLE.length - 1)];
    if (base > 0) {
      let n = nation7e(g, c);
      if (n < 1) n = 1; else if (n > 3) n = 3;
      const v85 = g.cmNation85?.[c.nation] ?? 0;
      base = (v85 * v85) * (1 / 19) * (base * 0.05) / n;
      const cap = ftol(rep * rep * 0.5);
      if (!(base <= cap)) base = cap;
      if (status === 2) base *= 1 / 3; else if (status === 3) base *= 0.2;
    }
    if (base < 0 && rand(2) !== 0) base = 50000;
    const r = ftol(base * 0.2);
    const a = rand(r), b = rand(r);
    x = (a - b) + base;
    if (nationName(g, c.nation) === 'South Korea' && x > 250000) x = ftol((x - 250000) * 0.5 + 250000);
  }
  return { bal: ftol(x), status };
}

/** spillets nye spil: posterne og startsaldoen for alle klubber (newgame.ts, efter staben – kun cmActive) */
export function cmFinanceNewGame(g: GameState, world: CMWorld, seed: number): void {
  if (!cmActive(g) || g.draft || !world.cmRaw?.fin) return;
  const raw = world.cmRaw;
  g.cmFinRaw = Object.fromEntries(Object.entries(raw.fin!).map(([k, v]) => [k, v.slice()]));
  g.cmNation85 = (raw.nation85 ?? []).slice();
  g.cmLowerDiv = raw.lowerDiv ?? -1;
  g.cmFin = {};
  // formændene: den manglende del af ikke-spillerposten som originalens spilstart (sub_535a80 – cmStaffInit.ts), puljen = world-filens stab
  const pool: NpTemplate[] = (world.staff ?? []).filter((r) => r[11]).map((r) => npTemplate(npFromWorld(r[7], r[11]!, r[10]?.[7] ?? 0)));
  for (const c of Object.values(g.clubs)) {
    const fin = world.clubFinance?.[c.id];
    const rand = cmRand(seed, c.id, 0x5961d0);
    const { bal, status } = initForClub(g, c, fin?.[0] ?? 0, rand);
    let chair: CmFinRec['chair'] = null;
    const ch = raw.chair?.[c.id];
    if (ch) {
      const np = npFromWorld(ch[0], [ch[1], ...ch.slice(2, 23), ch[23]], ch[24]);
      if (pool.length) staffInitRecord({ np, job: ch[23], nation: g.nations[ch[25]]?.name ?? null, clubRep: repOf(g, c), name: '', hasPlayer: false }, pool, cmRand(seed, c.id, 0x537d59));
      chair = [np.a[0x0f - 0x0e], np.a[0x20 - 0x0e], ch[26], ch[27]];
    }
    // 0x5965a2: +0x166 efter velstanden (ejer stadion: 5 rig / 15 gæld, ellers 10)
    const band = wealthBand(bal, repOf(g, c));
    const s166 = b6d(c) && band !== 0 ? (band > 0 && band <= 2 ? 5 : 15) : 10;
    g.cmFin[c.id] = { wb: 0, top: 0, st: 0, share: f32(0.1), wk: 3, s165: 0, s166, status, chair, tm: blank(), lm: blank(), ty: blank(), ly: blank() };
    if (!fin) continue;
    if (world.clubBalance?.[c.id] === undefined) c.balance = bal / GBP;
    supporterInit(g, c, cmRand(seed, c.id, 0x68f130));
  }
  // ugens lønsum ved start (FinanceTable 0x59a370 → refresh_all_wage_bills 0x59cf50)
  // (alle klubber på én gang: udlejede spillere og staben slås op pr. klub – samme rækkefølge som i updateWageBill)
  const idx: WageIdx = { loanOut: new Map(), staff: new Map() };
  for (const p of Object.values(g.players)) if (p.loan?.from !== undefined && p.contract) { const a = idx.loanOut.get(p.loan.from) ?? []; a.push(p); idx.loanOut.set(p.loan.from, a); }
  for (const s of Object.values(g.staff)) { const a = idx.staff.get(s.club) ?? []; a.push(s); idx.staff.set(s.club, a); }
  for (const c of Object.values(g.clubs)) { const r = g.cmFin[c.id]; if (r) updateWageBill(g, c, r, idx); }
}

// ------------------------------------------------------------------------------------------------ tilhængernes tillid (MANAGER_MANAGER +8)

/** init_club_board_records 0x68f130 (0x68f2a1–0x68f63e): tilhængernes tillid ved start (0..10000). Managerens omdømme = ikke-spillerposten
 *  +0xa (spillets Staff.rep · 2); menneskets klub: 4500 (0x68f3da – spillets menneske har ingen post, *afvigelse*) */
export function supporterInit(g: GameState, c: Club, rand: (n: number) => number): void {
  const rep = repOf(g, c);
  const mgr = Object.values(g.staff).find((s) => s.club === c.id && s.role === 'manager');
  let X: number;
  if (!mgr && c.manager !== -1) { (g.cmSup ??= {})[c.id] = 5000; return; }   // 0x68f81b: ingen manager → 5000
  if (c.manager === -1) X = 4500;
  else {
    X = (mgr!.rep ?? 0) * 2;
    if (X === 0) X = rep !== 0 ? rep * 0.75 : 5000;
  }
  if (X < 500) X = rand(1000) + 500;
  const D = rep * 0.5 + 2500;
  const S = f32((X / D) * 7500);
  // +6 bestyrelsen (her kun for at trække de samme tal): rand(500), rand(500), evt. rand(750)/rand(500)
  const a6 = rand(500), b6 = rand(500);
  const v6 = ftol((S + a6) - b6);
  if (v6 < 5750) rand(750); else if (v6 > 9500) rand(500);
  const a = rand(500), b = rand(500);
  let v = ftol((S + a) - b);
  if (v < 5750) v = rand(500) + 5750; else if (v > 10000) v = 10000;
  (g.cmSup ??= {})[c.id] = v;
}
const supporters = (g: GameState, c: Club) => g.cmSup?.[c.id] ?? 5000;

// ------------------------------------------------------------------------------------------------ Finance::update_wage_bill 0x598370

/** ugens lønsum (£): spillernes og stabens kontrakter, udfyldningen under 15 spillere og omdømmeleddet */
type WageIdx = { loanOut: Map<number, Player[]>; staff: Map<number, Staff[]> };
export function updateWageBill(g: GameState, c: Club, r: CmFinRec, idx?: WageIdx): void {
  let wb = 0, top = 0, n = 0;
  for (const p of squad(c.id)) {
    if (!p.contract) continue;
    n++;
    // 0x5983fa: lejekontrakten trækkes fra (spillets model: lejeklubben betaler andelen `share`)
    const w = Math.round(p.contract.wage * (p.loan ? p.loan.share ?? 1 : 1) * GBP);
    if (w > top) top = w;
    wb += w;
  }
  // udlejede spillere: moderklubben betaler resten (spillets lejemodel)
  for (const p of idx ? idx.loanOut.get(c.id) ?? [] : Object.values(g.players)) if (p.loan?.from === c.id && p.contract) wb += Math.round(p.contract.wage * (1 - (p.loan.share ?? 1)) * GBP);
  // stabens kontrakter (+0x19f/+0x1b3/+0x1cf)
  for (const s of idx ? idx.staff.get(c.id) ?? [] : Object.values(g.staff)) {
    if (s.club !== c.id || !s.wage) continue;
    const w = Math.round(s.wage * GBP);
    if (w > top) top = w;
    wb += w;
  }
  const rep = repOf(g, c);
  if (n < 15) {
    let w = rep > 4750 ? rep - 1950 : rep > 2250 ? ftol((rep - 2250) * 0.5 + 550) : ftol(rep * 0.25);
    if (r.status !== 1) w = ftol(w * 0.5);
    let k = nation7e(g, c);
    if (k < 1) k = 1; else if (k > 3) k = 3;
    w = idiv(w, k);
    wb += (15 - n) * w;
  }
  const nn = nationName(g, c.nation), r2 = rep * rep;
  let term: number;
  if (r.status === 1) {
    if (nn === 'England' || nn === 'Italy') term = r2 * (rep > 5250 ? 0.001 : rep > 3250 ? 0.0008 : 0.0006);
    else term = r2 * 0.0004;
  } else term = r2 * (rep > 3250 ? 0.0002 : 0.0001);
  r.wb = ftol(term + wb);
  r.top = top;
}

// ------------------------------------------------------------------------------------------------ ugen: merchandise og sæsonkort

/** add_weekly_merchandising_income 0x59b7e0 */
function weeklyMerch(g: GameState, c: Club, rand: (n: number) => number): void {
  const rep = repOf(g, c), att = avgOf(g, c), r = g.cmFin![c.id];
  const japan = nationName(g, c.nation) === 'Japan';
  let v: number;
  if (r.chair) {
    const b5 = r.chair[0] * 5;
    const k = b6d(c) ? rep + b5 * 4 + b5 : ftol((rep + b5 * 4 + b5) * 0.65);
    v = ftol(att * rep * (k > 5500 ? 0.000575 : k > 4000 ? 0.000375 : 0.000125));
  } else if (rep > 5250) v = ftol(att * rep * (japan ? 0.000675 : 0.000575));
  else if (rep > 3750) v = ftol(att * rep * (japan ? 0.000575 : 0.000375));
  else v = ftol(att * rep * (japan ? 0.000375 : 0.000125));
  const m = ftol((rand(11) + 95) * v * 0.01);
  book(g, c, K.merch, m);
}

/** finance_get_days_to_season_start 0x59b4c0: dage til landets sæsonstart, når den er højst 2 måneder væk (ellers 0), og om sæsonen er
 *  efter den første (sæsonkortene bogføres først fra den anden sæson – 1. sæsons kort ligger i databasens saldo) */
function daysToSeasonStart(g: GameState, c: Club): { days: number; past: boolean } {
  const date = g.date, y = Number(date.slice(0, 4)), al = Number(date.slice(5, 7)) - 1;
  const A = seasonStartDay(c.nation) ?? 180;
  // +0x17 ≠ 0 → 2002, ellers spilstartens år + 1 (begge giver 2002 for et spil fra 2001)
  const past = y >= (g.cmFinStartYear ?? y) + 1;
  // nøglelandstabellens +0x2a (sæsonstarten) rulles frem på sæsonopdateringens dag (0x5d5ae0): den første start efter den seneste opdatering
  const upd = seasonUpdateDay(g, c);
  const U = date.slice(5) >= upd ? `${y}-${upd}` : `${y - 1}-${upd}`;
  const uy = Number(U.slice(0, 4));
  const start = isoFromDoy(A, uy) >= U ? isoFromDoy(A, uy) : isoFromDoy(A, uy + 1);
  const di = Number(start.slice(0, 4)), bl = Number(start.slice(5, 7)) - 1;
  let ok: boolean;
  if (bl < 2) ok = di !== y ? al < bl : al > 12 - bl;   // 0x59b5a0: start i januar/februar
  else { const d = bl - al; ok = d <= 2 && d >= 0; }
  if (!ok) return { days: 0, past };
  const days = Math.round((Date.parse(start) - Date.parse(date)) / 86400000);
  return { days: days > 0 ? days : 0, past };
}
const isoFromDoy = (doy: number, y: number) => new Date(Date.UTC(y, 0, 1) + doy * 86400000).toISOString().slice(0, 10);

/** sæsonkortenes andel 0x9c8758 (float) */
const ST_TABLE = [0.5, 0.2, 0.15, 0.1, 0.5, 0.2, 0.1, 0.05, 0.01].map(f32);

/** Finance::sell_season_tickets 0x599a20 */
function sellSeasonTickets(g: GameState, c: Club, r: CmFinRec, apply: boolean, rand: (n: number) => number): void {
  const rep = repOf(g, c);
  const d = g.cmCrowd?.[c.id];
  // stadion under 1500 pladser → omdømme · 2,5 (mindst 1500), skrives tilbage
  if (d && d[3] >= 0 && d[5] < 1500) { d[5] = ftol(rep * 2.5); if (d[5] < 1500) d[5] = 1500; }
  const cap = capOf(g, c);
  let f1 = supporters(g, c) * 0.0001;
  if (!(f1 > 0.15)) f1 = 0.15;
  const a = ftol(avgOf(g, c) * f1);
  let f2 = rep * 0.00025;
  if (!(f2 > 0.5)) f2 = 0.5;
  const b = ftol(a * f2);
  const lim = cap >= 0 ? cap * 0.875 : 1250;
  const target = ftol(b < lim ? b : lim);
  if (target === 0 || !(r.st < target)) return;
  let wk = ((r.wk + 1) << 24) >> 24;
  if (wk < 0 || wk > 8) wk = 8;
  r.wk = wk;
  const fresh = ftol((target - r.st) * ST_TABLE[wk]);
  const x = idiv((rand(11) + 95) * fresh, 100);
  r.st += x;
  const price = ftol((rep * 0.002 + 4.0) * 20);
  let inc = price * x;
  let sh = f32(r.st / lim);
  if (sh > 0.875) sh = f32(0.875);
  r.share = sh;
  const k = c.nation >= 0 ? nation7e(g, c) : 3;
  if (k === 2) inc = idiv(inc, 4); else if (k !== 1) inc = idiv(inc, 10);
  const key = keyClub(c), nn = nationName(g, c.nation);
  if (rawOf(g, c)[0] === SERIE_A) inc = ftol(inc * 1.25);
  else if (key === 'CHELSEA') inc = ftol(inc * 1.5);
  else if (key === 'ARSENAL' || key === 'TOTTENHAM') inc = ftol(inc * 1.3);
  else if (key === 'EVERTON') inc = ftol(inc * 0.75);
  else if (key === 'LIVERPOOL') inc = ftol(inc * 0.9);
  else if (nn === 'Germany') inc = ftol(inc * 1.2);
  if (apply) book(g, c, K.seasonTickets, inc);
  // merchandise af de nye kortholdere (trækkes også uden bogføring)
  const m = ftol(((rand(rep) + rand(rep) + 1) * 0.001 + 1.0) * x);
  book(g, c, K.merch, m);
}
/** "Italian Serie A" (club_comp.dat) */
const SERIE_A = 24;

// ------------------------------------------------------------------------------------------------ FinanceTable::daily_update 0x59b9c0

/** dagens økonomi (sim.ts newDay, i stedet for weeklyWages/monthlyIncome) */
export function cmFinanceDay(g: GameState): void {
  if (!cmFinOn(g)) return;
  const date = g.date, sunday = cmWeekday(date) === 6;
  const monthEnd = addDays(date, 1).slice(5, 7) !== date.slice(5, 7);
  const dn = Math.round(Date.parse(date) / 86400000);
  for (const c of Object.values(g.clubs)) {
    const r = g.cmFin![c.id];
    if (!r) continue;
    const rand = cmRand(g.seed ?? 0, c.id, dn, 0x59b9c0);
    if (active(g, c)) {
      if (sunday) {
        updateWageBill(g, c, r);
        book(g, c, K.wages, r.wb);
        weeklyMerch(g, c, rand);
        const { days, past } = daysToSeasonStart(g, c);
        if (days) sellSeasonTickets(g, c, r, past, rand);
        else { r.st = 0; r.wk = 0; }
      }
    } else clampInactive(g, c, r, rand);
    if (monthEnd && active(g, c)) monthEndClub(g, c, r, rand);
    else if (!monthEnd && active(g, c) && (r.s165 === 1 || r.s165 === 2)) {
      // 0x59ccc0: begivenhederne (process_club_finance_events 0x59ed70) – ikke porteret; tallet trækkes
      rand(Math.max(10, idiv(11000 - repOf(g, c), 250)));
    }
    if (monthEnd) { r.lm = r.tm; r.tm = blank(); }
  }
  // sæsonopdateringens dag (nøglelandstabellen +0x15, 0x5d5ae0): sæsonens poster → sidste sæson, udbyttet
  for (const c of Object.values(g.clubs)) {
    const r = g.cmFin![c.id];
    if (r && active(g, c) && date.slice(5) === seasonUpdateDay(g, c)) seasonEndClub(g, c, r, cmRand(g.seed ?? 0, c.id, dn, 0x59cfa0));
  }
}

/** 0x59bfef: klubber uden for de indlæste ligaer – saldoen holdes inden for grænser efter status */
function clampInactive(g: GameState, c: Club, r: CmFinRec, rand: (n: number) => number): void {
  let b = balGbp(c);
  const st = r.status;
  if (st === 3) { if (b < -10000) b = -10000; else if (b > 2500) b = 2500; }
  else if (st === 2) {
    const big = repOf(g, c) > 2500;
    const lim = big ? 250000 : 25000;
    if (b < -lim) b = -lim; else if (b > lim) b = lim;
  } else if (b < -2_250_000) b = rand(5) === 0 ? 175000 : -2_250_000;
  else if (b > 2_250_000) b = rand(5) === 0 ? -175000 : 2_250_000;
  else return;
  c.balance = b / GBP;
}

/** månedens slutning (0x59c17d–0x59cc78) for én klub */
function monthEndClub(g: GameState, c: Club, r: CmFinRec, rand: (n: number) => number): void {
  const rep = repOf(g, c);
  // 0x59c212: dyb gæld → nyhed og spillere vil sælges (Media 0x74ae60, STAFF_CONTRACT 0x867700) – ikke porteret; tallene trækkes
  if (wealthBand(balGbp(c), rep) === -2) { rand(rep); rand(20000); }
  // 0x59c3d4: stadionet (+0x4c/+0x4d)
  const [, , h4c, h4d] = rawOf(g, c);
  if (capOf(g, c) >= 0) {
    let v = h4c ? 12500 : 0;
    if (h4d) v += rep > 4500 ? 12500 : 7500;
    book(g, c, K.maintenance, v);
  }
  // 0x59c438: træningsanlægget +0x7f
  const tf = c.facilities;
  const tcost = tf < 6 ? tf * 400 : tf < 16 ? (tf - 2) * 1000 : tf >= 20 && rep >= 6250 ? 40000 : (tf - 12) * 4000;
  book(g, c, K.maintenance, tcost);
  // 0x59c4ba: divisionen har ingen tabel → billetindtægt af omdømme · tilskuere
  if (!hasTable(g, rawOf(g, c)[0])) book(g, c, K.gate, ftol(rep * avgOf(g, c) * 0.005));
  // 0x59c516: renter
  const bal = balGbp(c);
  if (bal > 0) book(g, c, K.interestIn, ftol(bal * 0.0025));
  else {
    const rate = bal > -1000 * rep ? 0.012 : bal > -2500 * rep ? 0.018 : 0.024;
    book(g, c, K.interestOut, ftol(-(bal * rate)));
  }
  // 0x59c62d: Other (udgift)
  let f: number;
  if (r.chair) {
    const b = r.chair[0];
    f = f32((rand(10 * (31 - b)) + 1) * 0.01 + 1.5);
    if (rand(b + 1) === 0) f = f + f;
  } else {
    f = f32((rand(150) + 1) * 0.01 + 1.5);
    if (rand(11) === 0) f = f + f;
  }
  book(g, c, K.otherOut, r.status === 1 ? ftol((rep + 125) * f) : ftol((rep + 50) * f * 0.25));
  // 0x59c73c: Other (indtægt)
  const gg = (r.chair ? rand(10 * r.chair[0]) + 1 : rand(100) + 1) * 0.01 + 1.5;
  const quad = (x: number, k: number) => ftol((x * x * 0.0002 + 50) * k);
  book(g, c, K.otherIn, r.status === 1 && rep >= 5000 ? ftol((rep + 50) * gg) : quad(rep, gg));
  // 0x59c81b: Investments (PLC +0x82)
  if (rawOf(g, c)[1]) {
    const h = (rand(100) + 1) * 0.01 + 0.75;
    book(g, c, K.investments, rep > 5000 ? ftol(rep * h) : quad(rep, h));
  }
  // 0x59c8c0: Ground Maintenance
  const cap = capOf(g, c);
  let base: number, fac: number;
  if (r.status === 1) {
    if (cap < 0) base = 2500;
    else {
      if (!b6d(c)) base = ftol(cap * 1.5);
      else {
        const T = r.s165 === 0 ? [1.425, 1.375, 1.325, 1.125, null, 0.875] : r.s165 === 1 ? [1.325, 1.275, 1.225, 0.975, 0.85, 0.725] : [1.375, 1.325, 1.275, 1.025, 0.9, 0.775];
        const m = cap > 70000 ? T[0] : cap > 50000 ? T[1] : cap > 27500 ? T[2] : cap > 21000 ? T[3] : cap > 10000 ? T[4] : T[5];
        base = m === null ? cap : ftol(cap * m);
      }
      if (nationName(g, c.nation) === 'Germany') base = ftol(base * 0.8);
      if (rep > 7250) base = ftol(base * 1.35); else if (rep > 5750) base = ftol(base * 1.25);
      else if (rep > 4250) base = ftol(base * 1.15); else if (rep > 1250) base = ftol(base * 1.05);
    }
    fac = (rand(25) + 1) * 0.01 + 0.75;
  } else {
    base = cap < 0 ? 1000 : !b6d(c) ? cap : ftol(cap * (r.s165 === 1 ? 0.45 : 0.5));
    if (base > 750) base = 750 - ftol((base - 750) * -0.1);
    fac = (rand(25) + 1) * 0.01 + 0.6;
  }
  book(g, c, K.maintenance, ftol(fac * base));
  // 0x59cbfd: process_club_finance_events(club, 1) – ikke porteret
}

// ------------------------------------------------------------------------------------------------ kampene

/** calc_gate_receipts 0x59af40 (£): tilskuere · billetpris efter omdømme/turnering, minus sæsonkortandelen i egen liga */
export function gateReceipts(g: GameState, f: Fixture, att: number, codes: { compRep: number; b3c: number; friendly: boolean }): number {
  const home = g.clubs[f.home];
  if (!att || !home) return 0;
  const r = g.cmFin?.[home.id], rep = repOf(g, home);
  let v: number;
  if (codes.b3c && f.comp) v = (codes.compRep + 8) * att;
  else {
    if (!f.comp || codes.friendly) v = ftol(idiv(rep, 500) * 0.5 * att);
    else {
      const away = g.clubs[f.away];
      const pro = (r?.status ?? 1) === 1 || (g.cmFin?.[away?.id ?? -1]?.status ?? 1) === 1;
      v = (idiv(rep, 500) + (pro ? 4 : 3)) * att;
    }
    if (r && f.comp === home.league) v = ftol(v - r.share * v);
  }
  const k = nation7e(g, home);
  if (k === 2) v = idiv(v, 4); else if (k !== 1) v = idiv(v, 10);
  const key = keyClub(home);
  if (rawOf(g, home)[0] === SERIE_A) v = ftol(v * 1.25);
  else if (key === 'CHELSEA') v = ftol(v * 1.5);
  else if (key === 'ARSENAL' || key === 'TOTTENHAM') v = ftol(v * 1.3);
  else if (key === 'EVERTON') v = ftol(v * 0.75);
  else if (key === 'LIVERPOOL') v = ftol(v * 0.9);
  if (nationName(g, home.nation) === 'Germany') v = ftol(v * 1.2);
  return v;
}

/** fixture-koderne process_match_income bruger (engine/grid/gameInputs.ts fixtureCodesOf) */
export interface MatchFinCodes { b3a: number; b3b: number; b3c: number; compRep: number; friendly: boolean; leagueOfHome: boolean }

/** FinanceTable::process_match_income 0x59a5d0: kampens tv-penge (begge) og billetindtægten (hjemme; neutral bane/pokal: delt) */
export function cmMatchIncome(g: GameState, f: Fixture, att: number, codes: MatchFinCodes): number {
  if (!cmFinOn(g)) return 0;
  const H = g.clubs[f.home], A = g.clubs[f.away];
  if (!H || !A) return 0;
  const rh = g.cmFin![H.id], ra = g.cmFin![A.id];
  if (!rh || !ra) return 0;
  const rand = cmRand(g.seed ?? 0, f.id, 0x59a5d0);
  const gate = gateReceipts(g, f, att, codes);
  const repH = repOf(g, H);
  // 0x59a80d: 1,75 · tilskuerne (1/(rand(10) + 2) er heltalsdivision = 0)
  let plus = 0;
  if (att) { rand(10); plus = ftol(1.75 * att); }
  // 0x59a856: kampens omkostning efter stadionet
  let cost: number;
  const cap = capOf(g, H);
  if (rh.status !== 1 && ra.status !== 1) cost = ftol(att * 0.25);
  else if (cap >= 0) {
    if (cap > 17500) cost = ftol(cap * 0.625);
    else if (cap > 12500) cost = ftol(cap * 0.5);
    else if (cap > 5000) cost = ftol(cap * (att < 5000 ? 0.4 : 0.45));
    else cost = ftol(cap * 0.35);
  } else cost = ftol(att * (att > 20000 ? 0.725 : att > 10000 ? 0.675 : att > 5000 ? 0.6 : 0.5));
  // (fixture +0x40 ≠ 0 → mindst 500 – feltet kendes ikke; spillet: 0)
  // 0x59a8e5: politi og drift efter hjemmeholdets omdømme
  let ops: number;
  if (rh.status === 1) {
    if (repH !== 0) { ops = ftol(rand(200) + att * 1.25 + repH * 0.5 + 300); if (repH > 4750) ops = ftol(ops * 1.25); }
    else ops = ftol(rand(400) + att * 1.25 + 600);
  } else {
    const x = repH !== 0 ? rand(ftol(repH * 0.25)) : rand(250);
    const y = rand(250);
    ops = ftol(att + (y + x));
  }
  // 0x59aab1: tv-pengene (+0x3b = tv-pladsen, ellers efter turneringstypen +0x3a)
  let tv = 0;
  if (codes.b3b === 0) tv = 25000; else if (codes.b3b === 1) tv = 75000; else if (codes.b3b === 2) tv = 125000;
  else if (codes.b3a === 8 || codes.b3a === 7) { const s = repH + repOf(g, A); tv = s > 10000 ? 125000 : s > 7500 ? 75000 : 25000; }
  else if (codes.b3a === 6) tv = 12500 * Math.max(codes.compRep, 5);
  else if (codes.b3a === 4) tv = 2500 * Math.max(codes.compRep, 5);
  const k = nation7e(g, H);
  if (k === 2) { tv = idiv(tv, 5); plus = idiv(plus, 2); cost = idiv(cost, 4); ops = idiv(ops, 2); }
  else if (k !== 1) { tv = idiv(tv, 10); plus = idiv(plus, 10); cost = idiv(cost, 15); ops = idiv(ops, 10); }
  const nn = nationName(g, H.nation);
  if (nn === 'Wales' || nn === 'Northern Ireland' || nn === 'Republic Of Ireland') { tv = idiv(tv, 5); plus = idiv(plus, 2); cost = idiv(cost, 4); ops = idiv(ops, 2); }
  const net = plus - ops - cost + gate;
  if (!codes.b3c && codes.leagueOfHome) {
    book(g, H, K.tv, ftol(tv * 0.75));
    book(g, A, K.tv, ftol(tv * 0.25));
    book(g, H, K.gate, net);
    // 0x59adc6: eget stadion → driften pr. hjemmekamp
    if (b6d(H) && cap >= 0) book(g, H, K.maintenance, ftol(((rand(15) + 1) * 0.01 + 0.85) * cap));
  } else {
    const half = ftol(tv * 0.5);
    book(g, H, K.tv, half); book(g, A, K.tv, half);
    const n2 = trunc(net / 2);
    book(g, H, K.gate, n2); book(g, A, K.gate, n2);
  }
  return gate;
}

// ------------------------------------------------------------------------------------------------ ligaerne: præmie og tv-penge

/** pr. liga (turnerings-id): calc_prize_fund's enhed og pay_tv_rights i create_table (år > 1999). EngFirst: faldskærm til de nedrykkede
 *  (sidste division = Premier) og de oprykkede (Second); ellers alle samme beløb. Afkodet af *::create_table (tvprize i noterne). */
const LEAGUE_MONEY: Record<number, { unit: number; tv?: number; tvBy?: [number, number][] }> = {
  7: { unit: 250000, tv: 12_000_000 },                                 // EngPrm (≤ 1999: 5.000.000)
  8: { unit: 70000, tvBy: [[7, 5_877_777], [8, 4_100_000], [9, 4_100_000]] }, // EngFirst
  9: { unit: 20000, tv: 2_500_000 },                                   // EngSecond (≤ 1999: 300.000)
  10: { unit: 10000, tv: 1_000_000 },                                  // EngThird (≤ 1999: 200.000)
  34: { unit: 50000, tv: 500_000 }, 35: { unit: 25000 },               // ScoPrm, ScoFirst
  24: { unit: 250000, tv: 5_000_000 }, 25: { unit: 70000 },            // ItaSerA, ItaSerB
  52: { unit: 250000, tv: 5_000_000 }, 53: { unit: 50000 },            // SpaFirst, SpaSecond
  16: { unit: 200000, tv: 5_000_000 }, 17: { unit: 50000, tv: 1_300_000 }, // GerFirst, GerSecond
  11: { unit: 200000, tv: 6_000_000 },                                 // FraFirst
  22: { unit: 50000, tv: 1_000_000 },                                  // HolPrm
  46: { unit: 100000, tv: 1_000_000 }, 47: { unit: 50000 },            // PorPrm, PorSecond
  0: { unit: 20000, tv: 50000 },                                       // BelFirst
  4: { unit: 50000, tv: 100000 }, 5: { unit: 10000 },                  // DenPrm, DenFirst
  143: { unit: 100000, tv: 500000 },                                   // GrePrm
  176: { unit: 50000, tv: 300000 },                                    // RusPrm
  138: { unit: 30000, tv: 100000 },                                    // CroA1
  69: { unit: 100000, tv: 3_000_000 },                                 // JapJ1
  63: { unit: 50000, tv: 500000 },                                     // ArgPrm
  65: { tv: 150000, unit: 0 },                                         // BraNatFirst
  315: { unit: 50000 }, 38: { unit: 50000 }, 229: { unit: 10000 },     // NorPrm, SwePrm, KorLeague
  174: { unit: 0, tv: 1_000_000 },                                     // TurFirst
};

/** League::pay_prize_money 0x682e10: (n − plads) · enhed til hver klub, når ligaen er færdigspillet (League::check_complete 0x689ad0) */
export function cmLeaguePrize(g: GameState, compId: string, order: number[]): boolean {
  if (!cmFinOn(g)) return false;
  const m = /^CM(\d+)$/.exec(compId);
  const lm = m ? LEAGUE_MONEY[+m[1]] : undefined;
  if (!lm) return false;
  const n = order.length;
  order.forEach((cid, i) => { const c = g.clubs[cid]; if (c) book(g, c, K.prize, (n - i) * lm.unit); });
  return true;
}

/** League::pay_tv_rights 0x683010 i create_table (ny sæson; i første sæson findes FinanceTable endnu ikke) */
export function cmLeagueTv(g: GameState, compId: string, clubs: number[]): void {
  if (!cmFinOn(g)) return;
  const m = /^CM(\d+)$/.exec(compId);
  const lm = m ? LEAGUE_MONEY[+m[1]] : undefined;
  if (!lm) return;
  for (const cid of clubs) {
    const c = g.clubs[cid];
    if (!c) continue;
    if (lm.tv) book(g, c, K.tv, lm.tv);
    else if (lm.tvBy) {
      // club +0x5b = sidste sæsons division (spillets lgHistory: ligaen ved sidste sæsonafslutning)
      const last = lastDivOf(g, c);
      for (const [div, amt] of lm.tvBy) if (last === div) book(g, c, K.tv, amt);
    }
  }
}
/** club +0x5b (sidste sæsons division): klubbens liga lige før sæsonskiftet (cmBeforeRollover) */
let lastDiv = new Map<number, number>();
export function cmBeforeRollover(g: GameState): void {
  lastDiv = new Map(Object.values(g.clubs).map((c) => [c.id, /^CM(\d+)$/.test(c.league) ? +c.league.slice(2) : -1]));
}
function lastDivOf(_g: GameState, c: Club): number { return lastDiv.get(c.id) ?? -1; }
/** ligaen har originalens præmie (spillets egen præmie springes over) */
export const hasLeagueMoney = (compId: string) => { const m = /^CM(\d+)$/.exec(compId); return !!m && LEAGUE_MONEY[+m[1]] !== undefined; };

compHooks.leagueDone = (comp, order) => { const g = gs(); if (cmFinOn(g)) cmLeaguePrize(g, comp.id, order); };

// ------------------------------------------------------------------------------------------------ sæsonens slutning

/** nøglelandstabellens +0x15 (key_nation_build_table 0x667150): sæsonopdateringens dag – 20/6 i de europæiske lande;
 *  Finland, Rusland, Sverige 27/12, Norge 27/11, Japan 25/1, Sydkorea 20/1 (de øvrige ikke-europæiske: *ikke afkodet*, 20/6) */
const UPDATE_DAY: Record<string, string> = { Finland: '12-27', Russia: '12-27', Sweden: '12-27', Norway: '11-27', Japan: '01-25', 'South Korea': '01-20' };
function seasonUpdateDay(g: GameState, c: Club): string {
  return UPDATE_DAY[nationName(g, c.nation)] ?? '06-20';
}

/** end_season_for_nation 0x59cdd0 for én klub: season_end_club_update (udbyttet) og sæsonens blok → sidste sæson */
function seasonEndClub(g: GameState, c: Club, r: CmFinRec, rand: (n: number) => number): void {
  const rep = repOf(g, c), bal = balGbp(c);
  // 0x59db58: udbyttet (stadionarbejderne før det – ikke porteret)
  let D = 0;
  const T0 = Math.max(rep * 8000, 500000);
  if (bal > T0 && rawOf(g, c)[1]) {
    D = rep < 4000 ? Math.max((rand(501) + 1500) * rep, 50000) : (rand(501) + 2000) * rep;
  } else {
    let k = rep;
    if (r.chair) {
      const e = 3 * (7 - r.chair[3]) - r.chair[1];
      k = (rep + e * 4 + e) << 16 >> 16;
      if (k < 500) k = 500;
    }
    if (bal > k * 6000) D = rep < 4000 ? (rand(501) + 1000) * rep : (rand(501) + 1500) * rep;
    else if (bal > k * 3000) D = rep < 4000 ? rep * 500 : rep * 750;
  }
  if (D) {
    book(g, c, K.dividends, D);
    c.lastDividend = Math.round(D / GBP);
  }
  r.ly = r.ty; r.ty = blank();
}

// ------------------------------------------------------------------------------------------------ visningen (klassisk Finances)

/** blokkens post i pund for perioden (null = ingen post) */
export function cmFinPeriod(g: GameState, cid: number, key: FinKey, period: 'month' | 'last' | 'year' | 'lastYear'): number | null {
  const r = g.cmFin?.[cid];
  if (!r) return null;
  const b = period === 'month' ? r.tm : period === 'last' ? r.lm : period === 'year' ? r.ty : r.ly;
  return b[K[key]];
}
