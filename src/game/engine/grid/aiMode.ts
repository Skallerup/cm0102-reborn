// Computerens kamptilstand pr. hold – sub_6df460 (cm0102.exe 3.9.68), afkodet fra den registerniveau-oversatte C
// (~/cm0102-engine/.bosman-repo/build/recomp/gen/fn_039.c) med hver original instruktion som kommentar.
// Noten: ~/cm0102-engine/notes/6df460-ai-mode.md. Rene funktioner – ingen import af gridMatch.ts/adapter.ts.
//
// Kaldes (thiscall, this = holdstrukturen engine+0x9032+side·0xd0) fra sub_6c54a0 ved hver dødbold (state ≠ 0, ikke straffe)
// og to gange før kampen (0x6dd7c8, 0x6e0262 – med engine+0x8ea5 = 0). Returnerer tilstanden 1..5 (engine+0x1ab+side) og
// skriver r (float32 engine+0x476a+4·side). Ingen tilfældige tal.
//
// Konstanterne er læst i exe'en (VA − 0x400000) og står ved deres adresser.

export type Side = 0 | 1;

/** En række i ligatabellen (0x4a4850 = bsearch i comp+8 med post 0x76 bytes, nøgle = klubben). Felterne er rå: +0x72 placering
 *  (byte, 1 = øverst ?) og fire tællere +0x19/+0x2d/+0x41/+0x55 (dword; ? stimer – +0x41 bruges som "sejre i træk", +0x55 som
 *  "nederlag i træk", +0x19/+0x2d som deres to-gange-vægtede modparter). `days41`/`days55` = dage siden datoen ved +0x4d/+0x61
 *  (0x54cdb0 på spildatoen 0xae2c90); kun læst, når tælleren > 1. */
export interface TableRow { pos: number; c19: number; c2d: number; c41: number; c55: number; days41: number; days55: number }

export interface AiModeInput {
  side: Side;
  /** engine+0x8ea5: 0 under init_match (før kampen), 1 under kampen (sat til sidst i init_match 0x6b8bda). */
  inMatch: boolean;
  /** Styrken pr. side. Under kampen: trunc(50·Σ v / 11) over sidens 20 kampspillere med plads ≥ 0 (+0x19), v = 0x6e86d0(dommer =
   *  hold+0x1b, spiller, egen klub, 2, −1) = den egne managers opfattede evne (0..200; = spillerens CA, når hans Judging Player
   *  Ability rammer – se perceivedAbility). Før kampen bruges klubbernes omdømme (club+0x80) i stedet – sæt strength = rep. */
  strength: [number, number];
  /** club+0x80 (word, 0..10000 – klubbens omdømme) for side 0 og 1. Bruges også under kampen (sammenligningerne 7500/8000/8500). */
  rep: [number, number];
  /** engine+0x1fc/+0x206/+0x210: tik med bolden i række ≤ 3 / 4..7 / ≥ 8 (0x6cf750, kaldt i hvert tik ved 0x6b9fd3; side 0's mål ved
   *  række 0). Kun antal i alt (ikke de 5-minutters ringbuffere +0x1fe/+0x208/+0x212). */
  territory: [number, number, number];
  clock: number;            // engine+0x8ed0 (11 tik pr. minut)
  /** engine+0x8ed4: periodens sluttik – 495 i 1. halvleg, 990 i 2., 1155/1320 i forlænget spilletid. */
  periodEnd: number;
  /** engine+0x1ad/+0x1ae (publikums-bytene, 0 = hjemmeholdet). */
  crowd: [number, number];
  /** kampens mål (engine+0xf5bd/+0xf5f3) for side 0 og 1. */
  goals: [number, number];
  /** fixture(+0x4792)+0x4b/+0x4c: første kamps mål regnet for side 0 / side 1 (byte; null når +0x4b = 0xff, dvs. ingen dobbeltkamp). */
  firstLeg: [number, number] | null;
  /** fixture+0x38 (word): bit 4 = ingen udebanemålsregel ?, bit 0x4000 = udebanemål først efter forlænget spilletid ?. */
  fixtureFlags: number;
  /** fixture+0x30 (word): 0x4b0850 → (v < 1000 ? v % 10 : 0) == 3 tænder b14 (? kamptypen – fx venskabskamp/finale). */
  fixtureKind: number;
  /** kampspillere med plads ≥ 0 (0x6cbbb0) for side 0 og 1 – kun læst under kampen. */
  onPitch: [number, number];
  /** own club +0x53 == opp club +0x53 (? samme division/liga). */
  sameDivision: boolean;
  /** hold+0x37 → +0x14 ≠ 0 (kampens turneringsrække findes) – fordobler r ved sameDivision. */
  compLink: boolean;
  /** Ligadelen (kun når sameDivision og compLink og +0x14 == own club +0x57 og turneringen har en tabel): ellers null. */
  league: null | {
    teams: number;        // comp+0x3e (word; ? antal hold/kampe), comp = [0xadadfc][hold+0x37 → +0]
    compRep: number;      // (hold+0x37 → +0x14)+0x69 (word; turneringens omdømme, som passOptions' competitionReputation)
    own: TableRow | null;
    opp: TableRow | null;
  };
  /** managerens Attacking (ikke-spillerposten +0xe via hold+0x1f), null uden manager. */
  mgrAttacking: number | null;
  /** egen klub står i modstanderens rivalliste (opp club +0xb3/+0xb7/+0xbb) – så slapper man aldrig af (tilstand 5) via 10/r-reglen. */
  rivals: boolean;
  /** engine+0x1ab+side og float32 engine+0x476a+4·side før kaldet. */
  prevMode: number;
  prevR: number;
}

export interface AiModeResult {
  mode: 1 | 2 | 3 | 4 | 5;
  /** den nye float32 i engine+0x476a+4·side (uændret, når den gamle tilstand beholdes). */
  r: number;
  /** til fejlsøgning: værdien før tærsklerne (NaN ved de faste udfald 1/5). */
  raw: number;
}

const f32 = Math.fround;
const sb = (v: number) => ((v << 24) >> 24);          // signed byte (holdene regner målene i bytes)

/** 0x6ce310(side, …, flag = 0): egne/modstanderens mål (med første kamp lagt til), b17 = dobbeltkamp, b16 = samlet lige, men egen side
 *  foran på udebanemål, b14 = kamptypen (fixture+0x30 % 10 == 3). */
export function scoreState(i: Pick<AiModeInput, 'side' | 'goals' | 'firstLeg' | 'fixtureFlags' | 'fixtureKind' | 'periodEnd'>) {
  const g: [number, number] = [i.goals[0], i.goals[1]];
  let b16 = false, b17 = false;
  const kind = i.fixtureKind < 1000 ? sb(i.fixtureKind % 10) : 0;   // 0x4b0850 (idiv: rest med fortegn)
  const b14 = kind === 3;
  if (i.firstLeg) {                                                  // 0x6ce39c: +0x4b ≠ 0xff
    g[0] = sb(g[0] + i.firstLeg[0]); g[1] = sb(g[1] + i.firstLeg[1]);
    b17 = true;
    if (g[0] === g[1] && !(i.fixtureFlags & 4) && !((i.fixtureFlags & 0x4000) && i.periodEnd <= 990)) {
      if (i.side === 0) b16 = i.goals[1] < i.firstLeg[0];            // 0x6ce406: side 1's mål i denne kamp mod +0x4b
      else b16 = i.goals[1] > i.firstLeg[0];                         // 0x6ce421
    }
  }
  return { own: g[i.side], opp: g[i.side ? 0 : 1], b14, b16, b17 };
}

/** sub_6df460. */
export function aiMode(i: AiModeInput): AiModeResult {
  const s = i.side, o: Side = s ? 0 : 1;
  const S = scoreState(i);
  let E11 = S.own, E12 = S.opp, E13 = 0;
  const { b14, b16, b17 } = S;
  const own = i.strength[s], opp = i.strength[o];
  // 0x6df5c4: styrkeforholdet A
  const A = (own - opp) / ((1.5 - own * 0.0001) * 6000) + 1;
  // 0x6df5df: bolden i egen/modstanderens tredjedel (procent i bytes)
  const [w0, w1, w2] = i.territory;
  const tot = w0 + w1 + w2;
  const p0 = tot ? sb(Math.trunc(100 * w0 / tot)) : 0, p2 = tot ? sb(Math.trunc(100 * w2 / tot)) : 0;
  let Q: number;
  const ownP = s === 0 ? p0 : p2, oppP = s === 0 ? p2 : p0;          // side 0 forsvarer række 0..3
  if (ownP !== 0) {
    const q = oppP / ownP;                                            // modstanderens tredjedel / egen tredjedel
    Q = q > 1 ? q + q - 1 : q * 1.29 - 0.29;                          // 0x96d548 / 0x96d540
  } else Q = A;                                                       // 0x6df6b5 fld st(0)
  if (Q < 0.05) Q = 0.05; else if (Q > 6) Q = 6;                      // 0x967888 / 0x969000
  // 0x6df6e7: t = min(20, trunc(4·ur/99)) – fra A ved kampstart mod Q ved pausen
  let t = Math.trunc(4 * i.clock / 99); if (sb(t) > 20) t = 20;
  let R = ((25 - t) * A + t * Q) * 0.04 * (1 - i.crowd[s] * 0.07);    // 0x968890 25, 0x968a90, 0x968f68
  if (!(R > 0)) R = 0.01;                                             // 0x9689a0 / 0x967898
  // 0x6df76e: b14
  if (b14) {
    if (s === 1) { if (E11 !== 0) E11 = sb(E11 + 2); }
    else if (E12 !== 0) E12 = sb(E12 + 2); else E11 = sb(E11 + 1);
  }
  // 0x6df7a5: under kampen tæller manglende mand som to mål foran
  if (i.inMatch) {
    E13 = sb(i.onPitch[s] - i.onPitch[o]);
    if (E13 !== 0) E11 = sb(E11 + sb(-2 * E13));
  }
  const minute = Math.trunc(i.clock / 11);                            // [esp+0x38]
  if (!b14 && !b17 && E11 + E12 === 0) {                              // 0x6df812: målløst
    if (i.crowd[o] > i.crowd[s]) R *= minute * 0.014925373134328358 + 1.25;   // 0x96d538 (1/67), 0x968928
    else if (i.crowd[o] < i.crowd[s]) R *= 0.75;                               // 0x969040
  }
  R *= 1 - (E11 - E12) * 0.1;                                         // 0x6df863
  if (!i.sameDivision) R *= 0.9;                                      // 0x9689d8
  else if (i.compLink) {
    R += R;                                                           // 0x6df8b1 fadd st0, st0
    const L = i.league;
    if (L) {
      const R40 = R;
      let v = 0;
      const row = L.own;
      if (row) {
        if (row.c55 > 1 && row.days55 < 30) v = Math.min(-row.c55, -2 * row.c2d);          // 0x6df903
        else if (row.c41 > 1 && row.days41 < 10) v = Math.max(row.c41, 2 * row.c19);       // 0x6df93d
        v = f32(Math.abs(v) * v);                                     // fstp dword
        if (i.crowd[s] === 0 && v < 0) v = 0;                         // 0x6df990: hjemmeholdet ser bort fra dårlige stimer
        let m = R40;
        if (row.pos < 5 && E11 - 3 < E12 && L.opp && (L.opp.pos & 0xff) > (row.pos & 0xff)) {   // 0x6df9a9..0x6df9f6
          let k = L.teams > 0 ? 22 / L.teams : 1;                     // 0x96af40
          const r80 = i.rep[s];
          if (L.compRep >= 10 && r80 > L.compRep * 500)
            k *= ((r80 - L.compRep * 500) + (r80 - 5000)) * 0.0002 + 1;                     // 0x96a600
          const X = ((L.opp.pos & 0xff) - (row.pos & 0xff)) * Math.pow(k, 1.5);           // 0x945ff0 = pow
          let f = X * X * X / (i.crowd[s] * i.crowd[s] * 50 + 250) + 1;                    // 0x968ff8, 0x968898
          if (f < 1) f = 1; else if (f > 10) f = 10;                                       // 0x9688b0
          m = f * R40;
        }
        let g = v * 0.013333333333333334 + 1;                         // 0x968ef8 (1/75)
        if (g < 0.25) g = 0.25; else if (g > 5) g = 5;                // 0x9689e0 / 0x9688a0
        R = m * g;
      }
      // uden egen række: R40 · 1 (v = 0)
      else R = R40;
    }
  }
  const total = E11 + E12;                                            // [esp+0x18]
  if (total > 6) R *= 0.825; else if (total > 4) R *= 0.875;          // 0x96afb8 / 0x96a678
  const crowdOwn = i.crowd[s];                                        // [esp+0x15]
  const oppRep = i.rep[o], ownRep = i.rep[s];
  if (crowdOwn !== 0 || E13 < 0) {                                    // 0x6dfbc5: stærk modstander ude
    const strong = (oppRep > 7500 && oppRep - ownRep > 2000) || (oppRep > 8500 && oppRep - ownRep > 750) || (oppRep > 8000 && E11 - 1 > E12);
    if (strong && E12 - E11 < 2 && (i.periodEnd === 495 || !(E12 > E11))) R *= 0.3;   // 0x968e80
  }
  const diff = E11 - E12;                                             // [esp+0x20]
  R *= crowdOwn === 0 ? 1 - diff * 0.1 : 0.967 - (crowdOwn + 2 * diff) * 0.067;      // 0x96d528 / 0x96d530
  // 0x6dfc7b: tiden – foran (eller lige og side 1 / foran på udebanemål) dæmpes, bagud (eller lige hjemme, side 0) skrues op
  if (E11 > E12 || (E11 === E12 && (b16 || s === 1))) {
    const mm = 1 > minute ? 1 : minute;
    R *= 30 / mm < 1 ? 30 / mm : 1;                                   // 0x968dd8
  } else if (E11 < E12 || crowdOwn === 0) {
    const f = minute * 0.03333333333333333;                           // 0x969020
    R *= f < 1 ? 1 : f;
  }
  if (E12 - E11 > 2 && E12 - E11 < 6) R *= 1.01 - (E12 - E11) * 0.2;  // 0x96afa8, 0x968918
  if ((total < 5 && E13 > -1 && E11 === E12 && !b14 && ownRep > oppRep) || E13 > 0) { if (!(R > 1)) R = 1; }
  if (total < 4 && E13 > -1 && E11 - 2 >= E12 && ownRep > oppRep) { if (!(R > 1.15)) R = 1.15; }   // 0x968980
  // 0x6dfe06: managerens Attacking
  if (i.mgrAttacking !== null && E13 > -1) {
    const a = i.mgrAttacking;
    let X = ((a - 10) * 0.06666666666666667 + 1) * R;                 // 0x96d438 (1/15)
    const a2 = Math.pow(a, 2);                                        // 0x945ff0 med 2,0 (0x968950)
    if (X < a2 * 0.005) X = a2 * 0.0025 + X * 0.5;                    // 0x968ef0 / 0x969028 / 0x968968
    R = X < R - 1 ? R - 1 : X;
  }
  // 0x6dfea4: ude mod en stor klub (eller en mand i undertal) i en tæt kamp: loft 0,2 + minut/35
  if ((oppRep > 7500 || E13 < 0) && crowdOwn !== 0 && Math.abs(diff) < 2) {
    if (!(E11 < E12 && minute >= 75 && total <= 3)) {
      const cap = minute * 0.02857142857142857 + 0.2;                 // 0x96d518, 0x968918
      if (!(R < cap)) R = cap;
    }
  }
  // 0x6dff0e: dobbeltkamp hjemme, lige eller bagud med ét: gulv min(minut, 45)/35 + 0,2
  if (b17 && !b14 && !b16 && (E11 === E12 || E11 + 1 === E12) && crowdOwn === 0) {
    const cap = (minute < 45 ? minute : 45) * 0.02857142857142857 + 0.2;   // 0x968d68
    if (!(R > cap)) R = cap;
  }
  // 0x6dffa8: målrig kamp (begge 2+) – et mål hurtigere end hvert 18. minut → ×0,3
  if (E12 > 1 && E11 > 1) {
    if (!b14 && b17) { if ((minute + 90) / total < 18) R *= 0.3; }    // 0x96d2b0, 0x969550
    else if (minute / total < 18) R *= 0.3;
  }
  // 0x6dfffc: 2. halvleg, minut > 85 − 10r: bagud med ét (eller lige i en dobbeltkamp) → jag (tilstand 1, r = 10)
  if (minute > 85 - R * 10 && i.periodEnd === 990) {                  // 0x96d510
    if (E11 + 1 === E12 || (b17 && !b14 && !b16 && E11 === E12)) return { mode: 1, r: 10, raw: NaN };
  }
  // 0x6e0071: lige, minut > 82 − 10r, 2. halvleg, under 5 mål: r > 1 eller allerede jagende → jag
  if (total < 5 && minute > 82 - R * 10 && i.periodEnd === 990 && E11 === E12 && !b16) {   // 0x96d508
    if (R > 1 || i.prevMode === 1) return { mode: 1, r: 10, raw: NaN };
  }
  if (R < 1.4 && crowdOwn !== 0 && diff > 1) R = 0.2;                 // 0x968dc0
  // 0x6e0118: slap af (tilstand 5, r = −1)
  if (diff > 3 && R > 1) return { mode: 5, r: -1, raw: NaN };
  if (minute > 30 && E11 >= E12 && 10 / R < (diff + 1) * (diff + 1) && !i.rivals) return { mode: 5, r: -1, raw: NaN };
  // 0x6e019d: under kampen beholdes tilstanden, når r flytter sig under 0,5
  if (i.inMatch && Math.abs(R - i.prevR) < 0.5) return { mode: i.prevMode as AiModeResult['mode'], r: i.prevR, raw: R };
  const r = f32(R);
  if (R <= 0.3) return { mode: 4, r, raw: R };                        // 0x968e80
  if (R < 0.7) return { mode: 3, r, raw: R };                         // 0x968e40
  return { mode: R > 1.5 ? 1 : 2, r, raw: R };                        // 0x968940
}

/** 0x6e86d0(dommer, spiller, klub, 2, −1) – den opfattede evne, som styrken under kampen bygger på (alt i heltal, intet rand):
 *  seed = spillerens staff-id + [0xdd7120] (+ dommerens staff-id, når der er en dommer); est = trunc(rep/50), rep = 0x5407e0 (spillerens
 *  omdømme set fra dommeren: samme klub/samme liga → +0xb, samme nation → +9, ellers +0xd eller gennemsnit – vælges af kalderen);
 *  j = dommerens viste Judging Player Ability (0x544410 på ikke-spillerpost +0x17, 1..20), null uden dommer.
 *  Rammer dommeren (est > 50 og est + 10·(j − 10) > seed % 200), er svaret spillerens CA. Ellers en blanding af CA med støj og est. */
export function perceivedAbility(p: { seed: number; ca: number; rep: number; jpa: number | null }): number {
  const est = Math.trunc(p.rep / 50);
  const seed = p.seed | 0;
  const mod = (a: number, b: number) => a % b;                        // idiv: rest med fortegn
  if (p.jpa !== null && est > 50 && est + 10 * (p.jpa - 10) > mod(seed, 200)) return p.ca;   // 0x6e8784
  const q = f32(mod(seed, 101) * 0.01);                               // 0x967898, fstp dword
  let bl = 1;
  if (p.jpa !== null) {
    const v = mod(seed, 10) === 0 ? q * 20 : p.jpa * q;              // 0x96afb0 (float 20): hver tiende spiller ses "tilfældigt"
    bl = Math.trunc(v + 0.5); if (bl > 20) bl = 20;                   // 0x945640 = ftol
  }
  const si = mod(seed, 2 * (21 - bl)) + bl - 21;
  const w = Math.trunc(bl / 2) + 10;
  return Math.trunc(((p.ca + si) * w + (20 - w) * est) / 20);
}

/** 0x6df4ae–0x6df59b: styrken under kampen = trunc(50 · Σ v / 11) over sidens kampspillere med plads ≥ 0 (også færre end 11),
 *  v = perceivedAbility set med det kaldende holds dommer (begge sider vurderes af samme dommer). */
export function teamStrength(values: number[]): number {
  return Math.trunc(50 * values.reduce((a, b) => a + b, 0) / 11);
}

/** 0x5407e0(spiller, dommer, 0) via 0x5408c0 – hvilket omdømme dommeren ser (spillerdata +9 hjemme, +0xb nuværende, +0xd verden):
 *  'club' = samme klub eller klubberne i samme division (+0x53) → +0xb; 'nation' = samme nation (eller 0x53d980 = 0) → +9;
 *  'region' (0x53d980 på dommerklubbens division = 0, eller hjemme + klubomdømme ≥ 14000) → trunc(+0xd/2) + trunc(+9/2);
 *  ellers (og uden dommer) → +0xd. ? 0x53d980's kendskabsregel er ikke afkodet. */
export function repSeen(kind: 'club' | 'nation' | 'region' | 'world', rep: { home: number; current: number; world: number }): number {
  if (kind === 'club') return rep.current;
  if (kind === 'nation') return rep.home;
  if (kind === 'region') return Math.trunc(rep.world / 2) + Math.trunc(rep.home / 2);
  return rep.world;
}
