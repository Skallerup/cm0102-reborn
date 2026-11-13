// Originalens spillerdata, som computerens holdudtagelse (0x6e2f20, engine/grid/roleScore.ts) læser – holdt i vores spiltilstand og opdateret
// på de samme tidspunkter som i cm0102.exe 3.9.68 (afkodet 11/11-2026; noten ~/cm0102-engine/notes/cm-player-data.md):
//
//   PlayerStats ([0xb74350]):  0x7c0d70 efter hver kamp (kategori 1–6, 32-bytes poster), 0x7c2150/0x7c1e30 (snittene), formens nibbles
//                              +0x24..+0x26 og spillets karaktersnit +0x10/+0x18; 0x7c5fe0 arkiverer/nulstiller posterne ved klubskifte og
//                              ved sæsonslut (0x7c1350 pr. land).
//   Kontrakten (0x4cf5f0):     0x4ca6d0 efter hver kamp: +0x3d (spilletid), +0x3e/+0x3f (kampe i træk uden/med tilfredsstillende spilletid),
//                              +0x44 (tilfredshed: ±3 ved sejr/nederlag, 0x4cb0a0/0x4cb250); +0x3d sat af status ved ny kontrakt (0x4cf720).
//   Spilstarten (sub_535a80):  manglende omdømme (0 eller over 200) udfyldes (0x536321–0x536783) og ganges med 50 (0x536e8e).
//
// Kun den originale database i ægte tilstand (cmActive) – den moderne database og zonemotoren røres ikke. Originalens tilfældige tal i
// disse opdateringer (rand(30) to gange, rand(21 − Ambition) og spilstartens udfyldning) trækkes af en egen deterministisk talrække
// (hash af spillets frø, spilleren og datoen), så spillets rng er uændret.

import type { Fixture, GameState, MatchReport, Player } from './types';
import { ATTRS } from './attributes';
import { ageOn } from './dates';
import { gs, hasGame } from './state';
import { contractLanguageNibble, languageDay, languageFluency } from './cmLanguage';

/** gælder kun den originale database i ægte tilstand (som cmDatabase i newgame.ts – ikke importeret: cirkulær import) */
export function cmActive(g: GameState): boolean {
  if (g.dbKind !== 'cm0102' || g.options.mode !== 'authentic') return false;
  return (g.dbYear ?? g.seasonHistory?.[0]?.season ?? g.season) < 2020;
}

// ---------------------------------------------------------------- en egen talrække (0x90cfc0's rolle)

function mix(...xs: number[]): number {
  let h = 0x811c9dc5 | 0;
  for (const x of xs) { h = Math.imul(h ^ (x | 0), 0x01000193); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; }
  return h >>> 0;
}
/** rand(n) som 0x90cfc0 af en deterministisk talrække: 0..n−1, n = 0 → 0, negativt n → −(0..|n|−1) (idiv med negativ divisor og `neg edx`,
 *  0x90d020–0x90d026 – udviklingen 0x5d38f9 trækker rand(T) og rand(L) med negative grænser) */
export function cmRand(...seed: number[]): (n: number) => number {
  let s = mix(...seed) || 1;
  return (n: number) => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    const k = Math.trunc(n);
    return k > 0 ? s % k : k < 0 ? 0 - (s % -k) : 0;
  };
}
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);

// ---------------------------------------------------------------- PlayerStats

/** Postens felter (32 bytes): +0 kampe, +1 indskiftet, +2..+6 (+2 mål), +7 holdets mål, +8 modstanderens, +9 sejre, +0xa nederlag, +0xb/+0xc,
 *  +0xd kampens spiller, +0xe karaktersum, +0x10..+0x1a (words), +0x1c minutter (dword) */
export const ST = { apps: 0, subApps: 1, goals: 2, b3: 3, b4: 4, b5: 5, b6: 6, gf: 7, ga: 8, won: 9, lost: 10, b11: 11, b12: 12, mom: 13,
  rating: 14, w10: 15, w12: 16, w14: 17, w16: 18, w18: 19, w1a: 20, minutes: 21 } as const;
const NFIELD = 22;
const u8 = (v: number) => v & 0xff;
const s16 = (v: number) => (v << 16) >> 16;
const u16 = (v: number) => v & 0xffff;

/** 0x7c0d70: kategorien for et holds kamp – 1 venskabskamp (og kampe uden statistik), 2 liga (0x4b0700), 3 pokal, 4 Europa (+0x42 = 2),
 *  5 landskamp (+0x42 = 4 / 0x5c6710); 6 = summen af 2, 3 og 4. Vores turneringstyper: league/playoff → 2, cup → 3, continental → 4. */
export function statCategory(g: GameState, f: Fixture): number {
  const c = g.comps[f.comp];
  if (!c) return 1;
  return c.type === 'league' || c.type === 'playoff' ? 2 : c.type === 'cup' ? 3 : c.type === 'continental' ? 4 : 1;
}

/** originalens kampkarakter (resultatposten +0x35, 0x6ce4f7): trunc((karakter·1000 + 500)/1000) mellem 1 og 10 */
export const ratingByte = (r: number) => Math.max(1, Math.min(10, Math.trunc((Math.round(r * 1000) + 500) / 1000)));

/** 0x7c0d70 for én spiller i én kamp (kaldt for begge hold, alle 20 i kamptruppen der spillede). `res` = holdets mål / modstanderens. */
export function recordPlayerMatch(g: GameState, p: Player, cat: number, line: { rating: number; goals: number; minutes: number; sub: boolean }, gf: number, ga: number, mom: boolean): void {
  if (p.regen) return;                                                       // 0x7c1032: genererede spillere (id ≥ [0xae2364]) får ingen statistik
  const r = ratingByte(line.rating);
  // spillets karaktersnit +0x10/+0x18 (double) – 0x6e2f20 læser det for spillere over 33 (0x6e41a8). Starter på 680/100 (6,8 vægtet med 100
  // kampe, målt i oraklet) og tæller kun kampe med resultat+0x4c = 0 (liga, pokal, Europa, landskampe – ikke de fleste venskabskampe og
  // −2-kampene; vores spil har kun de første)
  const avg = (g.cmRatingAvg ??= [680, 100]);
  avg[0] += r; avg[1] += 1;
  const stats = (p.cmStats ??= {});
  for (const k of [1, 2]) {                                                  // 0x7c10b4: kategorien, derefter 6 (ikke for 1 og 5)
    const c = k === 1 ? cat : 6;
    if (k === 2 && (cat === 5 || cat === 1)) continue;
    const e = (stats[c] ??= new Array(NFIELD).fill(0));                     // 0x7c5d80: posten oprettes
    e[ST.apps] = u8(e[ST.apps] + 1);
    if (line.sub) e[ST.subApps] = u8(e[ST.subApps] + 1);
    e[ST.goals] = u8(e[ST.goals] + line.goals);
    e[ST.gf] = u8(e[ST.gf] + gf);
    e[ST.ga] = u8(e[ST.ga] + ga);
    if (gf > ga) e[ST.won] = u8(e[ST.won] + 1);
    if (gf < ga) e[ST.lost] = u8(e[ST.lost] + 1);
    if (mom) e[ST.mom] = u8(e[ST.mom] + 1);
    e[ST.rating] = u16(e[ST.rating] + r);
    e[ST.minutes] = (e[ST.minutes] + line.minutes) | 0;
  }
  // 0x7c12e1: formen – fem nibbles (+0x24..+0x26, nyeste i bit 16..19), skubbes for hver kamp i alle kategorier
  const v = p.cmForm ?? 0;
  p.cmForm = (((v >>> 4) & 0xffff) | (v & 0xf00000) | ((r & 0xf) << 16)) >>> 0;
}

/** 0x7c2150(post, art, standard): snittet af en post (artene 0x12 karakter og 0x14 point pr. kamp porteret; de andre er tællerne) */
export function statValue(e: readonly number[] | undefined, kind: number, def: number): number {
  const f32 = Math.fround;
  if (!e) return kind === 0x12 || kind === 0x14 ? def : 0;                   // 0x7c1f23: ingen post
  const n = e[ST.apps];
  switch (kind) {
    case 0x12:                                                               // 0x7c23b2: karakteren, trukket mod standarden under 20 kampe
      return n < 20 ? f32(((20 - n) * f32(def) + s16(e[ST.rating])) * f32(0.05)) : f32(s16(e[ST.rating]) / n);
    case 0x14: {                                                             // 0x7c2415: point pr. kamp (2·sejre − nederlag + kampe)/kampe
      if (n === 0) return 1.5;
      const pts = 2 * e[ST.won] - e[ST.lost] + n;
      return n < 20 ? f32((pts + (20 - n) * 1.5) * f32(0.05)) : f32(pts / n);
    }
    case 0x11: return n ? f32(s16(e[ST.rating]) / n) : 0;
    case 1: return n;
    case 2: return e[ST.goals];
    default: return 0;
  }
}

/** 0x7c1e30(spillerpost, kategori, art, standard) – kategori 1..6 (100–102 = sammenvejninger af 2–5, ikke brugt af udvælgelsen) */
export function statAvg(p: Player, cat: number, kind: number, def: number): number {
  if (p.regen) return 0;                                                     // 0x7c1ec7: genererede spillere → 0
  return statValue(p.cmStats?.[cat], kind, def);
}

/** 0x7c1950's nibbles (de fem seneste karakterer, ældste først; 0 = ingen kamp) */
export function cmFormRatings(p: Player): number[] {
  const v = p.cmForm ?? 0;
  return [0, 4, 8, 12, 16].map((b) => (v >>> b) & 0xf);
}

/** [0xb74350]+0x10/+0x18: spillets karaktersnit (begge 0 → 6,8) */
export function leagueAverage(g: GameState): number {
  const a = g.cmRatingAvg ?? [680, 100];
  return a[1] ? a[0] / a[1] : 6.8;
}

/** 0x7c5fe0: posterne arkiveres og nulstilles (klubskifte, leje, fritstilling; sæsonslut 0x7c1350). Formen (+0x24..+0x26) bliver. */
export function archiveCmStats(p: Player): void {
  p.cmStats = undefined;
}

// ---------------------------------------------------------------- kontrakten +0x3d/+0x3e/+0x3f/+0x44/+0x45

export interface CmContract { b3d: number; b3e: number; b3f: number; b44: number; b45: number; b4e?: number; b4f?: number }
const s8 = (v: number) => (v << 24) >> 24;
const clamp100 = (v: number) => (v > 100 ? 100 : v < -100 ? -100 : v);

/** 0x4cf720: +0x3d ved en ny kontrakt efter trupstatus (1 → 75, 2 → 50, 3 → 40, ellers 0); tællerne og +0x44/+0x45 fra 0 (*estimeret*: originalen
 *  kopierer dem fra en skabelon/den forrige kontrakt; startværdien af +0x44 i databasens kontrakter er ikke afkodet) */
export function newCmContract(status: number): CmContract {
  return { b3d: status === 1 ? 75 : status === 2 ? 50 : status === 3 ? 40 : 0, b3e: 0, b3f: 0, b44: 0, b45: 0 };
}

const STATUS_CODE: Record<string, number> = { key: 1, first: 2, rotation: 3, backup: 4, prospect: 5, young: 6, surplus: 7 };
/** trupstatus (kontrakt +0x4f >> 4): computerens trupplan 0x83cb40 skriver den i kontrakten (cmSquadPlan.ts); ellers vores Player.squadStatus (0 uden) */
export const statusCode = (p: Player) => (p.cmContract?.b4f !== undefined ? (p.cmContract.b4f >> 4) & 0xf : STATUS_CODE[p.squadStatus ?? ''] ?? 0);
/** manageren sætter trupstatus (menneskets klub): kontraktens +0x4f følger med */
export function setStatusCode(p: Player): void {
  if (p.cmContract?.b4f !== undefined) p.cmContract.b4f = (p.cmContract.b4f & 0xf) | ((STATUS_CODE[p.squadStatus ?? ''] ?? 0) << 4);
}

export function cmContractOf(p: Player): CmContract {
  if (p.cmContract) return p.cmContract;
  const c = newCmContract(statusCode(p));
  // 0x85e960/0x866ee0: +0x4f's lave nibble = hvor flydende spilleren er i klubbens sprog (cmLanguage.ts) – kun med sprogdata (den originale
  // database); høj nibble = trupstatus som statusCode
  if (hasGame() && p.club) { const g = gs(); if (g.nations[p.nation]?.lang) c.b4f = ((statusCode(p) & 0xf) << 4) | contractLanguageNibble(g, p, p.club); }
  return (p.cmContract = c);
}

const sh = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
const daysClamp = (from: string | undefined, today: string) => {
  const d = from ? dayNum(today) - dayNum(from) : 400;
  return d < 0 ? 0 : d > 400 ? 400 : d;
};

/** 0x4cb0a0 (tilfreds med spilletiden): +0x44 += min(10, trunc((+0x3f + 5)/clamp(1 + F·k, 0,01, 2))) og loftet efter flagene */
function happyStep(p: Player, c: CmContract, clubRep: number, age: number): void {
  const F = s16(curRep(p)) - s16(clubRep) + s8(age) * 417 - 11680;
  let x = 1 + (F < 0 ? F * 6.6e-5 : F * 6.666666666666667e-5);
  if (x < 0.01) x = 0.01; else if (x > 2) x = 2;
  // 0x4cb15b: fild (+0x3f + 5); fxch; fdivp st(1) → (+0x3f + 5)/x (ikke x/(…) – rettet 12/11 mod sporet)
  let y = s8(Math.trunc((s8(c.b3f) + 5) / x));
  if (y > 10) y = 10;
  const fl = c.b45;
  let cap = fl & 2 ? 50 : 100;
  for (const bit of [1, 8, 0x20, 0x40, 0x80, 0x100]) { if (cap < -50) break; if (fl & bit) cap = s8(cap - 50); }
  c.b44 = clamp100(s8(c.b44) + y);
  if (c.b44 > cap) c.b44 = cap;
  // 0x4cb1f7–0x4cb238: flag 4/0x10 ryddes (0x8674e0) – flagene sættes af systemer, der ikke er porteret
  if (!((y <= 5 || s8(c.b44) + y <= 0) && s8(c.b3d) < 75 - y)) c.b45 &= ~0x14;
}

/** 0x867700 (STAFF_CONTRACT::apply_event_flags): +0x45 |= flag for en spiller (job 11/13/15 – alle vores), derefter transferønsket (0x8677a0–
 *  0x86781b: ikke klubbens manager/assistent, +0x44 ≥ 0, +0x49 = 0, 0x866f60, ingen aftalt skifte, ikke listet/ønsket (+0x4e & 9), ikke på vej
 *  til fritstilling, over 20 år eller nuværende omdømme over 4250 → 0x4d8610). I spillet kun med en spiller i sammenhængen (flagCtx – de rene
 *  kontrolfunktioner som unhappyCore kører uden). Managerens forhold (+0x59, 0x547af0 "disliked staff", 0x549cf0) findes ikke hos os. */
export function cmFlagSet(c: CmContract, flag: number): void {
  c.b45 = (c.b45 | flag) >>> 0;
  if (flagCtx && flagCtx.depth < 8) requestAfterFlag(flagCtx.g, flagCtx.p, c);
  // 0x867820–0x867915: managerens uven (forholdene – cmRelations.ts cmRelOnFlag)
  if (flagCtx && relFlagHook) relFlagHook(flagCtx.g, flagCtx.p, flag, c.b44, flagCtx.rand);
}
/** 0x867700's forholdsdel (cmRelations.ts registrerer den – ingen cirkulær import) */
let relFlagHook: ((g: GameState, p: Player, flag: number, b44: number, rand: (n: number) => number) => void) | null = null;
export const setRelFlagHook = (h: typeof relFlagHook) => { relFlagHook = h; };
let flagCtx: { g: GameState; p: Player; rand: (n: number) => number; depth: number } | null = null;
/** kør fn med en spiller i sammenhængen, så 0x867700's transferønske kan følge et flag */
export function withFlagCtx<T>(g: GameState, p: Player, rand: (n: number) => number, fn: () => T): T {
  const prev = flagCtx;
  flagCtx = { g, p, rand, depth: prev && prev.p === p ? prev.depth : 0 };
  try { return fn(); } finally { flagCtx = prev; }
}

/** hvad 0x866f60 læser: staff-id, +0x59 Loyalty, +0x5a Pressure, +0x5b Professionalism, +0x5d Temperament, +0x57 Ambition, spillerpostens
 *  nuværende omdømme +0xb, kontraktens begivenheder +0x40 */
export interface LeaveIn { id: number; loy: number; pres: number; prof: number; temp: number; amb: number; repCur: number; b40: number }
/** 0x866f60 STAFF_CONTRACT::wants_to_leave: en score af personligheden, tilfredsheden +0x44 og omdømmet, minus antallet af klagegrupper, mod
 *  klagerne +0x45 (og +0x4e bit 1: listet) – 1 = han beder om at blive sat til salg */
export function wantsToLeave(i: LeaveIn, c: CmContract): boolean {
  const fl = c.b45 >>> 0;
  if (!fl) return false;
  const prof = s8(i.prof), pres = s8(i.pres), loy = s8(i.loy), temp = s8(i.temp), b44 = s8(c.b44);
  let dl = s8((i.id % 7) + loy + pres + prof);
  if (pres === 1) dl = s8(dl - 2);
  if (loy === 1) dl = s8(dl - 3); else if (loy < 6) dl = s8(dl - 1);
  if (prof === 1) dl = s8(dl - 3); else if (prof < 6) dl = s8(dl - 1);
  if (temp === 1) dl = s8(dl - 2);
  dl = s8(dl + (b44 > 75 ? 10 : b44 > 50 ? 5 : b44 > 0 ? 2 : 0));
  const rc = s16(i.repCur);
  if (rc > 7250) dl = s8(dl - 5); else if (rc > 5750) dl = s8(dl - 3);
  let n = 0;
  for (const m of [0x20000, 0x40000, 0x1000002, 0x200600, 0x2840, 0x14]) if (fl & m) n++;
  if (i.b40 & 8 || fl & 0x4582208) n++;
  if (n > 1) {
    dl = s8(dl - 3);
    if (prof < 6) dl = s8(dl - n);
    if (temp < 6) dl = s8(dl - n);
    if (loy === 1) dl = s8(dl + s8(n * -2)); else if (loy < 6) dl = s8(dl - n);
    if (pres < 6) dl = s8(dl - n);
  }
  if (loy < 15 && (c.b4e ?? 0) & 1) return true;
  if (fl & 0x1000002 && loy < 10 && dl < 25) return true;
  if (fl & 0x20020 && dl < 25) return true;
  if (fl & 0x200 && dl < 18) return true;
  if (fl & 4 && s8(i.amb) > 15 && prof < 10) return true;
  if (fl & 0x2808 && loy < 10 && pres < 6 && dl < 30) return true;
  if ((fl & 0x82200 || i.b40 & 8) && prof < 10 && dl < 20) return true;
  if (fl & 0x111) return true;
  return b44 < -70 - loy;
}

/** spillets egne dele af 0x4d8610: prisen (0x4d1600 er ikke porteret – transfers.ts' askingPrice, *estimeret*) og menneskets nyhed (0xbbf – will.ts) */
export interface RequestHooks { asking: (p: Player) => number; human: (p: Player, c: CmContract) => void; isHuman: (club: number) => boolean }
let reqHooks: RequestHooks | null = null;
export function setRequestHooks(h: RequestHooks): void { reqHooks = h; }

function requestAfterFlag(g: GameState, p: Player, c: CmContract): void {
  if (!p.club || s8(c.b44) < 0 || p.contract?.futureClub || (c.b4e ?? 0) & 9) return;
  const rep = curRep(p);
  if (!wantsToLeave({ id: p.id, loy: sh(p, 'loyalty'), pres: sh(p, 'pressure'), prof: sh(p, 'professionalism'), temp: sh(p, 'temperament'), amb: sh(p, 'ambition'),
    repCur: rep, b40: 0 }, c)) return;
  if (!(ageOn(p.dob, g.date) > 20 || rep > 4250)) return;
  handleTransferRequest(p, c);
}
/** 0x4d8610 CONTRACT_MANAGER::handle_transfer_request: computerens klub giver lov (kontrakt +0x4e: bit 2 ryddes, bit 8 sættes) medmindre han er
 *  nøglespiller (status 1) eller prisen er over 1,5 × værdien (0x4d0c60 – hos os Player.value); ellers afslag: rand(+0x44 + 20·(Loyalty + 5)) <
 *  rand(50) → flag 0x10000, og +0x44 += s8(5·Loyalty + 56) (sic: 8 bit). Menneskets klub: en nyhed til manageren (hvis han ikke er på vej væk). */
function handleTransferRequest(p: Player, c: CmContract): void {
  const ctx = flagCtx!;
  if (reqHooks?.isHuman(p.club)) { reqHooks.human(p, c); return; }
  const grant = statusCode(p) !== 1 && !!reqHooks && p.value * 1.5 > reqHooks.asking(p);
  if (grant) {
    c.b4e = (((c.b4e ?? 0) & ~2) | 8) & 0xff;
    if (!MORALE_OFF) cmAdjustMorale(p, 0xc, false, ctx.rand);                 // 0x4d8757: staff_adjust_morale(staff, +12, 0)
    p.wantsAway = true;                                                        // 0x842c00: på klubbernes ønskelister
    return;
  }
  const loy = sh(p, 'loyalty');
  const r1 = ctx.rand(s8(c.b44) + 20 * (s8(loy) + 5)), r2 = ctx.rand(50);
  if (r1 < r2) { ctx.depth++; try { cmFlagSet(c, 0x10000); } finally { ctx.depth--; } }
  if (!MORALE_OFF) cmAdjustMorale(p, -0xc, false, ctx.rand);                  // 0x4d87bd: staff_adjust_morale(staff, −12, 0)
  c.b44 = clamp100(s8(c.b44) + s8(s8(loy * 5) + 0x38));
}
/** 0x8674e0 (clear_grievances): +0x45 &= ~flag, så 0x867240 (trækker et transferønske tilbage – kræver +0x4e & 8, som vi ikke har) */
export function cmFlagClear(c: CmContract, flag: number): void { c.b45 = (c.b45 & ~flag) >>> 0; }

/** Hvad 0x4cb250 læser ud over kontrakten (alt i originalens skala) */
export interface UnhappyIn {
  /** staff +0x18 alder, +0x57 Ambition, +0x59 Loyalty, +0x22 landskampe; spillerposten +0xb nuværende og +0xd verdensomdømme (0..10000) */
  age: number; amb: number; loyalty: number; caps: number; repCur: number; repWorld: number;
  /** club +0x80 (klubben i kaldet), nation +0x8e (spillerens land) */
  clubRep: number; nationRep: number;
  /** A: dage siden han kom til klubben (staff +0x3e), B: siden kontrakten (+0x2d) – begge 0..400 */
  daysAt: number; daysContract: number;
  status: number;
  /** 0x62c400 (0/1/2), lejekontrakt (0x4cf6d0 ≠ 0), karrieren slutter (0x7a7eb0 ≠ 0), kontrakt +0x49, placeringen 0x4cbb60 (1 reserver, 2 førsteholdet) */
  injury: number; onLoan: boolean; retiring: boolean; b49: number; placement: number;
  /** kontraktklubbens land har en række i sæsontabellen 0xb63d60 (0x669340 < 0x23), og i dag ligger efter dens start og før dens slut */
  inSeason: boolean;
}
/** 0x4cb250 (utilfreds): +0x44 −= x = trunc((+0x3e + 4)/clamp(1 − F·k, 0,1, 10) + 0,5). F af omdømmet mod klubbens, dagene i klubben (A) og siden
 *  kontrakten (B, begge højst 400 – B ≤ 400 gør grenen for 24–31-årige død, som i originalen), alderen, landskampe/landets omdømme og trupstatus.
 *  Flagene (0x4cb4c9–0x4cb90a): skadet/lejet/stopper/under 18/+0x49 → 4 og 0x10 ryddes; ellers, når x > 5 og +0x44 − x < −30 − Loyalty: op til 21 år
 *  på førsteholdet (0x4cbb60 = 1, sic) med rand(Ambition) > 5 og omdømmet over klubbens og 1250 → 0x10; ældre med omdømmet over klubbens og 2250
 *  → 4 i sæsonen; ellers på førsteholdet med omdømmet over 1250, over 23 år og rand(Loyalty + 5) = 0 → 0x10; ellers verdensomdømmet over klubbens
 *  − 1500 og 500, rand(Ambition) ≠ 0 og +0x3d < 0 → 4 i sæsonen. 4 ryddes altid før det sættes. */
export function unhappyCore(i: UnhappyIn, c: CmContract, rand: (n: number) => number): void {
  const age = s8(i.age);
  let F = s16(i.repCur) - s16(i.clubRep) + 50 * i.daysAt + age * 417 - 31680;
  let capped = true;
  const amb = s8(i.amb);
  if (i.daysContract > 400 && age > 23 && age < 32) F += 250 * amb + 5000;
  else if (u8(i.caps) && i.nationRep > 3500 && age < 32) F += 250 * amb + 25 * u8(i.caps) + 2500;
  else if (i.status === 1) F += 250 * amb + 5000;
  else if (i.status === 2) F += 125 * amb + 2500;
  else if (i.status === 3) F += 1000 * s8(c.b3e);
  else capped = false;
  if (capped && F >= 15000) F = 15000;
  let G = 1 - (F < 0 ? F * 0.0006666666666666666 : F * 6e-5);
  if (G < 0.1) G = 0.1; else if (G > 10) G = 10;
  // 0x4cb4ab: fild (+0x3e + 4); fxch; fdivp st(1) → (+0x3e + 4)/G + 0,5 (rettet 12/11 mod sporet ct3: 0x4cb250 kald for kald)
  const x = s8(Math.trunc((s8(c.b3e) + 4) / G + 0.5));
  if (i.injury !== 0 || i.onLoan || i.retiring || age < 18 || i.b49 !== 0) {    // 0x4cb8f1
    if (c.b45 & 4) cmFlagClear(c, 4);
    if (c.b45 & 0x10) cmFlagClear(c, 0x10);
  } else if (x > 5 && s8(c.b44) - x < -30 - s8(i.loyalty)) {
    const rc = s16(i.repCur), cr = s16(i.clubRep);
    if (age <= 21) {                                                         // 0x4cb8a0
      if (i.placement === 1 && rand(amb) > 5 && rc > cr && rc > 1250) { cmFlagClear(c, 4); cmFlagSet(c, 0x10); }
    } else if (rc > cr && rc > 2250) {                                       // 0x4cb574
      if (i.inSeason) { cmFlagClear(c, 4); cmFlagSet(c, 4); }
    } else if (i.placement === 1 && rc > 1250 && age > 23 && rand(s8(i.loyalty) + 5) === 0) {   // 0x4cb6df
      cmFlagClear(c, 4); cmFlagSet(c, 0x10);
    } else if (s16(i.repWorld) > cr - 1500 && s16(i.repWorld) > 500 && rand(amb) !== 0 && s8(c.b3d) < 0) {   // 0x4cb72b
      if (i.inSeason) { cmFlagClear(c, 4); cmFlagSet(c, 4); }
    }
  }
  c.b44 = clamp100(s8(c.b44) - x);
}

/** spillets oplysninger til 0x4cb250 (de ikke porterede systemer: lejekontrakten = Player.loan, karrierens slut = Player.cmRetire, +0x49 = 0) */
export interface CmPlayerCtx {
  /** 0x62c400 – konditionsmodulet */
  injury?: (p: Player) => number;
  /** sæsontabellen (cmFitness.ts clubSeason) for klubbens land */
  inSeason?: (club: number) => boolean;
  /** 0x62ed70: den nuværende skades +0x2c-tæller (null = ingen skade) */
  injuryW2c?: (p: Player) => number | null;
  /** 0x62c3d0: trætheden (konditionspostens +0xc, uden opdatering) */
  fatigue?: (p: Player) => number;
}
let pctx: CmPlayerCtx = {};
/** konditionsmodulet sætter sine aflæsninger her (cmFitnessGame.ts – undgår en cirkulær import) */
export function setCmPlayerCtx(c: CmPlayerCtx): void { pctx = c; }

/** 0x4cbb60 CONTRACT_MANAGER::get_squad_placement: 1 reserverne, 2 førsteholdet (staff +0x5e bit 0 – sat af 0x83cb40; hos os Player.reserves),
 *  0 for klubber uden reservehold (0x542740: B-hold, spanske, tyske og portugisiske klubber m.fl. – *estimeret*: kun landene) */
const NO_RESERVES = new Set(['Spain', 'Germany', 'Portugal']);
export function squadPlacement(g: GameState, p: Player, club: number): number {
  const c = g.clubs?.[club];
  if (!c || p.club !== club || NO_RESERVES.has(g.nations[c.nation]?.name ?? '')) return 0;
  return p.cmPlace ?? (p.reserves ? 1 : 2);
}

function unhappyStep(g: GameState, p: Player, c: CmContract, club: number, clubRep: number, age: number, today: string, nationRep: number, rand: (n: number) => number): void {
  const days = p.joined ?? p.cmJoined;   // staff +0x3e: skiftet i spillet går forud for databasens dato
  const rep = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
  withFlagCtx(g, p, rand, () => unhappyCore({
    age, amb: sh(p, 'ambition'), loyalty: sh(p, 'loyalty'), caps: p.caps, repCur: curRep(p), repWorld: Math.round(rep[2] * 50), clubRep, nationRep,
    daysAt: daysClamp(days, today), daysContract: daysClamp(days, today), status: statusCode(p),
    injury: pctx.injury?.(p) ?? (p.injury ? 2 : 0), onLoan: !!p.loan, retiring: !!p.cmRetire, b49: 0, placement: squadPlacement(g, p, club),
    // 0x4cb5d0: kontraktklubbens land (den primære kontrakt – hos os spillerens klub)
    inSeason: p.club ? pctx.inSeason?.(p.club) ?? false : false,
  }, c, rand));
}

/** spillerpostens nuværende omdømme +0xb (0..10000) */
export function curRep(p: Player): number {
  return Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[1] * 50);
}

/** 0x4ca6d0 for en spiller, der spillede (starter eller indskiftet): +0x3d af minutterne, +0x3e/+0x3f og +0x44. `minutes` = 0x4ca6d0's bl:
 *  startere 90 eller minuttet for udvisningen/skaden (+0x30), indskiftede 90 − indskiftningsminuttet. Kun klubkampe (ikke landskampe). */
export function contractAfterMatch(g: GameState, p: Player, o: { starter: boolean; minutes: number; injured: boolean; condition: number; won: boolean; lost: boolean;
  clubRep: number; nationRep: number; seed: number; rand?: (n: number) => number; club?: number }): void {
  const c = cmContractOf(p);
  const age = ageOn(p.dob, g.date);
  const rand = o.rand ?? cmRand(g.seed, p.id, dayNum(g.date), o.seed);
  const bl = s8(o.minutes);
  // 0x4caa92: +0x3d af spilletiden (d = trunc(10·min/90))
  const d = s8(Math.trunc((bl * 10) / 90));
  if (s8(c.b3d) > 50) c.b3d = clamp100(s8(c.b3d) + d);
  else c.b3d = s8(c.b3d) + d > 50 ? 50 : clamp100(s8(s8(c.b3d) + d));
  // 0x4cab0f: en starter med mindst 31 minutter (eller skadet/træt) er tilfreds; ellers rand(30) to gange
  let content = o.starter && (bl > 30 || o.injured || o.condition < 70);
  if (!content) {
    const r1 = rand(30), r2 = rand(30);
    content = !(r1 + 45 - s8(c.b44) * 0.30303030303030304 - r2 > bl);
  }
  if (content) {
    c.b3e = 0; if (c.b3f !== 100) c.b3f = u8(c.b3f + 1);
    happyStep(p, c, o.clubRep, age);
  } else {
    c.b3f = 0; if (c.b3e !== 100) c.b3e = u8(c.b3e + 1);
    c.b3d = clamp100(s8(c.b3d) - 4);
    unhappyStep(g, p, c, o.club ?? p.club, o.clubRep, age, g.date, o.nationRep, rand);
  }
  // 0x4cac6a: sejr/nederlag – rand(21 − Ambition) < 4 → +0x44 ±3
  if (o.won || o.lost) { if (rand(21 - s8(sh(p, 'ambition'))) < 4) c.b44 = clamp100(s8(c.b44) + (o.won ? 3 : -3)); }
}

/** 0x4cb250(staff, klub, kontrakt) udefra (computerens trupplan 0x83cb40 ved første kald) */
export function cmUnhappy(g: GameState, p: Player, club: number): void {
  const c = cmContractOf(p);
  unhappyStep(g, p, c, club, clubRepMem(g, club), ageOn(p.dob, g.date), g.date, nationRepMem(g, p.nation), cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x83cb40, 0x4cb250));
}

/** 0x4cae7d: truppens spillere, der ikke spillede (ikke skadede, udelukkede eller udlejede): +0x3f = 0, +0x3e += 1, +0x3d −= 8, 0x4cb250.
 *  (0x4cbd20 – transferlisten efter 8/14 kampe uden spilletid – er ikke porteret.) */
export function contractNotPlayed(g: GameState, p: Player, clubRep: number, nationRep: number, club = p.club, seed = 0): void {
  const c = cmContractOf(p);
  c.b3f = 0; if (c.b3e !== 100) c.b3e = u8(c.b3e + 1);
  c.b3d = clamp100(s8(c.b3d) - 8);
  unhappyStep(g, p, c, club, clubRep, ageOn(p.dob, g.date), g.date, nationRep, cmRand(g.seed ?? 0, p.id, dayNum(g.date), seed, 0x4cb250));
}

// ---------------------------------------------------------------- efter kampen (sim.ts applyMatchResult)

/** Klubbens omdømme i originalens skala (club +0x80): databasens rå værdi, ellers vores 0–100 ×100 (*estimeret*) */
export function clubRepMem(g: GameState, club: number): number {
  return g.cmClubRep?.[club] ?? (g.clubs[club]?.rep ?? 50) * 100;
}
/** landets omdømme (nation +0x8e) */
export const nationRepMem = (g: GameState, nation: number) => g.cmNationRep?.[nation] ?? 0;

/** v/50 som den double, hvis ·50 trunkeret giver v igen (aiTeam.ts playerRecord skriver cmRepMem·50 med & 0xff/>> 8, dvs. mod nul) */
export function repMemOf(v: number): number {
  let x = v / 50;
  const b = new DataView(new ArrayBuffer(8));
  for (let k = 0; k < 8 && Math.trunc(x * 50) !== v; k++) {
    b.setFloat64(0, x); b.setBigInt64(0, b.getBigInt64(0) + 1n); x = b.getFloat64(0);   // én ulp væk fra nul
  }
  return x;
}

/** gittermotorens kamprapport (MatchReport.cmPost, engine/grid/postMatch.ts – originalens 0x6d1cc0/0x6d26b0): moralen (MATCH_PLAYER +0x17 →
 *  spillerposten +0x45 = Player.morale), omdømmet (+0x49/+0x47/+0x4b → +9/+0xb/+0xd = cmRepMem ·50) og klubbens omdømme (engine+0x1d6 →
 *  club +0x80 = cmClubRep). Originalen overfører dem i 0x6b5f00 før 0x4ca6d0/0x7c0d70 (0x6b6cc0 kommer først) – derfor først her. */
/** cmBoardGame.ts registrerer managerens omdømme (undgår en cirkulær import) */
export const postHooks: { managerRep?: (g: GameState, club: number, v: [number, number, number]) => void } = {};
export function cmApplyPost(g: GameState, f: Fixture, rep: MatchReport): void {
  const post = rep.cmPost;
  if (!post) return;
  for (const [id, v] of Object.entries(post.players)) {
    const p = g.players[+id]; if (!p) continue;
    p.morale = v.morale;
    p.cmRepMem = [repMemOf(v.rep[0]), repMemOf(v.rep[1]), repMemOf(v.rep[2])];
  }
  // 0x6b6cc0: managerens omdømme (og en fjerdedel til assistenten og trænerne) FØR klubbens omdømme
  if (post.managers) [f.home, f.away].forEach((c, i) => { const v = post.managers![i]; if (v) postHooks.managerRep?.(g, c, v); });
  if (g.cmClubRep) [f.home, f.away].forEach((c, i) => { const v = post.clubRep[i]; if (v !== null) g.cmClubRep![c] = v; });
}

/** 0x7c0d70 + 0x4ca6d0 for en klubkamp: statistik pr. kategori, formen, karaktersnittet og kontraktens tællere for begge hold. */
export function cmAfterMatch(g: GameState, f: Fixture, rep: MatchReport, squadOf: (club: number) => Player[]): void {
  if (!cmActive(g)) return;
  cmApplyPost(g, f, rep);
  const cat = statCategory(g, f);
  const goals = [rep.stats[0].goals, rep.stats[1].goals];
  const played = new Set<number>();
  for (const line of rep.players) {
    const p = g.players[line.id]; if (!p) continue;
    played.add(p.id);
    const gf = goals[line.team], ga = goals[1 - line.team];
    recordPlayerMatch(g, p, cat, line, gf, ga, rep.mom === p.id);
    const club = line.team === 0 ? f.home : f.away;
    const mins = line.sub ? Math.max(0, line.minutes) : line.red || line.injured ? line.minutes : 90;
    contractAfterMatch(g, p, { starter: !line.sub, minutes: mins, injured: line.injured, condition: line.cond ?? 100, won: gf > ga, lost: gf < ga,
      clubRep: clubRepMem(g, club), nationRep: nationRepMem(g, p.nation), seed: f.id, club });
  }
  for (const club of [f.home, f.away]) {
    for (const p of squadOf(club)) {
      if (played.has(p.id) || p.regen || p.injury || p.banned > 0 || p.loan) continue;
      contractNotPlayed(g, p, clubRepMem(g, club), nationRepMem(g, p.nation), club, f.id);
    }
  }
}

// ---------------------------------------------------------------- dagen: 0x5ce2d0's kontraktdel og klubtabellen [0xae2d14]

/** 0x544520(staff, 0): kontrakt +0x4e & 9 – transferlistet (bit 1, 0x842320 – computerens trupplan; menneskets egen listning = Player.listed)
 *  eller transferønske (bit 8, 0x4d8610 – will.ts' anmodninger i ægte tilstand) */
export const listedOrRequest = (p: Player) => !!p.listed || !!((p.cmContract?.b4e ?? 0) & 9);

/** Comp_Stats' +0x72 for klubben i dens liga: placeringen i sæsonens udgangsrækkefølge – klubberne fra ligaen selv efter sidste sæsons placering
 *  (club.dat +0x5b/+0x5f ved spilstart, derefter den afsluttede sæsons tabel – season.ts), så de nye (op/ned) efter deres (*estimeret*: i oraklet
 *  1..20 som en permutation, men rækkefølgen for de oprykkede og ved lige placeringer er ikke målt) */
export function lastRank(g: GameState, league: string, club: number): number {
  const comp = g.comps[league];
  if (!comp) return 0;
  const cid = +(league.match(/(\d+)$/)?.[1] ?? NaN);
  const key = (id: number): [number, number] => {
    const s = g.cmClubStat?.[id];
    const lp = s && s.length > 3 ? s[3] ?? 0 : 0;
    return [s && s.length > 3 && s[2] === cid ? 0 : 1, lp > 0 ? lp : 99];
  };
  const order = comp.clubs.slice().sort((a, b) => { const ka = key(a), kb = key(b); return ka[0] - kb[0] || ka[1] - kb[1]; });
  return order.indexOf(club) + 1;
}
/** 0x5cd61d–0x5cd75f: klubbens stemning [0xae2d14] + 6·klub + 4 (målt mod oraklet 1.648/1.648 uge-værdier af originalens input): efter mindst 9
 *  kampe (Comp_Stats +4) trunc((+0x72 − placeringen +0x73)·w), w = 22/antal hold (turneringens +0x3e); i en liga med omdømme ≥ 10 og klubomdømme over
 *  500·ligaens: w = (((omd − 500·liga) + (omd − 5000))·0,0002 + 1)·w)^1,5. Nr. 1–2 (og 3–4 i ligaer, hvis virtuelle 0x98 svarer ja – i oraklet
 *  Division 1, ikke Premier League; hos os ligaer under øverste niveau, *estimeret*) får højst −1. Ellers 0. */
function clubMood(g: GameState, c: { id: number; league: string }): number {
  const lg = g.leagues[c.league];
  const comp = g.comps[c.league];
  if (!lg || lg.hidden || !comp || comp.type !== 'league') return 0;
  const rows = sortTable(comp.table);
  const i = rows.findIndex((r) => r.club === c.id);
  if (i < 0 || rows[i].p <= 8) return 0;
  const cr = g.cmCompRep?.[+(c.league.match(/(\d+)$/)?.[1] ?? NaN)] ?? 0;
  return moodValue(rows[i].p, lastRank(g, c.league, c.id), i + 1, comp.clubs.length, cr, clubRepMem(g, c.id), lg.tier > 1);
}
/** 0x5cd638–0x5cd745 som ren funktion: kampe, +0x72, placeringen +0x73, holdene (+0x3e), ligaens og klubbens omdømme, og om ligaen svarer ja i 0x98 */
export function moodValue(played: number, x72: number, pos: number, teams: number, compRep: number, clubRep: number, floor5: boolean): number {
  if (played <= 8) return 0;
  const cr = s16(compRep), rep = s16(clubRep);
  let w = teams > 0 ? 22 / teams : 1;
  if (cr >= 10 && rep > 500 * cr) w = Math.pow(((rep - 500 * cr) + (rep - 5000)) * 0.0002 * w + w, 1.5);
  let v = s8(Math.trunc((x72 - pos) * w));
  if ((pos < 3 || (floor5 && pos < 5)) && v < -1) v = -1;
  return v;
}
/** som competitions.ts sortTable (point, målforskel, scorede mål; ens rækker efter klub-id i stedet for navnet) – uden den cirkulære import */
function sortTable(rows: { club: number; p: number; pts: number; gf: number; ga: number }[]) {
  return rows.slice().sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.club - b.club);
}

/** [0xae2d14] + 6·klub +5 – 0x5cccd0 (hver dag med dag-i-året % 7 = 0, 0x5cd776–0x5cd82e): truppens spillere med klager (+0x45 ≠ 0) og trupstatus
 *  1–3, verdensomdømme over 4750 eller +0x3d over 65, hvis kontrakt er med klubben (ikke dem med begivenhed +0x40 = 4 og Professionalism ≥ 10 –
 *  +0x40 har vi ikke). Kun klubber i et land med kontinent (+0x71), som ikke er landshold, og som enten spiller i en aktiv liga eller har omdømme
 *  ≥ 4500 (0x5cd5bd–0x5cd602). +4 = stemningen (clubMood, g.cmClubMood). */
function clubGrievanceCounts(g: GameState, squadOf: (club: number) => Player[]): void {
  const tab: Record<number, number> = (g.cmClubUnhappy = {});
  const mood: Record<number, number> = (g.cmClubMood = {});
  for (const c of Object.values(g.clubs)) {
    const active = !!c.league && !g.leagues[c.league]?.hidden;
    if (!active && clubRepMem(g, c.id) < 4500) continue;
    mood[c.id] = clubMood(g, c);
    let n = 0;
    for (const p of squadOf(c.id)) {
      const k = p.cmContract;
      if (!k || !k.b45 || p.regen || p.loan) continue;
      const st = statusCode(p);
      const wr = Math.round((p.cmRepMem ?? p.cmRep ?? [0, 0, p.rep * 2])[2] * 50);
      if (st === 1 || st === 2 || st === 3 || wr > 4750 || s8(k.b3d) > 65) n = (n + 1) & 0xff;
    }
    tab[c.id] = n;
  }
}

/** 0x5ce2d0 for én spiller med kontrakt (esi) i sin klub (edi) – de dele, der skriver +0x44/+0x45, og som kun læser det, vi har:
 *  R1 0x5cf8c8 (+5 for professionelle uden klager, ikke listet, i en klub uden utilfredse nøglespillere), R3 0x5d115b (skadet med +0x2c > 14 →
 *  0x10 ryddes), R4 0x5d1327 (trupstatus 7 over 21 år, rand(20) = 0 → −50 og 0x10), R5 0x5d23a6 (0x10/4 ryddes efter +0x3f kampe i træk med
 *  tilfredsstillende spilletid) og R6 0x5d28f8 (+0x49/stopper/ikke-spillerjob → 0x10 og 2 ryddes). Ikke porteret (systemer, vi ikke har): de øvrige
 *  klager (+0x45 0x1/0x2/0x8/0x20/0x40… – kontraktlængden, lønnen, forholdet til manageren, mediehistorierne 0x72c1f0, begivenhederne +0x40),
 *  stemningens +5 (0x5cf923, kræver klubtabellens +4), transferønsket 0x4d8610. */
function contractDayPlayer(g: GameState, p: Player, c: CmContract, rand: (n: number) => number): void {
  const club = p.club;
  const age = s8(ageOn(p.dob, g.date));
  // R1 0x5cf8c8–0x5cf923
  if (c.b45 === 0 && !listedOrRequest(p) && (g.cmClubUnhappy?.[club] ?? 0) === 0 && s8(sh(p, 'professionalism')) > 14) c.b44 = clamp100(s8(c.b44) + 5);
  // R2 0x5cf923: ingen klager, klubbens stemning +4 over 2 og Loyalty over 10 → +5
  if (c.b45 === 0 && club && (g.cmClubMood?.[club] ?? 0) > 2 && s8(sh(p, 'loyalty')) > 10) c.b44 = clamp100(s8(c.b44) + 5);
  // 0x5cfa64: en skade med +0x2c > 30 springer til 0x5d2392
  const w2c = pctx.injuryW2c?.(p) ?? null;
  if (!(w2c !== null && s16(w2c) > 30)) {
    // R6 0x5d1119–0x5d1155: +0x49 (0), karrieren slutter (0x7a7eb0) og ikke-spillerjob findes ikke hos os ud over cmRetire
    if (p.cmRetire) { cmFlagClear(c, 0x10); cmFlagClear(c, 2); }
    // R3 0x5d115b: skadet (0x62c400 = 2) med +0x2c > 14
    else if ((pctx.injury?.(p) ?? 0) === 2 && w2c !== null && s16(w2c) > 14) cmFlagClear(c, 0x10);
    // R4 0x5d1327 (trupstatus 0 → 0x5d11aa's kontraktforlængelse – ikke porteret)
    else if (statusCode(p) !== 0 && !listedOrRequest(p) && statusCode(p) === 7 && !(c.b45 & 0x10) && !(c.b45 & 4) && rand(20) === 0 && age > 21
      && (p.pos[0] !== 20 || age > 24 + ((p.id % 4) | 0))) {
      c.b44 = clamp100(s8(c.b44) - 50);
      cmFlagSet(c, 0x10);
    }
  }
  // R5 0x5d23a6/0x5d23e6 ([esp+0x7c] – 0x540a50's B-holdsflag – er 0)
  const amb = s8(sh(p, 'ambition')), tmp = s8(sh(p, 'temperament')), b3f = s8(c.b3f);
  const settled = (amb > 15 && tmp < 6 && b3f > 3) || (amb > 10 && tmp < 10 && b3f > 2) || b3f > 1;
  if (c.b45 & 0x10 && settled) cmFlagClear(c, 0x10);
  if (c.b45 & 4 && settled) cmFlagClear(c, 4);
  // 0x5d2fb3: klubbens sprog læres (kontraktens +0x4f lave nibble og sprogtabellen – cmLanguage.ts)
  languageDay(g, p, c, rand);
}

/** 0x5cccd0's klubtabel (ugentlig) og 0x5ce2d0 for alle spillere med kontrakt – hver dag (sim.ts newDay). Spillere i en klub i en aktiv liga
 *  (eller med verdensomdømme ≥ 4750) hver dag, de øvrige på dag id % 365, +120 og +240 (0x5ce412–0x5ce496). Egen talrække pr. spiller og dag. */
export function cmContractDaily(g: GameState, squadOf: (club: number) => Player[]): void {
  if (!cmActive(g)) return;
  const d = new Date(`${g.date}T00:00:00Z`), y = d.getUTCFullYear();
  const doy = Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000);
  if (doy % 7 === 0 || !g.cmClubUnhappy) clubGrievanceCounts(g, squadOf);
  const day = dayNum(g.date);
  for (const p of Object.values(g.players)) {
    if (p.regen || !p.club || !p.contract) continue;
    const c = p.cmContract; if (!c) continue;
    const cl = g.clubs[p.club];
    const active = !!cl?.league && !g.leagues[cl.league]?.hidden;
    const a = p.id % 365, b = (a + 120) % 365, e = (b + 120) % 365;
    if (!active && doy !== a && doy !== b && doy !== e && Math.round((p.cmRepMem ?? p.cmRep ?? [0, p.rep * 2, 0])[1] * 50) < 4750) continue;
    const rand = cmRand(g.seed, p.id, day, 0x5ce2d0);
    if (!STAFF_STATE_OFF) staffStateDay(g, p, c, rand);                                // 0x5ce4b6–0x5cf481 kommer før kontraktdelen 0x5cf57c
    if (!MORALE_OFF) moraleDay(g, p, rand);                                             // 0x5cf4c8–0x5cf578
    withFlagCtx(g, p, rand, () => contractDayPlayer(g, p, c, rand));
  }
}

// ---------------------------------------------------------------- moralen (spillerposten +0x45) – runde 10A

/** MORALE_OFF: til målinger – den daglige moral (0x5cf4c8) slået fra (spillets egen glidning mod 13 bruges så heller ikke) */
export let MORALE_OFF = false;
export const setMoraleOff = (v: boolean) => { MORALE_OFF = v; };

/** staff_adjust_morale 0x544710(staff, d, flag): m = spillerposten +0x45; d > 0 og m + d > 10: rand(21) < m + d → m + rand(d + 1), ellers m + d;
 *  d < 0 og m + d < 10: rand(trunc((Influence +0x2f + Pressure + Determination)/3)) > m + d → m + rand(d − 1), ellers m + d; 1..20; flag og d > 0 med
 *  kontraktklager (+0x45 ≠ 0): aldrig over m. Returnerer, om moralen ændrede sig. */
export function cmAdjustMorale(p: Player, d: number, flag: boolean, rand: (n: number) => number): boolean {
  d = s8(d);
  if (!d) return false;
  const m = s8(Math.round(p.morale ?? 10));
  let v: number;
  if (d > 0 && m + d > 10) v = rand(0x15) < m + d ? s8(rand(d + 1) + m) : s8(m + d);
  else if (d < 0 && m + d < 10) {
    const k = Math.trunc((s8(sh(p, 'influence')) + s8(sh(p, 'pressure')) + s8(sh(p, 'determination'))) / 3);
    v = rand(k) > m + d ? s8(rand(d - 1) + m) : s8(m + d);
  } else v = s8(m + d);
  v = v < 1 ? 1 : v > 0x14 ? 0x14 : v;
  if (flag && d > 0 && (p.cmContract?.b45 ?? 0) !== 0 && v >= m) v = m;
  p.morale = v;
  return v !== m;
}

/** game_spread_squad_morale_by_leadership 0x5ce0b0 (dagligt efter 0x5ce2d0, 0x5cd9f6): for hver klub (ikke landshold, 0x53b900) med rand(7) = 0:
 *  over truppens pladser (+0xd7) – databasens spillere (id < [0xae2364]) i klubben med spillerpost: I = Σ Influence (+0x2f), S = Σ kontrakt
 *  +0x44·Influence (kun med kontrakt), n = antal; n < 16 → I += 10·(16 − n). I ≠ 0: for hver (kontrakt +0x44 eller 0): r = u8(rand(trunc(2S/
 *  (Influence + I))) + rand(trunc(+0x44/6))); r < 0 og rand(r) < rand(−5) → 0x544710(staff, −1, 1); r > 0 og rand(r) > rand(5) → (+1, 1). */
export function cmSquadMoraleDaily(g: GameState, squadOf: (club: number) => Player[]): void {
  if (!cmActive(g) || MORALE_OFF) return;
  const day = dayNum(g.date);
  for (const cl of Object.values(g.clubs)) {
    if (!cl) continue;
    const rand = cmRand(g.seed, cl.id, day, 0x5ce0b0);
    if (rand(7) !== 0) continue;
    const ps = squadOf(cl.id).filter((p) => !p.regen).slice(0, 50);
    let I = 0, S = 0, n = 0;
    for (const p of ps) { const c = p.contract ? p.cmContract : undefined; if (!c) continue; const inf = s8(sh(p, 'influence')); I += inf; S += s8(c.b44) * inf; n++; }
    if (n < 16) I += 10 * (16 - n);
    if (!I) continue;
    for (const p of ps) {
      const b44 = s8((p.contract ? p.cmContract?.b44 : 0) ?? 0);
      const inf = s8(sh(p, 'influence'));
      const r = s8(rand(Math.trunc((2 * S) / (inf + I))) + rand(Math.trunc(b44 / 6)));
      if (r < 0) { if (rand(r) < rand(-5)) cmAdjustMorale(p, -1, true, rand); }
      else if (r > 0) { if (rand(r) > rand(5)) cmAdjustMorale(p, 1, true, rand); }
    }
  }
}

/** 0x5ce2d0 0x5cf4c8–0x5cf578: rand(10) = 0 → målet bl = 10, i en liga med tabel og under 10 kampe (Comp_Stats +4) 10 + rand(10 − kampe);
 *  +3 hvis klubben har spilleren blandt sine yndlingspersoner (club +0x9b/+0x9f/+0xa3, 0x547790), −3 blandt de uønskede (+0xa7/+0xab/+0xaf,
 *  0x5477d0 – Club.cmPrefs, databasens club.dat +155..+175); moralen ≠ bl → 0x544710(staff, trunc((m + bl)/2) − m, 1) */
function moraleDay(g: GameState, p: Player, rand: (n: number) => number): void {
  if (rand(0xa) !== 0) return;
  let bl = 10;
  const lg = p.club ? g.comps[g.clubs[p.club]?.league ?? ''] : undefined;
  const row = lg?.type === 'league' ? lg.table.find((r) => r.club === p.club) : undefined;
  if (row && (row.p & 0xff) < bl) bl = s8(rand(10 - (row.p & 0xff)) + 10);
  // 0x5cf52e/0x5cf541: klubbens personer club +0x9b.. (+3) / +0xa7.. (−3) – databasens club.dat +155..+175 (cmRelations.ts)
  const cp = p.club ? g.clubs[p.club]?.cmPrefs : undefined;
  if (cp && (cp[0] === p.id || cp[1] === p.id || cp[2] === p.id)) bl = s8(bl + 3);
  else if (cp && (cp[3] === p.id || cp[4] === p.id || cp[5] === p.id)) bl = s8(bl - 3);
  const m = s8(Math.round(p.morale ?? 10));
  if (m !== bl) cmAdjustMorale(p, s8(Math.trunc((m + bl) / 2) - m), true, rand);
}

// ---------------------------------------------------------------- staffposten [0xae2d0c] + 79·id + 0xa ("indkøringsbyten")
//
// Én byte pr. person (0..255, i hukommelsen u8), som sub_6ec010 trækker fra kamp-CA'en (og > 8 med Professionalism < 15 svækker 6 kampfloats).
// Skrivere (afkodet 12/11-2026, runde 9 – notes/staff-state.md):
//   0x828110 (spilstarten, 0x828548–0x8286aa)  nyankomne: 26/21 − Adaptability/2 − rand(Adaptability/2), højst CA·0,15
//   0x5ce2d0 (dagligt, 0x5ce4b6–0x5cf481)      klager, træthed, unge, roller → + rand(…); henfaldet 0x5cf41a
//   0x62c680 (0x62ca1f, konditionsmodulet)     pr. feriedag rand(Professionalism/3 + 2) = 0 → +1 (< 50) – cmFitness.ts
//   0x62d250 (0x62d705, ny skade)              pr. skadedag rand(5·Natural Fitness + 12) = 0 → +1 (< 100) – cmFitness.ts
//   0x8c9720 (klubskiftet, 0x8ca549–0x8ca618)  rand(20 − Adaptability) + rand(20 − Influence) + rand(omdømmeforskel/(20·Pressure)), ganget med
//                                              1,5 − 0,1·sprogets flydenhed 0x7c6830 (runde 10A – cmStaffStateMove, kaldt af setClub)
// Ikke porteret: 0x41a360 (AWOL, +rand(10)), 0x736c00 (mediehistorier, = 0) og disciplinen 0x5a5980 (bøder).

/** TRANSFER_MANAGER::move_player_to_club 0x8c9720 for en spiller med spillerpost (0x8ca23e) i et spil i gang (ikke spilstartens fordeling):
 *  klubbernes omdømme +0x80 (0x8ca28d–0x8ca334: ny klub + trunc(verdensomdømme +0xd/100), højst 10000; den gamle − trunc(+0xd/100)), så
 *  staffState (0x8ca3f8–0x8ca618): forskel = max(ny klubs +0x80 − gamle klubs +0x80 (uden gammel klub: postens hjemmeomdømme +0xb), 0);
 *  bl = u8(rand(20 − Adaptability) + rand(20 − Influence +0x2f) + rand(s16(forskel)/max(20·Pressure, 1))), ftol(bl·(1,5 − 0,1·0x7c6830(spiller,
 *  ny klub, klubbens sprog +0x77))) som byte, højst 100, lagt til byten (u8). */
export function cmStaffStateMove(g: GameState, p: Player, from: number, to: number): void {
  if (!cmActive(g) || p.regen || g.cmFitStart === undefined || !to) return;
  const world = s16(Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[2] * 50));
  const reps = g.cmClubRep;
  if (reps) {
    if (reps[to] !== undefined) reps[to] = Math.min(10000, s16(reps[to] + Math.trunc(world / 100)));
    if (from && reps[from] !== undefined) reps[from] = s16(reps[from] + Math.trunc(-world / 100));
  }
  if (STAFF_STATE_OFF) return;
  const home = s16(Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[1] * 50));
  const newRep = s16(reps?.[to] ?? 0);
  let diff = newRep - (from ? s16(reps?.[from] ?? 0) : home);
  if (diff < 0) diff = 0;
  let ebp = 20 * shi(p, 'pressure');
  if (ebp < 1) ebp = 1;
  const rand = cmRand(g.seed, p.id, Math.round(Date.parse(g.date + 'T00:00:00Z') / 86400000), 0x8c9720);
  let bl = u8b(rand(20 - shi(p, 'adaptability')));
  bl = u8b(bl + rand(20 - s8(sh(p, 'influence'))));
  bl = u8b(bl + rand(Math.trunc(s16(diff) / ebp)));
  const L = g.nations[g.clubs[to]?.nation ?? -1]?.lang?.[0] ?? 0;
  const fl = s8(languageFluency(g, p, to, L));
  let v = Math.trunc(bl * (1.5 - fl * 0.1)) & 0xff;
  if (v > 100) v = 100;
  p.cmStaffState = u8b((p.cmStaffState ?? 0) + v) || undefined;
}

/** STAFF_STATE_OFF: til målinger (grid-stats før/efter) – slår spilstarten og den daglige del fra */
export let STAFF_STATE_OFF = false;
export const setStaffStateOff = (v: boolean) => { STAFF_STATE_OFF = v; };

const u8b = (v: number) => v & 0xff;
/** staffpostens skjulte egenskaber +0x56..+0x5d som bytes (spillets værdier er decimaltal – som gameInputs.ts staffBytes) */
const shi = (p: Player, k: string) => s8(Math.round(sh(p, k)));
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);

/** 0x828110's løkke 0x82854b–0x8286aa for én person: ankomstdatoen staff +0x3e (efter i dag → i dag), dage siden (0x54cdb0); spiller (+0x61) med klub
 *  (+0x39) og dage < 415 − 10·Adaptability → bl = ftol(Adaptability·0,5): (dage < 215 ? 26 : 21) − bl − rand(bl); 0x53d980(staff, staff +0x1a, 1)
 *  giver altid 0 (samme land – sic), så +rand(5) + 5 sker aldrig; loftet ftol(CA·0,15) (u8 mod s8). Ellers 0. */
export function staffStateInitValue(i: { player: boolean; club: boolean; days: number; adaptability: number; ca: number }, rand: (n: number) => number): number {
  const ad = s8(i.adaptability);
  if (!i.player || !i.club || !(i.days < 415 - 10 * ad)) return 0;
  const bl = s8(Math.trunc(ad * 0.5));
  let x = u8b((i.days < 215 ? 0x1a : 0x15) - bl - rand(bl));
  const lim = s8(Math.trunc(s16(i.ca) * 0.15));
  if (x > lim) x = u8b(lim);
  return x;
}
/** spilstarten (newgame → cmFitNewGame): alle spillere i databasen på DATABASENS dato (1/1 i startåret – før dagene frem til spillets start, hvor
 *  ferien 0x62c680 løfter byten; målt mod oraklet: nyankomne fra efteråret 2000 har formlens værdi + feriedagene, dvs. dagene regnes til 1/1) */
export function cmStaffStateInit(g: GameState, today = g.date): void {
  if (!cmActive(g) || STAFF_STATE_OFF) return;
  for (const p of Object.values(g.players)) {
    if (p.regen) continue;
    let jd = p.joined ?? p.cmJoined ?? today;
    if (jd > today) jd = today;                                                      // 0x828594: 0x417c10(staff +0x3e, i dag)
    const v = staffStateInitValue({ player: true, club: !!p.club, days: daysBetween(jd, today), adaptability: shi(p, 'adaptability'), ca: p.ca },
      cmRand(g.seed, p.id, 0x828110));
    p.cmStaffState = v || undefined;
  }
}

/** 0x5ce2d0 0x5ce4b6–0x5cf481 for én spiller (esi = kontrakten, [esp+0x1c] = kontraktens klub). A = 0x548da0(staff, klub) – en person i klubben,
 *  spilleren ser op til (~15 % af spillerne i oraklet) – er ikke porteret: A = 0, så leddet 0x5ce80c–0x5ce88c (+L eller +L/4 til en løkkevariabel
 *  [esp+0x70], der ikke nulstilles mellem personerne – sic – og rand af den) og A's land i 0x20/0x20000-grenene falder bort. Ligeledes ikke:
 *  kontraktens begivenheder +0x40 (0x8676f0 = 0), 0x8cca10 (= 0),
 *  trupstatussen for > 23 år med status 5/6 (0x5ce5ad – skrives ikke af denne port) og blokken 0x5cf144–0x5cf38e (ændrer ikke byten). */
export function staffStateDaily(i: {
  x: number; fatigue: number; contract: CmContract | null; club: boolean; listed: boolean; age: number; ca: number; worldRep: number;
  gkRating: number; pos2: number; morale: number; form: number; id: number;
  hid: { determination: number; loyalty: number; pressure: number; professionalism: number; adaptability: number };
  injured: boolean; job11: boolean;
  /** 0x5ce8f0: (kontraktklubbens land +0x85·0,2 + 0,6)·klub +0x80 – null uden klub/land (og i spil fra world-filer uden +0x85: leddet springes over) */
  clubYouth?: number | null;
}, rand: (n: number) => number): number {
  let x = u8b(i.x);
  const c = i.contract, P = s8(i.hid.professionalism), L = s8(i.hid.loyalty), D = s8(i.hid.determination), Pr = s8(i.hid.pressure);
  const add = (n: number) => { x = u8b(x + rand(n)); };
  main: if (x < 0x32) {
    // 0x5ce4e7: rand(200) = 0 og trætheden under −1000 − rand(5000) → + rand(ftol(20 − træthed·0,02))
    if (rand(200) === 0) { const lim = -1000 - rand(5000); if (s16(i.fatigue) < lim) add(Math.trunc(20 - s16(i.fatigue) * 0.02)); }
    // 0x5ce567: klagen 0x100000 og rand(Pressure + 5) = 0 → + rand(5)
    if (c && (c.b45 & 0x100000) && rand(Pr + 5) === 0) add(5);
    // 0x5ce5e7: under 15, rand(20) = 0 og rand(Professionalism) = 0 → formen 0x7c1950 over rand(20) + 35 → + rand(20)
    if (x < 0xf && rand(0x14) === 0 && rand(P) === 0) { const f = s8(i.form); if (f > rand(0x14) + 0x23) add(0x14); }
    // 0x5ce659: loftet ftol(CA·0,15)
    if (x >= s8(Math.trunc(s16(i.ca) * 0.15))) break main;
    // 0x5ce68f: N [esp+0x20]
    let N: number;
    const d = s16(i.ca) - x, id20 = i.id % 20, id15 = i.id % 15;
    if (c && !i.listed && (c.b45 & 0x30321)) {
      if (d < P + 0x50) N = Math.trunc((L + 2 * P + 0xa + id20) * 2.5);
      else if (d > P + 0x7d) N = s16(L + id15 + P + 5);
      else N = Math.trunc((2 * P + L + id20 + 5) * 2);
    } else {
      if (d < P + 0x50) N = Math.trunc((D + P + id20 + Pr + 0xa) * 2.5);
      else if (d > P + 0x8c) N = s16(Pr + D + id15 + P + 5);
      else N = Math.trunc((D + P + id20 + Pr + 5) * 2);
    }
    // (0x5ce80c: A = 0 – ikke porteret)
    if (c) {
      // 0x5ce898: unge (verdensomdømme < 3750, under 19 år) med mange kampe i træk uden tilfredsstillende spilletid (+0x3f)
      if (s16(i.worldRep) < 0xea6 && i.age < 0x13) {
        let cl = s8(Math.trunc(Pr * 0.25 + 3.0));
        if (i.age < 0x11) cl = s8(cl - 3); else if (i.age === 0x11) cl = s8(cl - 1);
        // 0x5ce8e1–0x5ce94e: kontraktklubbens land +0x85: v = (+0x85·0,2 + 0,6)·klub +0x80 → over 7750 −2, over 5750 −1, under 3750 +1
        if (i.clubYouth !== null && i.clubYouth !== undefined) {
          const v = i.clubYouth;
          if (v > 7750) cl = s8(cl - 2); else if (v > 5750) cl = s8(cl - 1); else if (v < 3750) cl = s8(cl + 1);
        }
        if (cl < 0) cl = 0;
        if (s8(c.b3f) > cl) { let al = s8(7 - cl); if (al < 2) al = 2; add(al); }
      }
      // 0x5ce985: klagen 0x40000 og N > 25 − Pressure → N + Pressure − 25 (mindst 1)
      if ((c.b45 & 0x40000) && s16(N) > 0x19 - Pr) { N = N + Pr - 0x19; if (s16(N) < 1) N = 1; }
    }
    // 0x5ce9b9: keepere (+0xf > 14) 2N + 10, forsvarere (+0x11 > 14) ftol(1,25N + 5)
    if (s8(i.gkRating) > 0xe) N = 2 * N + 0xa;
    else if (s8(i.pos2) > 0xe) N = Math.trunc(s16(N) * 1.25 + 5);
    // 0x5ce9f9: klagerne – rand(moral) = 0, så pr. flag: rand(+0x44 + 200) < rand(K) → + rand(5)
    if (c && c.b45 && rand(s8(i.morale)) === 0) {
      const b44 = s8(c.b44);
      const flag = (k: number) => { if (rand(b44 + 0xc8) < rand(k)) add(5); };
      if (!i.listed && (c.b45 & 1)) flag(0x14);
      const F: [number, number][] = [[2, 0x4b], [8, 0x12c], [0x20, 0xc8], [0x40, 0x64], [0x80, 0x28], [0x100, 0x32], [0x200, 0x64], [0x400, 0x14], [0x800, 0x14],
        [0x1000, 0x14], [0x2000, 0x190], [0x4000, 0x64], [0x8000, 0x32], [0x10000, 0xa], [0x20000, 0x64], [0x40000, 0x4b], [0x80000, 0x4b], [0x200000, 0x14],
        [0x400000, 0x14]];
      for (const [bit, k] of F) if (c.b45 & bit) flag(k);
      // (begivenhederne +0x40 & 8 / & 0x20: 0x8676f0 = 0)
      if (c.b45 & 0x1000000) flag(0x14);
      if (c.b45 & 0x800000) flag(0x64);                                                 // 0x8cca10(staff, 0) = 0
    }
    // 0x5cf106: spillere (job 11): rand(N) = 0 → + rand(8)
    if (i.job11 && rand(s16(N)) === 0) add(8);
  }
  // 0x5cf41a: henfaldet – ikke skadet (0x62c400 ≠ 2): r = rand(moral + 5) over rand(40) → − min(byten, rand(r/5 + 2))
  if (x !== 0 && !i.injured) {
    const r = s8(rand(s8(i.morale) + 5));
    if (r > rand(0x28)) { let a = u8b(rand(Math.trunc(r / 5) + 2)); if (a > x) a = x; x = u8b(x - a); }
  }
  return x;
}
/** 0x5ce2d0's del for spilleren i spillet (cmContractDaily) */
function staffStateDay(g: GameState, p: Player, c: CmContract, rand: (n: number) => number): void {
  const rec = (p.cmRepMem ?? p.cmRep ?? [0, p.rep * 2, p.rep * 2]);
  const fr = cmFormRatings(p);
  let fs = 0; for (const r of fr) fs += r > 0 ? 4 * Math.min(15, r) : 27;
  const v = staffStateDaily({
    x: p.cmStaffState ?? 0, fatigue: pctx.fatigue?.(p) ?? 0, contract: c, club: !!p.club, listed: listedOrRequest(p), age: s8(ageOn(p.dob, g.date)),
    ca: p.ca, worldRep: Math.round(rec[2] * 50), gkRating: p.pos[0] ?? 0, pos2: p.pos[2] ?? 0, morale: p.morale ?? 10, form: s8(Math.trunc(fs / 4)), id: p.id,
    hid: { determination: shi(p, 'determination'), loyalty: shi(p, 'loyalty'), pressure: shi(p, 'pressure'), professionalism: shi(p, 'professionalism'), adaptability: shi(p, 'adaptability') },
    injured: (pctx.injury?.(p) ?? 0) === 2, job11: true,
    clubYouth: g.cmNation85 && p.club && g.clubs[p.club] ? (s8(g.cmNation85[g.clubs[p.club].nation] ?? 0) * 0.2 + 0.6) * s16(clubRepMem(g, p.club)) : null,
  }, rand);
  p.cmStaffState = v || undefined;
}

/** klubskifte (setClub): statistikken arkiveres (0x7c5fe0) og en ny kontrakt starter (0x4cf720) */
export function cmOnClubChange(p: Player): void {
  p.cmStats = undefined;
  p.cmContract = undefined;
}

// ---------------------------------------------------------------- spilstarten: omdømmet (sub_535a80 0x536270–0x536ec6)

const okRep = (v: number) => v >= 1 && v <= 200;
const lowByte = (v: number) => s8(v & 0xff);

export interface RepFillInput {
  /** spillerpostens +9 hjemme, +0xb nuværende, +0xd verden (databasens 0–200; uden for 1..200 = mangler) */
  rep: [number, number, number];
  ca: number;
  /** PA-flaget [esp+0x2c] (databasens PA; −1 = tilfældig 100–150) */
  pa: number;
  /** klubben (+0x39): dens rå omdømme (club +0x80) og om dens land er spillerens; null = klubløs */
  club: { rep: number; sameNation: boolean } | null;
  /** spillerens land +0x8e (rå) */
  nationRep: number;
  /** staff +0x22: landskampe */
  caps: number;
}
/** Udfylder manglende omdømme som originalen og returnerer [hjemme, nuværende, verden] (1..200; ×50 i hukommelsen). */
export function fillReputation(i: RepFillInput, rand: (n: number) => number): [number, number, number] {
  const ftol = Math.trunc;
  let [home, cur, world] = i.rep.map((v) => s16(v));
  const ca = s16(i.ca);
  let bl = lowByte(i.nationRep);
  if (bl === 0) bl = s8(rand(10) + 1);                                       // 0x5362b6
  let cr: number;                                                             // [esp+0x20]
  if (i.club) { cr = lowByte(i.club.rep); if (cr === 0) cr = s8(rand(4) + 1); } else cr = s8(rand(2) + 1);
  let di = s16(10 * ((3 * cr + bl) >> 2)); if (di > 80) di = 80;
  const shrink = (v: number) => (i.club ? v : ftol(v - v * (u8(i.caps) ? 0.25 : 0.6)));   // 0x53643d: klubløse
  const clamp = (v: number) => (v < 1 ? 1 : v > 200 ? 200 : v);
  if (!okRep(cur)) {                                                          // 0x536321: det nuværende
    let c: number;
    if (okRep(home) && i.club && i.club.sameNation) c = clamp(home - rand(10) + rand(10));
    else if (okRep(world)) c = world < 180 ? cr - rand(10) + 20 : rand(10) + 170;
    else if (i.pa === -1 && ca > 100) c = rand(40) + 60;
    else if (ca >= 1 && ca <= 200) c = ca > 75 ? ca - rand(50) : rand(25) + 1;
    else c = Math.min(rand(di) + 1, 25);
    cur = clamp(s16(shrink(s16(c))));
  }
  if (!okRep(home)) {                                                         // 0x5364a1: hjemme
    let h: number;
    if (okRep(cur)) h = cur < 10 ? rand(5) + 1 : cur > 190 ? rand(10) + 185 : cur - rand(10) + rand(10);
    else if (okRep(world)) h = world > 180 ? rand(10) + 180 : cr - rand(10) + 20;
    else if (i.pa === -1) h = rand(20) + 80;
    else if (ca >= 1 && ca <= 200) h = ca > 50 ? ca - rand(50) : rand(25) + 1;
    else h = Math.min(rand(di) + 1, 25);
    home = clamp(s16(shrink(s16(h))));
  }
  if (!okRep(world)) {                                                        // 0x53661f: verden
    let w: number;
    if (okRep(home)) w = home > 100 ? ftol(home * 0.25) : rand(3) + 1;
    else if (okRep(cur)) w = cur < 175 ? ftol(cur * 0.15) : ftol(cur * 0.25);
    else if (ca >= 1 && ca <= 200) w = rand(rand(ftol(ca * 0.25))) + 1;
    else w = Math.min(ftol(di / 3), 5);
    world = clamp(s16(shrink(s16(w))));
  }
  if (!i.club || i.club.sameNation) home = cur;                               // 0x536783: hjemme = nuværende for klubløse og landets egne
  return [home, cur, world];
}
