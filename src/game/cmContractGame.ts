// Computerklubbernes nye kontrakter som originalen (kun den originale database i ægte tilstand – cmActive): CONTRACT_MANAGER::offer_contract
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
//   klub: +0x73 tilskuertallet og +0xb3/+0xb7/+0xbb rivalerne (GameState.cmCrowd), +0x1db europæisk turnering −1.
//   land: +0x71 verdensdelen, +0x77 sproget (grid/nationLanguage.ts), +0x8e (WorldData.valueClub [1]).
//   turneringsobjekterne [0xadadfc][division]: +0x43 = 2 (liga), vtabellens +0x98/+0x9c (0x684790/0x6847b0: +0xbe/+0xd9 op-, +0xc1 nedrykning
//     efter spillets regler som cmContractInit.ts leagueOf), +8 tabellen (0x4a4850).
//   sæsontabellen 0xb63d60 (35 × 0x48): originalens rækker (verdensdelene 0–7, nøglelandene 8–34 – +0x17 sæsonen krydser nytår, +0x2a start,
//     +0x39 slut; aflæst i øjebliksbilledet pre-194-2001.bin).
//   [0xa83608] = 10 (største antal år). Transferlisterne i TRANSFER_MANAGER, forhandlingslisterne og skadeposten [0xb63d28] er tomme (0).
// rand: 0x85fc50 trækker rand(0x1c) (dagen i udløbsmåneden) – af spillets frø, personen og datoen (cmRand – rører ikke spillets rng).
import type { Club, Contract, ContractClauses, GameState, Player } from './types';
import { type CmCtx, G } from './cmMem';
import { buildWageMem, cmMemCall, type WageMem } from './cmWageGame';
import { setToDesiredContract_85fc50, constructContract_85e410 } from './cmContractWant';
import { offerContract_4cda70 } from './cmContract';
import { getClubFinance_5a0590 } from './cmWage';
import { genCtx } from './cmGen/impls';
import { slCall, slmOf } from './cmShortlist';
import { cmActive, cmRand } from './cmPlayerData';
import { leagueOf } from './cmContractInit';
import { formulaValueGbp } from './originalValue';
import { playerRecord } from './engine/grid/aiTeam';
import { nationLanguage } from './engine/grid/nationLanguage';
import { regionOf } from './leagues';
import { ATTRS } from './attributes';
import { ageOn } from './dates';
import { boardEnv } from './cmBoardGame';
import { leagueClash } from './cmBoardInterest';
import type { BoardEnv } from './cmBoard';

/** £ → € som newgame.ts */
const GBP = 0.86;
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
/** verdensdelenes rækker 3–7: Europa, Nordamerika, Sydamerika, Asien, Oceanien (rækkerne 0–2 har ingen verdensdel) */
const OCEANIA = new Set(['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa', 'American Samoa', 'Tonga', 'Vanuatu', 'Tahiti', 'Solomon Islands', 'New Caledonia', 'Cook Islands']);

const isoDay = (iso: string): [number, number] => {
  const y = +iso.slice(0, 4);
  return [Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000), y];
};
const leap = (y: number) => (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 1 : 0);
const dayIso = (day: number, year: number) => new Date(Date.UTC(year, 0, 1) + day * 86400000).toISOString().slice(0, 10);
const attr = (p: Player, k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10);

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
}

/** fejlsøgning (scripts/cm-want-diff.ts): kaldene ud af portene (adresse, svar) */
export const WANT_DEBUG: { f?: (adr: number, v: number, a: number[]) => void } = {};

/** Hukommelsen for en handel: de byggede klubber + felterne ud over lønportene */
export interface WantMem { W: WageMem; c: CmCtx; g: GameState; env: () => BoardEnv; setRand(f: (n: number) => number): void; byStaff: Map<number, Player> }

/** Bygger posterne for klubberne (spillernes nuværende og købende klubber) */
export function buildWantMem(g: GameState, clubs: Iterable<number>): WantMem {
  const W = buildWageMem(g, clubs, new Set(), false);
  const m = W.c.m;
  m.w8(0xa83608, 10);
  // månedstabellerne 0x9b8448 (almindeligt år) og 0x9b8460 (skudår): dagen i året, måneden begynder (s16) – 0x54cfb0, 0x85fc50
  [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334].forEach((d, i) => { m.w16(0x9b8448 + 2 * i, d); m.w16(0x9b8460 + 2 * i, d + (i >= 2 ? 1 : 0)); });
  // verdensdelene og sæsontabellen
  const contOf = (name: string | undefined) => {
    if (!name) return 0;
    if (OCEANIA.has(name)) return CONT0 + 0x100 * 4;
    const r = regionOf(name);
    return r === 'europe' ? CONT0 : r === 'northAmerica' ? CONT0 + 0x100 : r === 'southAmerica' ? CONT0 + 0x200 : r === 'asia' ? CONT0 + 0x300 : CONT0 + 0x500;
  };
  const [tday, tyear] = isoDay(g.date);
  const seasonYear = tday >= 181 ? tyear : tyear - 1;
  const byName = new Map(g.nations.map((n, i) => [n.name, i]));
  const dy = seasonYear - 2001;
  SEASON_ROWS.forEach(([nm, hex], r) => {
    const a = 0xb63d60 + 0x48 * r;
    for (let i = 0; i + 1 < hex.length; i += 2) m.w8(a + 0x17 + i / 2, parseInt(hex.slice(i, i + 2), 16));
    for (let o = 0x1e; o < 0x2a; o++) m.w8(a + o, 0);
    for (const o of [0x1b, 0x2c, 0x35, 0x3b, 0x44]) { const y = m.u16(a + o); if (y) m.w16(a + o, y + dy); }
    const n = nm ? byName.get(nm) : undefined;
    m.w32(a, n === undefined ? 0 : W.natOf(n));
    // nation +0x11c ≠ 0: landet har en række i tabellen (0x669360)
    if (n !== undefined) m.w8(W.natOf(n) + 0x11c, 1);
    m.w32(a + 4, !nm && r >= 3 ? CONT0 + 0x100 * (r - 3) : 0);
  });
  // landenes felter (ud over buildWageMem: +0x71 verdensdelen, +0x77 sproget, +0x8e)
  const nat8e = new Map<number, number>();
  for (const cl of Object.values(g.clubs)) if (cl.vc && !nat8e.has(cl.nation)) nat8e.set(cl.nation, cl.vc[1]);
  const natDone = new Set<number>();
  const nat = (n: number | undefined) => {
    const a = W.natOf(n);
    if (a && !natDone.has(a)) {
      natDone.add(a);
      const nm = g.nations[n!]?.name;
      m.w32(a + 0x71, contOf(nm)); m.w8(a + 0x77, nationLanguage(nm)); m.w16(a + 0x8e, nat8e.get(n!) ?? 0);
    }
    return a;
  };
  // klubberne: tilskuertal, rivaler, europæisk turnering
  const clubIds = [...new Set(clubs)].filter((id) => g.clubs[id]);
  for (const cid of clubIds) {
    const a = W.clubOf(cid);
    if (!a) continue;
    nat(g.clubs[cid].nation);
    const cr = g.cmCrowd?.[cid];
    m.w32(a + 0x73, cr?.[0] ?? 0);
    (cr?.slice(6, 9) ?? []).forEach((r, k) => m.w32(a + 0xb3 + 4 * k, r >= 0 ? (m.u32(G.CLUBS) + 0x245 * r) >>> 0 : 0));
    m.w32(a + 0x1db, -1);
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
    const rec = playerRecord(p), pr = m.u32(st + 0x61);
    m.w8(pr + 4, rec[4]);
    for (let o = 0x16; o < 0x46; o++) m.w8(pr + o, rec[o]);
    const k = W.contractOf(p);
    if (k && p.contract) {
      const b = p.contract.cmBonusGbp ?? [-1, -1, -1];
      for (let i = 0; i < 3; i++) m.w32(k + 0x10 + 4 * i, b[i]);
      (p.contract.cmClauses ?? [0, 0, 0, 0, 0]).forEach((v, i) => m.w8(k + 0x1c + i, v));
      m.w32(k + 0x21, Math.round((p.contract.cmClauseFee ?? 0) * GBP));
      const j = p.joined ?? p.cmJoined;
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
  const envOf = () => (env ??= boardEnv(g));
  // kald
  const base: CmCtx = {
    m,
    rand: (n) => rand(n),
    useLog: (adr) => adr === 0x600a50 || adr === 0x849f00 || (VALUE_FORMULA && adr === 0x4d0c60),
    call: (adr, ...a) => {
      if (WANT_DEBUG.f) { const v = call(adr, a); WANT_DEBUG.f(adr, v, a); return v; }
      return call(adr, a);
    },
  };
  const call = (adr: number, a: number[]): number => {
      switch (adr) {
        case 0x849f00: {
          // Shortlist_Manager 0x849f00: trupstatussen hos klubben. Hos en ny klub har spillet ingen ønskeliste (originalens 0x83a730/0x84a020) –
          // status efter hans plads i køberens trup (*estimeret*), job 0xb
          const withThis = a.length === 4, st = a[withThis ? 1 : 0] >>> 0, club = a[withThis ? 2 : 1] >>> 0, out = withThis ? a[3] >>> 0 : 0;
          const p = byStaff.get(st), cid = m.s32(club);
          if (p && m.u32(st + 0x39) !== club && g.clubs[cid]) { if (out) m.w32(out, 0xb); return newClubStatus(g, p, cid); }
          return withThis ? slCall(gc, adr, a[0], ...a.slice(1)) : slCall(gc, adr, slmOf(m), ...a);
        }
        case 0x846920: case 0x844780: return slCall(gc, adr, slmOf(m), ...a);
        case 0x8cca10: return slCall(gc, adr, m.u32(0xde1f54), ...a);
        case 0x5a0590: return getClubFinance_5a0590(gc, a[a.length - 1]);
        case 0x4d0c60: return valueOf(g, byStaff.get(a[0] >>> 0), m.s32(a[1]));
        case 0x4b02e0: return leagueClash(envOf(), m.s32(a[0]), m.s32(a[1]));
        case 0x4a4850: {
          // tabelrækken for klubben (a[0]) i ligaen: +4 kampe, +0x72 placeringen, +0x73/+0x74/+0x75 fremskrivningerne
          const e = envOf().entry(m.s32(a[0]));
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
  if (!club?.vc || !p.cmRep) return Math.round((p.value ?? 0) * GBP);
  return Math.trunc(formulaValueGbp({ pa: p.pa, age: ageOn(p.dob, g.date), pos: p.pos, attrs: p.attrs, rep: p.cmRep, caps: p.caps ?? 0, staffId: p.id, clubId, vc: club.vc }));
}

/** trupstatus 1–7 for en spiller hos en ny klub: pladsen efter CA i køberens trup (1 Key de 2 bedste, 2 First Team til 11, 3 Rotation til 16,
 *  ellers 5 Hot Prospect/6 Youngster for de unge og 4 Backup) – *estimeret* (originalen har klubbens ønskeliste) */
function newClubStatus(g: GameState, p: Player, cid: number): number {
  const better = Object.values(g.players).filter((x) => x.club === cid && !x.loan && x.id !== p.id && x.ca > p.ca).length;
  if (better < 2) return 1;
  if (better < 11) return 2;
  if (better < 16) return 3;
  const age = ageOn(p.dob, g.date);
  if (age <= 21) return p.pa > p.ca + 20 ? 5 : 6;
  return 4;
}

/** Kontrakten (80 bytes på adressen) i spillets enheder */
function termsOf(c: CmCtx, k: number, offered: boolean, value: number): CmTerms {
  const m = c.m;
  const eur = (v: number) => Math.max(0, Math.round(v / GBP));
  const cl = [0, 1, 2, 3, 4].map((i) => m.u8(k + 0x1c + i));
  const b: [number, number, number] = [m.s32(k + 0x10), m.s32(k + 0x14), m.s32(k + 0x18)];
  return {
    wage: eur(m.s32(k + 0xc)), expires: dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)), signOn: eur(m.s32(k + 8)), bonusGbp: b, clauses: cl,
    clauseFee: cl.some((x) => x) ? eur(m.s32(k + 0x21)) : 0, partTime: (m.u8(k + 0x35) & 0x80) !== 0, offered,
    raw: { wage: m.s32(k + 0xc), value },
  };
}

/** Originalens kontrakt, når klubben `clubId` (computerens) giver spilleren en ny kontrakt: 0x4cda70 (faktor 1,0); giver den intet tilbud,
 *  spillerens krav 0x85fc50(staff, klub, −1, 0xff, 0xb). `desired` = kun 0x85fc50. Null uden for cmActive, for menneskeklubber og for
 *  spillere, posten ikke kan bygges for. */
/** målinger (scripts/ct-season-game.ts): antal, tid, og [gammel, ny] ugeløn (£) ved klubskifte */
export const WANT_STATS = { n: 0, ms: 0, offered: 0, moves: [] as [number, number][] };
export function cmAiTerms(g: GameState, p: Player, clubId: number, opts: { mem?: WantMem; desired?: boolean } = {}): CmTerms | null {
  if (!cmActive(g) || g.draft || !g.clubs[clubId]) return null;
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const r = aiTerms(g, p, clubId, opts);
  WANT_STATS.n++; if (r?.offered) WANT_STATS.offered++;
  if (r?.offered && p.club && p.club !== clubId && p.contract && WANT_STATS.moves.length < 5000) WANT_STATS.moves.push([Math.round(p.contract.wage * GBP), r.raw.wage]);
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
    return termsOf(c, OUT, offered, valueOf(g, p, clubId));
  }
}

/** Vilkårene ind i spillets kontrakt (bevarer futureClub o.l.) */
export function applyCmTerms(c: Contract, t: CmTerms): void {
  const eur = (v: number) => Math.max(0, Math.round(v / GBP));
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

/** En ny kontrakt for en computerklub: originalens tilbud 0x4cda70 (cmActive) eller `fallback` (spillets egen). `signOn` betales af kalderen. */
export function aiContract(g: GameState, p: Player, club: Club, fallback: () => Contract, mem?: WantMem): { contract: Contract; signOn: number } {
  const t = cmAiTerms(g, p, club.id, { mem });
  // ingen tilbud fra 0x4cda70 (originalen ville ikke have budt – fx et krav over 1,4 × lønloftet eller originalens 250.000-spærre): spillets
  // egen kontrakt, så handlen, spillet har besluttet, ikke får en urimelig løn (*estimeret*)
  if (!t || !t.offered) return { contract: fallback(), signOn: 0 };
  const c: Contract = { wage: t.wage, expires: t.expires };
  applyCmTerms(c, t);
  return { contract: c, signOn: t.signOn };
}

export type { ContractClauses };
