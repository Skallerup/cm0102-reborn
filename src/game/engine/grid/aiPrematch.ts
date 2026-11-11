// sub_6ddab0 – computerens justering af taktikken før kampen (holdflag, individuelle instruktioner og enkelte pladsers masker).
// Afkodet fra cm0102.exe 3.9.68 (~/cm0102-engine/notes/6ddab0-ai-prematch.md – alle adresser og konstanter står dér).
// Ren funktion: ingen import af gridMatch.ts. Kaldes for et computerhold efter at forudindstillingen er valgt og spillerne er
// initialiseret (0x6dd6de MATCH_PLAYER::init), før tilstandsjusteringen (0x6dd7c3) og den første sub_6c54a0 (aiRetune).
import { DIST } from './loop';
import { setInstr, setTeamOption } from './tacticTable';

export type Rand = (n: number) => number; // sub_90cfc0: 0..n−1; n < 0 → n+1..0

/** sub_544380 / 0x543689 (sikker): X = CA + 2·v (målmandsvarianten 0,1·CA + 2·v); t = 0,05·X + 10; (0,1t² + t)/3 + 0,5, 1..20, afkortet. */
export function shown(x: number): number {
  const t = x * 0.05 + 10;
  const v = (t * t * 0.1 + t) * (1 / 3) + 0.5;
  return v <= 1 ? 1 : v >= 20 ? 20 : Math.trunc(v);
}

/** sub_5431e0 → sub_543540: egenskab n (1..31, alfabetisk) fra spillerposten (0x46 bytes som i hukommelsen; de 18 tekniske/mentale er
 *  interne værdier, s8). Determination (10) ligger i personposten (+0x58) og gives separat. */
export function recordAttr(rec: ArrayLike<number>, n: number, determination = 10): number {
  const s8 = (o: number) => ((rec[o] << 24) >> 24);
  const ca = ((rec[5] | (rec[6] << 8)) << 16) >> 16;
  const gk = rec[0x0f];
  const conv = (o: number) => shown(ca + 2 * s8(o));                    // sub_544380
  const convGk = (o: number) => shown(ca * 0.1 + 2 * s8(o));            // sub_5442f0 / 0x5436e1
  switch (n) {
    case 1: return rec[0x1b];                                            // Acceleration
    case 2: return rec[0x1c];                                            // Aggression
    case 3: return rec[0x1d];                                            // Agility
    case 4: return conv(0x1e);                                           // Anticipation
    case 5: return rec[0x1f];                                            // Balance
    case 6: return rec[0x20];                                            // Bravery
    case 7: return gk === 20 ? convGk(0x43) : conv(0x43);                // Creativity (Vision)
    case 8: return gk === 20 ? convGk(0x23) : conv(0x23);                // Crossing
    case 9: return conv(0x24);                                           // Decisions
    case 10: return determination;                                       // Determination (personpost +0x58)
    case 11: return gk === 20 ? convGk(0x26) : conv(0x26);               // Dribbling
    case 12: return gk === 20 ? convGk(0x27) : conv(0x27);               // Finishing (0x54396c)
    case 13: return rec[0x28];                                           // Flair
    case 14: return gk < 15 ? convGk(0x2a) : conv(0x2a);                 // Handling
    case 15: return conv(0x2b);                                          // Heading
    case 16: return rec[0x2f];                                           // Influence (Leadership)
    case 17: return rec[0x2e];                                           // Jumping
    case 18: return conv(0x31);                                          // Long Shots
    case 19: return gk === 20 ? convGk(0x32) : conv(0x32);               // Marking
    case 20: return gk === 20 ? convGk(0x33) : conv(0x33);               // Off the Ball (Movement)
    case 21: return rec[0x36];                                           // Pace
    case 22: return conv(0x37);                                          // Passing
    case 23: return conv(0x39);                                          // Positioning
    case 24: return gk < 15 ? convGk(0x3a) : conv(0x3a);                 // Reflexes
    case 25: return rec[0x29];                                           // Set Pieces (Free Kicks)
    case 26: return rec[0x3c];                                           // Stamina
    case 27: return rec[0x3d];                                           // Strength
    case 28: return conv(0x3e);                                          // Tackling
    case 29: return rec[0x3f];                                           // Teamwork
    case 30: return rec[0x40];                                           // Technique
    case 31: return rec[0x44];                                           // Work Rate
    default: return -1;
  }
}

/** sub_5431e0's indeks 1..31 → vores egenskabsnavne (ATTRS i game/attributes.ts; Creativity = databasens Vision, Off the Ball = Movement,
 *  Influence = Leadership, Set Pieces = Free Kicks – som cm0102.ts MAP). Til `attr` fra en spiller med viste værdier. */
export const PREMATCH_ATTR_KEYS = ['', 'acceleration', 'aggression', 'agility', 'anticipation', 'balance', 'bravery', 'creativity', 'crossing', 'decisions',
  'determination', 'dribbling', 'finishing', 'flair', 'handling', 'heading', 'influence', 'jumping', 'longShots', 'marking', 'offTheBall', 'pace', 'passing',
  'positioning', 'reflexes', 'freeKicks', 'stamina', 'strength', 'tackling', 'teamwork', 'technique', 'workRate'] as const;

/** 0x5b5a60 (sikker): én bit pr. kanonisk maske i formationsordet +0x187b (GK bit 0, række r SW..F, kolonne c → bit 1 + 5r + c;
 *  sic: 0x802 giver samme bit som 0x804). Ukendte masker → 0. */
export const FORM_BIT: Record<number, number> = {
  0x1: 0x1, 0x82: 0x2, 0x102: 0x4, 0x202: 0x8, 0x402: 0x10, 0x802: 0x400,
  0x84: 0x40, 0x104: 0x80, 0x204: 0x100, 0x404: 0x200, 0x804: 0x400,
  0x88: 0x800, 0x108: 0x1000, 0x208: 0x2000, 0x408: 0x4000, 0x808: 0x8000,
  0x90: 0x10000, 0x110: 0x20000, 0x210: 0x40000, 0x410: 0x80000, 0x810: 0x100000,
  0xa0: 0x200000, 0x120: 0x400000, 0x220: 0x800000, 0x420: 0x1000000, 0x820: 0x2000000,
  0xc0: 0x4000000, 0x140: 0x8000000, 0x240: 0x10000000, 0x440: 0x20000000, 0x840: 0x40000000,
};
/** 0x5b59a0 (sikker): formationsordet = OR af pladsernes bits, derefter originalens normalisering af nogle koder. */
export function formationWord(masks: readonly number[]): number {
  let w = 0;
  for (let s = 0; s < 11; s++) w = (w | (FORM_BIT[masks[s]] ?? 0)) >>> 0;
  if (w === 0x101176c1 || w === 0x101b26c1) return 0x101f06c1;
  if (w === 0x38115381 || w === 0x3a242381) return 0x381b0381;
  if ([0x280e07c1, 0x91a07c1, 0x2884ab81, 0x280aab81, 0x288c07c1, 0x281507c1].includes(w)) return 0x280e8b81;
  if (w === 0x288a8b81) return 0x281b2381;
  return w;
}

/** Spillerpostens rå bytes, som sub_6ddab0 læser direkte (ikke gennem sub_5431e0). */
export interface PrematchRaw {
  dm: number; m: number; am: number; f: number;     // +0x12, +0x13, +0x14, +0x15 (positionsevner 1..20)
  right: number; left: number; central: number;      // +0x17, +0x18, +0x19
  freeRole: number;                                  // +0x1a
  jumping: number; technique: number; stamina: number; workRate: number;   // +0x2e, +0x40, +0x3c, +0x44
}
export interface PrematchPlayer {
  slot: number;                     // +0x19 (< 0 = ikke på banen → springes over)
  recId: number;                    // spillerpostens id (+0)
  condition: number;                // +0x4d (0..10000, efter MATCH_PLAYER::init)
  b24: number;                      // +0x24 (gule kort; 0 ved kampstart)
  raw: PrematchRaw;
  /** sub_5431e0(staff, n): den viste værdi af egenskab n (1 Acceleration … 31 Work Rate, se recordAttr). */
  attr: (n: number) => number;
}
/** Managerens ikke-spillerpost (stab +0x69 → team+0x1f): rå 1..20-værdier fra +0x0e og frem. */
export interface PrematchManager {
  id: number;                       // +0 (postens id i hukommelsen – indgår i "dømmekraften", se J)
  ca: number;                       // +4 (word)
  attacking: number;                // +0x0e
  directness: number;               // +0x13
  freeRoles: number;                // +0x15
  offside: number;                  // +0x1c
  pressing: number;                 // +0x1f
  tactics: number;                  // +0x21 (læses som sub_543f30(stab, 11) = shown(CA + 2·Tactics))
}
/** En modstander (kampspillerblok i rækkefølge 0..19): plads, masker (sub_6c38c0/6c38f0), spillerpostens omdømme +0xb og stab-id. */
export interface PrematchOpponent { slot: number; pos: number; posAttack: number; rep: number; staffId: number;
  /** 0x7c1e30(rec, 6, k, 6,5f) for k = 1, 2, 5 (ukendt statistik over de seneste 6 kampe ?); uden = 0 → grenen slår ikke til */
  stats?: [number, number, number] }

const OWN_ROW: Record<number, number> = { 0x2: 0, 0x4: 1, 0x8: 2, 0x10: 3, 0x20: 4, 0x40: 5 };      // jumptabel 0x6d4720/0x6d473c
const OPP_ROW: Record<number, number> = { 0x2: 6, 0x4: 5, 0x8: 4, 0x10: 3, 0x20: 2, 0x40: 1 };      // 0x6d477c/0x6d4798
const OWN_COL: Record<number, number> = { 0x80: 1, 0x100: 3, 0x200: 4, 0x400: 5, 0x800: 7 };
const OPP_COL: Record<number, number> = { 0x80: 7, 0x100: 5, 0x200: 4, 0x400: 3, 0x800: 1 };
/** 0x5b73a0 (sikker): laveste rækkebit og første kolonnebit (GK → centralt) */
function rowCol(mask: number): [number, number] {
  const v = [0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40].find((b) => mask & b) ?? 0;
  const h = mask & 0x80 ? 0x80 : mask & 0x100 ? 0x100 : mask & 0x200 || mask & 1 ? 0x200 : mask & 0x400 ? 0x400 : mask & 0x800 ? 0x800 : 0;
  return [v, h];
}
/** sub_6d4330(side, plads) (sikker): modstanderen "over for" spilleren med indeks `slot` (sic: pladsen bruges som indeks i holdets 20).
 *  Først den første modstander i den modsatte rolle (SW/D ↔ F, DM ↔ AM, M ↔ M, AM ↔ DM, F ↔ D/SW) på den spejlede side; ellers den
 *  nærmeste efter DIST[|række|][|kolonne|] (0xa15e44; uden for tabellen 1000, 0x96d2dc). −1 = ingen (målmand/ikke på banen). */
export function oppositeIndex(ownSlot: number, ownPos: number, opp: readonly { slot: number; pos: number }[]): number {
  if (ownSlot < 0 || ownSlot > 10 || ownPos & 1) return -1;
  for (let i = 0; i < 20 && i < opp.length; i++) {
    const q = opp[i]; if (q.slot < 0) continue;
    const o = q.pos;
    if (ownPos & 6 && !(o & 0x40)) continue;
    if (ownPos & 8 && !(o & 0x20)) continue;
    if (ownPos & 0x10 && !(o & 0x10)) continue;
    if (ownPos & 0x20 && !(o & 8)) continue;
    if (ownPos & 0x40 && !(o & 4) && !(o & 2)) continue;
    if ((ownPos & 0x80 && o & 0x800) || (ownPos & 0x100 && o & 0x400) || (ownPos & 0x200 && o & 0x200) || (ownPos & 0x400 && o & 0x100) || (ownPos & 0x800 && o & 0x80)) return i;
  }
  const [v, h] = rowCol(ownPos), row = OWN_ROW[v] ?? 0, col = OWN_COL[h] ?? 0;
  let best = -1, bd = 1000;
  let r2 = row;
  for (let i = 0; i < 20 && i < opp.length; i++) {
    const q = opp[i]; if (q.slot < 0 || q.pos & 1) continue;
    const [qv, qh] = rowCol(q.pos);
    r2 = OPP_ROW[qv] ?? r2; const c2 = OPP_COL[qh] ?? 0;
    const dc = Math.abs(col - c2), dr = Math.abs(row - r2);
    const d = dc <= 8 && dr <= 11 ? DIST[dr][dc] : 1000;
    if (best < 0 || d < bd) { best = i; bd = d; }
  }
  return best;
}

export interface PrematchInput {
  flags: number;                    // holdflaget +0x584 (forudindstillingens)
  lo: number[]; hi: number[];       // +0x188b/+0x188f pr. plads
  masks: number[]; masks2: number[]; // +0x12d / +0x14e pr. plads (sub_6c38c0 / sub_6c38f0)
  formation?: number;               // +0x187b (ellers formationWord(masks))
  players: PrematchPlayer[];        // holdets 20 (rækkefølge = kampspillerblokkene)
  manager: PrematchManager | null;  // team+0x1f (null = intet)
  ownRep: number; oppRep: number;   // klub +0x80 (word) for eget hold og modstanderen
  b19: boolean;                     // team+0x19: kampens flag +0x40 (hjemme) / +0x41 (ude) er 0 → altid let tackling (0x20)
  compType: number;                 // fixture+0x37 → +0x3a (1 og 9: let tackling efter et rand-slag)
  homeTeam: boolean;                // fixture(+0x4792)+0x1c == eget hold (0x6de4fb)
  skipHuman?: boolean;              // 0x6ddafb–0x6ddb48: menneskemanager uden assistentens taktik → intet ændres
  /** modstanderens 20 kampspillere (til 0x6d4330 og mandsopdækningen). Udeladt = ingen mandsopdækning. NB: for hjemmeholdet (side 0) er
   *  modstanderen endnu ikke sat op, når sub_6ddab0 kører (setupTeam side 0 kaldes før side 1, 0x6b8866/0x6b89b9) ? */
  opponents?: PrematchOpponent[];
}
export interface PrematchResult {
  teamFlags: number;
  lo: number[]; hi: number[]; instr: bigint[];
  masks: number[]; masks2: number[]; formation: number;
  /** +0x5bf+4·plads: mandsopdækningens stab-id (sat af 0x5b5910), undefined = uændret */
  marking: (number | undefined)[];
  /** J pr. plads (managerens "dømmekraft"-tærskel, [esp+0x38]) – til fejlfinding */
  J: (number | undefined)[];
}

const C_REP = 5.882352941176471e-05;   // 0x96d500 (1/17000)
const C_30 = 0.03333333333333333;      // 0x969020

export function aiPrematch(inp: PrematchInput, rand: Rand): PrematchResult {
  let flags = inp.flags >>> 0;
  const lo = inp.lo.map((v) => v >>> 0), hi = inp.hi.map((v) => v >>> 0);
  const masks = [...inp.masks], masks2 = [...inp.masks2];
  let formation = inp.formation ?? formationWord(masks);
  const marking: (number | undefined)[] = Array(11).fill(undefined);
  const Js: (number | undefined)[] = Array(11).fill(undefined);
  const done = (): PrematchResult => ({ teamFlags: flags, lo, hi, instr: lo.map((l, s) => (BigInt(hi[s]) << 32n) | BigInt(l)), masks, masks2, formation, marking, J: Js });
  const randS = (n: number) => (n < 0 ? -rand(-n) : rand(n));
  const team = (bit: number) => { flags = setTeamOption(flags, bit); };                 // sub_5b50d0
  const set = (s: number, l: number, h = 0) => {                                          // sub_5b5290(plads, lav, høj)
    if (h) { const v = setInstr({ lo: lo[s], hi: hi[s] }, h, true); hi[s] = v.hi; }
    else { const v = setInstr({ lo: lo[s], hi: hi[s] }, l); lo[s] = v.lo; }
  };
  const setMask = (s: number, m: number, att: 0 | 1) => {                                // sub_5b2ba0(plads, maske, med bold)
    if (att) { masks2[s] = m; return; }
    if (masks[s] !== m) { masks[s] = m; formation = formationWord(masks); }               // 0x5b2c06 → 0x5b59a0
    masks2[s] = m;                                                                        // 0x5b2c3f
  };

  // 0x6ddabf–0x6ddaf5: R = (eget + modstanderens omdømme) / 17000
  let R = (inp.ownRep + inp.oppRep) * C_REP;
  if (inp.skipHuman) return done();                                                       // 0x6ddb48
  // 0x6ddb4e–0x6ddba3: let tackling (0x20)
  if (inp.b19) team(0x20);
  else if (inp.compType === 1 || inp.compType === 9) {
    const r = rand(2000) + randS(-4000);                                                  // 0x6ddb6e, 0x6ddb7a
    if (inp.ownRep - inp.oppRep > r) team(0x20);
  }
  const mgr = inp.manager;
  if (!mgr) return done();                                                                // 0x6ddbad
  // 0x6ddbb3–0x6ddbda: R ×= 1 − (Attacking − 10)/30
  R = (1 - (mgr.attacking - 10) * C_30) * R;
  // 0x6ddbc2–0x6ddbfd: Directness → afleveringsstil
  const d = mgr.directness;
  if (d <= 8) team(2); else if (d <= 14) team(1); else if (d <= 18) team(4); else if (d <= 20) team(8);
  // 0x6ddc02–0x6ddc1f: Pressing ≥ 15 → pres ja, ≤ 5 → nej
  if (mgr.pressing >= 15) team(0x100); else if (mgr.pressing <= 5) team(0x80);
  // 0x6ddc24–0x6ddc6b: offsidefælde når 19 − 0,0003·omdømme < Offside og formationen ikke har en central libero (bit 8 = 0x202)
  if (19 - inp.ownRep * 0.0003 < mgr.offside && !(formation & 8)) team(0x400);
  // 0x6ddc70–0x6ddc9b: 0x897ee0(klub, 0/1, 0, b19) – taktiklistens statistik, ingen virkning her

  // 0x6ddca0–0x6ddd35: "target man"-tallet b17 af de centrale angribere med Jumping > 14
  let b17 = 0;
  for (const p of inp.players) {
    if (p.slot < 0) continue;
    const pm = masks[p.slot];
    if (!(pm & 0x40) || !(pm & 0x200) || p.raw.jumping <= 14) continue;
    b17 = (b17 + Math.trunc(Math.pow(p.raw.jumping - 14, 1.5))) << 24 >> 24;                // 0x945ff0 pow, 0x945640 ftol; byte
    if (p.raw.technique < 8) b17 = (b17 + 8 - p.raw.technique) << 24 >> 24;
  }

  const mgrShown = shown(mgr.ca + 22);                                                    // 0x544410(mgr, 11) – sic: værdien 11, ikke en egenskab
  const div = 13 - Math.trunc(mgrShown / 2);
  const tacticsShown = shown(mgr.ca + 2 * mgr.tactics);                                   // 0x543f30(stab, 11) = Tactics

  for (const p of inp.players) {                                                          // 0x6ddd5e: alle 20
    const s = p.slot;
    if (s < 0) continue;
    const pos = () => masks[s], posA = () => masks2[s];
    const A = p.attr, raw = p.raw;
    // 0x6ddd69–0x6dddcc: J
    const n = (mgr.id + p.recId) % div;                                                   // idiv: resten har dividendens fortegn
    let J = (n * 0.05 + 1.0) * R * 1.2;                                                   // 0x967888, 0x967890, 0x968978
    if (J < 0.6) J = 0.6;                                                                 // 0x968e48
    Js[s] = J;

    // ---- A 0x6dddd4–0x6de0cc: mid/angriber → central offensiv midtbane, når formationen ikke har en (0x1c00000 = 0x120/0x220/0x420)
    if (!(formation & 0x1c00000)) {
      const cre = () => A(7);
      if (pos() & 0x10 && pos() & 0x200 && raw.am > raw.m - 1 && raw.central === 20 && cre() > 16 * J) { setMask(s, 0x220, 0); setMask(s, 0x220, 1); }
      else if (pos() & 0x10 && !(posA() & 0x20) && pos() & 0x100 && raw.am >= raw.m - 1 && raw.central === 20 && cre() > 16 * J) setMask(s, 0x220, 1);
      else if (pos() & 0x10 && !(posA() & 0x20) && pos() & 0x400 && raw.am >= raw.m - 1 && raw.central === 20 && cre() > 16 * J) setMask(s, 0x220, 1);
      else if (pos() & 0x40 && pos() & 0x200 && raw.am >= raw.f - 1 && raw.central === 20 && cre() > 17 * J) { setMask(s, 0x220, 0); setMask(s, 0x240, 1); }
      else if (pos() & 0x40 && pos() & 0x100 && raw.am >= raw.f - 1 && raw.central === 20 && cre() > 17 * J) { setMask(s, 0x120, 0); setMask(s, 0x140, 1); }
      else if (pos() & 0x40 && pos() & 0x400 && raw.am >= raw.f - 1 && raw.central === 20 && cre() > 17 * J) { setMask(s, 0x420, 0); setMask(s, 0x440, 1); }
    }

    // ---- B 0x6de0d1–0x6de23f: fri rolle (0x200000 ja / 0x100000 nej)
    let freeDone = false;
    if (pos() & 0x62 && p.condition > 8250 && raw.stamina > 12 && A(7) > 17 * J && raw.freeRole > 15
      && A(20) + 3 * (mgr.freeRoles - 10) > 40 * J) {
      set(s, 0x200000);
      if (p.condition < 8500 || raw.stamina < 18 || raw.workRate > 16) set(s, 0x4000);      // 0x6de19e–0x6de1cc
      freeDone = true;
    }
    if (!freeDone && 40 * J > A(20) + A(13) + A(7) + 3 * (mgr.freeRoles + raw.freeRole - 20)) set(s, 0x100000);   // 0x6de1ce

    // ---- C 0x6de244–0x6de2a9: central offensiv midtbane → afleveringer 2/4 (lav bit 1 = "holdets")
    if (pos() & 0x20 && !(pos() & 0x80) && !(pos() & 0x800)) {
      if (lo[s] & 1) set(s, flags & 8 ? 2 : 4); else set(s, 4);
    }

    // ---- D 0x6de2ae–0x6de907: central DM/M med lav Creativity → afleveringer + evt. mandsopdækning
    if ((pos() & 8 || pos() & 0x10) && !(pos() & 0x80) && !(pos() & 0x800) && 16 * J > A(7)) {
      if (lo[s] & 1) set(s, flags & 8 ? 2 : 4); else set(s, 4);
      if (inp.opponents) {                                                                 // 0x6de35f: 0x6d4330(side, plads)
        const own = inp.players[s];                                                        // sic: pladsen som indeks
        const qi = own ? oppositeIndex(own.slot, own.slot >= 0 ? masks[own.slot] : 0, inp.opponents) : -1;
        const q = qi >= 0 ? inp.opponents[qi] : null;
        if (q && q.staffId >= 0) markingBlock(s, q, p);
      }
    }

    // ---- E 0x6de90c–0x6de981: langskud (0x10000000 nej / 0x20000000 ja)
    const J10 = 10 * J;
    if (A(18) < J10) set(s, 0x10000000);
    else if (13 * J < A(18)) set(s, 0x20000000);

    // ---- F 0x6de986–0x6deb6b: midtbanens tackling/pres efter Aggression/Work Rate og managerens Pressing
    if (pos() & 0x38 && !(pos() & 0x80) && !(pos() & 0x800)) {
      const pm = Math.trunc(mgr.pressing / 5);
      if (pm + J10 > A(2)) {
        if (pm + 5 * J > A(31)) {
          set(s, lo[s] & 0x200 ? (flags & 0x20 ? 0x400 : 0x1000) : 0x1000);
          set(s, 0x8000);
        } else if (pm + J10 > A(31)) set(s, lo[s] & 0x200 ? (flags & 0x20 ? 0x400 : 0x1000) : 0x1000);
      }
    }

    // ---- G 0x6deb70–0x6debad: (+0x24) og Aggression > Pressing/4 + 8 → 0x800
    if (p.b24 && A(2) > Math.trunc(mgr.pressing / 4) + 8) set(s, 0x800);

    // ---- H 0x6debb2–0x6ded28: fremadløb (0x800000 ja / 0x400000 nej)
    if (pos() & 8 || pos() & 0x10 || (mgr.attacking > 16 && pos() & 0x40)) {
      const am4 = Math.trunc(mgr.attacking / 4);
      const t14 = 14 * J - am4, t10 = J10 - am4;
      if (A(20) > t14 && A(12) > t14 && p.condition > 8000) set(s, 0x800000);
      else if ((A(20) < t10 && A(12) > t10) || p.condition < 8000) set(s, 0x400000);
    }

    // ---- I 0x6ded2d–0x6dee75: løb med bolden (0x2000000 ja / 0x1000000 nej)
    {
      const am4 = Math.trunc(mgr.attacking / 4);
      const mid = pos() & 0x10 || pos() & 0x20 || pos() & 0x40;
      let yes = false, tryNo = true;
      if (mid || 16 * J < A(11)) {
        if (14 * J < A(11) || 34 * J - am4 < A(21) + A(11)) { yes = true; tryNo = false; }
      }
      if (yes) set(s, 0x2000000);
      else if (tryNo && 25 * J - am4 > A(21) + A(11)) set(s, 0x1000000);
    }

    // ---- J 0x6dee7a–0x6deee9: kant-midtbane med fri rolle-evne → offensiv midtbane indad med bold
    if (pos() & 0x10 && raw.freeRole > 12 && raw.am >= raw.m) {
      if (pos() & 0x80 && raw.central > raw.left) setMask(s, 0x120, 1);
      else if (pos() & 0x800 && raw.central > raw.right) setMask(s, 0x420, 1);
    }

    // ---- K 0x6deeee–0x6def97: hold bolden (0x8000000 ja / 0x4000000 nej)
    {
      const v = A(27) - A(21) - A(12);
      if (pos() & 0x40 && !(pos() & 0x80) && !(pos() & 0x800) && v > 0) set(s, 0x8000000);
      else if (v < -5) set(s, 0x4000000);
    }

    // ---- L 0x6def9c–0x6df17c: indlæg (høj 4 / høj 8) efter Crossing og b17
    {
      const c = A(8);
      let a: number, b: number;
      if (!(pos() & 0x80) && !(pos() & 0x800)) { a = 16 * J; b = J10; }                        // central
      else if (!(pos() & 8) && !(pos() & 0x10) && !(pos() & 0x20)) { a = 13 * J; b = 7 * J; }  // kant, ikke midtbane
      else { a = J10; b = 5 * J; }                                                            // kant-midtbane
      if (a - b17 < c) set(s, 0, 4);
      else if (b - b17 > c) set(s, 0, 8);
    }

    // ---- M 0x6df181–0x6df341: gennembrudsafleveringer (høj 1 / høj 2) efter Passing + Creativity
    {
      const v = A(22) + A(7), pm = pos();
      const X = [0x110, 0x210, 0x410, 0xa0, 0x120, 0x220, 0x420, 0x820], Y = [0x90, 0x810, 0x108, 0x208, 0x408, 0x202];
      if (X.includes(pm)) { if (23 * J < v) set(s, 0, 1); }
      else if (Y.includes(pm)) { if (27 * J < v) set(s, 0, 1); }
      else if (31 * J < v) set(s, 0, 1);
      else if (20 * J > v) set(s, 0, 2);
    }

    // ---- N 0x6df346–0x6df432: playmaker-kandidat → 0x897ee0 (taktiklisten, ingen virkning på kampens taktik ?)
  }
  return done();

  /** 0x6de36f–0x6de907 (mandsopdækning); ændrer kun +0x14e-masken og +0x5bf – ikke instruktionerne. */
  function markingBlock(s: number, q: PrematchOpponent, p: PrematchPlayer) {
    const pos = masks[s], A = p.attr, raw = p.raw;
    const repOk = inp.ownRep < inp.oppRep + 250 || q.rep + 250 > inp.ownRep;              // 0x6de406–0x6de433 (word)
    const qAM = q.pos & 0x20 || q.posAttack & 0x20, qCen = q.pos & 0x700;
    if (qAM && qCen && repOk && A(28) > 12 && A(17) > 10 && A(31) > 10 && raw.dm === 20 && pos & 0x10 && pos & 0x700
      && tacticsShown > (q.staffId % 5) + 10) {
      if (!inp.homeTeam || A(26) > 15) setMask(s, 0x208, 1);                              // 0x6de4f2–0x6de532
      marking[s] = q.staffId;                                                              // 0x5b5910
      return;
    }
    if (pos & 8 && pos & 0x700 && qAM && q.pos & 0x200 && repOk && A(31) > 10 && A(28) > 15 && A(19) > 10 && A(26) > 10
      && tacticsShown > (q.staffId % 5) + 7) { marking[s] = q.staffId; return; }           // 0x6de576–0x6de6b5
    if ((q.pos & 0x10 || q.posAttack & 0x10) && qCen && repOk && A(31) > 10 && A(28) > 12 && A(19) > 10 && A(26) > 10
      && tacticsShown > (q.staffId % 5) + 8) {                                             // 0x6de6ba–0x6de7ea
      const [f1, f2, f5] = q.stats ?? [0, 0, 0];                                           // 0x7c1e30(rec, 6, 1|2|5, 6,5)
      let x = 0, y = 0;
      if (f1 > 2) { x = f2 / f1; y = f5 / f1; }
      if (!(x > 0.35 || y > 0.4)) return;
      if (qAM && (raw.dm === 20 || raw.m === 20) && A(26) > 14) setMask(s, 0x208, 1);
      marking[s] = q.staffId;
    }
  }
}
