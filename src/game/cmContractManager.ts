// CONTRACT_MANAGER::daily_update 0x4c7ac0 på spillets data – computerklubbernes forlængelser, udløb og frigivelser som i CM 01/02 (kun den
// originale database i ægte tilstand, cmActive). Porten selv er cmContract.ts (instruktion for instruktion, kontrolleret mod oraklets
// hukommelse 20/7-2001, 1/2-2002 og 30/6-2002); her bygges originalens poster af spiltilstanden (cmContractGame.ts buildWantMem) og
// CONTRACT_MANAGER's vedvarende tilstand (tilbudslisten +0x34, beslutningsdatoerne +0xc, rækkernes +8/+0xb, kontrakternes +0x25/+0x35/+0x49)
// gemmes i GameState.cmCm og spillets kontrakter mellem dagene.
//
// Hvad funktionen gør for en computerklubs spiller (notes/contract-manager.md; dagen kører tidspunkterne 0, 1 og 2 som 0x5cccd0):
//   – [0xae2330] (31/8 – *estimeret* opdatering: 31/8 i sæsonens startår) − i dag ∈ {7, 30, 42, 60, 70, 91}: forlængelsestilbud (0x4cda70, faktor
//     1,0) efter 180 dage med kontrakten, når den udløber inden 1095 dage (trupstatus 1; 2/3 med omdømme > 6750 eller under 24 år og PA > 100;
//     5 med PA > 100; under 32 år, ikke uven med klubben/manageren).
//   – mere end 182 dage tilbage: intet mere – 0x868210 svarer 1, fordi [0xae233c] = 0 (målt i originalen), så båndene 550/365 nås aldrig.
//   – højst 182 dage tilbage: på båndenes dage (182, 152, 121, 91, 60, 30, 7 dage før) tilbud med faktor 1,0–1,4 efter trupstatus og klubbens
//     plan (0x849ce0); gode spillere (omdømme > 3750, Loyalty < 15, 19–30 år), der vil væk (0x866f60), sættes fri (+0x49 = 1).
//   – udløbsdagen: type 1 (udløbet); sat fri (+0x49) → fri transfer 0x8c1af0; trupstatus 7 og transferlistet → fri transfer 0x8c16b0; ellers bliver
//     han i klubben med den udløbne kontrakt. 31 dage efter: vil han væk (0x866f60) eller er sat fri → fri transfer.
//   – tilbuddene afgøres 1–5 dage senere (4–7 når kontrakten udløber inden 180 dage, højst 14): 0x4ce4e0 vælger det bedste (værdien 0x866830 mod
//     hans ønskede kontrakt 0x85fc50, vægtet med klubbens tiltrækning 0x846920) – underskriften 0x8c38b0 → spillets nye kontrakt.
// Spillets egne systemer for de samme spillere er slået fra (transfers.ts aiRenewals, season.ts' udløb 1/7).
//
// Gating (kun for hastigheden – samme virkning): personløkken køres kun for de spillere, der kan blive berørt i dag (dagene ovenfor, type 1 efter
// 31 dage, Bosman-tjekkets betingelser, forfaldne beslutninger); værdien +0x52 regnes for de byggede spillere (originalen fornyer den hver
// anden dag – 0x4c7ec5). Kun spillere i klubber i de spilbare lande (originalens indlæste personer); udlejede spillere og menneskets klubber
// har spillets eget system.
// *Estimeret*: [0xae2330]'s opdatering, ingen nyheder (0x4d6790/0x4da590/0x4d49a0/0x4d6d70 går kun til mennesket), transfertilbuddene/
// forhandlingerne (TRANSFER_MANAGER 0x8c5cf0/0x8c5e40/0x8c1870 = spillets åbne bud på spilleren), karrierens slut 0x7a7eb0 = Player.cmRetire,
// ønskelisterne 0x842c00 (intet), sign_contract 0x4cf720's felter (+0x3d.. som cmPlayerData newCmContract).
import type { Contract, GameState, Player } from './types';
import { G, clubAt, getContract, type CmMem } from './cmMem';
import { buildWantMem, applyCmTerms, type CmTerms, type WantMem } from './cmContractGame';
import { contractDailyUpdate_4c7ac0, listAdd_68d0d0, listInit_68d020, listNext_68d1b0 } from './cmContract';
import { humanClub_600a50 } from './cmWageGame';
import { slCall } from './cmShortlist';
import { cmActive, cmRand, newCmContract, statusCode } from './cmPlayerData';
import { isHumanClub } from './humans';
import { setClub } from './state';
import { ageOn } from './dates';
import { ATTRS } from './attributes';
import { HEAP0, HEAP_PTR } from './cmGen/x86';
import { addFavClub, addFavPerson, managerStaff, personKey } from './cmRelations';
import { cmSignContractMorale } from './cmMedia';

const GBP = 0.86;
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
  if (!c || isHumanClub(c.id) || g.leagues[c.league]?.hidden) return false;
  return g.activeNations?.includes(c.nation) ?? true;
}
/** Porten styrer computerklubbernes kontrakter i dette spil */
export const cmCmOn = (g: GameState) => !OFF && cmActive(g) && !g.draft;

/** [0xae2330]: 31/8 i sæsonens startår (*estimeret*) */
function date2330(iso: string): number {
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7);
  return dayNum(`${m >= 7 ? y : y - 1}-08-31`);
}

/** kan personløkken gøre noget for spilleren i dag? (en overmængde af 0x4c7dea–0x4c9d26's betingelser) */
function candidate(g: GameState, p: Player, T: number, A: number): boolean {
  const k = p.contract!;
  const E = dayNum(k.expires), type = k.cmType ?? 2;
  if (type === 1) return T > E + 31;
  if (A > T && BLOCK_A.has(A - T) && E < T + 1095) return true;
  const due = E - T;
  if (due > 182) return false;
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
  if (!cmCmOn(g)) return;
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const S: CmCmState = (g.cmCm ??= { dec: [], off: [], row: {} });
  const T = dayNum(g.date), A = date2330(g.date);
  // kandidaterne og de forfaldne beslutninger
  const cands: Player[] = [];
  for (const p of Object.values(g.players)) if (cmCmScope(g, p) && candidate(g, p, T, A)) cands.push(p);
  const due = new Set<number>();
  for (const d of S.dec) if (dayNum(dayIso(d[1], d[2])) <= T) due.add(d[0]);
  const clubs = new Set<number>(cands.map((p) => p.club));
  for (const pid of due) { const p = g.players[pid]; if (p?.club && g.clubs[p.club]) clubs.add(p.loan?.from ?? p.club); }
  CMD_STATS.days++;
  if (!clubs.size) { if (t0) CMD_STATS.ms += performance.now() - t0; return; }
  const signed: { p: Player; k: number }[] = [], released: Player[] = [];
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
        // TRANSFER_MANAGER: spilleren er med i et bud/en handel – spillets åbne bud (*estimeret*)
        const p = pOf(a[1] >>> 0);
        return p && g.offers.some((o) => o.player === p.id && (o.status === 'pending' || o.status === 'negotiating' || o.status === 'countered' || o.status === 'accepted')) ? 1 : 0;
      }
      case 0x8c16b0: case 0x8c1af0: { const p = pOf(a[1] >>> 0); if (p && !released.includes(p)) released.push(p); return 0; }
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
  M.setRand(cmRand(g.seed ?? 0, T, 0x4c7ac0));
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
  // de tre tidspunkter (0: de faste datoer, 2: personløkken – kun kandidaterne, i id-rækkefølge)
  const only = cands.map((p) => W.staffOf(p)).filter((st) => st).sort((a, b) => m.s32(a) - m.s32(b));
  for (let slice = 0; slice <= 2; slice++) {
    m.w8(G.SLICE, slice);
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
  // frigivelserne: fri transfer (spilleren forlader klubben uden kontrakt)
  for (const p of released) {
    if (!p.club) continue;
    setClub(p, 0);
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
}

/** Kontrakten (80 bytes) efter sign_contract som spillets kontrakt; Signing On Fee betales af klubben, moralen +20 (cmMedia.ts) */
function applySigned(g: GameState, p: Player, m: CmMem, k: number): void {
  const club = g.clubs[p.club];
  if (!club || !p.contract) return;
  const eur = (v: number) => Math.max(0, Math.round(v / GBP));
  const cl = [0, 1, 2, 3, 4].map((i) => m.u8(k + 0x1c + i));
  const t: CmTerms = {
    wage: eur(m.s32(k + 0xc)), expires: dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)), signOn: eur(m.s32(k + 8)),
    bonusGbp: [m.s32(k + 0x10), m.s32(k + 0x14), m.s32(k + 0x18)], clauses: cl, clauseFee: cl.some((x) => x) ? eur(m.s32(k + 0x21)) : 0,
    partTime: (m.u8(k + 0x35) & 0x80) !== 0, offered: true, raw: { wage: m.s32(k + 0xc), value: 0 },
  };
  const c: Contract = { wage: t.wage, expires: t.expires };
  applyCmTerms(c, t);
  c.cmStart = g.date;
  p.contract = c;
  const status = (m.u8(k + 0x4f) >> 4) & 0xf;
  p.cmContract = { ...newCmContract(status || statusCode(p)), b4e: m.u8(k + 0x4e), b4f: m.u8(k + 0x4f) };
  if (t.signOn > 0) { club.balance -= t.signOn; club.finance.signOn = (club.finance.signOn ?? 0) + t.signOn; }
  cmSignContractMorale(g, p);
}
