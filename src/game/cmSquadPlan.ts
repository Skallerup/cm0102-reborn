// Computerens trupplan 0x83cb40 (cm0102.exe 3.9.68, afkodet 12/11-2026; noten ~/cm0102-engine/notes/83cb40-squad-plan.md): de 40 pladser pr. klub
// (0x83c090 – rolle og positionsmaske pr. formation), fordelingen af truppen på pladsernes tre grupper med 0x6e2000 (udvælgelsesværdien 0x6e2f20,
// roleScore.ts), trupstatus (kontrakt +0x4f høj nibble: 1 nøglespiller … 7 ikke nødvendig), lejelisten (+0x4e bit 2), transferlisten (0x842320,
// +0x4e bit 1), fritstilling (0x8c16b0), reserve/førsteholdet (0x4cc0b0/0x4cc0f0, staff +0x5e bit 0) og kontraktens +0x3d/+0x3e/+0x3f ved første kald.
// Kaldt ved spilstart for alle klubber (0x83a1b0: arg3 = 0, arg4 = 1), dagligt fra 0x5cccd0 for klubber, hvis tæller (+8, højst 200) er over
// rand(70) + 30 og rand(5) = 0 (0x83a730: arg3 = 1, arg4 = 0), og ved et managerskifte (0x84abe0: 0, 1).
//
// Ren funktion over originalens felter: planSquad(entry, ind, ctx) – ind = klubbens og truppens poster (som i hukommelsen), ctx = de kald, planen laver
// (0x6e6340, 0x6e2f20 via 0x6e2000, 0x6e86d0, rand og sidevirkningerne). cmSquadPlanGame.ts fylder dem af vores spil; scripts/sq-trace-check.ts af den
// instrumenterede originals spor (match_trace.c RECOMP_SQ_TRACE).
//
// Ikke porteret (transfermarkedets del – *uden for* trupstatus): ønskelisten (+0xf/+0x13/+0x17 med datoen +0x1b: 0x844540 tæller mål, 0x843e10 fjerner
// dem, 0x83b6e0/0x84a020 og halen 0x83ebe9–0x83f32b søger og prioriterer mål, pladsens +3/+7/+0xb), B-holdene 0x540a50 (spanske/tyske/portugisiske
// og engelske klubbers reservehold – arg partner), stemningen +5 (0x83bf40).

import { assignSquad } from './engine/grid/pickTeam';

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const ftol = Math.trunc;
const tdiv = (a: number, b: number) => Math.trunc(a / b);
const f32 = Math.fround;

/** En plads (0x25 bytes): +0 rolle (0xb spiller, 6–10 staben), +1 positionsmaske, +0x24 gruppen i bit 1–4, +0xf mål/indehaver, +0x13 indehaveren,
 *  +0x17, +0x23 indekset, +0x1b dato (dag, år) */
export interface PlanSlot { role: number; mask: number; b24: number; f: number; s13: number; s17: number; idx: number; day: number; year: number }
/** Klubbens post i planlæggeren ([this+0xdc] + 9·klub): pladserne, +4 tilstanden, +7 formationen, +8 tælleren */
export interface PlanEntry { slots: PlanSlot[]; state: number; form: number; counter: number }

export const newPlanEntry = (): PlanEntry => ({
  slots: Array.from({ length: 40 }, () => ({ role: 0xb, mask: 0, b24: 0x1e, f: -1, s13: -1, s17: -1, idx: -1, day: 1, year: 1997 })),
  state: 0, form: 0, counter: 0,
});

/** 0x83c090: pladsernes positionsmasker pr. formation (+7 = managerens yndlingsformation, ikke-spiller +0x43; 1..9, ellers standarden) */
const FORMATION_MASKS: Record<number, number[]> = {
  0: [0x1, 0x804, 0x84, 0x404, 0x104, 0x810, 0x90, 0x410, 0x110, 0x440, 0x140, 0x4, 0x8, 0x10, 0x10, 0x20, 0x40, 0x4, 0x10, 0x1, 0x40, 0x4, 0x10, 0x10, 0x1],
  1: [0x1, 0x808, 0x88, 0x404, 0x2, 0x104, 0x410, 0x220, 0x110, 0x440, 0x140, 0x8, 0x210, 0x90, 0x810, 0x240, 0x220, 0x2, 0x210, 0x1, 0x40, 0x4, 0x8, 0x10, 0x1],
  2: [0x1, 0x808, 0x88, 0x404, 0x204, 0x104, 0x410, 0x220, 0x110, 0x440, 0x140, 0x8, 0x210, 0x90, 0x810, 0x240, 0x220, 0x204, 0x210, 0x1, 0x40, 0x4, 0x8, 0x10, 0x1],
  3: [0x1, 0x804, 0x84, 0x404, 0x104, 0x810, 0x90, 0x410, 0x110, 0x440, 0x140, 0x4, 0x4, 0x10, 0x10, 0x220, 0x240, 0x204, 0x210, 0x1, 0x40, 0x4, 0x8, 0x10, 0x1],
  4: [0x1, 0x804, 0x84, 0x404, 0x104, 0x210, 0x90, 0x810, 0x140, 0x440, 0x240, 0x4, 0x4, 0x10, 0x10, 0x140, 0x440, 0x4, 0x10, 0x1, 0x40, 0x4, 0x10, 0x40, 0x1],
  5: [0x1, 0x804, 0x84, 0x404, 0x104, 0x820, 0xa0, 0x410, 0x110, 0x440, 0x140, 0x4, 0x4, 0x10, 0x20, 0x440, 0x140, 0x204, 0x10, 0x1, 0x40, 0x4, 0x20, 0x10, 0x1],
  6: [0x1, 0x810, 0x90, 0x404, 0x204, 0x104, 0x410, 0x208, 0x110, 0x440, 0x140, 0x8, 0x210, 0x90, 0x810, 0x240, 0x220, 0x204, 0x8, 0x1, 0x40, 0x4, 0x10, 0x10, 0x1],
  7: [0x1, 0x804, 0x84, 0x404, 0x104, 0x208, 0x220, 0x410, 0x110, 0x140, 0x440, 0x4, 0x4, 0x10, 0x10, 0x220, 0x240, 0x204, 0x10, 0x1, 0x40, 0x4, 0x10, 0x10, 0x1],
  8: [0x1, 0x804, 0x84, 0x404, 0x104, 0x810, 0x90, 0x410, 0x110, 0x210, 0x240, 0x4, 0x4, 0x10, 0x10, 0x220, 0x240, 0x204, 0x10, 0x1, 0x40, 0x4, 0x10, 0x10, 0x1],
  9: [0x1, 0x204, 0x404, 0x104, 0x810, 0x90, 0x410, 0x110, 0x210, 0x140, 0x440, 0x4, 0x4, 0x10, 0x10, 0x220, 0x240, 0x204, 0x10, 0x1, 0x40, 0x4, 0x10, 0x10, 0x1],
};
/** 0x83c0ab–0x83c10a: pladserne 25–39 er staben (rolle efter tabellen 0x83cad4: 6, 7, 5 × 8, 0xa, 7 × 9), gruppe 1 */
const STAFF_ROLES = [6, 7, 8, 8, 8, 8, 8, 0xa, 9, 9, 9, 9, 9, 9, 9];
export function buildSlots(e: PlanEntry): void {
  e.slots.forEach((s, i) => {
    if (i < 25) s.role = 0xb;
    else { s.b24 = (s.b24 & 0xe3) | 2; s.role = STAFF_ROLES[i - 25]; }
  });
  const m = FORMATION_MASKS[e.form >= 1 && e.form <= 9 ? e.form : 0];
  for (let i = 0; i < 25; i++) e.slots[i].mask = m[i];
}
/** gruppen i +0x24 bit 1–4 */
export const slotGroup = (s: PlanSlot) => (s.b24 >> 1) & 0xf;
const setGroup = (s: PlanSlot, g: number) => { s.b24 = (s.b24 & 0xe1) | (g << 1); };

/** Kontrakten med klubben (0x4cf5f0, 80 bytes): de felter, planen læser og skriver */
export interface PlanContract {
  b3d: number; b3e: number; b3f: number; b45: number; b49: number; b4e: number; b4f: number; b35: number;
  /** +0x2d/+0x2f: udløbsdatoen (dag i året, år); +0xc: lønnen */
  endDay: number; endYear: number; wage: number;
}
export interface PlanPlayer {
  /** staff +0: id; id ≥ [0xae2364] = genereret (regen) */
  id: number; generated: boolean;
  /** +0x3d jobbet (0xb spiller, 0x10 …), +0x18 alder, +0x39 klubben (id, −1 ingen), +0x5a Pressure, +0x5b Professionalism, +0x52 værdien */
  job: number; age: number; clubId: number; b5a: number; b5b: number; value: number;
  /** +0x3e/+0x40 kom til klubben */
  joinedDay: number; joinedYear: number;
  /** spillerposten (+0x61, 0x46 bytes som i hukommelsen) – +5 CA, +7 PA, +0xb nuværende og +0xd verdensomdømme, +0xf GK */
  rec: ArrayLike<number> | null;
  /** 0x4cf5f0(staff, klub) */
  contract: PlanContract | null;
  /** 0x62ed70: skadens +0x2c (null = ingen skade), 0x62ece0: den tilbagevendende skades niveau, 0x7a7ed0(s, 1): karrieren slutter */
  injW2c: number | null; recurring: number; retiring: boolean;
  /** 0x4cf6d0 (lejekontrakt), 0x8c1870 (i transferlisten +0x92c), 0x8cca10(s, 0) (et bud),
   *  0x8c5cf0(s, 0, 0) og 0x8c5e40(s, 0) (forhandlinger); 0x849ce0 regnes af pladserne */
  loan: boolean; inTransfer: boolean; bid: boolean; deal1: boolean; deal2: boolean;
  /** 0x62c3d0: trætheden */
  fatigue: number;
}
const W = (r: ArrayLike<number> | null, o: number) => (r ? s16(r[o] | (r[o + 1] << 8)) : 0);
const B = (r: ArrayLike<number> | null, o: number) => (r ? s8(r[o]) : 0);

export interface PlanInput {
  clubId: number;
  /** arg3 (det daglige kald) og arg4 (første gang: pladserne bygges, +0x3d/+0x3e/+0x3f sættes) */
  daily: boolean; first: boolean;
  /** klub +0x80 omdømmet, +0x64 status (3 = springes over), landsholdet 0x53b900, +0x53 ≠ 0 */
  rep: number; status: number; national: boolean; hasNation: boolean;
  /** klubbens land +0x11c, ligaen +0x57 og [0xadadfc][liga] ≠ 0 (aktiv liga) – alle tre: ingen tilfældig springen over (0x83cc68) */
  activeLeague: boolean;
  /** 0x600a50(klub, 0, 1, 0, 0) og (klub, 1, 1, 0, 0): et menneske styrer klubben */
  human1: boolean; human2: boolean;
  /** 0x5fd210(…) ≠ 0 for menneskets klub ([esp+0x30]) – vi har ingen: = human2 */
  humanSettings: boolean;
  /** 0x540a50: reserveholdet (out ≠ 0 – planen tager dets spillere med, [esp+0x3c]); partnerIsParent = klubben ER et B-hold (planen springes over) */
  bTeam: boolean; partnerIsParent: boolean;
  /** [esp+0x18] ≠ 0: +0x1db (Europa) > −1 og (≠ [0x9cf6f8] eller omdømme < 5000), ellers [0xae2d14][6·klub] > −1 */
  x18: boolean;
  /** klubbens manager +0xcf (staff-id, null = ingen) og hans yndlingsformation (ikke-spiller +0x43; null = ingen ikke-spillerpost) */
  managerId: number | null; managerForm: number | null; managerJoinedDay: number; managerJoinedYear: number;
  /** 0x7bca90(klub, &R, 0): T (resultatet) og R */
  T: number; R: number;
  /** dage siden [0xdd6ec8] (spillets start) */
  daysSinceStart: number;
  /** i dag (dag i året, år) – [0xae2c90] */
  today: { day: number; year: number };
  /** 0x541f90(klub): truppen (+0xd7, 50 pladser) i rækkefølge – kun rigtige spillere (id < [0xae2364]) */
  squad: PlanPlayer[];
}

export interface PlanCtx {
  rand: (n: number) => number;
  /** 0x6e6340(staff, maske, flag, klub, −1, menneskets manager) */
  value: (p: PlanPlayer, mask: number, flags: number) => number;
  /** 0x6e2f20 for 0x6e2000(…, flag, klub, 0, manager +0xcf, 1): kandidaten på pladsen med masken */
  role: (p: PlanPlayer, mask: number, flags: number) => number;
  /** 0x6e86d0(manager +0xcf, staff, klub, kind, hint) */
  judge: (p: PlanPlayer, kind: 1 | 2, hint: number) => number;
  /** 0x4cc0b0 (til førsteholdet), 0x4cc0f0 (til reserverne) */
  promote: (p: PlanPlayer) => void;
  demote: (p: PlanPlayer) => void;
  /** 0x842320(staff, notFirst): transferlisten (+0x4e |= 1, status 7) – sættes også her i kontrakten */
  transferList: (p: PlanPlayer, notFirst: boolean) => void;
  /** 0x8c16b0(staff, 0, −1): fritstilling */
  release: (p: PlanPlayer) => void;
  /** 0x4cb250(staff, klub, kontrakt) */
  unhappy: (p: PlanPlayer) => void;
  /** 0x53c590(klub, 0, 0): placeringen i ligaen */
  leaguePos: () => number;
  /** kun sammenligning med sporet: fordelingen 0x6e2000 givet udefra (ellers assignSquad med role) */
  assign?: (masks: number[], flags: number, cand: PlanPlayer[]) => (PlanPlayer | null)[];
}

const CLAMP100 = (v: number) => (v > 100 ? 100 : v < -100 ? -100 : v);
const setStatus = (c: PlanContract, st: number) => { c.b4f = (c.b4f & 0xf) | (st << 4); };
const dayNo = (d: number, y: number) => {
  // Date::get_difference 0x54cdb0: dage fra 1/1 år 0 (dag i året 0..365, år)
  let n = 0;
  for (let k = 1990; k < y; k++) n += k % 4 === 0 && (k % 100 !== 0 || k % 400 === 0) ? 366 : 365;
  for (let k = y; k < 1990; k++) n -= k % 4 === 0 && (k % 100 !== 0 || k % 400 === 0) ? 366 : 365;
  return n + d;
};

/** Udfaldet til sporet/spillet */
export interface PlanResult { ran: boolean; groups: { A: number[]; B: number[]; C: number[] } }

/** 0x83cb40 */
export function planSquad(e: PlanEntry, ind: PlanInput, ctx: PlanCtx): PlanResult {
  const res: PlanResult = { ran: false, groups: { A: [], B: [], C: [] } };
  let first = ind.first;
  if (e.slots[0].idx === -1) first = true;                                     // 0x83cbb4: +0x23 = 0xff
  e.counter = 0;
  const exit = () => { e.state = 0; return res; };
  if (ind.national || !ind.hasNation) return exit();                           // 0x83cbc3
  if (ind.human1 && ind.daily) return exit();
  if (ind.status === 3) return exit();
  if (ind.partnerIsParent) return exit();
  const Bt = ind.bTeam;
  // 0x83cc2b: 0x844540 (ønskelistens åbne mål) – ingen hos os (ikke porteret)
  if (e.state === 2) { e.state = 1; first = true; }
  if (!ind.activeLeague && ind.rep < 4000) {                                   // 0x83cc88
    const a = ctx.rand(ind.rep + 1000), b = ctx.rand(5000);
    if (a < b) return exit();
  }
  res.ran = true;
  e.state = 1;
  const T = ind.T, R = ind.R, F44 = ind.human1 ? 0x800 : 0x1802;
  const X30 = ind.humanSettings;
  // ---------------------------------------------------------------- pladserne (første gang) – 0x83cde2
  let big = false;                                                             // [esp+0x78]
  if (first) {
    e.form = ind.human1 || ind.managerId === null ? 0 : ind.managerForm === 0 ? 0 : ind.managerForm ?? 3;
    buildSlots(e);
    e.slots.forEach((s, i) => {
      s.idx = i; s.day = 1; s.year = 1997;                                     // 0x549ef0(1, 1997)
      if (i === 0) { setGroup(s, 2); return; }
      if (i < 24 && s.mask === 1) { setGroup(s, 4); return; }
      if (!Bt && !ind.human2) {
        if ((ind.x18 && R >= 6000) || R >= 8500) { big = true; setGroup(s, i < 20 ? 3 : 5); return; }
        setGroup(s, i < 11 ? 2 : i < 20 ? 4 : 5); return;
      }
      if (R < 6000 && !Bt) { setGroup(s, i < 11 ? 2 : i < 20 ? 4 : 5); return; }
      big = true; setGroup(s, i < 19 ? 3 : Bt ? 4 : 5);
    });
  } else e.slots.sort((a, b) => (a.idx - b.idx) || 1);                         // 0x945333 med 0x83b6c0
  // ---------------------------------------------------------------- pladsernes masker i grupperne – 0x83cff9
  const mA: number[] = [], mB: number[] = [], mC: number[] = [];
  const todayNo = dayNo(ind.today.day, ind.today.year);
  for (const s of e.slots) {
    if (s.f > -1) {
      if (s.s17 !== -1) continue;
      const passed = s.year < ind.today.year || (s.year === ind.today.year && s.day < ind.today.day);
      if (!passed) continue;                                                   // (målets job 0x10 – ingen ønskeliste hos os)
    }
    s.f = -1; s.s13 = -1;
    if (s.role !== 0xb) continue;
    const g = slotGroup(s);
    if (g === 2 || g === 3) mA.push(s.mask); else if (g === 4) mB.push(s.mask); else if (g === 5) mC.push(s.mask);
  }
  // ---------------------------------------------------------------- truppen – 0x83d1c7
  const main: (PlanPlayer | null)[] = new Array(50).fill(null);
  let bl = 0;
  const loanIn: PlanPlayer[] = [];
  for (const p of ind.squad.slice(0, 50)) {
    // 0x849ce0(klub, staff, 0, 0): en spillerplads har ham som mål (+0xf) – efter gennemgangen ovenfor kun de fremtidige mål
    if (p.generated || !p.rec || p.job === 0x10 || e.slots.some((s) => s.f === p.id && s.role === 0xb)) continue;
    const c = p.contract;
    if (!c || p.bid || c.b49) continue;
    if (!X30) {                                                                // 0x83d281
      c.b4e &= 0xfc;
      setStatus(c, p.age < 20 ? 6 : ind.human1 ? 0 : 7);
      ctx.promote(p);
    } else if (first && !ind.human2) setStatus(c, p.age < 20 ? 6 : 0);
    let thr = 150;
    if (ctx.rand(p.recurring + 1) !== 0) thr = 30;                             // 0x83d33f
    else if (p.injW2c !== null) {
      const v = ctx.value(p, 0xffff, F44 | 0x6c0);
      if (v >= T) thr = 400; else if (!(f32(T) * 0.75 > v)) thr = 300;
    }
    if ((p.injW2c !== null && s16(p.injW2c) >= thr) || p.retiring) {          // 0x83d3d8: udenfor
      if (!Bt || (p.injW2c !== null && s16(p.injW2c) > 300)) ctx.demote(p);
      if (ind.human1) setStatus(c, 0);
      continue;
    }
    if (p.loan && p.clubId !== ind.clubId) loanIn.push(p); else main[bl++] = p;
    if (first) c.b3d = 0;
  }
  const remove = (picked: (PlanPlayer | null)[]) => {
    for (const p of picked) {
      if (!p) continue;
      for (let j = 0; j < bl; j++) if (main[j] === p) { main[j] = main[bl - 1]; main[bl - 1] = null; bl--; }
    }
  };
  const assign = (masks: number[], flags: number): (PlanPlayer | null)[] => {
    const cand = main.slice(0, bl) as PlanPlayer[];
    if (ctx.assign) return ctx.assign(masks, flags, cand);
    const memo = new Map<string, number>();
    const sc = (j: number, i: number) => {
      const k = `${j}|${i}`;
      let v = memo.get(k);
      if (v === undefined) { v = ctx.role(cand[i], masks[j], flags); memo.set(k, v); }
      return v;
    };
    const out = assignSquad(cand.length, masks.length, 0, sc, sc, (i) => B(cand[i].rec, 0xf), (j) => (masks[j] & 1) === 1);
    return out.map((i) => (i === null ? null : cand[i]));
  };
  // 0x83d474: gruppe A (2/3), B (4), C (5)
  const outA = mA.length ? assign(mA, ind.human2 ? F44 | 0xc100c0 : F44 | 0xc0) : [];
  remove(outA);
  const outB = mB.length ? assign(mB, F44 | 0x1c0) : [];
  remove(outB);
  for (const p of loanIn) main[bl++] = p;
  const old: PlanPlayer[] = [];
  for (let j = 0; j < bl; j++) {                                               // 0x83d6f0: de ældre (alder > GK/10 + 22) uden for gruppe C
    const p = main[j]; if (!p) continue;
    if (p.age > tdiv(B(p.rec, 0xf), 10) + 22) { old.push(p); main[j] = main[bl - 1]; main[bl - 1] = null; bl--; j--; }
  }
  const outC = mC.length ? assign(mC, F44 | 0x100) : [];
  remove(outC);
  for (const p of old) main[bl++] = p;
  res.groups = { A: outA.map((p) => p?.id ?? -1), B: outB.map((p) => p?.id ?? -1), C: outC.map((p) => p?.id ?? -1) };
  // ---------------------------------------------------------------- de øvrige – 0x83d8ac
  for (let j = 0; j < 50; j++) surplus(main[j]);
  function surplus(p: PlanPlayer | null): void {
    if (!p) return;
    if (p.loan) {
      if (p.clubId === ind.clubId) return;
      if (Bt && W(p.rec, 0xd) >= 5000) return;
      ctx.demote(p); return;
    }
    if (p.clubId !== ind.clubId) return;
    const c = p.contract; if (!c) return;
    const age = s8(p.age);
    if (p.inTransfer) { if (first) c.b3d = -100; return; }
    const agePen = ftol((age * 0.13 - 1.98) * R * 0.02);
    const k24 = tdiv(R, 68) - 35;
    const V = ftol(W(p.rec, 0xb) * 0.25 + W(p.rec, 7) * 12.5 + W(p.rec, 5) * 12.5 + s16(ind.rep) * 0.25);
    const keepOrDemote = () => { if (Bt && W(p.rec, 0xd) >= 5000) return; ctx.demote(p); };
    if (p.job === 0xb && s16(ctx.judge(p, 1, V)) < s16(agePen)) {            // 0x83da02: for svag til sin alder
      let sell = true;
      if ((c.b35 & 0x3f) === 2) {
        const atClub = todayNo - dayNo(p.joinedDay, p.joinedYear), left = dayNo(c.endDay, c.endYear) - todayNo;
        if (atClub <= s8(p.b5b) + s8(p.b5a) + 450 || left >= 450) sell = false;   // 0x83da3f jle, 0x83da5f jge → 0x83db75
      }
      if (sell && p.value >= s16(ind.rep) * 50) sell = false;
      if (sell) {
        const days = ((c.endYear & 0xffff) - (ind.today.year & 0xffff)) * 365 + s16(c.endDay) - s16(ind.today.day);
        if (p.value >= tdiv(Math.imul(days, c.wage), 30)) sell = false;
      }
      if (sell) {
        if (!ind.human2 && !first && !p.deal1 && !p.deal2 && !p.inTransfer && s8(ctx.leaguePos()) > tdiv(s16(ind.rep), 500) + 25) ctx.release(p);
        keepOrDemote(); return;
      }
      // 0x83db75
      if (s8(ctx.leaguePos()) > tdiv(s16(ind.rep), 500) + 20) {
        if (first) { c.b3d = -100; c.b3e = 0; c.b3f = 0; ctx.unhappy(p); }
        if (!ind.human2 && s16(ctx.judge(p, 2, V)) < s16(k24)) {
          if (age > tdiv(B(p.rec, 0xf), 5) + 21 || W(p.rec, 0xb) > tdiv(s16(ind.rep), 2)) { ctx.transferList(p, !first); c.b4e |= 1; setStatus(c, 7); }
        }
      }
      keepOrDemote(); return;
    }
    // 0x83dc70: ung eller lovende – lån ud / reserverne
    if (X30) return;
    if (first) { c.b3d = -50; c.b3e = 0; c.b3f = 0; ctx.unhappy(p); }
    keepOrDemote();
    if (Bt || ind.human1) {                                                    // 0x83ddb7
      const gk = B(p.rec, 0xf) === 20;
      if (age >= (gk ? 27 : 23)) return;
      const j = s16(ctx.judge(p, 1, ftol(s16(V) * 0.75)));
      setStatus(c, j > s16(agePen) + 20 ? 5 : 6);
      return;
    }
    const b = s8(c.b3d);
    if (b >= 0 || p.job !== 0xb) return;
    const gk = B(p.rec, 0xf) === 20;
    if (age <= (gk ? 19 : 17)) return;
    if (b > tdiv(age * 50, 3) - (gk ? 433 : 400)) return;
    c.b4e |= 2;
    if (age < 24) setStatus(c, 6);
  }
  // ---------------------------------------------------------------- gruppe A: nøglespiller/førstehold – 0x83de85 (kun computeren)
  if (!X30) outA.forEach((p, k) => {
    if (!p || p.clubId !== ind.clubId) return;
    const c = p.contract; if (!c) return;
    const fl = (F44 | 0xc0) | (ind.human2 ? 0x810000 : 0);
    const own = ctx.value(p, mA[k], fl);
    let best = 0;
    const cmp = (q: PlanPlayer | null) => { if (q) { const v = ctx.value(q, mA[k], fl); if (!(best > v)) best = v; } };
    outA.forEach((q, m) => { if (m !== k) cmp(q); });
    outB.forEach(cmp); outC.forEach(cmp);
    for (let j = 0; j < bl; j++) cmp(main[j]);
    if (best > own) best = own;
    const den = own >= 1 ? own : 1;
    const x = s8(ftol((f32(100) - (best / den) * 100) * f32(0.5)));
    const cl = s8(x + s8(20 - tdiv(x, 5)));
    if (first) {
      c.b3d = CLAMP100(s8(c.b3d) + cl);
      let q = tdiv(cl, 10); if (q > 100) q = 100;
      c.b3f = q; c.b3e = 0;
    }
    if (cl > 20) setStatus(c, cl >= 30 && own > T ? 1 : 2);
  });
  // ---------------------------------------------------------------- pladsernes indehavere og gruppestatus – 0x83e185
  let si = 0;
  const nextSlot = () => { while (si < 40 && e.slots[si].f > -1) si++; return e.slots[si]; };
  const later = (p: PlanPlayer, s: PlanSlot) => {                              // 0x83e25d: kom efter manageren → datoen i dag + 120
    if (!first || ind.managerId === null) return;
    if (p.joinedYear > ind.managerJoinedYear || (p.joinedYear === ind.managerJoinedYear && p.joinedDay > ind.managerJoinedDay)) {
      const t = addDays(ind.today.day, ind.today.year, 120); s.day = t.day; s.year = t.year;
    }
  };
  outA.forEach((p) => {
    const s = nextSlot();
    if (!p) { s.s13 = -1; s.f = -1; si++; return; }
    s.s13 = p.id;
    const c = p.contract;
    if (!X30 && c) { const st = c.b4f >> 4; if (st !== 1 && st !== 2) setStatus(c, slotGroup(s)); }
    later(p, s);
    si++;
  });
  outB.forEach((p) => {
    const s = nextSlot();
    if (!p) { s.s13 = -1; si++; s.f = -1; return; }
    s.s13 = p.id;
    const c = p.contract;
    if (!X30 && c) setStatus(c, slotGroup(s));
    later(p, s);
    si++;
    if ((Bt || ind.human1) && si === 25 && p.id !== ind.managerId && !big) ctx.demote(p);
    if (s16(p.fatigue) < -1000 && W(p.rec, 0xb) < 4500 && c && s8(c.b3d) < -50) c.b4e |= 2;
  });
  outC.forEach((p) => {
    const s = nextSlot();
    if (!p) { s.s13 = -1; si++; s.f = -1; return; }
    s.s13 = p.id;
    const c = p.contract;
    if (!X30 && c) setStatus(c, slotGroup(s));
    later(p, s);
    si++;
    if (!Bt && p.id !== ind.managerId) ctx.demote(p);
    const lim = -500 - ctx.rand(300);
    if (s16(p.fatigue) < lim && c && s8(c.b3d) < 0) c.b4e |= 2;
  });
  // ---------------------------------------------------------------- pladsernes vurdering – 0x83e66f (status 6 for gruppe 5's svage)
  const byId = new Map(ind.squad.map((p) => [p.id, p]));
  for (const s of e.slots) {
    if (s.f > -1 || s.role !== 0xb) continue;
    let thr = T < 36000 ? T : 36000;
    if (s.mask === 1 && s.s13 === -1) thr = ftol(thr * 0.75);
    if (s.s13 <= -1) { s.f = -1; continue; }
    const p = byId.get(s.s13);
    if (!p) continue;
    const c = p.contract;
    const g = slotGroup(s);
    let v = 0;
    if (g === 2 || g === 3) {
      if (c && first) { c.b3d = CLAMP100(s8(c.b3d) + 50); c.b3f = 10; c.b3e = 0; }
      ctx.promote(p);
      v = ctx.value(p, s.mask, ind.human2 ? F44 | 0x8100c0 : F44 | 0xc0);
      if (ind.daysSinceStart < 200) v = ftol((1.25 - ind.daysSinceStart * 0.00125) * v);
    } else if (g === 4) {
      ctx.promote(p);
      v = ctx.value(p, s.mask, F44 | 0x1c0);
    } else if (g === 5) {
      if (p.id !== ind.managerId && (!Bt || W(p.rec, 0xd) < 5000)) ctx.demote(p);
      v = ctx.value(p, s.mask, F44 | 0x100);
    } else continue;
    if (v < -10000) v = -10000; else if (v > 60000) v = 60000;
    if (v >= thr && (!c || !c.b45 || (!(c.b45 & 0x100) && !(c.b45 & 1) && dayNo(c.endDay, c.endYear) - todayNo >= 365))) { s.f = p.id; continue; }
    const al = s8(ftol((1 - v / thr) * -100));
    const g2 = s.b24 & 0x1e;
    if (c) {
      if (first) c.b3d = CLAMP100(s8(c.b3d) + al);
      if (g2 === 4 || g2 === 6) { if (s8(c.b3d) < 25 && first) c.b3d = 25; s.f = -1; }
      else if (s8(c.b3d) < 0 && first) c.b3d = 0;
      if (!X30 && g2 === 0xa) setStatus(c, 6);
    } else if (g2 === 4 || g2 === 6) s.f = -1;
  }
  return res;
}

/** Date + n dage (0x54c5b0) */
function addDays(day: number, year: number, n: number): { day: number; year: number } {
  let d = day + n, y = year;
  for (;;) {
    const len = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 366 : 365;
    if (d < len) return { day: d, year: y };
    d -= len; y++;
  }
}

// ---------------------------------------------------------------- 0x7bca90: klubbens styrkemål (T) og omdømmemålet (R)

export interface StrengthInput {
  /** klub +0x80 omdømmet, +0x77 (club.dat 119, mindste tilskuertal), +0x64 status (1 = professionel) */
  rep: number; minAtt: number; status: number;
  /** ligaen +0x57 → +0x69 (word; null = ingen liga) og [0xadadfc][liga] ≠ 0 (aktiv) */
  leagueRep: number | null; leagueActive: boolean;
  /** +0x1db's Europa-turnering i [0xae23d0] → +0x69 (null = ingen) */
  euroRep: number | null;
  /** 0x53c590(klub, 0, 0): truppens rigtige spillere (med B-holdets) */
  squadCount: number;
  /** 0x5a0590 → 0x5986b0: økonomien −2..2 (null = intet økonomiobjekt) */
  finance: number | null;
}
/** 0x5986b0: saldoen (£, 64 bit) mod omdømmet: 2 rig, 1, 0, −1, −2 i krise; landshold 0 */
export function financeStatus(balance: number, rep: number): number {
  const r = s16(rep);
  if (balance > 2500 * r + 5_000_000) return 2;
  if (balance > 1000 * r + 3_500_000) return 1;
  if (balance < -2_500_000 - 1500 * r) return -2;
  if (r < 5000) return balance < -250 * r ? -1 : 0;
  return balance < 1000 * (3750 - r) ? -1 : 0;
}
/** 0x7bca90(klub, &R, 0) → T; R = omdømmemålet (klubbens, ligaens ×500, Europas ×600, vægtet) */
export function clubStrength(i: StrengthInput): { T: number; R: number } {
  const rep = s16(i.rep);
  const x = s16(ftol(i.minAtt * 0.43 - 430));
  const ebx = s16(rep > x ? rep : x > 10000 ? 10000 : x);
  let esi = rep, edi = rep;
  if (i.leagueRep !== null) { const lr = s16(i.leagueRep); if (lr > tdiv(rep, 500)) { esi = lr * 500; edi = esi; } }
  if (i.euroRep !== null) { const er = s16(i.euroRep); if (er > tdiv(rep, 500)) edi = er * 600; }
  const sum = esi < 8000 ? 3 * esi + ebx + 4 * edi + 8 * rep : ebx + 7 * rep + 4 * (esi + edi);
  let R = tdiv(sum, 16);
  if (i.status !== 1) R = tdiv(R, 2);
  let T = R > 9000 ? 3 * R + 7500 : R > 7000 ? ftol(R * 4.75 - 8250) : R > 5000 ? ftol(R * 2.5 + 7500) : R > 3000 ? 5 * R - 5000 : ftol(R * 1.6 + 5000);
  const cnt = s8(i.squadCount);
  const act = i.leagueRep !== null && i.leagueActive;
  if (cnt < 16 && act) T = tdiv(T, 2);
  else if (cnt < 20 && act) {
    if (i.finance === -2) T = tdiv(T, 2); else if (i.finance === -1) T = ftol(T * (2 / 3));
  } else {
    if (act) {
      const lr2 = ftol(s16(i.leagueRep!) * 1.35 + 20);
      let d = s8(cnt - lr2);
      if (d < 0) { if (d < -10) d = -10; T = ftol((d * 0.05 + 1) * T); }
    }
    if (i.finance !== null) {
      const o = T;
      if (i.finance === -2) T = ftol(Math.min(o * 0.9090909090909091, o - 1000));
      else if (i.finance === -1) T = ftol(Math.min(o * 0.9523809523809523, o - 500));
      else if (i.finance === 1) T = ftol(Math.max(o * 1.0125, o + 125));
      else if (i.finance === 2) T = ftol(Math.max(o * 1.025, o + 250));
    }
  }
  if (T < 500) T = 500;
  return { T, R };
}

// ---------------------------------------------------------------- 0x5cccd0's daglige kald (0x5cdc68–0x5cdd15)

/** Planlæggeren kører hver dag (når 0x5cccd0 skifter dato), [0x9cd1f8] slået til: pr. klub med land +8 = min(200, +8 + 1); uden åbne mål eller
 *  med tilstand ≠ 2: kør, når +8 > rand(70) + 30 og rand(5) = 0 (0x83a730: arg3 = 1, arg4 = 0). (rand(2) for 0x84a020 trækkes før løkken.) */
export function dailyGate(e: PlanEntry, rand: (n: number) => number): boolean {
  if (e.counter < 200) e.counter++;
  if (e.state === 2) return true;
  if (e.counter > rand(70) + 30) return rand(5) === 0;
  return false;
}
