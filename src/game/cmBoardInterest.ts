// Originalens vilje til et job – 0x844780 Shortlist_Manager::staff_interest_in_job_at_club(s, c, check, job, out) (cm0102.exe 3.9.68),
// oversat instruktion for instruktion efter noterne ~/cm0102-engine/notes/board/notes-G-interest.md og notes-G2-interest.md (12/11-2026) og
// kontrolleret mod disassemblyen 13/11-2026 (vægtene 0x844a9f, jobfaktorerne og springtabellerne 0x846810/0x846850/0x8468a4/0x8468b8/0x8468c8,
// 7b 0x845955, 7c 0x845a1c, 7d 0x845b1d, 8b 0x8461d7–0x846605). Rettet i noterne: nedskrivningen ved X < 0 (0x8463bc) har gulvet 0,2, ikke 0,25.
// Funktionen trækker ingen tilfældige tal og har ingen bivirkninger (out_reasons føres ikke – 0x69f810 kalder med NULL).
//
// Kun kaldet med check = 0 (0x69f810 is_staff_suitable_for_job: (s, c, 0, 5, NULL)), så kontraktdelen 0x84662e (0x864550/0x597db0) indgår ikke.
//
// Inddata, spillet ikke har (*afvigelser*, ikke regler): personerne er ikke spillere (s->player = NULL → sproget Lf = 10, ingen fremtidig
// overgang), landsholdene er ikke klubber (0x53b900 altid falsk; en person uden klub med et landsholdsjob ≠ 5/11 ville få landsholdet som H –
// her 0, se `natH`), kontrakten k med H har +0x44 = 0 og +0x45 = 0 (stabens tilfredshed/klager føres ikke), klubbernes [0xae2d14]-plads er −1
// (som i cmSquadPlanGame.ts), club +0x73 er databasens gennemsnitlige tilskuertal (0x48aff0's opdatering efter hjemmekampe er ikke porteret).
import type { BoardEnv, Person, BoardRec, StatsEntry } from './cmBoard';
import { ftol, f32, s16, s8, repFor } from './cmBoard';

const tdiv = (a: number, b: number) => Math.trunc(a / b);

/** det 0x844780 læser ud over BoardEnv */
export interface InterestEnv {
  b: BoardEnv;
  /** MANAGER_MANAGER's bestyrelsespost (73 bytes) – null uden MM */
  rec(c: number): BoardRec | null;
  /** 0x53dba0(s, …, 1): fællesnavnet eller "fornavn efternavn" */
  name(p: Person): string;
  /** staff +0x24 ≠ NULL og +0x28 (landsholdsjobbet) */
  nat(p: Person): { nc: boolean; nj: number };
  /** præferenceposten staff+0x65 (12 pladser, cmRelations.ts) og personens nøgle (pegeren) */
  rel(p: Person): number[] | undefined;
  key(p: Person): number;
  /** club +0x64 (1 professionel, 2 semi, 3 amatør) */
  status(c: number): number;
  /** club +0xb3/+0xb7/+0xbb */
  rivals(c: number): number[];
  /** club +0x57: turnerings-id (−1 = NULL) og dens +0x69 */
  divId(c: number): number;
  compLevel(id: number): number;
  /** club +0x73 */
  i73(c: number): number;
  /** stadion +0x38 → by +0x33 (s8); null = intet stadion/ingen by */
  city33(c: number): number | null;
  /** club +0x1db (turnerings-id, −1 = ingen) */
  euro(c: number): number;
  /** Shortlist_Manager +0xdc[9·id]+5 (0x83bf40) */
  targetRep(c: number): number;
  /** nation +0x71 (verdensdel, −1 = NULL) */
  continent(n: number): number;
  /** nøgle-id'erne: Europe [0x9cfa10], Inter-Toto [0x9cf6f8], "A Lower Division" [0x9cf764], Glasgow Celtic/Rangers [0x9d0118/0x9d011c],
   *  Italy [0x9cf360], Croatia [0x9cf2ac], Yugoslavia [0x9cf51c] (−1 = findes ikke) */
  ids: { europe: number; interToto: number; lowerDiv: number; celtic: number; rangers: number; italy: number; croatia: number; yugoslavia: number };
}

const has3 = (b: number[] | undefined, at: number, x: number) => !!b && !!x && (b[at] === x || b[at + 1] === x || b[at + 2] === x);
// 0x547d30 / 0x547d60 / 0x547810 / 0x547840
const dislikesClub = (E: InterestEnv, s: Person, c: number) => !!c && has3(E.rel(s), 3, c);
const favoursClub = (E: InterestEnv, s: Person, c: number) => !!c && has3(E.rel(s), 0, c);
const favoursPerson = (E: InterestEnv, owner: Person, t: Person | null) => !!t && has3(E.rel(owner), 6, E.key(t));
const dislikesPerson = (E: InterestEnv, owner: Person, t: Person | null) => !!t && has3(E.rel(owner), 9, E.key(t));

/** kvadratet af nation +0x7e klemt til 1..3 (ellers 3) */
function lev(E: InterestEnv, n: number): number {
  let v = n >= 0 ? s8(E.b.nat7e(n)) : 3;
  if (v < 1 || v > 3) v = 3;
  return (v * v) & 0xff;
}
/** grundleddet (0x84545d / 0x845c4d): byens +0x33 */
function baseOf(E: InterestEnv, c: number): number {
  const r = s16(E.b.clubRep(c)), k = E.city33(c);
  if (k !== null) {
    if (k === 0) return tdiv(r, 2);
    const t = tdiv(k * r, 15), A = r * 0.2857142857142857;
    return ftol(A > t ? A : t);
  }
  return ftol(r * 0.2857142857142857);
}
/** divisionsleddet (0x845504) */
function divOf(E: InterestEnv, c: number): number {
  const r = s16(E.b.clubRep(c)), D = E.divId(c);
  if (D < 0) return r;
  const L = s16(E.compLevel(D));
  if (r >= 7500 && E.i73(c) > 35000) return Math.max(500 * L, r);
  return Math.max(500 * L, tdiv(r, 2) + 250 * L);
}
/** bestyrelsens tryk på chefleddet (kun MM ≠ NULL og job ≠ 5) */
function boardAdjust(R: BoardRec, v: number): number {
  const y = s16(ftol(0.67 * s16(R.w6) + 0.33 * s16(R.w8)));
  let r: number;
  if (y < 5000) { const F = 5.0 - 0.0008 * y; r = Math.max(v / F, v - 1000.0 * F); }
  else { const G = 0.5 + 0.0001 * y; r = Math.min(v * G, v + 1000.0 * G); }
  return ftol(r);
}

/** 0x4b02e0 comp_util_get_league_clash_type(a, b): 0, 1 (titelkamp) eller 3 (oprykningskamp) – samme division, Comp_Stats-rækkerne */
export function leagueClash(env: BoardEnv, a: number, b: number): number {
  const da = env.division(a);
  if (!da || da !== env.division(b)) return 0;                                    // (0x7e6f20: reserve-/B-turneringer – ikke ligaer hos os)
  const L = env.league(da), ea = env.entry(a), eb = env.entry(b);
  if (!L || !ea || !eb) return 0;                                                   // (+0x30 = −1 og +0x43 = 2: ligaens hovedstadie)
  const n = s16(L.teams);
  if (Math.abs((ea.p73 & 0xff) - (eb.p73 & 0xff)) > s16(ftol(n * 0.25))) return 0;
  const proj = (e: StatsEntry) => {
    let x = 0.5, w20 = 1.0, w28 = 1.0;
    const g = e.played & 0xff;
    if (g < 25) { x = g * 0.02; w28 = g * 0.04; w20 = 4.0 - g * 0.12004801920768307; }
    return ((e.p75 & 0xff) * x + (e.pos & 0xff) * w20 + (e.p73 & 0xff) * w28 + (e.p74 & 0xff) * x) / (x + x + w20 + w28);
  };
  const PA = proj(ea), PB = proj(eb);
  const both = (T: number, strictLess: boolean) => (strictLess ? PA < T && PB < T : PA <= T && PB <= T) && (ea.p74 & 0xff) <= PB && (eb.p74 & 0xff) <= PA;
  if (!L.autoPromo) { if (both(n * 0.3333333333333333, true)) return 1; return 0; }
  if (both(n * 0.2 + s8(L.promo), false)) return 3;
  if (s8(L.playoff) !== 0 && both(n * 0.2 + s8(L.promo) + s8(L.playoff), false)) return 3;
  return 0;
}

/** én klubside af 7a/8 (c: target = true) – returnerer [mix, euroComp ≠ NULL, div] */
function sideMix(E: InterestEnv, s: Person, X: number, job: number, target: boolean, w: { f60: number; f84: number; f74: number; f88: number; f8c: number }): { mix: number; euro: boolean; div: number } {
  const env = E.b;
  const bse = baseOf(E, X), dv = divOf(E, X);
  let e = E.euro(X);
  if (!target && e > -1 && e === E.ids.interToto && s16(env.clubRep(X)) >= 5000) e = -1;      // ([0xae2d14]-pladsen er −1)
  const euro = e > -1;
  const eur = euro ? s16(E.compLevel(e) * 600) : ftol(Math.min(s16(dv) * 0.8, 7000.0));
  const mg = env.manager(X);
  let boss: number;
  if (!mg || !mg.np) boss = target ? 0 : ftol(s16(dv) * 0.75);
  else {
    boss = target ? s16(repFor(env, mg, { club: s.club, nation: s.nation })) : s16(mg.rep[1]);
    const R = E.rec(X);
    if (R && job !== 5) boss = s16(boardAdjust(R, boss));
  }
  let rp = s16(env.clubRep(X));
  switch (env.wealthBand(X)) {
    case -2: rp = ftol(rp * (target ? 0.7 : 0.75)); break;
    case -1: rp = ftol(rp * (target ? 0.85 : 0.9)); break;
    case 1: rp = ftol(rp * 1.25); if (s16(rp) < (target ? 4250 : 4750)) rp = target ? 4250 : 4750; break;
    case 2: rp = ftol(rp * 1.5); if (s16(rp) < 5750) rp = 5750; break;
  }
  const eE = ftol(s16(E.targetRep(X)) * 0.4 + s16(rp) * 0.6);
  let mix = ftol(((((s16(eur) * w.f60 + s16(dv) * w.f84) + s16(boss) * w.f74) + s16(bse) * w.f88) + s16(eE)) / w.f8c);
  const st = E.status(X);
  if (st !== 1) {
    let q = s.b22 & 0xff; q = q * q + 400;
    mix = Math.min(tdiv(s16(mix), 2), s16(mix) - 5 * q);
    if (st === 3) mix = Math.min(s16(mix) - 2000, tdiv(s16(mix), 2));
  }
  return { mix, euro, div: dv };
}

/** niveau-/sprogfaktoren D (7b/8a): Lf = 10 (personerne er ikke spillere) */
function levelFactor(n: number): number {
  const nn = s16(n) + 5000;
  const Q = (nn * 6.666666666666667e-05) * nn;
  const Lf = 10.0;
  let D = Q / (12000.0 - 200.0 * Lf);
  if (!(0.1 * Lf <= D)) D = 0.1 * Lf;
  return D + 0.2;
}

/** 0x844780 med check = 0 og out = NULL */
export function staffInterest(E: InterestEnv, s: Person, c: number, job: number): number {
  const env = E.b;
  let S = 0.0, tenure = 1.0;
  const cn = env.clubNation(c);
  if (!s.np || cn < 0 || s.nation < 0) return 0.0;
  const nm = E.name(s);
  if ((nm === 'Dario Gradi' || nm === 'Pat Nevin' || nm === 'Kevin Keegan') && s.club) return 0.0;
  const cj = s8(s.job), { nc, nj: njRaw } = E.nat(s), nj = s8(njRaw);
  if (cj === 17 || nj === 17) return 0.0;
  if (job !== 5 && s.human) return 0.0;
  if (nc && nj === 5) return 0.0;
  if (job !== 0) {
    if (job !== 5 && (cj === 5 || cj === 12 || nj === 5 || nj === 12) && (s16(s.rep[1]) > 4250 || s16(s.ca) > 100)) return 0.0;
    if (job === 10 && cj !== 10 && cj !== 0) return 0.0;
    // (spillere med sekundærjob: s->player = NULL hos os)
    if (job !== 10 && cj === 10) return 0.0;
  }
  if (job !== 5 && (cj === 5 || cj === 12 || nj === 5 || nj === 12) && s.club) {
    const dc = E.divId(c), ds = E.divId(s.club);
    if (dc >= 0 && ds >= 0 && s16(E.compLevel(ds)) >= s16(E.compLevel(dc))) return 0.0;
    if (s16(env.clubRep(s.club)) > s16(env.clubRep(c)) - 750) return 0.0;
  }
  if (s16(env.clubRep(c)) < 2750) {
    if (s.club && env.clubNation(s.club) === cn) return 0.0;
    if (env.foreign(s, cn)) return 0.0;
  }
  const f74 = job === 5 || job === 12 ? 0.0 : 1.0;
  const A = s8(s.amb), P = s8(s.prof);
  const f88 = f32((1.4 - 0.025 * A) - 0.025 * P);
  const f84 = f32(A * 0.02 + 0.8);
  const w60 = A * 0.05 + 0.5, f60 = f32(w60);
  const tot = (((w60 + f84) + f88) + f74) + 1.0;
  const f8c = !(tot > 0.0) ? 0.5 : f32(tot);
  const W = { f60, f84, f74, f88, f8c };
  // H = klubben, hvor personen er nu
  let H = s.club, curJob = cj;
  if (!H && nc && nj !== 11) return 0.0;                                       // H = landsholdet (findes ikke som klub hos os)
  const Hn = H ? env.clubNation(H) : -1;
  if (H && Hn < 0) return 3.5;
  // kontrakten k med H: +0x44 = +0x45 = +0x49 = 0 (se filhovedet)
  if (c !== H) {
    // (k && samme sprog && k->b45 & 0x20: +0x45 = 0)
    S = job === 5 || job === 12 ? 2.25 : 1.5;
    const st = env.gameStart, td = env.today;
    const startLeToday = (st.year & 0xffff) < (td.year & 0xffff) || ((st.year & 0xffff) === (td.year & 0xffff) && s16(st.day) <= s16(td.day));
    if (!H && startLeToday) {
      let d = s.joined;
      if ((d.year & 0xffff) < (st.year & 0xffff) || ((d.year & 0xffff) === (st.year & 0xffff) && s16(d.day) < s16(st.day))) d = st;
      let days = (365 * (((td.year - d.year) & 0xffff)) - s16(d.day) + s16(td.day)) | 0;
      if (days > 500) days = 500;
      S += Math.min((days * days) / (s16(s.rep[1]) + 900.0), 12.0);
    }
  } else S = 3.5;
  // præferencerne
  if (dislikesClub(E, s, c)) S *= 0.33;
  if (H && dislikesClub(E, s, H)) S *= 2.0;
  if (H && favoursClub(E, s, H)) S *= E.status(H) !== 1 && E.status(c) === 1 ? 0.85 : 0.5;
  if (favoursClub(E, s, c)) S *= 3.0;
  // rival-/loyalitetsblokken
  if (H) {
    const direct = E.rivals(H).includes(c);
    const rival = c !== H && (direct || leagueClash(env, c, H) !== 0);
    if (H !== c && rival) {
      const L = s8(s.b59);
      const ids = E.ids;
      let F: number;
      const of = (x: number) => x === ids.celtic || x === ids.rangers;
      if (ids.celtic >= 0 && of(c) && of(H)) F = 0.5 - 0.025 * L;
      else if (cn === ids.italy) F = 1.0 - L * 0.016666666666666666;
      else if (direct && E.divId(c) === E.divId(H)) {
        F = Math.abs(s16(env.clubRep(c)) - s16(env.clubRep(H))) < 1250 ? 0.75 - 0.025 * L : 0.8 - L * 0.016666666666666666;
      } else F = 0.85 - 0.025 * L;
      S *= F;
    } else {
      const ids = E.ids;
      if (cn === ids.yugoslavia) { if (Hn === ids.croatia && s.nation === ids.croatia) S *= 0.05; }
      else if (cn === ids.croatia) { if (Hn === ids.yugoslavia && s.nation === ids.yugoslavia) S *= 0.1; }
    }
  }
  // managerpræferencerne
  if (job !== 5 && job !== 12) {
    const mg = env.manager(c);
    if (favoursPerson(E, s, mg)) S *= 2.0;
    if (dislikesPerson(E, s, mg)) S *= 0.33;
  }
  if (H) {
    const m2 = env.manager(H);
    if (dislikesPerson(E, s, m2)) S *= 2.0;
    if (favoursPerson(E, s, m2)) S *= 0.5;
  }
  // (s->player: ingen fremtidig overgang); k->b44 = 0 → faktoren 1 + 0·0,0025 = 1
  if (c === H) return S;                                                       // 0x8451ca → 0x84662a (check = 0)

  // 5. det nuværende job (0x8451d6)
  switch (curJob) {
    case 1: S *= 0.01; break;
    case 2: case 3: case 4: if (job !== 5 || s16(env.clubRep(c)) < 6000) S *= 0.01; else S *= 0.5; break;
    case 5: case 12: S *= H ? 0.45 : 0.65; break;
    case 6: case 13: S *= 1.5; break;
    case 7: case 14: S *= 2.2; break;
    case 8: case 15: S *= A * 0.05 + 0.8; break;
    case 9: case 10: break;
    case 16: S *= 10.0 / (A > 1 ? A : 1); break;
    default: S *= 10.0; break;
  }
  // 6. målets job (0x84531a)
  const mgr = (j: number) => j === 5 || j === 12;
  switch (job) {
    case 0: return 0.0;
    case 1: S *= 10.0; break;
    case 2: case 3: case 4: S *= 1.1764705882352942; break;
    case 5: case 12: S *= 2.2222222222222223; if (mgr(curJob)) S *= 1.5; break;
    case 6: case 13: S *= 0.5; if (mgr(curJob)) S *= 0.4; break;
    case 7: case 8: case 14: case 15: S *= 0.4; if (mgr(curJob)) S *= 0.4; break;
    case 9: case 10: S *= curJob === 9 || curJob === 10 ? 0.4 : 0.25; if (mgr(curJob)) S *= 0.4; break;
    default: S *= 0.1; if (mgr(curJob)) S *= 0.4; break;
  }
  if (H && mgr(curJob)) {
    const R = E.rec(H);
    if (R) {
      const V = s16(R.w8) + 500 * (s8(s.b59) + s8(s.det)) + s16(R.w6);
      if (V < 8000) S *= 1.4;
    }
  }
  // 7a. målklubben
  const cLev = lev(E, cn);
  const cs = sideMix(E, s, c, job, true, W);
  const nT = ftol(1.5 * s16(cs.mix) - 5000.0);
  const cDiv = cs.div;
  // 7b. sprog/niveau for målet
  S *= levelFactor(nT);
  // 7c. fremmed nation
  if (!H || ((cn < 0 || env.foreign(s, cn)) && Hn !== cn)) {
    const mg = env.manager(c);
    if (job !== 5 && job !== 12 && mg && mg.nation >= 0 && !env.foreign(s, mg.nation)) {
      const t = [0, 0, 0, 4, 1, 2, 2, 3, 3, 4, 4, 1, 2, 2], v = [0.85, 0.75, 0.65, 0.5, 0.01];
      S *= job >= 2 && job <= 15 ? v[t[job - 2]] : 0.01;
    } else {
      const v = [0.25, 0.25, 0.25, 0.3, 0.225, 0.2, 0.2, 0.2, 0.2, 0.001, 0.3, 0.225, 0.2, 0.2];
      S *= job >= 2 && job <= 15 ? v[job - 2] : 0.001;
    }
  }
  // 7d. ansættelsestiden
  if (!H) S *= 2.5;
  else {
    const td = env.today, d = s.joined;
    const days = (365 * ((td.year & 0xffff) - (d.year & 0xffff)) - s16(d.day) + s16(td.day)) | 0;
    const Loy = s8(s.b59);
    if (days < 15 * (Loy + 8)) return 0.0;
    const t = tdiv(Math.imul(days, days), 20);
    const den = Math.max(Loy + 6, 1);
    let u = tdiv(t, den);
    if (u < 0) return 0.0;
    if (u > 400) u = 400; else if (u === 0) return 0.0;
    tenure = u * 0.0025;
  }
  // 8. H-siden
  let sLev: number, nF: number, hEuro = false, hDiv = 0;
  const avg3 = tdiv(s16(s.rep[2]) + s16(s.rep[1]) + s16(s.rep[0]), 3);
  if (!H) {
    sLev = lev(E, s.nation);
    nF = ftol(1.5 * s16(avg3) - 5000.0);
  } else {
    sLev = lev(E, Hn);
    const hs = sideMix(E, s, H, job, false, W);
    hEuro = hs.euro; hDiv = hs.div;
    nF = ftol(1.5 * s16(hs.mix) - 5000.0);
    S = S / levelFactor(nF);                                                   // 8a
  }
  void hEuro;
  // 8b
  const dc = E.divId(c);
  if (dc < 0 || dc === E.ids.lowerDiv) S *= 0.1;
  const G2 = (s16(env.clubRep(c)) - avg3) * 0.000125 + 1.0;
  const dn = s16(nT) - s16(nF);
  let X: number;
  if (s16(nT) > s16(nF)) X = dn * (A * 0.08771929824561403 + 0.75);
  else if (job !== 5 && job !== 12) X = dn * 1.5;
  else if (S <= 10.0) X = dn;
  else {
    let w = 1.1 - S * 0.01;
    if (w < 0.1) w = 0.1; else if (!(w <= 1.0)) w = 1.0;
    X = w * dn;
  }
  if (X > 0.0 && tenure < 1.0) {
    let m1 = X * 0.02;
    if (100.0 < m1) m1 = 100.0;
    const R = (m1 + (150.0 - m1) * tenure) * 0.006666666666666667;
    S *= R;
  }
  if (!mgr(curJob) && mgr(job) && X < 0.0) {
    let w: number;
    if (curJob === 8 || curJob === 15 || curJob === 6) { w = 1.0 - S * 0.04; if (w < 0.4) w = 0.4; }
    else { w = 1.0 - S * 0.1; if (w < 0.2) w = 0.2; }
    X = w * X;
  }
  let Y = X * 0.00022222222222222223 + 1.0;
  if (Y < 0.001) Y = 0.001;
  S *= Y;
  if (H) {
    if (sLev !== cLev) {
      const u1 = s16(hDiv) <= 500 ? 500 : s16(hDiv);
      let rho = (sLev * s16(cDiv)) / (u1 * cLev);
      if (!(0.01 <= rho)) rho = 0.01; else if (10.0 < rho) rho = 10.0;
      S *= rho;
      if (E.continent(cn) !== E.continent(Hn) && rho < 1.0) S *= 0.2;
    } else {
      const sc = E.continent(s.nation);
      if (sc >= 0 && sc === E.ids.europe) {
        const cc = E.continent(cn);
        if (cc >= 0 && cc !== E.ids.europe && cc !== E.continent(Hn)) S *= 0.4;
      }
    }
  }
  S *= G2;
  return S;
}

/** 0x83bf40 Shortlist_Manager::update_club_target_reputation(c) → +0xdc[9·id]+5 (s16). Kaldt af computerens trupplan 0x83cb40 (0x83cda7, efter
 *  0x7bca90) og 0x48aff0 (0x48b1a4). mgr/chair = [Ambition +0x57, np +0x1d] (+ np +0x20 for formanden); human = 0x600a50(c, 1, 1, 0, 0). */
export function targetRep(i73: number, rep: number, human: boolean, mgr: [number, number] | null, chair: [number, number, number] | null): number {
  let w = s16(tdiv(i73 | 0, 10) + 4500);
  if (!human && mgr) w = s16(ftol(((s8(mgr[0]) - s8(mgr[1])) * 0.0125 + 1.0) * w));
  if (chair) {
    w = s16(ftol(((s8(chair[0]) - s8(chair[1])) * 0.016666666666666666 + 1.0) * w));
    w = s16(ftol(((s8(chair[2]) - 10) * 0.025 + 1.0) * w));
  }
  const r = s16(rep);
  if (r > w) return r;
  if (w > 10000) return 10000;
  return w;
}

/** 0x68ac40 League::update_projected_positions(club) med vt+0x68 for ligaens hovedstadie (+0x44 = 0xff): den almindelige 0x48e380 og de
 *  engelske 0x573260 (First/Second Division: play-off 3–6) og 0x578660 (Third Division: 4–7). rows = ligatabellens rækker (+0xb1, i
 *  tabellens rækkefølge): klub, kampe (+0x11, s8), point (+0x19, s16), klubbens omdømme (+0x80); wa7 = kampe pr. hold i sæsonen (+0xa7 =
 *  (hold − 1)·+0x3c), K = point for en sejr (+0xc2). Returnerer 0x4ae300's [o1 = +0x74, o2 = +0x73, o3 = +0x75] eller null (klubben findes ikke). */
export function projectPositions(rows: { club: number; games: number; pts: number; rep: number }[], me: number, wa7: number, K: number,
  playoff: [number, number] | null, qsort: <T>(a: T[], cmp: (x: T, y: T) => number) => void): [number, number, number] | null {
  const n = rows.length;
  const mine = rows.find((r) => r.club === me);
  if (!mine || !n) return null;
  const t = rows.map((r) => {
    const games = s16(s8(r.games)), pts = s16(r.pts);
    return { club: r.club, rep: s16(r.rep), pts, games, ppg: s8(r.games) > 0 ? f32(pts / s8(r.games)) : 0, proj: 0 };
  });
  const W = s16(wa7);
  if (3 * s8(mine.games) < W) {
    qsort(t, (a, b) => b.rep - a.rep);                                          // 0x68afb0
    const k = s8(K), f10 = f32(k * 0.83), D = f10 - k * 0.23;
    for (let i = 0; i < n; i++) t[i].ppg = f32(f10 - (D / n) * i);
  }
  for (const x of t) x.proj = s16(ftol((W - x.games) * x.ppg) + x.pts);
  const byProj = (a: { proj: number }, b: { proj: number }) => b.proj - a.proj;   // 0x68afd0
  const step = (mul: number | null): number => {
    qsort(t, byProj);
    const j = t.findIndex((x) => x.club === me);
    if (mul !== null) {
      const x = t[j], v = x.ppg * mul;
      x.ppg = f32(v);
      x.proj = s16(ftol((W - x.games) * v) + x.pts);
    }
    return (j + 1) & 0xff;
  };
  const normal = step(1.5), best = step(0.4444444444444444);
  qsort(t, byProj);
  const worst = (t.findIndex((x) => x.club === me) + 1) & 0xff;
  if (!playoff) return [best, normal, worst];
  const [lo, hi] = playoff;
  return [best >= lo && best <= hi ? lo : best, normal, worst >= lo && worst <= hi ? hi : worst];
}
