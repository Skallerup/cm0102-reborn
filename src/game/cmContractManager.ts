// CONTRACT_MANAGER::daily_update 0x4c7ac0 på spillets data – computerklubbernes forlængelser, udløb og frigivelser som i CM 01/02 (kun den
// originale database i ægte tilstand, cmActive – og nye spil med en CM-database i ægte tilstand, g.cmCmMgr: cmCmOn). Porten selv er cmContract.ts (instruktion for instruktion, kontrolleret mod oraklets
// hukommelse 20/7-2001, 1/2-2002 og 30/6-2002); her bygges originalens poster af spiltilstanden (cmContractGame.ts buildWantMem) og
// CONTRACT_MANAGER's vedvarende tilstand (tilbudslisten +0x34, beslutningsdatoerne +0xc, rækkernes +8/+0xb, kontrakternes +0x25/+0x35/+0x49)
// gemmes i GameState.cmCm og spillets kontrakter mellem dagene.
//
// Hvad funktionen gør for en computerklubs spiller (notes/contract-manager.md; dagen kører tidspunkterne 0, 1 og 2 som 0x5cccd0):
//   – [0xae2330] (exe-konstanten 31/8-2001) − i dag ∈ {7, 30, 42, 60, 70, 91}: forlængelsestilbud (0x4cda70, faktor
//     1,0) efter 180 dage med kontrakten, når den udløber inden 1095 dage (trupstatus 1; 2/3 med omdømme > 6750 eller under 24 år og PA > 100;
//     5 med PA > 100; under 32 år, ikke uven med klubben/manageren).
//   – mere end 182 dage tilbage: intet mere – 0x868210 svarer 1, fordi [0xae233c] = 0 (til 1/9-2001) eller kontrakten startede før [0xae2330];
//     ellers kun på FIFA-periodens slutdag (2/3 år efter starten), så båndene 550/365 nås aldrig.
//   – højst 182 dage tilbage: på båndenes dage (182, 152, 121, 91, 60, 30, 7 dage før) tilbud med faktor 1,0–1,4 efter trupstatus og klubbens
//     plan (0x849ce0); gode spillere (omdømme > 3750, Loyalty < 15, 19–30 år), der vil væk (0x866f60), sættes fri (+0x49 = 1).
//   – udløbsdagen: type 1 (udløbet); sat fri (+0x49) → fri transfer 0x8c1af0; trupstatus 7 og transferlistet → fri transfer 0x8c16b0; ellers bliver
//     han i klubben med den udløbne kontrakt. 31 dage efter: vil han væk (0x866f60) eller er sat fri → fri transfer.
//   – tilbuddene afgøres 1–5 dage senere (4–7 når kontrakten udløber inden 180 dage, højst 14): 0x4ce4e0 vælger det bedste (værdien 0x866830 mod
//     hans ønskede kontrakt 0x85fc50, vægtet med klubbens tiltrækning 0x846920) – underskriften 0x8c38b0 → spillets nye kontrakt.
//   – Shortlist_Manager 0x842c00 (ønskelisterne: spilleren tilbydes klubberne) køres i ønskelisternes hukommelse efter dagen (cmSlOffer842c00).
// Spillets egne systemer for de samme spillere er slået fra (transfers.ts aiRenewals, season.ts' udløb 1/7).
//
// Gating (kun for hastigheden – samme virkning): personløkken køres kun for de spillere, der kan blive berørt i dag (dagene ovenfor, type 1 efter
// 31 dage, Bosman-tjekkets betingelser, forfaldne beslutninger); værdien +0x52 regnes for de byggede spillere (originalen fornyer den hver
// anden dag – 0x4c7ec5). Kun spillere i klubber i de spilbare lande (originalens indlæste personer); udlejede spillere og menneskets klubber
// har spillets eget system.
// *Estimeret*: ingen nyheder (0x4d6790/0x4da590/0x4d49a0/0x4d6d70 går kun til mennesket), transfertilbuddene/
// forhandlingerne (TRANSFER_MANAGER 0x8c5cf0/0x8c5e40/0x8c1870 = spillets åbne bud på spilleren), karrierens slut 0x7a7eb0 = Player.cmRetire,
// sign_contract 0x4cf720's felter (+0x3d.. som cmPlayerData newCmContract).
import { bookBlock, K as FK, memKnown } from './cmFinance';
import type { Contract, GameState, Player } from './types';
import { G, clubAt, getContract, cmAfter2330, DATE_2330, type CmMem } from './cmMem';
import { buildWantMem, applyCmTerms, type CmTerms, type WantMem } from './cmContractGame';
import { contractDailyUpdate_4c7ac0, daysSince_54cdb0, fixedDates_4c7ac0, offerContract_4cda70, listAdd_68d0d0, listInit_68d020, listNext_68d1b0 } from './cmContract';
import { humanClub_600a50 } from './cmWageGame';
import { slCall } from './cmShortlist';
import { cmSlOffer842c00 } from './cmShortlistGame';
import { cmActive, cmFlagClear, cmFlagSet, cmHid, cmInDeal, cmLogic, cmRand, contractExtHook, curRep, newCmContract, statusCode, withFlagCtx, type CmContract } from './cmPlayerData';
import { contractSatisfaction_866620, deservedStatus_4ca470 } from './cmContractWant';
import type { CmCtx } from './cmMem';
import { isHumanClub } from './humans';
import { holidayClub } from './cmHoliday';
import { recordFreeTransfer, setClub } from './state';
import { ageOn } from './dates';
import { ATTRS } from './attributes';
import { HEAP0, HEAP_PTR } from './cmGen/x86';
import { addDisClub, addDisPerson, addFavClub, addFavPerson, managerStaff, personKey } from './cmRelations';
import { cmSignContractMorale } from './cmMedia';
import { renewalHooks } from './cmTableHooks';

/** € → £ (cmMoney.ts) */
import { cmGbp } from './cmMoney';
const ENV: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env ?? {} : {};
/** CM_DAILY=0 slår porten fra (målingerne i scripts/cm-contract-days-game.ts) */
const OFF = ENV.CM_DAILY === '0';

/** målinger: dage, kandidater, byggede klubber, tilbud, underskrifter, frigivelser, tid (ms) */
export const CMD_STATS = { days: 0, cand: 0, clubs: 0, offers: 0, signed: 0, released: 0, expired: 0, ms: 0 };

/** CONTRACT_MANAGER's tilstand mellem dagene: beslutningsdatoerne fra +0x18 ([spiller-id, dag, år, tidspunkt, art]), tilbuddene
 *  ([spiller-id, 0x6f bytes som hex – +0 = 0]) og rækkernes +0xb (spiller-id → byte) */
export interface CmCmState { dec: number[][]; off: [number, string][]; row: Record<number, number> }

const dayNum = (iso: string) => Math.round(Date.parse(iso.slice(0, 10) + 'T00:00:00Z') / 86400000);
const isoOf = (n: number) => new Date(n * 86400000).toISOString().slice(0, 10);
const isoDay = (iso: string): [number, number] => { const y = +iso.slice(0, 4); return [dayNum(iso) - dayNum(`${y}-01-01`), y]; };
const dayIso = (d: number, y: number) => isoOf(dayNum(`${y}-01-01`) + d);
const leap = (y: number) => (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 1 : 0);
const attr = (p: Player, k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10);
const SLOT = 0x25, SLOTS = 0x70000000;
/** [0xae2330] − i dag for blokken 0x4c81a3 */
const BLOCK_A = new Set([7, 30, 42, 60, 70, 91]);
/** de ulige bånd (0x867d30): 182, 152, 121, 91, 60, 30, 7 dage før udløbet */
const BANDS = new Set([182, 152, 121, 91, 60, 30, 7]);

/** Spilleren er i portens område: computerklub i et spilbart land, ikke udlejet, med kontrakt */
export function cmCmScope(g: GameState, p: Player): boolean {
  if (!p.club || !p.contract || p.loan || p.virtual || p.contract.futureClub) return false;
  const c = g.clubs[p.club];
  // menneskets klub: spillets eget system – men på ferie er 0x600a50(klub, 0, 1, 0, 0) = 0 (cmContract.ts isHuman(…, 0, 1)), så
  // CONTRACT_MANAGER forlænger, tilbyder og sætter fri som for en computerklub (oraklet: Arsenal på ferie, Henry £53k → £84k)
  if (!c || (isHumanClub(c.id) && !holidayClub(g, c.id))) return false;
  // også klubberne uden aktiv liga (de valgte landes inaktive divisioner – England: 146 non-league-klubber, 1.610 spillere i oraklets hukommelse):
  // 0x4c7ac0's personløkke går over alle personer i hukommelsen, og 0x83a1b0/0x83cb40 giver dem trupplanen (cmSquadPlanStart). Før stod de uden
  // for porten, og cmExpireOutsideDaily (*estimeret*) satte dem fri dagen efter udløbet – klubløse 30/6 918 mod oraklets 202
  if (g.activeNations?.includes(c.nation) ?? true) return true;
  // de andre lande: originalens personløkke går over ALLE personer i hukommelsen – også de udvalgte i klubber uden for de valgte lande
  // (0x524d70, Player.cmMem) – ved enhver databasestørrelse: før kun Maximum (g.cmMaxMem), så Normal/størrelse 2's 1.107 udenlandske i
  // hukommelsen stod uden for porten, og cmExpireOutsideDaily satte dem fri dagen efter udløbet (K7 sæson 1: 41 klubløse fra udenlandske
  // klubber mod oraklets 4; oraklet forlænger 192 af de 269 udløbende)
  return FOREIGN && p.cmMem === 1 && memKnown(g);
}
/** CM_CM_FOREIGN=0: kun de valgte lande (målinger) */
const FOREIGN = ENV.CM_CM_FOREIGN !== '0';
/** Porten styrer computerklubbernes kontrakter i dette spil: den originale database (cmActive) eller en CM-database i ægte tilstand i et spil,
 *  der er startet med CONTRACT_MANAGER (g.cmCmMgr – newgame.ts; 2026/27 fra 20/11). Ældre 2026/27-spil beholder spillets egne forlængelser. */
export const cmCmOn = (g: GameState) => !OFF && (cmActive(g) || (cmLogic(g) && g.cmCmMgr === 1)) && !g.draft;

/** [0xae2330]: exe-konstanten 31/8-2001 (cmMem.ts DATE_2330) – blok 0x4c81a3 kører derfor kun i den første sommer af et spil fra 2001 */
const date2330 = (): number => dayNum(DATE_2330);

/** kan personløkken gøre noget for spilleren i dag? (en overmængde af 0x4c7dea–0x4c9d26's betingelser) */
function candidate(g: GameState, p: Player, T: number, A: number): boolean {
  const k = p.contract!;
  const E = dayNum(k.expires), type = k.cmType ?? 2;
  // blokken 0x4c81a3 (blockA) kører FØR typetjekket 0x4c8603 og også for udløbne kontrakter (type 1): en kontrakt, der udløb 30/6, får
  // forlængelsestilbuddet 2/7 og 20/7 ([0xae2330] − i dag = 60/42), selv om de 31 dage ikke er gået (før sprang porten dem over)
  if (A > T && BLOCK_A.has(A - T) && E < T + 1095) return true;
  if (type === 1) return T > E + 31;
  const due = E - T;
  if (due > 182) {
    // 0x868210 med [0xae233c] = 1 og en kontrakt, der startede efter [0xae2330]: FIFA-perioden (3 år under 28, ellers 2) – udløser tilbud
    // på dagen, hvor den slutter (en overmængde: samme dag og måned som starten ± 1 dag)
    const st = k.cmStart ?? p.joined ?? p.cmJoined;
    if (!st || !cmAfter2330(g.date) || st.slice(0, 10) <= DATE_2330) return false;
    const md = (n: number) => isoOf(n).slice(5);
    const s0 = dayNum(st), sm = md(s0);
    return [T - 1, T, T + 1].some((x) => md(x) === sm) && T - s0 > 700;
  }
  if (due <= 0 || BANDS.has(due) || k.cmB49) return true;
  // 0x4c88b5's Bosman-tjek: omdømme +0xb > 3750 og +0xd > 1750, Loyalty < 15, 19–30 år (som buildWageMem skriver dem)
  const rep = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
  const age = ageOn(p.dob, g.date);
  return Math.round(rep[1] * 50) > 3750 && Math.round(rep[2] * 50) > 1750 && attr(p, 'loyalty') < 15 && age < 31 && age > 18;
}

// ---------------------------------------------------------------- bunken (som cmGen/x86.ts' heapAlloc – samme peger)
function alloc(m: CmMem, n: number): number {
  let p = m.u32(HEAP_PTR) >>> 0;
  if (p < HEAP0) p = HEAP0;
  const a = (p + 15) & ~15;
  m.w32(HEAP_PTR, (a + Math.max(16, n + 16)) >>> 0);
  m.w32(a - 4, n);
  return a >>> 0;
}

/** Klubbens planpladser (GameState.cmPlan, 40 à 0x25 bytes) i Shortlist_Manager's tabel [[0xde1f54]+0x856]+0xdc – 0x849ce0/0x849f00 læser dem */
function writeSlots(g: GameState, m: CmMem, cid: number, memOf: (pid: number) => number): void {
  const st = g.cmPlan?.[cid];
  if (!st) return;
  const ent = (m.u32(m.u32(m.u32(0xde1f54) + 0x856) + 0xdc) + 9 * cid) >>> 0;
  const base = SLOTS + 0x5c8 * cid;
  m.w32(ent, base); m.w8(ent + 4, st.st); m.w8(ent + 7, st.fm); m.w8(ent + 8, st.c);
  st.s.forEach((r, i) => {
    const a = base + SLOT * i;
    m.w8(a, r[0]); m.w16(a + 1, r[1]); m.w32(a + 3, r[9] ?? 0); m.w32(a + 7, r[10] ?? 0); m.w32(a + 0xb, r[11] ?? 0);
    m.w32(a + 0xf, memOf(r[3])); m.w32(a + 0x13, memOf(r[4])); m.w32(a + 0x17, r[5]);
    m.w16(a + 0x1b, r[7]); m.w16(a + 0x1d, r[8]); m.w32(a + 0x1f, leap(r[8]));
    m.w8(a + 0x23, r[6]); m.w8(a + 0x24, r[2]);
  });
}

/** de kald, porten ikke selv laver, som spillet svarer på (ellers den oversatte funktion i cmGen/ eller buildWantMem's adaptere) */
const FORCE = new Set([0x7875e0, 0x7a7eb0, 0x8d0a70, 0x842c00, 0x4d6790, 0x4da590, 0x4d49a0, 0x4d6d70, 0x4d07e0, 0x8c16b0, 0x8c1af0, 0x8c38b0,
  0x8c5cf0, 0x8c5e40, 0x8c1870, 0x7549b0, 0x8c5410, 0x8c5430, 0x8c28c0, 0x8c2180, 0x8c1f80, 0x8c2060, 0x8cc5b0, 0x8c61e0, 0x7c5fe0, 0x896c60,
  0x53c190, 0x8b2880, 0x7f7270, 0x7a6e20, 0x7a6e30, 0x547a10, 0x547d90, 0x866f60, 0x944cf1, 0x944e46, 0x945667, 0x944c94, 0x9452ca]);

/** En dag af CONTRACT_MANAGER::daily_update 0x4c7ac0 for computerklubberne (sim.ts newDay og spilstarten) */
export function cmContractManagerDay(g: GameState): void {
  const ext = extQueue.filter((p) => g.players[p.id] === p && !!p.contract && !!p.cmContract && !!p.club && !!g.clubs[p.club]);
  extQueue = [];
  cmContractManagerRun(g, undefined, ext);
}

// ---------------------------------------------------------------- 0x5ce2d0's forlængelsesgren 0x5d188f–0x5d1eea
/** dagens spillere, der nåede 0x5d188f i 0x5ce2d0 (cmPlayerData.ts contractLengthDay D: rand(50) = 0 m.m.) – køres i dagens kontraktmanager */
let extQueue: Player[] = [];
contractExtHook.queue = (g, p) => { if (cmCmOn(g)) extQueue.push(p); };

const s8 = (v: number) => ((v << 24) >> 24);
const s16 = (v: number) => ((v << 16) >> 16);
const cl100 = (v: number) => (v > 100 ? 100 : v < -100 ? -100 : v);
const daysIso = (a: string, b: string) => dayNum(a) - dayNum(b);

/** 0x5ce2d0 0x5d188f–0x5d1eea for spilleren (staff st, kontrakt con i CONTRACT_MANAGER's hukommelse; spillets +0x44/+0x45 i c):
 *  ebx = Shortlist_Manager 0x849ce0(klub, staff, 0, 0) (trupplanens plads), r = 0x866620(kontrakten, staff) (1 under 50 % af det ønskede, 3 under 80 %, ellers 2).
 *  r = 2: flag 2 → +0x44 += 10, flag 2 ryddes.
 *  r = 1 (plads): uden flag 2 – kontrakten mindst 10·(Loyalty + 25) dage gammel; > 180 dage tilbage og 0x4ca470 = 7 → +0x44 −5; ældre end 31 (målmand 34)
 *    og +0x44 > −(Professionalism + Loyalty) → kun med højst 5·(Loyalty + 30) dage tilbage; under 21 og +0x3d < 2·Loyalty + 15 → kun med højst
 *    10·(25 − Loyalty) dage tilbage; menneskets klub (0x600a50(klub, 0, 1, 0, 0)) eller intet tilbud (0x4cda70(staff, 0, 0, −1, 1,0, art) – status 1:
 *    art = pladsens +0xf er ham, 2–6: art 0) → flag 2 (uden klager), ellers +0x44 −5. Med flag 2 – computerklub og (dag + id) % 45 = 0: tilbuddet
 *    (status 1–3 art som før, 4–6 art 0) → +0x44 +15; id % 8 = 0, kun flag 2, intet tilbud fra klubben (0x4cc9e0), nuværende omdømme > 5250,
 *    Ambition > 5, Temperament < 15, Sportsmanship < 15, Professionalism < 10, rand(14) = 0 → rand(10) = 0 ? klubben uven (0x547e70) : managerens
 *    uven (0x547af0); til sidst +0x44 −10.
 *  r = 3 (plads): uden flag 2 – mindst 10·(Loyalty + 25) dage gammel, +0x44 < −25, under 565 dage tilbage, Ambition > 10, Loyalty < 10,
 *    +0x3d > 75 og s16(25·(Ambition − 2·Loyalty) + 10·Pressure + verdensomdømme) > 6500 → menneskets klub eller intet tilbud (status 1: art som
 *    før, 2–3: art 0, ellers intet) → flag 2 (uden klager) ellers +0x44 −5. Med flag 2 – (dag + id) % 8 = 0, kun flag 2, intet tilbud fra klubben,
 *    omdømme > 5250, Ambition > 5, Temperament < 10, Sportsmanship < 15, Professionalism < 10, rand(14) = 0 → uven som ovenfor.
 *  Ikke porteret: nyheden 0xbc2 "vil have ny kontrakt" (0x4d9f80 – kun til klubbens indbakke; menneskets klub). */
function contractExt_5d188f(g: GameState, c: CmCtx, self: number, slm: number, p: Player, st: number, con: number, k: CmContract, rand: (n: number) => number): void {
  const m = c.m;
  const club = clubAt(m, m.s32(con + 4));
  const id = m.s32(st);
  const slot = c.call(0x849ce0, slm, club, st, 0, 0) >>> 0;
  const r = s8(contractSatisfaction_866620(c, con, st));
  const loy = s8(cmHid(p, 'loyalty')), amb = s8(cmHid(p, 'ambition')), pres = s8(cmHid(p, 'pressure')), prof = s8(cmHid(p, 'professionalism'));
  const sport = s8(cmHid(p, 'sportsmanship')), temp = s8(cmHid(p, 'temperament'));
  const age = s8(ageOn(p.dob, g.date));
  const start = p.contract!.cmStart ?? p.joined ?? p.cmJoined;
  const sinceStart = start ? daysIso(g.date, start) : 0x7fff;
  const left = daysIso(p.contract!.expires, g.date);
  const rep = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
  const worldRep = Math.round(rep[2] * 50);
  const human = () => humanClub_600a50(c, club, 0);
  const status = () => (m.u8(slot + 0x24) >> 1) & 0xf;
  const art = () => (m.s32(slot + 0xf) === id ? 1 : 0);
  const offer = (a: number) => offerContract_4cda70(c, self, st, 0, 0, -1, 1.0, a) !== 0;
  const add44 = (d: number) => { k.b44 = cl100(s8(k.b44) + d); m.w8(con + 0x44, k.b44); };
  const sync45 = () => m.w32(con + 0x45, k.b45);
  // 0x5d19e4: uden klager flag 2 (0x867700), ellers +0x44 −5 (0x5d1bc1)
  const noOffer = () => { if (k.b45 !== 0) add44(-5); else { withFlagCtx(g, p, rand, () => cmFlagSet(k, 2)); sync45(); } };
  // 0x4cc9e0: et tilbud fra klubben i CONTRACT_MANAGER's liste +0x34
  const hasOffer = () => {
    const L = m.u32(self + 0x34);
    if (!L) return false;
    m.w32(L + 0xa, m.u32(L + 2));
    for (let d = listNext_68d1b0(m, L); d; d = listNext_68d1b0(m, L)) if (m.s32(d) === id && m.s32(d + 4) === m.s32(con + 4)) return true;
    return false;
  };
  // 0x5d1aa6/0x5d1e71: uven med klubben eller managerens (0x4d9f80's nyhed før – ikke porteret)
  const grudge = (tempMax: number) => {
    if (hasOffer()) return;
    if (!(curRep(p) > 0x1482) || !(amb > 5) || !(temp < tempMax) || !(sport < 15) || !(prof < 10)) return;
    if (rand(14) !== 0) return;
    if (rand(10) !== 0) addDisPerson(p, personKey(managerStaff(g, p.club)), true, rand);
    else addDisClub(g, p, p.club, true, rand);
  };
  const day = s16(m.u16(G.TODAY));
  if (r === 2) {                                                            // 0x5d1b06
    if (!(k.b45 & 2)) return;
    add44(10);
    cmFlagClear(k, 2); sync45();
    return;
  }
  if (r === 1) {                                                            // 0x5d1b5a
    if (!slot) return;
    if (k.b45 & 2) {                                                        // 0x5d1d46
      if (!human()) {
        if ((day + id) % 45 === 0) {
          const s = status();
          if (s >= 1 && s <= 6 && offer(s <= 3 ? art() : 0)) add44(15);
        }
      }
      if ((id & 7) === 0 && k.b45 === 2) grudge(15);                         // 0x5d1e34
      add44(-10);                                                           // 0x5d1ec0
      return;
    }
    if (sinceStart < 10 * (loy + 25)) return;
    if (left > 0xb4 && s8(deservedStatus_4ca470(m, st, con)) === 7) { add44(-5); return; }
    const gk = p.pos[0] === 20;
    if (gk ? age > 0x22 : age > 0x1f) {                                     // 0x5d1bf6
      if (s8(k.b44) > s8(-(prof + loy)) && left > 5 * (loy + 30)) return;
    }
    if (age < 0x15 && s8(k.b3d) < s8(2 * loy + 15) && left > 10 * (25 - loy)) return;   // 0x5d1c2d
    if (human()) { noOffer(); return; }                                     // 0x5d1d0c
    const s = status();
    if (s === 0 || s > 6) return;
    if (offer(s === 1 ? art() : 0)) return;
    noOffer();
    return;
  }
  if (r !== 3) return;
  if (!slot) return;                                                        // 0x5d18c8
  if (k.b45 & 2) {                                                          // 0x5d1a47
    if (((day + id) & 7) !== 0 || k.b45 !== 2) return;
    grudge(10);
    return;
  }
  if (sinceStart < 10 * (loy + 25) || s8(k.b44) >= -25 || left >= 0x235 || amb <= 10 || loy >= 10 || s8(k.b3d) <= 75) return;
  if (s16(25 * (amb - 2 * loy) + 10 * pres + worldRep) <= 0x1964) return;
  if (!human()) {
    const s = status();
    if (s === 0 || s > 3) return;
    if (offer(s === 1 ? art() : 0)) return;
  }
  noOffer();
}

/** Staff_Records' forlængelsestilbud (add_league_champions_record 0x8692a7, add_promotion_record 0x869972, add_relegation_record 0x86a61a,
 *  add_cup_winners_record 0x86aee4, add_month_award_record 0x86cb5d, add_year_award_record 0x86c62d): kontrakten (0x4cf5f0) startede for mere
 *  end 300 dage siden (0x54cdb0: i dag − +0x25 > 0x12c), klubbens trupplan har ham (0x849ce0(klub, staff, 0, 0) ≠ 0 – pladsens +0xf = staff),
 *  så CONTRACT_MANAGER::offer_contract 0x4cda70(staff, 0, 0, −1, 0, 1,0, 1) – art 1: tilbuddet gives kun, når hans kontrakt løber mere end
 *  i dag + 365 + 150 dage (0x4cdd5a). Kaldt med det samme (samme dag og hukommelse som dagens kontraktmanager); de enkelte rekorders egne
 *  betingelser (trupstatus, kampe) står hos kalderne (cmMedia.ts, cmAwards.ts). */
export function cmContractRenewals(g: GameState, ps: Player[]): void {
  if (!ps.length || !cmCmOn(g)) return;
  const list = ps.filter((p) => cmCmScope(g, p));
  if (!list.length) return;
  cmContractManagerRun(g, list);
}

renewalHooks.offer = cmContractRenewals;

function cmContractManagerRun(g: GameState, renew?: Player[], ext?: Player[]): void {
  if (!cmCmOn(g)) return;
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const S: CmCmState = (g.cmCm ??= { dec: [], off: [], row: {} });
  const T = dayNum(g.date), A = date2330();
  // kandidaterne og de forfaldne beslutninger (ikke ved Staff_Records' tilbud – dér kun de nævnte spillere)
  const cands: Player[] = [];
  const due = new Set<number>();
  if (!renew) {
    for (const p of Object.values(g.players)) if (cmCmScope(g, p) && candidate(g, p, T, A)) cands.push(p);
    for (const d of S.dec) if (dayNum(dayIso(d[1], d[2])) <= T) due.add(d[0]);
  }
  const clubs = new Set<number>((renew ?? cands).map((p) => p.club));
  for (const p of ext ?? []) clubs.add(p.club);
  for (const pid of due) { const p = g.players[pid]; if (p?.club && g.clubs[p.club]) clubs.add(p.loan?.from ?? p.club); }
  if (!renew) CMD_STATS.days++;
  if (!clubs.size) { if (t0) CMD_STATS.ms += performance.now() - t0; return; }
  const signed: { p: Player; k: number }[] = [], released: Player[] = [], offered: [number, number][] = [];
  let M: WantMem | null = null;
  const byMem = new Map<number, Player>();
  const pOf = (st: number) => byMem.get(M!.c.m.s32(st));
  const rel = cmRand(g.seed ?? 0, T, 0x547a10);
  const call = (adr: number, a: number[]): number | undefined => {
    if (!FORCE.has(adr)) return undefined;
    const m = M!.c.m;
    switch (adr) {
      case 0x944cf1: case 0x944e46: return alloc(m, a[0]);
      case 0x945667: { const p = a[0] >>> 0, n = a[1], q = alloc(m, n); if (p) { const o = Math.min(m.u32(p - 4), n); for (let i = 0; i < o; i++) m.w8(q + i, m.u8(p + i)); } return q; }
      case 0x7875e0: return humanClub_600a50(M!.c, a[1] >>> 0) ? 1 : 0;
      case 0x7a7eb0: return pOf(a[1] >>> 0)?.cmRetire ? 1 : 0;
      case 0x866f60: return slCall(M!.c, 0x866f60, a[0] >>> 0);
      case 0x8c5cf0: case 0x8c5e40: case 0x8c1870: {
        // TRANSFER_MANAGER: spilleren er med i et bud/en handel (cmInDeal)
        const p = pOf(a[1] >>> 0);
        return p && cmInDeal(g, p) ? 1 : 0;
      }
      case 0x8c16b0: case 0x8c1af0: { const p = pOf(a[1] >>> 0); if (p && !released.includes(p)) released.push(p); return 0; }
      // Shortlist_Manager 0x842c00(staff, flag): i ønskelisternes hukommelse efter dagen (cmShortlistGame.ts cmSlOffer842c00)
      case 0x842c00: { const p = pOf(a[1] >>> 0); if (p) offered.push([p.id, a[2] | 0]); return 0; }
      case 0x8c38b0: {
        // sign_contract 0x4cf720 (via TRANSFER_MANAGER 0x8c38b0): tilbuddet bliver personens kontrakt
        const L = a[1] >>> 0, st = (m.u32(G.STAFF) + 0x6e * m.s32(L)) >>> 0, k = getContract(m, st), p = pOf(st);
        if (!k || !p) return 0;
        for (let i = 4; i < 0x50; i++) m.w8(k + i, m.u8(L + i));
        signed.push({ p, k });
        return 1;
      }
      // 0x547a10(staff, klubbens manager, 1) / 0x547d90(staff, klub, 1): forholdene (cmRelations.ts) – tilbuddet er fra hans egen klub
      case 0x547a10: { const p = pOf(a[0] >>> 0); if (p) addFavPerson(p, personKey(managerStaff(g, p.club)), true, rel); return 0; }
      case 0x547d90: { const p = pOf(a[0] >>> 0), cid = m.s32(a[1] >>> 0); if (p && g.clubs[cid]) addFavClub(g, p, cid, true, rel); return 0; }
    }
    return 0;
  };
  M = buildWantMem(g, clubs, { call, useLog: (adr) => adr === 0x600a50 || adr === 0x849f00 || FORCE.has(adr) });
  const { W, c } = M;
  const m = c.m;
  M.setRand(renew ? cmRand(g.seed ?? 0, T, 0x868c50, renew[0].id) : cmRand(g.seed ?? 0, T, 0x4c7ac0));
  const memId = new Map<number, number>();
  for (const [p, st] of W.players) { const id = m.s32(st); byMem.set(id, p); memId.set(p.id, id); }
  const memOf = (pid: number) => (pid > -1 ? memId.get(pid) ?? (g.players[pid] && !g.players[pid].regen && pid < 1_000_000 ? pid : -1) : -1);
  // globalerne: spillet er lavet, spilstarten, [0xae2330]
  m.w32(0xdd711c, 1);
  { const [d, y] = isoDay(g.cmFitStart ?? g.date); m.w16(0xdd6ec8, d); m.w16(0xdd6eca, y); m.w32(0xdd6ecc, leap(y)); }
  { const [d, y] = isoDay(isoOf(A)); m.w16(0xae2330, d); m.w16(0xae2332, y); m.w32(0xae2334, leap(y)); }
  m.w32(G.TODAY + 4, leap(+g.date.slice(0, 4)));
  for (const cid of clubs) writeSlots(g, m, cid, memOf);
  // kontrakterne: +0x25 start, +0x35 type, +0x49, rækkens +0xb; værdien +0x52 (0x4d0c60 som 0x4c7ec5)
  for (const [p, st] of W.players) {
    const k = W.contractOf(p);
    if (!k || !p.contract) continue;
    if (p.contract.cmStart) { const [d, y] = isoDay(p.contract.cmStart); m.w16(k + 0x25, d); m.w16(k + 0x27, y); m.w32(k + 0x29, leap(y)); }
    if (p.contract.cmType) m.w8(k + 0x35, (m.u8(k + 0x35) & 0xc0) | p.contract.cmType);
    if (p.contract.cmB49) m.w8(k + 0x49, 1);
    const rb = S.row[p.id];
    if (rb) m.w8(m.u32(G.ROWS) + 79 * m.s32(st) + 0xb, rb);
    const cl = clubAt(m, m.s32(k + 4));
    m.w32(st + 0x52, slCall(c, 0x4d0c60, 0, st, cl, 0, -1, humanClub_600a50(c, cl) ? 1 : 0) | 0);
  }
  // CONTRACT_MANAGER (this = [0xae1050]): beslutningsdatoerne (+0xc/+0x10/+0x14/+0x18/+0x1c) og tilbudslisten +0x34
  const self = m.u32(G.CM);
  const ph = new Map<number, number>();                                       // pladsholdere for ikke-byggede spillere
  {
    const n = S.dec.length, cap = n + 0x64, arr = alloc(m, cap * 0xe);
    S.dec.forEach((d, i) => {
      const ea = arr + 0xe * i;
      let id = memId.get(d[0]);
      if (id === undefined) { id = 0x7f000000 + i; ph.set(id, d[0]); }
      m.w32(ea, id); m.w16(ea + 4, d[1]); m.w16(ea + 6, d[2]); m.w32(ea + 8, leap(d[2])); m.w8(ea + 0xc, d[3]); m.w8(ea + 0xd, d[4]);
    });
    m.w32(self + 0xc, arr); m.w32(self + 0x10, cap); m.w32(self + 0x14, n); m.w32(self + 0x18, 0); m.w32(self + 0x1c, 0);
    m.w32(self + 0x28, 0); m.w32(self + 0x2c, 0);
  }
  const kept: [number, string][] = [];
  {
    const L = alloc(m, 0xe);
    listInit_68d020(m, L);
    m.w32(self + 0x34, L);
    const buf = alloc(m, 0x70);
    for (const [pid, hex] of S.off) {
      const id = memId.get(pid);
      if (id === undefined) { kept.push([pid, hex]); continue; }
      for (let i = 0; i < 0x6f; i++) m.w8(buf + i, parseInt(hex.slice(2 * i, 2 * i + 2), 16));
      m.w32(buf, id);
      listAdd_68d0d0(c, L, buf, 0x6f);
      const ra = m.u32(G.ROWS) + 79 * id + 8;
      m.w8(ra, m.u8(ra) + 1);
    }
  }
  // Staff_Records' tilbud (cmContractRenewals): i kalderens rækkefølge, med dagens faste datoer (tidspunkt 0: [0xae1068] = i dag + 365)
  if (renew) {
    m.w8(G.SLICE, 2);
    m.w8(G.B_AE233C, cmAfter2330(g.date, false));
    fixedDates_4c7ac0(m, G.TODAY);
    const slm = m.u32(m.u32(0xde1f54) + 0x856);
    for (const p of renew) {
      const st = W.staffOf(p);
      const con = st ? getContract(m, st) : 0;
      if (!con) continue;
      if (!(daysSince_54cdb0(m, G.TODAY, { d: m.s16(con + 0x25), y: m.u16(con + 0x27), x: m.u32(con + 0x29) }) > 0x12c)) continue;
      const club = clubAt(m, m.s32(con + 4));
      if (!club || !c.call(0x849ce0, slm, club, st, 0, 0)) continue;
      offerContract_4cda70(c, self, st, 0, 0, -1, 1.0, 1);
    }
  }
  // 0x5ce2d0's forlængelsesgren 0x5d188f for dagens spillere (0x5cccd0 – tidspunkt 0, før 0x4c7ac0's tidspunkter), i personernes rækkefølge
  if (ext?.length) {
    m.w8(G.SLICE, 0);
    m.w8(G.B_AE233C, cmAfter2330(g.date, true));
    fixedDates_4c7ac0(m, G.TODAY);
    const slm = m.u32(m.u32(0xde1f54) + 0x856);
    for (const p of ext) {
      const st = W.staffOf(p);
      const con = st ? getContract(m, st) : 0;
      if (!con || !p.cmContract) continue;
      contractExt_5d188f(g, c, self, slm, p, st, con, p.cmContract, cmRand(g.seed ?? 0, p.id, T, 0x5d188f));
    }
  }
  // de tre tidspunkter (0: de faste datoer, 2: personløkken – kun kandidaterne, i id-rækkefølge)
  const only = cands.map((p) => W.staffOf(p)).filter((st) => st).sort((a, b) => m.s32(a) - m.s32(b));
  if (!renew) for (let slice = 0; slice <= 2; slice++) {
    m.w8(G.SLICE, slice);
    m.w8(G.B_AE233C, cmAfter2330(g.date, slice === 0));
    contractDailyUpdate_4c7ac0(c, G.TODAY, slice, 1, slice === 2 ? only : []);
  }
  // tilbage i spillet: kontrakterne (type, +0x49, +0x4e), rækkerne, tilbuddene og beslutningerne
  for (const [p, st] of W.players) {
    const k = W.contractOf(p);
    if (!k || !p.contract || !cmCmScope(g, p)) continue;
    const t = m.u8(k + 0x35) & 0x3f;
    if (t === 1 && p.contract.cmType !== 1) CMD_STATS.expired++;
    if (t === 2) delete p.contract.cmType; else p.contract.cmType = t;
    if (m.u8(k + 0x49)) p.contract.cmB49 = 1; else delete p.contract.cmB49;
    if (p.cmContract) p.cmContract.b4e = m.u8(k + 0x4e);
    const rb = m.u8(m.u32(G.ROWS) + 79 * m.s32(st) + 0xb);
    if (rb) S.row[p.id] = rb; else delete S.row[p.id];
  }
  const offs: [number, string][] = [...kept];
  const L = m.u32(self + 0x34);
  m.w32(L + 0xa, m.u32(L + 2));
  for (let d = listNext_68d1b0(m, L); d; d = listNext_68d1b0(m, L)) {
    const p = byMem.get(m.s32(d));
    if (!p) continue;
    let h = '00000000';
    for (let i = 4; i < 0x6f; i++) h += m.u8(d + i).toString(16).padStart(2, '0');
    offs.push([p.id, h]);
  }
  const dec: number[][] = [];
  for (let i = m.s32(self + 0x18), arr = m.u32(self + 0xc); i < m.s32(self + 0x14); i++) {
    const ea = arr + 0xe * i, id = m.s32(ea);
    if (id === -1) continue;
    const pid = ph.get(id) ?? byMem.get(id)?.id;
    if (pid === undefined) continue;
    dec.push([pid, m.s16(ea + 4), m.u16(ea + 6), m.u8(ea + 0xc), m.u8(ea + 0xd)]);
  }
  // underskrifterne: originalens kontrakt i spillets enheder
  for (const { p, k } of signed) applySigned(g, p, m, k);
  // frigivelserne: fri transfer 0x8c1af0 (spilleren forlader klubben uden kontrakt) – historikposten art 3 (+0x10 = −1, +0x14 = klubben, +0x18 = 0)
  for (const p of released) {
    if (!p.club) continue;
    recordFreeTransfer(g, p);
    setClub(p, 0, { fee: 0, kind: 1 });   // 0x8c1ca5: 0x7c5fe0(staff, 0, 0, −1, …) – "Free" i Playing Career
    p.contract = null;
    CMD_STATS.released++;
  }
  // ryd op: spillere uden for området har ingen tilbud/beslutninger
  const live = (pid: number) => { const p = g.players[pid]; return !!p && cmCmScope(g, p); };
  S.off = offs.filter(([pid]) => live(pid));
  S.dec = dec.filter((d) => live(d[0]));
  for (const k of Object.keys(S.row)) if (!live(+k)) delete S.row[+k];
  CMD_STATS.cand += cands.length; CMD_STATS.clubs += clubs.size; CMD_STATS.signed += signed.length;
  if (t0) CMD_STATS.ms += performance.now() - t0;
  cmSlOffer842c00(g, offered.filter(([pid]) => g.players[pid]?.club));
}

/** Kontrakten (80 bytes) efter sign_contract som spillets kontrakt; Signing On Fee betales af klubben, moralen +20 (cmMedia.ts) */
function applySigned(g: GameState, p: Player, m: CmMem, k: number): void {
  const club = g.clubs[p.club];
  if (!club || !p.contract) return;
  const GBP = cmGbp(g, p.club);
  const eur = (v: number) => Math.max(0, Math.round(v / GBP));
  const cl = [0, 1, 2, 3, 4].map((i) => m.u8(k + 0x1c + i));
  const t: CmTerms = {
    wage: eur(m.s32(k + 0xc)), expires: dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)), signOn: eur(m.s32(k + 8)),
    bonusGbp: [m.s32(k + 0x10), m.s32(k + 0x14), m.s32(k + 0x18)], clauses: cl, clauseFee: cl.some((x) => x) ? eur(m.s32(k + 0x21)) : 0,
    partTime: (m.u8(k + 0x35) & 0x80) !== 0, offered: true, raw: { wage: m.s32(k + 0xc), value: 0 }, gbp: GBP,
  };
  const c: Contract = { wage: t.wage, expires: t.expires };
  applyCmTerms(c, t);
  c.cmStart = g.date;
  p.contract = c;
  const status = (m.u8(k + 0x4f) >> 4) & 0xf;
  p.cmContract = { ...newCmContract(status || statusCode(p)), b4e: m.u8(k + 0x4e), b4f: m.u8(k + 0x4f) };
  // TRANSFER_MANAGER 0x8c38b0 (0x8c39b2–0x8c39c4): efter sign_contract 0x4cf720 Finance::add_signing_on 0x5998e0 med kontraktens +8 –
  // blok +0x9c/+0x13c og saldoen. Før blev saldoen trukket, men blokken (View Finances: Signing On Fees) stod på 0 for forlængelser og frie spillere.
  const son = m.s32(k + 8);
  if (son > 0) { const e = son / GBP; club.balance -= e; club.finance.signOn = (club.finance.signOn ?? 0) + e; bookBlock(g, club, FK.signOn, son); }
  cmSignContractMorale(g, p);
}
