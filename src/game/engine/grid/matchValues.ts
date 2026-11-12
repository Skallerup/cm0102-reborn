// Kampværdierne – sub_6ec010 (MATCH_PLAYER, thiscall esi = spilleren, ingen argumenter) fra cm0102.exe 3.9.68, oversat instruktion for
// instruktion (~/cm0102-engine/hooks/6ec010.c; disassembly: python3 ~/cm0102-engine/tools/cmdis.py 6ec010). Ingen tilpasning: alt, hvad
// funktionen læser uden for kampspilleren og dennes spiller-/staffpost, er input (MatchValuesEnv) – resultatet af et kald eller en læst
// hukommelsescelle i originalen. Valideret bit for bit mod originalen: scripts/mv-check.ts (MV/MVO-linjerne i kampsporet,
// ~/cm0102-engine/tools/match_trace.c) og tests/matchValues.test.ts.
//
// Skriver kamp-CA'en +0x3b (q.matchCA) og de 34 kampfloats +0x71+4·i (q.f[MATCH_FLOATS[i]]). Kaldes af sub_6eecb0 (0x6eecb9) ved
// kampstart og hver gang motoren regner en spiller om (moral, kort, udskiftninger …).
//
// x87 som originalen: registrene er doubles (præcisionskontrol 53 bit), Math.fround ved hver fstp/fst dword, float-konstanter (dword) som
// Math.fround, fcom/fcomp: test ah,1 = "st0 < m", test ah,0x41 = "st0 ≤ m" (NaN: begge sande). Funktionens stakramme (0x54 bytes + 4
// gemte registre) er en DataView, så de steder, hvor originalen genbruger en celle (fx [esp+0x1c] som float, double og float igen, eller
// [esp+0x28] der ikke skrives i en gren), giver de samme tal.
import { crtPow } from '../crtMath';

/** de 34 floats +0x71+4·i i originalens rækkefølge (= MATCH_FLOATS i scripts/lockstep.ts) */
export const MV_FLOATS = ['acceleration', 'aggression', 'agility', 'anticipation', 'balance', 'bravery', 'corners', 'crossing', 'decisions', 'dribbling',
  'finishing', 'flair', 'freeKicks', 'handling', 'heading', 'jumping', 'longShots', 'marking', 'offTheBall', 'oneOnOnes', 'pace', 'passing', 'penalties',
  'positioning', 'reflexes', 'stamina', 'strength', 'tackling', 'teamwork', 'technique', 'throwIns', 'versatility', 'creativity', 'workRate'] as const;

/** MATCH_PLAYER-felterne, sub_6ec010 læser og skriver (strukturel type – GP i gridMatch.ts har de fleste under samme navn) */
export interface MatchValuesPlayer {
  side: number;              // +0x27 (0/1)
  /** sub_6c38c0 / sub_6c38f0: positionsordet / angrebspositionsordet (GP.pos / GP.posAttack; 0 når pladsen +0x19 ikke er 0..10) */
  pos: number; posAttack: number;
  morale: number;            // +0x17 (s8)
  w31: number; w33: number;  // +0x31 / +0x33 (s16)
  motivation: number;        // +0x100 (s8)
  formRoll: number;          // +0x118 (s8)
  badDay: number;            // +0x119 (s8)
  /** +0x3b kamp-CA (skrives) */
  matchCA: number;
  /** +0x71..+0xf5 (skrives; f.workRate læses først i MLS-grenen 0x6ee065, før den skrives) */
  f: Record<string, number>;
  /** spillerposten [+0x6d] (0x46 bytes): byte med fortegn / word med fortegn */
  rec(off: number): number;
  recW(off: number): number;
  /** staffposten [+0x69]: byte med fortegn */
  staff(off: number): number;
}

/** anføreren: MATCH_PLAYER'en engine+0x4796+0x1be·(20·side + 0x897590(egen klub, fixture+0x40/+0x41 == 0, 0)) */
export interface MatchValuesCaptain {
  influence: number;   // sub_6ebd70(anføreren) (s8; kaldes op til 3 gange, samme værdi)
  pos: number;         // sub_6c38c0(anføreren)
  ca: number;          // [anfører+0x6d]+5 (s16)
  r39: number;         // [anfører+0x6d]+0x39 (s8)
  r44: number;         // [anfører+0x6d]+0x44 (s8)
  s18: number;         // [anfører+0x69]+0x18 alder (s8)
  s59: number;         // [anfører+0x69]+0x59 (s8)
  s5b: number;         // [anfører+0x69]+0x5b Professionalism (s8)
  days: number;        // sub_54cdb0([0xae2c90] i dag, staff+0x3e, staff+0x42) – dage siden datoen
}

export interface MatchValuesEnv {
  engByte0: number;      // engine+0 (u8; kun = 0 testes, 0x6ec55f)
  engByte1: number;      // engine+1 (s8; 1 / 8 / 0x20 – fart/acceleration/teknik/kondition 0x6edb31 ff.)
  crowd: number;         // engine+0x1ad+side (s8) publikumsbyten
  cohesion: number;      // engine+0x1ce+2·side (s16) samspillet
  fx40: number;          // fixture(engine+0x4792)+0x40 (u8; 0 → retur 0x6ee73f)
  fx3a: number;          // fixture+0x3a (s8; 8/10 = finale, 6 = ...)
  /** fixture+0x14: turneringen – null = ingen; rep = comp+0x69 (s16), mls = [comp] == [0x9cf590] (American Major League) */
  comp: { rep: number; mls: boolean } | null;
  /** [fixture+0x1c] ≠ 0 og [[fixture+0x1c]+0x57] ≠ 0 og = fixture+0x14 (hjemmeholdets liga er kampens turnering) */
  homeLeagueIsComp: boolean;
  ownClubRep: number;    // egen klub (side ? fixture+0x20 : +0x1c) +0x80 (s16)
  /** null: [anfører+0x6d] = 0 */
  captain: MatchValuesCaptain | null;
  natOwn: boolean;       // sub_53b900(egen klub) (landshold) – 0x6ec36c
  natF9: boolean;        // sub_53b900([q+0xf9]) – 0x6ec860 / 0x6ecec8
  /** sub_4cf5f0([0xae1050], staff, egen klub) (kontrakten; null også når natOwn): +0x44 (s8), +0x45 (u32 flag), +0xc / +0x10 / +0x14 (s32) */
  contract: { b44: number; flags: number; d0c: number; d10: number; d14: number } | null;
  contractMod: number;   // sub_53ce90(staff, egen klub) (s8)
  inDb: boolean;         // [staff] < [0xae2364] (staff_count)
  staffState: number;    // [0xae2d0c] + 0x4f·[staff] + 0xa (u8; kun læst når inDb)
  human: boolean;        // sub_600a50(egen klub, 0, 1, 0, 0)
  /** holdets manager [engine+0x904d+0xd0·side] → +0x69 (null = ingen af dem): np+0xe (s8) og sub_544410(np, np+0x21) (s8) */
  manager: { n0e: number; rating: number } | null;
  /** forholdene (kun læst når inDb og fx40 ≠ 0): 0x547d30/0x547d60 (staff, modstanderklubben/egen klub), 0x547840/0x547810
   *  (modstanderens manager / egen manager / anførerens staff [anfører+0x69], staff) */
  rel: { dislikesOpp: boolean; favoursOpp: boolean; oppMgrDislikes: boolean; oppMgrFavours: boolean; favoursOwn: boolean; dislikesOwn: boolean;
    ownMgrDislikes: boolean; ownMgrFavours: boolean; capDislikes: boolean; capFavours: boolean };
  /** [staff+0x61] (spillerposten via staffposten; null = 0): +0x44 (s8), +0xb / +0xd (s16) */
  player61: { b44: number; w0b: number; w0d: number } | null;
  /** [[staff+0x1a]] nationens id (null = ingen nation) og nøglerne [0x9cf4f8] USA, [0x9cf280] Canada, [0x9cf3d0] Mexico */
  nation: number | null;
  keys: { us: number; can: number; mex: number };
  /** taktikkerne engine+0x91e2 (0) og +0xaac5 (1): pladsernes positionsord +0x12d (prim) og +0x14e (sec), 11 hver – til 0x6d5b20/0x6d5af0 */
  tactics: [{ prim: number[]; sec: number[] }, { prim: number[]; sec: number[] }];
}

// ------------------------------------------------------------------ hjælpere
const f = Math.fround;
const s8 = (x: number) => (x << 24) >> 24;
const s16 = (x: number) => (x << 16) >> 16;
const idiv = (a: number, b: number) => (a / b) | 0;                      // idiv / cdq-sar / imul 0x66666667-mønstrene: heltal mod nul
/** sub_945640 _ftol: mod nul, 64 bit (fistp qword); uden for området 0x8000000000000000. Vi bruger kun de lave 16 bit (mov word, ax). */
const ftol16 = (x: number) => {
  if (!(Math.abs(x) < 9.2e18)) return 0;
  const t = Math.trunc(x);
  let m = t % 65536; if (m < 0) m += 65536;
  return m >= 32768 ? m - 65536 : m;
};
const lt = (a: number, b: number) => !(a >= b);                        // fcom; test ah,1 (C0 eller uordnet)
const le = (a: number, b: number) => !(a > b);                         // fcom; test ah,0x41 (C0, C3 eller uordnet)
const pw = crtPow;                                                     // sub_945ff0 pow(st1, st0)

/** sub_5b8dc0 (0x6d5b20 → taktikken): sand når ingen plads har en side (0x880) og er forsvarer (4) eller midtbane (8), hverken primært
 *  eller sekundært (0x5b2ae0(plads, 1) = +0x14e). */
export function noWideDefenders5b8dc0(t: { prim: number[]; sec: number[] }): boolean {
  for (let s = 0; s < 11; s++) {
    const P = t.prim[s], S = t.sec[s];
    if (s16(P & 0x880) && P & 4) return false;      // 0x5b8e52–0x5b8edf
    if (s16(S & 0x880) && S & 4) return false;      // 0x5b8f62–0x5b8fe5
    if (s16(P & 0x880) && P & 8) return false;      // 0x5b9068–0x5b90f5
    if (s16(S & 0x880) && S & 8) return false;      // 0x5b9178–0x5b9192
  }
  return true;
}
/** sub_5b8960 (0x6d5af0 → taktikken): sand når ingen plads med side (0x880) er angriber (0x40), 0x20, 8 eller 0x10 – primært eller sekundært
 *  (0x8 kun primært; 0x5b2ae0(plads, edi = 0) = +0x12d) */
export function noWideMidAttack5b8960(t: { prim: number[]; sec: number[] }): boolean {
  for (let s = 0; s < 11; s++) {
    const P = t.prim[s], S = t.sec[s];
    if (s16(P & 0x880) && P & 0x40) return false;   // 0x5b89f3–0x5b8a80
    if (s16(S & 0x880) && S & 0x40) return false;   // 0x5b8b03–0x5b8b86
    if (s16(P & 0x880) && P & 0x20) return false;   // 0x5b8c09–0x5b8c96
    if (s16(S & 0x880) && S & 0x20) return false;   // 0x5b8d19–0x5b8d33
    if (s16(P & 0x880) && P & 8) return false;      // 0x5b8d35–0x5b8d53
    if (s16(P & 0x880) && P & 0x10) return false;   // 0x5b8d55–0x5b8d73
    if (s16(S & 0x880) && S & 0x10) return false;   // 0x5b8d75–0x5b8d95
  }
  return true;
}

/** sub_6ec010. rand = utils_random 0x90cfc0 (højst 3 kald: rand(50) 0x6ee2e8, rand(20) 0x6ee59e, rand(25) 0x6ee6af). */
export function matchValues6ec010(q: MatchValuesPlayer, env: MatchValuesEnv, rand: (n: number) => number): void {
  // stakrammen: offset fra esp efter prologen (sub esp,0x54 + 4 push); celler 0x10..0x63
  const FR = new DataView(new ArrayBuffer(0x80));
  const gF = (o: number) => FR.getFloat32(o, true), sF = (o: number, v: number) => FR.setFloat32(o, v, true);
  const gD = (o: number) => FR.getFloat64(o, true), sD = (o: number, v: number) => FR.setFloat64(o, v, true);
  const gI = (o: number) => FR.getInt32(o, true), sI = (o: number, v: number) => FR.setInt32(o, v | 0, true);
  const fild = (o: number, v: number) => { sI(o, v); return gI(o); };  // mov [esp+o], r; fild [esp+o]
  const F = q.f;
  const side = q.side, pos = q.pos, posA = q.posAttack;
  const rec = (o: number) => q.rec(o), recW = (o: number) => q.recW(o), stf = (o: number) => q.staff(o);
  const isGK = () => s16(pos) === 1;                                   // call 0x6c38c0; cmp ax, 1
  const noWideDef = (arg: number) => noWideDefenders5b8dc0(env.tactics[arg ? 1 : 0]);   // sub_6d5b20(arg): arg ≠ 0 → engine+0xaac5
  const noWideMA = (arg: number) => noWideMidAttack5b8960(env.tactics[arg ? 1 : 0]);    // sub_6d5af0(arg)
  const wideFlank = () => s16(pos & 0x880) !== 0 && s16(posA & 0x880) !== 0;

  // 0x6ec019–0x6ec054: lokale variabler
  sI(0x28, 0); sI(0x18, 0); sI(0x24, 0); sI(0x1c, 0); sI(0x14, 0);
  const age = stf(0x18);                                               // [esp+0x12] = staff+0x18
  FR.setInt8(0x12, age);

  // 0x6ec07d–0x6ec34a: anføreren (find_captain_slot; [anfører+0x6d] ≠ 0)
  const cap = env.captain;
  if (cap) {
    let st0 = fild(0x30, cap.influence) - 15.0;                        // 0x6ec0d4
    st0 *= 0.6060606060606061;
    sF(0x18, st0);                                                     // 0x6ec0f3
    st0 = fild(0x30, cap.r39);                                         // 0x6ec158
    st0 = st0 + st0;
    st0 = st0 + fild(0x30, cap.ca);                                    // 0x6ec16a faddp
    st0 *= 0.1;
    if (lt(st0, 0.0)) sD(0x34, 0.0);                                   // 0x6ec174
    else if (!le(st0, 20.0)) sD(0x34, 20.0);                           // 0x6ec197 (0x40340000)
    else sD(0x34, st0);
    st0 = fild(0x30, cap.influence) * gD(0x34);                        // 0x6ec1d0
    st0 *= 0.005;
    sF(0x28, st0);                                                     // 0x6ec1e0
    if (s16(cap.pos) === 1) {                                          // 0x6ec1e7
      st0 = fild(0x30, cap.influence - 0x14) * 0.5;
    } else {
      st0 = fild(0x30, Math.imul(cap.influence, cap.r44)) * 0.05;     // 0x6ec227
      st0 = (st0 - 15.0) * 0.5;
    }
    sF(0x24, st0);                                                     // 0x6ec240
    const ca = cap.s18;                                                // 0x6ec244
    if (ca < 0x12) { sF(0x18, gF(0x18) * f(0.5)); sF(0x24, gF(0x24) * f(0.75)); sF(0x28, gF(0x28) * f(0.75)); }
    else if (ca < 0x15) { sF(0x18, gF(0x18) * f(0.75)); sF(0x24, gF(0x24) * f(0.85)); sF(0x28, gF(0x28) * f(0.85)); }
    else if (ca < 0x18) { sF(0x18, gF(0x18) * f(0.9)); sF(0x24, gF(0x24) * f(0.9)); sF(0x28, gF(0x28) * f(0.9)); }
    else if (ca > 0x1e && ca < 0x24) sF(0x18, gF(0x18) * f(1.05));
    if (cap.days < (0x32 - cap.s59) * 10) sF(0x18, gF(0x18) * f(0.9));  // 0x6ec2fd–0x6ec320
    if (cap.s5b < 0xa) {                                               // 0x6ec324–0x6ec346
      st0 = fild(0x30, cap.s5b) * f(0.01) + f(0.9);
      sF(0x18, st0 * gF(0x18));
    }
  }
  // 0x6ec34a–0x6ec3b7: kontrakten med egen klub (ikke landshold)
  const contract = env.natOwn ? null : env.contract;
  // 0x6ec3b7–0x6ec3ec: samspillet
  {
    let st0 = fild(0x30, env.cohesion - 0x64) * 0.008 + 1.0;
    sF(0x18, st0 * gF(0x18));
  }
  // 0x6ec3d0–0x6ec4cd: det mentale led bl (w33, w31, Pressure +0x5a / Determination +0x58 / Professionalism +0x5b)
  let bl: number;
  {
    const w33 = q.w33;
    if (w33 > 0xa) bl = idiv(w33, 4);                                  // 0x6ec3f2
    else {
      let b = stf(0x5a); const d = stf(0x58);
      if (!(b > d)) b = d;                                             // 0x6ec40b
      bl = idiv(Math.imul(0xa - w33, b - 0xa), 10);                    // 0x6ec421–0x6ec435
    }
    const w31 = q.w31;
    let dl: number;
    if (w31 < 0) {                                                     // 0x6ec440
      let a = stf(0x58); const d = stf(0x5a);
      if (d > a) a = d;
      dl = idiv(Math.imul(a - 0xa, w31), -10);                         // 0x6ec455–0x6ec46a (imul 0x99999999 = / −10)
    } else {
      dl = idiv(Math.imul(stf(0x5b) - 0xa, w31), 10);                  // 0x6ec46e–0x6ec48d
      if (dl > 0xa) dl = 0xa;
    }
    bl = s8(bl + dl);                                                  // 0x6ec499 add bl, dl
    if (!isGK()) { if (bl < -10) bl = -10; else if (bl > 10) bl = 10; } // 0x6ec4ab
    else { if (bl < -5) bl = -5; else if (bl > 15) bl = 15; }          // 0x6ec4bd
  }
  // 0x6ec4cd–0x6ec647: nervøsiteten [esp+0x1c] (publikumsbyten)
  const crowd = env.crowd;
  if (crowd !== 0) {
    let v: number;
    const tail = (st: number) => {                                      // fild (Prof−10)·1/6, fild (IM−10)·0,25, [esp+0x18]·0,5 – tre fsubp
      st = st - fild(0x30, stf(0x5b) - 0xa) * 0.16666666666666666;
      st = st - fild(0x30, rec(0x2c) - 0xa) * 0.25;
      return st - gF(0x18) * 0.5;
    };
    if (env.fx3a === 8 || env.fx3a === 0xa) {                          // 0x6ec4f0 (fixture ≠ 0 altid – læst ved 0x6ec06d)
      v = tail((fild(0x1c, crowd) + 10.0) * f(1.3) + 3.5);              // 0x6ec4fd–0x6ec558
    } else {
      let k = f(1.35);                                                 // 0x6ec561
      if (env.engByte0 === 0 && env.comp!.rep > 0xc) k = fild(0x30, env.comp!.rep - 0xa) * f(0.0416666679084301) + f(1.35);
      v = tail((fild(0x1c, crowd) + 10.0) * f(1.3) + 2.5) / k;          // 0x6ec594–0x6ec5f1 fdivrp
    }
    let st0 = fild(0x30, idiv(crowd, 2)) + 2.5;                        // 0x6ec5f3
    st0 = st0 + v;
    st0 = st0 + st0;
    sF(0x1c, st0);
    if (isGK()) sF(0x1c, gF(0x1c) * f(0.5263158082962036));            // 0x6ec614
    if (lt(gF(0x1c), 1.0)) FR.setUint32(0x1c, 0x3f800000, true);       // 0x6ec62e
  }
  // 0x6ec647–0x6eca87: kamp-CA'en
  sF(0x30, fild(0x30, rec(0x21)));                                     // Consistency → float [esp+0x30]
  if (!env.inDb) {                                                     // 0x6ec665: staff-id ≥ staff_count
    let st0 = fild(0x34, recW(5)) + gF(0x18) * 1.75;
    st0 = st0 - gF(0x1c);
    q.matchCA = ftol16(st0);                                           // 0x6ec696
    const cm = idiv(s8(env.contractMod), 2);                           // 0x6ec6c0
    let thr = fild(0x34, cm);
    thr = thr + (gF(0x30) - gF(0x1c));
    const fr = fild(0x34, q.formRoll);
    if (fr < thr) {                                                    // 0x6ec6f1 fcompp; test ah,1
      let ca = fild(0x34, q.matchCA);
      if (le(ca, 30.0)) ca = 30.0;                                     // 0x6ec70a
      const bd = fild(0x34, q.badDay);
      sF(0x14, bd * ca * f(0.0033333334140479565));
    }
  } else {                                                             // 0x6ec733
    let st0 = fild(0x34, recW(5)) + gF(0x18) * 1.75;
    st0 = st0 - gF(0x1c);
    st0 = st0 - fild(0x34, env.staffState & 0xff);
    st0 = st0 + fild(0x34, idiv(q.motivation, 2));
    q.matchCA = ftol16(st0);                                           // 0x6ec789
    let thr = fild(0x34, idiv(s8(env.contractMod), 2));                // 0x6ec7b3–0x6ec7cb
    thr = thr + fild(0x34, idiv(q.morale, 2) - 5);
    thr = thr + (gF(0x30) - gF(0x1c));
    thr = thr + fild(0x34, bl);
    thr = thr + fild(0x34, q.motivation);
    const fr = fild(0x34, q.formRoll);
    if (!le(fr, thr)) {                                                // 0x6ec812 fcompp; test ah,0x41
      let ca = fild(0x34, q.matchCA);
      if (le(ca, 30.0)) ca = 30.0;                                     // 0x6ec827
      const bd = fild(0x34, q.badDay);
      sF(0x14, bd * ca * f(0.0033333334140479565));
    }
  }
  if (env.natF9 && !isGK()) sF(0x14, gF(0x14) + f(5));                 // 0x6ec859–0x6ec88c
  {
    let st0 = fild(0x34, Math.imul(q.morale - 0xa, q.formRoll)) * 0.03333333333333333;   // 0x6ec890
    st0 = st0 + fild(0x34, q.matchCA);
    q.matchCA = ftol16(st0);                                           // 0x6ec8c0
  }
  // 0x6ec8c4–0x6ec9c2: unge spillere i store kampe
  if (env.comp && env.fx3a !== 6 && s16(env.comp.rep) !== 0 && env.inDb && age < 0x18) {
    const A = s16(Math.imul(env.comp.rep, 500));                       // movsx ebx, dx
    let b = Math.imul(stf(0x5a), 150);
    if (rec(0xf) !== 0x14) { if (age > 0x15) b += 0x2ee; else if (age > 0x12) b += 0xfa; }
    const B = s16(b);                                                  // movsx ecx, ax
    const d = A - B;
    if (d > 0x1194 && recW(0xd) < d) {
      const e = recW(0xd) - A + B;
      let add: number;
      if (isGK()) add = e <= 0x9c4 ? f(2.5) : f(5);                    // 0x6ec98c → 0x6ec9ae
      else if (e > 0x9c4) add = f(7.5);                                // 0x6ec994
      else add = e <= 0x4e2 ? f(2.5) : f(5);
      sF(0x14, gF(0x14) + add);
    }
  }
  if (isGK()) {                                                        // 0x6ec9c6–0x6eca1f
    const x = ftol16(fild(0x34, recW(5)) * 0.75);
    if (q.matchCA < x) q.matchCA = x;
    if (env.inDb && q.matchCA < 8) q.matchCA = 8;
  }
  {
    const lim = isGK() ? s16(recW(7) + 0xa) : recW(7);                 // 0x6eca23–0x6eca59
    if (q.matchCA > lim) q.matchCA = lim;
  }
  q.matchCA = ftol16(fild(0x34, q.matchCA) * 0.5 + 80.0);              // 0x6eca5d–0x6eca80
  const K = q.matchCA;
  const soft = K > 0x96 ? 1 : 0;                                       // setg bl
  sI(0x30, soft);
  const pen = () => gF(0x14);
  const softOn = () => gI(0x30) !== 0;

  // 0x6eca95–0x6ecbc7: Anticipation +0x7d
  {
    let a = age > 0x24 ? fild(0x34, rec(0x1e)) * 0.75 : fild(0x34, rec(0x1e));
    sD(0x4c, pen() * 0.8);                                             // 0x6ecac0
    a = a + a;
    let st0 = (a + fild(0x34, K)) - gD(0x4c);
    F.anticipation = f(st0 * 0.1);                                     // 0x6ecada
    if (!env.human && env.manager) F.anticipation = f(fild(0x34, env.manager.rating - 0xd) * 0.1 + F.anticipation);   // 0x6ecb3c–0x6ecb58
    else F.anticipation = f(F.anticipation + 0.225);
    if (lt(F.anticipation, 0.0)) F.anticipation = 0;                   // 0x6ecb69
    if (pos & 0x20 && pos & 0xc) F.anticipation = f(F.anticipation * 0.95);
    F.anticipation = f(F.anticipation * 0.5 + 5.0);                    // 0x6ecbb8
  }
  // 0x6ecbca–0x6eccea: Crossing +0x8d
  {
    sD(0x3c, pen() * 0.6);
    let a = fild(0x34, rec(0x23)); a = a + a;
    F.crossing = f(((a + fild(0x34, K)) - gD(0x3c)) * 0.1);
    if (noWideDef(side === 0 ? 1 : 0) && wideFlank() && (pos & 0x60 || posA & 0x60)) F.crossing = f(F.crossing * 1.025);  // 0x6ecc07–0x6ecc97
    if (lt(F.crossing, 0.0)) F.crossing = 0;
    if (!le(F.crossing, 16.0) && soft) F.crossing = f(pw(F.crossing - 16.0, 1.25) + 16.0);
  }
  // 0x6eccf0–0x6ecd2c: Decisions +0x91
  {
    let a = fild(0x34, rec(0x24)); a = a + a;
    const st0 = ((a + fild(0x34, K)) - pen()) * 0.1;
    F.decisions = f(st0);
    if (lt(st0, 0.0)) F.decisions = 0;
  }
  // 0x6ecd32–0x6ecdc4: Dribbling +0x95
  {
    sD(0x54, pen() * 0.35);
    let a = fild(0x34, rec(0x26)); a = a + a;
    F.dribbling = f(((a + fild(0x34, K)) - gD(0x54)) * 0.1);
    if (pos & 0x20 && pos & 0xc) F.dribbling = f(F.dribbling * 0.95);
    if (lt(F.dribbling, 0.0)) F.dribbling = 0;
  }
  // 0x6ecdca–0x6ecef1: Finishing +0x99
  {
    sD(0x44, pen() * 0.67);
    let a = fild(0x34, rec(0x27)); a = a + a;
    const st0 = ((a + fild(0x34, K)) - gD(0x44)) * 0.1;
    F.finishing = f(st0);
    if (lt(st0, 0.0)) F.finishing = 0;
    if (wideFlank()) F.finishing = f(F.finishing * 0.92);              // 0x6ece1a–0x6ece62
    if (pos & 0x20 && pos & 0xc) F.finishing = f(F.finishing * 0.95);
    if (!le(F.finishing, 16.0) && soft && !env.natF9) F.finishing = f(pw(F.finishing - 16.0, 1.25) + 16.0);
  }
  // 0x6ecef7–0x6ecfdd: [esp+0x1c] = CA som double; Handling +0xa5, Heading +0xa9, Long Shots +0xb1
  sD(0x1c, fild(0x34, K));
  {
    let a = fild(0x34, rec(0x2a)); a = a + a;
    let st0 = ((a + gD(0x1c)) - pen()) * 0.1;
    F.handling = f(st0); if (lt(st0, 0.0)) F.handling = 0;
    a = fild(0x34, rec(0x2b)); a = a + a;
    st0 = ((a + gD(0x1c)) - gD(0x3c)) * 0.1;
    F.heading = f(st0); if (lt(st0, 0.0)) F.heading = 0;
    if (!le(F.heading, 18.0) && soft) F.heading = f(pw(F.heading - 18.0, 1.2) + 18.0);
    a = fild(0x34, rec(0x31)); a = a + a;
    st0 = ((a + gD(0x1c)) - pen()) * 0.1;
    F.longShots = f(st0); if (lt(st0, 0.0)) F.longShots = 0;
  }
  // 0x6ecfe3–0x6ed081: Marking +0xb5
  {
    sD(0x5c, pen() * 0.5);
    let a = fild(0x34, rec(0x32)); a = a + a;
    const st0 = ((a + gD(0x1c)) - gD(0x5c)) * 0.1;
    F.marking = f(st0); if (lt(st0, 0.0)) F.marking = 0;
    sF(0x1c, pw(F.marking, 2.200000047683716) * 0.05 + 1.0);           // 0x6ed026–0x6ed043
    F.marking = gF(0x1c);
    if (!le(gF(0x1c), 16.0) && soft) F.marking = f(pw(gF(0x1c) - 16.0, 1.2) + 16.0);
  }
  // 0x6ed087–0x6ed3df: Off the Ball +0xb9
  {
    const r = fild(0x34, rec(0x33));
    let st0: number;
    if (age > 0x24) st0 = r * 0.75;
    else if (pos & 0x40) st0 = r;
    else if (pos & 0x20) st0 = r * 0.95;
    else if (pos & 0x18) st0 = rec(0x12) === 0x14 ? r * 0.85 : r * 0.9;
    else st0 = r * 0.8;
    sF(0x18, st0);                                                     // 0x6ed164
    if (wideFlank()) {                                                 // 0x6ed15e–0x6ed200
      if (pos & 0x30) sF(0x18, gF(0x18) * 1.04);
      else if (pos & 8 || posA & 8) sF(0x18, gF(0x18) * 1.025);
    }
    if (noWideDef(side === 0 ? 1 : 0) && wideFlank() && (pos & 0x60 || posA & 0x60)) sF(0x18, gF(0x18) * 1.025);  // 0x6ed204–0x6ed292
    if (noWideMA(side) && (pos & 0x78 || posA & 0x78)) sF(0x18, gF(0x18) * 0.925);  // 0x6ed296–0x6ed2e3
    let a = gF(0x18); a = a + a;
    F.offTheBall = f(((a + fild(0x34, K)) - gD(0x4c)) * 0.1);          // 0x6ed2e7–0x6ed310
    if (!env.human && env.manager) {                                   // 0x6ed32c–0x6ed3a6
      sF(0x1c, fild(0x34, env.manager.n0e) * f(0.019999999552965164) + f(0.10000000149011612));   // [esp+0x24] efter 2 push
      F.offTheBall = f(fild(0x34, env.manager.rating - 0xd) * gF(0x1c) + F.offTheBall);
    } else F.offTheBall = f(F.offTheBall + 0.125);
    const v = F.offTheBall * f(0.65) + f(7);                           // 0x6ed3ba
    F.offTheBall = f(v); if (lt(v, 0.0)) F.offTheBall = 0;
  }
  // 0x6ed3e5–0x6ed52a: One on Ones +0xbd, Passing +0xc5
  {
    const k = fild(0x34, K);
    let a = fild(0x34, rec(0x35)); a = a + a;
    let st0 = ((a + k) - pen()) * 0.1;
    F.oneOnOnes = f(st0); if (lt(st0, 0.0)) F.oneOnOnes = 0;
    a = fild(0x34, rec(0x37)); a = a + a;
    st0 = ((k + a) - gD(0x54)) * 0.1;                                  // faddp st(1): K + 2a
    F.passing = f(st0); if (lt(st0, 0.0)) F.passing = 0;
    if (noWideDef(side === 0 ? 1 : 0) && wideFlank() && (pos & 0x60 || posA & 0x60)) F.passing = f(F.passing * 1.0125);  // 0x6ed45a–0x6ed4ea
    if (!le(F.passing, 18.0) && soft) F.passing = f(pw(F.passing - 18.0, 1.25) + 18.0);
  }
  // 0x6ed52a–0x6ed566: Penalties +0xc9
  {
    let a = fild(0x34, rec(0x38)); a = a + a;
    const st0 = ((a + fild(0x34, K)) - gD(0x5c)) * 0.1;
    F.penalties = f(st0); if (lt(st0, 0.0)) F.penalties = 0;
  }
  // 0x6ed56c–0x6ed927: Positioning +0xcd
  {
    sF(0x1c, age > 0x24 ? fild(0x34, rec(0x39)) * 0.75 : fild(0x34, rec(0x39)));   // 0x6ed59b
    if (wideFlank()) {                                                 // 0x6ed5a3–0x6ed65f
      if (pos & 4) sF(0x1c, gF(0x1c) * 1.04);
      else if (pos & 8) sF(0x1c, gF(0x1c) * 1.0325);
      else if (pos & 0x10 || posA & 0xc) sF(0x1c, gF(0x18) * 1.025);   // 0x6ed655: fld [esp+0x18] (Off the Ball-faktoren)
    }
    if (isGK()) {                                                      // 0x6ed663–0x6ed6a4
      if (age < 0x15 || recW(0xd) < 0xea6) sF(0x1c, gF(0x1c) * 0.925);
      else if (age < 0x17) sF(0x1c, gF(0x1c) * 0.975);
    }
    if ((pos & 4 || posA & 4) && s16(posA) !== s16(pos)) {            // 0x6ed6a8–0x6ed7c0
      const idx = (w: number) => (w & 1 ? 0 : w & 4 ? 1 : w & 8 ? 2 : w & 0x10 ? 3 : w & 0x20 ? 4 : w & 0x40 ? 5 : 3);
      const d = s8(Math.abs(idx(pos) - idx(posA)));
      sF(0x1c, d > 1 ? gF(0x1c) * 0.875 : gF(0x1c) * 0.95);
    }
    let a = gF(0x1c); a = a + a;
    F.positioning = f((((a + fild(0x34, K)) - gD(0x3c)) + gF(0x28)) * 0.1);   // 0x6ed7c8–0x6ed7f5
    if (!env.human && env.manager) {                                   // 0x6ed811–0x6ed88b
      sF(0x28, f(0.5) - fild(0x34, env.manager.n0e) * f(0.019999999552965164));   // [esp+0x30] efter 2 push
      F.positioning = f(fild(0x34, env.manager.rating - 0xd) * gF(0x28) + F.positioning);
    } else F.positioning = f(F.positioning + 0.125);
    const v = pw(F.positioning, 2.200000047683716) * 0.05 + 1.0;       // 0x6ed89f
    F.positioning = f(v); if (lt(v, 0.0)) F.positioning = 0;
    if (!le(F.positioning, 16.0) && softOn() && !isGK()) F.positioning = f(pw(F.positioning - 16.0, 1.2) + 16.0);
  }
  // 0x6ed927–0x6eda02: Reflexes +0xd1, Tackling +0xdd, Throw Ins +0xe9
  {
    const r = fild(0x34, rec(0x3a));
    sF(0x28, age > 0x27 ? r * 0.8 : age > 0x25 ? r * 0.9 : r);         // 0x6ed96f
    const k = fild(0x34, K);
    let a = gF(0x28); a = a + a;
    let st0 = ((a + k) - pen()) * 0.1;
    F.reflexes = f(st0); if (lt(st0, 0.0)) F.reflexes = 0;
    a = fild(0x34, rec(0x3e)); a = a + a;
    st0 = ((a + k) - gD(0x44)) * 0.1;
    F.tackling = f(st0); if (lt(st0, 0.0)) F.tackling = 0;
    a = fild(0x34, rec(0x41)); a = a + a;
    st0 = (k + a) * 0.1;                                               // faddp st(1)
    F.throwIns = f(st0); if (lt(st0, 0.0)) F.throwIns = 0;
  }
  // 0x6eda08–0x6edb22: Creativity +0xf1 ([esp+0x28] skrives ikke ved Creativity > 10 og CA ≥ 125 – Reflexes-værdien bliver stående)
  {
    const c = rec(0x43);
    if (c > 0xa) {
      const ca = recW(5);
      if (ca < 0x50) sF(0x28, fild(0x34, c - 0xa) * 0.75 + 10.0);
      else if (ca < 0x7d) sF(0x28, fild(0x34, c - 0xa) * 0.85 + 10.0);
    } else sF(0x28, fild(0x34, c));
    let a = noWideMA(side) && (pos & 0x78 || posA & 0x78) ? gF(0x28) * 0.925 : gF(0x28);   // 0x6eda66–0x6edab5
    a = a + a;
    const st0 = ((a + fild(0x34, K)) - gD(0x44)) * 0.1;
    F.creativity = f(st0); if (lt(st0, 0.0)) F.creativity = 0;
    if (!le(F.creativity, 17.0) && softOn()) F.creativity = f(pw(F.creativity - 17.0, 1.2) + 17.0);
  }
  // 0x6edb28–0x6edbce: Acceleration +0x71 (loft efter engine+1 og Work Rate + Strength)
  const e1 = env.engByte1;
  {
    let cl = rec(0x1b);
    if (e1 === 1 || e1 === 8 || e1 === 0x20) {
      const al = s8(rec(0x44) + rec(0x3d));
      if (al === 0x28) { if (cl === 0x14) cl = 0x13; }
      else if (al > 0x1e) { if (cl > 0x12) cl = 0x12; }
      else if (al > 0x19) { if (cl > 0x11) cl = 0x11; }
      else if (al < 0xf) { if (cl > 0x10) cl = 0x10; }
      else if (cl > 0xf) cl = 0xf;
    }
    const st0 = fild(0x34, cl) * 0.6666666666666666 + 0.20000000298023224;
    F.acceleration = f(st0); sF(0x28, st0);
    if (!le(st0, 12.0)) F.acceleration = f(pw(gF(0x28) - 12.0, 1.25) + 12.0);
  }
  // 0x6edbd1–0x6edd19: Agility +0x79, Aggression +0x75, Balance +0x81, Bravery +0x85, Corners +0x89, Flair +0x9d, Free Kicks +0xa1, Jumping +0xad
  {
    const r = fild(0x34, rec(0x1d));
    F.agility = f((age > 0x27 ? r * 0.8 : age > 0x25 ? r * 0.9 : r) * 0.5 + 0.20000000298023224);
    F.aggression = f(fild(0x34, rec(0x1c)) * 0.5);
    F.balance = f(fild(0x34, rec(0x1f)) * 0.5 + 0.20000000298023224);
    F.bravery = f(fild(0x34, rec(0x20)) * 0.5 + 0.20000000298023224);
    F.corners = f(fild(0x34, rec(0x22)) * 0.5 + 0.20000000298023224);
    const fl = fild(0x34, rec(0x28));
    const a = age > 0x24 ? fl * 0.5 : age > 0x22 ? fl * 0.75 : fl;
    F.flair = f(a - pen() * f(0.10000000149011612));                   // fsubr st(1)
    F.freeKicks = f(fild(0x34, rec(0x29)) * 0.5714285714285714 + 0.20000000298023224);
    F.jumping = f(fild(0x34, rec(0x2e)) - pen() * f(0.03333333507180214));
  }
  // 0x6edd1f–0x6ede0d: Pace +0xc1 (loft efter engine+1 og Work Rate + Strength; 0x20 har sine egne grænser)
  {
    let al = rec(0x36);
    if (e1 === 0x20) {                                                 // 0x6edd37
      const cl = s8(rec(0x44) + rec(0x3d));
      if (cl === 0x28) { if (al === 0x14) al = 0x13; }
      else if (cl > 0x23) { if (al > 0x12) al = 0x12; }
      else if (cl > 0x1e) { if (al > 0x11) al = 0x11; }
      else if (cl < 0x14) { if (al > 0x10) al = 0x10; }
      else if (cl < 0xf) { if (al > 0xf) al = 0xf; }
      else if (al > 0xe) al = 0xe;
    } else if (e1 === 1 || e1 === 8) {                                 // 0x6edd84
      const cl = s8(rec(0x44) + rec(0x3d));
      if (cl === 0x28) { if (al === 0x14) al = 0x13; }
      else if (cl > 0x1e) { if (al > 0x12) al = 0x12; }
      else if (cl > 0x19) { if (al > 0x11) al = 0x11; }
      else if (cl < 0xf) { if (al > 0x10) al = 0x10; }
      else if (al > 0xf) al = 0xf;
    }
    const st0 = fild(0x34, al) * 0.6666666666666666 + 0.20000000298023224;
    F.pace = f(st0); sF(0x28, st0);
    if (!le(st0, 12.0)) F.pace = f(pw(gF(0x28) - f(12), 1.25) + 12.0);
  }
  // 0x6ede17–0x6edf9e: Strength +0xd9, Stamina +0xd5
  F.strength = f(fild(0x34, rec(0x3d)) * 0.5 + 0.20000000298023224);
  {
    const s = fild(0x34, rec(0x3c)) * 0.65;
    F.stamina = f(s + (age > 0x26 ? 2.25 : age > 0x23 ? 4.75 : age > 0x21 ? 5.75 : age < 0x14 ? 6.75 : age < 0x18 ? 7.25 : age < 0x1e ? 7.5 : 7.0));
    if (e1 === 1) F.stamina = f(F.stamina - 0.5);                      // 0x6edf13–0x6edf4c
    else if (e1 === 8) F.stamina = f(F.stamina - 0.75);
    else if (e1 === 0x20) F.stamina = f(F.stamina - 0.25);
    if (age < 0x20 && env.homeLeagueIsComp) {                          // 0x6edf52–0x6edf9e (fixture ≠ 0 altid)
      const rep = env.comp!.rep;
      if (rep < 5) F.stamina = f(F.stamina + 1.25);
      else if (rep < 9) F.stamina = f(F.stamina + 1.0);
    }
  }
  // 0x6edfa4–0x6ee007: Teamwork +0xe1, Technique +0xe5, Versatility +0xed
  F.teamwork = f(fild(0x34, rec(0x3f)));
  {
    let al = rec(0x40);
    if (e1 === 1) { if (al === 0x14) al = 0x13; else if (al > 0x12) al = 0x12; }
    else if (e1 === 8) { if (al > 0x11) al = 0x11; }
    else if (e1 === 0x20) { if (al > 0xf) al = 0xf; }
    F.technique = f(fild(0x34, al));
  }
  F.versatility = f(fild(0x34, rec(0x42)));
  // 0x6ee00d–0x6ee0a7: MLS (ikke keepere)
  if (!isGK() && env.comp && env.comp.mls) {
    const n = env.nation;
    if (n !== null && (n !== env.keys.us || n !== env.keys.can || n !== env.keys.mex)) F.workRate = f(F.workRate * f(0.9));   // 0x6ee049–0x6ee071
    F.flair = f(F.flair * f(0.925));
    F.creativity = f(F.creativity * f(0.925));
    F.offTheBall = f(F.offTheBall * f(0.9));
  }
  // 0x6ee0ad–0x6ee1c4: en ren keeper (GK 20, ellers svag overalt) på en markplads
  if (!isGK() && rec(0xf) === 0x14 && rec(0x11) < 0xa && rec(0x12) < 0xa && rec(0x13) < 0xf && rec(0x14) < 0xa && rec(0x15) < 0xa) {
    F.flair = f(F.flair * f(0.05000000074505806));
    F.creativity = f(F.creativity * f(0.25));
    F.dribbling = f(F.dribbling * f(0.25));
    F.decisions = f(F.decisions * f(0.25));
    F.anticipation = f(F.anticipation * f(0.25));
    F.jumping = f(F.jumping * f(0.85));
    F.heading = f(F.heading * f(0.75));
    F.positioning = f(F.positioning * f(0.5));
    F.passing = f(F.passing * f(0.5));
    F.tackling = f(F.tackling * f(0.75));
    F.offTheBall = f(F.offTheBall * f(0.75));
  }
  // 0x6ee1ca–0x6ee231: Work Rate +0xf5
  {
    const wr = age >= 0x24 ? fild(0x34, rec(0x44)) * 0.75 : fild(0x34, rec(0x44));
    let st0 = fild(0x34, q.motivation) + wr;
    st0 = st0 - gF(0x14) / fild(0x34, idiv(stf(0x5b), 2) + 0xa);
    F.workRate = f(st0 + gF(0x24) * 0.5);
  }
  if (!env.inDb) return;                                               // 0x6ee245
  // 0x6ee24b–0x6ee2c7: staff-tilstanden
  if ((env.staffState & 0xff) > 8 && stf(0x5b) < 0xf) {
    F.anticipation = f(F.anticipation * f(0.95));
    F.workRate = f(F.workRate * f(0.95));
    F.creativity = f(F.creativity * f(0.9));
    F.flair = f(F.flair * f(0.9));
    F.dribbling = f(F.dribbling * f(0.9));
    F.pace = f(F.pace * f(0.95));
  }
  // 0x6ee2cd–0x6ee728: kontrakten
  if (contract) {
    const fl = contract.flags >>> 0;
    if (fl & 0x40000) {                                                // 0x6ee2d9
      const r = rand(0x32);
      if (stf(0x5a) + age < r) {
        F.workRate = f(F.workRate * f(0.95));
        F.flair = f(F.flair * f(0.9));
        F.creativity = f(F.creativity * f(0.9));
        F.dribbling = f(F.dribbling * f(0.95));
        F.decisions = f(F.decisions * f(0.95));
        F.pace = f(F.pace * f(0.95));
      }
    }
    const p61 = env.player61;
    if (p61 && contract.b44 < -25 && p61.b44 < 0xf && stf(0x5b) < 0xa && p61.w0b > 0xea6 && p61.w0b > env.ownClubRep + 0xfa) {   // 0x6ee36e–0x6ee3db
      F.workRate = f(F.workRate * f(0.95));
      F.anticipation = f(F.anticipation * f(0.9));
      if (contract.b44 < -75) {
        F.creativity = f(F.creativity * f(0.9));
        F.flair = f(F.flair * f(0.9));
        F.dribbling = f(F.dribbling * f(0.95));
        F.finishing = f(F.finishing * f(0.9));
        F.pace = f(F.pace * f(0.95));
      }
    }
    if (fl & 0x17) {                                                   // 0x6ee45b
      const c = stf(0x5b);
      if (c > 0xf && stf(0x57) > 0xf) F.workRate = f(F.workRate * f(1.1));
      else if (c < 5) F.workRate = f(F.workRate * f(0.9));
    }
    if (fl & 0x2088) {                                                 // 0x6ee497 ([staff+0x61] uden nul-tjek)
      if ((p61!.w0b > 0x109a && stf(0x5b) < 0xa) || stf(0x5b) < 5) F.workRate = f(F.workRate * f(0.9));
    }
    if (fl & 0x38da00) {                                               // 0x6ee4cc
      const c = stf(0x5b);
      if (c === 1) F.workRate = f(F.workRate * f(0.8));
      else if (c < 6) F.workRate = f(F.workRate * f(0.95));
    }
    const strong = () => stf(0x5a) < 5 && stf(0x5b) < 6 && stf(0x5d) < 0xa && p61!.w0d > 0x1482;
    if (fl & 0x20000) {                                                // 0x6ee503
      if (strong()) {
        F.workRate = f(F.workRate * f(0.8));
        F.flair = f(F.flair * f(0.9));
        F.creativity = f(F.creativity * f(0.9));
        F.dribbling = f(F.dribbling * f(0.9));
        F.decisions = f(F.decisions * f(0.8));
        F.pace = f(F.pace * f(0.9));
      } else {
        const r = rand(0x14);                                          // 0x6ee59e
        if (stf(0x5a) < r) {
          F.workRate = f(F.workRate * f(0.95));
          F.decisions = f(F.decisions * f(0.95));
          F.flair = f(F.flair * f(0.9));
          F.creativity = f(F.creativity * f(0.9));
          F.dribbling = f(F.dribbling * f(0.9));
          F.pace = f(F.pace * f(0.95));
        }
      }
    }
    if (fl & 0x40) {                                                   // 0x6ee61d
      if (strong()) {
        F.workRate = f(F.workRate * f(0.8));
        F.flair = f(F.flair * f(0.9));
        F.creativity = f(F.creativity * f(0.9));
        F.dribbling = f(F.dribbling * f(0.9));
        F.decisions = f(F.decisions * f(0.8));
        F.pace = f(F.pace * f(0.9));
      } else {
        const r = rand(0x19);                                          // 0x6ee6af
        if (stf(0x5a) < r) {
          F.workRate = f(F.workRate * f(0.95));
          F.decisions = f(F.decisions * f(0.95));
          F.flair = f(F.flair * f(0.9));
          F.creativity = f(F.creativity * f(0.9));
          F.dribbling = f(F.dribbling * f(0.9));
          F.pace = f(F.pace * f(0.95));
        }
      }
    }
  }
  if (env.fx40 === 0) return;                                          // 0x6ee73f
  // 0x6ee745–0x6eebd4: forholdene til modstanderen, egen klub, managerne og anføreren
  const R = env.rel;
  const p5b = () => stf(0x5b), p59 = () => stf(0x59);
  const hate = () => fild(0x34, 0x19 - p5b()) * f(0.20000000298023224);
  const love = () => fild(0x34, 0x32 - p5b() - p59()) * f(0.10000000149011612);
  if (R.dislikesOpp) { F.workRate = f(F.workRate + f(5)); F.aggression = f(hate() + F.aggression); }          // 0x6ee765
  else if (R.favoursOpp) { F.workRate = f(F.workRate - love()); F.aggression = f(F.aggression - love()); }    // 0x6ee7cd
  if (R.oppMgrDislikes) { F.workRate = f(F.workRate + f(5)); F.aggression = f(hate() + F.aggression); }       // 0x6ee852
  else if (R.oppMgrFavours) { F.workRate = f(F.workRate - love()); F.aggression = f(F.aggression - love()); } // 0x6ee8ba
  if (R.favoursOwn) F.workRate = f(F.workRate + f(5));                                                        // 0x6ee93f
  else if (R.dislikesOwn) F.workRate = f(F.workRate - hate());                                                // 0x6ee97f
  if (R.ownMgrDislikes) { F.workRate = f(F.workRate - hate()); F.teamwork = f(F.teamwork - hate()); }         // 0x6ee9d2
  else if (R.ownMgrFavours) { F.workRate = f(F.workRate + f(5)); F.teamwork = f(F.teamwork + f(5)); }         // 0x6eea46
  if (R.capDislikes) { F.workRate = f(F.workRate - hate()); F.teamwork = f(F.teamwork - hate()); }            // 0x6eeae4
  else if (R.capFavours) { F.workRate = f(F.workRate + f(5)); F.teamwork = f(F.teamwork + f(5)); }            // 0x6eebaa
  // 0x6eebda–0x6eeca0: kontraktens +0x10/+0x14 mod +0xc (Teamwork)
  if (contract) {
    const c0c = contract.d0c | 0;
    if ((contract.d10 | 0) > -1 && c0c > 0) {
      const x = (fild(0x34, contract.d10) * f(40)) / c0c;              // fidiv
      if (!le(x, 1.01)) F.teamwork = f(F.teamwork - fild(0x34, 0x19 - p5b()) * x * f(0.13333334028720856));
    }
    if ((contract.d14 | 0) > -1 && c0c > 0) {
      const x = (fild(0x34, contract.d14) * f(40)) / c0c;
      if (!le(x, 1.01)) F.teamwork = f(fild(0x34, 0x19 - p5b()) * x * f(0.13333334028720856) + F.teamwork);
    }
  }
}
