// Spillerens værdi på en plads 0x6e6340 (cm0102.exe 3.9.68) – søsterfunktionen til udvælgelsesværdien 0x6e2f20 (roleScore.ts), som
// computerens trupplanlægger 0x83cb40 (0x83d373: skadede, 0x83df21–0x83e064: nøglespillerne, 0x83e7ce/0x83e86f), dagens 0x5ce2d0 (0x5d4a82),
// transfersystemet (0x4c0720, 0x5470d0, 0x83f3a0, 0x840d80) og 0x8c9720 kalder med 6 argumenter: (staff, positionsflag, flag, klub, tærskel,
// manager). Afkodet 12/11-2026 fra disassemblyen; noten ~/cm0102-engine/notes/6e6340-plan-score.md har adresserne og konstanterne.
// Kontrol: scripts/ps-trace-check.ts mod den instrumenterede originals spor (match_trace.c, RECOMP_PS_TRACE).
//
// Ren funktion uden spiltilstand som roleScore: alt, originalen slår op i spillets tabeller, gives som PlanInput/PlanData (RoleData's felter,
// hvor det er samme kald). Forskelle fra 0x6e2f20, som ikke er fejl i porten: positionsleddet har sit eget sideled (pos 0x80/0x100/0x200/0x400/
// 0x800/0x1000 i stedet for angrebsflaget), hjemmeomdømmet deles med (1,8 − 0,0001·landets omdømme)·50, potentialet har ingen fart-/
// accelerationsstraf, karakterleddet har ingen 33-årsgrænse, moralen er 1,5·moral − 15, konditionen falder under 5000 (ikke 5750/3500),
// og der er egne blokke for alder/sprog (0x4000), landsholdet (0x2000000), kontrakt 2 (0x20000) og 0x100000.

import { naturalPositions, POS_TABLE } from './subs';
import { recPositions, type Day, type Rec, type RoleData } from './roleScore';

const ftol = (x: number) => Math.trunc(x);                         // 0x945640
const tdiv = (a: number, b: number) => Math.trunc(a / b);          // de magiske divisioner (imul/sar/shr 31) runder mod 0
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const f32 = Math.fround;
const R = (rec: Rec, o: number) => s8(rec[o]);
const W = (rec: Rec, o: number) => (((rec[o] | (rec[o + 1] << 8)) << 16) >> 16);
const T = (v: number) => POS_TABLE[Math.max(0, Math.min(20, v))];   // 0xa15d50
const before = (a: Day, b: Day) => a.year < b.year || (a.year === b.year && a.day < b.day);

/** Det, 0x6e6340 slår op ud over RoleData (kontrakten har her også +0x3d) */
export interface PlanData extends Omit<RoleData, 'contract' | 'injury' | 'sameNation'> {
  /** 0x4cf5f0(staff, klub): +0x3d +0x3e +0x3f +0x44 (s8), +0x45 (flag), +0x4f (status i høj nibble) – null = ingen kontrakt med klubben */
  contract: { b3d: number; b3e: number; b3f: number; b44: number; b45: number; b4f: number } | null;
  /** 0x62ed70(staff): skaden (+0x28 sværhed, +0x2c dage) – null = ingen */
  injury: () => { w28: number; w2c: number } | null;
}

/** Managerblokkens (flag 0x1000) input – fælles for 0x6e6340 og 0x6e2f20 (roleScore.ts) */
export interface ManagerBlockIn {
  /** dommerens ikke-spillerpost (0x6e6340: (arg6 eller klub+0xcf)+0x69; 0x6e2f20: hold+0x1f, arg8+0x69 eller klub+0xcf+0x69) – bytes 0..0x47; null = ingen */
  np: Rec | null;
  /** dommeren (staff) +0x59 */
  j59: number;
  /** spillerens staff +0x59 og +0x5b */
  b59: number; b5b: number;
  /** 0x547d30(staff, klub), 0x547d60(staff, klub): klubben står i staff+0x65's liste +0x10..+0x18 / +0x4..+0xc;
   *  0x547840(staff, manager), 0x547810(staff, manager): manageren står i +0x28..+0x30 / +0x1c..+0x24 */
  rel: { d30: boolean; d60: boolean; m840: boolean; m810: boolean };
}

export interface PlanInput {
  /** staff +0: id (rigtig spiller: id < [0xae2364]); +0x18 alder (s8); +0x3e/+0x40 kom til klubben */
  id: number; real: boolean; age: number; joined: Day;
  /** spillerposten (staff +0x61, 0x46 bytes; de 18 tekniske/mentale er interne værdier) */
  rec: Rec;
  /** arg2 positionsflag (word), arg3 flag, arg5 tærsklen (> −1 = de tidlige returveje −10000 med 200·snit < tærsklen) */
  pos: number; flags: number; thr?: number;
  /** arg4 ≠ 0; staff +0x39 == arg4 (også 0 == 0); staff +0x39 ≠ 0; hans klubs +0x53 == arg4's +0x53 */
  hasClub: boolean; atClub: boolean; stHasClub: boolean; sameNationClub: boolean;
  /** arg6 (manageren) +0x3e/+0x40 – null = intet arg6 (computerens planlægger giver 0) */
  mgrJoined: Day | null;
  /** [0xae2c90] og 0x54c8e0(i dag, 365) */
  today: Day; yearAgo: Day;
  /** staff +0x1a → +0x8e (landets omdømme), +0x76 = 0xe (de britiske øer), +0x22 landskampe, +0x56 */
  nationRep: number; british: boolean; caps: number; b56: number;
  /** klubbens land findes og har en anden +0x77 end spillerens; 0x7c6830(staff, klub, klubland+0x77, 1) (0..10) */
  langDiff: boolean; lang: number;
  /** en af hans nationer (+0x1a/+0x1e) er klubbens (+0x53) – flag 0x1000000 */
  nationOfClub: boolean;
  /** arg4 +0x80 og hans egen klubs +0x80 (s16) */
  clubRep: number; stClubRep: number;
  /** 0x5444a0(staff, 0): transferlistet (kontrakt +0x4e & 1) */
  listed: boolean;
  /** 0x54cdb0(i dag, staff +0x3e): dage siden – kun brugt uden klub (flag 0x2000000) */
  daysNoClub: number;
  /** hans klubs liga +0x57 → +0x69 (s16) – null = ingen (flag 4) */
  league69: number | null;
  mgr: ManagerBlockIn;
  data: PlanData;
}

/** 0x6e6340 – værdien af spilleren på pladsen (P·Q som 0x6e2f20 – eller (500 − Q)·P, Q + P, P). −10000 = ingen post / under tærsklen. */
export function planScore(i: PlanInput): number {
  const { rec, flags, data: d } = i;
  const pos = i.pos & 0xffff, lo = pos & 0xff;
  const thrOn = (i.thr ?? -1) > -1, thr = i.thr ?? -1;
  // 0x6e639d: konditionen (0x62c590), når 0x800 ikke er sat (eller 0x210000 er)
  const condBlk = !(flags & 0x800) || !!(flags & 0x210000);
  const cond0 = condBlk ? s16(d.condition) : 10000, cond100 = condBlk ? tdiv(s16(d.condition), 100) : 100;
  const C = d.contract;
  const r = recPositions(rec);
  const nat = naturalPositions(r);                                      // 0x5b7d20
  // ---------------------------------------------------------------- P (0x6e6456–0x6e674f)
  let P = nat === 0 ? -100 : 0;
  if (flags & 0x400) P += 100;
  else if (lo & 1) P += r.gk * r.gk - 300;
  else if (nat & 1) P -= 200;
  else if (lo & 2) P += T(r.sw);
  else if (lo & 4) P += T(r.d);
  else if (pos === 8) P += T(Math.max(r.wb, r.d, r.dm, r.m));
  else if (lo & 8) P += !(pos & 0x800) && !(lo & 0x80) ? T(r.dm) : T(r.wb);
  else if (lo & 0x10) {
    if (pos & 0x800 || lo & 0x80) P += T(Math.max(r.am, r.m));
    else if (pos === 0x10) P += T(Math.max(r.am, r.dm, r.m));
    else P += T(Math.max(r.am - 5, r.m, r.dm - 5));
  } else if (lo & 0x20) {
    if (pos & 0x800 || lo & 0x80) P += T(r.am);
    else P += T(ftol(Math.max(r.am, (r.am + r.free) * 0.5)));         // 0x6e6607
  } else if (lo & 0x40) P += T(r.f);
  else P += 100;
  // sideleddet (0x6e665e)
  if (flags & 0x200) P += 100;
  else if (pos & 0x1000) P += 10 * (r.free - 10);
  else if (lo & 0x80) P += 10 * (r.r - 10);
  else if (pos & 0x100) P += r.foot30 + 10 * Math.max(tdiv(r.r, 2), r.c) - 120;
  else if (pos & 0x200) P += 10 * (r.c - 10);
  else if (pos & 0x400) P += r.foot3b + 10 * Math.max(tdiv(r.l, 2), r.c) - 120;
  else if (pos & 0x800) P += 10 * (r.l - 10);
  else P += 100;
  // ---------------------------------------------------------------- gennemsnitsleddene
  const recentJoin = () => i.atClub && !!i.mgrJoined && before(i.mgrJoined, i.joined) && before(i.yearAgo, i.joined);
  const daysAt = () => 365 * (i.today.year - i.joined.year) - i.joined.day + i.today.day;
  const below = (sum: number, cnt: number) => thrOn && tdiv(200 * sum, cnt) < thr;
  let sum = 0, cnt = 0, hint = d.repSeen;                                 // [esp+0x24] = 0x5407e0 indtil et hint sættes
  if (flags & 0x40) {                                                   // 0x6e6753: nuværende omdømme / 50
    cnt = 1;
    let v = tdiv(W(rec, 0xb), 50);
    if (recentJoin()) v = ftol((1.375 - 0.001 * daysAt()) * v);
    sum = v;
    if (thrOn && 200 * v < thr) return -10000;
  }
  if (flags & 0x10) {                                                   // 0x6e6885: hjemmeomdømmet
    cnt++;
    sum += ftol(W(rec, 9) / ((1.8 - 0.0001 * i.nationRep) * 50));
    if (below(sum, cnt)) return -10000;
  }
  if (flags & 0x20) {                                                   // 0x6e68f0: verdensomdømmet
    cnt++;
    sum += tdiv(W(rec, 0xd), 50);
    if (below(sum, cnt)) return -10000;
  }
  if (flags & 4 && i.real) {                                            // 0x6e693d: landskampenes karakter (kategori 5)
    const v = ftol(d.avg(5, 0x12, 6.5) * 20);
    if (v !== 0) { cnt++; sum += v; }
  }
  let judged = -1;
  if (flags & 0x80) {                                                   // 0x6e6988: den opfattede evne (kind 2)
    if (cnt) hint = tdiv(50 * sum, cnt);
    judged = d.judge(2, hint);
    cnt++; sum += s16(judged);
    if (below(sum, cnt)) return -10000;
  }
  if (flags & 0x100) {                                                  // 0x6e6a0e: potentialet (kind 1) – uden fart/acceleration
    if (cnt) {
      if (d.contractClubIsOwn()) { const q = tdiv(25 * sum, cnt); hint = (q + ((q & ~0xffff) | ((25 * W(rec, 7)) & 0xffff))) | 0; }   // 0x6e6a73: imul ax (16 bit)
      else hint = tdiv(50 * sum, cnt);
    }
    let v = d.judge(1, hint);
    if (s16(judged) > -1 && s16(v) < s16(judged)) v = judged;
    cnt++; sum += s16(v);
    if (below(sum, cnt)) return -10000;
  }
  if (flags & 0x40000 && i.real) {                                      // 0x6e6aec: formen
    let f = f32(s8(d.form()) * 0.2);
    if (recentJoin()) { const dd = daysAt(); f = f32(((365 - dd) * 7.5 + dd * f) * (1 / 365)); }
    if (f > 6.8) sum += s8(ftol((f * 3.125 - 21) * cnt));
    else if (f > 0) sum += s8(ftol((f * 6.25 - 42) * cnt));
  }
  if (flags & 2 && i.real) {                                            // 0x6e6c8c: kampkaraktererne
    let def = f32(6.8);
    const b = cnt ? tdiv(sum, cnt) : 0;
    const base = cnt && b > 150 ? b : s16(hint);                        // 0x6e6cbe: ≤ 150 falder igennem til [esp+0x24] (sic)
    if (base > 150) def = f32(Math.min((base - 150) * f32(0.05) + f32(6.8), 7.3));
    let avg = f32(d.avg(6, 0x12, def));
    if (recentJoin()) {
      const dd = daysAt();
      avg = f32(((365 - dd) * 7.5 + dd * avg) * (1 / 365));
      if (i.age > tdiv(R(rec, 0xf), 10) + 34) { const L = d.leagueAvg; if (avg > L) avg = f32((L + avg) * 0.5); }
    }
    if (avg > 8) sum += s8(ftol((avg * 25 - 170) * cnt));
    else if (avg > 6.8) sum += s8(ftol((avg * 12.5 - 85) * cnt));
    else if (avg > 0) sum += s8(ftol((avg * 25 - 170) * cnt));
    if (i.hasClub && (i.atClub || (i.stHasClub && i.sameNationClub))) {
      const def2 = f32(avg * 0.9);
      const r1 = d.avg(1, 0x12, def2);
      if (r1 > 6.8) sum += s8(ftol((r1 * 6.25 - 43) * cnt));
      else if (r1 < def2) sum += s8(ftol((r1 * 85 / def2 - 85) * cnt));
      const r3 = d.avg(6, 0x14, f32(1.425));                            // 0x3fb66666
      sum += ftol((r3 * 40 - 60) * cnt);
    }
  }
  // 0x6e7065: gennemsnittet, over 150 strakt
  let Q = 0;
  if (cnt) { Q = tdiv(sum, cnt); if (Q > 150) Q = ftol((Q - 150) * 1.5 + 150); }
  if (flags & 8 && i.real) Q += ftol(R(rec, 0x45) * 1.5 - 15);         // 0x6e70ae: moralen
  if (flags & 0x4000) Q = ageBlock(i, Q, cnt, nat);                     // 0x6e70e5
  if (C && i.hasClub && flags & 0x2000000 && i.real) Q = nationalBlock(i, Q, C.b3d);   // 0x6e74b0
  // ---------------------------------------------------------------- konditionen og skaden (0x6e783d, ikke med flag 0x800)
  if (!(flags & 0x800)) {
    let c = cond0;
    if (!(flags & 0x200000)) { const v = s16(d.load()); if (v > 1000) c += 500 - v; }
    if (c < 5000) return c + 100 * P - 200000;                          // 0x6e7891
    Q += c < 9000 ? tdiv(3 * c, 100) - 280 : 0 - tdiv(10000 - c, 100);
    const inj = d.injury();
    if (inj) Q += inj.w28 <= 10 ? -2 * inj.w28 : -20 - inj.w28;
  }
  if (flags & 0x200000) {                                               // 0x6e7921
    if (cond100 >= 99 && R(rec, 0x3c) > 14 && R(rec, 0x2d) < 8 && s16(d.load()) < 500) Q -= 200;
    else Q += 100 - cond100;
  }
  if (flags & 0x1000 && i.mgr.np && i.hasClub && P >= 100) Q = managerBlock(rec, pos, nat, Q, i.age, i.mgr, true);   // 0x6e796b
  if (flags & 0x1000000 && i.hasClub && !i.nationOfClub) Q -= 50;     // 0x6e8150
  if (flags & 0x10000) {                                                // 0x6e8180: trupstatus (som 0x6e2f20)
    if (C) {
      let b = 0;
      if (C.b45 & 0x2808) b = ftol(Math.min(s8(C.b44) * (2 / 3), -25));
      else if (C.b45) b = ftol(Math.min(s8(C.b44) * 0.4, -5));
      const status = (C.b4f >> 4) & 0xf;
      const appearances = () => {
        const h = d.history();
        if (!h || !h.ok) return;
        const tot = h.w4 + h.w6;
        const pct = tot ? s8(tdiv(100 * h.w4, tot)) : 0;
        if (tot && pct >= 70) return;
        b += 50 - tdiv(pct, 2);
      };
      if (status === 1) { b += 25; if (!(flags & 0x800000)) appearances(); }
      else if (status === 2) { b += 15; if (!(flags & 0x800000)) appearances(); }
      else if (status === 3) {
        if (flags & 0x800000) b += 10;
        else { b += ftol(5 * (s8(C.b3e) - s8(C.b3f)) + (cond100 * 2.5 - 225)); appearances(); }
      } else if (status === 7) b -= 20;
      Q += b;
      Q = tail84aa(i, Q, flags);
    }
  } else if (flags & 0x20000) {                                         // 0x6e83a6: kontrakt 2
    if (C) {
      const status = (C.b4f >> 4) & 0xf;
      let e = 0;
      if (status >= 1 && status <= 3) {
        e = -25;
        if (!(flags & 0x800000)) {
          const h = d.history();
          if (h && h.ok) {
            const tot = h.w4 + h.w6;
            const pct = tot ? s8(tdiv(100 * h.w4, tot)) : 0;
            if (!tot || pct < 70) e = tdiv(pct, 2) - 75;
          }
        }
      } else if (status === 4 || status === 5 || status === 8) e = 25;
      Q += e;
    }
    Q = tail84aa(i, Q, flags);
  }
  if (flags & 0x100000) Q -= Math.min(5 * (i.caps & 0xff), 50);        // 0x6e8548
  else if (flags & 4 && i.real) {                                       // 0x6e856c
    if (!i.stHasClub) { if (W(rec, 9) < 5000) Q -= 30; }
    else if (i.league69 !== null) Q += ftol((i.league69 - 16) * 5);
  }
  if (!i.real) Q -= 30;                                                 // 0x6e85c5
  if (i.atClub) Q = ftol(Math.max(Q + 5, Q * 1.05));                   // 0x6e85d7
  if (flags === 0x800) return P;                                        // 0x6e8619
  if (P < 0) return (500 - Q) * P;
  if (Q < 1) return Q + P;
  return P * Q;
}

/** 0x6e84aa: belastningen (0x62c3d0) efter trupstatus-/kontrakt 2-blokken, når konditionsblokken er med */
function tail84aa(i: PlanInput, Q: number, flags: number): number {
  if (flags & 0x800) return Q;
  const L = s16(i.data.load());
  if (L < -1000) return Q - ftol(L * 0.0125 + 12.5);
  if (L > 500) return Q + ftol(25 - L * 0.05);
  return Q;
}

/** flag 0x4000 (0x6e70e5–0x6e74b0): alderen mod klubbens omdømme, skadens dage, potentialets alder, positionsbredden, Influence og sproget */
function ageBlock(i: PlanInput, Q0: number, cnt: number, nat: number): number {
  const rec = i.rec;
  let cr = tdiv(7000 - s16(i.clubRep), 100);
  const cr8 = s8(cr < 10 ? 10 : cr);
  const lim = R(rec, 0xf) === 20 ? 36 : R(rec, 0x15) === 20 || R(rec, 0x14) === 20 ? 34 : 35;
  let Q = Q0;
  if (s8(i.age) > lim) Q = ftol(Math.min((1 - (s8(i.age) - lim) / cr8) * Q0, Q0 - 5));
  const inj = i.data.injury();
  if (inj) Q -= s16(inj.w2c);
  if (i.flags & 0x100) {                                                // 0x6e71af
    const cl = nat & 1 ? 29 : 25;
    const x = 3.5 - 0.67 * cnt;
    if (s8(i.age) > cl && x > 0) Q -= ftol((s8(i.age) - cl) * x);
  }
  if (!(i.pos & 1)) {                                                   // 0x6e720a: bredden (Σ halve positionsevner)
    let s = 0;
    for (let o = 0x10; o <= 0x19; o++) s += tdiv(R(rec, o), 2);
    if (s > 35) Q += tdiv((s - 20) * (s - 20), 250);
  }
  Q += ftol((R(rec, 0x2f) - 10) * (2 / 3));                             // Influence
  if (i.langDiff) {                                                     // 0x6e72c5: sproget (0x7c6830)
    let cl = s8(i.lang);
    if (i.flags & 0x100) cl = s8(ftol(Math.max(cl, 26 - 0.83 * s8(s8(i.age) - tdiv(s8(i.b56), 2) + 5))));
    else { const x = Q * 0.06 - 5; if (cl < x) cl = s8(ftol(x)); }
    const caps = i.caps & 0xff;
    if (caps && caps * caps + i.nationRep > 5000 && cl <= 5) cl = 5;
    if (cl >= 0 && cl <= 9) {
      // 0x6e866c: britiske spillere (nation +0x76 = 0xe) et trin hårdere
      const tab = [0.54, 0.63, 0.71, 0.78, 0.84, 0.89, 0.93, 0.96, 0.98, 0.99];
      const f = i.british ? (cl === 0 ? 0.45 : tab[cl - 1]) : tab[cl];
      Q = ftol(Q * f);
    }
  }
  return Q;
}

/** flag 0x2000000 (0x6e74b0–0x6e783d): landsholdet – klubløse, klubbens omdømme mod hans egen klubs, kontraktens +0x3d, alder og landskampe */
function nationalBlock(i: PlanInput, Q0: number, b3d: number): number {
  const rec = i.rec, age = s8(i.age);
  let Q = Q0;
  if (!i.stHasClub) {
    if (i.daysNoClub > 60) Q = ftol(Q * 0.75);
  } else {
    const sr = s16(i.stClubRep) - 1250, cr = s16(i.clubRep), ax = s8(b3d);
    let f: number | null = null;
    if (cr > sr) {
      if (ax + 100 < 125) {
        f = f32(0.75);
        if (cr !== 0) { let x = (sr / cr) * (ax + 100) * f32(0.008); if (x > 1) x = 1; else if (x < 0.75) x = f32(0.75); f = x; }
        if (age > 34) f *= 0.75; else if (age > 30) f *= 0.85; else if (age > 27) f *= 0.95;
        if (R(rec, 0xf) === 20) f *= age < 18 ? 0.75 : age < 20 ? 0.85 : 0.95;
      }
    } else if (ax < 25 && age > 30) {
      f = age > 37 ? 0.5 : age > 34 ? f32(0.75) : f32(0.85);
      if (R(rec, 0xf) === 20) f *= age < 18 ? 0.75 : age < 21 ? 0.85 : 0.95;
    }
    if (f !== null) Q = ftol(Q * f);
    if (i.listed) Q = ftol(Q * 0.95);
  }
  const caps = i.caps & 0xff;
  if (age > 34) {
    if (caps === 0) Q = ftol(Q * 0.25); else if (caps < 8) Q = ftol(Q * 0.5); else if (age > 35 && caps < 25) Q = ftol(Q * 0.65);
    else if (caps < 15) Q = ftol(Q * 0.75); else if (caps < 35) Q = ftol(Q * 0.85);
  } else if (age > 27) {
    if (caps === 0) Q = ftol(Q * 0.5); else if (caps < 8) Q = ftol(Q * 0.65); else if (caps < 15) Q = ftol(Q * 0.8);
  } else if (age > 24) {
    if (caps === 0) Q = ftol(Q * 0.65); else if (caps < 8) Q = ftol(Q * 0.75); else if (caps < 15) Q = ftol(Q * 0.85); else if (caps > 20) Q = 5;
  } else if (age > 21) {
    if (caps === 0) Q = ftol(Q * 0.85); else if (caps < 6) Q = ftol(Q * 0.9); else if (caps < 10) Q = ftol(Q * 0.95); else if (caps > 20) Q = 5;
  } else if (caps > 10) Q = 5;
  return Q;
}

/** Managerblokken (flag 0x1000): 0x6e796b–0x6e8150 i 0x6e6340 og 0x6e52ca–0x6e5ae8 i 0x6e2f20 – dommerens holdning til spilleren (ungdom,
 *  klubbens/managerens lister i staff+0x65), arbejdsrate/Professionalism/Loyalty mod managerens +0x14/+0x59 og pladsens egenskaber vægtet med
 *  managerens ikke-spillerpost (+0xe, +0x13, +0x1a, +0x1f, +0x22). Det samlede led ganges med (1 − 0,00375·Q) og holdes i ±80.
 *  `plan` = 0x6e6340's variant: driblebonussen gælder også offensive midtbanespillere (0x20) – 0x6e2f20 har den kun for angribere. */
export function managerBlock(rec: Rec, pos: number, nat: number, Q0: number, age: number, m: ManagerBlockIn, plan: boolean): number {
  const np = m.np!;
  const a = (o: number) => R(rec, o), n = (o: number) => s8(np[o]);
  let Q = Q0;
  if (s8(age) <= 23) Q += ftol((n(0x22) - 10) * (2 / 3));             // ungdomsarbejde
  if (m.rel.d30) Q = ftol(Math.min(Q - 10, Q * 0.75));
  else if (m.rel.d60) Q = ftol(Math.max(Q + 10, Q * 1.1));
  if (m.rel.m840) Q -= 50;
  else if (m.rel.m810) Q = ftol(Math.max(Q * 1.25, Q + 20));
  const wr = a(0x44), wr10 = wr - 10, n14 = n(0x14);
  let t = Math.min(tdiv(n14 * wr10, 3), 10) + Math.min(tdiv(n14 * (s8(m.b5b) - 10), 3), 10) + Math.min(tdiv((s8(m.b59) - 10) * s8(m.j59), 3), 10);
  const lo = pos & 0xff;
  if (!(lo & 1)) {
    const central = !(lo & 0x80) && !(pos & 0x800);
    const E = n(0xe), mk = n(0x1a) * a(0x32), fl = (a(0x28) - 10) * E, dr = a(0x26) * E, cr = a(0x43) * E, fi = a(0x27), wf = n(0x1f) * wr10;
    const dribble = () => (a(0x26) > 30 && a(0x36) > 15 ? tdiv(a(0x1b) * tdiv(a(0x26), 3) * a(0x36), 1500) : 0);
    if (lo & 6) {
      t += tdiv(mk, 40) + tdiv(fl, 10) + tdiv(dr, 500) + tdiv(fi * E, 350) + tdiv(cr, 250) + tdiv(wf, 8) - 10;
      if (central) t += a(0x2e) - 15;
    } else if (lo & 8) {
      t += tdiv(fi, 15) + tdiv(mk, 40) + tdiv(fl, 8) + tdiv(dr, 325) + tdiv(cr, 150) + tdiv(wf, 6) - 10;
      if (central) t += tdiv(a(0x3e), 15) + wr - 15;
    } else if (lo & 0x10) {
      t += tdiv(mk, 60) + tdiv(fl, 5) + tdiv(dr, 150) + tdiv(cr, 100) + tdiv(wf, 6) + tdiv(fi, 10) - 10;
      t += central ? tdiv(a(0x3e), 15) + tdiv(a(0x37), 15) + wr - 15 : tdiv(a(0x23), 15);
    } else if (lo & 0x20) {
      t += tdiv(mk, 150) + tdiv(fl, 4) + tdiv(wf, 8) + tdiv(cr, 75) + tdiv(dr, 150) + tdiv(fi, 8) - 10;
      t += central ? tdiv(a(0x43), 15) + a(0x1a) - 15 : tdiv(a(0x23), 15);
      if (plan) t += dribble();
    } else if (lo & 0x40) {
      t += tdiv(mk, 400) + tdiv(fl, 3) + tdiv(cr, 200) + tdiv(wf, 10) + tdiv(dr, 175) + tdiv(fi, 5) - 10;
      if (central) t += tdiv(a(0x33), 15) + tdiv(fi, 15) + a(0x40) + a(0x36) - 20 + dribble();
    }
  }
  if (nat & 0x40 && lo & 0x40) t += tdiv((a(0x36) * a(0x2e) - 200) * n(0x13), 500);   // 0x6e80d8
  if (t !== 0) {
    let v = ftol((1 - Q * 0.00375) * t);
    if (v < -80) v = -80; else if (v > 80) v = 80;
    Q += v;
  }
  return Q;
}
