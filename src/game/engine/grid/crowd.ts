/**
 * Tilskuertallet sub_85cba0 (kaldt af init_match 0x6b86bc → engine+0x91d2/+0x91d6/+0x91da = i alt / hjemme / ude; init_match regner
 * publikums-bytene engine+0x1ad/+0x1ae af dem – crowdBytes i gridMatch.ts) og afstandsleddet sub_85d8a0. Porteret 12/11-2026 (runde 9) fra
 * originalens kode; kontrolleret mod oraklets spor (match_trace.c RECOMP_CROWD_TRACE: K/Kr/KO-linjerne, scripts/crowd-check.ts).
 *
 * Konstanterne er originalens doubles (0x967890 1, 0x968950 2, 0x96fe28 −6, 0x9688a0 5, 0x9689c0 1,1, 0x968928 1,25, 0x968918 0,2,
 * 0x967888 0,05, 0x968f20 0,15, 0x968968 0,5, 0x969588 1,35, 0x968940 1,5, 0x9689b8 1,05, 0x969520 0,85, 0x968f30 −0,2, 0x96afe0 2/15,
 * 0x969558 14, 0x968ea8 20, 0x96d2c8 0,03 …); ftol (0x945640) = trunkering. Mellemregningerne er x87 (80 bit) i originalen – her doubles.
 */

/** en by (city.dat, 56 bytes: +0x23/+0x2b doubles) */
export interface CrowdCity { id: number; c23: number; c2b: number }
/** stadionet (stadium.dat: +0x38 byen, +0x3c kapaciteten – init kan hæve den, se cap nedenfor) */
export interface CrowdStadium { id: number; city: CrowdCity | null; cap: number }
/** klubposten (club.dat/hukommelsen) */
export interface CrowdClub {
  id: number;
  /** +0x53 (landets id) og landets +0x7e (byte) */
  nation: number; nation7e: number;
  /** +0x57 (klubbens liga/division – turneringens id) og dens +0x69 (omdømme, word); null = ingen */
  league: { id: number; rep: number } | null;
  /** +0x69 stadionet (null = intet) */
  stadium: CrowdStadium | null;
  /** +0x6d (byte: klubben er stadionets "ejer" – 0x59cfa0; delte stadioner: kun én) */
  b6d: number;
  /** +0x73 gns. tilskuere, +0x77 mindst, +0x7b højst (club.dat 115/119/123) */
  avg: number; min: number; max: number;
  /** +0x80 omdømmet (word) */
  rep: number;
  /** +0xb3/+0xb7/+0xbb rivalerne (klub-id'er) */
  rivals: number[];
}
/** Comp_Stats-rækken 0x4a4850 (post 0x76): +4 kampe (byte), +0x19/+0x2d/+0x41/+0x55 stimerne (sejre/nederlag/ubesejret/uden sejr i træk),
 *  +0x72/+0x73/+0x74/+0x75 (bytes) */
export interface CrowdRow { b4: number; c19: number; c2d: number; c41: number; c55: number; b72: number; b73: number; b74: number; b75: number }
/** fixture-posten (0x50 bytes) og turneringen */
export interface CrowdFixture {
  /** +0x14 turneringen: id, +0x69 omdømmet; tabelposten [0xadadfc][id] (+0x3c byte, +0x43 byte, +8 ≠ 0 = har rækker), 0x5c6710 og 0x7e6f20 */
  comp: { id: number; rep: number; table: { b3c: number; b43: number; rows: boolean } | null; bias5c: boolean; odd7e: boolean } | null;
  /** +0x18 stadionet */
  stadium: CrowdStadium | null;
  home: CrowdClub; away: CrowdClub;
  /** +0x30/+0x32 (word), +0x34 (byte: rundens nummer), +0x3a (kamptypen), +0x3b, +0x3c (byte) */
  w30: number; w32: number; b34: number; b3a: number; b3b: number; b3c: number;
}
export interface CrowdEnv {
  rand(n: number): number;
  /** [0xae2354] byerne (rand(antal) → [0xae23ac] + 56·indeks) */
  cities: number; cityAt(i: number): CrowdCity;
  /** 0x4a4850(turneringens tabel, klub) */
  row(club: CrowdClub): CrowdRow | null;
}
export interface CrowdResult { total: number; home: number; away: number }

const ftol = Math.trunc;

/** sub_85d8a0(fixture, stadionets by, holdets by, m) – afstandsleddet (andelen af holdets tilhængere, der rejser med) */
function travel(F: CrowdFixture, S: CrowdCity, T: CrowdCity, m: number): number {
  const n7e = F.away.nation7e;                                                      // altid udeholdets land (fixture+0x20 → +0x53 → +0x7e)
  const d2b = S.c2b - T.c2b, d23 = S.c23 - T.c23;
  let d = Math.sqrt(d23 * d23 + d2b * d2b);                                          // 0x85d8e3 fsqrt → [esp]
  if (F.w30 === 0xa0 && F.b3a === 5) d *= 0.5;                                       // 0x85d8af/0x85d8ef
  let t = 1 - d * 0.13333333333333333;                                               // 0x96afe0
  if (F.b3c === 0) t *= t;                                                           // 0x85d90d
  if (d > 0 && n7e > 0) t /= (n7e + 1) * (n7e + 1);                                  // 0x85d91e–0x85d950
  if (m > 14) { const mm = 1 - (20 - m) * 0.15; if (t < mm) return mm; }            // 0x85d952–0x85d991
  if (F.b3a === 10 && t < 0.2) return 0.2;                                           // 0x85d994
  if (t < 0.05 && F.home.nation === F.away.nation) return 0.05;                      // 0x85d9b5
  if (t < 0.03) return 0.03;                                                         // 0x85d9d8
  return t;
}

/** sub_85cba0 (ecx = [0xdd7ef4], fixture, ud[3]) – tilskuertallet. Ændrer stadionets kapacitet (< 1500 → omdømme/500 · 1000, mindst 1500)
 *  som originalen (fixture-stadionet: `F.stadium.cap`). */
export function crowd85cba0(F: CrowdFixture, env: CrowdEnv): CrowdResult {
  const H = F.home, A = F.away;
  let rh = Math.trunc(H.rep / 500), ra = Math.trunc(A.rep / 500);                    // 0x85cbc5–0x85cc14 (byte, mindst 1)
  rh = (rh << 24) >> 24; ra = (ra << 24) >> 24;
  if (rh < 1) rh = 1;
  if (ra < 1) ra = 1;
  const m: [number, number] = [0, 0];
  const comp = F.comp;
  for (let d = 0; d < 2; d++) {
    let v = comp ? comp.rep : 1;                                                     // 0x85cc28 fild comp+0x69 (< 1 → 1)
    if (v < 1) v = 1;
    if (F.b3a === 8 || F.b3a === 10 || F.b3a === 6) v += 2;                         // 0x85cc64
    let add = 0;
    if (comp && !comp.bias5c && comp.table && !comp.odd7e && comp.table.b43 !== 2) { // 0x85cc7d–0x85ccc8 ([0xb74434] ≠ 0 antaget)
      const x = (((F.b34 - comp.table.b3c) << 24) >> 24);                             // movsx (byte)(+0x34 − tabel+0x3c)
      add = x < -6 ? -6 : x > 5 ? 5 : x;
    }
    v += add;
    const vv = v;
    let own: number, opp: number, lg: CrowdClub['league'];
    if (d === 0) { own = rh; opp = ra; lg = H.league; } else { own = ra; opp = rh; lg = A.league; }
    let x = vv;
    if (own < 15 || own < opp) x = (opp / own) * vv;                                 // 0x85cdbb / 0x85cd36
    if (opp > 17) x *= 1.1;                                                          // 0x9689c0
    if (opp > 12 && own < 14) x *= 1.25;                                             // 0x968928
    if (lg && lg.rep !== 0) x = x / lg.rep;                                          // 0x85ce13 fdivr
    else x *= F.b3a === 10 ? 0.2 : 0.05;                                             // 0x85ce35
    // gulvene 0x85ce4e–0x85d1fb
    const rep = d === 0 ? H.rep : A.rep;
    const floor = (f: number) => { if (x < f) x = f; };
    if (F.b3a === 8) {
      if (F.w30 === 0x96) floor(rep >= 0x1676 ? 2.75 : 3.5);
      else if (F.w30 === 0x82 && x < 2.5) floor(rep >= 0x1676 ? 2.25 : 3.0);
      else floor(rep < 0x109a ? 1.75 : rep < 0x1676 ? 1.25 : 1.05);
      floor(0.1);
    } else if (F.b3a === 6) {
      if (F.w30 === 0x96) floor(rep < 0x109a ? 3.5 : 2.75);
      else if (F.w30 === 0x82) floor(2.5);
      else floor(1.25);
    } else if (F.w30 === 0x96 && F.b3a === 5) floor(rep < 0x109a ? 3.5 : 2.75);
    else if (F.w32 === 0xa0 && F.b3a === 5) floor(d === 0 && H.rep < 0x109a ? 3.25 : 2.5);
    else if (F.b3a === 10) { floor(1.25); floor(0.1); }
    else if (F.b3a === 9) floor(0.8);
    else floor(0.1);
    m[d] = x;
  }

  let hn: number, an: number;
  if (F.stadium && F.b3c === 0) {
    const randCity = () => env.cityAt(env.rand(env.cities));                        // 0x90cfc0(antal) → [0xae23ac] + 56·i
    const cS = F.stadium.city ?? randCity();                                         // 0x85d220
    const cH = H.stadium?.city ?? randCity();                                        // 0x85d24c
    const cA = A.stadium?.city ?? randCity();                                        // 0x85d285
    let r1 = travel(F, cS, cH, m[0]); if (r1 < 0.15) r1 = 0.15;
    hn = ftol(H.avg * m[0] * r1);                                                    // 0x85d2ef
    let r2 = travel(F, cS, cA, m[1]); if (r2 < 0.15) r2 = 0.15;
    an = ftol((A.min + A.avg) * m[1] * r2 * 0.5);                                    // 0x85d339–0x85d355
    // tabelrækken 0x85d35e–0x85d519 (ligakampe i hjemmeholdets egen liga)
    if (comp && H.league && H.league.id === comp.id && comp.table?.rows) {
      const row = env.row(H);
      if (row) {
        const r = comp.rep;
        if (row.c19 > 1) hn += row.c19 < 4 || r < 12 ? 50 * r : row.c19 < 7 ? 100 * r : 150 * r;
        else if (row.c41 > 2) hn += row.c41 >= 4 && r >= 12 ? 50 * r : 25 * r;
        else if (row.c2d > 2) hn -= 25 * r;
        else if (row.c55 > 3) hn -= 10 * r;
        if (row.b74 !== row.b75 && row.b4 > 4) {
          const bl = row.b72 & 0xff, cl = row.b73 & 0xff;
          let ax = (((bl - cl) << 16) >> 16);
          if (bl < 4 && ax <= 0) ax = cl === 1 ? 4 : cl < 4 ? 2 : ((ftol(ax * 0.25) << 16) >> 16);
          hn += (bl < 4 && row.b74 === 1 ? 25 : 15) * r * ax;
        }
      }
    }
    if (cS === cH) { if (hn > H.max) hn = H.max; else if (hn < H.min) hn = H.min; }   // 0x85d51d
    if (cS === cA) { if (an > A.max) an = A.max; else if (an < A.min) an = A.min; }   // 0x85d544
  } else {
    hn = ftol(H.avg * m[0]);                                                         // 0x85d567
    an = ftol(A.avg * m[1]);
  }
  // rivaler og byderby 0x85d58f–0x85d618
  if (H.rivals.includes(A.id)) hn = ftol(hn * 1.5);
  else if (H.stadium && A.stadium && H.stadium.city === A.stadium.city) hn = ftol(hn * 1.35);
  if (A.rivals.includes(H.id)) an = ftol(an * 1.35);
  if (F.b3c === 0 && F.b3b !== 0xff) { hn = ftol(hn * 1.05); an = ftol(an * 0.85); }   // 0x85d618
  // ligaens gulv 0x85d64c–0x85d72e (klubbens egen liga og +0x6d)
  if (comp && H.league && H.league.id === comp.id && H.b6d !== 0) {
    const r = H.league.rep;
    if (r > 12) { const l = (r - 9) * 2000; if (hn < l) hn = l; }
    else if (r > 8) { const l = (r - 4) * 750; if (hn < l) hn = l; }
    else if (r > 4) { const l = (r - 2) * 500; if (hn < l) hn = l; }
    else {
      const lo = r * 250;
      if (hn < lo) hn = lo;
      else { const hi = r * 1500; if (hn > hi) hn = hi - ftol((hn - hi) * -0.2); }
    }
  }
  // stadionets kapacitet 0x85d730 (skrives tilbage)
  if (F.stadium && F.stadium.cap < 1500) { F.stadium.cap = rh * 1000; if (F.stadium.cap < 1500) F.stadium.cap = 1500; }
  if (hn + an !== 0) {
    if (F.stadium) {
      const cap = F.stadium.cap;
      let aw: number;
      if (F.b3c === 0) {
        const a = cap - A.avg * m[0], b = cap * 0.15, c = cap * 0.05;               // 0x85d786–0x85d7c5 (sic: m[0])
        const x = a < b ? a : b;
        aw = c > x ? ftol(c) : ftol(x);
      } else aw = Math.trunc(cap / 2);
      const hc = cap - aw;
      if (hn > hc) hn = hc;
      if (an > aw) an = aw;
    } else { if (hn > 40000) hn = 40000; if (an > 25000) an = 25000; }
  } else { hn = env.rand(50) + 1; an = env.rand(15) + 1; }                          // 0x85d837
  let total = hn + an - env.rand(50);                                                // 0x85d850
  if (total < 0) total = env.rand(150) + 45;
  return { total, home: hn, away: an };
}
