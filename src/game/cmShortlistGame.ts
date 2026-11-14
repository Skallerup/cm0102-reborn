// Computerklubbernes ønskelister (Shortlist_Manager, [[0xde1f54] + 0x856]) på spillets data – kun den originale database i ægte tilstand
// (cmActive). 14/11-2026. De mekanisk oversatte funktioner (cmGen/, ~/cm0102-engine/tools/x86ts.py) kører uændret på originalens hukommelse,
// bygget af spiltilstanden (cmContractGame.ts buildWantMem med `full`: alle klubber, de klubløse, værdien +0x52, staben på deres pladser):
//
//   0x83b6e0 allocate_transfer_budget   transferbudgettet 0x598800 fordelt på klubbens åbne pladser (+7), og 0x83f3a0 fill_shortlist_slot finder
//                                       pladsens mål (+0xf) i positionslisterne – 0x840d80 value_player_for_club, asking price 0x4d1600,
//                                       viljen 0x846920, arbejdstilladelsen 0x84b180 …
//   0x84a020 make_club_bids             (ugentligt; dagligt for omdømme > 6250) buddene på pladsernes mål: build_bid 0x8e5d60 (beløb og klausuler),
//                                       0x8be300 add_transfer_offer → spillets bud (cmShortlistApply i transfers.ts), lejebud 0x842740/0x8bed60,
//                                       frie spillere 0x85fc50/0x4cda70
//   0x844540 count_slots_with_bids      0x5cccd0's port (dailyGate) og de forældede budmærker (20 dage)
//   0x842180 collect_interested_clubs   Interested-rækken på spillerens Transfer-fane (her i TS: parrene + pladsens +7 mod værdien +0x52)
//   0x4d1600 calc_asking_price          udbudsprisen (cmAskingPrice) – computerens svar på bud 0x8c8090 (transfers.ts cmAiAnswer)
//
// Trupplanen 0x83cb40 er håndporteret (cmSquadPlan.ts, nu med halen 0x83e9bd–0x83ebe9: +3/+7/+0xb); dens pladser gemmes i GameState.cmPlan
// (12 tal pr. plads), parrene (spiller, klub) i GameState.cmSlPairs. Positionslisterne 0x839e60 bygges af hukommelsen ved hver kørsel og
// sorteres som 0x83a780 (begge håndporteret her – de kører på ~60.000 poster).
//
// *Estimeret* (spillet har ikke tilstanden): positionslisterne bygges hver dag i stedet for hver 30. dag, og deres rækkefølge før sorteringen er
// id-rækkefølgen (lige nøgler kan derfor stå anderledes end i originalen, der sorterer gårsdagens liste); stabens pladser (rolle 6–10) får klubbens
// nuværende stab som indehaver (0x69d1b0's vurdering af stabsfolk er ikke porteret – stabsansættelser går ikke gennem ønskelisten hos os);
// TRANSFER_MANAGER's tilbud er spillets åbne bud (uden rival- og forhandlingslister); skaderne 0x62ed70 fra konditionsmodulet; arbejdstilladelsen
// 0x8c7950 = rules2001.ts permitOk; lejeregler 0x8d0040 = rules2001.ts loanBlocked; spillerens svar på et kontrakttilbud til en fri spiller
// kommer straks (originalen venter på hans beslutningsdato 0x4cd230).
import type { GameState, Player } from './types';
import { type CmCtx, type CmMem, G, getContract, clubAt, type SparseMem } from './cmMem';
import { buildSlWantMem, slMemPages, SLMEM_DEFER } from './cmSlMem';
import { buildWantMem, type WantMem } from './cmContractGame';
import { cmActive, cmRand, clubRepMem, nationRepMem } from './cmPlayerData';
import { slCall } from './cmShortlist';
import { playerValue_4d0c60, knowsNation_53d980, seenRep_5407e0, knowledge_5408c0 } from './cmValue';
import { contractForClub_4cf5f0, expiryBand_867d30, setToDesiredContract_85fc50, hasActiveReleaseClause_867b50 } from './cmContractWant';
import { addDays_54c5b0, subDays_54c8e0, listRemove_68d1f0 } from './cmContract';
import { entryOf, storeEntry, fromRow } from './cmSquadPlanGame';
import { newPlanEntry, type PlanEntry } from './cmSquadPlan';
import { registerImpl, enter, QSORT_CMP, SHARED, PC_HOOK, stackBelow, type X86 } from './cmGen/x86';
import { GEN } from './cmGen/index';
import { humanClub_600a50 } from './cmWageGame';
import { ensureImpls } from './cmGen/impls';
import { isHumanClub } from './humans';
import { ageOn } from './dates';
import { ATTRS } from './attributes';
import { workPermitGranted, loanBlocked } from './rules2001';
import { cmFitRead } from './cmFitnessGame';
import { aiPickCtx, roleDataOf, playerRecord } from './engine/grid/aiTeam';
import { planScore, type ManagerBlockIn } from './engine/grid/planScore';
import type { Day } from './engine/grid/roleScore';
import { nationLanguage, playerLanguages } from './languages';
import { dislikesClub, dislikesPerson, favoursClub, favoursPerson, managerStaff } from './cmRelations';

const GBP = 0.86;
const SLOTS0 = 0x5f100000, OFFERS0 = 0x5e800000, OREC0 = 0x5e900000, INJ0 = 0x5e780000, LISTS0 = 0x61000000;
const SLOT = 0x25, NSLOT = 40;
const BRITISH = new Set(['ENG', 'SCO', 'WAL', 'NIR', 'IRL']);
const dayOf = (iso: string): Day => { const d = new Date(iso.slice(0, 10) + 'T00:00:00Z'), y = d.getUTCFullYear(); return { day: Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000), year: y }; };
const dayNum = (iso: string) => Math.round(Date.parse(iso.slice(0, 10) + 'T00:00:00Z') / 86400000);
const isoOf = (day: number, year: number) => new Date(Date.UTC(year, 0, 1) + day * 86400000).toISOString().slice(0, 10);
const leapY = (y: number) => (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 1 : 0);
const sh = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;

/** ønskelisterne kører (den originale database i ægte tilstand, ikke draft) */
const ENV = typeof process !== 'undefined' ? process.env ?? {} : {};
/** Ønskelisterne er SLÅET FRA i spillet (14/11-2026): de finder mål som originalen (spilstarten 300 mål i 172 klubber mod originalens 258 i
 *  137 – scripts/cm-shortlist.ts / cm-shortlist-orig.ts; udbudsprisen 0x4d1600 median 1,00 × originalens), men en hel sæson koster ~0,49 s pr.
 *  dag (målet er ≤ 0,3 s; de første 45 dage ~0,3 s – scripts/cm-sl-bench.ts, scripts/ct-season-game.ts; runde 5: trupplanernes 0x83b6e0 →
 *  0x83f3a0 er ~0,2 s pr. dag i sæsonen) – se docs/ENGINE_PORT_PLAN.md "Ønskelisterne". Slås til i måleværktøjerne med CM_SL=1 (og i spillet med SL_ON.on = true). */
export const SL_ON = { on: ENV.CM_SL === '1' };
/** ønskelisterne kører (den originale database i ægte tilstand, ikke draft, og SL_ON) */
export const cmShortlistOn = (g: GameState) => SL_ON.on && cmActive(g) && !g.draft;

// ---------------------------------------------------------------- begivenhederne, transfers.ts udfører

export interface SlBid {
  kind: 'bid';
  /** spillets bud-id (det, pladsens +0x17 peger på) */
  id: number; buyer: number; player: number;
  /** £ */
  fee: number; loan: boolean;
  months: number; sellOn: number; lgFee: number; lgApps: number; intFee: number; intApps: number; pub: number;
  /** 0x840d80's værdisætning (£) – det, køberen højst vil give (0x8c0810) */
  max: number;
  /** svartiden 0x8cc5b0 → schedule_offer 0x8c6220: dage til sælgerens svar (0 = samme dag) */
  days: number;
}
export interface SlFree { kind: 'free'; buyer: number; player: number }
export type SlEvent = SlBid;

// ---------------------------------------------------------------- hukommelsen

export interface SlMem {
  M: WantMem; m: CmMem; c: CmCtx; g: GameState;
  slm: number;
  /** spillets id → hukommelsens id og omvendt */
  memOf: { get(pid: number): number | undefined }; byMem: { get(id: number): Player | undefined };
  clubAdr: (cid: number) => number;
  events: SlEvent[];
  /** klubberne, hvis pladser er skrevet i hukommelsen */
  slotted: Set<number>;
  /** planValue: aiPickCtx pr. klub og playerRecord pr. spiller (uændrede, mens hukommelsen lever) */
  cache?: { ctx: Map<number, ReturnType<typeof aiPickCtx> | object>; rec: Map<number, number[]>; day: { today: Day; yearAgo: Day } | null;
    pl: Map<number, { joined: Day; age: number; pLang: ReturnType<typeof nationLanguage>; langs: ReturnType<typeof playerLanguages> }>;
    cl: Map<number, { lang: ReturnType<typeof nationLanguage> | null; mg: ReturnType<typeof managerStaff> | null; np: number[] | null }>;
    rd: Map<string, ReturnType<typeof roleDataOf>> };
  /** spillerne pr. klub (refreshClub) */
  byClub?: Map<number, [Player, number][]>;
}

/** 0x844300 shortlist_staff_fits_slot_position: spillerposten (+0x61) har ≥ 15 på positionen/siden; 15 = en ikke-spiller med post */
function fitsSlot(m: CmMem, st: number, pos: number, count: number, humanClub: (club: number) => boolean): boolean {
  const r = m.u32(st + 0x61);
  if (!r && pos !== 15) return false;
  const b = (o: number) => s8(m.u8(r + o)) >= 15;
  switch (pos) {
    case 0: return b(0xf);
    case 1: return b(0x10) && b(0x19);
    case 2: return b(0x11) && b(0x18);
    case 3: return b(0x11) && b(0x17);
    case 4: return b(0x11) && b(0x19);
    case 5: return b(0x16) && b(0x18);
    case 6: return b(0x12) && b(0x19);
    case 7: return b(0x16) && b(0x17);
    case 8: return b(0x13) && b(0x18);
    case 9: return b(0x13) && b(0x19);
    case 10: return b(0x13) && b(0x17);
    case 11: return b(0x14) && b(0x18);
    case 12: return b(0x14) && b(0x19);
    case 13: return b(0x14) && b(0x17);
    case 14: return b(0x15);
    case 15: {
      const club = m.u32(st + 0x39), job = m.u8(st + 0x3d);
      if (club && (job === 0xb || job === 0xf || job === 0xd) && humanClub(club)) return false;
      return !!m.u32(st + 0x69) && m.s32(st) < count - 16;
    }
  }
  return false;
}

/** 0x839e60 build_position_lists (de to lister à 12 bytes pr. position: id, landets id, værdien +0x52 / kontraktens +0x3d) og 0x83a780
 *  sort_position_lists (nøglerne af dagens data, qsort 0x945333 med 0x83b670) – i TS på hukommelsen */
function buildPositionLists(S: SlMem): void {
  const { m, slm, c } = S;
  const count = m.s32(G.STAFF_COUNT), base = m.u32(G.STAFF);
  // (0x600a50 er uden sidevirkninger her – svaret gemmes pr. klub, mens listerne bygges)
  const humanMemo = new Map<number, boolean>();
  const human = (club: number) => { let v = humanMemo.get(club); if (v === undefined) { v = slCall(c, 0x600a50, 0, club, 0, 1, 0, 0) !== 0; humanMemo.set(club, v); } return v; };
  const ids: number[][] = Array.from({ length: 16 }, () => []);
  const loaded = loadedFilter(S.g);
  for (let id = 0; id < count - 16; id++) {
    const st = (base + 0x6e * id) >>> 0;
    // (hastighed: de ikke indlæste først – så læses deres poster ikke, og siderne kopieres ikke fra den varige hukommelse)
    const p = S.byMem.get(id);
    if (p && !loaded(p)) continue;                                           // ikke i originalens hukommelse (se loadedFilter)
    if (m.s32(st) !== id) continue;                                          // ingen post (ikke bygget)
    // (fitsSlot for alle 16 positioner med spillerpostens bytes læst én gang)
    const r = m.u32(st + 0x61);
    if (r) {
      const q = (o: number) => s8(m.u8(r + o)) >= 15;
      const f = q(0xf), g0 = q(0x10), h = q(0x11), i2 = q(0x12), j = q(0x13), k = q(0x14), l = q(0x15), t16 = q(0x16), t17 = q(0x17), t18 = q(0x18), t19 = q(0x19);
      if (f) ids[0].push(id);
      if (g0 && t19) ids[1].push(id);
      if (h && t18) ids[2].push(id);
      if (h && t17) ids[3].push(id);
      if (h && t19) ids[4].push(id);
      if (t16 && t18) ids[5].push(id);
      if (i2 && t19) ids[6].push(id);
      if (t16 && t17) ids[7].push(id);
      if (j && t18) ids[8].push(id);
      if (j && t19) ids[9].push(id);
      if (j && t17) ids[10].push(id);
      if (k && t18) ids[11].push(id);
      if (k && t19) ids[12].push(id);
      if (k && t17) ids[13].push(id);
      if (l) ids[14].push(id);
    }
    if (fitsSlot(m, st, 15, count, human)) ids[15].push(id);
  }
  let cap = 0;
  for (const l of ids) cap = Math.max(cap, l.length);
  m.w32(slm + 0xd8, cap);
  let a = LISTS0;
  const today = G.TODAY;
  const perId = new Map<number, { natId: number; k: number; band: number }>();
  for (let pos = 0; pos < 16; pos++) {
    const A = a, B = a + 12 * cap; a = B + 12 * cap;
    m.w32(slm + 0x18 + 4 * pos, A); m.w32(slm + 0x58 + 4 * pos, B); m.w32(slm + 0x98 + 4 * pos, ids[pos].length);
    const n = ids[pos].length;
    const kaI = new Int32Array(n), kaN = new Int32Array(n), kaV = new Int32Array(n), kbV = new Int32Array(n);
    let j = 0;
    for (const id of ids[pos]) {
      const st = (base + 0x6e * id) >>> 0;
      // (landet, kontrakten og 0x867d30 er de samme for alle personens positioner – slået op én gang; listerne skriver intet, de læser)
      let pc = perId.get(id);
      if (!pc) {
        const nat = m.u32(st + 0x1a), own = getContract(m, st), club = own ? (m.u32(G.CLUBS) + 0x245 * m.s32(own + 4)) >>> 0 : 0;
        const k = contractForClub_4cf5f0(c, st, club);
        pc = { natId: nat ? m.s32(nat) : 0, k, band: k ? expiryBand_867d30(m, k) : -1 };
        perId.set(id, pc);
      }
      const natId = pc.natId, k = pc.k;
      // 0x83a780: liste A
      let va: number;
      const value = m.s32(st + 0x52);
      if (pos === 15) va = value;
      else if (k && pc.band === 0) {
        va = value;
        const sc = m.u32(st + 0x39);
        if (sc && human(sc) && (m.u8((k + 0x4e) >>> 0) & 1)) {
          va = (va - 1_500_000) | 0;
          const third = Math.trunc(value / 3);
          if (va < third) va = third;
        }
      } else va = 0;
      kaI[j] = id; kaN[j] = natId; kaV[j] = va;
      if (pos === 15) { kbV[j++] = k ? s8(m.u8(k + 0x3d)) : 100; continue; }   // (0x83a7f7: B rører ikke pos 15 – byggeværdien)
      // liste B
      let vb = 2000;
      const pr = m.u32(st + 0x61), sc = m.u32(st + 0x39);
      if (pr && sc) {
        const div = m.u32(sc + 0x57);
        if (div && (m.u32(m.u32(0xadadfc) + 4 * m.s32(div)) !== 0 || m.s16(sc + 0x80) >= 6000)) {
          if (k) { const f = m.u8(k + 0x4e); vb = f & 2 ? -1000 : f & 9 ? 2000 : s8(m.u8(k + 0x3d)); }
        }
      }
      kbV[j++] = vb;
    }
    void today;
    // qsort 0x945333 med 0x83b670 (+8, så +4) – MSVC-qsort'en (subs.ts msvcQsort) på tal i stedet for poster i hukommelsen
    writeSorted(m, A, kaI, kaN, kaV, sortMemo(S.g, 2 * pos)); writeSorted(m, B, kaI, kaN, kbV, sortMemo(S.g, 2 * pos + 1));
  }
  void a;
}
/** De spillere, originalen har i hukommelsen (og dermed i positionslisterne): originalen indlæser kun de valgte landes klubber og et udvalg af
 *  resten (pre-194-2001.bin med England valgt: 8.904 personer; spillets world-fil har 37.399 spillere). Målt med scripts/cm-loaded.ts:
 *  de aktive landes spillere (også de skjulte ligaer), og af de øvrige alle med CA ≥ 150 (378/378) og de aktive landes egne statsborgere
 *  (70/104); af resten kun 2–3 % (≈ 700 af 31.000 – reglen er ikke fundet; *estimeret*: udeladt). World-filens frie spillere er ikke i
 *  originalen (0/313 parret på navn og fødselsdato) – de frie tæller kun med, når de har forladt en klub i et aktivt land. */
function loadedFilter(g: GameState): (p: Player) => boolean {
  const active = new Set(g.activeNations);
  return (p) => {
    if (p.ca >= 150 || active.has(p.nation) || (p.cmNation2 !== undefined && active.has(p.cmNation2))) return true;
    const home = p.loan?.from ?? p.club;
    // de frie: kun dem, der har forladt en klub i et aktivt land (spilstartens frie i world-filen er ikke i originalen – 0/313 parret på navn)
    const c = home ? g.clubs[home] : g.clubs[p.moves?.[p.moves.length - 1]?.from ?? -1];
    return !!c && active.has(c.nation);
  };
}
/** (hastighed, 14/11) spillere, hvis poster ingen læser, før deres klubs trupplan eller bud kører: ikke i positionslisterne (loadedFilter), ikke i
 *  parrene, og deres klub (eller den, de er udlejet fra) er ikke menneskets – udlandets ~35.000 spillere. Deres poster i ønskelisternes hukommelse
 *  er gårsdagens (cmSlMem.ts `stale`), indtil klubben kører i dag (touchClub – de skjulte ligaers klubber uden trupplan aldrig). Kontrol:
 *  scripts/cm-sl-stalecheck.ts (ingen læsning af en byte, der afviger fra den friske hukommelse) og cm-sl-bench.ts. CM_SL_STALE=0 slår det fra. */
function staleOk(g: GameState): (p: Player, cid: number) => boolean {
  const loaded = loadedFilter(g), plan = g.cmPlan ?? {};
  const inPairs = new Set((g.cmSlPairs ?? []).map(([pid]) => pid));
  void plan;
  return (p, cid) => !(cid && isHumanClub(cid)) && !inPairs.has(p.id) && !loaded(p);
}
/** klubbens udskudte spillere (staleOk) skrives i dagens hukommelse, før noget i klubben kører (refreshClub, makeBids), og
 *  kontraktens +0x4e |= 4 som writeValues for computerens spillere */
export function touchClub(S: SlMem, cid: number, pids?: Set<number>): void {
  const f = (S.M as { refreshClub?: (cid: number, pids?: Set<number>) => number[] }).refreshClub;
  if (!f) return;
  const { m, c } = S;
  const sts = f(cid, pids);
  // (kontrollen: touchClub's egne læsninger og skrivninger er refreshClub's – skyggen har writeValues' værdier)
  SLMEM_DEFER.inRefresh = true;
  for (const st of sts) {
    const k = getContract(m, st), club = k ? clubAt(m, m.s32(k + 4)) : 0;
    // (writeValues: uden kontrakt (eller klub) +0x52 = 0; computerens kontrakter |= 4 og værdien udskudt – lazyValues)
    if (k && club && m.s32(club) === m.s32(k + 4)) { if (!humanClub_600a50(c, club)) m.w8(k + 0x4e, m.u8(k + 0x4e) | 4); }
    else m.w32(st + 0x52, 0);
  }
  SLMEM_DEFER.inRefresh = false;
}
/** scripts/cm-sl-stalecheck.ts: dagens hukommelse (med gårsdagens poster) og en frisk skygge (uden), som kontrollen skriver dagens skrivninger i
 *  (ikke refreshClub's) og sammenligner hver læsning med */
export const STALECHECK = { on: false, mem: null as SparseMem | null, shadow: null as SparseMem | null, days: 0 };
function staleCheck(g: GameState, M: WantMem, call: (adr: number, a: number[]) => number | undefined, useLog: (adr: number) => boolean): void {
  const all = Object.keys(g.clubs).map(Number);
  const prev = ENV.CM_SL_INCR;
  ENV.CM_SL_INCR = '0';
  const ids = SLMEM_DEFER.ids;
  SLMEM_DEFER.ids = null;
  const O = buildSlWantMem(g, all, { call, useLog });
  SLMEM_DEFER.ids = ids;
  ENV.CM_SL_INCR = prev;
  STALECHECK.shadow?.release();
  STALECHECK.mem = M.c.m as SparseMem; STALECHECK.shadow = O.c.m as SparseMem; STALECHECK.days++;
}
const KSORT = ENV.CM_SL_KSORT !== '0';
/** MSVC 6 qsort.c som i writeSorted, med nøglerne flyttet sammen med indekserne (samme sammenligninger og ombytninger, uden opslag gennem a[]) */
function sortKeyed(a: Int32Array, K0: Float64Array): void {
  const n = a.length;
  if (n < 2) return;
  const k = new Float64Array(n);
  for (let i = 0; i < n; i++) k[i] = K0[a[i]];
  const lostk = new Int32Array(64), histk = new Int32Array(64);
  let sp = 0, lo = 0, hi = n - 1;
  for (;;) {
    const size = hi - lo + 1;
    if (size <= 8) {
      let h = hi;
      while (h > lo) {
        let max = lo, km = k[lo];
        for (let p = lo + 1; p <= h; p++) if (k[p] - km > 0) { max = p; km = k[p]; }
        if (max !== h) { const t = a[max]; a[max] = a[h]; a[h] = t; const u = k[max]; k[max] = k[h]; k[h] = u; }
        h--;
      }
    } else {
      const mid = lo + (size >> 1);
      if (mid !== lo) { const t = a[mid]; a[mid] = a[lo]; a[lo] = t; const u = k[mid]; k[mid] = k[lo]; k[lo] = u; }
      let loguy = lo, higuy = hi + 1;
      const kp = k[lo];
      for (;;) {
        do loguy++; while (loguy <= hi && k[loguy] - kp <= 0);
        do higuy--; while (higuy > lo && k[higuy] - kp >= 0);
        if (higuy < loguy) break;
        if (loguy !== higuy) { const t = a[loguy]; a[loguy] = a[higuy]; a[higuy] = t; const u = k[loguy]; k[loguy] = k[higuy]; k[higuy] = u; }
      }
      if (lo !== higuy) { const t = a[lo]; a[lo] = a[higuy]; a[higuy] = t; const u = k[lo]; k[lo] = k[higuy]; k[higuy] = u; }
      if (higuy - 1 - lo >= hi - loguy) {
        if (lo + 1 < higuy) { lostk[sp] = lo; histk[sp++] = higuy - 1; }
        if (loguy < hi) { lo = loguy; continue; }
      } else {
        if (loguy < hi) { lostk[sp] = loguy; histk[sp++] = hi; }
        if (lo + 1 < higuy) { hi = higuy - 1; continue; }
      }
    }
    if (!sp) break;
    lo = lostk[--sp]; hi = histk[sp];
  }
}
/** listen (id, landet, værdien) sorteret som qsort 0x945333 med 0x83b670: MSVC 6 qsort.c (subs.ts msvcQsort) på en indeksliste – samme
 *  ombytninger, sammenligningen (+8, så +4, som int32-forskelle) direkte på tallene; så skrevet i hukommelsen à 12 bytes */
/** (hastighed) gårsdagens sortering pr. liste: er listen (id, land, værdi i samme rækkefølge) den samme, er ombytningerne de samme */
interface SortMemo { I: Int32Array; N: Int32Array; V: Int32Array; a: Int32Array }
const SORT_MEMO = new WeakMap<GameState, (SortMemo | null)[]>();
function sortMemo(g: GameState, k: number): { get: () => SortMemo | null; set: (x: SortMemo) => void } {
  let l = SORT_MEMO.get(g);
  if (!l) { l = []; SORT_MEMO.set(g, l); }
  const L = l;
  return { get: () => L[k] ?? null, set: (x) => { L[k] = x; } };
}
const sameI32 = (x: Int32Array, y: Int32Array) => { if (x.length !== y.length) return false; for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false; return true; };
function writeSorted(m: CmMem, base: number, I: Int32Array, N: Int32Array, V: Int32Array, memo?: ReturnType<typeof sortMemo>): void {
  const n = I.length;
  const old = memo && ENV.CM_SL_SORTMEMO !== '0' ? memo.get() : null;
  if (old && sameI32(old.I, I) && sameI32(old.N, N) && sameI32(old.V, V)) {
    const a = old.a;
    for (let i = 0; i < n; i++) { const r = a[i], o = base + 12 * i; m.w32(o, I[r]); m.w32(o + 4, N[r]); m.w32(o + 8, V[r]); }
    return;
  }
  const a = new Int32Array(n);
  for (let i = 0; i < n; i++) a[i] = i;
  memo?.set({ I: I.slice(), N: N.slice(), V: V.slice(), a });
  // sammenligningen 0x83b670 på int32-forskelle; uden overløb (alle værdiforskelle < 2^31, nøgleforskelle < 2^20) har den samme fortegn som
  // K[x] − K[y] med K = V · 2^21 + N (eksakt i double) – samme ombytninger, færre opslag
  let vmin = 0, vmax = 0, nmin = 0, nmax = 0;
  for (let i = 0; i < n; i++) { const v = V[i], k = N[i]; if (i === 0 || v < vmin) vmin = v; if (i === 0 || v > vmax) vmax = v; if (i === 0 || k < nmin) nmin = k; if (i === 0 || k > nmax) nmax = k; }
  const K = KSORT && vmax - vmin < 2 ** 31 && nmax - nmin < 2 ** 20 ? new Float64Array(n) : null;
  if (K) for (let i = 0; i < n; i++) K[i] = V[i] * 2097152 + (N[i] - nmin);
  if (K) { sortKeyed(a, K); for (let i = 0; i < n; i++) { const r = a[i], o = base + 12 * i; m.w32(o, I[r]); m.w32(o + 4, N[r]); m.w32(o + 8, V[r]); } return; }
  const cmp = (x: number, y: number) => { if (K) return K[x] - K[y]; const d = (V[x] - V[y]) | 0; return d !== 0 ? d : (N[x] - N[y]) | 0; };
  const swap = (i: number, j: number) => { if (i !== j) { const t = a[i]; a[i] = a[j]; a[j] = t; } };
  if (n >= 2) {
    const lostk: number[] = [], histk: number[] = [];
    let lo = 0, hi = n - 1;
    for (;;) {
      const size = hi - lo + 1;
      if (size <= 8) {
        let h = hi;
        while (h > lo) {
          let max = lo;
          for (let p = lo + 1; p <= h; p++) if (cmp(a[p], a[max]) > 0) max = p;
          swap(max, h); h--;
        }
      } else {
        swap(lo + (size >> 1), lo);
        let loguy = lo, higuy = hi + 1;
        for (;;) {
          do loguy++; while (loguy <= hi && cmp(a[loguy], a[lo]) <= 0);
          do higuy--; while (higuy > lo && cmp(a[higuy], a[lo]) >= 0);
          if (higuy < loguy) break;
          swap(loguy, higuy);
        }
        swap(lo, higuy);
        if (higuy - 1 - lo >= hi - loguy) {
          if (lo + 1 < higuy) { lostk.push(lo); histk.push(higuy - 1); }
          if (loguy < hi) { lo = loguy; continue; }
        } else {
          if (loguy < hi) { lostk.push(loguy); histk.push(hi); }
          if (lo + 1 < higuy) { hi = higuy - 1; continue; }
        }
      }
      if (!lostk.length) break;
      lo = lostk.pop()!; hi = histk.pop()!;
    }
  }
  for (let i = 0; i < n; i++) { const r = a[i], o = base + 12 * i; m.w32(o, I[r]); m.w32(o + 4, N[r]); m.w32(o + 8, V[r]); }
}

// ---------------------------------------------------------------- pladserne og parrene ind/ud

/** klubpostens stabspladser i 0x83ebfb's rækkefølge: assistenten, trænerne, fysioterapeuterne, spejderne */
const STAFF_OFFS = [0xd3, ...[0, 1, 2, 3, 4].map((k) => 0x19f + 4 * k), 0x1cf, 0x1d3, 0x1d7, ...[0, 1, 2, 3, 4, 5, 6].map((k) => 0x1b3 + 4 * k)];
function writeSlots(S: SlMem, cid: number, e: PlanEntry, staffHolders: boolean): void {
  const { m, memOf } = S;
  const ent = (m.u32(S.slm + 0xdc) + 9 * cid) >>> 0;
  const base = SLOTS0 + 0x5c8 * cid;
  m.w32(ent, base); m.w8(ent + 4, e.state); m.w8(ent + 7, e.form); m.w8(ent + 8, e.counter);
  const mem = (id: number) => (id > -1 ? memOf.get(id) ?? -1 : -1);
  // stabens pladser (*estimeret*): klubbens nuværende stab efter jobbet (0x83ebfb-listen: assistenten, trænerne, fysioterapeuterne, spejderne)
  const club = S.clubAdr(cid);
  const staff: number[] = [];
  if (staffHolders && club) for (const o of STAFF_OFFS) { const st = m.u32(club + o); if (st) staff.push(st); }
  e.slots.forEach((s, i) => {
    const a = base + SLOT * i;
    m.w8(a, s.role); m.w16(a + 1, s.mask); m.w32(a + 3, s.b3 ?? 0); m.w32(a + 7, s.b7 ?? 0); m.w32(a + 0xb, s.bb ?? 0);
    let f = mem(s.f), h = mem(s.s13);
    if (s.role !== 0xb && staffHolders) {
      const w1 = s.role, w2 = s.role === 6 ? 0xd : s.role === 7 ? 0xe : s.role === 8 ? 0xf : s.role;
      let k = -1;
      for (let x = 0; x < staff.length; x++) { const j = m.u8(staff[x] + 0x3d); if (j === w1 || j === w2) { k = x; break; } }
      if (k >= 0) { h = f = m.s32(staff[k]); staff.splice(k, 1); } else { h = f = -1; }
    }
    m.w32(a + 0xf, f); m.w32(a + 0x13, h); m.w32(a + 0x17, s.s17);
    m.w16(a + 0x1b, s.day); m.w16(a + 0x1d, s.year); m.w32(a + 0x1f, leapY(s.year));
    m.w8(a + 0x23, s.idx); m.w8(a + 0x24, s.b24);
  });
  S.slotted.add(cid);
}
function readSlots(S: SlMem, cid: number): void {
  const { m, byMem, g } = S;
  const ent = (m.u32(S.slm + 0xdc) + 9 * cid) >>> 0;
  const base = m.u32(ent);
  const e = entryOf(g, cid);
  e.state = m.u8(ent + 4); e.form = m.u8(ent + 7); e.counter = m.u8(ent + 8);
  const gid = (v: number) => (v > -1 ? byMem.get(v)?.id ?? -1 : -1);
  e.slots = Array.from({ length: NSLOT }, (_, i) => {
    const a = base + SLOT * i;
    const role = m.u8(a);
    return { role, mask: m.u16(a + 1), b3: m.s32(a + 3), b7: m.s32(a + 7), bb: m.s32(a + 0xb),
      f: role === 0xb ? gid(m.s32(a + 0xf)) : -1, s13: role === 0xb ? gid(m.s32(a + 0x13)) : -1, s17: m.s32(a + 0x17),
      day: m.s16(a + 0x1b), year: m.u16(a + 0x1d), idx: m.u8(a + 0x23), b24: m.u8(a + 0x24) };
  });
  storeEntry(g, cid, e);
}
/** parrene (SLM +0 efter spiller, +4 efter klub; +8/+0xc pladsen, +0x10/+0x14 antallet) og ROWS +0xb's tæller (antal computerklubber) */
function writePairs(S: SlMem): void {
  const { m, g, memOf, slm } = S;
  const pairs = (g.cmSlPairs ?? []).map(([p, c]) => [memOf.get(p) ?? -1, c] as [number, number]).filter(([p, c]) => p >= 0 && g.clubs[c]);
  const n = pairs.length, cap = Math.max(100, Math.ceil(n / 100) * 100 + 100);
  const A = 0x5d000000, B = 0x5d800000;
  m.w32(slm, A); m.w32(slm + 4, B); m.w32(slm + 8, cap); m.w32(slm + 0xc, cap); m.w32(slm + 0x10, n); m.w32(slm + 0x14, n);
  const byP = [...pairs].sort((x, y) => x[0] - y[0] || x[1] - y[1]), byC = [...pairs].sort((x, y) => x[1] - y[1] || x[0] - y[0]);
  byP.forEach(([p, c], i) => { m.w32(A + 8 * i, p); m.w32(A + 8 * i + 4, c); });
  byC.forEach(([p, c], i) => { m.w32(B + 8 * i, p); m.w32(B + 8 * i + 4, c); });
  const cnt = new Map<number, number>();
  for (const [p, c] of pairs) if (!isHumanClub(c)) cnt.set(p, (cnt.get(p) ?? 0) + 1);
  const rows = m.u32(G.ROWS);
  for (const [p, k] of cnt) { const a = rows + 79 * p + 0xb; m.w8(a, (m.u8(a) & 0xf0) | Math.min(15, k)); }
}
function readPairs(S: SlMem): void {
  const { m, byMem, slm } = S;
  const A = m.u32(slm), n = m.s32(slm + 0x10);
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) { const p = byMem.get(m.s32(A + 8 * i)); if (p) out.push([p.id, m.s32(A + 8 * i + 4)]); }
  S.g.cmSlPairs = out;
}

/** TRANSFER_MANAGER [0xde1f54]: +0 pegertabellen over buddene (indeks = spillets bud-id), +4 antallet; posterne (0x41 bytes) af spillets åbne bud */
function writeOffers(S: SlMem): void {
  const { m, g, memOf } = S;
  const tm = m.u32(0xde1f54);
  const n = g.nextId.offer + 1;
  m.w32(tm, OFFERS0); m.w32(tm + 4, n);
  let k = 0;
  for (const o of g.offers) {
    if (!['pending', 'negotiating', 'countered'].includes(o.status) || isHumanClub(o.buyer) && isHumanClub(o.seller)) continue;
    const pm = memOf.get(o.player);
    if (pm === undefined || o.id >= n) continue;
    const r = OREC0 + 0x48 * k++;
    m.w32(OFFERS0 + 4 * o.id, r);
    m.w32(r + 8, o.buyer); m.w32(r + 0xc, pm); m.w8(r + 0x11, 0xb);
    const d = dayOf(o.created); m.w16(r + 0x12, d.day); m.w16(r + 0x14, d.year); m.w32(r + 0x16, leapY(d.year));
    m.w32(r + 0x1b, Math.round(o.fee * GBP)); m.w8(r + 0x1f, o.loan ? 1 : 0); m.w32(r + 0x24, -1); m.w32(r + 0x28, -1);
    m.w8(r + 0x2c, o.status === 'pending' ? 0 : o.status === 'countered' ? (o.cmAi ? 1 : 2) : 5); m.w8(r + 0x2d, o.pub ?? 0);
    m.w32(r + 0x35, Math.round((o.lgFee ?? 0) * GBP)); m.w8(r + 0x39, o.lgApps ?? 10);
    m.w32(r + 0x3a, Math.round((o.intFee ?? 0) * GBP)); m.w8(r + 0x3e, o.intApps ?? 10); m.w8(r + 0x3f, o.sellOn ?? 0); m.w8(r + 0x40, o.months ?? 0);
  }
}

/** 0x6e6340 (staff, positionsflag, flag, klub, tærskel, manager) på spillets data (planScore.ts – som cmSquadPlanGame.ts' kald) */
function planValue(S: SlMem, st: number, mask: number, flags: number, clubAdr: number, thr: number): number {
  const { g, m } = S;
  const p = S.byMem.get(m.s32(st));
  const cid = clubAdr ? m.s32(clubAdr) : 0;
  const club = g.clubs[cid];
  if (!p) return -10000;
  const pClub = p.loan ? p.loan.from : p.club;
  return planValue0(S, st, mask, flags, clubAdr, thr, p, cid, club, pClub);
}
function planValue0(S: SlMem, st: number, mask: number, flags: number, clubAdr: number, thr: number, p: Player, cid: number, club: GameState['clubs'][number] | undefined, pClub: number): number {
  const { g, m } = S;
  const fit = cmFitRead(g);
  S.cache ??= { ctx: new Map(), rec: new Map(), day: null, pl: new Map(), cl: new Map(), rd: new Map() };
  const C = S.cache;
  // (hastighed) dagens, spillerens og klubbens faste dele gemt for dagens hukommelse (spillets data ændres ikke i ønskelisternes dag –
  // kontraktens bytes læses af hukommelsen hver gang)
  const D = (C.day ??= { today: dayOf(g.date), yearAgo: dayOf(`${+g.date.slice(0, 4) - 1}${g.date.slice(4)}`) });
  const today = D.today, yearAgo = D.yearAgo;
  let P = C.pl.get(p.id);
  if (!P) { P = { joined: dayOf(p.joined ?? p.cmJoined ?? g.date), age: ageOn(p.dob, g.date), pLang: nationLanguage(g, p.nation), langs: playerLanguages(g, p) }; C.pl.set(p.id, P); }
  const joined = P.joined;
  let ctxPick = club ? C.ctx.get(cid) : null;
  if (club && ctxPick === undefined) { ctxPick = aiPickCtx(cid) ?? {}; C.ctx.set(cid, ctxPick); }
  ctxPick ??= {};
  const age = P.age;
  const rdKey = `${cid}|${p.id}`;
  let d = C.rd.get(rdKey);
  if (!d) { d = roleDataOf(p, ctxPick, age); C.rd.set(rdKey, d); }
  const k = contractForClub_4cf5f0(S.c, st, clubAdr);
  const cc = p.cmContract;
  const inj = fit.injury(p);
  let CL = C.cl.get(cid);
  if (!CL) { CL = { lang: club ? nationLanguage(g, club.nation) : null, mg: club ? managerStaff(g, cid) : null, np: mgNp(g, cid) }; C.cl.set(cid, CL); }
  const clubLang = CL.lang, pLang = P.pLang;
  const mg = CL.mg;
  const np = CL.np;
  const mgr: ManagerBlockIn = np ? { np, j59: 10, b59: 10, b5b: 10, rel: { d30: dislikesClub(p, cid), d60: favoursClub(p, cid), m840: dislikesPerson(mg, p.id), m810: favoursPerson(mg, p.id) } }
    : { np: null, j59: 10, b59: 10, b5b: 10, rel: { d30: false, d60: false, m840: false, m810: false } };
  let rec = S.cache.rec.get(p.id);
  if (!rec) { rec = playerRecord(p); S.cache.rec.set(p.id, rec); }
  return planScore({
    id: p.id, real: !p.regen, age, joined, rec, pos: mask & 0xffff, flags, thr,
    hasClub: !!clubAdr, atClub: pClub === cid, stHasClub: pClub > 0, sameNationClub: !!club && (g.clubs[pClub]?.nation ?? -1) === club.nation,
    mgrJoined: null, today, yearAgo,
    nationRep: nationRepMem(g, p.nation), british: BRITISH.has(g.nations[p.nation]?.code ?? ''), caps: p.caps, b56: sh(p, 'adaptability'),
    langDiff: !!clubLang && !!pLang && clubLang !== pLang, lang: clubLang && P.langs.includes(clubLang) ? 10 : 0,
    nationOfClub: !!club && (p.nation === club.nation || p.cmNation2 === club.nation),
    clubRep: club ? clubRepMem(g, cid) : 0, stClubRep: clubRepMem(g, pClub), listed: !!p.listed, daysNoClub: pClub ? 0 : Math.max(0, dayNum(g.date) - dayNum(p.joined ?? g.date)),
    league69: club ? g.cmCompRep?.[+(club.league?.match(/(\d+)$/)?.[1] ?? NaN)] ?? null : null, mgr,
    data: { ...d, contract: k && cc ? { b3d: s8(m.u8(k + 0x3d)), b3e: s8(m.u8(k + 0x3e)), b3f: s8(m.u8(k + 0x3f)), b44: s8(m.u8(k + 0x44)), b45: m.u32(k + 0x45), b4f: m.u8(k + 0x4f) } : null,
      injury: () => (inj ? { w28: inj.w28, w2c: inj.w2c } : null) },
  });
}
function mgNp(g: GameState, cid: number): number[] | null {
  const st = g.staff[g.clubs[cid]?.manager ?? -1];
  if (!st) return null;
  const np = new Array(0x48).fill(10);
  const a = st.attrs as unknown as Record<string, number>;
  const put = (o: number, v: number | undefined) => { if (v !== undefined && v > 0) np[o] = v; };
  put(0x10, a.coaching); put(0x17, a.judgingAbility); put(0x18, a.judgingPotential); put(0x1e, a.physio); put(0x1b, a.motivating);
  put(0x14, a.discipline); put(0x21, a.tactics);
  if (st.tac) [0x0e, 0x13, 0x15, 0x1a, 0x1c, 0x1f, 0x21, 0x43].forEach((o, k) => put(o, st.tac![k]));
  return np;
}

/** de adresser, hukommelsens c.call svarer på (adapterne ovenfor og buildWantMem's) – de oversatte versioner springes over. (0x846920,
 *  0x844780 og 0x8cca10 står IKKE her: buildWantMem's gren for dem tager ikke this – kaldt fra de oversatte funktioner (thiscall) blev
 *  argumenterne forskudt én plads, og 0x846920 gav 0 for alle kandidater, så 0x83f3a0 aldrig fandt et mål.) */
const ADAPTED = new Set([0x8d0590, 0x600a50, 0x6e6340, 0x62ed70, 0x8c7950, 0x8d0040, 0x8ced40, 0x8be300, 0x8bed60, 0x4cda70, 0x85fc50, 0x68d1f0, 0x66f4e0, 0x4d9460,
  0x58d710, 0x4cc490, 0x4cd230, 0x4cd6d0, 0x587220, 0x754740, 0x6181d0, 0x5fea50, 0x5a8f60, 0x5cc7d0, 0x690890, 0x8c1f80, 0x8c2060, 0x4cc9e0,
  0x5a0590, 0x4b02e0, 0x4a4850, 0x8cf470, 0x8cf0e0, 0x8c61e0, 0x549c90, 0x944cff, 0x90d130, 0x944c9f, 0x5e8290]);
/** de oversatte funktioner kører på delt processortilstand (x86.ts SHARED) – uden nye X86 og argumentlister pr. kald */
function shared<T>(f: () => T, S?: SlMem): T {
  const was = SHARED.on, wasS = ACTIVE;
  if (S) ACTIVE = S;
  SHARED.on = ENV.CM_SL_SHARED !== '0';
  try { return f(); } finally { SHARED.on = was; ACTIVE = wasS; }
}
// ---------------------------------------------------------------- 0x83f3a0's kandidatløkke: den hurtige frasortering (0x83fa25–0x83fed2)
// Kandidaterne i positionslisten afvises af en række billige tjek, før 0x840d80 regner (~22.000 pr. klub). De samme tjek her i TS, i samme
// rækkefølge og uden sidevirkninger (ingen rand): en afvist kandidat springer til 0x840a81 (næste); alle andre – og hvor noget er usikkert
// (stab, menneskets klub) – kører de oversatte instruktioner som før. Kun hastighed: resultatet er det samme.
let ACTIVE: SlMem | null = null;
const rowB = (m: CmMem, id: number) => m.u8((m.u32(G.ROWS) + 79 * id + 0xb) >>> 0);
function pairFound(m: CmMem, slm: number, id: number, club: number): boolean {
  const A = m.u32(slm), n = m.s32(slm + 0x10);
  let lo = 0, hi = n - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, a = A + 8 * mid, a0 = m.s32(a), a1 = m.s32(a + 4);
    const d = a0 !== id ? a0 - id : club === -1 || a1 === -1 ? 0 : a1 - club;
    if (d === 0) return true;
    if (d < 0) lo = mid + 1; else hi = mid - 1;
  }
  return false;
}
/** målinger: frasorteringens grunde (indeks = rækkefølgen i fastReject) */
export const FR_STATS: Record<number, number> = {};
export const FR_LAST = { k: -1 };
const rz = (k: number) => { FR_STATS[k] = (FR_STATS[k] ?? 0) + 1; return 0; };
const rj = (k: number) => { FR_STATS[k] = (FR_STATS[k] ?? 0) + 1; FR_LAST.k = k; return 0x840a81; };
/** 0x83fa25 for kandidaterne i, i+1, …: en afvist kandidat går videre som 0x840a81 → 0x83fa1a ([esp+0x40] + 1 mod antallet [esp+0x8c];
 *  edx = [esp+0x90], ecx = i) uden at køre de oversatte instruktioner og springene imellem; listens slutning → 0x840a99 (som 0x840a93).
 *  Kaldene i frasorteringen (slCall – nye processortilstande) får stakken under 0x83f3a0's (før lå den ved `top`, oven i 0x83f3a0's egen
 *  ramme: argumenterne og de gemte registre blev overskrevet – uden følger, da 0x83f3a0 ikke læser dem igen, men skrøbeligt). */
function fastReject(R: X86): number { return stackBelow(R, fastRejectLoop); }
function fastRejectLoop(R: X86): number {
  const m = R.m;
  for (;;) {
    const np = fastReject0(R);
    if (np !== 0x840a81) return np;
    const esp = R.esp >>> 0;
    R.eax = m.u32(esp + 0x40) | 0;                                           // 840a81: mov eax, [esp + 0x40]
    R.ecx = m.u32(esp + 0x8c) | 0;                                           // 840a85: mov ecx, [esp + 0x8c]
    R.eax = R.incdec(R.eax >>> 0, 1, 32) | 0;                                // 840a8c: inc eax
    R.sub(R.eax >>> 0, R.ecx >>> 0, 32);                                     // 840a8d: cmp eax, ecx
    m.w32(esp + 0x40, R.eax >>> 0);                                          // 840a8f: mov [esp + 0x40], eax
    if (!R.cL) return 0x840a99;                                              // 840a93: jl 0x83fa1a
    R.edx = m.u32(esp + 0x90) | 0;                                           // 83fa1a: mov edx, [esp + 0x90]
    R.ecx = m.u32(esp + 0x40) | 0;                                           // 83fa21: mov ecx, [esp + 0x40]
  }
}
/** (hastighed, 14/11) frasorteringens kald i TS i stedet for de oversatte instruktioner (CM_SL_FRPORT=0: de oversatte): 0x53d980/0x5407e0 fra
 *  cmValue.ts, 0x544520/0x544590 og 0x84b180 her – kontrol: cm-sl-bench.ts mod CM_SL_FRPORT=0 */
const FRPORT = ENV.CM_SL_FRPORT !== '0';
/** 0x544520 / 0x544590 (staff, klub): kontrakten med klubben (uden klub: hans egen kontrakts klub – [0xae1080] = kontrakten; klubben regnes
 *  som [0xae23b4] + 0x245 · id – 0x544551–0x544559; før 580 · id, en fejl i porten) har +0x4e & mask (9 hhv. 2) */
function contractFlag_5445x0(c: CmCtx, st: number, club: number, mask: number): number {
  const m = c.m;
  if (!st) return 0;
  let cl = club >>> 0;
  if (!cl) {
    const k = getContract(m, st);
    m.w32(0xae1080, k);
    if (!k) return 0;
    cl = (m.u32(G.CLUBS) + 0x245 * m.s32(k + 4)) >>> 0;
    if (!cl) return 0;
  }
  const k2 = contractForClub_4cf5f0(c, st, cl);
  return k2 && m.u8(k2 + 0x4e) & mask ? 1 : 0;
}
/** 0x84b180 (staff, hans klub, klub): må han spille i klubben – britisk klub (+0x76 = 0xe) og ikke landets/EU-borger (0x53d740, oversat) uden
 *  +0x24/+0x22: 0; ellers 0x8c7950 (arbejdstilladelsen – adapteren). Kun al bruges. */
function permitOk_84b180(c: CmCtx, st: number, club: number): number {
  const m = c.m;
  const nat = m.u32(st + 0x1a);
  if (!nat) return 0;
  const cn = m.u32(club + 0x53);
  if (m.u8(cn + 0x76) !== 0xe || nat === cn || m.u32(st + 0x1e) === cn || slCall(c, 0x53d740, 0, st, cn)) return 1;
  if (!m.u32(st + 0x24) && !m.u8(st + 0x22)) return 0;
  return c.call(0x8c7950, m.u32(0xde1f54), st, cn, 0, 0, 0);
}
/** 0x84b180 = 0 uden at nå 0x8c7950: uden nation, eller britisk klub og hverken landets eller EU-borger og uden +0x24/+0x22 */
function permitFails(c: CmCtx, st: number, club: number): boolean {
  const m = c.m;
  const nat = m.u32(st + 0x1a);
  if (!nat) return true;
  const cn = m.u32(club + 0x53);
  if (m.u8(cn + 0x76) !== 0xe || nat === cn || m.u32(st + 0x1e) === cn || m.u32(st + 0x24) || m.u8(st + 0x22)) return false;
  return !slCall(c, 0x53d740, 0, st, cn);
}
function fastReject0(R: X86): number {
  const S = ACTIVE;
  if (!S) return 0;
  const m = R.m, c = S.c;
  const L = R.edx >>> 0, i = R.ecx | 0, entry = (L + 12 * i) >>> 0;
  const id = m.s32(entry), st = (m.u32(G.STAFF) + 0x6e * id) >>> 0;
  const ebp = R.ebp >>> 0, slot = m.u32(ebp + 8), club = m.u32(ebp + 0xc);
  if (st === m.u32(ebp + 0x10)) return rj(0);
  if (id >= m.s32(G.STAFF_COUNT) - 16) return rj(1);
  if (m.u8(st + 0x3d) === 5 || m.u8(st + 0x28) === 5) return rj(2);
  const flag = m.u32((R.esp + 0x14) >>> 0);
  // flag 0 (stabens pladser): staffSlot (0x83fa7c–0x840058 i TS)
  if (!flag) return staffSlot(R, S, st, entry, slot, club);
  if (m.u32(st + 0x69)) {
    // stab (ikke-spillerpost): 0x83fa83 0x69fc60 → afvis; ellers som de andre. (hastighed, 14/11) Med +0x3d ≠ 0xb afvises han under alle
    // omstændigheder ved 0x83fb1e, så 0x69fc60 (som kun læser – fejlboksen 0x69fcc0 går til adapterne) springes over.
    if (humanClub_600a50(c, club)) return rz(102);
    if (m.u8(st + 0x3d) !== 0xb) return rj(3);
    const sm = m.u32(0xb67a44);
    if (sm && slCall(c, 0x69fc60, sm, st) & 0xff) return rj(22);
  } else if (humanClub_600a50(c, club)) return rz(102);
  if (m.u8(st + 0x3d) !== 0xb) return rj(3);
  if (m.u32(st + 0x24) && m.u8(st + 0x28) === 5) return rj(4);
  if (!m.u32(st + 0x61)) return rj(5);
  if ((rowB(m, id) & 0x30) === 0x10) return rj(6);
  const nat = m.u32(st + 0x1a);
  if (nat && m.s32(nat) === m.s32(0x9cf458)) return rj(7);
  const b24 = m.u8(slot + 0x24);
  if ((b24 & 0x1e) === 0xa && s8(m.u8(st + 0x18)) > 0x17) return rj(8);
  if (!(b24 & 1)) { if (m.s32(slot + 7) < m.s32(entry + 8) * 1.3) return rj(9); }
  else if (!(m.u32(st + 0x39) && m.s32(entry + 8) <= 0)) { if (!(FRPORT ? contractFlag_5445x0(c, st, 0, 2) : slCall(c, 0x544590, 0, st, 0))) return rj(10); }
  // 0x83fc56
  if (m.u32(st + 0x39) === club) return rj(11);
  const k = getContract(m, st);
  if ((k ? (m.u32(G.CLUBS) + 0x245 * m.s32(k + 4)) >>> 0 : 0) === club) return rj(12);
  if ((rowB(m, id) & 0xf) >= 0xa) return rj(13);
  let k34 = 0;
  if (m.u32(st + 0x39)) {
    const d = subDays_54c8e0(m, G.TODAY, 200);
    const y = m.u16(st + 0x40), dd = m.s16(st + 0x3e);
    if (d.y < y || (d.y === y && d.d < dd)) {
      k34 = k;                                                               // 0x83fd2a: [esp+0x34] = kontrakten
      if (k && (m.u8(k + 0x4f) & 0xf0) !== 0x70 && !m.u32(k + 0x45) && !(FRPORT ? contractFlag_5445x0(c, st, 0, 9) : slCall(c, 0x544520, 0, st, 0))) return rj(14);
    }
  }
  // 0x83fd57: allerede på klubbens liste (bsearch 0x757ea0)
  if ((rowB(m, id) & 0xf) && m.u32(m.u32((R.esp + 0x10) >>> 0)) && pairFound(m, S.slm, id, club ? m.s32(club) : -1)) return rj(15);
  // 0x84b180 arbejdstilladelsen (oversat)
  if (!((FRPORT ? permitOk_84b180(c, st, club) : slCall(c, 0x84b180, 0, st, m.u32(st + 0x39), club)) & 0xff)) return rj(16);
  // 0x8c7560(staff, klub, 1): britisk klub (land +0x76 = 0xe) og ikke EU-borger (0x53d740) → kun pladsernes grupper 1/2/3
  const cn0 = club ? m.u32(club + 0x53) : 0;
  if (cn0 && m.u8(cn0 + 0x76) === 0xe && !slCall(c, 0x53d740, 0, st, 0)) { const gr = b24 & 0x1e; if (gr !== 2 && gr !== 4 && gr !== 6) return rj(17); }
  if (b24 & 1) return rz(103);                                                     // leje (0x8d0040 …) – oversat
  // 0x8cca10: et aftalt fremtidigt skifte (TRANSFER_MANAGER +0x86e's flag 0x10) – kun da oversat
  if (m.u8((m.u32(m.u32(0xde1f54) + 0x86e) + 8 * id) >>> 0) & 0x10) return rz(104);
  // ---- herfra ingen vej tilbage (rand): afvis (0x840a81) eller vurdér (0x8400da med esi = staff og de lokale variabler sat som i koden)
  const esp = R.esp >>> 0;
  const EVAL = () => { FR_STATS[200] = (FR_STATS[200] ?? 0) + 1; R.esi = st | 0; m.w32(esp + 0x24, entry); m.w32(esp + 0x34, k34); if (k) m.w32(0xae1080, k); return 0x8400da; };
  if (m.u32(esp + 0x84)) return EVAL();
  const idsum = (id + m.s32(club)) | 0, kk = s16(m.u16(esp + 0x28));
  if (kk !== 0 && idsum % kk === 0) return EVAL();
  const cn = m.u32(club + 0x53), pn = m.u32(st + 0x1a), sc = m.u32(st + 0x39), rec = m.u32(st + 0x61);
  if (cn === pn || m.u8(st + 0x22) || (sc && m.u32(sc + 0x53) === cn)) {
    // 0x840060 (indenlandsk eller landsholdsspiller)
    if (b24 & 1 || !rec || m.s16(rec + 9) >= 0xcb2 || (sc && m.s16(sc + 0x80) >= 0xcb2) || s8(m.u8(st + 0x18)) >= 0x14) return EVAL();
    const mg = m.u32(club + 0xcf), np = mg ? m.u32(mg + 0x69) : 0;
    const d = np ? 0x19 - s8(m.u8(np + 0x22)) : 15;
    return idsum % d !== 0 ? rj(99) : EVAL();
  }
  if (s8(m.u8(st + 0x18)) < 0x17 && (FRPORT ? knowsNation_53d980(c, st, cn, 1) : slCall(c, 0x53d980, 0, st, cn, 1)) && rec && m.s16(rec + 0xd) < 0xcb2) return rj(18);
  if (cn && pn && m.u8(cn + 0x75) !== m.u8(pn + 0x75)) {
    const cr = m.s16(club + 0x80);
    if (cr < 0xabe) return rj(19);
    let same = false;
    if (sc) { const scn = m.u32(sc + 0x53); same = !scn || m.u8(scn + 0x75) === m.u8(cn + 0x75); }
    if (!same && cr < 0x109a && m.u8(cn + 0x85) < 0xc) return rj(20);
  }
  const g2 = b24 & 0x1e, youth = g2 === 0xa || g2 === 0xc;
  if (m.s16(rec + 0xd) < (youth ? 0x6d6 : 0xabe)) return rj(21);
  const v = s16(FRPORT ? seenRep_5407e0(c, st, m.u32(club + 0xcf), 0) : slCall(c, 0x5407e0, 0, st, m.u32(club + 0xcf), 0));
  const r = c.rand(2000) + (youth ? 0xabe : 0xcb2);
  return v >= r ? EVAL() : rj(98);
}
/** flag 0 (stabens pladser, [esp+0x14] = 0) 0x83fa7c–0x840058: uden ikke-spillerpost afvist (0x83fbdf); 0x69fc60; kontraktens løn (+0x35 & 0x3f
 *  = 2: 0x85fa00 · ugeløn / 7) mod pladsens +7 og klubbens omdømme; 0x83fc56–0x83fcb5; 0x83fd57–0x83fec2 (leje og 0x8cca10: de oversatte fra
 *  0x83fcbb med registrene sat); 0x83fed8–0x840058 → afvis, 0x8400da eller 0x840112. Kontrol: cm-sl-bench.ts (150 dage ens) */
function staffSlot(R: X86, S: SlMem, st: number, entry: number, slot: number, club: number): number {
  const m = R.m, c = S.c;
  if (!m.u32(st + 0x69)) return rj(23);
  // (hastighed, 14/11) 0x84b180 uden 0x8c7950 afviser senere alligevel – 0x69fc60, 0x85fa00 og 0x53d740 kun læser, så tjekket kan stå først
  if (FRPORT && permitFails(c, st, club)) return rj(26);
  const sm = m.u32(0xb67a44);
  if (sm && slCall(c, 0x69fc60, sm, st) & 0xff) return rj(22);
  const k = getContract(m, st);
  const w = k && (m.u8(k + 0x35) & 0x3f) === 2 ? (Math.imul(s16(slCall(c, 0x85fa00, k)), m.s32(k + 0xc)) / 7) | 0 : 0;
  if (w >= m.s32(slot + 7)) return rj(24);
  if (w > Math.imul(m.s16(club + 0x80) + 0x1f4, 10)) return rj(25);
  if (m.u32(st + 0x39) === club) return rj(11);
  m.w32(0xae1080, k);
  if ((k ? (m.u32(G.CLUBS) + 0x245 * m.s32(k + 4)) >>> 0 : 0) === club) return rj(12);
  const id = m.s32(st);
  if ((rowB(m, id) & 0xf) >= 0xa) return rj(13);
  const esp = R.esp >>> 0;
  R.esi = st | 0; R.ebx = entry | 0; R.edi = k | 0;
  m.w32(esp + 0x24, entry); m.w32(esp + 0x34, k);
  // 0x83fcbb (flag 0: datoen springes over) → 0x83fd57: allerede på klubbens liste
  if ((rowB(m, id) & 0xf) && m.u32(m.u32((esp + 0x10) >>> 0)) && pairFound(m, S.slm, id, club ? m.s32(club) : -1)) return rj(15);
  if (!((FRPORT ? permitOk_84b180(c, st, club) : slCall(c, 0x84b180, 0, st, m.u32(st + 0x39), club)) & 0xff)) return rj(16);
  const b24 = m.u8(slot + 0x24);
  const cn0 = club ? m.u32(club + 0x53) : 0;
  if (cn0 && m.u8(cn0 + 0x76) === 0xe && !slCall(c, 0x53d740, 0, st, 0)) { const gr = b24 & 0x1e; if (gr !== 2 && gr !== 4 && gr !== 6) return rj(17); }
  if (b24 & 1 || m.u8((m.u32(m.u32(0xde1f54) + 0x86e) + 8 * id) >>> 0) & 0x10) return rz(103);   // leje / 0x8cca10 – oversat fra 0x83fcbb
  // 0x83fed8: vurdér (0x8400da; flag 0 → 0x84010f 0x69d1b0) eller afvis
  const EVAL = (pc: number) => { FR_STATS[201] = (FR_STATS[201] ?? 0) + 1; R.ebx = club | 0; return pc; };
  if (m.u32(esp + 0x84)) return EVAL(0x8400da);
  const idsum = (id + m.s32(club)) | 0, kk = s16(m.u16(esp + 0x28));
  if (kk !== 0 && idsum % kk === 0) return EVAL(0x8400da);
  const cn = m.u32(club + 0x53), pn = m.u32(st + 0x1a), sc = m.u32(st + 0x39), rec = m.u32(st + 0x61);
  if (cn === pn || m.u8(st + 0x22) || (sc && m.u32(sc + 0x53) === cn)) return EVAL(0x840112);   // 0x840060 med flag 0 → 0x840112 (ebx = klubben)
  if (s8(m.u8(st + 0x18)) < 0x17 && (FRPORT ? knowsNation_53d980(c, st, cn, 1) : slCall(c, 0x53d980, 0, st, cn, 1)) && rec && m.s16(rec + 0xd) < 0xcb2) return rj(18);
  if (cn && pn && m.u8(cn + 0x75) !== m.u8(pn + 0x75)) {
    const cr = m.s16(club + 0x80);
    if (cr < 0xabe) return rj(19);
    let same = false;
    if (sc) { const scn = m.u32(sc + 0x53); same = !scn || m.u8(scn + 0x75) === m.u8(cn + 0x75); }
    if (!same && cr < 0x109a && m.u8(cn + 0x85) < 0xc) return rj(20);
  }
  const g2 = b24 & 0x1e, youth = g2 === 0xa || g2 === 0xc;
  const v = s16(FRPORT ? seenRep_5407e0(c, st, m.u32(club + 0xcf), 1) : slCall(c, 0x5407e0, 0, st, m.u32(club + 0xcf), 1));
  const r = c.rand(2000) + (youth ? 0xabe : 0xcb2);
  return v >= r ? EVAL(0x8400da) : rj(97);
}
let cmpDone = false;
function ensureCmp(): void {
  if (cmpDone) return;
  cmpDone = true;
  ensureImpls();
  // 0x757ea0 / 0x844740: parrene efter spiller (så klub) / klub (så spiller), −1 = jokertegn, null først (bsearch 0x946464 og qsort)
  const byP = (m: CmMem, a: number, b: number) => {
    if (!a) return -1; if (!b) return 1;
    const a0 = m.s32(a), b0 = m.s32(b);
    if (a0 !== b0) return (a0 - b0) | 0;
    const a1 = m.s32(a + 4), b1 = m.s32(b + 4);
    return a1 === -1 || b1 === -1 ? 0 : (a1 - b1) | 0;
  };
  const byC = (m: CmMem, a: number, b: number) => {
    if (!a) return -1; if (!b) return 1;
    const a1 = m.s32(a + 4), b1 = m.s32(b + 4);
    if (a1 !== b1) return (a1 - b1) | 0;
    const a0 = m.s32(a), b0 = m.s32(b);
    return a0 === -1 || b0 === -1 ? 0 : (a0 - b0) | 0;
  };
  QSORT_CMP[0x757ea0] = byP; QSORT_CMP[0x844740] = byC;
  if (ENV.CM_SL_FAST !== '0') PC_HOOK[0x83fa25] = fastReject;
  // kun oversættelser med ret N (R.ret – de nyere); de ældre (runde 2) kaldes som før med egne registre
  for (const [a, f] of Object.entries(GEN)) if (!ADAPTED.has(+a) && ((f as { shared?: boolean }).shared ?? f.toString().includes('R.ret('))) registerImpl(+a, f, true);
  // 0x4d0c60 håndporteret (cmValue.ts – bit for bit som den oversatte, scripts/cm-value-check.ts)
  if (ENV.CM_SL_GENVALUE !== '1') registerImpl(0x4d0c60, (c, _e, a) => playerValue_4d0c60(c, a[0] >>> 0, a[1] >>> 0, a[2], a[3], a[4]));
  // (hastighed, 14/11) de små hjælpefunktioner, 0x840d80 og 0x83f3a0 kalder, håndporteret (cmValue.ts, frasorteringen) – som delte (cdecl)
  // funktioner, der selv læser argumenterne af stakken (oversætterens antal argumenter er ikke altid rigtigt for cdecl: "544410=0").
  // CM_SL_TSHELP=0: de oversatte; CM_SL_TSHELP=adr,adr: kun de nævnte
  if (ENV.CM_SL_TSHELP !== '0') {
    const only = ENV.CM_SL_TSHELP ? new Set(ENV.CM_SL_TSHELP.split(',').map((x: string) => parseInt(x, 16))) : null;
    const reg = (adr: number, f: (c: CmCtx, m: CmMem, sp: number) => number) => {
      if (only && !only.has(adr)) return;
      registerImpl(adr, (c, ecx, args) => { const R = enter(c, ecx, args), sp = R.esp >>> 0; R.eax = f(c, c.m, sp) | 0; return R.ret(0); }, true);
    };
    reg(0x5408c0, (c, m, sp) => knowledge_5408c0(c, m.u32(sp + 4), m.u32(sp + 8)));
    // (0x544410 og 0x53d980 i TS gav andre resultater i 0x840d80 – ikke fundet hvorfor; de oversatte bruges)
    reg(0x5407e0, (c, m, sp) => seenRep_5407e0(c, m.u32(sp + 4), m.u32(sp + 8), m.s32(sp + 12)));
    reg(0x544520, (c, m, sp) => contractFlag_5445x0(c, m.u32(sp + 4), m.u32(sp + 8), 9));
    reg(0x544590, (c, m, sp) => contractFlag_5445x0(c, m.u32(sp + 4), m.u32(sp + 8), 2));
  }
  registerImpl(0x757ea0, (c, _e, a) => byP(c.m, a[0] >>> 0, a[1] >>> 0));
  registerImpl(0x844740, (c, _e, a) => byC(c.m, a[0] >>> 0, a[1] >>> 0));
}

/** CM_SL_MEMCHECK: antal kontroller og afvigelser */
export const MEMCHECK = { n: 0, bad: 0, pages: 0 };
/** de sider, der afviger mellem to hukommelser (en side, der kun findes i den ene, sammenlignes med nuller): [side, første afvigende adresse] */
export function memDiff(a: SparseMem, b: SparseMem): [string, string][] & { pages: number } {
  const A = slMemPages(a), B = slMemPages(b), out = [] as unknown as [string, string][] & { pages: number };
  out.pages = new Set([...A.keys(), ...B.keys()]).size;
  const zero = new Uint8Array(4096);
  for (const p of new Set([...A.keys(), ...B.keys()])) {
    const x = A.get(p) ?? zero, y = B.get(p) ?? zero;
    for (let i = 0; i < 4096; i++) if (x[i] !== y[i]) { out.push([p.toString(16), ((p << 12) + i >>> 0).toString(16) + ` ${x[i]}≠${y[i]}`]); break; }
  }
  return out;
}

/** Bygger dagens hukommelse (alle klubber, de klubløse, pladserne, parrene, buddene, positionslisterne) */
export function buildSlMem(g: GameState, opts: { noStale?: boolean } = {}): SlMem {
  ensureCmp();
  let S!: SlMem;
  const fit = cmFitRead(g);
  let injN = 0;
  const call = (adr: number, a: number[]): number | undefined => {
    const m = S.M.c.m;
    switch (adr) {
      case 0x600a50: return humanClub_600a50(S.M.c, a[0] >>> 0) ? 1 : 0;
      case 0x4d0c60: return undefined;
      case 0x6e6340: return planValue(S, a[0] >>> 0, a[1], a[2], a[3] >>> 0, a[4]);
      case 0x849f00: { const withThis = a.length === 4; return withThis ? slCall(S.M.c, adr, a[0], ...a.slice(1)) : slCall(S.M.c, adr, m.u32(m.u32(0xde1f54) + 0x856), ...a); }
      case 0x62ed70: {
        // Injury::get_player_injury: skadeposten (+0x28 sværhed, +0x2c dage) eller 0 – konditionsmodulet (cmFitnessGame.ts)
        const p = S.byMem.get(m.s32(a[a.length - 1] >>> 0));
        const inj = p ? fit.injury(p) : null;
        if (!inj) return 0;
        const r = INJ0 + 0x40 * (injN++ % 0x1000);
        for (let i = 0; i < 0x40; i++) m.w8(r + i, 0);
        m.w16(r + 0x28, inj.w28); m.w16(r + 0x2c, inj.w2c);
        return r;
      }
      case 0x8c7950: {
        // TRANSFER_MANAGER::is_work_permit_granted(staff, land, 0, 0, 0) – 0x84b180 har afgjort, at han skal have en (*estimeret*: rules2001.ts)
        const p = S.byMem.get(m.s32(a[a.length - 5] >>> 0));
        return p ? (workPermitGranted(p) ? 1 : 0) : 1;
      }
      case 0x8d0040: {
        // TRANSFER_MANAGER::can_loan_player (*estimeret*: rules2001.ts' lejeregel); 1 = må
        const cl = g.clubs[m.s32(a[a.length - 3] >>> 0)], p = S.byMem.get(m.s32(a[a.length - 2] >>> 0));
        return p && cl && !loanBlocked(p, cl) ? 1 : 0;
      }
      case 0x8ced40: return 1;
      case 0x8be300: {
        // TRANSFER_MANAGER::add_transfer_offer (offer, …): spillets bud; indekset = bud-id'et
        const r = a[a.length - 2] >>> 0;
        return addBid(S, r, false);
      }
      case 0x8bed60: {
        // make_loan_offer(staff, klub, …, 1, 1): et lejebud
        const st = a[a.length - 6] >>> 0, club = a[a.length - 5] >>> 0;
        const r = 0x5e7f0000;
        for (let i = 0; i < 0x48; i++) m.w8(r + i, 0);
        m.w32(r + 8, m.s32(club)); m.w32(r + 0xc, m.s32(st)); m.w8(r + 0x1f, 1); m.w8(r + 0x11, 0xb);   // (init_loan_offer 0x8e7810)
        return addBid(S, r, true);
      }
      case 0x8d0590: {
        // TRANSFER_MANAGER: lejeperioden (start måned/år, slut måned/år – måned 0..11 som 0x54cfb0) efter køberlandets lejeregel; landenes
        // regler (+0x8ac, 28 objekter med en virtuel +0x28) er ikke i spillet: fra i dag til sæsonens slutning (juni), højst til kontraktens
        // udløb (*estimeret*). Argumenterne (thiscall fra 0x842740): køber, sælger, staff, &startmåned, &startår, &slutmåned, &slutår.
        const n = a.length;
        const mon = (d: number, y: number) => { const lp = leapY(y); let k = 0; for (let i = 1; i < 12; i++) if (d >= m.s16((lp ? 0x9b8460 : 0x9b8448) + 2 * i)) k = i; return k; };
        const y = m.u16(G.TODAY + 2), d = m.s16(G.TODAY);
        const cm = mon(d, y);
        let ey = cm >= 6 ? y + 1 : y, em = 5;
        const k = getContract(m, a[n - 5] >>> 0);
        if (k) { const ky = m.u16(k + 0x2f), km = mon(m.s16(k + 0x2d), ky); if (ky < ey || (ky === ey && km < em)) { ey = ky; em = km; } }
        m.w8(a[n - 4] >>> 0, cm); m.w16(a[n - 3] >>> 0, y); m.w8(a[n - 2] >>> 0, em); m.w16(a[n - 1] >>> 0, ey);
        return 0;
      }
      // CONTRACT_MANAGER::offer_contract – sælgerens forsøg på at binde spilleren, når et bud kommer (0x84a99e): ikke i spillet (*estimeret*)
      case 0x4cda70: return 0;
      case 0x85fc50: return setToDesiredContract_85fc50(S.M.c, a[0] >>> 0, a[1] >>> 0, a[2] >>> 0, a[3], a[4], a[5], a[6], a[7] >>> 0);
      case 0x68d1f0: return listRemove_68d1f0(m, a[0] >>> 0, a[1] >>> 0);
      case 0x66f4e0: case 0x4d9460: case 0x58d710:
      case 0x4cc490: case 0x4cd230: case 0x4cd6d0: case 0x587220: case 0x754740: case 0x6181d0: case 0x5fea50: case 0x5a8f60: case 0x5cc7d0:
      case 0x690890: case 0x8c1f80: case 0x8c2060: case 0x4cc9e0:
        return 0;
    }
    return undefined;
  };
  let t = now();
  const all = Object.keys(g.clubs).map(Number), useLog = (adr: number) => ADAPTED.has(adr);
  // cmSlMem.ts: samme hukommelse som buildWantMem(…, { full: true }), hurtigere (CM_SL_OLDMEM=1: den oprindelige; CM_SL_MEMCHECK=1: begge, sammenlignet)
  const M = ENV.CM_SL_OLDMEM === '1' ? buildWantMem(g, all, { full: true, call, useLog }) : buildSlWantMem(g, all, { call, useLog, stale: opts.noStale || ENV.CM_SL_MEMCHECK === '1' || ENV.CM_SL_STALE === '0' ? undefined : staleOk(g) });
  if (STALECHECK.on) staleCheck(g, M, call, useLog);
  if (ENV.CM_SL_MEMCHECK === '1') {
    const O = buildWantMem(g, all, { full: true, call, useLog });
    const d = memDiff(O.c.m as SparseMem, M.c.m as SparseMem);
    const same = O.W.players.length === M.W.players.length && O.W.players.every(([p, st], i) => M.W.players[i][0] === p && M.W.players[i][1] === st);
    MEMCHECK.n++;
    MEMCHECK.pages += d.pages;
    if (d.length || !same) { MEMCHECK.bad++; console.log(`CM_SL_MEMCHECK ${g.date}: ${d.length} sider afviger`, d.slice(0, 5), same ? '' : 'spillerlisten afviger'); }
    (O.c.m as SparseMem).release();
  }
  t = tick('want', t);
  const m = M.c.m;
  // (personposten +0 = id'et; cmSlMem.ts' pidStaff = spillets id → personposten, ellers en Map)
  const pidStaff = (M as { pidStaff?: (pid: number) => number | undefined }).pidStaff, base0 = m.u32(G.STAFF);
  const memOfM = new Map<number, number>(), byMemA: (Player | undefined)[] = new Array(Math.max(0, m.s32(G.STAFF_COUNT))).fill(undefined);
  for (const [p, st] of M.W.players) { const id = pidStaff ? (st - base0) / 0x6e : m.s32(st); if (!pidStaff) memOfM.set(p.id, id); byMemA[id] = p; }
  const memOf = pidStaff ? { get: (pid: number) => { const st = pidStaff(pid); return st === undefined ? undefined : (st - base0) / 0x6e; } } : memOfM;
  const byMem = { get: (id: number) => (id >= 0 ? byMemA[id] : undefined) };
  S = { M, m, c: M.c, g, slm: m.u32(m.u32(0xde1f54) + 0x856), memOf, byMem, clubAdr: (cid) => M.W.clubOf(cid), events: [], slotted: new Set() };
  M.setRand(cmRand(g.seed ?? 0, dayNum(g.date), 0x842e10));
  // CONTRACT_MANAGER's faste datoer (0x4c7ac0 tidspunkt 0) – 0x867d30
  for (const [adr, n] of [[0xae1048, 7], [0xae1030, 0x1e], [0xae1058, 0x3c], [0xae1010, 0x5b], [0xae1060, 0x79], [0xae1040, 0x98],
    [0xae1090, 0xb6], [0xae1068, 0x16d], [0xae1008, 0x226], [0xae1020, 0x447]] as const) {
    const t = addDays_54c5b0(m, G.TODAY, n); m.w16(adr, t.d); m.w16(adr + 2, t.y); m.w32(adr + 4, t.x);
  }
  // land +0x7f (EU = 2) og nøgle-id'erne skriver buildWageMem (cmKeyIds.ts)
  g.nations.forEach((_n, i) => M.W.natOf(i));
  // alle klubbers pladser (klubber uden plan: tomme pladser, tilstand 0)
  for (const c of Object.values(g.clubs)) writeSlots(S, c.id, g.cmPlan?.[c.id] ? entryOf(g, c.id) : newPlanEntry(), true);
  writePairs(S);
  writeOffers(S);
  t = tick('rest', t);
  writeValues(S);
  t = tick('values', t);
  buildPositionLists(S);
  tick('lists', t);
  return S;
}

/** staff +0x52 som CONTRACT_MANAGER's daglige 0x4c7ec5: 0x4d0c60(staff, kontraktens klub, 0, −1, flag) – flag 1 for menneskets spillere, 0 for
 *  computerens (kontraktens +0x4e |= 4), klemt af en aktiv frikøbsklausul (+0x21); uden kontrakt eller klub 0. (Spillets Player.value er en
 *  anden model – for de små klubbers og de unge spillere op til ×20 originalens; positionslisterne, budgetgrænsen 0x83fbxx og Interested
 *  sammenligner med +0x52.) *Estimeret*: originalen regner computerens spillere på ulige dage – her hver dag. */
function writeValues(S: SlMem): void {
  const { m, c, g } = S;
  const vals = new Map<number, number>(), skipped = new Set<number>(), lazy = new Map<number, [number, number, number]>();
  // (hastighed) spillere, hvis +0x52 ingen læser: ikke i positionslisterne (loadedFilter) og i en klub uden trupplan (ingen 0x83b6e0/0x84a020 for
  // klubben – de skjulte ligaer). Målt (scripts/cm-sl-count.ts OFF=82): dagens kode læser +0x52 hos 10–20 personer, alle i de aktive lande. 0x4d0c60
  // skriver kun stakken og [0xae1080] (den sidst slåede kontrakt – læses aldrig); +0x52 bliver spillets værdi fra buildWageMem.
  // (hastighed, 14/11) computerklubberne med trupplan uden for de aktive lande: værdien regnes først, når klubbens trupplan kører i dag (refreshClub,
  // før noget i klubbens poster er ændret) – ellers læser ingen den (scripts/cm-sl-valcheck.ts: ingen læsninger af de udskudte +0x52, og de udskudte
  // værdier = de straks regnede). Spillerne i parrene (Interested, cmInterestedClubs) regnes altid.
  const loaded = loadedFilter(g), plan = g.cmPlan ?? {}, active = new Set(g.activeNations);
  const inPairs = new Set((g.cmSlPairs ?? []).map(([pid]) => pid));
  const all = ENV.CM_SL_ALLVALUES === '1', check = VALCHECK.on;
  // (hastighed) de udskudte spillere (staleOk – cmSlMem.ts): intet her; touchClub sætter kontraktens +0x4e |= 4 (eller +0x52 = 0 uden kontrakt),
  // og lazyValues regner værdien, når klubben kører (klubber uden trupplan: aldrig)
  const dp = (S.M as { deferredPids?: { has(pid: number): boolean } }).deferredPids;
  for (const [p, st] of S.M.W.players) {
    if (dp && !all && dp.has(p.id)) {
      // (udskudt: VALUES.dp – lazyValues regner dem, der ikke har en værdi endnu)
      // (kontrollen: skyggen får de skrivninger, writeValues ellers gør her)
      const sh = STALECHECK.on ? STALECHECK.shadow : null;
      if (sh) { const k = getContract(sh, st), cl = k ? clubAt(sh, sh.s32(k + 4)) : 0; if (k && cl && sh.s32(cl) === sh.s32(k + 4)) sh.w8(k + 0x4e, sh.u8(k + 0x4e) | 4); else sh.w32(st + 0x52, 0); }
      continue;
    }
    const k = getContract(m, st);
    const club = k ? clubAt(m, m.s32(k + 4)) : 0;
    let v = 0;
    if (k && club && m.s32(club) === m.s32(k + 4)) {
      const human = humanClub_600a50(c, club);
      if (!human) m.w8(k + 0x4e, m.u8(k + 0x4e) | 4);
      const home = p.loan?.from ?? p.club;
      if (!human && !loaded(p) && !all) {
        if (!plan[home]) { skipped.add(p.id); continue; }
        if (!active.has(g.clubs[home]?.nation ?? -1) && !inPairs.has(p.id) && ENV.CM_SL_LAZYVALUES !== '0') {
          lazy.set(p.id, [st, club, k]);
          if (check) { VALCHECK.eager.set(st, valueAt(S, st, club, k, false)); VALCHECK.pending.add(st); VALCHECK.lazyTotal++; }
          continue;
        }
      }
      v = valueAt(S, st, club, k, human);
    }
    m.w32(st + 0x52, v);
    vals.set(p.id, v);
  }
  VALUES.set(S.g, { date: S.g.date, v: vals, skipped, lazy, dp: dp && !all ? dp : undefined });
}
/** 0x4d0c60(staff, klub, 0, −1, menneske) klemt af en aktiv frikøbsklausul (CONTRACT_MANAGER 0x4c7ec5) */
function valueAt(S: SlMem, st: number, club: number, k: number, human: boolean): number {
  let v = playerValue_4d0c60(S.c, st, club, 0, -1, human ? 1 : 0) | 0;
  if (hasActiveReleaseClause_867b50(S.m, k) && v > S.m.s32(k + 0x21)) v = S.m.s32(k + 0x21);
  return v;
}
/** kontrollen af de udskudte værdier (scripts/cm-sl-valcheck.ts): de straks regnede værdier (personpost → værdi) og afvigelserne */
export const VALCHECK = { on: false, eager: new Map<number, number>(), pending: new Set<number>(), lazyDiff: 0, lazyN: 0, lazyTotal: 0 };
/** dagens +0x52 pr. spiller (£) fra den seneste buildSlMem – cmInterestedClubs og refreshClub */
const VALUES = new WeakMap<GameState, { date: string; v: Map<number, number>; skipped: Set<number>; lazy: Map<number, [number, number, number]>; dp?: { has(pid: number): boolean } }>();
const memValue = (g: GameState, p: Player) => {
  const e = VALUES.get(g);
  if (e && e.date === g.date && (e.skipped.has(p.id) || e.lazy.has(p.id) || (e.dp?.has(p.id) && !e.v.has(p.id)))) SL_STATS.skipHit++;
  const v = e && e.date === g.date ? e.v.get(p.id) : undefined;
  return v ?? Math.round(p.value * GBP);
};
/** de udskudte værdier for klubbens spillere (refreshClub, før klubbens poster ændres) */
function lazyValues(S: SlMem, cid: number): void {
  const e = VALUES.get(S.g);
  if (!e || e.date !== S.g.date || (!e.lazy.size && !e.dp)) return;
  for (const [p, st0] of S.byClub?.get(cid) ?? []) {
    const l = e.lazy.get(p.id) ?? (e.dp?.has(p.id) && !e.v.has(p.id) ? [st0, 0, 0] : null);
    if (!l) continue;
    const st = l[0];
    let club = l[1], k = l[2];
    let v: number;
    if (club) v = valueAt(S, st, club, k, false);
    else {
      // (en udskudt spiller: kontrakten og klubben slås op nu – touchClub har skrevet hans poster)
      k = getContract(S.m, st); club = k ? clubAt(S.m, S.m.s32(k + 4)) : 0;
      v = k && club && S.m.s32(club) === S.m.s32(k + 4) ? valueAt(S, st, club, k, false) : 0;
    }
    if (VALCHECK.on) { VALCHECK.lazyN++; VALCHECK.pending.delete(st); if (VALCHECK.eager.get(st) !== v) VALCHECK.lazyDiff++; }
    S.m.w32(st + 0x52, v);
    e.v.set(p.id, v); e.lazy.delete(p.id);
  }
}

function addBid(S: SlMem, r: number, loan: boolean): number {
  const { m, g } = S;
  const buyer = m.s32(r + 8), p = S.byMem.get(m.s32(r + 0xc));
  if (!p || !g.clubs[buyer]) return -1;
  const id = g.nextId.offer++;
  const eur = (v: number) => Math.max(0, v);
  // 0x8be300: menneskets sælger får 28 dage (0x8be884 – spillets egen frist bruges), ellers 0x8cc5b0's svartid (også for klubløse)
  const st = (m.u32(G.STAFF) + 0x6e * m.s32(r + 0xc)) >>> 0, k = getContract(m, st);
  const sellerHuman = !!k && (m.u8(k + 0x35) & 0x3f) !== 5 && isHumanClub(m.s32(k + 4));
  const days = sellerHuman ? 28 : responseDelay(S, r);
  S.events.push({ kind: 'bid', id, buyer, player: p.id, fee: loan ? 0 : eur(m.s32(r + 0x1b)), loan: loan || m.u8(r + 0x1f) === 1,
    months: Math.max(0, s8(m.u8(r + 0x40))), sellOn: Math.max(0, s8(m.u8(r + 0x3f))), lgFee: eur(m.s32(r + 0x35)), lgApps: m.u8(r + 0x39) || 10,
    intFee: eur(m.s32(r + 0x3a)), intApps: m.u8(r + 0x3e) || 10, pub: m.u8(r + 0x2d), max: maxOf(S, buyer, p), days });
  return id;
}

/** TRANSFER_MANAGER::get_offer_response_delay 0x8cc5b0 (oversat, cmGen/) og schedule_offer 0x8c6220's dagsdel: dage til sælgerens svar.
 *  0x8cc5b0: unge talenter (PA > 130, alder < 26, trupstatus > 0, viljen 0x846920 > 3,15 …) 30 tidspunkter = 10 dage, ellers rand(status/10 + 12)
 *  tidspunkter (mindst rand(3) + 1); overgangsvinduet 0x8e8ed0 er 365 dage (landenes TRANSFER_RULES +0x8ac findes ikke i hukommelsen –
 *  2001/02 har ingen vinduer). 0x8c6220: tidspunktet [0xae2c88] + resten; over 2 → næste dag. */
const DELAY_OUT = 0x5e7f0100;
export function responseDelay(S: SlMem, r: number): number {
  const { m } = S;
  m.w8(DELAY_OUT, 0); m.w8(DELAY_OUT + 4, 0);
  slCall(S.c, 0x8cc5b0, m.u32(0xde1f54), r, DELAY_OUT, DELAY_OUT + 4);
  const days = s8(m.u8(DELAY_OUT)), sl = s8(m.u8(DELAY_OUT + 4));
  return Math.max(0, days + (m.u8(G.SLICE) + sl > 2 ? 1 : 0));
}
/** 0x840d80 for køberens plads med spilleren (værdisætningen, køberen højst giver) – pladsen +7 som reserve */
function maxOf(S: SlMem, buyer: number, p: Player): number {
  const { m } = S;
  const ent = (m.u32(S.slm + 0xdc) + 9 * buyer) >>> 0, base = m.u32(ent), id = S.memOf.get(p.id);
  for (let i = 0; i < NSLOT; i++) if (m.s32(base + SLOT * i + 0xf) === id) return Math.max(0, m.s32(base + SLOT * i + 7));
  return Math.round(p.value * GBP);
}

/** opdaterer en klubs spillere i hukommelsen efter trupplanen (kontraktens +0x3d/+0x3e/+0x3f/+0x4e/+0x4f, værdien) */
function refreshClub(S: SlMem, cid: number): void {
  const { m, g } = S;
  if (!S.byClub) {
    S.byClub = new Map();
    for (const [p, st] of S.M.W.players) { const h = p.loan?.from ?? p.club; if (!h) continue; const l = S.byClub.get(h) ?? []; l.push([p, st]); S.byClub.set(h, l); }
  }
  touchClub(S, cid);
  lazyValues(S, cid);
  for (const [p, st] of S.byClub.get(cid) ?? []) {
    if ((p.loan?.from ?? p.club) !== cid) continue;
    const k = S.M.W.contractOf(p);
    m.w32(st + 0x52, memValue(g, p));
    const cc = p.cmContract;
    if (k && cc) { m.w8(k + 0x3d, cc.b3d); m.w8(k + 0x3e, cc.b3e); m.w8(k + 0x3f, cc.b3f); m.w8(k + 0x4e, (cc.b4e ?? 0) | (m.u8(k + 0x4e) & 4)); m.w8(k + 0x4f, cc.b4f ?? 0); }
  }
}

// ---------------------------------------------------------------- dagens forløb (0x5cccd0) og spilstarten (0x83a1b0)

/** 0x844540(klub, −1): antal pladser med et mål og et budmærke (og forældede mærker ryddes) */
export function slotsWithBids(S: SlMem, cid: number): number {
  const club = S.clubAdr(cid);
  return club ? shared(() => slCall(S.c, 0x844540, S.slm, club, -1)) & 0xff : 0;
}

/** efter trupplanen for klubben (0x83a730 / 0x83a1b0 / 0x84abe0): de slupne mål af ønskelisten (0x843e10(mål, klub, 3, 0)) og 0x83b6e0 */
export function afterPlan(S: SlMem, cid: number, dropped: number[]): void {
  const club = S.clubAdr(cid);
  if (!club) return;
  refreshClub(S, cid);
  writeSlots(S, cid, entryOf(S.g, cid), true);
  for (const pid of dropped) {
    const id = S.memOf.get(pid);
    if (id === undefined) continue;
    if (onList(S, id, cid)) shared(() => slCall(S.c, 0x843e10, S.slm, (S.m.u32(G.STAFF) + 0x6e * id) >>> 0, club, 3, 0));
  }
  S.M.setRand(cmRand(S.g.seed ?? 0, cid, dayNum(S.g.date), 0x83b6e0));
  shared(() => slCall(S.c, 0x83b6e0, S.slm, club), S);
  readSlots(S, cid);
}
function onList(S: SlMem, id: number, cid: number): boolean {
  const { m, slm } = S;
  const A = m.u32(slm), n = m.s32(slm + 0x10);
  for (let i = 0; i < n; i++) if (m.s32(A + 8 * i) === id && m.s32(A + 8 * i + 4) === cid) return true;
  return false;
}

/** Et afsluttet bud uden handel (afvist, trukket, udløbet – i spillet: ikke længere åbent i g.offers, og målet er ikke kommet til klubben):
 *  TRANSFER_MANAGER::reject_transfer_offer 0x8bf680's del for køberens ønskeliste – 0x84aeb0(køber, staff) rydder budmærket +0x17 på
 *  pladserne med ham, og har køberen en plads med ham (0x849ce0(køber, staff, 0, 0)), fjernes han som mål 0x843e10(staff, køber, 1, rolle ≠ 0xb)
 *  (som genudfylder pladsen). Uden det stod pladserne med et afvist bud låst resten af sæsonen (14/11). Kørt dagen efter (*estimeret*: i
 *  originalen sker det, når svaret kommer). Computer → computer-buddene står i g.offers, til svaret er kommet (transfers.ts cmAiAiDue). */
export const SL_DROP = { n: 0 };
function dropDeadBids(S: SlMem): void {
  if (ENV.CM_SL_DROP === '0') return;
  const { g, m } = S;
  const open = new Set<number>();
  for (const o of g.offers) if (o.status === 'pending' || o.status === 'negotiating' || o.status === 'countered') open.add(o.id);
  for (const [k, st] of Object.entries(g.cmPlan ?? {})) {
    const cid = +k;
    const drop: number[] = [];
    for (const r of st.s) {
      if (r[3] < 0 || r[5] < 0 || open.has(r[5])) continue;
      const p = g.players[r[3]];
      // (kommet til klubben – også som lejespiller: så er pladsen udfyldt)
      if (!p || p.club === cid || (p.loan?.from ?? p.club) === cid || drop.includes(p.id)) continue;
      drop.push(p.id);
    }
    if (!drop.length) continue;
    const club = S.clubAdr(cid);
    if (!club) continue;
    refreshClub(S, cid);
    S.M.setRand(cmRand(g.seed ?? 0, cid, dayNum(g.date), 0x8bf680));
    for (const pid of drop) {
      const id = S.memOf.get(pid);
      if (id === undefined) continue;
      const staff = (m.u32(G.STAFF) + 0x6e * id) >>> 0;
      shared(() => {
        slCall(S.c, 0x84aeb0, S.slm, club, staff);
        const sl = slCall(S.c, 0x849ce0, S.slm, club, staff, 0, 0) >>> 0;
        if (sl) slCall(S.c, 0x843e10, S.slm, staff, club, 1, m.u8(sl) !== 0xb ? 1 : 0);
      }, S);
      SL_DROP.n++;
    }
    readSlots(S, cid);
  }
}

/** 0x84a020 make_club_bids for klubben, når 0x5cccd0's betingelse er opfyldt (omdømme > 6250 hver dag, ellers (dag + klub) % 7 = 0) */
export function makeBids(S: SlMem, cid: number, day: number): void {
  const { m, g } = S;
  const club = S.clubAdr(cid), c = g.clubs[cid];
  if (!club || !c) return;
  const nat = m.u32(club + 0x53);
  if (!nat) return;
  let due: boolean;
  if (!m.u8(nat + 0x11c)) due = m.s16(club + 0x80) > 0x186a || (day + cid) % 7 === 0;
  else { const div = m.u32(club + 0x57); due = !!div && m.s32(div) !== m.s32(0x9cf764) ? true : (day + cid) % 7 === 0; }
  if (!due) return;
  // (de udskudte spillere: 0x84a020 læser kun klubbens egne, der er mål eller indehaver af en plads med et andet mål – kontrakten +0x3d/+0x44)
  if (ENV.CM_SL_TOUCHBIDS === '1') touchClub(S, cid);
  else { const ids = new Set<number>(); for (const r of g.cmPlan?.[cid]?.s ?? []) if (r[3] > -1 && r[3] !== r[4]) { ids.add(r[3]); if (r[4] > -1) ids.add(r[4]); } touchClub(S, cid, ids); }
  writeSlots(S, cid, entryOf(g, cid), true);
  S.M.setRand(cmRand(g.seed ?? 0, cid, dayNum(g.date), 0x84a020));
  shared(() => slCall(S.c, 0x84a020, S.slm, club), S);
  readSlots(S, cid);
}

/** hukommelsen tilbage i spillet (parrene) */
export function finishSl(S: SlMem): SlEvent[] {
  readPairs(S);
  return S.events;
}

/** 0x5cccd0's første rand(2) (dagens forskydning [esp+0x34]) – (dag + klub) % 7 */
export const bidDay = (g: GameState) => cmRand(g.seed ?? 0, dayNum(g.date), 0x5cdc76)(2);

// ---------------------------------------------------------------- Interested (0x842180's computerdel) og udbudsprisen 0x4d1600

/** 0x842180 (computerklubberne): parrene (spiller, klub), hvor klubbens plads med ham (+0xf) har +7 over hans værdi +0x52 – og ikke hans klub.
 *  (Klubben uden plads med ham: pladsen 0's +7 – sic, 0x8422bf.) Klubber med tælleren +8 ≥ 100 springes over. */
export function cmInterestedClubs(g: GameState, p: Player): number[] {
  if (!cmShortlistOn(g)) return [];
  const value = memValue(g, p), own = p.loan?.from ?? p.club;
  const out: number[] = [];
  for (const [pid, cid] of g.cmSlPairs ?? []) {
    if (pid !== p.id || g.clubs[cid]?.manager === -1) continue;   // (menneskets klubber: deres egen shortliste)
    const st = g.cmPlan?.[cid];
    if (!st || !st.s.length) continue;
    if (st.c >= 100) continue;
    const row = st.s.find((r) => r[3] === p.id) ?? st.s[0];
    const v = fromRow(row).b7 ?? 0;
    if (v > value && cid !== own) out.push(cid);
  }
  return out;
}

/** 0x4d1600 calc_asking_price(sælger, køber, staff, 0, 1, 1) i £ – på en hukommelse af spillerens og køberens klubber (null uden for ønskelisterne) */
export function cmAskingPrice(g: GameState, p: Player, buyer?: number): number | null {
  if (!cmShortlistOn(g) || !p.club) return null;
  const home = p.loan?.from ?? p.club;
  const M = buildWantMem(g, buyer && buyer !== home ? [home, buyer] : [home]);
  const st = M.W.staffOf(p), club = M.W.clubOf(home), b = buyer ? M.W.clubOf(buyer) : 0;
  if (!st || !club) return null;
  M.setRand(cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x4d1600));
  const m = M.c.m;
  // sælgerens (og køberens) pladser: 0x849ce0 ser, om spilleren er indehaver af en af sælgerens pladser (+0x13), og 0x4d28eb bruger pladsen
  const memOf = new Map<number, number>(), byMem = new Map<number, Player>();
  for (const [q, a] of M.W.players) { const id = m.s32(a); memOf.set(q.id, id); byMem.set(id, q); }
  const S: SlMem = { M, m, c: M.c, g, slm: m.u32(m.u32(0xde1f54) + 0x856), memOf, byMem, clubAdr: (cid) => M.W.clubOf(cid), events: [], slotted: new Set() };
  for (const cid of buyer && buyer !== home ? [home, buyer] : [home]) if (g.cmPlan?.[cid]) writeSlots(S, cid, entryOf(g, cid), true);
  {
    const k = getContract(m, st), cl = k ? clubAt(m, m.s32(k + 4)) : 0;
    m.w32(st + 0x52, k && cl ? playerValue_4d0c60(M.c, st, cl, 0, -1, humanClub_600a50(M.c, cl) ? 1 : 0) | 0 : 0);
  }
  // CONTRACT_MANAGER (this = [0xae1050]) ::calc_asking_price(sælger, køber, staff, 0, 1, 1) – som 0x840bfb/0x8402fe kalder den
  const v = slCall(M.c, 0x4d1600, m.u32(G.CM), club, b, st, 0, 1, 1);
  return v | 0;
}

export { isoOf };

/** 0x83a1b0's slutning (spilstarten, efter trupplanen, lønnen og værdierne): 0x83a780 og 0x83b6e0 for alle klubber med plan */
export function cmShortlistStart(g: GameState): SlEvent[] {
  if (!cmShortlistOn(g) || !g.cmPlan || ENV.CM_SL_START === '0') return [];
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const S = buildSlMem(g);
  for (const c of Object.values(g.clubs)) if (g.cmPlan[c.id]) afterPlan(S, c.id, []);
  const ev = finishSl(S);
  (S.m as SparseMem).release();
  if (t0) SL_STATS.startMs += performance.now() - t0;
  return ev;
}

// ---------------------------------------------------------------- dagen (0x5cccd0's klubløkke) – erstatter cmSquadPlanDaily

/** transfers.ts melder, hvem der udfører buddene (undgår en cirkulær import – kaldes, mens modulerne indlæses, derfor på globalThis) */
export function setSlApply(f: (ev: SlEvent[]) => void): void { (globalThis as { __cmSlApply?: (ev: SlEvent[]) => void }).__cmSlApply = f; }
const applyHook = (ev: SlEvent[]) => (globalThis as { __cmSlApply?: (ev: SlEvent[]) => void }).__cmSlApply?.(ev);
/** fejlsøgning: kaldes efter dagens buildSlMem og før finishSl */
export const SL_DIAG: { after?: (S: SlMem) => void; end?: (S: SlMem) => void } = {};
/** målinger: tid pr. del af buildSlMem (ms) */
export const SL_T: Record<string, number> = {};
const now = () => (typeof performance !== 'undefined' ? performance.now() : 0);
const tick = (k: string, t: number) => { const n = now(); SL_T[k] = (SL_T[k] ?? 0) + n - t; return n; };
/** målinger: antal dage, tid (ms), bud */
export const SL_STATS = { days: 0, ms: 0, bids: 0, free: 0, startMs: 0, skipHit: 0, cpuMs: 0 };
/** processens CPU-tid (ms, Node) – målingerne svinger mindre end vægurets på en belastet maskine */
const cpuNow = () => (typeof process !== 'undefined' && process.cpuUsage ? process.cpuUsage().user / 1000 : 0);

/** 0x5cccd0 pr. klub: +8-tælleren og porten (0x844540), 0x83a730 (trupplanen 0x83cb40 → 0x83b6e0) og 0x84a020; så buddene i spillet */
export function cmShortlistDaily(g: GameState, planClub: (cid: number) => { dropped: number[] } | null, gateRand: (cid: number) => (n: number) => number,
  gate: (e: PlanEntry, rand: (n: number) => number, bids: number) => boolean): void {
  if (!cmShortlistOn(g) || !g.cmPlan) return;
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0, c0 = cpuNow();
  const S = buildSlMem(g);
  SL_DIAG.after?.(S);
  dropDeadBids(S);
  let tt = now();
  const off = bidDay(g);
  for (const c of Object.values(g.clubs)) {
    if (!c.league || g.leagues[c.league]?.hidden || !g.cmPlan[c.id]) continue;
    const bids = slotsWithBids(S, c.id);
    readSlots(S, c.id);
    const e = entryOf(g, c.id);
    const go = gate(e, gateRand(c.id), bids);
    storeEntry(g, c.id, e);
    if (go) { const r = planClub(c.id); tt = tick('d.gate', tt); if (r) afterPlan(S, c.id, r.dropped); tt = tick('d.plan', tt); }
    if (!isHumanClub(c.id)) makeBids(S, c.id, off);
    tt = tick('d.bids', tt);
  }
  SL_DIAG.end?.(S);
  const ev = finishSl(S);
  SL_STATS.days++; SL_STATS.bids += ev.filter((x) => x.kind === 'bid').length;
  if (t0) SL_STATS.ms += performance.now() - t0;
  SL_STATS.cpuMs += cpuNow() - c0;
  tt = now();
  applyHook(ev);
  // TRANSFER_MANAGER::daily_update 0x8c5880 → process_due_offer 0x8c63a0: de computer → computer-bud, hvis tid er kommet (også dagens med 0 dage)
  dueHook({
    loanAnswer: (pid, buyer, seller) => loanAnswer_84af00(S, pid, buyer, seller),
    delay: (pid, buyer, site) => offerDelay(S, pid, buyer, site),
    interest: (pid, buyer) => moveInterest(S, pid, buyer),
    rand: (pid, buyer) => cmRand(g.seed ?? 0, pid, buyer, dayNum(g.date), 0x4cd230),
  });
  (S.m as SparseMem).release();
  tick('d.apply', tt);
}

/** det, transfers.ts' dagsbehandling af buddene (cmAiAiDue) må spørge dagens hukommelse om */
export interface SlDueCtx {
  /** shortlist_manager_predict_selling_club_response 0x84af00(sælger, staff, 0, køber, −1, lejebud 1): 0 = sælgeren siger ja til lejen */
  loanAnswer(pid: number, buyer: number, seller: number): number;
  /** 0x8cc5b0 + 0x8c6220 for et nyt bud fra køberen (0x8c0810's nye bud → 0x8be300): dage til svaret */
  delay(pid: number, buyer: number, site: number): number;
  /** accept_transfer_bid 0x8c0080: spillerens vilje 0x846920(staff, køber, 0, 0, status 0x849f00(staff, køber, 0), &ud) – under 0,75 siger han nej */
  interest(pid: number, buyer: number): number;
  /** en talrække til spillerens beslutningsdag */
  rand(pid: number, buyer: number): (n: number) => number;
}
export function setSlDue(f: (cx: SlDueCtx) => void): void { (globalThis as { __cmSlDue?: (cx: SlDueCtx) => void }).__cmSlDue = f; }
const dueHook = (cx: SlDueCtx) => (globalThis as { __cmSlDue?: (cx: SlDueCtx) => void }).__cmSlDue?.(cx);

function loanAnswer_84af00(S: SlMem, pid: number, buyer: number, seller: number): number {
  const id = S.memOf.get(pid), sc = S.clubAdr(seller), bc = S.clubAdr(buyer);
  if (id === undefined || !sc || !bc) return 2;
  refreshClub(S, seller);
  const st = (S.m.u32(G.STAFF) + 0x6e * id) >>> 0;
  S.M.setRand(cmRand(S.g.seed ?? 0, pid, buyer, dayNum(S.g.date), 0x84af00));
  return shared(() => slCall(S.c, 0x84af00, S.slm, sc, st, 0, 0, bc, -1, -1, 1), S) & 0xff;
}
function moveInterest(S: SlMem, pid: number, buyer: number): number {
  const id = S.memOf.get(pid), bc = S.clubAdr(buyer);
  if (id === undefined || !bc) return 0;
  const st = (S.m.u32(G.STAFF) + 0x6e * id) >>> 0;
  refreshClub(S, buyer);
  S.M.setRand(cmRand(S.g.seed ?? 0, pid, buyer, dayNum(S.g.date), 0x8c0080));
  return shared(() => {
    const status = slCall(S.c, 0x849f00, S.slm, st, bc, 0) & 0xff;
    S.m.w32(DELAY_OUT + 8, 0);
    return slCall(S.c, 0x846920, S.slm, st, bc, 0, 0, status, DELAY_OUT + 8);
  }, S);
}
const DELAY_REC = 0x5e7f0200;
function offerDelay(S: SlMem, pid: number, buyer: number, site: number): number {
  const { m } = S;
  const id = S.memOf.get(pid);
  if (id === undefined || !S.clubAdr(buyer)) return 2;
  for (let i = 0; i < 0x48; i++) m.w8(DELAY_REC + i, 0);
  m.w32(DELAY_REC + 8, buyer); m.w32(DELAY_REC + 0xc, id); m.w8(DELAY_REC + 0x11, 0xb);
  S.M.setRand(cmRand(S.g.seed ?? 0, pid, buyer, dayNum(S.g.date), site));
  return shared(() => responseDelay(S, DELAY_REC), S);
}
