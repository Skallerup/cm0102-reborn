// Computerklubbernes nye kontrakter som originalen (en CM-database i ægte tilstand – cmLogic: den originale og 2026/27, beløbene via cmMoney.ts): CONTRACT_MANAGER::offer_contract
// 0x4cda70 (cmContract.ts, faktor 1,0, ud-kontrakt) → STAFF_CONTRACT::set_to_desired_contract 0x85fc50 (cmContractWant.ts) på originalens
// poster bygget af spiltilstanden (cmWageGame.ts buildWageMem + felterne nedenfor). De kaldte funktioner kører uændret: Shortlist_Manager
// 0x846920/0x849f00, 0x8cca10, 0x4d45f0, 0x669360, 0x7c6830 … er mekanisk oversat (cmGen/, kontrolleret på oraklets dage og i unicorn), 0x864550/
// 0x862720 (cmWage.ts), 0x5968d0 (cmMaxWage.ts), 0x540a50/0x669bd0 (cmClubLinks.ts). Værdien 0x4d0c60 = originalValue.ts formulaValueGbp på
// spillets data (samme formel som spilstartens værdier), 0x4b02e0 = cmBoardInterest.ts leagueClash, 0x4a4850 = tabelrækken (cmBoardGame.ts).
//
// Kontrol (scripts/cm-want-check.ts / cm-want-game.ts): på originalens hukommelse 14/7-2001 giver porten originalens svar for alle 17 kald,
// 0x4c7ac0 laver den dag; på spillets data mod originalens hukommelse for de samme engelske spillere – se ENGINE_PORT_PLAN.md "Ønskekontrakten".
//
// Felterne ud over buildWageMem (*estimeret* hvor spillet ikke har dem):
//   person: +0x10 fødselsdatoen (Date), +0x1e andet land, +0x46 kontraktens udløb (databasens felt – her den nuværende kontrakts), +0x5b
//     Professionalism, +0x65 præferenceposten (Player.cmRel: klubber → klubposten, personer → personposten for spillere i de byggede klubber,
//     ellers en adresse uden post), spillerposten +0x16..+0x45 (aiTeam.ts playerRecord: egenskaberne, interne værdier, fødder, moral).
//   kontrakten: +0x10/+0x14/+0x18 bonusserne (cmBonusGbp), +0x1c..+0x21 klausulerne, +0x25 start (ankomsten), +0x2d udløbet, +0x35 type 2
//     (almindelig) + deltid, +0x3d/+0x3e/+0x3f/+0x44/+0x4e (Player.cmContract).
//   klub: +0x73 tilskuertallet og +0xb3/+0xb7/+0xbb rivalerne (GameState.cmCrowd), +0x1db den europæiske turnering (cmEuroMem.ts).
//   land: +0x71 verdensdelen, +0x77 sproget (grid/nationLanguage.ts), +0x8e (WorldData.valueClub [1]).
//   turneringsobjekterne [0xadadfc][division]: +0x43 = 2 (liga), vtabellens +0x98/+0x9c (0x684790/0x6847b0: +0xbe/+0xd9 op-, +0xc1 nedrykning
//     efter spillets regler som cmContractInit.ts leagueOf), +8 tabellen (0x4a4850).
//   sæsontabellen 0xb63d60 (35 × 0x48): originalens rækker (verdensdelene 0–7, nøglelandene 8–34 – +0x17 sæsonen krydser nytår, +0x2a start,
//     +0x39 slut; aflæst i øjebliksbilledet pre-194-2001.bin).
//   [0xa83608] = 10 (største antal år). Transferlisterne i TRANSFER_MANAGER, forhandlingslisterne og skadeposten [0xb63d28] er tomme (0).
// rand: 0x85fc50 trækker rand(0x1c) (dagen i udløbsmåneden) – af spillets frø, personen og datoen (cmRand – rører ikke spillets rng).
import type { Club, Contract, ContractClauses, GameState, Player } from './types';
import { type CmCtx, G, type SparseMem, writeMonthTables } from './cmMem';
import { buildWageMem, cmMemCall, memScope, nationsByName, type WageMem } from './cmWageGame';
import { writeEuroMem } from './cmEuroMem';
import { setToDesiredContract_85fc50, constructContract_85e410, calcContractValue_866830, contractForClub_4cf5f0, contractSatisfaction_866620 } from './cmContractWant';
import { offerContract_4cda70 } from './cmContract';
import { getClubFinance_5a0590, defaultStaffContract_864550 } from './cmWage';
import { maxStaffWage_597db0 } from './cmMaxWage';
import { genCtx } from './cmGen/impls';
import { slCall, slmOf } from './cmShortlist';
import { cmLogic, cmRand, cmStaffOn } from './cmPlayerData';
import type { SquadStatus } from './squadStatus';
import { leagueOf } from './cmContractInit';
import { formulaValueGbp } from './originalValue';
import { playerRecordInto } from './engine/grid/aiTeam';
const REC_SCRATCH: number[] = new Array(0x46).fill(0);
import { nationLanguage } from './engine/grid/nationLanguage';
import { regionOf } from './leagues';
import { ATTRS } from './attributes';
import { ageOn, daysBetween } from './dates';
import { squadIds } from './state';
import { boardEnv, memStaffPerson, staffJobInterest } from './cmBoardGame';
import { leagueClash } from './cmBoardInterest';
import type { BoardEnv } from './cmBoard';
import { registerStaffContractAnswer, registerStaffOfferCheck } from './cmStaff';

/** € → £: 0,86 for den originale database, 2026/27's faktor pr. liga (cmMoney.ts) – beløbene tilhører den købende/tilbydende klub */
import { cmGbp } from './cmMoney';
import { cmNationLoaded, writeBudgetInputs } from './cmSlMem';
const VALUE_FORMULA = typeof process !== 'undefined' && process.env?.CM_VALUE === 'formula';
const MMOBJ = 0x2bff0000, MMREC = 0x2b000000, EURO0 = 0x2c000000, STAD0 = 0x2d000000, CITY0 = 0x2c800000, COMP0 = 0x3e000000, VT = 0x3dff0000, CONT0 = 0x3dfe0000, PREF0 = 0x2f000000, STATS0 = 0x3e800000, ROW4A = 0x3dfd0000, NOBODY = 0x2e000000;
/** de skrabeområder, kontrakterne skrives i (under cmContractWant.ts' SCR 0x300000 og cmContract.ts' stak 0x2ff000) */
const OUT = 0x002f0000, LOCAL = 0x002f0100;

/** sæsontabellen 0xb63d60 i originalen 14/7-2001 (frø 1, England spilbart): [landet (nation.dat-navnet; '' = verdensdelens række 0–7),
 *  bytes +0x17..+0x47]: +0x17 sæsonen krydser nytår, +0x1b år, +0x2a start (Date + udvidelsen +8 dag i måneden, +0xa måned, +0xb år,
 *  +0xd ugedag) og +0x39 slut (kun hovedlandet har udvidelsen – 0x4d45f0's måned). Pegerne +0x1e..+0x29 nulstilles. */
const SEASON_ROWS: [string, string][] = [
  ['', '01000000cc0702000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10702000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701f4b15c720000000000000000ad00d10700000000170005d107ffff8a00d10700000000140004d1070500'],
  ['', '01000000d107010fb95c720000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701f0415c720000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['Argentina', '01000000000000000000000000000000000000dc00d1070000000000000000000000c700d1070000000000000000000000'],
  ['Australia', '010000000000000000000000000000000000001201d1070000000000000000000000a000d1070000000000000000000000'],
  ['Belgium', '0100000000000076b45c720000000000000000d700d10700000000000000000000009700d1070000000000000000000000'],
  ['Brazil', '000000000000001e465c7200000000000000001100d20700000000000000000000005b01d2070000000000000000000000'],
  ['Croatia', '01000000000000a1645c720000000000000000c900d10700000000000000000000009300d1070000000000000000000000'],
  ['Denmark', '010000000000004cb55c720000000000000000d100d1070000000000000000000000a400d1070000000000000000000000'],
  ['England', '01000000d1070167bc5c72d2bc5c723dbd5c72de00d107000000000a0007d10705009000d20700000000180004d2070500'],
  ['Finland', '00000000000000ed585c7200000000000000007400d20700000000000000000000003b01d2070000000000000000000000'],
  ['France', '01000000000000b7b55c7222b65c7200000000de00d10700000000000000000000008f00d1070000000000000000000000'],
  ['Germany', '010000000000008db65c720000000000000000d000d10700000000000000000000009100d1070000000000000000000000'],
  ['Greece', '010000000000000c655c720000000000000000e500d10700000000000000000000008c00d1070000000000000000000000'],
  ['Holland', '01000000000000f8b65c720000000000000000e500d10700000000000000000000009d00d1070000000000000000000000'],
  ['Republic of Ireland', '01000000000000b05c5c720000000000000000d100d10700000000000000000000008b00d1070000000000000000000000'],
  ['Italy', '0100000000000063b75c720000000000000000ed00d10700000000000000000000009e00d1070000000000000000000000'],
  ['Japan', '000000000000000000000000000000000000004300d20700000000000000000000004b01d1070000000000000000000000'],
  ['Northern Ireland', '01000000000000516b5c720000000000000000de00d10700000000000000000000007f00d1070000000000000000000000'],
  ['Norway', '00000000000000e5b95c7200000000000000006700d20700000000000000000000002f01d2070000000000000000000000'],
  ['Poland', '01000000000000f5625c720000000000000000c200d10700000000000000000000009b00d1070000000000000000000000'],
  ['Portugal', '01000000000000bbba5c720000000000000000ed00d10700000000000000000000009e00d1070000000000000000000000'],
  ['Russia', '000000000000001c795c7200000000000000005100d20700000000000000000000003901d2070000000000000000000000'],
  ['Scotland', '0100000000000013be5c720000000000000000d700d10700000000000000000000008f00d1070000000000000000000000'],
  ['South Korea', '00000000000000d4895c7200000000000000005200d20700000000000000000000004801d2070000000000000000000000'],
  ['Spain', '0100000000000026bb5c720000000000000000f400d1070000000000000000000000a400d1070000000000000000000000'],
  ['Sweden', '00000000000000fcbb5c7200000000000000006000d20700000000000000000000002a01d2070000000000000000000000'],
  ['Turkey', '0100000000000001725c720000000000000000d800d10700000000000000000000008c00d1070000000000000000000000'],
  ['United States', '000000000000000000000000000000000000005100d20700000000000000000000000500d2070000000000000000000000'],
  ['Wales', '0100000000000046785c720000000000000000e500d10700000000000000000000007d00d1070000000000000000000000'],
];
/** SEASON_ROWS' bytes (hex læst én gang) */
const SEASON_BYTES: Uint8Array[] = SEASON_ROWS.map(([, hex]) => { const b = new Uint8Array(hex.length >> 1); for (let i = 0; i + 1 < hex.length; i += 2) b[i / 2] = parseInt(hex.slice(i, i + 2), 16); return b; });
/** verdensdelenes rækker 3–7: Europa, Nordamerika, Sydamerika, Asien, Oceanien (rækkerne 0–2 har ingen verdensdel) */
const OCEANIA = new Set(['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa', 'American Samoa', 'Tonga', 'Vanuatu', 'Tahiti', 'Solomon Islands', 'New Caledonia', 'Cook Islands']);

/** (gemt pr. streng – ren funktion; kaldes for alle spillere hver dag) */
const ISO_MEMO = new Map<string, [number, number]>();
const isoDay = (iso: string): [number, number] => {
  let r = ISO_MEMO.get(iso);
  if (!r) {
    const y = +iso.slice(0, 4);
    r = [Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000), y];
    if (ISO_MEMO.size > 200000) ISO_MEMO.clear();
    ISO_MEMO.set(iso, r);
  }
  return [r[0], r[1]];
};
const leap = (y: number) => (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 1 : 0);
const dayIso = (day: number, year: number) => new Date(Date.UTC(year, 0, 1) + day * 86400000).toISOString().slice(0, 10);
const ATTR_IX = new Map<string, number>(ATTRS.map((k, i) => [k, i]));
const attr = (p: Player, k: string) => Math.round(p.attrs[ATTR_IX.get(k) ?? -1] || 10);

/** originalens vilkår i spillets enheder */
export interface CmTerms {
  /** ugeløn i € */
  wage: number;
  expires: string;
  /** Signing On Fee i € (kontrakt +8) */
  signOn: number;
  /** +0x10/+0x14/+0x18 i £ (−1 = ingen) */
  bonusGbp: [number, number, number];
  clauses: number[];
  /** +0x21 i € */
  clauseFee: number;
  partTime: boolean;
  /** 0x4cda70 gav et tilbud (ellers spillerens krav 0x85fc50 – klubben ville ikke have budt, *estimeret*) */
  offered: boolean;
  /** de rå tal (£) – til kontrollen */
  raw: { wage: number; value: number };
  /** € → £-faktoren, beløbene er omregnet med (cmMoney.ts – køberens) */
  gbp: number;
}

/** fejlsøgning (scripts/cm-want-diff.ts): kaldene ud af portene (adresse, svar) */
export const WANT_DEBUG: { f?: (adr: number, v: number, a: number[]) => void } = {};

/** Hukommelsen for en handel: de byggede klubber + felterne ud over lønportene */
export interface WantMem { W: WageMem; c: CmCtx; g: GameState; env: () => BoardEnv; setRand(f: (n: number) => number): void; byStaff: Map<number, Player> }

/** Bygger posterne for klubberne (spillernes nuværende og købende klubber) */
export function buildWantMem(g: GameState, clubs: Iterable<number>, opts: { full?: boolean; call?: (adr: number, a: number[]) => number | undefined; useLog?: (adr: number) => boolean } = {}): WantMem {
  const W = buildWageMem(g, clubs, new Set(), false, !!opts.full);
  const m = W.c.m;
  m.w8(0xa83608, 10);
  // månedstabellerne 0x9b8448 (almindeligt år) og 0x9b8460 (skudår): dagen i året, måneden begynder (s16) – 0x54cfb0, 0x85fc50
  writeMonthTables(m);
  // verdensdelene og sæsontabellen
  const contOf = (name: string | undefined) => {
    if (!name) return 0;
    if (OCEANIA.has(name)) return CONT0 + 0x100 * 4;
    const r = regionOf(name);
    return r === 'europe' ? CONT0 : r === 'northAmerica' ? CONT0 + 0x100 : r === 'southAmerica' ? CONT0 + 0x200 : r === 'asia' ? CONT0 + 0x300 : CONT0 + 0x500;
  };
  // verdensdelenes id'er (+0) som originalens [0x9cfa08..0x9cfa1c]: Europa 2, Nordamerika 3, Sydamerika 5, Asien 1, Oceanien 4, Afrika 0
  [2, 3, 5, 1, 4, 0].forEach((id, k) => m.w32(CONT0 + 0x100 * k, id));
  const [tday, tyear] = isoDay(g.date);
  const seasonYear = tday >= 181 ? tyear : tyear - 1;
  const byName = nationsByName(g);
  const dy = seasonYear - 2001;
  SEASON_ROWS.forEach(([nm], r) => {
    const a = 0xb63d60 + 0x48 * r, bytes = SEASON_BYTES[r];
    for (let i = 0; i < bytes.length; i++) m.w8(a + 0x17 + i, bytes[i]);
    for (let o = 0x1e; o < 0x2a; o++) m.w8(a + o, 0);
    for (const o of [0x1b, 0x2c, 0x35, 0x3b, 0x44]) { const y = m.u16(a + o); if (y) m.w16(a + o, y + dy); }
    const n = nm ? byName.get(nm) : undefined;
    m.w32(a, n === undefined ? 0 : W.natOf(n));
    m.w32(a + 4, !nm && r >= 3 ? CONT0 + 0x100 * (r - 3) : 0);
  });
  // nation +0x11c: kun de indlæste lande (2; oraklet: England 2, de andre nøglelande 0) – 0x669360 giver de andre verdensdelens række (cmSlMem.ts)
  for (let n = 0; n < g.nations.length; n++) if (cmNationLoaded(g, n)) m.w8(W.natOf(n) + 0x11c, 2);
  // landenes felter (ud over buildWageMem: +0x71 verdensdelen, +0x77 sproget, +0x8e – nation.dat (GameState.cmNationRep), ellers klubbernes vc[1])
  const msc = memScope(g);
  let nat8e = msc?.nat8e;
  if (!nat8e) {
    nat8e = new Map<number, number>();
    for (const cl of Object.values(g.clubs)) if (cl.vc && !nat8e.has(cl.nation)) nat8e.set(cl.nation, cl.vc[1]);
    if (msc) msc.nat8e = nat8e;
  }
  const natDone = new Set<number>();
  const nat = (n: number | undefined) => {
    const a = W.natOf(n);
    if (a && !natDone.has(a)) {
      natDone.add(a);
      const nm = g.nations[n!]?.name;
      m.w32(a + 0x71, contOf(nm)); m.w8(a + 0x77, nationLanguage(nm)); m.w16(a + 0x8e, g.cmNationRep?.[n!] ?? nat8e.get(n!) ?? 0);
    }
    return a;
  };
  // klubberne: tilskuertal, rivaler, europæisk turnering
  const clubIds = [...new Set(clubs)].filter((id) => g.clubs[id]);
  // de europæiske turneringer (club +0x1db, [0xae23d0], [0xadadfc][id] – cmEuroMem.ts)
  const E = writeEuroMem(m, g, COMP0);
  for (const cid of clubIds) {
    const a = W.clubOf(cid);
    if (!a) continue;
    nat(g.clubs[cid].nation);
    const cr = g.cmCrowd?.[cid];
    m.w32(a + 0x73, cr?.[0] ?? 0);
    (cr?.slice(6, 9) ?? []).forEach((r, k) => m.w32(a + 0xb3 + 4 * k, r >= 0 ? (m.u32(G.CLUBS) + 0x245 * r) >>> 0 : 0));
    m.w32(a + 0x1db, E.id(cid));
    // MANAGER_MANAGER [0xb67a44] → klubbernes bestyrelsesposter (73 bytes, cmBoard.ts BoardRec): +6/+8/+0xa vurderingerne
    const br = g.cmBoard?.rec[cid];
    if (br) { const ra = MMREC + 73 * cid; m.w16(ra + 6, br.w6); m.w16(ra + 8, br.w8); m.w16(ra + 0xa, br.wa); m.w16(ra + 0xc, br.wc); }
    // [0xae2d14] + 6·id: klubbens europæiske turnering (−1 = ingen – *estimeret*: spillets europæiske turneringer er ikke originalens poster)
    m.w32(EURO0 + 6 * cid, -1);
    // stadion +0x69 → by +0x38 → +0x33 (GameState.cmCrowd [3] stadion, [4] by; cmCity33) – som cmBoardGame.ts' city33
    if (cr && cr[3] >= 0) {
      const sa = STAD0 + 0x80 * (cid % 0x8000);
      m.w32(a + 0x69, sa);
      if (cr[4] >= 0) { const ca = CITY0 + 0x40 * (cid % 0x8000); m.w32(sa + 0x38, ca); m.w8(ca + 0x33, g.cmCity33?.[cr[4]] ?? 0); }
    }
    // 0x598800's øvrige inddata (træningsanlæg, kapacitet, sæsonblokken, +0x28 – cmSlMem.ts writeBudgetInputs)
    writeBudgetInputs(m, g, cid, a, W.finOf(cid), MMREC);
    // manageren: ikke-spillerposten +4 CA og +0x0e..+0x22 (Staff.cmNp – originalens spilstart, cmStaffInit.ts) – 0x4d0c60's bedømmelse 0x6e86d0
    const mg = g.staff[g.clubs[cid].manager ?? -1], ms = m.u32(a + 0xcf);
    if (mg && ms && m.u32(ms + 0x69)) {
      const np = m.u32(ms + 0x69);
      m.w16(np + 4, mg.ca ?? (mg.rep ?? 0) * 2); m.w16(np + 6, mg.cmPa ?? mg.ca ?? 0);
      mg.cmNp?.slice(0, 21).forEach((v, k) => m.w8(np + 0x0e + k, v));
    }
  }
  m.w32(0xdd7120, g.seed ?? 0);
  m.w32(0xae2d14, EURO0);
  if (g.cmBoard) { m.w32(0xb67a44, MMOBJ); m.w32(MMOBJ, MMREC); }
  // turneringsobjekterne [0xadadfc][division] (ligaerne)
  m.w32(0xadadfc, COMP0);
  m.w32(VT + 0x98, 0x684790); m.w32(VT + 0x9c, 0x6847b0);
  const leagueClub = new Map<number, number>();
  for (const cid of clubIds) { const lm = /^CM(\d+)$/.exec(g.clubs[cid].league ?? ''); if (lm && !leagueClub.has(+lm[1])) leagueClub.set(+lm[1], cid); }
  for (const [id] of W.divIds()) {
    const cid = leagueClub.get(id);
    if (cid === undefined) continue;
    const L = leagueOf(g, cid);
    if (!L) continue;
    const o = COMP0 + 0x10000 + 0x100 * (id % 0x8000);
    m.w32(COMP0 + 4 * id, o); m.w32(o, VT); m.w8(o + 0x43, 2); m.w32(o + 8, STATS0 + 0x100 * (id % 0x8000));
    if (L.promotion) { m.w8(o + 0xbe, 1); m.w8(o + 0xd9, 2); }
    if (L.relegation) m.w8(o + 0xc1, 1);
  }
  // personerne: datoerne, præferencerne, spillerposten og kontrakten
  const staffOfId = new Map<number, number>();
  for (const [p, st] of W.players) if (!p.regen && p.id < 1_000_000) staffOfId.set(p.id, st);
  let prefN = 0;
  for (const [p, st] of W.players) {
    if (p.dob) { const [d, y] = isoDay(p.dob); m.w16(st + 0x10, d); m.w16(st + 0x12, y); m.w32(st + 0x14, leap(y)); }
    if (p.cmNation2 !== undefined && p.cmNation2 >= 0) m.w32(st + 0x1e, nat(p.cmNation2));
    nat(p.nation);
    if (p.contract?.expires) { const [d, y] = isoDay(p.contract.expires); m.w16(st + 0x46, d); m.w16(st + 0x48, y); m.w32(st + 0x4a, leap(y)); }
    m.w8(st + 0x5b, attr(p, 'professionalism'));
    if (p.cmRel?.some((x) => x)) {
      const pr = PREF0 + 0x40 * prefN++;
      p.cmRel.forEach((x, k) => {
        if (!x) return;
        const isClub = k < 6;
        m.w32(pr + 4 + 4 * k, isClub ? (m.u32(G.CLUBS) + 0x245 * x) >>> 0 : staffOfId.get(x) ?? (NOBODY + x) >>> 0);
      });
      m.w32(st + 0x65, pr);
    }
    const rec = playerRecordInto(p, REC_SCRATCH), pr = m.u32(st + 0x61);
    m.w8(pr + 4, rec[4]);
    for (let o = 0x16; o < 0x46; o++) m.w8(pr + o, rec[o]);
    const k = W.contractOf(p);
    if (k && p.contract) {
      const b = p.contract.cmBonusGbp ?? [-1, -1, -1];
      for (let i = 0; i < 3; i++) m.w32(k + 0x10 + 4 * i, b[i]);
      (p.contract.cmClauses ?? [0, 0, 0, 0, 0]).forEach((v, i) => m.w8(k + 0x1c + i, v));
      m.w32(k + 0x21, Math.round((p.contract.cmClauseFee ?? 0) * cmGbp(g, p.loan?.from ?? p.club)));
      const j = p.contract.cmStart ?? p.joined ?? p.cmJoined;   // +0x25: kontraktens start (0x85e960/forlængelsen), ellers ankomsten
      if (j) { const [d, y] = isoDay(j); m.w16(k + 0x25, d); m.w16(k + 0x27, y); m.w32(k + 0x29, leap(y)); }
      const [d, y] = isoDay(p.contract.expires); m.w16(k + 0x2d, d); m.w16(k + 0x2f, y); m.w32(k + 0x31, leap(y));
      m.w8(k + 0x35, 2 | (p.contract.partTime ? 0x80 : 0));
      const cc = p.cmContract;
      if (cc) { m.w8(k + 0x3d, cc.b3d); m.w8(k + 0x3e, cc.b3e); m.w8(k + 0x3f, cc.b3f); m.w8(k + 0x44, cc.b44); m.w8(k + 0x4e, cc.b4e ?? 0); }
      m.w32(k + 0x4a, -1);
    }
  }
  const byStaff = new Map<number, Player>(W.players.map(([p, st]) => [st, p]));
  let env: BoardEnv | null = null;
  let rand: (n: number) => number = () => { throw new Error('cmContractGame: rand uden frø'); };
  const envOf = () => (env ??= boardEnv(g, g.date, undefined, true));
  // kald
  const base: CmCtx = {
    m,
    rand: (n) => rand(n),
    useLog: opts.useLog ?? ((adr) => adr === 0x600a50 || adr === 0x849f00 || (VALUE_FORMULA && adr === 0x4d0c60)),
    call: (adr, ...a) => {
      if (WANT_DEBUG.f) { const v = call(adr, a); WANT_DEBUG.f(adr, v, a); return v; }
      return call(adr, a);
    },
  };
  const caIdx = clubCaIdx(g);
  const call = (adr: number, a: number[]): number => {
      if (opts.call) { const v = opts.call(adr, a); if (v !== undefined) return v; }
      switch (adr) {
        case 0x849f00: {
          // Shortlist_Manager 0x849f00: trupstatussen hos klubben. Hos en ny klub har spillet ingen ønskeliste (originalens 0x83a730/0x84a020) –
          // status efter hans plads i køberens trup (*estimeret*), job 0xb
          const withThis = a.length === 4, st = a[withThis ? 1 : 0] >>> 0, club = a[withThis ? 2 : 1] >>> 0, out = withThis ? a[3] >>> 0 : 0;
          const p = byStaff.get(st), cid = m.s32(club);
          if (p && m.u32(st + 0x39) !== club && g.clubs[cid]) { if (out) m.w32(out, 0xb); return newClubStatus(g, p, cid, caIdx); }
          return withThis ? slCall(gc, adr, a[0], ...a.slice(1)) : slCall(gc, adr, slmOf(m), ...a);
        }
        case 0x846920: case 0x844780: return slCall(gc, adr, slmOf(m), ...a);
        case 0x8cca10: return slCall(gc, adr, m.u32(0xde1f54), ...a);
        case 0x5a0590: return getClubFinance_5a0590(gc, a[a.length - 1]);
        case 0x4d0c60: return valueOf(g, byStaff.get(a[0] >>> 0), m.s32(a[1]));
        case 0x4b02e0: return leagueClash(envOf(), m.s32(a[0]), m.s32(a[1]));
        case 0x4a4850: {
          // tabelrækken for klubben (sidste argument) i ligaen: +4 kampe, +0x72 placeringen, +0x73/+0x74/+0x75 fremskrivningerne
          const er = E.row(m, a, ROW4A);
          if (er !== undefined) return er;
          const e = envOf().entry(m.s32(a[a.length - 1]));   // (thiscall fra 0x846920: [this, klub])
          if (!e) return 0;
          const r = ROW4A;
          m.w8(r + 4, e.played); m.w8(r + 0x72, e.pos); m.w8(r + 0x73, e.p73); m.w8(r + 0x74, e.p74); m.w8(r + 0x75, e.p75);
          return r;
        }
        // datoerne af et transfertilbud (+0x25 overskrives altid med i dag), skadeposten, fejlboksene og statuslinjen
        case 0x8cf470: case 0x8cf0e0: case 0x8c61e0: case 0x549c90: case 0x62ed70:
        case 0x944cff: case 0x90d130: case 0x944c9f: case 0x5e8290: return 0;
      }
      return cmMemCall(gc, adr, ...a);
  };
  const gc = genCtx(base);
  return { W, c: gc, g, env: envOf, setRand: (f) => { rand = f; }, byStaff };
}

/** 0x4d0c60(staff, klub, 1, −1, 0) – originalens værdiformel på spillets data (originalValue.ts; uden klubbens felter: spillets værdi) */
function valueOf(g: GameState, p: Player | undefined, clubId: number): number {
  const club = g.clubs[clubId];
  if (!p) return 0;
  if (!club?.vc || !p.cmRep) return Math.round((p.value ?? 0) * cmGbp(g, clubId));
  return Math.trunc(formulaValueGbp({ pa: p.pa, age: ageOn(p.dob, g.date), pos: p.pos, attrs: p.attrs, rep: p.cmRep, caps: p.caps ?? 0, staffId: p.id, clubId, vc: club.vc }));
}

/** klubbernes spillere (ikke lejede) som [id, CA] – af trupindekset (state.ts squadIds, som setClub holder ved lige), bygget ved første opslag
 *  pr. klub; gælder så længe hukommelsen lever (ingen skifter imens – ønskelisternes dag udfører buddene bagefter) */
interface ClubCaIdx { of(cid: number): [number, number][] }
function clubCaIdx(g: GameState): ClubCaIdx {
  const byClub = new Map<number, [number, number][]>();
  return {
    of(cid) {
      let l = byClub.get(cid);
      if (!l) {
        l = [];
        for (const id of squadIds(cid)) { const x = g.players[id]; if (x && x.club === cid && !x.loan) l.push([x.id, x.ca]); }
        byClub.set(cid, l);
      }
      return l;
    },
  };
}

/** trupstatus 1–7 for en spiller hos en ny klub: pladsen efter CA i køberens trup (1 Key de 2 bedste, 2 First Team til 11, 3 Rotation til 16,
 *  ellers 5 Hot Prospect/6 Youngster for de unge og 4 Backup) – *estimeret* (originalen har klubbens ønskeliste) */
function newClubStatus(g: GameState, p: Player, cid: number, idx?: ClubCaIdx): number {
  let better = 0;
  if (idx) { for (const [id, ca] of idx.of(cid)) if (id !== p.id && ca > p.ca) better++; }
  else better = Object.values(g.players).filter((x) => x.club === cid && !x.loan && x.id !== p.id && x.ca > p.ca).length;
  if (better < 2) return 1;
  if (better < 11) return 2;
  if (better < 16) return 3;
  const age = ageOn(p.dob, g.date);
  if (age <= 21) return p.pa > p.ca + 20 ? 5 : 6;
  return 4;
}

/** Kontrakten (80 bytes på adressen) i spillets enheder */
function termsOf(c: CmCtx, k: number, offered: boolean, value: number, gbp: number): CmTerms {
  const m = c.m;
  const eur = (v: number) => Math.max(0, Math.round(v / gbp));
  const cl = [0, 1, 2, 3, 4].map((i) => m.u8(k + 0x1c + i));
  const b: [number, number, number] = [m.s32(k + 0x10), m.s32(k + 0x14), m.s32(k + 0x18)];
  return {
    wage: eur(m.s32(k + 0xc)), expires: dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)), signOn: eur(m.s32(k + 8)), bonusGbp: b, clauses: cl,
    clauseFee: cl.some((x) => x) ? eur(m.s32(k + 0x21)) : 0, partTime: (m.u8(k + 0x35) & 0x80) !== 0, offered,
    raw: { wage: m.s32(k + 0xc), value }, gbp,
  };
}

/** Originalens kontrakt, når klubben `clubId` (computerens) giver spilleren en ny kontrakt: 0x4cda70 (faktor 1,0); giver den intet tilbud,
 *  spillerens krav 0x85fc50(staff, klub, −1, 0xff, 0xb). `desired` = kun 0x85fc50. Null uden for cmLogic, for menneskeklubber og for
 *  spillere, posten ikke kan bygges for. */
/** målinger (scripts/ct-season-game.ts): antal, tid, og [gammel, ny] ugeløn (£) ved klubskifte */
export const WANT_STATS = { n: 0, ms: 0, offered: 0, moves: [] as [number, number][] };
export function cmAiTerms(g: GameState, p: Player, clubId: number, opts: { mem?: WantMem; desired?: boolean } = {}): CmTerms | null {
  if (!cmLogic(g) || g.draft || !g.clubs[clubId]) return null;
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const r = aiTerms(g, p, clubId, opts);
  WANT_STATS.n++; if (r?.offered) WANT_STATS.offered++;
  if (r?.offered && p.club && p.club !== clubId && p.contract && WANT_STATS.moves.length < 5000) WANT_STATS.moves.push([Math.round(p.contract.wage * cmGbp(g, p.club)), r.raw.wage]);
  if (t0) WANT_STATS.ms += performance.now() - t0;
  return r;
}
function aiTerms(g: GameState, p: Player, clubId: number, opts: { mem?: WantMem; desired?: boolean }): CmTerms | null {
  const home = p.loan?.from ?? p.club;
  const M = opts.mem ?? buildWantMem(g, home ? [home, clubId] : [clubId]);
  const { W, c } = M;
  const m = c.m;
  let st = W.staffOf(p);
  if (!st) st = W.addGenerated(p, 0);
  const club = W.clubOf(clubId);
  if (!st || !club) return null;
  const [d] = isoDay(g.date);
  M.setRand(cmRand(g.seed ?? 0, p.id, clubId, d, 0x85fc50));
  M.byStaff.set(st, p);
  {
    for (let i = 0; i < 0x50; i++) m.w8(OUT + i, 0);
    let offered = false;
    if (!opts.desired) offered = offerContract_4cda70(c, 0, st, club, OUT, -1, 1.0, 2) === 1;
    if (!offered) {
      constructContract_85e410(m, LOCAL);
      setToDesiredContract_85fc50(c, LOCAL, st, club, -1, 0xff, 0xb, 0, 0);
      for (let i = 0; i < 0x50; i++) m.w8(OUT + i, m.u8(LOCAL + i));
    }
    return termsOf(c, OUT, offered, valueOf(g, p, clubId), cmGbp(g, clubId));
  }
}

/** Vilkårene ind i spillets kontrakt (bevarer futureClub o.l.) */
export function applyCmTerms(c: Contract, t: CmTerms): void {
  const eur = (v: number) => Math.max(0, Math.round(v / t.gbp));
  c.wage = t.wage;
  c.expires = t.expires;
  const [goal, assist, cs] = t.bonusGbp;
  c.goalBonus = goal > 0 ? eur(goal) : undefined;
  c.cmAssistBonus = assist > 0 ? eur(assist) : undefined;
  c.cleanSheetBonus = cs > 0 ? eur(cs) : undefined;
  c.appBonus = undefined;
  c.cmBonusGbp = goal > 0 || assist > 0 || cs > 0 ? [goal, assist, cs] : undefined;
  c.cmClauses = t.clauses.some((v) => v) ? t.clauses.slice() : undefined;
  c.cmClauseFee = t.clauses.some((v) => v) && t.clauseFee > 0 ? t.clauseFee : undefined;
  c.partTime = t.partTime || undefined;
  c.release = undefined; c.wageRise = undefined; c.relegationCut = undefined; c.promotionRise = undefined;
}

/** En ny kontrakt for en computerklub: originalens tilbud 0x4cda70 (cmLogic) eller `fallback` (spillets egen). `signOn` betales af kalderen. */
export function aiContract(g: GameState, p: Player, club: Club, fallback: () => Contract, mem?: WantMem): { contract: Contract; signOn: number } {
  const t = cmAiTerms(g, p, club.id, { mem });
  // ingen tilbud fra 0x4cda70 (originalen ville ikke have budt – fx et krav over 1,4 × lønloftet eller originalens 250.000-spærre): spillets
  // egen kontrakt, så handlen, spillet har besluttet, ikke får en urimelig løn (*estimeret*)
  if (!t || !t.offered) return { contract: fallback(), signOn: 0 };
  const c: Contract = { wage: t.wage, expires: t.expires };
  applyCmTerms(c, t);
  return { contract: c, signOn: t.signOn };
}

// ---------------------------------------------------------------- forhandlingen efter et accepteret bud (cmTransferTalks.ts)

/** Hukommelsen for spilleren og den købende klub (som aiTerms) med en egen talrække for kaldet `site` */
function talkMem(g: GameState, p: Player, clubId: number, site: number, role?: SquadStatus) {
  if (!cmLogic(g) || g.draft || !g.clubs[clubId]) return null;
  const home = p.loan?.from ?? p.club;
  const M = buildWantMem(g, home ? [home, clubId] : [clubId]);
  let st = M.W.staffOf(p);
  if (!st) st = M.W.addGenerated(p, 0);
  const club = M.W.clubOf(clubId);
  if (!st || !club) return null;
  const [d] = isoDay(g.date);
  M.byStaff.set(st, p);
  M.setRand(cmRand(g.seed ?? 0, p.id, clubId, d, site));
  // uden valgt rolle: den forventede (0x4dd0f0 – med sin egen talrække, før kaldets første træk), ellers newClubStatus (*estimeret*)
  let status = role ? roleCode(role) : 0;
  return {
    M, st, club,
    get status() {
      if (!status) {
        M.setRand(cmRand(g.seed ?? 0, p.id, clubId, d, 0x4dd0f0));
        status = expectedStatus_4dd0f0(M.c, st, club) || newClubStatus(g, p, clubId);
        M.setRand(cmRand(g.seed ?? 0, p.id, clubId, d, site));
      }
      return status;
    },
  };
}

/** Set Role At Club's "* Expected by the player" – 0x4dd0f0 (skærmparameter 6 til 0x4dd6c0, 0x4dd3ff–0x4dd636; uden et åbent tilbud
 *  0x4ca2a0): kontrakten med klubben 0x4cf5f0 og er han ikke tilfreds med den (0x866620 ≠ 1), hans nuværende status (+0x4f >> 4, ikke 7/8,
 *  0x84b4d0); ellers den status 1..6, hvor viljen 0x846920(staff, klub, 1, 0, status, &grunde) er højest – over 3,15, højst 3,5 + 0,1 ·
 *  (+0x59 + +0x57 + +0x5b + 42) (0x4dd111–0x4dd137) og uden grunden 0x8000 – med kontrakt kun en bedre status end den nuværende, og for
 *  under 24-årige (+0x18) kun 1–3 med nok omdømme (spillerposten +0xb, +0x57 og +0x5b mod klubbens +0x80); 1 kræver også +0xb ≥ 3250 og
 *  +0xb + 25·(+0x5b + 70) + 10·(+0x57) ≥ klubbens. 0 = ingen. */
function expectedStatus_4dd0f0(c: CmCtx, st: number, club: number): number {
  const m = c.m;
  const s8 = (v: number) => (v << 24) >> 24;
  const p57 = s8(m.u8(st + 0x57)), p59 = s8(m.u8(st + 0x59)), p5b = s8(m.u8(st + 0x5b)), age = s8(m.u8(st + 0x18));
  const upper = (p59 + p57 + p5b + 0x2a) * 0.1 + 3.5;
  // 0x84b4d0 Shortlist_Manager: status 5/6 kun under 24 år (uden spillerpost 0)
  const allowed = (s: number) => (!m.u32(st + 0x61) ? false : s === 5 || s === 6 ? age < 0x18 : true);
  const k = contractForClub_4cf5f0(c, st, club);
  const happy = k ? contractSatisfaction_866620(c, k, st) === 1 : false;
  if (k && !happy) { const s = m.u8(k + 0x4f) >> 4; return s !== 7 && s !== 8 && m.u32(st + 0x61) && allowed(s) ? s : 0; }
  const cur = k ? m.u8(k + 0x4f) >> 4 : 0;
  const cr = m.s16(club + 0x80);
  const MASK = OUT + 0x70;
  m.w32(MASK, 0);
  let best = 3.15, exp = 0;
  for (let s = 1; s < 8; s++) {
    const rec = m.u32(st + 0x61);
    if (!rec) break;
    if (s === 7) continue;
    if (s !== 1 && k && cur <= s) continue;
    const rb = m.s16(rec + 0xb);
    if (s === 1) {
      if (age < 0x18 && (rb < 0xcb2 || rb + 10 * (p57 + 2 * p5b) < cr)) continue;
      if (rb + 25 * (p5b + 0x46) + 10 * p57 < cr) continue;
    } else if (s === 2) { if (age < 0x18 && rb + 10 * (p57 + 2 * p5b + 0x4b) < cr) continue; }
    else if (s === 3) { if (age < 0x18 && rb + 10 * (p57 + 2 * p5b + 0x7d) < cr) continue; }
    if (!allowed(s)) continue;
    const w = slCall(c, 0x846920, slmOf(m), st, club, 1, 0, s, MASK);
    if (w > upper || !(w > best) || (m.u32(MASK) & 0x8000)) continue;
    best = w; exp = s;
  }
  return exp;
}

/** "* Expected by the player" (0x4dd0f0) for spilleren hos klubben `clubId` – 1..6, 0 = ingen; null uden for cmLogic */
export function cmExpectedStatus(g: GameState, p: Player, clubId: number): number | null {
  if (!cmLogic(g) || g.draft || !g.clubs[clubId]) return null;
  const home = p.loan?.from ?? p.club;
  const M = buildWantMem(g, home ? [home, clubId] : [clubId]);
  let st = M.W.staffOf(p);
  if (!st) st = M.W.addGenerated(p, 0);
  const club = M.W.clubOf(clubId);
  if (!st || !club) return null;
  M.byStaff.set(st, p);
  M.setRand(cmRand(g.seed ?? 0, p.id, clubId, isoDay(g.date)[0], 0x4dd0f0));
  return expectedStatus_4dd0f0(M.c, st, club);
}

/** 0x8c0080 (timing 0xb): vil spilleren overhovedet tale med køberen? Shortlist_Manager 0x846920(staff, klub, 0, 0, status, &ud) med status 1,
 *  når køberen er menneskets (0x600a50); under 0,75 ([0x969040]) afviser han skiftet (0x8d8310). Null uden for cmLogic. */
export function cmMoveInterest(g: GameState, p: Player, clubId: number): number | null {
  return cmMoveCheck(g, p, clubId)?.x ?? null;
}

/** Som cmMoveInterest, med grundene (*out_reasons, bitmasken i notes/board/notes-G2-interest.md §10) – bruges til "because he …" (0x8e4ae0, cmTransferTalks.ts) */
export function cmMoveCheck(g: GameState, p: Player, clubId: number): { x: number; mask: number } | null {
  const T = talkMem(g, p, clubId, 0x8c0080);
  if (!T) return null;
  const c = T.M.c;
  c.m.w32(OUT, 0);
  const x = slCall(c, 0x846920, slmOf(c.m), T.st, T.club, 0, 0, 1, OUT);
  return { x, mask: c.m.u32(OUT) >>> 0 };
}

/** trupstatussen, køberen tilbyder: den valgte, ellers den forventede (0x4dd0f0 – samme som kravet 0x85fc50 bruger; uden en: newClubStatus) */
export function cmTalkStatus(g: GameState, p: Player, clubId: number, role?: SquadStatus): number { return role ? roleCode(role) : cmExpectedStatus(g, p, clubId) || newClubStatus(g, p, clubId); }

/** Set Role At Club → trupstatuskoden 1–6 (Key, First Team, Rotation, Backup, Hot Prospect, Decent Young Player; surplus = 4) */
export function roleCode(r: SquadStatus): number { return r === 'key' ? 1 : r === 'first' ? 2 : r === 'rotation' ? 3 : r === 'prospect' ? 5 : r === 'young' ? 6 : 4; }

/** Spillerens krav i Offer Contract (0x85fc50 med køberens trupstatus, job 0xb – samme som 0x4ce4e0 sammenligner med) */
export function cmTalkDemand(g: GameState, p: Player, clubId: number, role?: SquadStatus): CmTerms | null {
  const T = talkMem(g, p, clubId, 0x85fc50, role);
  if (!T) return null;
  const m = T.M.c.m;
  constructContract_85e410(m, LOCAL);
  setToDesiredContract_85fc50(T.M.c, LOCAL, T.st, T.club, -1, T.status, 0xb, 0, 0);
  return termsOf(T.M.c, LOCAL, false, valueOf(g, p, clubId), cmGbp(g, clubId));
}

/** Offer Contract-skærmens tal for et tilbud til en spiller fra en anden klub eller en klubløs (0x4deac0 → 0x4e06e0): kravet 0x85fc50 med den
 *  valgte trupstatus og ud-felterne – viljen (*outF = 0x846920(staff, klub, 0, 0, status, &grunde)) som skærmparameter 0x1a = ftol(vilje · 1000)
 *  og grundene som parameter 0x19 – samt spillerens alder (+0x18), køberens omdømme (+0x80) og 0x4ce450 (skærmparameter 0x16, sat af 0x4de5d0):
 *  min(10.000.000, 0x85fc50's værdi ved status 1, ved status 2). Beløb i £. Null uden for cmLogic. */
export function cmOfferScreenData(g: GameState, p: Player, clubId: number, role?: SquadStatus):
  { wageGbp: number; type: number; status: number; will: number; mask: number; age: number; rep: number; p16: number } | null {
  const T = talkMem(g, p, clubId, 0x85fc50, role);
  if (!T) return null;
  const c = T.M.c, m = c.m;
  const FOUT = OUT + 0x60, IOUT = OUT + 0x64;
  m.wf32(FOUT, 0); m.w32(IOUT, 0);
  constructContract_85e410(m, LOCAL);
  setToDesiredContract_85fc50(c, LOCAL, T.st, T.club, -1, T.status, 0xb, IOUT, FOUT);
  const wageGbp = m.s32(LOCAL + 0xc), type = m.u8(LOCAL + 0x35) & 0x3f;
  // 0x4dece5: ftol([outF] · 1000.0) → parameter 0x1a; 0x4e0844: fild · 0.001f → float [esp+0x20]
  const p1a = Math.trunc(m.f32(FOUT) * 1000.0) | 0;
  const will = Math.fround(p1a * Math.fround(0.001));
  const mask = m.u32(IOUT) >>> 0;
  const age = m.s8(T.st + 0x18), rep = m.s16(T.club + 0x80);
  // 0x4ce450: to krav (status 1 og 2, a2 −1, job 0xb) i en ny kontraktpost
  const T2 = talkMem(g, p, clubId, 0x4ce450);
  let p16 = 10_000_000;
  if (T2) {
    constructContract_85e410(T2.M.c.m, LOCAL);                          // (én kontraktpost til begge kald, som 0x4ce450)
    for (const s of [1, 2]) {
      const v = setToDesiredContract_85fc50(T2.M.c, LOCAL, T2.st, T2.club, -1, s, 0xb, 0, 0) | 0;
      if (v < p16) p16 = v;
    }
  }
  return { wageGbp, type, status: T.status, will, mask, age, rep, p16 };
}

/** Menneskets tilbud i spillets enheder */
export interface CmOfferTerms { wage: number; expires: string; signOn?: number; bonusGbp?: [number, number, number]; clauses?: number[]; clauseFee?: number; partTime?: boolean }

/** CONTRACT_MANAGER::resolve_contract_offers 0x4ce4e0 for ét tilbud fra en anden klub (transfertilbud, job 0xb): point = 0x866830(tilbud)/
 *  0x866830(krav) − (staff +0x5b − +0x57 + +0x59 − 9)/300; under 0,6 → 0. x = 0x846920(staff, klub, 0, 0, status, 0).
 *  ≥ 0,9: x' = max(x, 3,15); 0,8–0,9 og x > 3,15: x; 0,7–0,8 og x > 3,5: x; ellers intet. Ja, når x'·point > 2,75 (startværdien `best`). */
export function cmContractAnswer(g: GameState, p: Player, clubId: number, o: CmOfferTerms, role?: SquadStatus): { score: number; x: number; t: number; accept: boolean } | null {
  const T = talkMem(g, p, clubId, 0x4ce4e0, role);
  if (!T) return null;
  const c = T.M.c, m = c.m, st = T.st;
  constructContract_85e410(m, LOCAL);
  setToDesiredContract_85fc50(c, LOCAL, st, T.club, -1, T.status, 0xb, 0, 0);
  // tilbuddet = kravet med menneskets felter (klubben, startdatoen og typen som kravets)
  for (let i = 0; i < 0x50; i++) m.w8(OUT + i, m.u8(LOCAL + i));
  const gbp = (eur: number | undefined) => Math.round((eur ?? 0) * cmGbp(g, clubId));
  m.w32(OUT + 0xc, gbp(o.wage));
  m.w32(OUT + 8, gbp(o.signOn));
  const b = o.bonusGbp ?? [-1, -1, -1];
  for (let i = 0; i < 3; i++) m.w32(OUT + 0x10 + 4 * i, b[i]);
  const cl = o.clauses ?? [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i++) m.w8(OUT + 0x1c + i, cl[i] ?? 0);
  m.w32(OUT + 0x21, gbp(o.clauseFee));
  const [d, y] = isoDay(o.expires); m.w16(OUT + 0x2d, d); m.w16(OUT + 0x2f, y); m.w32(OUT + 0x31, leap(y));
  m.w8(OUT + 0x35, (m.u8(OUT + 0x35) & 0x7f) | (o.partTime ? 0x80 : 0));
  const s8 = (v: number) => (v << 24) >> 24;
  const loyAdj = (s8(m.u8(st + 0x5b)) - s8(m.u8(st + 0x57)) + s8(m.u8(st + 0x59)) - 9) * 0.0033333333333333335;
  const a = calcContractValue_866830(c, LOCAL, st, LOCAL) | 0;
  if (!(a > 0)) return { score: 0, x: 0, t: 0, accept: false };
  const bv = calcContractValue_866830(c, OUT, st, LOCAL) | 0;
  let score = bv / a - loyAdj;
  // 0x4ceae2: ikke-spillerposten +0x69 findes ikke for spillere → 0x846920 alene
  const x = slCall(c, 0x846920, slmOf(m), st, T.club, 0, 0, T.status, 0);
  if (score < 0.6) score = 0;
  let f = 0;
  if (score >= 0.9) f = x > 3.15 ? x : 3.15;
  else if (score > 0.8 && x > 3.15) f = x;
  else if (score > 0.7 && x > 3.5) f = x;
  const t = f * score;
  return { score, x, t, accept: t > 2.75 };
}

/** CONTRACT_MANAGER::resolve_contract_offers 0x4ce4e0 for et prøvetidstilbud (type 5, 0x4ce9f4): viljen 0x846920(staff, klub, 0, 1, 8, 0) –
 *  trupstatus 8 (prøvespiller); ja, når den er over `best` 2,75 og ikke under 3,15. Null uden for cmLogic. */
export function cmTrialWill(g: GameState, p: Player, clubId: number): number | null {
  const T = talkMem(g, p, clubId, 0x4ce4e0);
  if (!T) return null;
  return slCall(T.M.c, 0x846920, slmOf(T.M.c.m), T.st, T.club, 0, 1, 8, 0);
}

export type { ContractClauses };

// ---------------------------------------------------------------- stab (cmStaffMove.ts)

/** stabens poster i hukommelsen til 0x4cda70/0x85fc50/0x864550 (cmStaffTerms, cmStaffWill): personposten, ikke-spillerposten og den nuværende
 *  kontrakt (k = 0 uden kontrakt); 0x849f00 svarer med pladsens job og status, 0x597db0 er lønloftet og 0x844780 viljen af spillets data */
function staffMem(g: GameState, s: import('./types').Staff, clubId: number, job: number, status: number): { M: WantMem; st: number; club: number; k: number } | null {
  let stAdr = 0;
  const M = buildWantMem(g, s.club ? [s.club, clubId] : [clubId], {
    full: false,
    call: (adr, a) => {
      if (adr === 0x849f00) {
        const withThis = a.length === 4, st = a[withThis ? 1 : 0] >>> 0, out = withThis ? a[3] >>> 0 : 0;
        if (st === stAdr) { if (out) M.c.m.w32(out, job); return status; }
        return undefined;
      }
      if (adr === 0x597db0) return maxStaffWage_597db0(M.c, a[0] >>> 0, a[a.length - 1] & 0xff);
      // 0x844780(staff, klub, 0, job, a5): viljen af spillets data (cmBoardInterest.ts) – posterne i hukommelsen har ikke viljens inddata
      if (adr === 0x844780 && (a[0] >>> 0) === stAdr && M.c.m.s32(a[1] >>> 0) === clubId) {
        const env = M.env();
        let p = env.person(s.id);
        // en ledig, der kun er i hukommelsen (cmExtra, fx Augusto Terzi): originalen læser hans personpost med ikke-spillerposten og
        // databasens job (+0x3d) – boardEnv's personliste har ham ikke, så env.person gav np = NULL og viljen 0 (0x8447d8)
        if (p && !p.np && s.cmExtra && !s.club) p = memStaffPerson(g, s) ?? p;
        if (!p) return 0;
        // egen stab uden databasens ikke-spillerpost (0x527240's genererede trænere/spejdere/fysioterapeuter): i originalen har de posten +0x69
        // (puljens poster 0x527a85), så 0x844780 springer ikke ud ved 0x8447d8. For c == H (Offer New Contract) returnerer den ved 0x8451ca
        // med 3,5 (× præferencerne) uden at læse personlighedsfelterne – den værdi er eksakt også uden vores post. For andre klubber som før.
        const own = s.club === clubId && !p.np;
        return staffJobInterest(g, env, own ? { ...p, np: true } : p, clubId, a[3] & 0xff);
      }
      return undefined;
    },
  });
  const m = M.c.m;
  const st = M.W.npStaffOf?.(s) ?? 0;
  stAdr = st;
  const club = M.W.clubOf(clubId);
  if (!st || !club) return null;
  // personposten
  if (s.dob) { const [d, y] = isoDay(s.dob); m.w16(st + 0x10, d); m.w16(st + 0x12, y); m.w32(st + 0x14, leap(y)); m.w8(st + 0x18, ageOn(s.dob, g.date)); }
  m.w32(st + 0x1a, M.W.natOf(s.nation));
  (s.cmHid ?? []).slice(0, 8).forEach((v, k) => m.w8(st + 0x56 + k, v));
  const np = m.u32(st + 0x69);
  if (np) {
    const r = s.cmRep ?? [(s.rep ?? 0) * 100, (s.rep ?? 0) * 100, (s.rep ?? 0) * 100];
    m.w16(np + 8, r[0]); m.w16(np + 0xa, r[1]); m.w16(np + 0xc, r[2]);
    m.w16(np + 4, s.ca ?? (s.rep ?? 0) * 2); m.w16(np + 6, s.cmPa ?? s.ca ?? 0);
    s.cmNp?.slice(0, 21).forEach((v, k) => m.w8(np + 0x0e + k, v));
  }
  // den nuværende kontrakt (buildWageMem skriver løn og klub): udløbet og typen
  const ix = m.s32(m.u32(G.ROWS) + 79 * m.s32(st));
  const k = ix >= 0 ? (m.u32(m.u32(G.CM)) + 80 * ix) >>> 0 : 0;
  if (k && s.expires) { const [d, y] = isoDay(s.expires); m.w16(k + 0x2d, d); m.w16(k + 0x2f, y); m.w32(k + 0x31, leap(y)); m.w8(k + 0x35, 2); m.w32(k + 0x4a, -1); }
  return { M, st, club, k };
}

/** 0x844780(staff, klub, **1**, job, NULL) – viljen S (check = 0, cmBoardInterest.ts) med kontraktdelen 0x84662e–0x8467f7: S < 1,75 → S;
 *  ellers standardkontrakten R = 0x864550(staff, klub, 0, −1, job, 0), m = max(3,5 / max(S; 0,1); 0,9), kravet m·R mod lønloftet 0x597db0(job)
 *  (over loftet: S·loft/krav og W = loftet) og W mod den nuværende kontrakts løn k+0xc (mindst 10): q < 0,1 eller q < 1 → S', q > 10 → S'·10/m,
 *  ellers S'·q/m. Uden kontrakt S'. Bruges af trupplanens mål 0x83f3a0 (0x840682, krav ≥ 3,15) – cmStaffMove.ts. */
export function cmStaffWill(g: GameState, s: import('./types').Staff, clubId: number, job: number, S: number): number {
  if (S < 1.75) return S;
  const row = g.cmPlan?.[clubId]?.s.find((r) => r[0] === job);
  const X = staffMem(g, s, clubId, job, row ? (row[2] >> 1) & 0xf : 5);
  if (!X) return S;
  // (hastighed, 25/11) hukommelsens sider tilbage til puljen bagefter (cmMem.ts release – en ny side nulstilles altid): før blev en hukommelse pr.
  // kandidat smidt ud til affaldsopsamlingen (ønskelisternes stabsmål, cmStaffMove.ts findStaffTarget)
  try { return staffWill(g, s, clubId, job, S, X); } finally { (X.M.c.m as SparseMem).release(); }
}
function staffWill(g: GameState, s: import('./types').Staff, clubId: number, job: number, S: number, X: NonNullable<ReturnType<typeof staffMem>>): number {
  const { M, st, club, k } = X, m = M.c.m;
  const fin = M.W.finOf(clubId);
  if (!fin) return 0;
  M.setRand(cmRand(g.seed ?? 0, s.id, clubId, isoDay(g.date)[0], 0x84662e));
  const R = Math.fround(defaultStaffContract_864550(M.c, st, club, 0, -1, job, 0));
  let mm = 3.5 / Math.max(S, 0.1);
  if (mm < 0.9) mm = 0.9;
  const ask = mm * R, maxW = maxStaffWage_597db0(M.c, fin, job) | 0;
  let Sx = S, W = ask;
  if (ask > maxW && ask > 0) { Sx = (maxW / ask) * S; W = maxW; }
  if (!k) return Sx;
  let cw = m.s32(k + 0xc);
  if (cw < 10) cw = 10;
  const q = W / cw;
  if (q < 0.1) return Sx;
  if (q > 10) return Sx * (10 / mm);
  if (q < 1) return Sx;
  return Sx * (q / mm);
}

/** Originalens kontrakttilbud, når computerklubben `clubId` henter en ikke-spiller til jobbet `job` (6 assistent, 8 træner, 9 spejder,
 *  10 fysioterapeut): 0x4cda70(staff, klub, NULL, −1, 1,0, 2) → 0x85fc50 med Shortlist_Manager 0x849f00's job og status (pladsen i køberens
 *  trupplan med jobbet – gruppen +0x24 >> 1) og lønloftet 0x597db0(job). Uden tilbud: personens krav 0x85fc50(staff, klub, −1, status, job).
 *  Posterne: stabens ikke-spillerpost (omdømme +8/+0xa/+0xc, CA +4, PA +6, egenskaberne +0x0e..), personpostens alder/nationalitet/fødselsdato/
 *  skjulte egenskaber +0x56..+0x5d og den nuværende kontrakt (løn, udløb); viljen 0x844780 af spillets data. `refuse`: kravet er originalens
 *  250.000-loft (han skriver ikke under – *estimeret*: beslutningen 0x4ce4e0 er ikke porteret). Null uden for cmStaffOn. */
export function cmStaffTerms(g: GameState, s: import('./types').Staff, clubId: number, job: number): { wage: number; expires: string; offered: boolean; refuse: boolean } | null {
  if (!cmStaffOn(g) || g.draft || !g.clubs[clubId]) return null;
  const row = g.cmPlan?.[clubId]?.s.find((r) => r[0] === job);
  const status = row ? (row[2] >> 1) & 0xf : 5;
  const X = staffMem(g, s, clubId, job, status);
  if (!X) return null;
  const { M, st, club } = X, m = M.c.m;
  const [d] = isoDay(g.date);
  M.setRand(cmRand(g.seed ?? 0, s.id, clubId, d, 0x85fc50));
  for (let i = 0; i < 0x50; i++) m.w8(OUT + i, 0);
  const offered = offerContract_4cda70(M.c, 0, st, club, OUT, -1, 1.0, 2) === 1;
  if (!offered) {
    constructContract_85e410(m, LOCAL);
    setToDesiredContract_85fc50(M.c, LOCAL, st, club, -1, status, job, 0, 0);
    for (let i = 0; i < 0x50; i++) m.w8(OUT + i, m.u8(LOCAL + i));
  }
  const raw = m.s32(OUT + 0xc);
  const wage = Math.round(raw / cmGbp(g, clubId));
  const exp = dayIso(m.s16(OUT + 0x2d), m.u16(OUT + 0x2f));
  if (!(wage > 0) || !(exp > g.date)) return null;
  // 0x8602f8: kravet 250.000 (£ om ugen) er originalens "umuligt" – lønnen over jobbets loft for klubbens omdømme; han skriver ikke under
  return { wage, expires: exp, offered, refuse: !offered && raw >= 250000 };
}

/** Menneskets Offer Contract til en ikke-spiller (Set Role At Club 0x4dd0f0 → 0x4de1f0 → 0x4deac0 → 0x4e06e0, cm0102.exe 3.9.68):
 *  - 0x4de1f0: skærmparameter 0xd = status 0xff (ingen trupstatus), 8 = jobbet, 0x18 = loftet 0x597db0(finansposten, job) – for en, der
 *    er ansat i klubben, mindst hans løn 0x4d0c20 –, 0x16 = 0, 0x1b = hans kontrakts +0x45 (0x4cf5a0).
 *  - 0x4deac0 (0x4decca): kravet 0x85fc50(kontrakt, staff, klub, −1, 0xd, 8, &0x19, &f) – ikke-spillergrenen 0x8602f8 med viljen
 *    f = 0x844780(staff, klub, 0, job, …); skærmparameter 0x1a = ftol(f·1000), som 0x4e06e0 læser som float ·0,001.
 *  - 0x4e06e0: 0x4d4660(kravet) er altid 1 for en ikke-spiller (+0x61 = 0, +0x69 ≠ 0). Han vil forhandle, når lønkravet +0xc < 1,5 · loftet
 *    og enten f > 2,75, eller han er klubbens egen og +0x45 & 2, eller jobbet er træner/spejder/fysioterapeut (8/9/10) og kravet < 3200,
 *    eller han er under 24 og kravet < bx + 3250 (bx = omdømmetillægget 0x4e0936 efter kravets trupstatus 1–5 – en ikke-spillers krav har
 *    status 0xf (0x85fc50 skriver 0xff's nibble), så bx = 0). Ellers 0x4e0d97: klubbens egen → 0x4e0de1 (+0x45 = 0 hos os → 0x9b0964
 *    "does not wish to negotiate a new contract at the current time"); andre → trupstatussens switch 0x4e0ff9, hvis standardgren 0x4e118d
 *    skriver 0x9b0450 "… has no interest in negotiating terms for this position." (+0x69 ≠ 0). Skærmparameter 0x16 = 0, så grenen 0x4e0f1f
 *    (0x16 > 1,5 · loftet) kommer aldrig. Gælder både ledige og ansatte. Null uden for cmStaffOn. */
export function cmStaffOfferCheck(g: GameState, s: import('./types').Staff, clubId: number, job: number):
  { interested: boolean; key: 'cm.neg.noInterest' | 'cm.neg.noRenewNow' | null; wage: number; will: number; allow: number; signOn: number; expires: string } | null {
  if (!cmStaffOn(g) || g.draft || !g.clubs[clubId]) return null;
  const X = staffMem(g, s, clubId, job, 0xff);
  if (!X) return null;
  const { M, st, club, k } = X, m = M.c.m;
  const fin = M.W.finOf(clubId);
  if (!fin) return null;
  const [d] = isoDay(g.date);
  M.setRand(cmRand(g.seed ?? 0, s.id, clubId, d, 0x4deac0));
  // 0x4de1f0 (0x4de461–0x4de532): loftet, for klubbens egen mindst hans løn
  const own = !!k && (m.u8(k + 0x35) & 0x3f) !== 5 && m.s32(k + 4) === m.s32(club);
  let allow = maxStaffWage_597db0(M.c, fin, job) | 0;
  if (own && m.s32(k + 0xc) > allow) allow = m.s32(k + 0xc);
  const flags = k ? m.u32(k + 0x45) : 0;
  // 0x4deac0 (0x4dec8d–0x4ded03): kravet og viljen
  const FOUT = OUT + 0x60, IOUT = OUT + 0x64;
  m.wf32(FOUT, 0); m.w32(IOUT, 0);
  constructContract_85e410(m, LOCAL);
  setToDesiredContract_85fc50(M.c, LOCAL, st, club, -1, 0xff, job, IOUT, FOUT);
  const f = Math.fround(Math.trunc(m.f32(FOUT) * 1000) * Math.fround(0.001));
  const wage = m.s32(LOCAL + 0xc);
  const age = m.s8(st + 0x18);
  const bx = 0;
  // 0x4e0aca–0x4e0b3d
  let ok = !(1.5 * allow <= wage);
  if (ok && !(f > 2.75) && !(own && flags & 2)) {
    if (!((job === 8 || job === 10 || job === 9) && wage < 0xc80)) ok = !(age >= 0x18 || wage >= bx + 0xcb2);
  }
  const key = ok ? null : own ? 'cm.neg.noRenewNow' : 'cm.neg.noInterest';
  // kravets signing-on (+8) og udløb (+0x2d) – skærmens "="-knapper (0x4e2280 id 22/11) og udløbets startværdi (param 0xb/0xc, 0x4df090)
  const signOn = Math.round(m.s32(LOCAL + 8) / cmGbp(g, clubId));
  const expires = dayIso(m.s16(LOCAL + 0x2d), m.u16(LOCAL + 0x2f));
  return { interested: ok, key, wage: Math.round(wage / cmGbp(g, clubId)), will: f, allow: Math.round(allow / cmGbp(g, clubId)), signOn, expires };
}
registerStaffOfferCheck(cmStaffOfferCheck);

/** Svaret på menneskets kontrakttilbud til en ikke-spiller: CONTRACT_MANAGER::resolve_contract_offers 0x4ce4e0 for tilbuddet (Offer →
 *  add_contract_offer 0x4cc490; "no interest"-teksten i 0x4e06e0 er kun tekst – rækkerne og Offer er der altid, grenene mødes i 0x4e11b5).
 *  Tilbuddets trupstatus er skærmens 0xff (nibblen 0xf i +0x4f), jobbet +0x61 = jobbet (6/8/9/10, ≠ 0xb):
 *  - point = 0x866830(tilbud)/0x866830(krav 0x85fc50(staff, klub, −1, 0xf, job)) − (+0x5b − +0x57 + +0x59 − 9)/300; under 0,6 → 0.
 *  - ikke-spillerposten +0x69 ≠ 0 og job ≠ 0xb: x = 0x844780(staff, klub, 0, job, 0) (et spillende job 0x53b620 – 0xb/0xc/0xd/0xf – tager
 *    gennemsnittet med 0x846920; ikke stabens jobs). Er han klubbens egen (Offer New Contract), er isOwn = 1: point ≥ 0,99 og x ≤ 3,15 → x = 3,15.
 *  - 0x4ceb0c: point > 0,5, arbejdstilladelse 0x8c7560 og kontraktens udløb +0x2d under 90 dage væk → 0.
 *  - point ≥ 0,9: f = max(x, 3,15); 0,8–0,9 og x > 3,15: x; 0,7–0,8 og x > 3,5: x; ellers intet. Ja, når f·point > 2,75 (`best`'s start).
 *  - 0x4cec5a: +0x69 ≠ 0 og kandidat til et managerjob (0x69fc60 på MANAGER_MANAGER – cmBoard vac.cand) → intet tilbud vælges.
 *  Kun menneskets tilbud vurderes (computerklubbernes samtidige tilbud til samme person indgår ikke – som cmContractAnswer). Null uden for cmStaffOn. */
export function cmStaffContractAnswer(g: GameState, s: import('./types').Staff, clubId: number, job: number, o: { wage: number; signOn: number; expires: string }):
  { score: number; x: number; t: number; accept: boolean; reasons?: number; mgr?: boolean; variant?: number } | null {
  if (!cmStaffOn(g) || g.draft || !g.clubs[clubId]) return null;
  const X = staffMem(g, s, clubId, job, 0xf);
  if (!X) return null;
  const { M, st, club } = X, c = M.c, m = c.m;
  const [d] = isoDay(g.date);
  M.setRand(cmRand(g.seed ?? 0, s.id, clubId, d, 0x4ce4e0));
  constructContract_85e410(m, LOCAL);
  setToDesiredContract_85fc50(c, LOCAL, st, club, -1, 0xf, job, 0, 0);
  // tilbuddet = kravet med menneskets løn, signing-on og udløb (skærmen starter fra kravet; stabens skærm har ingen bonusser/klausuler)
  for (let i = 0; i < 0x50; i++) m.w8(OUT + i, m.u8(LOCAL + i));
  const gbp = (eur: number) => Math.round(eur * cmGbp(g, clubId));
  m.w32(OUT + 0xc, gbp(o.wage));
  m.w32(OUT + 8, gbp(o.signOn));
  const [ed, ey] = isoDay(o.expires); m.w16(OUT + 0x2d, ed); m.w16(OUT + 0x2f, ey); m.w32(OUT + 0x31, leap(ey));
  m.w8(OUT + 0x35, m.u8(OUT + 0x35) & 0x7f);
  const s8 = (v: number) => (v << 24) >> 24;
  const loyAdj = (s8(m.u8(st + 0x5b)) - s8(m.u8(st + 0x57)) + s8(m.u8(st + 0x59)) - 9) * 0.0033333333333333335;
  const a = calcContractValue_866830(c, LOCAL, st, LOCAL) | 0;
  if (!(a > 0)) return { score: 0, x: 0, t: 0, accept: false };
  const bv = calcContractValue_866830(c, OUT, st, LOCAL) | 0;
  let score = bv / a - loyAdj;
  const np = m.u32(st + 0x69) !== 0;
  let x: number;
  if (np) {
    x = Math.fround(c.call(0x844780, st, club, 0, job, 0));
    if (job === 0xb || job === 0xc || job === 0xd || job === 0xf) x = Math.fround((slCall(c, 0x846920, slmOf(m), st, club, 0, 0, 0xf, 0) + x) * 0.5);
  } else x = Math.fround(slCall(c, 0x846920, slmOf(m), st, club, 0, 0, 0xf, 0));
  // 0x4ce9b5: hans nuværende kontrakt er med den tilbydende klub (Offer New Contract til egen stab) → isOwn, og point ≥ 0,99 løfter x til 3,15
  const own = !!s.club && s.club === clubId;
  if (own && !(score < 0.99) && !(x > 3.15)) x = 3.15;
  if (score < 0.6) score = 0;
  // 0x4ceb0c: point > 0,5, arbejdstilladelsen 0x8c7560(staff, klub) og udløbet +0x2d under 90 dage fra i dag (0x54cdb0) → 0 (som cmContract.ts) –
  // kontraktskærmens udløb går i måneder (0x4e2280), så et kort tilbud kan nå hertil
  if (score > 0.5 && c.call(0x8c7560, m.u32(0xde1f54), st, club, 0) && daysBetween(g.date, o.expires) < 0x5a) score = 0;
  let f = 0;
  if (score >= 0.9) f = x > 3.15 ? x : 3.15;
  else if (score > 0.8 && x > 3.15) f = x;
  else if (score > 0.7 && x > 3.5) f = x;
  const t = f * score;
  const cand = np && ((g.cmBoard as { vac?: { cand?: number }[] } | undefined)?.vac ?? []).some((v) => v.cand === s.id);
  const accept = t > 2.75 && !cand;
  // nyheden 0xbb8 (0x4d49a0): grundene = ud-flagene fra 0x846920(staff, klub, 0, kontrakttype 2, status 0xf, &ud) (0x4d4bbe), klubbens manager
  // +0xcf (0x4d4bd5) og variantens rand(3) (0x4d4d12) – samme hukommelse og rand-strøm, efter afgørelsen som i originalen
  const RS = OUT + 0x68;
  m.w32(RS, 0);
  slCall(c, 0x846920, slmOf(m), st, club, 0, 2, 0xf, RS);
  const reasons = m.u32(RS);
  const mgr = m.u32(club + 0xcf) !== 0;
  const variant = c.rand(3);
  return { score, x, t, accept, reasons, mgr, variant };
}
registerStaffContractAnswer(cmStaffContractAnswer);
