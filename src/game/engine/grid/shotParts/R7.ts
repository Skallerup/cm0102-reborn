// sub_702050, afsnit R7: [0x708c1c, 0x70a5a8) – slutningen af holdhistorierne efter et mål (0x6d4b70), publikums tavshed
// (SILENT_*), og redningerne: pareret 0x708e84 (61 < ratio ≤ 71), tippet til hjørne 0x7092d0 (51 < ratio ≤ 61), grebet 0x7097a9
// (ratio ≤ 51) med historierne (0x717470), "under pres"-linjerne, GREAT_GOAL_DENIED, omsparkene (param 5/6) og hjørnet.
// Oversat instruktion for instruktion (se KONVENTIONER i ../takeShot.ts).
//
// ENV (ShotEnv-medlemmer, som afsnittet bruger ud over ev/ev1/evSide/rand/m):
//   takeShot(p, a1, a2, a3, a4, a5, a6): void      – rekursionen sub_702050 (0x7092be; 0x7097a4 → 0x704ae4)
//   looseBall(x, y, spread, lastTouch, keep, stir, player): void – sub_6cd770 (pass.ts looseBall – samme 7 argumenter)
//   place(p, x, y): void                           – sub_6f46b0 (spilleren sættes i feltet)
//   takeBall(p): void                              – sub_6f0630 (p får bolden)
//   kickoffAfterGoal(side): void                   – 0x708e39–0x708e73: +0x8eae = side, +0xf582 = 0, +0x8eb2 = 8, engine+0x1ca = 0
//                                                    (limen: kickoffPositions(side), som også nulstiller kickCommented)
//   clubKind8(side): boolean                       – fixture(+0x4792)+0x1c (side 0) / +0x20 (side 1) → klub +0x53 ≠ 0 og +0x77 == 8
//                                                    (klubtypen kendes ikke i porten → false, som 0x20f5-grenene i gridMatch.ts)
//   (importeret) storyApplies(E, q, id) – 0x717470; teamStoryApplies(E, side, id, out) – 0x6d4b70(side, id, &out) (ret 0xc)
// FRAME (læses; skrevet af andre afsnit, medmindre andet står):
//   s11 skudlinjens udfald (0x703a89) · s12/s13 egne/modstandernes mål efter målet (sub_6ce310's ud-bytes) · s15 "straffesparket reddet"
//   (sættes HER 0x708eec/0x709338/0x70982e) · s18 eng+0x4786 ≥ 1680 ved skuddets start (0x70217b) · s19/s1a god/flot redning (0x70243a/
//   0x70242d) · s1b yards (0x7021b1) · s1c ratio 100·S/(S+K) som float (0x706ce5; før byte = høj) · s20 keeperens tilstand (0x700420)
//   · s26 (byte, R5/R6) · s34 S ved indgangen (0x7020d4) · s3c holdhistoriens ud-dword (6d4b70, skrives HER) · s40 +0x29 før skuddet
//   (word, 0x703948) · s48 keeperen (0x702315) · s50/s54 skyttens x/y ved indgangen · s58 +0x39 ved indgangen (word) · s5c/s60
//   eng+0x4782/+0x4786 ved indgangen · s64 T (240/120 – 0x7020cc/0x7021cd) · a1..a6, a6pos · ebx (keeperen; 0x709c5a/0x70a0f7 sætter
//   den til den anden i a6) · push: argumenter, der står på stakken ved et hop ind (se LABELS IN).
// FIELDS (nye): GP.w39 (+0x39 word, skudkvaliteten fra 0x700bd0), GP.goals (+0xc byte, mål i kampen – 0x706efb tæller op),
//   GridMatchState.x4782 / x4786 (engine+0x4782 / +0x4786 dword: kampens "spænding"/publikumstællere; 0x7040a7 lægger skuddet til
//   +0x4786, 0x7022eb +0x113 til +0x4782). Eksisterende: GP.rating (+0x35), busy (+0x2b), side (+0x27), x/y; m.ballX/ballY (+0x8ea7/8),
//   poss (+0x8eae), carrier (+0xf582), state (+0x8eb2), b1cd (+0x1cd), clock (+0x8ed0).
// LABELS IN: 0x708c1c (fra 0x708c00), 0x708d0b (f.push = [id, side, extra] – 0x70a860-kaldet, som R6 har lagt på stakken),
//   0x708e39 (fra 0x7089cd), 0x708e84 (fra 0x706df7), 0x7092a5 (fra 0x704273; f.push = [a6, a5] – begge 0 dér), 0x709672
//   (fra 0x7041e3; f.push = [extra] = 0, +0x8eae/+0xf582/+0x8eb2 er allerede skrevet).
// LABELS OUT: 0x704a57 (omspark efter redning, R2), 0x704b02 (ret 0x18 – her blot return). 0x7097a4's hop til 0x704ae4 er skrevet
//   ud her (0x704ae4–0x704b0c er netop sub_702050(a1, s34, a3, 1, 0, 0) og ret), så de udestående push ikke krydser afsnittene.
import { go, label, type ShotEnv, type ShotFrame } from '../takeShot';
import type { GP } from '../gridMatch';
import { storyApplies, teamStoryApplies } from '../story';

const other = (s: number) => (s === 0 ? 1 : 0);                                   // test al, al / sete
const w16 = (x: number) => (x << 16) >> 16;
const b8 = (x: number) => (x << 24) >> 24;
const num = (v: unknown) => v as number;
/** word +0x8ed0 / 11 (imul 0x2e8ba2e9, sar 1) – kampminuttet */
const minute = (E: ShotEnv) => Math.trunc(E.m.clock / 11);
/** sub_6d4b70(side, id, &s3c) */
function teamStory(E: ShotEnv, f: ShotFrame, side: number, id: number): boolean {
  const out = { v: num(f.s3c ?? 0) };
  const r = teamStoryApplies(E, side, id, out);
  f.s3c = out.v;
  return r;
}
/** 68d1b0: listens næste (+0xa) og frem; tom → 0 */
function next(f: ShotFrame): GP | null {
  const q = f.a6[f.a6pos] ?? null;
  if (f.a6pos < f.a6.length) f.a6pos++;
  return q;
}
/** eng+0x4782 > 1680 (fild; fcomp 0x96d810; test ah, 0x41; je) */
const buzzHigh = (E: ShotEnv) => E.m.x4782 > 1680;

// ---------------------------------------------------------------- holdhistorierne (slutningen af kæden) og publikum efter målet
/** 0x708c1c: TEAM_LOSING_AGAIN / BREAK_BAD_RUN / UNBEATEN_RUN_UNDER_THREAT / SURELY_BROKEN – den første, der passer, går i køen */
export const L_708c1c = label(0x708c1c, (E, f) => {
  const s = f.p.side;
  if (teamStory(E, f, other(s), 0x21ac)) { E.evSide(0x21ac, other(s), num(f.s3c)); return L_708d16(E, f); }   // 0x708c35
  if (teamStory(E, f, s, 0x21ad)) { E.evSide(0x21ad, s, num(f.s3c)); return L_708d16(E, f); }                 // 0x708c71
  if (teamStory(E, f, other(s), 0x21ae)) { E.evSide(0x21ae, other(s), num(f.s3c)); return L_708d16(E, f); }   // 0x708caa
  if (teamStory(E, f, other(s), 0x21af)) { E.evSide(0x21af, other(s), num(f.s3c)); return L_708d16(E, f); }   // 0x708ce8
  return L_708d16(E, f);
});
/** 0x708d0b: kaldet 0x70a860 med argumenterne fra stakken (f.push = [id, side, extra]) */
export const L_708d0b = label(0x708d0b, (E, f) => {
  const [id, s, x] = f.push as number[]; f.push = undefined;
  E.evSide(id, s, x);
  return L_708d16(E, f);
});
/** 0x708d16: publikum – SILENT_OUTCLASSED ved stor føring, SILENT_YOUR_NOT_SINGING sent i en tæt kamp (kun klubtype 8) */
function L_708d16(E: ShotEnv, f: ShotFrame): void {
  const s = f.p.side;
  const r = E.rand(5) + 2;                                                         // 0x708d18
  const lead = b8(num(f.s12)) - b8(num(f.s13));
  if (lead > r) {                                                                  // 0x708d35
    if (E.rand(2) === 0 && E.clubKind8(s)) { E.evSide(0x2117, s, 0); return L_708e39(E, f); }   // 0x708d39–0x708e34
  }
  const a = b8(num(f.s12)), o = b8(num(f.s13));                                    // 0x708d9a
  if (!(a === o || a - 1 === o || b8(num(f.s26)) !== 0)) return L_708e39(E, f);
  const r1 = E.rand(minute(E));                                                    // 0x708dd3
  const r2 = E.rand(50);                                                           // 0x708ddc
  if (r1 > r2 && E.clubKind8(s)) E.evSide(0x2116, s, 0);                          // 0x708de4–0x708e34
  return L_708e39(E, f);
}
/** 0x708e39: afspark til modstanderne (+0x8eae, +0xf582 = 0, +0x8eb2 = 8, +0x1ca = 0), ret */
export const L_708e39 = label(0x708e39, (E, f) => { E.kickoffAfterGoal(other(f.p.side)); });

// ---------------------------------------------------------------- redningerne
/** fælles kæde: keeperens historier efter en flot redning (0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5) – den første, der passer */
function keeperStories(E: ShotEnv, k: GP): void {
  for (const id of [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5]) if (storyApplies(E, k, id)) { E.ev1(id, k, k.side, 0); return; }
}
/** skyttens historier efter en mislykket afslutning (0x219e, 0x21b1, 0x21b2, 0x21b7) – den første, der passer */
function shooterStories(E: ShotEnv, p: GP): void {
  for (const id of [0x219e, 0x21b1, 0x21b2, 0x21b7]) if (storyApplies(E, p, id)) { E.ev1(id, p, p.side, 0); return; }
}
/** GOOD_SERVICE_TO_PLAYER og POOR_SERVICE_TO_PLAYER (begge kan komme) – 0x70950f / 0x709afb */
function serviceStories(E: ShotEnv, p: GP): void {
  if (storyApplies(E, p, 0x21a1)) E.ev1(0x21a1, p, p.side, 0);
  if (storyApplies(E, p, 0x21a2)) E.ev1(0x21a2, p, p.side, 0);
}
/** straffesparkskonkurrencens/straffens indledning i alle tre redninger (0x708e99 / 0x7092e5 / 0x7097d6): true = keeperens
 *  SAVES_PENALTY er sendt (s15 = 1), false = videre til flot/god redning */
function penaltyLead(E: ShotEnv, f: ShotFrame): boolean {
  const p = f.p, k = f.ebx!, a4 = f.a4;
  const saves = () => { f.s15 = 1; E.ev1(0x2122, k, k.side, 0); return true; };       // SAVES_PENALTY
  if (a4 === 4 || a4 === 3) {
    E.ev1(0x2008, p, p.side, 0);                                                   // MISSED_IN_SHOOTOUT
    if (a4 === 3) return saves();
    E.ev1(0x2174, p, p.side, 0);                                                   // SILENT_MISSED_IN_35_YARD_SHOOTOUT
    return false;
  }
  if (f.a1 !== 0x33) return false;
  if (a4 === 1) E.ev1(0x1fce, p, p.side, 0);                                       // MISSED_PENALTY
  return saves();
}
/** omspark (param 5/6): spændingstællerne tilbage, MUST_RETAKE, skytten tilbage på pladsen med bolden og +0x39 – 0x70920f / 0x70970e */
function retakeReset(E: ShotEnv, f: ShotFrame): void {
  const p = f.p;
  E.m.x4786 = 0; E.m.x4782 = 0;
  E.m.x4786 += num(f.s60); E.m.x4782 += num(f.s5c);
  E.ev1(0x20f7, p, p.side, 0);                                                     // MUST_RETAKE
  p.w39 = w16(num(f.s58));
  E.place(p, num(f.s50), num(f.s54));                                              // sub_6f46b0
  E.takeBall(p);                                                                   // sub_6f0630
}

/** 0x708e84: 61 < ratio ≤ 71 → PARERET; ellers 0x7092d0 */
export const L_708e84 = label(0x708e84, (E, f) => {
  if (!(num(f.s1c) > 61)) return L_7092d0(E, f);                                   // 0x708e88 (0x96d7e8 = 61,0)
  const p = f.p, k = f.ebx!;
  if (!penaltyLead(E, f)) {
    if (f.s1a) { E.ev1(0x2111, k, k.side, 0); keeperStories(E, k); }               // 0x708f47 GREAT_SAVE_NOT_HELD
    else E.ev1(f.s19 ? 0x210f : 0x1fe6, k, k.side, 0);                             // 0x70906d GOOD_SAVE_NOT_HELD / GOALKEEPER_PARRY
  }
  // 0x70909d
  const a4 = f.a4;
  if (a4 === 5 || a4 === 6) return L_70920f(E, f);
  if (a4 !== 2) k.rating = w16(k.rating + (f.a1 === 0x33 ? 1000 : 140));         // 0x7090b8
  if (a4 !== 1 && a4 !== 2) return;                                                // 0x7090de → 0x704b02
  k.busy = b8(k.busy + E.rand(3) + 1);                                             // 0x7090ea
  E.looseBall(E.m.ballX, E.m.ballY, 0, other(p.side), false, f.a1 !== 0x33, null); // 0x70912e sub_6cd770(x, y, 0, side, 0, type ≠ 0x33, 0)
  E.m.b1cd = 1;                                                                    // 0x709139
  if (f.s15) return;                                                               // 0x709140
  if (E.m.state === 0) return;                                                     // 0x709152
  if ((a4 as number) === 4) return;                                                 // (død: a4 er 1/2 her)
  if (buzzHigh(E)) { E.ev1(0x2020, p, p.side, 0); return; }                        // 0x709170 → 0x7091e7 GREAT_GOAL_DENIED
  if (f.s18) { if (!f.s11) E.ev1(0x2020, p, p.side, 0); return; }                  // 0x709183
  if (f.s11) return;                                                               // 0x7091a0
  if (b8(num(f.s1b)) < 25) return;                                                 // 0x7091a8
  if (a4 !== 1) return;                                                            // 0x7091b3
  E.ev1(0x1f9e, p, p.side, num(f.s64));                                            // 0x7091d5 SHOT_DISTANCE_UNLUCKY (extra = [esp+0x64])
});
/** 0x70920f: omspark efter parering → sub_702050(a1, S ved indgangen, a3, 1, 0, 0) */
function L_70920f(E: ShotEnv, f: ShotFrame): void {
  retakeReset(E, f);
  f.push = [0, 0];                                                                 // 0x7092a1/0x7092a3: push 0, push 0
  return L_7092a5(E, f);
}
/** 0x7092a5 (også fra 0x704273 med to push på stakken: a6, a5) */
export const L_7092a5 = label(0x7092a5, (E, f) => {
  const [a6, a5] = (f.push as number[] | undefined) ?? [0, 0]; f.push = undefined;
  void a6;
  E.takeShot(f.p, f.a1, num(f.s34), f.a3, 1, a5, []);                              // 0x7092be (a6 = 0: ingen liste)
});

/** 0x7092d0: 51 < ratio ≤ 61 → TIPPET TIL HJØRNE; ellers 0x7097a9 (grebet) */
function L_7092d0(E: ShotEnv, f: ShotFrame): void {
  if (!(num(f.s1c) > 51)) return L_7097a9(E, f);                                   // 0x7092d4 (0x96d7e4 = 51,0)
  const p = f.p, k = f.ebx!;
  if (!penaltyLead(E, f)) {
    if (f.s1a) { E.ev1(0x2111, k, k.side, 0); keeperStories(E, k); }               // 0x709393 GREAT_SAVE_NOT_HELD
    else if (f.s19) E.ev1(0x210f, k, k.side, 0);                                   // 0x7094bc GOOD_SAVE_NOT_HELD
    else E.ev1(f.a1 === 0x1a ? 0x21d0 : 0x1fe4, k, k.side, 0);                     // 0x7094dc GOALIE_CHIP_SAVE / GOALKEEPER_TIPPED
  }
  serviceStories(E, p);                                                            // 0x70950f
  let a4 = f.a4;
  if (!f.s15) {                                                                    // 0x709571
    if (buzzHigh(E) || (f.s18 && !f.s11)) E.ev1(0x2020, p, p.side, 0);            // 0x709579–0x7095b8 GREAT_GOAL_DENIED
    a4 = f.a4;
    if (!(a4 === 5 || a4 === 6 || a4 === 2)) k.rating = w16(k.rating + (f.a1 === 0x33 ? 1000 : 120));   // 0x7095d0
  }
  // 0x7095f7
  if (a4 === 4 || a4 === 3) return;
  if (a4 === 5 || a4 === 6) return L_70970e(E, f);
  if (p.side === 1) E.m.ballY = -1;                                                // 0x70961e (byte 0xff)
  else if (p.side === 0) E.m.ballY = 12;                                           // 0x709631
  else throw new Error('take_shot: ugyldig side (0x709694, match_pl.cpp 0x3d45)');
  E.m.poss = p.side as 0 | 1;                                                      // 0x709649
  E.m.carrier = null;                                                              // 0x709655
  E.m.state = 3;                                                                   // 0x709665 hjørne
  f.push = [0];
  return L_709672(E, f);
}
/** 0x709672: RESTART_CORNER (0x70a860, side = skyttens, extra = det push'ede) og ret */
export const L_709672 = label(0x709672, (E, f) => {
  const [x] = (f.push as number[] | undefined) ?? [0]; f.push = undefined;
  E.evSide(0x1f75, f.p.side, x);
  E.corner(f.p.side);                                                              // limen: hjørnets statistik og lytteren (bolden klemmes ind på banen)
});
/** 0x70970e: omspark efter tippet bold → 0x704ae4 (sub_702050(a1, s34, a3, 1, 0, 0)) */
function L_70970e(E: ShotEnv, f: ShotFrame): void {
  retakeReset(E, f);
  E.takeShot(f.p, f.a1, num(f.s34), f.a3, 1, 0, []);                              // 0x7097a0–0x7097a4 → 0x704ae4–0x704afd
}

/** 0x7097a9: ratio ≤ 51 → GREBET */
function L_7097a9(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, k = f.ebx!;
  k.busy = b8(k.busy + E.rand(3));                                                 // 0x7097ab
  k.rating = w16(k.rating + (f.a1 === 0x33 ? 1300 : 200));                         // 0x7097bb
  let shooter = false;                                                             // vejen via 0x709a47 (skyttens historier)
  if (!penaltyLead(E, f)) {
    if (f.s1a) { E.ev1(0x2112, k, k.side, 0); keeperStories(E, k); }               // 0x709890 GREAT_SAVE_HELD
    else if (f.s19) E.ev1(f.a1 === 0x1a && !f.s20 ? 0x21d0 : 0x2110, k, k.side, 0); // 0x7099c3 GOALIE_CHIP_SAVE / GOOD_SAVE_HELD
    else { E.ev1(f.a1 === 0x1a && !f.s20 ? 0x21d0 : 0x1fe5, k, k.side, 0); shooter = true; }  // 0x709a0d GOALKEEPER_HELD
  }
  if (shooter) shooterStories(E, p);                                               // 0x709a52
  serviceStories(E, p);                                                            // 0x709afb
  if (f.s15) return L_70a566(E, f);                                                // 0x709b5d
  if (buzzHigh(E) || (f.s18 && !f.s11)) { E.ev1(0x2020, p, p.side, 0); return L_70a566(E, f); }   // 0x709b69 → 0x70a54b
  // 0x709b9a: +0x39 > 300 (+400 flot, +200 god) eller "gjorde det sikkert" → MISSED_EASY_CHANCE_CLOSE
  const lim = (f.s1a ? 0x190 : 0) + (f.s19 ? 0xc8 : 0) + 0x12c;
  if (w16(p.w39) > lim || f.a1 === 0x3a) {
    E.ev1(0x1fdd, p, p.side, p.goals & 0xff);                                      // 0x70a042 (extra = +0xc)
    if (w16(num(f.s40)) >= -135) return L_70a566(E, f);                            // 0x70a061
    if (f.a1 === 0x3a) return L_70a566(E, f);                                      // 0x70a06e
    pressure(E, f);                                                                // 0x70a07c
    return L_70a566(E, f);
  }
  if (w16(num(f.s40)) >= -135) return L_70a566(E, f);                              // 0x709bd6 (0xff79)
  pressure(E, f);                                                                  // 0x709be3
  return L_70a566(E, f);
}
/** 0x709be3 / 0x70a07c (to ens kopier): "lukket ned" – rand(a5² + 3) = 0 → intet; a5 = 1: UNDER_PRESSURE_FROM_ONE_PLAYER (skytten, den
 *  første i a6) og hans historier; a5 = 2: rand(2) = 0 → UNDER_PRESSURE, ellers FROM_TWO_PLAYERS og de to's historier; ellers UNDER_PRESSURE */
function pressure(E: ShotEnv, f: ShotFrame): void {
  const p = f.p, a5 = b8(f.a5), o = other(p.side);
  if (E.rand(a5 * a5 + 3) === 0) return;                                           // 0x709bf4 / 0x70a08d
  const ids = [0x219f, 0x21a0, 0x21b0, 0x21b3, 0x21b4, 0x21b5];
  const stories = (q: GP) => { for (const id of ids) if (storyApplies(E, q, id)) { E.ev1(id, q, o, 0); return true; } return false; };
  if (a5 === 1) {                                                                  // 0x709ef1 / 0x70a3d1
    f.a6pos = 0;
    const first = next(f)!;
    E.ev(0x2154, p, p.side, first, o, 0);                                          // SHOOTING_PLAYER_WAS_UNDER_PRESSURE_FROM_ONE_PLAYER
    stories(first);                                                                // …0x70a518 (0x21b5)
    return;
  }
  if (a5 === 2 && E.rand(2) !== 0) {                                               // 0x709c2f / 0x70a0c8
    f.a6pos = 0;
    const first = next(f)!, second = next(f)!;
    f.ebx = second;                                                                // 0x709c5a / 0x70a0f7: ebx = den anden
    E.ev(0x2155, first, o, second, o, 0);                                          // …FROM_TWO_PLAYERS
    if (!stories(first)) stories(second);
    return;
  }
  E.ev1(0x2132, p, p.side, 0);                                                     // 0x709c0e / 0x70a0a7 / 0x70a3b0 SHOOTING_PLAYER_WAS_UNDER_PRESSURE
}
/** 0x70a566: omspark (param 5/6) → 0x704a57; ellers tager keeperen ([esp+0x48]) bolden (sub_6f0630) og ret */
function L_70a566(E: ShotEnv, f: ShotFrame): void {
  if (f.a4 === 5 || f.a4 === 6) return go(E, f, 0x704a57);
  E.takeBall(f.s48 as GP);                                                         // 0x70a581
}
