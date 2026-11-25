// Originalens klubøkonomi (cm0102.exe 3.9.68, finance.cpp – FinanceTable/Finance) – CM-databaser i ægte tilstand (cmFinOn): den originale database
// og (MODERN_PARITY 4, 18/11) nye 2026/27-spil, hvis spilstart byggede posterne (g.cmFin).
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
//   process_club_finance_events 0x59ed70 (begivenhederne: cmFinEvents.ts).
// Ikke porteret: se ENGINE_PORT_PLAN.md (transferbudgettet 0x598800, stadionudvidelserne i 0x59cfa0,
//   pokal-/Europapræmierne, bonusserne 0x4ca6d0, 2004-stadionflytningerne øverst i 0x59b9c0).
//
// Pengene: originalen regner i hele pund; spillet gemmer euro (Club.balance). Posterne regnes i pund som i originalen og bogføres i rec.tm/ty
// (pund) og Club.balance/Club.finance (euro = pund / k). k = klubbens €→£-faktor cmGbp (cmMoney.ts): den originale database 0,86 (newgame.ts),
// 2026/27 faktoren pr. liga (databasens lønninger/spillets – pengeprincip B). Saldoen i pund = round(balance · k).
// Talrækken er spillets egen (cmRand pr. klub og dag) – originalens kald af 0x90cfc0 i samme rækkefølge pr. klub.
import { NO_CARRY, registerCarry } from './carry';
import type { Club, Fixture, GameState, Player, Staff } from './types';
import { cmLogic, cmRand, clubRepMem } from './cmPlayerData';
import { cmWeekday } from './cmCalendar';
import { cmUpdateDay } from './cmSeason';
import { seasonStartDay } from './cmFitness';
import { addDays } from './dates';
import { addNews, gs, squad } from './state';
import { asOwner, isHumanClub } from './humans';
import { compHooks } from './hooks';
import { npFromWorld, npTemplate, personalFill_535a80, staffConvert, staffInitRecord, type NpTemplate } from './cmStaffInit';
import type { CMWorld } from './data/cm0102';
import { cmFinEvents } from './cmFinEvents';
import { linkedClub } from './cmBTeam';
import { CM_CUP_PRIZES } from './data/cmCupPrizes';
import { CM_CUP_TABLES } from './data/cmCupTables';
import { CM_EURO_ROUNDS } from './data/cmEuroTables';
import { cmLeagueCupStructure } from './cmCups';
import { cmGbp } from './cmMoney';

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

/** (MODERN_PARITY 4) originalens økonomi gælder: en CM-database i ægte tilstand (cmLogic – for den originale database = cmActive), ikke
 *  draft-ligaen, og spilstarten byggede posterne (g.cmFin – cmFinanceNewGame). Ældre 2026/27-spil uden posterne beholder spillets økonomi (econ26). */
export const cmFinOn = (g: GameState): boolean => cmLogic(g) && !g.draft && !!g.cmFin;
/** klubbens €→£-faktor (cmMoney.ts; den originale database: 0,86) */
const gbp = (g: GameState, c: Club): number => cmGbp(g, c.id);
/** club.dat's økonomi ved start [saldo, tilskuere, træningsanlæg] (£): world.json for den originale database, world-cm.json (cmRaw.clubFin) for 2026/27 */
export const clubFinOf = (world: CMWorld): CMWorld['clubFinance'] => world.clubFinance ?? world.cmRaw?.clubFin;

const blank = () => new Array(N_KEYS).fill(0);
export const balGbp = (g: GameState, c: Club) => Math.round(c.balance * gbp(g, c));
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

/** klubbens liga er indlæst ([0xadadfc][division] ≠ 0): spillet har ligaen, og dens land er indlæst */
function hasTable(g: GameState, c: Club): boolean {
  const comp = g.comps[`CM${rawOf(g, c)[0]}`];
  return !!comp && comp.type === 'league' && nationLoaded(g, comp.nation >= 0 ? comp.nation : c.nation);
}
/** nation +0x11c: landet har indlæste ligaer – i originalen kun de valgte lande og baggrundslandene (Select League(s) = g.activeNations).
 *  Spillet kører også de andre landes ligaer, men i originalen findes de ikke: ingen tabel, ingen kampe, kun personerne i hukommelsen
 *  (0x524d70) – deres klubber har 0x59bfef's klemme (omdømme < 5000) eller dagen/måneden uden kampe (billetindtægt af omdømme · tilskuere,
 *  lønsum af hukommelsens kontrakter). Ældre spil uden activeNations: landet har en spilbar liga. */
export function nationLoaded(g: GameState, n: number): boolean {
  if (g.activeNations?.length) return g.activeNations.includes(n);
  return Object.values(g.comps).some((x) => x.type === 'league' && g.leagues[x.id]?.nation === n && !g.leagues[x.id]?.hidden);
}
/** personen er i originalens hukommelse (0x524d70): alle i klubber i de indlæste lande, ellers databasestørrelsen Maximum's udvalgte
 *  (Player.cmMem); spil fra en world-fil uden den oplysning: alle */
function inMemory(g: GameState, c: Club, p: Player): boolean {
  return !memKnown(g) || p.cmMem === 1 || nationLoaded(g, c.nation);
}
/** spillet har hukommelsens udvalgte i klubberne (world-filen med `tm` – Maximum og databasestørrelsen 2/Normal; spil startet før 15/11-2026 har
 *  kun de klubløse). Før kun Maximum (g.cmMaxMem): ved størrelse 2 talte alle udenlandske klubbers kontrakter med i lønsummen */
const MEM_KNOWN = new WeakMap<GameState, boolean>();
export function memKnown(g: GameState): boolean {
  let v = MEM_KNOWN.get(g);
  if (v === undefined) { v = Object.values(g.players).some((p) => p.club && p.cmMem === 1); MEM_KNOWN.set(g, v); }
  return v;
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
  const eur = amt / gbp(g, c), sign = INCOME.has(key) ? 1 : -1;
  c.balance += sign * eur;
  const ck = CLUB_KEY[key];
  if (ck) c.finance[ck] = (c.finance[ck] ?? 0) + eur;
}

/** køb/salg/signing on fee i blokkene (pund) UDEN at røre saldoen – spillets transferkode trækker selv beløbet fra Club.balance/Club.finance.
 *  Originalen: Finance::add_bought 0x599890 (blok +0x70/+0x110 i64, saldo −), add_sold 0x599800 (+0x78/+0x118 i64, saldo +) og
 *  add_signing_on 0x5998e0 (+0x9c/+0x13c, saldo −; kaldt fra TRANSFER_MANAGER 0x8c39c4 efter sign_contract 0x4cf720). Fundet af K2 (scripts/
 *  cm-day-lockstep.ts): originalens sæsonposter Bought/Sold/Signing On var > 0 for alle engelske klubber med handler, vores 0. */
export function bookBlock(g: GameState, c: Club | undefined, key: number, amt: number): void {
  const r = c && cmFinOn(g) ? g.cmFin?.[c.id] : undefined;
  if (!r || !amt) return;
  r.tm[key] += amt; r.ty[key] += amt;
}
/** bookBlock med beløbet i spillets € (omregnet med klubbens faktor – den originale database: round(€ · 0,86)) */
export function bookBlockEur(g: GameState, c: Club | undefined, key: number, eur: number): void {
  if (c) bookBlock(g, c, key, Math.round(eur * gbp(g, c)));
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
  if (status === 3 && hasTable(g, c)) status = 2;
  let x: number;
  if (dbBal !== 0 && dbBal < 1.5 * rep * rep) {
    // 0x5962f3: databasens beløb ± rand(B/5)
    // K8 (scripts/cm-data-check.ts, 755 klubber i oraklet): saldoen ligger mellem 0,91 og 1,09 × databasen (trekantfordeling) – rand(B/10), ikke B/5
    const a = rand(idiv(dbBal, 10)), b = rand(idiv(dbBal, 10));
    x = (b - a) + dbBal;
  } else if (c.name.slice(0, 6) === 'Rushde') {
    // K8 (scripts/cm-data-check.ts, 755 klubber i oraklet): saldoen ligger mellem 0,91 og 1,09 × databasen (trekantfordeling) – rand(B/10), ikke B/5
    const a = rand(idiv(dbBal, 10)), b = rand(idiv(dbBal, 10));
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

/** create_game 0x828110 (0x82992b–0x829afe, løkken over hukommelsens klubber lige efter indlæsningen): manglende klubdata udfyldes –
 *  omdømmet +0x80 ≤ 0 → rand(4000) + 1; tilskuertallet +0x73 ≤ 0 → max(rep²/2000, 250); minimum +0x77 ≤ 0 → max(rep²/10000, 75);
 *  maksimum +0x7b ≤ 0 → max(rep²/1000, 12500) + rand(7500); træningsanlægget +0x7f uden for 1–20 → rep/500 klemt til 1–20
 *  (landsholdene 0x53b900 har deres egne tal – de er ikke klubber her). Uden udfyldningen havde 501 klubber (bl.a. alle brasilianske) tilskuertal 0
 *  og dermed ingen billet-/merchandiseindtægt (0x59c4ba, 0x59b7e0), men fuld løn; i oraklet har fx Flamengo £7,7 mio. i billetindtægt 2001/02.
 *  Kun den originale database i ægte tilstand (newgame.ts, før bestyrelsen 0x68f130 og økonomien 0x5961d0, som læser tallene). */
export function cmClubDataFill_829960(g: GameState, world: CMWorld, seed: number): void {
  // create_game 0x82992b: også 2026/27 i ægte tilstand (cmLogic – gittermotorens tilskuertal og omdømme); klubStat/træningsanlægget kun med 2001-dataene
  if (!cmLogic(g) || !g.cmCrowd || !g.cmClubRep) return;
  for (const [k, cr] of Object.entries(g.cmCrowd)) {
    const cid = +k;
    const rand = cmRand(seed, cid, 0x829960);
    let rep = (g.cmClubRep[cid] << 16) >> 16;
    // 0x82996a: `inc al; movsx cx, al` – kun den lave byte, med fortegn (−128..127). Oraklet 14/7-01: alle databasens klubber med omdømme 0 har
    // små tal (fx Alfreton Town, Guiseley, Lancaster City +0x80 = 1, tilskuertal 250/75) – før 23/11 rand(4000) + 1 (Alfreton 2997, 4491 tilskuere),
    // og Englands regen-liste 0x7acfc0 (indlæste lande: kun +0x80 ≤ 2) var tom, så walisiske/irske regens blev klubløse.
    // (23/11) Omdømmet 1 kommer fra club.dat-indlæseren 0x54dc39 (0 → 1, cm0102.ts rawClubs) – her når kun negative tal (landsholdene har deres egne)
    if (rep <= 0) { rep = ((rand(4000) + 1) << 24) >> 24; g.cmClubRep[cid] = rep; }
    const r2 = rep * rep;
    if (cr[0] <= 0) cr[0] = Math.max(Math.trunc(r2 / 2000), 250);
    if (cr[1] <= 0) cr[1] = Math.max(Math.trunc(r2 / 10000), 75);
    const stat = g.cmClubStat?.[cid];
    if (stat) { const n = stat.slice() as typeof stat; n[1] = cr[1]; g.cmClubStat![cid] = n; }   // samme felt (+0x77, club.dat 119); kopi – world-filens række deles
    if (cr[2] <= 0) cr[2] = Math.max(Math.trunc(r2 / 1000), 12500) + rand(7500);
    const c = g.clubs[cid], fac = clubFinOf(world)?.[cid]?.[2];
    if (c && fac !== undefined && !(fac >= 1 && fac <= 20)) c.facilities = Math.min(20, Math.max(1, Math.trunc(rep / 500)));
  }
}

/** spillets nye spil: posterne og startsaldoen for alle klubber (newgame.ts, efter staben – CM-database i ægte tilstand: den originale database
 *  og 2026/27 med world-cm.json's club.dat-økonomi; startsaldoen i £ omregnes med klubbens faktor) */
/** saldoen i £ ved spilstarten, som cmFinanceNewGame sætter den (0x5961d0, samme talrække) – til 0x4c0720 (League::set_predicted_positions
 *  0x68a850), der i originalen kører med økonomien oprettet, men hos os før cmFinanceNewGame (bestyrelsen 0x68f130 læser forudsigelsen) */
export function cmStartBalanceGbp(g: GameState, world: CMWorld, seed: number, c: Club): number {
  const cf = clubFinOf(world);
  if (!cmLogic(g) || g.draft || !world.cmRaw?.fin || !cf) return Math.round(c.balance * gbp(g, c));
  const fin = cf[c.id];
  if (!fin || world.clubBalance?.[c.id] !== undefined) return Math.round(c.balance * gbp(g, c));
  return initForClub(g, c, fin[0] ?? 0, cmRand(seed, c.id, 0x5961d0)).bal;
}

export function cmFinanceNewGame(g: GameState, world: CMWorld, seed: number): void {
  const cf = clubFinOf(world);
  if (!cmLogic(g) || g.draft || !world.cmRaw?.fin || !cf) return;
  const raw = world.cmRaw;
  g.cmFinRaw = Object.fromEntries(Object.entries(raw.fin!).map(([k, v]) => [k, v.slice()]));
  g.cmNation85 = (raw.nation85 ?? []).slice();
  g.cmLowerDiv = raw.lowerDiv ?? -1;
  g.cmFin = {};
  // formændene: den manglende del af ikke-spillerposten som originalens spilstart (sub_535a80 – cmStaffInit.ts), puljen = world-filens stab
  const pool: NpTemplate[] = (world.staff ?? []).filter((r) => r[11]).map((r) => npTemplate(npFromWorld(r[7], r[11]!, r[10]?.[7] ?? 0)));
  // (hastighed, 25/11) klubbernes første manager i stabens rækkefølge én gang (supporterInit søgte i hele staben pr. klub; staben ændres ikke i løkken)
  const mgrs = new Map<number, Staff>();
  for (const s of Object.values(g.staff)) if (s.role === 'manager' && !mgrs.has(s.club)) mgrs.set(s.club, s);
  for (const c of Object.values(g.clubs)) {
    const fin = cf[c.id];
    const rand = cmRand(seed, c.id, 0x5961d0);
    const { bal, status } = initForClub(g, c, fin?.[0] ?? 0, rand);
    let chair: CmFinRec['chair'] = null;
    const ch = raw.chair?.[c.id];
    if (ch) {
      const np = npFromWorld(ch[0], [ch[1], ...ch.slice(2, 23), ch[23]], ch[24]);
      // slutløkken 0x538a70 (de 8 interne + 0x539490) som for al stab – rører ikke de rå bytes nedenfor (+0x0f/+0x16/+0x1d/+0x20)
      if (pool.length) staffConvert(np, staffInitRecord({ np, job: ch[23], nation: g.nations[ch[25]]?.name ?? null, clubRep: repOf(g, c), name: '', hasPlayer: false }, pool, cmRand(seed, c.id, 0x537d59)));
      // Ambition +0x57 og Loyalty +0x59 som sub_535a80 udfylder dem, når databasen har 0 (samme talrække som cmBoardGame.ts' formand)
      chair = [np.a[0x0f - 0x0e], np.a[0x20 - 0x0e], personalFill_535a80(ch[26], cmRand(seed, c.id, 0x535f04), 'avg'), personalFill_535a80(ch[27], cmRand(seed, c.id, 0x535f8f), 'min')];
      // (24/11) Interference +0x16 og Patience +0x1d fra den SAMME udfyldte post (cmBoardInit satte databasens rå værdier – 0 hos ~3/4 af
      // formændene; oraklet 14/7-01 har dem alle i 1..20). rand(0) = 0 gjorde overtagelsens port 0x59ea41 rand(np+0x16) ≠ 0 → afvis virkningsløs.
      // cmBoardInit (før os i createGame) bruger dem ikke ved spilstarten (initRecords 0x68f130).
      const cc = g.cmChair?.[c.id];
      // hele den udfyldte post (+0x0e..+0x22) til 0x69d1b0's forenelighed med formanden (ev = club +0xbf med np)
      if (cc && pool.length) { cc[0] = np.a[0x16 - 0x0e]; cc[1] = np.a[0x1d - 0x0e]; cc[4] = np.a.slice(0, 21); }
    }
    // 0x5965a2: +0x166 efter velstanden (ejer stadion: 5 rig / 15 gæld, ellers 10)
    const band = wealthBand(bal, repOf(g, c));
    const s166 = b6d(c) && band !== 0 ? (band > 0 && band <= 2 ? 5 : 15) : 10;
    g.cmFin[c.id] = { wb: 0, top: 0, st: 0, share: f32(0.1), wk: 3, s165: 0, s166, status, chair, tm: blank(), lm: blank(), ty: blank(), ly: blank() };
    if (!fin) continue;
    if (world.clubBalance?.[c.id] === undefined) c.balance = bal / gbp(g, c);
    supporterInit(g, c, cmRand(seed, c.id, 0x68f130), mgrs);
  }
}
/** ugens lønsum ved start: create_game's refresh_all_wage_bills 0x59cf50 (0x829852 – efter kontrakterne 0x4c7560, før forkørslen; newgame.ts)
 *  (alle klubber på én gang: udlejede spillere og staben slås op pr. klub – samme rækkefølge som i updateWageBill) */
export function cmFinanceWageBills(g: GameState): void {
  if (!g.cmFin) return;
  const idx = wageIdx(g);
  for (const c of Object.values(g.clubs)) { const r = g.cmFin[c.id]; if (r) updateWageBill(g, c, r, idx); }
}
/** udlejede spillere (efter moderklub) og staben (efter klub) i Object.values-rækkefølgen – ét gennemløb i stedet for ét pr. klub */
export function wageIdx(g: GameState): WageIdx {
  const idx: WageIdx = { loanOut: new Map(), staff: new Map() };
  for (const p of Object.values(g.players)) if (p.loan?.from !== undefined && p.contract) { const a = idx.loanOut.get(p.loan.from) ?? []; a.push(p); idx.loanOut.set(p.loan.from, a); }
  for (const s of Object.values(g.staff)) { const a = idx.staff.get(s.club) ?? []; a.push(s); idx.staff.set(s.club, a); }
  return idx;
}

// ------------------------------------------------------------------------------------------------ tilhængernes tillid (MANAGER_MANAGER +8)

/** init_club_board_records 0x68f130 (0x68f2a1–0x68f63e): tilhængernes tillid ved start (0..10000). Managerens omdømme = ikke-spillerposten
 *  +0xa (spillets Staff.rep · 2); menneskets klub: 4500 (0x68f3da – spillets menneske har ingen post, *afvigelse*) */
export function supporterInit(g: GameState, c: Club, rand: (n: number) => number, mgrs?: Map<number, Staff>): void {
  const rep = repOf(g, c);
  const mgr = mgrs ? mgrs.get(c.id) : Object.values(g.staff).find((s) => s.club === c.id && s.role === 'manager');
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
export type WageIdx = { loanOut: Map<number, Player[]>; staff: Map<number, Staff[]> };
export function updateWageBill(g: GameState, c: Club, r: CmFinRec, idx?: WageIdx): void {
  let wb = 0, top = 0, n = 0;
  const k0 = gbp(g, c);
  // kontrakterne i CONTRACT_MANAGER (+0): kun personerne i hukommelsen – i et ikke-indlæst land er resten af truppen ikke med i originalen
  const all = nationLoaded(g, c.nation);
  // kontrakterne er klubbens: en spiller flyttet mellem moderklub og B-hold (0x4cbd20) har stadig kontrakten hos den gamle klub (cmBTeam.ts)
  const link = linkedClub(g, c.id);
  const mine = squad(c.id).filter((p) => p.cmCon === undefined || p.cmCon === c.id);
  if (link) for (const p of squad(link.other)) if (p.cmCon === c.id) mine.push(p);
  for (const p of mine) {
    if (!p.contract || (!all && !inMemory(g, c, p))) continue;
    n++;
    // 0x5983fa: lejekontrakten trækkes fra (spillets model: lejeklubben betaler andelen `share`)
    const w = Math.round(p.contract.wage * (p.loan ? p.loan.share ?? 1 : 1) * k0);
    if (w > top) top = w;
    wb += w;
  }
  // udlejede spillere: moderklubben betaler resten (spillets lejemodel)
  for (const p of idx ? idx.loanOut.get(c.id) ?? [] : Object.values(g.players)) if (p.loan?.from === c.id && p.contract && (all || inMemory(g, c, p))) wb += Math.round(p.contract.wage * (1 - (p.loan.share ?? 1)) * k0);
  // stabens kontrakter (+0x19f/+0x1b3/+0x1cf): kun personerne i hukommelsen (Staff.cmMem – databasens, som 0x524d70 beholder, og 0x527240's
  // genererede) – også i de indlæste lande: spillets egen stab uden for hukommelsen (manager/assistent uden databasens, Englands klubber med
  // omdømme ≤ 500, størrelse 2's fravalgte) findes ikke i originalen og har ingen kontrakt dér. Før talte de med i et indlæst land: oraklet
  // 1/9-01 har 578 stabspersoner i Englands non-league (371 med kontrakt, £104.725/uge), vi 945 (760 med løn, £235.025/uge) – lønsummen
  // trak saldoen og transferbudgettet 0x598800 ned (pladsernes +7 i NPL ∅ 1.836 mod 44.331 29/12-02)
  for (const s of idx ? idx.staff.get(c.id) ?? [] : Object.values(g.staff)) {
    if (s.club !== c.id || !s.wage || (g.cmStaffMem && !s.cmMem)) continue;
    const w = Math.round(s.wage * k0);
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
  // (ydelse 14/11) søndagens lønsummer: udlejede spillere og staben slås op i ét indeks (før Object.values(g.players) for HVER klub –
  // ~3,5 s pr. søndag med fem lande); dagens trin herunder flytter hverken spillere, lejeaftaler eller stab, så summerne er de samme
  let idx: WageIdx | undefined;
  for (const c of Object.values(g.clubs)) {
    const r = g.cmFin![c.id];
    if (!r) continue;
    const rand = cmRand(g.seed ?? 0, c.id, dn, 0x59b9c0);
    if (active(g, c)) {
      if (sunday) {
        updateWageBill(g, c, r, idx ??= wageIdx(g));
        book(g, c, K.wages, r.wb);
        weeklyMerch(g, c, rand);
        const { days, past } = daysToSeasonStart(g, c);
        if (days) sellSeasonTickets(g, c, r, past, rand);
        else { r.st = 0; r.wk = 0; }
      }
    } else clampInactive(g, c, r, rand);
    if (monthEnd && active(g, c)) monthEndClub(g, c, r, rand);
    else if (!monthEnd && active(g, c) && (r.s165 === 1 || r.s165 === 2)) {
      // 0x59ccc0: klubber i krise – process_club_finance_events 0x59ed70 dagligt med flaget rand(max(10, (11000 − omdømme)/250)) = 0
      cmFinEvents(g, c, r, rand(Math.max(10, idiv(11000 - repOf(g, c), 250))) === 0, rand);
    }
    if (monthEnd) { r.lm = r.tm; r.tm = blank(); }
  }
  // dagen før sæsonopdateringen (0x5d5ae0 0x5d5e21: i morgen 0x54c5b0(1) = nøglelandstabellens +0x15 → end_season_for_nation 0x59cdd0):
  // sæsonens poster → sidste sæson, udbyttet. (Før 18/11 på selve dagen – efter sæsonskiftet, så create_table's tv-penge 0x683010 blev
  // flyttet til sidste sæson.)
  const tomorrow = addDays(date, 1).slice(5);
  for (const c of Object.values(g.clubs)) {
    const r = g.cmFin![c.id];
    if (r && active(g, c) && tomorrow === seasonUpdateDay(g, c)) seasonEndClub(g, c, r, cmRand(g.seed ?? 0, c.id, dn, 0x59cfa0));
  }
}

/** 0x59bfef: klubber uden for de indlæste ligaer – saldoen holdes inden for grænser efter status */
function clampInactive(g: GameState, c: Club, r: CmFinRec, rand: (n: number) => number): void {
  let b = balGbp(g, c);
  const st = r.status;
  if (st === 3) { if (b < -10000) b = -10000; else if (b > 2500) b = 2500; }
  else if (st === 2) {
    const big = repOf(g, c) > 2500;
    const lim = big ? 250000 : 25000;
    if (b < -lim) b = -lim; else if (b > lim) b = lim;
  } else if (b < -2_250_000) b = rand(5) === 0 ? 175000 : -2_250_000;
  else if (b > 2_250_000) b = rand(5) === 0 ? -175000 : 2_250_000;
  else return;
  c.balance = b / gbp(g, c);
}

/** månedens slutning (0x59c17d–0x59cc78) for én klub */
function monthEndClub(g: GameState, c: Club, r: CmFinRec, rand: (n: number) => number): void {
  const rep = repOf(g, c);
  // 0x59c212: dyb gæld → nyhed og spillere vil sælges (Media 0x74ae60, STAFF_CONTRACT 0x867700) – ikke porteret; tallene trækkes
  if (wealthBand(balGbp(g, c), rep) === -2) { rand(rep); rand(20000); }
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
  if (!hasTable(g, c)) book(g, c, K.gate, ftol(rep * avgOf(g, c) * 0.005));
  // 0x59c516: renter
  const bal = balGbp(g, c);
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
  // 0x59cbfd: process_club_finance_events(club, 1) – cmFinEvents.ts
  cmFinEvents(g, c, r, true, rand);
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
  // kampe i et ikke-indlæst lands liga/pokal (og venskabskampe mellem to af dets klubber) findes ikke i originalen – intet bogføres
  const comp = g.comps[f.comp];
  if (comp ? comp.nation >= 0 && !nationLoaded(g, comp.nation) : !nationLoaded(g, H.nation) && !nationLoaded(g, A.nation)) return gate;
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
  // et ikke-indlæst lands liga har ingen tabel i originalen – ingen præmie (heller ikke spillets egen)
  const comp = g.comps[compId];
  if (comp && comp.nation >= 0 && !nationLoaded(g, comp.nation)) return true;
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
  const comp = g.comps[compId];
  if (comp && comp.nation >= 0 && !nationLoaded(g, comp.nation)) return;
  const year = typeof comp?.meta?.cmYear === 'number' ? comp.meta.cmYear : g.season;
  for (const cid of clubs) {
    const c = g.clubs[cid];
    if (!c) continue;
    if (lm.tv) tvRights(g, c, compId, lm.tv, year);
    else if (lm.tvBy) {
      // club +0x5b = sidste sæsons division (spillets lgHistory: ligaen ved sidste sæsonafslutning)
      const last = lastDivOf(g, c);
      for (const [div, amt] of lm.tvBy) if (last === div) tvRights(g, c, compId, amt, year);
    }
  }
}
/** nøglelandstabellens +0x17 = 0 (key_nation_build_table 0x667150: 8 rækker – landene, hvis sæson følger kalenderåret): årstallet 0x669630 "%d" */
const CALENDAR_YEAR = new Set(['Finland', 'Russia', 'Sweden', 'Norway', 'Japan', 'South Korea', 'United States', 'Brazil']);
/** 0x683010's ene klub: Finance 0x5987c0 (+0x158 denne måned, +0xb8 sæsonen, saldoen) og nyheden 0x48ea40 – type 0x1f [klub, turnering, beløb,
 *  turneringens år +0x40], kun når et menneske styrer klubben (0x7875e0 → 0x7861e0). Teksten 0x48eb00: "{club} given {cash}" / "{club} have
 *  received {cash} for {comp} TV rights for the {år} season." – året 0x669630 (klubbens nøglelandsrække: "2002/03", kalenderårslande "2002"). */
function tvRights(g: GameState, c: Club, compId: string, amount: number, year: number): void {
  book(g, c, K.tv, amount);
  if (!isHumanClub(c.id)) return;
  const season = CALENDAR_YEAR.has(nationName(g, c.nation)) ? String(year) : `${year}/${String((year + 1) % 100).padStart(2, '0')}`;
  asOwner(c.id, () => addNews({ cat: 'finance', key: 'cmfe.h.tv', params: { club: c.name, amt: amount / gbp(g, c), comp: compId, season, body: 'tv' }, link: { kind: 'club', id: c.id } }));
}
/** club +0x5b (sidste sæsons division): klubbens liga lige før sæsonskiftet (cmBeforeRollover) */
let lastDiv = new Map<number, number>();
// carry.ts: club +0x5b er spiltilstand – følger med en kopi/et gemt spil (og lækker ikke til næste spil)
registerCarry('cmFinance.lastDiv', () => (lastDiv.size ? [...lastDiv] : NO_CARRY), (v: [number, number][]) => { lastDiv = new Map(v); }, () => { lastDiv = new Map(); });
export function cmBeforeRollover(g: GameState, inScope: (cid: number) => boolean = () => true): void {
  // (16/11) sæsonskiftet pr. land (cmSeason.ts): kun skiftets klubber – de andre landes klubber har stadig sidste sæsons division
  for (const c of Object.values(g.clubs)) if (inScope(c.id)) lastDiv.set(c.id, /^CM(\d+)$/.test(c.league) ? +c.league.slice(2) : -1);
}
function lastDivOf(_g: GameState, c: Club): number { return lastDiv.get(c.id) ?? -1; }
/** ligaen har originalens præmie (spillets egen præmie springes over) */
export const hasLeagueMoney = (compId: string) => { const m = /^CM(\d+)$/.exec(compId); return !!m && LEAGUE_MONEY[+m[1]] !== undefined; };

compHooks.leagueDone = (comp, order) => { const g = gs(); if (cmFinOn(g)) cmLeaguePrize(g, comp.id, order); };

// ------------------------------------------------------------------------------------------------ pokalerne: rundens præmie

/** Cup::pay_round_prize_money 0x522240(vinder, taber, runde = fixture +0x34, fixture): rundepostens +0x60/+0x64 (w, l); −1 → puljen cup +0x28 /
 *  (antal runder +0x3c − runden) / rundens kampe +0x1a, og er taberens også −1: vinderen 3/4, taberen 1/4 (idiv mod nul, 0x5222ae); ellers vinderen
 *  hele andelen og taberen sin faste præmie. Begge beløb bogføres i Prize (0x5999a0: +0xa8/+0x148, saldoen) og trækkes fra puljen (som aldrig
 *  fyldes op igen – konstruktøren sætter den i spilstarten 0x830520). Vinderens beløb ≠ 0 → nyheden 0x48e3e0 (cmPrizeNews). Giver vinderens beløb. */
export function cmRoundPrize(g: GameState, key: string, fund0: number, w: number, l: number, nRounds: number, round: number, ties: number, winner: Club, loser: Club | undefined): number {
  const fund = (g.cmCupFund ??= {});
  fund[key] ??= fund0;
  if (w === -1) {
    const pot = idiv(idiv(fund[key], nRounds - round), ties);
    if (l === -1) { w = idiv(pot * 3, 4); l = idiv(pot, 4); } else w = pot;
  }
  if (w) { book(g, winner, K.prize, w); fund[key] -= w; }
  if (l && loser) { book(g, loser, K.prize, l); fund[key] -= l; }
  return w;
}
/** 0x522240's nyhed (0x52230b, før bogføringen): Cup 0x48e3e0(vinderen, beløbet, −1, næste runde, kampen, art) – kun når et menneske styrer klubben
 *  (0x7875e0) og beløbet ≥ omdømme (+0x80)·50; NewsItem 0x1a [turnering, beløb, klub, placering −1, næste runde, modstander, sejr, art] til
 *  klubbens manager (0x7861e0). Næste runde = rundepostens +0x6f (næste rundes id +0x07), når runden + 1 < antal runder (+0x3c) og id'et ≠ 0x8c
 *  (bronzekampen), ellers 0. Art = holdpostens +5 (cup +0xa7): finalevejen 0x51af0f/0x51b27f (sidste runde – eller næstsidste, når den sidste er
 *  bronzekampen 0x8c) giver vinderen 1 (bronzekampen 3), en almindelig runde 0xff (0x51b5cd); kampens +0x30 = 0x136 og art 1 → 3.
 *  Teksten 0x48e590: næste runde ≠ 0 → 0x99bb78 "… for qualifying for the {0x4bfa30(turneringen, 0, runden, 1)}", art 1 → 0x99bad8 "winning the",
 *  art 2 → 0x99ba2c "runners-up", ellers modstanderen (0x99b95c "win against"/0x99b88c "draw against"). Sejren: hjemmeholdets +0x3d (sat af
 *  0x51c0a1, når kampen ikke blev afgjort af stillingen efter 90 minutter: forlænget spilletid, straffe), samlet +0x4b > +0x4c, eller +0x43 >
 *  +0x44 efter 90 minutter – den afgjorte kamps vinder har altid én af dem → 1 ("draw against" kun i turneringer med pointkampe, flag 0x10). */
export function cmPrizeNews(g: GameState, comp: string, f: Fixture, W: Club, L: Club | undefined, amount: number, ids: number[], round: number): void {
  if (!isHumanClub(W.id) || amount < repOf(g, W) * 50) return;
  const n = ids.length;
  const next = round + 1 < n && ids[round + 1] !== 0x8c ? ids[round + 1] : 0;
  const final = round === n - 1 || (round === n - 2 && ids[n - 1] === 0x8c);
  let kind = final ? (ids[round] === 0x8c ? 3 : 1) : -1;
  if (f.cm?.w30 === 0x136 && kind === 1) kind = 3;
  const body = next ? 'qual' : kind === 1 ? 'won' : kind === 2 ? 'runnersUp' : L ? 'win' : '';
  if (!body) return;   // modstander −1: ingen brødtekst (0x48e85a)
  const fc = g.comps[comp]?.name ?? '';
  asOwner(W.id, () => addNews({ cat: 'finance', key: 'cmprize.h', params: { club: W.short, amt: amount / gbp(g, W), fc, fr: next, opp: L?.short ?? '', body }, link: { kind: 'club', id: W.id } }));
}
/** de europæiske klasser (euro.py/gen_euro.py): puljen +0x28 fra konstruktøren (kun UefaCup 0x9023c6: 3.000.000; EuropeanCup, EurSuperCup og
 *  IntertotoCup sætter den ikke) og spillets trin → rundetabellen (CL: kvalifikationen stage −1, slutspillet stage 12 – samme objekt) */
const EURO_FUND: Record<string, number> = { UEFA: 3_000_000 };
const euroTable = (id: string, stage: string | undefined): string | null =>
  id === 'CL' ? (/^Q\d$/.test(stage ?? '') ? 'CLQ' : stage === 'QF' || stage === 'SF' || stage === 'F' ? 'CLKO' : null) : id in EURO_TABLE_IDS ? id : null;
const EURO_TABLE_IDS: Record<string, true> = { UEFA: true, ESC: true, UIC: true };
compHooks.prize = (club, amount) => { const g = gs(), c = g.clubs[club]; if (c && cmFinOn(g)) book(g, c, K.prize, amount); };
compHooks.cupTieDone = (comp, f, winner, loser) => {
  const g = gs();
  const W = g.clubs[winner];
  if (!cmFinOn(g) || !f.cm || !W) return;
  const L = g.clubs[loser], round = f.cm.b34;
  const key = comp.meta?.cmCup, euro = comp.meta?.cmEuro;
  if (typeof key === 'string') {
    const pz = CM_CUP_PRIZES[key], tab = CM_CUP_TABLES[key];
    if (!pz || !tab) return;
    const year = typeof comp.meta?.cmYear === 'number' ? comp.meta.cmYear : g.season;
    const prize = pz.years?.[year] ?? pz.prize, rounds = tab.years?.[year] ?? tab.rounds;
    const e = prize[round], r = rounds[round];
    if (!e || !r) return;
    // +0x1a: rundens kampe (Liga Cup'en: efter antallet i Europa – byes-tabellen)
    const euros = (comp.meta?.cmEntry as Record<number, number[]> | undefined)?.[3]?.length;
    const ties = key === 'ENG_LC' && euros !== undefined ? cmLeagueCupStructure(year, euros)?.[round]?.[1] ?? r[11] : r[11];
    const won = cmRoundPrize(g, key, pz.fund, e[0], e[1], rounds.length, round, ties, W, L);
    if (won) cmPrizeNews(g, comp.id, f, W, L, won, rounds.map((x) => x[2]), round);
  } else if (typeof euro === 'string') {
    const tk = euroTable(euro, f.stage);
    const rows = tk ? CM_EURO_ROUNDS[tk] : undefined, r = rows?.[round];
    // slot, id, idx, b0b, f0d, f0f, f11, venue, b17, teams, ties, new, first, replays, legs, gap, pay, prizeW, prizeL
    if (!rows || !r) return;
    const won = cmRoundPrize(g, euro, EURO_FUND[euro] ?? 0, r[17], r[18], rows.length, round, r[10], W, L);
    if (won) cmPrizeNews(g, comp.id, f, W, L, won, rows.map((x) => x[1]), round);
  }
};

// ------------------------------------------------------------------------------------------------ sæsonens slutning

/** nøglelandstabellens +0x15 (key_nation_build_table 0x667150): sæsonopdateringens dag – 20/6 i de europæiske lande;
 *  Finland, Rusland, Sverige 27/12, Norge 27/11, Japan 25/1, Sydkorea 20/1, USA 20/2, Argentina/Australien 31/7 (cmSeason.ts) */
function seasonUpdateDay(g: GameState, c: Club): string {
  return cmUpdateDay(g, c.nation);
}

/** end_season_for_nation 0x59cdd0 for én klub: season_end_club_update (udbyttet) og sæsonens blok → sidste sæson */
function seasonEndClub(g: GameState, c: Club, r: CmFinRec, rand: (n: number) => number): void {
  const rep = repOf(g, c), bal = balGbp(g, c);
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
    c.lastDividend = Math.round(D / gbp(g, c));
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
