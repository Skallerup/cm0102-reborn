// CM 01/02's kendskab (fog_of_war.cpp, cm0102.exe 3.9.68) – hvor godt menneskets manager kender en spiller. Kun den originale database i
// ægte tilstand med Attribute Masking ([0x9cc270] ≠ 0); ellers kender han alle (niveau 3).
//
// Objektet pr. menneskelig manager ([0xae2a60] + 4·(antal − id − 1), 0x5afde0): +0 tabellen, 9 bytes pr. person (+0 niveauet 0..3, +1..+8 datoen
// for sidst set), +4 managerens personpost. Niveauerne: 0 intet, 1 meget lidt, 2 noget, 3 fuldt.
//   0x5aff00 (oprettelsen, 0x5af630 ved spilstarten og 0x822a60 ved en ny menneskelig manager): datoen = i dag, niveauet = 0x5b03e0
//   0x5afce0 → 0x5b0260 (dagligt fra 0x5cccd0): niveau > 0 og mere end 540 dage siden sidst set → niveau − 1 og datoen = i dag; derefter
//            mindst 0x5b06e0's gulv
//   0x5b02f0 (opslaget): uden kendskabsobjekt / masking slået fra / genererede personer (id ≥ [0xae2364]) → 3; spilleren i managerens klub,
//            under kontrakt med den (udlejet) eller i managerens landshold (+0x24) → 3; B-hold-kæden 0x540a50 (findes ikke hos os); ellers tabellen
//   0x5b09d0 (set, spejder): datoen = i dag; uden spejder (kampen 0x5afe00, 0x7bd310) → 3; med spejder (0x7b3e20/0x7b5be0/0x7b62a0) og niveau < 3:
//            j = Judging Player Ability (0x544410 af +0x17), r = rand(j): j < 15 og r = 0 → niveau + 1; ellers niveau 0 og r < 6 → 2, ellers 3
//   0x5afd00 (regen 0x7abac0): niveauet 0 – hos os har en regen et nyt id, som står på 0
//   0x543280 (attribute masking pr. egenskab, 0x543440 viser "-" = 0xf9): niveau 3 alle, 0 ingen, 1 og 2 efter id % 4 og egenskabens nummer
//   0x5afe00 (efter kampen, 0x6b6cc0): menneskets manager har set modstanderens 11 og de indskiftede → 0x5b09d0 uden spejder
// Tabellen ligger i GameState.knowledge (niveau → 0/33/66/100 %, så resten af spillet kan læse den som før) og datoen i
// manager.cmKnowSeen (kun når den afviger fra startdatoen manager.cmKnowStart).
import type { GameState, Player } from './types';
import { cmRand, cmScoutLogic, nationRepMem } from './cmPlayerData';
import { addDays, ageOn, daysBetween } from './dates';
import { intlOnDuty } from './cmFitnessGame';

/** niveau → GameState.knowledge (procent) */
export const KNOW_PCT = [0, 33, 66, 100];
const lvOfPct = (k: number) => (k >= 100 ? 3 : k >= 66 ? 2 : k >= 33 ? 1 : 0);

/** kendskabssystemet er slået til: den originale database i ægte tilstand med Attribute Masking – eller (MODERN_PARITY 9) et 2026/27-spil i ægte
 *  tilstand, der er startet med modulet (cmScoutLogic) */
export function cmKnowOn(g: GameState): boolean {
  return cmScoutLogic(g) && !!g.options.masking;
}

// ---------------------------------------------------------------- personposternes felter

/** managerens personpost: +0x1a landet, +0x39 klubben, +0x24 landsholdet (som en klub: +0x53 = landet) */
interface Mgr { nat: number; club: number; nt: number }
const mgrOf = (g: GameState): Mgr => ({ nat: g.manager.nation, club: g.userClub || 0, nt: g.manager.national?.nation ?? -1 });

const clubNat = (g: GameState, c: number): number | undefined => (c ? g.clubs[c]?.nation : undefined);
/** club +0x57: divisionen (som buildWageMem's divAdr – 0 uden); gemt pr. dag (kaldes for alle spillere i den daglige opdatering) */
const DIVS = new WeakMap<GameState, { date: string; m: Map<number, number> }>();
function clubDiv(g: GameState, c: number): number {
  let e = DIVS.get(g);
  if (!e || e.date !== g.date) { e = { date: g.date, m: new Map() }; DIVS.set(g, e); }
  let v = e.m.get(c);
  if (v === undefined) {
    const cl = g.clubs[c];
    const lm = cl ? /^CM(\d+)$/.exec(cl.league ?? '') : null;
    const d = lm ? +lm[1] : g.cmFinRaw?.[c]?.[0];
    v = !cl || d === undefined || d < 0 ? 0 : d + 1;
    e.m.set(c, v);
  }
  return v;
}
/** staff +0x24 = managerens +0x24: spilleren er udtaget til det landshold, menneskets manager træner (cmFitnessGame's landsholdsophold) */
const sameNt = (p: Player, m: Mgr): boolean => m.nt >= 0 && p.nation === m.nt && intlOnDuty(p);
/** spillerpostens omdømme +0xb (aktuelt) og +0xd (verden) i hukommelsens skala (som buildWageMem's playerRec) */
function reps(p: Player): [number, number] {
  const r = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
  return [Math.round(r[1] * 50), Math.round(r[2] * 50)];
}
/** (nation +0x8e / 5) · landskampe > 8,5 – landskampe med et stort land (0x5b04b5/0x5b0770; [0x96a790] = 8,5) */
function capsKnown(g: GameState, p: Player): boolean {
  if (p.nation === undefined || p.nation < 0) return false;
  const nr = nationRepMem(g, p.nation) << 16 >> 16;
  return Math.trunc(nr / 5) * Math.min(255, p.caps ?? 0) > 8.5;
}
/** 0x4cf5a0 → kontraktens klub (+4): moderklubben for en udlejet, 0 uden kontrakt */
const contractClub = (p: Player): number => (p.club ? (p.loan?.from ?? p.club) : 0);
/** nation +0x88: antal indlæste spillere af nationaliteten (0x524d70) */
const N88 = new WeakMap<GameState, Map<number, number>>();
function nat88(g: GameState, n: number): number {
  let m = N88.get(g);
  if (!m) { m = new Map(); for (const p of Object.values(g.players)) if (!p.virtual) m.set(p.nation, (m.get(p.nation) ?? 0) + 1); N88.set(g, m); }
  return m.get(n) ?? 0;
}
/** 0x7c6e30 (spiller, klub): 0 i klubben nu, ellers år siden han sidst spillede der (spillerhistorikken 0x7c3e40), −1 aldrig.
 *  Historikkens år = sæsonens startår (*estimeret*: originalens årstal i historikposten +0xd7 er ikke målt) */
function yearsSince(g: GameState, p: Player, club: number): number {
  if (p.club === club) return 0;
  let last = -1;
  for (const h of p.history ?? []) if (h.club === club && h.season > last) last = h.season;
  return last < 0 ? -1 : (+g.date.slice(0, 4) - last) << 16 >> 16;
}

// ---------------------------------------------------------------- niveauerne

/** 0x5b03e0 (manager, spiller): startniveauet, da kendskabsobjektet blev oprettet */
export function initLevel_5b03e0(g: GameState, m: Mgr, p: Player): number {
  const pc = p.club || 0, pcn = clubNat(g, pc), mcn = clubNat(g, m.club);
  const sameNat = p.nation === m.nat;                                                            // [esp+0x16]
  if (sameNt(p, m)) return 3;                                                                    // +0x24 = managerens +0x24
  // [esp+0x13]: klubbernes land, eller managerens landshold = spillerklubbens land
  const clubsSameNat = (!!m.club && !!pc && mcn === pcn) || (m.nt >= 0 && !!pc && m.nt === pcn);
  const inMgrNat = !!pc && pcn === m.nat;                                                        // [esp+0x15]
  const mgrClubPlayerNat = !!m.club && mcn === p.nation;                                         // [esp+0x17]
  const sameDiv = !!m.club && !!pc && clubDiv(g, m.club) === clubDiv(g, pc);                      // [esp+0x14]
  const [cur, world] = reps(p);
  const age = ageOn(p.dob, g.date);
  if (p.nation !== undefined && p.nation >= 0 && (capsKnown(g, p) || world > 0x1482)) return 3;
  if (sameDiv && age > 0x13) return 3;
  const ys = m.club ? yearsSince(g, p, m.club) : -1;
  if (ys !== -1 && ys < 2) return 3;
  const late = (adult: number) => (cur > 0x109a ? 3 : age > adult ? 2 : ys !== -1 && ys < 3 ? 2 : 1);
  if (clubsSameNat) return late(0x15);
  if (inMgrNat) return late(0x17);
  if (!sameNat && !mgrClubPlayerNat) return m.nt >= 0 && nat88(g, m.nt) < 1000 && m.nt === p.nation ? 1 : 0;
  return late(0x17);
}

/** 0x5b06e0 (manager, spiller): det daglige gulv */
export function floorLevel_5b06e0(g: GameState, m: Mgr, p: Player): number {
  // (flagene [esp+0x13..0x17] regnes først, når de bruges – de er rene sammenligninger, så rækkefølgen ændrer ikke svaret)
  const pc = p.club || 0;
  const r = p.cmRepMem ?? p.cmRep;
  const world = r ? Math.round(r[2] * 50) : p.rep * 100, cur = r ? Math.round(r[1] * 50) : p.rep * 100;
  if (p.nation !== undefined && p.nation >= 0 && (world > 0x1482 || capsKnown(g, p))) return 3;
  if (pc && pc === m.club) return 3;
  if (sameNt(p, m)) return 3;
  // kontraktens klub = managerens (også 0 = 0: en manager uden klub kender de kontraktløse); B-hold-kæden 0x540a50 giver 0 hos os, så
  // "kædens klub = managerens" holder kun for en manager uden klub (0x5b0840/0x5b086a)
  if (!m.club) return 3;
  if (contractClub(p) === m.club) return 3;
  if (pc && clubDiv(g, m.club) === clubDiv(g, pc)) return 2;                                    // [esp+0x13]
  const pcn = clubNat(g, pc), mcn = clubNat(g, m.club);
  const big = cur > 0x109a, adult = big || ageOn(p.dob, g.date) > 0x15;
  if (pc && mcn === pcn && adult) return big ? 2 : 1;                                             // [esp+0x14]
  if ((p.nation === m.nat || mcn === p.nation) && adult) return big ? 2 : 1;                      // [esp+0x15] / [esp+0x16]
  if (pc && pcn === m.nat) return big ? 1 : 0;                                                    // [esp+0x17]
  return 0;
}

/** tabellens niveau (uden opslagets genveje) */
const tableLevel = (g: GameState, p: Player): number => lvOfPct(g.knowledge?.[p.id] ?? 0);
function setLevel(g: GameState, pid: number, lv: number): void {
  if (lv > 0) g.knowledge[pid] = KNOW_PCT[lv];
  else delete g.knowledge[pid];
}

/** 0x5b02f0 (spiller): managerens kendskab 0..3 */
export function cmKnowLevel(g: GameState, p: Player): number {
  if (!cmKnowOn(g) || p.virtual) return 3;
  const m = mgrOf(g);
  if (m.club) {
    if (p.club === m.club) return 3;
    if (contractClub(p) === m.club) return 3;
  }
  if (sameNt(p, m)) return 3;
  return tableLevel(g, p);
}

/** 0x5aff00: kendskabsobjektet oprettes (spilstarten / en ny menneskelig manager) – niveauerne af 0x5b03e0, datoen = i dag */
export function cmKnowInit(g: GameState): void {
  g.knowledge = {};
  g.manager.cmKnowStart = g.date;
  g.manager.cmKnowSeen = {};
  const m = mgrOf(g);
  for (const p of Object.values(g.players)) {
    if (p.virtual) continue;
    setLevel(g, p.id, initLevel_5b03e0(g, m, p));
  }
}

/** 0x5afce0 → 0x5b0260: den daglige opdatering (glemsel efter 540 dage, så 0x5b06e0's gulv) */
export function cmKnowDaily(g: GameState): void {
  if (!cmKnowOn(g)) return;
  if (!g.manager.cmKnowStart) { cmKnowInit(g); return; }
  const m = mgrOf(g), seen = (g.manager.cmKnowSeen ??= {}), start = g.manager.cmKnowStart;
  // daysBetween(sidst set, i dag) > 540 ⇔ sidst set før i dag − 540 dage (ISO-datoer sammenlignes som tekst)
  const limit = addDays(g.date, -0x21c);
  for (const p of Object.values(g.players)) {
    if (p.virtual) continue;
    const lv0 = tableLevel(g, p);
    let lv = lv0;
    if (lv !== 0 && (seen[p.id] ?? start) < limit) { lv--; seen[p.id] = g.date; }
    const f = floorLevel_5b06e0(g, m, p);
    if (lv < f) lv = f;
    if (lv !== lv0) setLevel(g, p.id, lv);
  }
}

/** 0x5b09d0 (spiller, spejderens Judging Player Ability eller null): spilleren er set */
export function cmKnowSee(g: GameState, p: Player, judging: number | null, salt = 0): void {
  if (!cmKnowOn(g) || p.virtual) return;
  (g.manager.cmKnowSeen ??= {})[p.id] = g.date;
  if (judging === null) { setLevel(g, p.id, 3); return; }
  const lv = tableLevel(g, p);
  if (lv === 3) return;
  const j = Math.max(1, Math.min(20, Math.round(judging)));
  const r = cmRand(g.seed ?? 0, p.id, daysBetween('2000-01-01', g.date), salt, 0x5b09d0)(j);
  if (j < 15 && r === 0) setLevel(g, p.id, lv + 1);
  else setLevel(g, p.id, lv === 0 && r < 6 ? 2 : 3);
}

// ---------------------------------------------------------------- attribute masking 0x543280

/** originalens egenskabsnumre 1..31 (0x543540's tabel 0x543a94 – alfabetisk som profilen) */
const ATTR_NO: Record<string, number> = {
  acceleration: 1, aggression: 2, agility: 3, anticipation: 4, balance: 5, bravery: 6, creativity: 7, crossing: 8, decisions: 9, determination: 10,
  dribbling: 11, finishing: 12, flair: 13, handling: 14, heading: 15, influence: 16, jumping: 17, longShots: 18, marking: 19, offTheBall: 20,
  pace: 21, passing: 22, positioning: 23, reflexes: 24, freeKicks: 25, stamina: 26, strength: 27, tackling: 28, teamwork: 29, technique: 30, workRate: 31,
};

/** 0x543280 (niveau, staff-id, egenskab 1..31): 1 = vises, 0 = "-" */
export function maskVisible_543280(lv: number, id: number, a: number): boolean {
  if (lv === 3) return true;
  if (lv !== 1 && lv !== 2) return false;
  if (a === 1 || a === 0x11 || a === 0x15 || a === 0x1a || a === 0x1b) return true;
  const k = id % 4;
  if (lv === 2) {
    if (k === 0) return a % 2 === 0 || (a + 1) % 3 === 0;
    const x = a + k;
    return x % 2 === 0 || x % 3 === 0;
  }
  if (k === 0) return a % 4 === 0 || (a + 1) % 3 === 0;
  const x = a + k;
  return x % 4 === 0 || x % 3 === 0;
}

/** vises egenskaben (vores navn) for spilleren? Egenskaber uden for originalens 31 (hjørne-/straffespark, indkast, One on Ones,
 *  Natural Fitness – profilen viser dem ikke i originalen) vises kun ved fuldt kendskab. */
export function cmAttrVisible(g: GameState, p: Player, key: string): boolean {
  const lv = cmKnowLevel(g, p);
  if (lv === 3) return true;
  const a = ATTR_NO[key];
  return a !== undefined && maskVisible_543280(lv, p.id, a);
}
