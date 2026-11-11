// sub_702050 MATCH_PLAYER::take_shot – oversat instruktion for instruktion fra cm0102.exe 3.9.68 (2026-11-11).
// Skuddet efter skudtypen (sub_700bd0 i shot.ts): den forkerte fod, keeperværdien, udfordringen før skuddet og forseelserne, skudtypens
// kommentar, offside på en anden angriber, skudlinjen (blokeringen), resultatkoden, karaktererne, afbrænderne med historierne (0x717470),
// målene og redningerne. Limen (gridMatch.ts) giver ShotEnv: kampens tilstand og de funktioner, skuddet kalder.
//
// KONVENTIONER (følges i hele filen):
// • Rammen `f` (ShotFrame) holder sub_702050's lokale variable, navngivet efter deres plads i forhold til esp lige efter prologen
//   (sub esp, 0x684 + push ebx/ebp/esi/edi): `f.s10` = [esp+0x10] i en instruktion uden udestående push. Står der push'ede argumenter på
//   stakken (fx før et kald), er offsettet i instruktionen 4·n for stort – det rettes, så navnet altid er prologens. Argumenterne:
//   a1 type [esp+0x698], a2 S [esp+0x69c], a3 begivenheden [esp+0x6a0], a4 param [esp+0x6a4], a5 [esp+0x6a8] (antal i a6), a6 [esp+0x6ac]
//   (sub_6bcbd0's liste over de to, der presser skytten mest – sub_7109f0 [esp+0x78]; 68d1b0 = næste i listen).
// • Registre, der bærer værdier på tværs af etiketter, ligger i rammen som f.ebx/f.ebp/f.edi (ebx = keeperen fra 0x702311, esi = skytten p).
// • Hver etiket, der hoppes til fra et andet afsnit, er en funktion `L_<adresse>(E, f)`; et hop dertil er `return go(E, f, 0x……)`.
//   `ret 0x18` = return. Inden for et afsnit skrives koden struktureret, men i originalens rækkefølge.
// • De tilfældige tal (sub_90cfc0) trækkes med E.rand i nøjagtig originalens rækkefølge og kun på de samme veje; rand(0) trækker intet.
// • Byte-/word-aritmetik: brug (x << 24) >> 24 og (x << 16) >> 16, hvor originalen regner i byte/word og det kan løbe over.
// • Hver gren har sin adresse i en kommentar; ukendte data (mediehistorikken m.m.) er beskrevet præcist, hvor de udledes af vores tilstand.
import type { GP, GridMatchState, Rand, Side } from './gridMatch';
import type { StoryEnv } from './story';
import * as L from './loop';

export interface ShotEnv {
  m: GridMatchState;
  gp: GP[];
  rand: Rand;
  /** sub_6d6f70 add_event(id, p1, s1, p2, s2, extra) – p1/p2 som spillere (limen slår +0x2e op) */
  ev(id: number, p1: GP | null, s1: number, p2: GP | null, s2: number, extra: number): void;
  /** 0x7002f0: add_event(id, p, s, −1, −1, extra) */
  ev1(id: number, p: GP | null, s: number, extra: number): void;
  /** 0x70a860: add_event(id, −1, s, −1, −1, extra) */
  evSide(id: number, s: number, extra: number): void;
  /** add_event trin 4: flaget eng[4·(1000·side + id) − 0x7ae2] (sat, når begivenheden er kommet i køen for siden) */
  evFlag(side: number, id: number): boolean;
  /** engine+0x8ebb ≠ 0: kampen vises på skærmen (den kamp, mennesket ser) */
  watched: boolean;
  /** engine+1: turneringstypen (fixture+0x37 → +0x3a) */
  compType: number;
  /** fixture+0x38 (via engine+0x4792): bit 0x80 golden goal, 4/0x4000 (sub_6ce310) */
  fixtureFlags38: number;
  /** kampens rammer (fixture = engine+0x4792): første kamps mål (+0x4b/+0x4c; null = ingen første kamp), word +0x38 (flags = flags38), word +0x30
   *  (kind = code30) og historiernes opslag (story.ts StoryEnv) */
  fixture: StoryEnv['fixture'] & { flags: number; kind: number };
  /** story.ts (sub_717470/sub_6d4b70) */
  setEvFlag(side: number, id: number): void;
  isDatabasePlayer(q: GP): boolean;
  daysAtClub(q: GP): number;
  hasResponseTwo(q: GP): boolean;
  // ---- prologen (afsnit 1)
  /** sub_6d59b0(p): antal modstandere på banen, hvis mandsopdækning (sub_7160f0) er p */
  markedBy(p: GP): number;
  /** engine+0x8d4e/+0x8d4c: skuddets side og minut (0x70213d/0x70215b) */
  setShotMark(side: Side, minute: number): void;
  /** sub_713e90 uden rand: {p, foot} (shot.ts footCheck) – vinklen mod (4, målrækken) minus +0x19a */
  footCheck(p: GP, type: number, D: number): { p: number; foot: number };
  /** sub_6ce110(side): sidens keeper (null uden) */
  keeper(side: Side): GP | null;
  /** høj-flaget 0x70238e (tabel 0x70a5a8; trækker rand) */
  highFlag(type: number): boolean;
  /** sub_700420: keeperværdien (shot.ts keeperValue) */
  keeperValue(k: GP | null, p: GP, type: number): { K: number; state: number; fumble: boolean };
  /** sub_6c87e0(p, side, action, …, flag9) – challenge.ts getOppositionChallenge */
  challenge(p: GP, side: Side, action: number, flag9: number): ShotChallenge;
  /** sub_6cfe10(A, codeA, B, codeB, offBall): knock-tjekket */
  knockCheck(A: GP, codeA: number, B: GP | null, codeB: number, offBall: boolean): void;
  /** sub_6cfc60 = judge_tackle */
  judge(d: GP, p: GP, type: number, action: number): { ret: number; kind: number; severity: number; hurt: boolean };
  /** sub_6f5b20: (x, y) i sidens eget felt */
  inBox(side: number, x: number, y: number): boolean;
  /** sub_6cb650: hård udfordring */
  isHard(type: number): boolean;
  /** rand med fortegn (sub_90cfc0 for n < 0) */
  randS(n: number): number;
  /** 0x7026c2–0x702f1a: forseelsen i skuddet (gridMatch foul(…, 'shot')) */
  foulShot(d: GP, p: GP, j: { ret: number; kind: number; severity: number; hurt: boolean }, c: ShotChallenge, f: ShotFrame): void;
  /** sub_6bb9a0: læg den ventende hændelse */
  queueIncident(type: number, d: GP, p: GP | null, res: number, x: number, y: number, jC: number, jB: number): void;
  /** 0x702675: udfordrerens handling, +4 og karakter */
  tried(d: GP, c: ShotChallenge): void;
  /** 0x702f35–0x70352f: udfordreren vinder bolden (gridMatch winBall 'shot'); adv = ebp (sub_716c90 ved død bold) */
  winBall(d: GP, p: GP, c: ShotChallenge, adv: boolean): void;
  // ---- afsnit 2–7
  /** sub_6cfd70(side, y, målrække, excl): offside-spilleren (trækker selv sine tal) */
  offsidePlayer(side: Side, y: number, row: number, excl: GP): GP | null;
  /** sub_6cc540(x, y, S, side == 0, kind, soft): skudlinjen – 0 fri, 1 blokeret (2 findes ikke i 3.9.68) */
  shotLine(x: number, y: number, S: number, side0: number, kind: number, soft: number): number;
  /** sub_6cd490(sidst rørt): bolden ude (målspark/hjørne/indkast) – bolden skal ligge uden for banen */
  ballOut(side: number): void;
  /** sub_7103e0: en spillers tur */
  playerTurn(q: GP): void;
  /** sub_7172d0: moralen */
  adjustMorale(q: GP, delta: number): boolean;
  /** sub_6eecb0(q, 0): handlingsevnerne igen */
  refreshSkills(q: GP): void;
  /** sub_6f46b0: spilleren i feltet */
  place(q: GP, x: number, y: number): void;
  /** sub_6f0630: q tager bolden */
  takeBall(q: GP): void;
  /** sub_702050 rekursivt */
  takeShot(p: GP, a1: number, a2: number, a3: number, a4: number, a5: number, a6: (GP | null)[]): void;
  /** sidens 20 pladser (engine+0x4796 + side·0x22d8) i indeksrækkefølge (+0x2e) */
  team(side: number): GP[];
  /** sub_6bcbd0's returbyte: det vægtede antal modstandere, der presser q */
  pressureCount(q: GP): number;
  /** sub_6cd770(x, y, spredning, sidst rørt, keep, stir, spiller) */
  looseBall(x: number, y: number, spread: number, lastTouch: number, keep: boolean, stir: boolean, player: GP | null): void;
  /** sub_6d5950(side): siden er ikke foran (dobbeltkampens regler) – stillingen før dette mål */
  notAhead(side: Side): boolean;
  /** limens bogføring ved målet (0x7071f2): statistik og lytteren – ingen tal */
  onGoal(p: GP): void;
  /** 0x708e39: afspark efter målet (+0x8eae, +0xf582, +0x8eb2 = 8, engine+0x1ca = 0) */
  kickoffAfterGoal(side: Side): void;
  /** fixture+0x1c/+0x20 → klub +0x53 og +0x77 == 8 (klubtypen kendes ikke i porten) */
  clubKind8(side: number): boolean;
  /** limens bogføring ved hjørnespark fra skuddet (0x709672 / redningen til hjørne) */
  corner(side: Side): void;
  /** sub_6bac40: den ventende hændelse dømmes (true = dømt) */
  applyIncident(): boolean;
  /** sub_6bba50: den ventende hændelses offerside, −1 uden */
  victimSide(): number;
  /** sub_6d5a10: første modstander (truppens rækkefølge, på banen), hvis mandsopdækning er q */
  firstMarker(q: GP): GP | null;
  /** spillerpostens byte (+0x6d → off; rå 1..20), null uden post */
  rec(q: GP, off: number): number | null;
  /** staffpostens byte (+0x69 → off) */
  staffByte(q: GP, off: number): number;
  /** staffpostens efternavn (+0x69 → +8) */
  surname(q: GP): string;
  /** sub_6cbbb0(side): antal af sidens 20 på banen */
  countOnPitch(side: number): number;
  /** sub_716450: ophidselsen ×f med gulv og loft */
  scaleAg(q: GP, f: number): void;
  /** holdblokken engine+0xf5bc + 54·side (indeks = offset − 0xf5bc) */
  teamBlock(side: number): number[];
  /** sub_716e10(q, 0): reaktionen på dommerens afgørelse */
  reactToDecision(q: GP): void;
  /** engine+0x1a8 golden goal i kraft */
  goldenGoal: boolean;
  /** engine+0x1a4 (?) */
  b1a4: number;
}

/** sub_702050's lokale variable (se KONVENTIONER). Afsnittene tilføjer deres felter her. */
export interface ShotFrame {
  p: GP;                    // esi: skytten
  a1: number; a2: number; a3: number; a4: number; a5: number; a6: (GP | null)[];
  a6pos: number;            // a6's læseposition (+0xa; 0x704db5 sætter den til hovedet +2)
  ebx: GP | null;           // keeperen (0x702311)
  ebp: number; edi: number;
  [k: string]: unknown;
}

type Label = (E: ShotEnv, f: ShotFrame) => void;
const LABELS = new Map<number, Label>();
/** hop til en etiket i et andet afsnit */
export function go(E: ShotEnv, f: ShotFrame, addr: number): void {
  const l = LABELS.get(addr);
  if (!l) throw new Error('takeShot: ingen etiket 0x' + addr.toString(16));
  l(E, f);
}
export function label(addr: number, fn: Label): Label { LABELS.set(addr, fn); return fn; }

// ================================================================ afsnit 1: 0x702050–0x70362d (prologen, foden, keeperen, udfordringen)

/** sub_702050(this = p, a1 type, a2 S, a3 begivenhed, a4 param, a5 antal i a6, a6 listen) */
export function takeShot(E: ShotEnv, p: GP, a1: number, a2: number, a3: number, a4: number, a5: number, a6: (GP | null)[]): void {
  const f: ShotFrame = { p, a1, a2: (a2 << 16) >> 16, a3, a4, a5, a6, a6pos: 0, ebx: null, ebp: 0, edi: 0 };
  const m = E.m, rand = E.rand, side = p.side;
  f.s60 = m.x4786; f.s5c = m.x4782;                                                       // 0x702064/0x70206a
  const gy = side === 0 ? 11 : 0;
  f.s80 = L.dist(p.x, p.y, 4, gy);                                                        // 0x702088 sub_6f09b0(4, målrækken)
  f.s58 = p.w39;                                                                          // 0x7020a4
  f.s30 = 0; f.s44 = 0; f.s50 = p.x; f.s54 = p.y;                                         // 0x7020a9–0x7020d8
  f.s64 = 0xf0; f.s34 = f.a2;                                                             // 0x7020cc T = 240, 0x7020d4
  f.s11 = 0; f.s15 = 0; f.s17 = 0; f.s28 = 6; f.s18 = 0; f.s1a = 0; f.s19 = 0; f.s68 = 0;  // 0x7020dc–0x7020ff
  f.s8c = p.action;                                                                       // 0x702103 (+0x198 før skuddet)
  f.s25 = E.markedBy(p);                                                                  // 0x70210b sub_6d59b0
  const mn = (Math.trunc(m.clock / 11) << 24) >> 24;
  f.s16 = mn;                                                                             // 0x702136
  E.setShotMark(side, Math.trunc(m.clock / 11));                                          // 0x70213d +0x8d4e, 0x70215b +0x8d4c
  if (m.x4786 >= 1680) f.s18 = 1;                                                         // 0x702168 fild +0x4786, fcomp 1680,0 (0x96d810)
  {                                                                                       // 0x702180: yards = ftol(9·D + 2,5) som byte, /5·5
    const b = (Math.trunc(9 * (f.s80 as number) + 2.5) << 24) >> 24;
    f.s1b = ((Math.trunc(b / 5) * 5) << 24) >> 24;
  }
  if (f.a1 === 0x39 || f.a1 === 3) f.s28 = 5;                                             // 0x7021c4 (hovedstød)
  if (f.a1 === 0x33) f.s64 = 0x78;                                                        // 0x7021cd T = 120
  // 0x7021d5–0x702258: den forkerte fod (sub_713e90) – S −= rand(p), w39 −= p/2
  {
    const D1 = L.dist(p.x, p.y, 4, gy);
    const ft = E.footCheck(p, f.a1, D1);
    f.s10 = ft.foot;                                                                      // 0x702227
    p.w39 = (((p.w39 - Math.trunc(ft.p / 2)) << 16) >> 16);                               // 0x702237
    const r = rand(ft.p);                                                                 // 0x702241
    f.s7c = r;
    f.a2 = (((f.a2 as number) - r) << 16) >> 16;                                          // 0x70224d/0x702258 (edi = S − r)
  }
  // 0x70225f–0x7022f5: assisten – afleveren (+0xf5a6) til skytten (+0xf5aa) får karakter og +3, x4782 += 0x113
  if (p === m.passRecv && m.passGiver && p.action !== 0x12 && p.action !== 0x11 && (p.w29 > -0x64 || f.a2 > 0x64) && f.a4 === 1) {
    const g = m.passGiver;
    if (g.action !== 0x34 && g.action !== 0x37) {
      g.assists++;                                                                        // 0x7022bb (+3)
      g.rating += Math.trunc(p.w29 / 3) + 0xe1;                                           // 0x7022e1 (imul 0x55555556: trunc mod 0)
      m.x4782 += 0x113;                                                                   // 0x7022eb
    }
    f.s68 = 1;                                                                            // 0x7022f5
  }
  // 0x7022fd: keeperen (sub_6ce110 – modstandernes)
  f.ebx = E.keeper(side === 0 ? 1 : 0);
  f.s48 = f.ebx;                                                                          // 0x702315
  // 0x70238e: høj-flaget efter typen (tabel 0x70a5a8 → 0x70a594)
  f.s1c = E.highFlag(f.a1) ? 1 : 0;
  // 0x7023ef sub_700420: keeperværdien K (+ tilstand [esp+0x20], fumle [esp+0x14])
  { const kv = E.keeperValue(f.ebx, p, f.a1); f.s38 = kv.K; f.s20 = kv.state; f.s14 = kv.fumble ? 1 : 0; }
  if (!f.s14) { if ((f.s38 as number) > 0x177) f.s1a = 1; else if ((f.s38 as number) > 0x104) f.s19 = 1; }   // 0x702427 / 0x702434
  // 0x70243f: udfordringen før skuddet sub_6c87e0(0x6d) – ikke ved boldhøjde 4, param 4, straffe og frispark
  let c: ShotChallenge | null = null;
  if (m.ballH !== 4 && f.a4 !== 4 && f.a1 !== 0x33 && f.a1 !== 0x35) {
    // 0x70248f sub_6c87e0(p, side, 0x6d, &s4c, &s4d, &s70, &s30, &s84, flag9 = s20 – keeperens tilstand fra 0x700420)
    c = E.challenge(p, side, 0x6d, f.s20 as number);
    f.s30 = c.type; f.s70 = c.value; f.s84 = c.clear ? 1 : 0; f.s4c = c.delayCarrier; f.s4d = c.delayChallenger;
  }
  const d = c ? c.d : null;
  f.s78 = d;                                                                              // 0x7024ad
  E.knockCheck(p, 0x6d, d, f.s30 as number, false);                                      // 0x7024b4 sub_6cfe10(p, 0x6d, edi, type, 0)
  if (!d || !c) return go(E, f, 0x70354d);                                                // 0x7024bb
  f.edi = 0;
  if ((c.value << 16) >> 16 >= p.momentum) {                                              // 0x7024c1 (ellers 0x702644: s2c = 0)
    const j = E.judge(d, p, c.type, -1);                                                  // 0x7024f4 sub_6cfc60(d, p, type, −1, &s88 art, &s74 sværhed, &s44)
    f.s2c = j.ret; f.s44 = j.hurt ? 1 : 0; f.s74 = j.severity; f.s88 = j.kind;
    // 0x7024fd: den sete kamp (engine+0x8ebb) – udfordreren i eget felt: straffeappellen 0x2168 (rand(3) ≠ 0), når typen er hård, offeret
    // er skadet eller rand(+0x31) < −10
    if (E.watched && E.inBox(d.side, d.x, d.y)) {
      if (E.isHard(c.type) || f.s44 || E.randS(d.w31) < -10) {
        if (rand(3) !== 0) E.ev(0x2168, d, d.side, null, -1, 0);                          // 0x702635 PENALTY_APPEAL?
      }
    }
    if (j.ret !== 0) {                                                                    // 0x702538
      if (rand(50) !== 0 || f.a4 === 4 || c.clear) {                                      // 0x702544
        E.foulShot(d, p, j, c, f);                                                        // 0x7026c2–0x702f1a (afslutter skuddet)
        return;
      }
      E.queueIncident(c.type, d, p, j.ret, p.x, p.y, j.kind, j.severity);                 // 0x7025a4 sub_6bb9a0: fordel
      f.a4 = 2;                                                                           // 0x7025a9
    } else if (f.s44 && (E.inBox(side === 0 ? 1 : 0, p.x, p.y) || c.clear)) f.ebp = 1;    // 0x702649–0x702670
  }
  // 0x702675 (= tried): udfordrerens handling, +4, karakter −59/−70
  E.tried(d, c);
  if (f.a2 > ((c.value << 16) >> 16)) { d.busy += c.delayChallenger; return go(E, f, 0x70362d); }   // 0x702f22 → 0x70353c
  E.winBall(d, p, c, f.ebp !== 0);                                                        // 0x702f35–0x70352f (gridMatch winBall 'shot')
}

/** udfordringens ud-værdier (challenge.ts ChallengeOut) */
export interface ShotChallenge { d: GP | null; type: number; value: number; delayCarrier: number; delayChallenger: number; clear: boolean }

// 0x70354d: ingen udfordrer – FINDS_A_GAP (skytten i feltet, a5 = 0, forrige handling i 0x70a8c0's liste) eller IN_CENTRAL_ATTACK
label(0x70354d, (E, f) => {
  const p = f.p, a1 = f.a1;
  if (!(a1 === 0x33 || a1 === 0x35 || f.a4 === 4 || a1 === 3 || a1 === 0x39)) {
    const inBox = E.inBox(p.side === 0 ? 1 : 0, p.x, p.y);
    const a = p.action;
    if (inBox && f.a5 === 0 && (a === 0xd || a === 0xc || a === 0x15 || a === 0x2e || a === 0x3b || a === 0x25)) {   // 0x70358d–0x7035b2 (sub_70a8c0)
      E.ev1(0x1f43, p, p.side, 0);                                                         // 0x7035c5 FINDS_A_GAP
    } else if (E.rand(10) === 0) {                                                         // 0x7035cc
      const yd = f.s1b as number;
      if (yd >= 0x14 && yd <= 0x23 && !E.inBox(p.side === 0 ? 1 : 0, p.x, p.y) && p.x < 6 && p.x > 2)
        E.ev1(0x2161, p, p.side, yd);                                                      // 0x70361d IN_CENTRAL_ATTACK (<d> yards)
    }
  }
  return go(E, f, 0x70362d);
});
