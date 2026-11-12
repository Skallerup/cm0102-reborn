// Udvælgelsesværdien match_man_score_player_for_role 0x6e2f20 (cm0102.exe 3.9.68) – hele funktionen for de flag, klubkampene bruger
// (pick_teams 0xca0ca med 0x100/0x10000/0x800000/0x400000, genvalget 0x8a0cb, omrokeringen 0x8800, formationsvurderingen 0x8c1) – og de
// spillerfunktioner, den kalder, som kan regnes af spillerposten: den opfattede evne 0x6e86d0, formen 0x7c1950, anføreren 0x6e1cf0/0x6e1940.
// Afkodet 11/11-2026 fra disassemblyen; noten ~/cm0102-engine/notes/6e2f20-role-score.md har adresserne og konstanterne.
//
// Ren funktion uden spiltilstand: alt, originalen slår op i spillets andre tabeller (kontrakten 0x4cf5f0, konditionen 0x62c590, træningens
// belastning 0x62c3d0, skaden 0x62ed70, kampstatistikken 0x7c1e30/0x7c1950/0x8c7260, omdømmet set fra manageren 0x5407e0 …), gives som
// RoleData. aiTeam.ts/pickTeam.ts fylder den af vores Player; tests/roleScore.test.ts fylder den af den instrumenterede originals spor.
//
// Ikke porteret (bruges ikke af klubkampene): flag 0x4/0x10/0x20/0x1000000 er porteret, men landsholdsblokken 0x2000000 (0x6e4860–0x6e4c19),
// alders-/skadeblokken 0x4000 (0x6e4c19–0x6e50a9), 0x200000 (0x6e526f), 0x20000 (kontrakt 2,
// 0x6e5e17), 0x100000 (0x6e6007) og de tidlige returveje med arg9/arg15 (tærskel/menneskets liste – også 0x6e5def's b·0,25) er det ikke – de giver 0 her.
// Managerblokken 0x1000 (0x6e52ca–0x6e5ae8) er porteret 12/11 (planScore.ts managerBlock; planlæggerens kald 379.124/379.124 ens).

import { combineScore, naturalPositions, positionFactor, ratingTerm, type PositionRecord, type QualityContext, type SubPlayer } from './subs';
import { managerBlock, type ManagerBlockIn } from './planScore';

const ftol = (x: number) => Math.trunc(x);                         // 0x945640
const tdiv = (a: number, b: number) => Math.trunc(a / b);
const s8 = (v: number) => (v << 24) >> 24;
const f32 = Math.fround;
const s16 = (v: number) => (v << 16) >> 16;

/** Spillerposten (0x46 bytes som i hukommelsen; de 18 tekniske/mentale +0x1e/+0x23/+0x24/+0x26/+0x27/+0x2a/+0x2b/+0x31/+0x32/+0x33/+0x35/+0x37/
 *  +0x38/+0x39/+0x3a/+0x3e/+0x41/+0x43 er interne værdier (s8), resten 1..20). */
export type Rec = ArrayLike<number>;
const R = (rec: Rec, o: number) => s8(rec[o]);
const W = (rec: Rec, o: number) => (((rec[o] | (rec[o + 1] << 8)) << 16) >> 16);
export function recPositions(rec: Rec): PositionRecord {
  return { gk: R(rec, 0xf), sw: R(rec, 0x10), d: R(rec, 0x11), dm: R(rec, 0x12), m: R(rec, 0x13), am: R(rec, 0x14), f: R(rec, 0x15), wb: R(rec, 0x16),
    l: R(rec, 0x17), r: R(rec, 0x18), c: R(rec, 0x19), free: R(rec, 0x1a), foot30: R(rec, 0x30), foot3b: R(rec, 0x3b) };
}

/** En dato som originalens (dag i året, år) – staff +0x3e/+0x40, [0xae2c90]/[0xae2c92]. */
export interface Day { day: number; year: number }
/** (a.year < b.year) eller samme år og a.day < b.day – originalens to-trins sammenligning (år usigneret word, dag signeret) */
const before = (a: Day, b: Day) => a.year < b.year || (a.year === b.year && a.day < b.day);

/** Hvad 0x6e2f20 slår op uden for spiller- og personposten (pr. kald; funktionerne kaldes i originalens rækkefølge). */
export interface RoleData {
  /** 0x4cf5f0(staff, klub): kontrakten med klubben – +0x44 (s8), +0x45 (flag), +0x4f (status i høj nibble) – null = ingen */
  contract: { b3e: number; b3f: number; b44: number; b45: number; b4f: number } | null;
  /** 0x62c590(staff, 0): konditionen 0..10000 (uden for kampen) */
  condition: number;
  /** 0x62c3d0(id): træningens/kampenes belastning (> 1000 trækker fra) */
  load: () => number;
  /** 0x62ed70(staff): skaden (+0x28 sværhed) – null = ingen */
  injury: () => { w28: number } | null;
  /** 0x7c1950(spillerpost): seneste form (summen af de 5 seneste karakterer, s8) */
  form: () => number;
  /** 0x5407e0(staff, manager, 0): omdømmet, manageren ser */
  repSeen: number;
  /** 0x6e86d0(manager, staff, klub, kind, hint) – judgeAbility nedenfor */
  judge: (kind: 1 | 2, hint: number) => number;
  /** 0x4cf5a0(staff) → klubben for den anden kontrakt er kampens klub */
  contractClubIsOwn: () => boolean;
  /** 0x7c1e30(spillerpost, kategori, art, standard): kampstatistikkens snit (float) */
  avg: (cat: number, kind: number, def: number) => number;
  /** [0xb74350] +0x10/+0x18 (begge 0 → 6,8): ligaens snit, læst for spillere over 33 */
  leagueAvg: number;
  /** klub +0x53 (klubbens nation) == spillerens klubs +0x53 – 0x6e41a8 */
  sameNation: boolean;
  /** 0x8c7260(staff) (+4/+6 words) og 0x8c7560(staff, kontraktklub, 1) – kun trupstatus 1–3 (0x10000) */
  history: () => { w4: number; w6: number; ok: boolean } | null;
}

export interface RoleInput {
  /** staff +0: id; +0x18 alder; +0x39 == klubben; +0x3e/+0x40 kom til klubben; id < [0xae2364] = rigtig spiller */
  id: number; age: number; atClub: boolean; joined: Day; realPlayer?: boolean;
  rec: Rec;
  /** pladsens positionsflag (0x717410/0x5b2ae0), angrebsflag, individuelle instruktioner lo/hi, taktikbyte, holdflag (+0x584) */
  pos: number; att: number; lo: number; hi: number; tb: number; tf: number;
  flags: number;
  /** manageren (arg8/hold+0x1b): kom til klubben – null = ingen manager */
  mgrJoined: Day | null;
  today: Day;
  /** 0x54c8e0(i dag, 365) – datoen et år før */
  yearAgo: Day;
  /** hold +0x3b = staff (anføreren); dødboldsskytterne hold +6/+0xa/+0xe: 1/2/3 (0 = ingen) */
  captain: boolean; setPiece: number;
  /** flag 0x10: nationens omdømme (staff +0x1a → +0x8e); flag 0x1000000: en af hans nationer (+0x1a/+0x1e) er klubbens (+0x53) */
  nationRep?: number; nationOfClub?: boolean;
  /** klubbens nation +0x11c (byte) – genererede spillere (realPlayer false) trækkes ned (0x6e60b0) */
  nationFlag11c?: boolean;
  /** flag 0x1000 (managerblokken 0x6e52ca–0x6e5ae8, planScore.ts managerBlock): dommerens ikke-spillerpost m.m. – uden den (eller uden klub,
   *  `hasClub` false) springes blokken over som i originalen uden dommer/klub */
  mgrBlock?: ManagerBlockIn;
  /** arg6 (klubben) ≠ 0 – kun managerblokken læser det (standard: ja) */
  hasClub?: boolean;
  /** kun under kampen (arg3): kampspilleren og uret – rating- og konditionsleddet tages derfra */
  match?: { p: SubPlayer; ctx: QualityContext };
  data: RoleData;
}

/** 0x6e2f20 – værdien af spilleren på pladsen (P · Q, se combineScore). */
export function roleScore(i: RoleInput): number {
  const { rec, flags, data: d } = i;
  const real = i.realPlayer ?? true;
  const r = recPositions(rec);
  // 0x6e2fad: konditionen fra 0x62c590, når flag 0x800 ikke er sat (eller 0x210000 er)
  const condBlk = !(flags & 0x800) || !!(flags & 0x210000);
  const cond0 = condBlk ? d.condition : 10000, cond100 = condBlk ? tdiv(d.condition, 100) : 100;
  const C = d.contract;
  // P (0x6e3088–0x6e361f, subs.ts positionFactor)
  const P = positionFactor(r, i.pos, i.att, flags);
  // ---------------------------------------------------------------- gennemsnitsleddene
  let sum = 0, cnt = 0;
  const recentJoin = () => !!i.mgrJoined && i.atClub && before(i.mgrJoined, i.joined) && before(i.yearAgo, i.joined);
  const daysAt = () => 365 * (i.today.year - i.joined.year) - i.joined.day + i.today.day;
  if (flags & 0x40) {                                                   // 0x6e362e: nuværende omdømme / 50
    let v = tdiv(W(rec, 0xb), 50);
    cnt = 1;
    if (recentJoin()) v = ftol((1.375 - 0.001 * daysAt()) * v);         // 0x968fa8, 0x96a350
    sum = v;
  }
  if (flags & 0x10) { cnt++; sum += ftol(W(rec, 9) / ((2 - 0.0001 * (i.nationRep ?? 0)) * 50)); }   // 0x6e3770: hjemmeomdømme (landshold)
  if (flags & 0x20) { cnt++; sum += tdiv(W(rec, 0xd), 50); }           // 0x6e37ee
  if (flags & 1 && i.match && !(naturalPositions(r) & 1)) { sum += ratingTerm(i.match.p, i.match.ctx); cnt++; }   // 0x6e3845
  if (flags & 4 && real) { const v = ftol(d.avg(5, 0x12, 6.5) * 20); if (v !== 0) { sum += v; cnt++; } }          // 0x6e3a17
  let judged = -1;
  if (flags & 0x80) {                                                   // 0x6e3a64: managerens opfattede evne (kind 2)
    const hint = cnt ? tdiv(50 * sum, cnt) : d.repSeen;
    judged = s16(d.judge(2, hint));
    cnt++; sum += judged;
  }
  if (flags & 0x100) {                                                  // 0x6e3af3: potentialet (kind 1)
    let hint: number;
    if (cnt) hint = d.contractClubIsOwn() ? tdiv(25 * sum, cnt) + ((25 * W(rec, 7)) & 0xffff) : tdiv(50 * sum, cnt);
    else hint = d.repSeen;                                              // ebx = [esp+0x28]
    let v = s16(d.judge(1, hint));
    if (judged > -1 && v < judged) v = judged;
    if (rec[0x1b] < 6) v -= 10; else if (rec[0x1b] < 10) v -= 5;        // acceleration
    if (rec[0x36] < 6) v -= 15; else if (rec[0x36] < 10) v -= 10;       // pace
    sum += s16(v); cnt++;
  }
  if (flags & 0x40000 && real) {                                        // 0x6e3c0e: formen
    let f = f32(s8(d.form()) * 0.2);
    if (recentJoin()) { const dd = daysAt(); f = f32(((365 - dd) * 7.5 + dd * f) * (1 / 365)); }
    if (f > 6.8) sum += s8(ftol((f * 3.125 - 21) * cnt));
    else if (f > 0) sum += s8(ftol((f * 6.25 - 42) * cnt));
  }
  if (flags & 2 && real) sum += ratingsTerm(i, sum, cnt, recentJoin, daysAt);   // 0x6e3dcf
  // 0x6e42a1: gennemsnittet, over 150 strakt
  let Q = 0;
  if (cnt) { Q = tdiv(sum, cnt); if (Q > 150) Q = ftol((Q - 150) * 1.5 + 150); }
  if (flags & 8 && real) Q += ftol((R(rec, 0x45) - 10) * 0.8);          // 0x6e42e9: moralen +0x45
  if (flags & 0x8000) Q += instructionTerm(rec, i.lo >>> 0, i.tb, i.tf);   // 0x6e4321
  // ---------------------------------------------------------------- konditionen og skaden (0x6e50ad, ikke med flag 0x800)
  if (!(flags & 0x800)) {
    let c: number;
    if (i.match) {
      const p = i.match.p;
      if (p.slot === -2) return -1000000;                                 // 0x6e50c1
      c = ftol(2 * f32(p.pendingCondition) + f32(p.condition));
      if (i.match.ctx.periodEnd === 495) c = Math.min(c + 1500, 10000);
    } else c = s16(cond0);
    if (!(flags & 0x200000)) { const v = s16(d.load()); if (v > 1000) c += 500 - v; }
    if (c < 5750) { const v = c + 20 * (5 * P - 1250); return c >= 3500 ? v : v - 500000; }
    if ((i.lo & 0x8000) || ((i.lo & 0x2000) && (i.tf & 0x100))) c = ftol(c * 0.0001 * c);
    Q += c < 9000 ? tdiv(3 * c, 100) - 280 : 0 - tdiv(10000 - c, 100);
    const inj = d.injury();
    if (inj) Q += inj.w28 <= 10 ? -2 * inj.w28 : -20 - inj.w28;        // 0x6e5232
  }
  // 0x6e52ca: managerblokken (flag 0x1000; dommerens ikke-spillerpost, klubben og P ≥ 100) – samme som 0x6e6340's, men uden driblebonus for 0x20
  if (flags & 0x1000 && i.mgrBlock?.np && (i.hasClub ?? true) && P >= 100) Q = managerBlock(rec, i.pos, naturalPositions(r), Q, i.age, i.mgrBlock, false);
  // ---------------------------------------------------------------- anfører, dødbolde, trupstatus
  if (flags & 0x2000 && i.captain) Q += 100;                            // 0x6e5ae8
  if (flags & 0x1000000 && !(i.nationOfClub ?? true)) Q -= 50;         // 0x6e5b09: ingen af hans to nationer er klubbens (+0x53)
  if (flags & 0x80000) Q += i.setPiece === 1 ? 30 : i.setPiece === 2 ? 20 : i.setPiece === 3 ? 10 : 0;   // 0x6e5b35
  if (flags & 0x10000 && C) {                                           // 0x6e5b6d
    let b = 0;
    if (C.b45 & 0x2808) b = ftol(Math.min(s8(C.b44) * (2 / 3), -25));
    else if (C.b45) b = ftol(Math.min(s8(C.b44) * 0.4, -5));
    const status = (C.b4f >> 4) & 0xf;
    const appearances = () => {                                         // 0x6e5c3f: 0x8c7260 / 0x8c7560 – under 70 % af kampene → +50 − pct/2
      if (flags & 0x800000) return;
      const h = d.history();
      if (!h || !h.ok) return;
      const tot = h.w4 + h.w6;
      const pct = tot ? s8(tdiv(100 * h.w4, tot)) : 0;
      if (tot && pct >= 70) return;
      b += 50 - tdiv(pct, 2);
    };
    if (status === 1) { b += 25; appearances(); }
    else if (status === 2) { b += 15; appearances(); }
    else if (status === 3) {
      if (flags & 0x800000) b += 10;
      else { b += ftol(5 * (s8(C.b3e) - s8(C.b3f)) + (cond100 * 2.5 - 225)); appearances(); }   // 0x6e5cbb (0x968e18, 0x96d570)
    } else if (status === 7) b -= 20;
    if (i.match) b = ftol((1 - i.match.ctx.clock * 0.0008333333333333334) * b);
    Q += b;
  }
  // 0x6e6092: en genereret spiller (id ≥ [0xae2364]) i et land med klubnationens +0x11c: Q − 70, P − 120
  let P2 = P;
  if (!real && i.nationFlag11c) { Q -= 70; P2 -= 120; }
  if (i.atClub) Q = ftol(Math.max(Q + 5, Q * 1.05));                   // 0x6e60d2
  return combineScore(P2, Q, flags);
}


/** flag 0x2 (0x6e3dcf–0x6e42a1): kampkaraktererne (0x7c1e30 kategori 6/1, art 0x12/0x14) mod 6,8 */
function ratingsTerm(i: RoleInput, sum: number, cnt: number, recentJoin: () => boolean, daysAt: () => number): number {
  const d = i.data;
  let def = f32(6.8);                                                   // 0x40d9999a
  const base = cnt ? tdiv(sum, cnt) : s16(d.repSeen);
  if (base > 150) { const x = f32(base - 150) * f32(0.05) + f32(6.8); def = f32(Math.min(x, 7.3)); }
  let avg = f32(d.avg(6, 0x12, def));
  const L = d.leagueAvg;
  if (i.age > 33 && L + 0.125 < avg) avg = f32(L + 0.125);
  let add = 0;
  if (recentJoin()) {
    const dd = daysAt();
    avg = f32(((365 - dd) * 7.5 + avg * dd) * (1 / 365));
    if (i.age > tdiv(s8(i.rec[0xf]), 10) + 34 && avg > L) avg = f32((L + avg) * 0.5);
  }
  if (avg > 8) add += s8(ftol((avg * 25 - 170) * cnt));
  else if (avg > 6.8) add += s8(ftol((avg * 12.5 - 85) * cnt));
  else if (avg > 0) add += s8(ftol((avg * 25 - 170) * cnt));
  if (i.atClub || d.sameNation) {
    const def2 = f32(avg * 0.9);
    const r1 = d.avg(1, 0x12, def2);
    if (r1 > 6.8) add += s8(ftol((r1 * 6.25 - 43) * cnt));
    else if (r1 < def2) add += s8(ftol((r1 * 85 / def2 - 85) * cnt));
    const r3 = d.avg(6, 0x14, f32(1.35));
    add += ftol((r3 * 40 - 60) * cnt);
  }
  return add;
}

/** flag 0x8000 (0x6e4321–0x6e4860): egenskaberne, pladsens instruktioner (lo), taktikbyte (tb) og holdflag (tf) beder om */
export function instructionTerm(rec: Rec, lo: number, tb: number, tf: number): number {
  const a = (o: number) => R(rec, o);
  let q = 0;
  // 0x6e4344: den første gruppe tester holdflagene (arg13, bl = [esp+0x94]) – ikke taktikbyten
  if (lo & 4 || (lo & 1 && tf & 2)) q += tdiv(a(0x37), 7) - ftol((a(0x40) - 10) * -0.6666666666666666);
  else if (lo & 8 || (lo & 1 && tf & 4)) q += ftol((a(0x36) - 10) * 0.4) - ftol((a(0x3c) - 10) * -0.4) - ftol((a(0x2e) - 10) * -0.4);
  else if (lo & 0x10 || (lo & 1 && tf & 8)) q += ftol((a(0x36) - 10) * 0.6666666666666666) - ftol((a(0x3c) - 10) * -0.6666666666666666) - ftol((a(0x2e) - 10) * -0.6666666666666666);
  if (lo & 0x8000 || (lo & 0x2000 && tf & 0x100)) {
    const s = a(0x3c) - 15, w = a(0x44) - 15;
    q += tdiv(a(0x1e), 10) + ftol(Math.abs(w) * w * 0.4) - ftol(Math.abs(s) * s * -0.4);
  } else if (tb & 1) q += tdiv(a(0x43), 12) - ftol((a(0x28) - 10) * -0.6666666666666666) + tdiv(a(0x33), 12);   // 0x2aaaaaab sar 1
  if (tb & 2) q += tdiv(a(0x39), 7);
  else if (tb & 4) q += tdiv(a(0x32), 7);
  if (lo & 0x40) q += ftol((a(0x3b) - 20) * 0.2857142857142857);
  else if (lo & 0x100) q += ftol((a(0x30) - 20) * 0.2857142857142857);
  if (lo & 0x200000) q += tdiv(a(0x43), 10) + tdiv(a(0x33), 9) + a(0x1a) - 20;
  if (lo & 0x20000) q += tdiv(a(0x2e) - 10, 4);
  else if (lo & 0x40000000) q += tdiv(10 - a(0x2e), 4);
  if (lo & 0x80000000) q += tdiv(10 - a(0x2e), 4);
  else if (lo & 0x80000) q += tdiv(a(0x2e) - 10, 4);
  if (lo & 0x800000) q += tdiv(a(0x43), 15) + tdiv(a(0x3c) - 10, 2) + tdiv(a(0x27), 15);
  if (lo & 0x2000000) q += tdiv(a(0x26), 7);
  if (lo & 0x8000000) q += tdiv(a(0x40) - 10, 3) + tdiv(a(0x3d) - 10, 2);
  if (lo & 0x20000000) q += tdiv(a(0x28) - 10, 2) + tdiv(a(0x31), 14) + tdiv(a(0x27), 14);
  return q;
}

// ---------------------------------------------------------------- 0x6e86d0: den opfattede evne/potentiale

/** match_man_judge_player_ability 0x6e86d0(dommer, spiller, klub, kind, hint) – heltal, intet rand. seed = spillerens id + [0xdd7120]
 *  (spillets frø: time() ved nyt spil eller -seed N, gemt i det gemte spil – GameState.seed hos os) + dommerens id; est = hint/50 (hint > −1)
 *  ellers 0x5407e0/50. kind 2 = evnen (CA), ellers potentialet (PA, est − (alder − 23)², målmænd −26). Dommerens viste Judging Ability
 *  (kind 2, ikke-spiller +0x17) / Judging Potential (+0x18) – 0x544410 – afgør spredningen; uden dommer bl = 1. */
export interface JudgeInput {
  playerId: number; ca: number; pa: number; age: number; gk: number;
  /** spillets frø [0xdd7120] */
  gameSeed: number;
  /** dommeren (manageren): id og viste Judging Ability/Potential (1..20); null = ingen dommer */
  judge: { id: number; ja: number; jp: number } | null;
  kind: number; hint: number;
  /** 0x5407e0(spiller, dommer, 0) – bruges kun, når hint ≤ −1 */
  repSeen?: number;
}
export function judgeAbility(j: JudgeInput): number {
  let seed = (j.playerId + j.gameSeed) | 0;
  let est = s16(j.hint > -1 ? tdiv(j.hint, 50) : tdiv(s16(j.repSeen ?? 0), 50));
  const age = j.kind === 2 ? 0 : s8(j.age - (j.gk === 20 ? 26 : 23));
  let bl = 1;
  if (j.judge) {
    seed = (seed + j.judge.id) | 0;
    if (j.kind === 2 && est > 50 && est + 10 * (j.judge.ja - 10) > seed % 200) return j.ca;   // 0x6e8784
  }
  const q = f32((seed % 101) * 0.01);                                   // 0x967898
  if (j.judge) {
    const v = seed % 10 === 0 ? q * f32(20) : (j.kind === 2 ? j.judge.ja : j.judge.jp) * q;
    bl = s8(ftol(v + 0.5)); if (bl > 20) bl = 20;
  }
  if (j.kind !== 2 && age > 0) est = s16(est - age * age);
  const si = s16((seed % (2 * (21 - bl))) + bl - 21);
  const w = s8(tdiv(bl, 2) + 10);
  return s16(tdiv(((j.kind === 2 ? j.ca : j.pa) + si) * w + (20 - w) * est, 20));
}

/** 0x544410(ikke-spiller, v): den viste stabsegenskab (1..20) af den interne v (= trunc(clamp(10·databasens − CA, ±200)/2)) og stabens CA */
export function staffShown(ca: number, intrinsic: number): number {
  const t = (ca + 2 * intrinsic) * 0.05 + 10;
  const v = (t * t * 0.1 + t) * (1 / 3) + 0.5;
  return v <= 1 ? 1 : v >= 20 ? 20 : Math.trunc(v);
}
/** databasens 1..20 → den interne værdi i hukommelsen (som spillerne, sub_535a80) */
export const staffIntrinsic = (db: number, ca: number) => Math.trunc(Math.max(-200, Math.min(200, 10 * db - ca)) / 2);

// ---------------------------------------------------------------- 0x7c1950: formen

/** PlayerStats::get_recent_form 0x7c1950: de fem seneste kampkarakterer (nibbles i statistikposten +0x24..+0x26, 1..15; 0 = ingen kamp →
 *  27/4) – Σ (4·r eller 27) / 4. `ratings` = de seneste karakterer (nyeste sidst), som originalens nibbles (heltal). */
export function recentForm(ratings: readonly number[]): number {
  const last = ratings.slice(-5);
  let s = 0;
  for (let k = 0; k < 5; k++) { const r = last[k] ?? 0; s += r > 0 ? 4 * Math.min(15, r) : 27; }
  return s8(tdiv(s16(s), 4));
}

// ---------------------------------------------------------------- 0x6e1cf0 / 0x6e1940: anføreren

export interface CaptainInput {
  id: number; age: number; rec: Rec;
  /** 0x53ce90(staff, klub): (kontrakt +0x4f & 0xf) − 10 (0 uden kontrakt) */
  a: number;
  /** spillerens verdensomdømme +0xd og klubbens omdømme +0x80 */
  clubRep: number;
  /** kontrakten (0x4cf5f0): +0x44 og +0x4f; null = ingen */
  contract: { b44: number; b4f: number } | null;
  /** dage i klubben (0x54cdb0 på staff +0x3e/+0x42); landshold: +0x22 · 75 */
  days: number;
  /** staff +0x59 og +0x5b (s8) */
  b59: number; b5b: number;
}
/** Fællesleddet i 0x6e1cf0 og 0x6ebd70 (holdets samspil, 0x6bbb60 – der returnerer det som byte): Influence·t − (a² + 5)/10 + omdømmeled +
 *  kontraktled + 0,5, trunkeret. */
export function captainBase(c: CaptainInput): number {
  const a = s8(c.a);
  let wr = (W(c.rec, 0xd) - s16(c.clubRep)) * 0.002 + 1.5;
  if (wr < -4) wr = -4; else if (wr > 4) wr = 4;
  let s = 0;
  if (c.contract) {
    s = s8(c.contract.b44) * 0.013333333333333334 + 0.5;
    const st = (c.contract.b4f >> 4) & 0xf;
    s += [-10, 2.5, 2, 0, -3, -10, -15, -20, -50][st] ?? 0;            // tabellen 0x6e1fd8 / 0x6ebfe4
  }
  const t = c.days > 1000 ? (c.days - 1000) * 0.000125 + 1 : 1;
  return ftol(R(c.rec, 0x2f) * t - (a * a + 5) * 0.1 + wr + s + 0.5);
}
/** 0x6e1cf0(staff, 0, klub): anførerværdien (word). */
export function captainValue(c: CaptainInput): number {
  return captainValueFromBase(captainBase(c), c.age, c.days, c.b59, c.b5b);
}
/** 0x6e1cf0's hale efter fællesleddet (0x6ebd70-værdien): alder, dage i klubben, staff +0x59/+0x5b */
export function captainValueFromBase(base: number, age0: number, days: number, b59: number, b5b: number): number {
  let v = s16(base);
  const age = s8(age0);
  const c = { days, b59, b5b };
  if (age < 18) v = s16(ftol(v * 0.5)); else if (age < 21) v = s16(ftol(v * 0.75)); else if (age < 24) v = s16(ftol(v * 0.9));
  else if (age > 25) v = s16(ftol(v * 1.05));
  if (c.days < (50 - s8(c.b59)) * 10) v = s16(ftol(v * 0.9));
  if (s8(c.b5b) < 10) v = s16(ftol(v * (s8(c.b5b) * 0.01 + 0.9)));
  return v;
}
/** 0x6e1940(liste, n): den første med højest værdi; med en manager (hold+0x1f) og viste Judging Ability < id mod 20 ganges værdien med
 *  1,1 − 0,01·(ikke-spillerpostens adresse mod 20) – adressen findes ikke uden for originalen (*estimeret*: npMod20). */
export function chooseCaptain(list: readonly (CaptainInput | null)[], judge: { ja: number; npMod20: number } | null): number {
  let best = -1, bv = 0;
  list.forEach((c, k) => {
    if (!c) return;
    let v = captainValue(c);
    if (judge && judge.ja < c.id % 20) v = s16(ftol((1.1 - judge.npMod20 * 0.01) * v));
    if (best < 0 || v > bv) { best = k; bv = v; }
  });
  return best;
}
