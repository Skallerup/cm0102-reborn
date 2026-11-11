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
/** rand(n) → 0..n−1 som 0x90cfc0 (n ≤ 0 → 0) af en deterministisk talrække */
export function cmRand(...seed: number[]): (n: number) => number {
  let s = mix(...seed) || 1;
  return (n: number) => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return n > 0 ? s % Math.trunc(n) : 0;
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

export interface CmContract { b3d: number; b3e: number; b3f: number; b44: number; b45: number }
const s8 = (v: number) => (v << 24) >> 24;
const clamp100 = (v: number) => (v > 100 ? 100 : v < -100 ? -100 : v);

/** 0x4cf720: +0x3d ved en ny kontrakt efter trupstatus (1 → 75, 2 → 50, 3 → 40, ellers 0); tællerne og +0x44/+0x45 fra 0 (*estimeret*: originalen
 *  kopierer dem fra en skabelon/den forrige kontrakt; startværdien af +0x44 i databasens kontrakter er ikke afkodet) */
export function newCmContract(status: number): CmContract {
  return { b3d: status === 1 ? 75 : status === 2 ? 50 : status === 3 ? 40 : 0, b3e: 0, b3f: 0, b44: 0, b45: 0 };
}

const STATUS_CODE: Record<string, number> = { key: 1, first: 2, rotation: 3, backup: 4, prospect: 5, young: 6, surplus: 7 };
/** trupstatus (kontrakt +0x4f >> 4) af vores Player.squadStatus (0 uden) */
export const statusCode = (p: Player) => STATUS_CODE[p.squadStatus ?? ''] ?? 0;

export function cmContractOf(p: Player): CmContract {
  return (p.cmContract ??= newCmContract(statusCode(p)));
}

const sh = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
const daysClamp = (from: string | undefined, today: string) => {
  const d = from ? dayNum(today) - dayNum(from) : 400;
  return d < 0 ? 0 : d > 400 ? 400 : d;
};

/** 0x4cb0a0 (tilfreds med spilletiden): +0x44 += trunc(clamp(1 + F·k, 0,01, 2)/(+0x3f + 5)) (altid 0 for +0x3f ≥ 0) og loftet efter flagene */
function happyStep(p: Player, c: CmContract, clubRep: number, age: number): void {
  const F = s16(curRep(p)) - s16(clubRep) + s8(age) * 417 - 11680;
  let x = 1 + (F < 0 ? F * 6.6e-5 : F * 6.666666666666667e-5);
  if (x < 0.01) x = 0.01; else if (x > 2) x = 2;
  let y = s8(Math.trunc(x / (s8(c.b3f) + 5)));
  if (y > 10) y = 10;
  const fl = c.b45;
  let cap = fl & 2 ? 50 : 100;
  for (const bit of [1, 8, 0x20, 0x40, 0x80, 0x100]) { if (cap < -50) break; if (fl & bit) cap = s8(cap - 50); }
  c.b44 = clamp100(s8(c.b44) + y);
  if (c.b44 > cap) c.b44 = cap;
  // 0x4cb1f7–0x4cb238: flag 4/0x10 ryddes (0x8674e0) – flagene sættes af systemer, der ikke er porteret
  if (!((y <= 5 || s8(c.b44) + y <= 0) && s8(c.b3d) < 75 - y)) c.b45 &= ~0x14;
}

/** 0x4cb250 (utilfreds): +0x44 −= trunc(clamp(1 − F·k, 0,1, 10)/(+0x3e + 4) + 0,5). F af omdømmet mod klubbens, dagene i klubben (A) og siden
 *  kontrakten (B, begge højst 400 – B ≤ 400 gør grenen for 24–31-årige død, som i originalen), alderen, landskampe/landets omdømme og trupstatus.
 *  Flagene 4/0x10 (0x867700) sættes ikke (de systemer, der læser dem, er ikke porteret). */
function unhappyStep(p: Player, c: CmContract, clubRep: number, age: number, today: string, nationRep: number): void {
  const A = daysClamp(p.joined, today), B = daysClamp(p.joined, today);
  const amb = s8(sh(p, 'ambition'));
  let F = s16(curRep(p)) - s16(clubRep) + 50 * A + s8(age) * 417 - 31680;
  const status = statusCode(p);
  let capped = true;
  if (B > 400 && age > 23 && age < 32) F += 250 * amb + 5000;
  else if (u8(p.caps) && nationRep > 3500 && age < 32) F += 250 * amb + 25 * u8(p.caps) + 2500;
  else if (status === 1) F += 250 * amb + 5000;
  else if (status === 2) F += 125 * amb + 2500;
  else if (status === 3) F += 1000 * s8(c.b3e);
  else capped = false;
  if (capped && F >= 15000) F = 15000;
  let G = 1 - (F < 0 ? F * 0.0006666666666666666 : F * 6e-5);
  if (G < 0.1) G = 0.1; else if (G > 10) G = 10;
  const x = s8(Math.trunc(G / (s8(c.b3e) + 4) + 0.5));
  c.b44 = clamp100(s8(c.b44) - x);
}

/** spillerpostens nuværende omdømme +0xb (0..10000) */
export function curRep(p: Player): number {
  return Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[1] * 50);
}

/** 0x4ca6d0 for en spiller, der spillede (starter eller indskiftet): +0x3d af minutterne, +0x3e/+0x3f og +0x44. `minutes` = 0x4ca6d0's bl:
 *  startere 90 eller minuttet for udvisningen/skaden (+0x30), indskiftede 90 − indskiftningsminuttet. Kun klubkampe (ikke landskampe). */
export function contractAfterMatch(g: GameState, p: Player, o: { starter: boolean; minutes: number; injured: boolean; condition: number; won: boolean; lost: boolean;
  clubRep: number; nationRep: number; seed: number; rand?: (n: number) => number }): void {
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
    unhappyStep(p, c, o.clubRep, age, g.date, o.nationRep);
  }
  // 0x4cac6a: sejr/nederlag – rand(21 − Ambition) < 4 → +0x44 ±3
  if (o.won || o.lost) { if (rand(21 - s8(sh(p, 'ambition'))) < 4) c.b44 = clamp100(s8(c.b44) + (o.won ? 3 : -3)); }
}

/** 0x4cae7d: truppens spillere, der ikke spillede (ikke skadede, udelukkede eller udlejede): +0x3f = 0, +0x3e += 1, +0x3d −= 8, 0x4cb250.
 *  (0x4cbd20 – transferlisten efter 8/14 kampe uden spilletid – er ikke porteret.) */
export function contractNotPlayed(g: GameState, p: Player, clubRep: number, nationRep: number): void {
  const c = cmContractOf(p);
  c.b3f = 0; if (c.b3e !== 100) c.b3e = u8(c.b3e + 1);
  c.b3d = clamp100(s8(c.b3d) - 8);
  unhappyStep(p, c, clubRep, ageOn(p.dob, g.date), g.date, nationRep);
}

// ---------------------------------------------------------------- efter kampen (sim.ts applyMatchResult)

/** Klubbens omdømme i originalens skala (club +0x80): databasens rå værdi, ellers vores 0–100 ×100 (*estimeret*) */
export function clubRepMem(g: GameState, club: number): number {
  return g.cmClubRep?.[club] ?? (g.clubs[club]?.rep ?? 50) * 100;
}
/** landets omdømme (nation +0x8e) */
export const nationRepMem = (g: GameState, nation: number) => g.cmNationRep?.[nation] ?? 0;

/** 0x7c0d70 + 0x4ca6d0 for en klubkamp: statistik pr. kategori, formen, karaktersnittet og kontraktens tællere for begge hold. */
export function cmAfterMatch(g: GameState, f: Fixture, rep: MatchReport, squadOf: (club: number) => Player[]): void {
  if (!cmActive(g)) return;
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
      clubRep: clubRepMem(g, club), nationRep: nationRepMem(g, p.nation), seed: f.id });
  }
  for (const club of [f.home, f.away]) {
    for (const p of squadOf(club)) {
      if (played.has(p.id) || p.regen || p.injury || p.banned > 0 || p.loan) continue;
      contractNotPlayed(g, p, clubRepMem(g, club), nationRepMem(g, p.nation));
    }
  }
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
