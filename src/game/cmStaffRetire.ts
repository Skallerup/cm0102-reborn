// Stabens pensioner og reservepuljen af ikke-spillerposter (PLAYER_REGEN, player_regen.cpp i cm0102.exe 3.9.68) – spil startet med modulet
// (GameState.cmNpRes, sat af cmRetireInit ved spilstarten; enhver CM-database i ægte tilstand). Læst 25/11-2026:
//   • Reservepuljen (PLAYER_REGEN +0x1c/+0x20, 16 bytes: +0 ikke-spillerpostens id, +4 nationen, +0xc personen): ved et nyt spil 10 tomme poster
//     (0x7a54e8: de sidste 10 i [0xae23c0], nation −1 – oraklet 14/7-01: 2232..2241, CA/PA 0); queue_staff_for_regen 0x7a87d0 lægger en
//     pensioneret ikke-spillers post i puljen (0x7a89a2, nationen +0x1a – uden: rand(antal lande)); 0x7a82b0 tager den ud.
//   • find_new_retirements 0x7a5790 / spilstarten 0x7a58f0 → check_retirement 0x7a7310 / 0x7a79c0 for en person uden spillerpost (+0x61 = 0)
//     med ikke-spillerpost (+0x69): jobbet +0x3d (0 → landsholdsjobbet +0x28) 1, 2, 4 → alder > rand(10) + 70; 8, 9 → > rand(5) + 60; ellers
//     uden klub og landshold (+0x39 = +0x24 = 0) → > rand(10) + 55, ellers > rand(5) + 61. Årsag 0x20, datoerne som spillernes (cmRetire.ts dates).
//   • process_retirements 0x7a59e0 for ham (0x7a6397–0x7a64e2): trupplanens tæller = 100 (0x7a5c76, cmPlanKick); kø-datoen (under 30 år i dag,
//     ellers i dag + 1 + rand(65)); med klub og job ≠ 5: menneskets klub (0x600a50) – kun job 1–4 går videre; så rand(4) ≠ 0 eller job ∈ {1, 2,
//     3, 4, 9, 10} → regenerate_as_non_player 0x7ab340 (en ny person på pladsen); ellers – og uden klub eller som manager – 0x7aaeb0 (væk fra
//     klubben/landsholdet, en managers stilling bliver ledig) og 0x7a87d0 (kø-posten → en ung regen af spillerpuljen; posten → reservepuljen).
//   • 0x7a59e0 (0x7a5cdb, notes/board/notes-F-rep.md §2.12): en pensioneret spiller UDEN ikke-spillerpost får reservepuljens første, når
//     rand(Professionalism) > rand(100) og (rand(ftol(landskampe³ + omdømme +0xb)) > rand(50000) eller nation +0x8e · landskampe > rand(200000)
//     + 200000) og puljen har mindst 3 – så bliver han ikke-spiller som databasens spillere med post (cmRetire.ts becomeStaff: job 16, ledig).
//   • process_regen_queue 0x7a65d0 (0x7a66bd, §2.13): efter køen, (puljen − 2) gange: 0x7a6e60 vælger den med højeste score 0x7a7150 > 0 blandt
//     personerne af postens nation (ellers blandt alle) uden ikke-spillerpost, ikke meldt/pensioneret (+0xb & 0x30) og mindst 31 år; han får
//     posten (målvogterens Coaching GK-justering, afbalanceringen 0x539490, i en computerklub spillende træner (15) eller assistent (13) og
//     omdømmerne). Oraklet: 8 spillere på dag 1 (Kahn, Pagliuca, Aldair, John Durnin …), og de pensionerede bliver ledig stab, som klubberne
//     ansætter i juli–august (K7: Waddle, Palmer, Gascoigne, Winterburn …).
// Ikke porteret: 0x7ab340's navne (0x539c60/0x53a1b0/0x53a5b0 – spillets navneliste som regens), formandens egenskaber (job 1), nationernes kendskab
// 0x7c6930/0x7c6a30, historikken 0x7c6bf0 og kontrakten 0x4ca1c0 (den gamle løber videre); 0x86fc20/0x86fb80 (ikke-spillerpostens poster);
// nyhederne 0x7a92e0/0x7aa340 for stab; træningen 0x8b2880 og spejderopgaven 0x7f7270 i menneskets klub; kontrakttilbuddenes post 0x4ccada.
import type { GameState, Player, Staff, StaffRole } from './types';
import { cmRand, cmPlanKick, clubRepMem } from './cmPlayerData';
import { isHumanClub } from './humans';
import { ageOn } from './dates';
import { ATTRS } from './attributes';
import { JOB_CODE } from './cmStaff';
import { rebalanceStaffNp } from './cmStaffInit';
import { randomName } from './data/generate';
import { Rng, hash } from './rng';
import { cmInMemory, dates, divisionActive, npStaffOf, pairOf, prOf, type CmRetEntry } from './cmRetire';

type Rand = (n: number) => number;
const ftol = Math.trunc;
const s16 = (v: number) => (v << 16) >> 16;
const dayNo = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** ikke-spillerposten (0x44 bytes) som spillets felter: CA +4, PA +6, de 21 bytes +0x0e..+0x22 + formationen +0x43, omdømmerne [+8, +0xa, +0xc]
 *  og de viste egenskaber/taktikken, der følger posten */
export interface CmNp { ca: number; pa: number; a: number[]; rep: [number, number, number]; attrs?: Staff['attrs']; tac?: number[]; srep?: number }
/** reservepuljens post (+0 posten – null = en tom post fra spilstarten, +4 nationen, +0xc personen) */
export interface CmNpRes { np: CmNp | null; nation: number; person: number }

/** 0x7aaeb0's manager-/landsholdsdel (cmBoardGame.ts cmBoardStaffRetired – registreres derfra, så modulerne ikke importerer hinanden) */
let boardRetired: (g: GameState, staffId: number) => void = () => {};
export function setBoardRetired(f: (g: GameState, staffId: number) => void): void { boardRetired = f; }

/** modulet: spillet er startet med reservepuljen (cmRetireInit) */
export const cmNpResOn = (g: GameState) => g.cmNpRes !== undefined;

/** 0x7a54e8: et nyt spils 10 tomme poster */
export function cmNpResInit(g: GameState): void {
  g.cmNpRes = [];
  for (let i = 0; i < 10; i++) g.cmNpRes.push({ np: null, nation: -1, person: 0 });
}

// ------------------------------------------------------------------------------------------------ personerne
const IX = (k: string) => ATTRS.indexOf(k as never);
const A = { adapt: IX('adaptability'), amb: IX('ambition'), det: IX('determination'), loy: IX('loyalty'), pres: IX('pressure'), prof: IX('professionalism'),
  sport: IX('sportsmanship'), temper: IX('temperament') };
const pa8 = (p: Player, ix: number) => Math.round(p.attrs[ix] || 10);
/** personpostens +0x56..+0x5d og +0x22 (landskampe) for en spiller */
const hidOf = (p: Player) => [pa8(p, A.adapt), pa8(p, A.amb), pa8(p, A.det), pa8(p, A.loy), pa8(p, A.pres), pa8(p, A.prof), pa8(p, A.sport), pa8(p, A.temper), Math.min(255, p.caps ?? 0)];
/** nation +0x8e (nation.dat – GameState.cmNationRep; ellers klubbernes vc[1] som cmContractGame.ts) */
function nation8e(g: GameState, n: number): number {
  const v = g.cmNationRep?.[n];
  if (v !== undefined) return v;
  for (const c of Object.values(g.clubs)) if (c.nation === n && c.vc) return c.vc[1];
  return 0;
}
/** ikke-spilleren i originalens hukommelse med ikke-spillerpost og uden spillerpost (cmExtra = databasens spillere/formænd uden for stabens poster) */
export function staffInScope(g: GameState, s: Staff): boolean {
  if (!s.cmNp || s.cmExtra || s.cmMem === false) return false;
  // en spiller med ikke-spillerpost, der stadig spiller (+0x61 ≠ 0), hører til spillernes gren
  const p = s.cmId !== undefined && !s.exPlayer ? g.players[s.cmId] : undefined;
  return !(p && npStaffOf(g, p) === s);
}
/** personens job +0x3d (uden klub: databasens/den beholdte jobkode – 0 → landsholdsjobbet +0x28) */
function jobOf(g: GameState, s: Staff): number {
  if (s.club) return JOB_CODE[s.role] ?? 8;
  const j = s.cmDbJob ?? 0;
  if (j) return j;
  return g.cmBoard?.nd?.[s.id]?.[1] ?? g.cmBoard?.nj?.[s.id] ?? 0;
}
/** staff +0x24 (landsholdet) */
const natTeam = (g: GameState, s: Staff) => !!g.cmBoard?.nd?.[s.id];

// ------------------------------------------------------------------------------------------------ check_retirement for ikke-spillere
/** 0x7a7310 (initial = false) / 0x7a79c0 (initial = true): stabens gren (+0x61 = 0, +0x69 ≠ 0) – årsag 0x20 */
export function checkStaffRetirement(g: GameState, s: Staff, todayIso: string, rand: Rand, initial = false): CmRetEntry | null {
  const club = s.club ? g.clubs[s.club] : undefined;
  if (initial && !club) return null;                                                 // 0x7a79cd
  const age = s.dob ? ageOn(s.dob, todayIso) : 45;
  // jobbet 0 og landsholdsjob 0: originalen læser en tilfældig stakbyte (en adresse) – her standardgrenen
  const job = jobOf(g, s);
  let lim: number;
  if (job === 1 || job === 2 || job === 4) lim = rand(10) + 70;                     // 0x7a73d1
  else if (job === 8 || job === 9) lim = rand(5) + 60;                               // 0x7a73bb
  else if (!club && !natTeam(g, s)) lim = rand(10) + 55;                             // 0x7a73f5
  else lim = rand(5) + 61;                                                           // 0x7a7434
  if (!(age > lim)) return null;
  const [a, r] = dates(g, s.nation, club, pairOf(todayIso), rand);
  return { id: s.id, club: club ? club.id : 0, a, r, why: 0x20, ann: 0, st: 1 };
}

/** find_new_retirements 0x7a5790 / spilstarten 0x7a58f0: ikke-spillerne (efter spillerne) – have = personer, der allerede står på listen */
export function findStaffRetirements(g: GameState, todayIso: string, rand: Rand, initial: boolean, have: Set<number>, add: (e: CmRetEntry) => void): void {
  if (!cmNpResOn(g)) return;
  for (const s of Object.values(g.staff)) {
    if (!staffInScope(g, s) || have.has(s.id)) continue;
    const club = s.club ? g.clubs[s.club] : undefined;
    if (!initial && club && s.dob && ageOn(s.dob, todayIso) < 30 && divisionActive(g, club)) continue;   // 0x7a5806
    const e = checkStaffRetirement(g, s, todayIso, rand, initial);
    if (e) add(e);
  }
}

// ------------------------------------------------------------------------------------------------ process_retirements for ikke-spillere
const D0 = (y: number) => Date.UTC(y, 0, 1) / 86400000;
const isoOf = (n: number) => new Date(n * 86400000).toISOString().slice(0, 10);
/** postens kopi af personens ikke-spillerpost */
const npOf = (s: Staff): CmNp => ({ ca: s.ca ?? 0, pa: s.cmPa ?? 0, a: (s.cmNp ?? []).slice(), rep: [...(s.cmRep ?? [1, 1, 1])] as [number, number, number],
  attrs: { ...s.attrs }, ...(s.tac ? { tac: s.tac.slice() } : {}), srep: s.rep });

/** en forfalden ikke-spillerpost (0x7a5a73–0x7a6587) */
export function settleStaff(g: GameState, e: CmRetEntry, rand: Rand): void {
  const s = g.staff[e.id];
  if (!s || !staffInScope(g, s)) return;
  const age = s.dob ? ageOn(s.dob, g.date) : 45;
  if (age < 30 && s.club) return;                                                    // 0x7a5a8b
  if (s.club) cmPlanKick(g, s.club);                                                 // 0x7a5c76: trupplanens +8 = 100
  // 0x7a6397: kø-datoen
  let due = g.date;
  if (age >= 30) {
    const t = pairOf(g.date);
    let d = rand(65) + (t % 1000) + 1, y = Math.floor(t / 1000);
    if (d > 365) { d = rand(35); y++; }
    due = isoOf(D0(y) + d);
  }
  const job = jobOf(g, s);
  if (s.club && job !== 5) {
    const go = !isHumanClub(s.club) || (job >= 1 && job <= 4);                      // 0x7a6414: 0x600a50(klub, 1, 1, 0, 0)
    if (go && (rand(4) !== 0 || (job >= 1 && job <= 4) || job === 10 || job === 9)) { rebornAsNonPlayer(g, s, job, rand); return; }
  }
  // 0x7aaeb0: væk fra klubben og landsholdet
  boardRetired(g, s.id);
  if (s.club && s.role === 'scout') s.assignment = null;
  s.club = 0;
  // 0x7a87d0: posten i reservepuljen, personen i køen (en ung regen af spillerpuljens første post – cmRegen.ts)
  (g.cmNpRes ??= []).push({ np: npOf(s), nation: s.nation >= 0 ? s.nation : rand(g.nations.length), person: s.id });
  (g.cmRegenQ ??= []).push({ due, id: s.id });
  delete g.staff[s.id];
  const log = (g.cmRetLog ??= []);
  log.push([g.date, age, 0x20, e.club, s.nation]);
  if (log.length > 6000) log.splice(0, log.length - 6000);
}

/** 0x7ab340 player_regen_regenerate_as_non_player: en ny person på pladsen (samme klub, job og ikke-spillerpost) – alderen efter jobbet,
 *  CA = rand(ftol(PA·0,75)) + 1 (mindst ftol(PA·0,5)), omdømmerne og formationen +0x43 */
function rebornAsNonPlayer(g: GameState, s: Staff, job: number, rand: Rand): void {
  const pa = s.cmPa ?? 0;
  let ca = rand(ftol(pa * 0.75)) + 1;                                               // 0x7ab4b9
  if (Math.fround(ca) < Math.fround(pa * Math.fround(0.5))) ca = ftol(Math.fround(pa * Math.fround(0.5)));
  let h = s16(rand(750) + s16(ca * 25) + 1);
  let c = s16(rand(200) + s16(ca * 15) + 1);
  if (h < c) { h = s16(c + 10); c = 1; }
  const a = s16(h + rand(50));
  // 0x7ab5a8: alderen efter jobbet (+0x3d; uden klub landsholdsjobbet +0x28)
  const AGE: Record<number, [number, number]> = { 1: [20, 36], 2: [25, 40], 3: [25, 40], 4: [10, 37], 6: [15, 35], 7: [15, 35], 8: [15, 32], 10: [25, 35] };
  const [k, b] = AGE[job] ?? [15, 39];
  const age = rand(k) + b;
  const y = +g.date.slice(0, 4) - age;
  const doy = rand(365);
  const f = rand(125);                                                               // 0x7ab94c: +0x43
  const f43 = f < 34 ? 0 : f < 40 ? 1 : f < 60 ? 2 : f < 90 ? 3 : f < 94 ? 4 : f < 96 ? 5 : f < 108 ? 6 : f < 111 ? 7 : f < 121 ? 8 : 9;
  const r = new Rng(hash(g.seed ?? 0, s.id, dayNo(g.date), 0x7ab340));
  const [first, last] = randomName(g.names, s.nation, r);
  s.first = first; s.last = last;
  s.dob = isoOf(D0(y) + doy);
  s.ca = ca;
  s.cmRep = [h, a, c];
  if (s.cmNp) s.cmNp[21] = f43;
  if (s.cmHid) s.cmHid[8] = 0;                                                       // +0x22/+0x23 = 0
  s.cmJoined = g.date;                                                               // +0x3e/+0x40
  s.cmId = undefined; s.cmRel = undefined; s.exPlayer = undefined; s.career = undefined;
}

// ------------------------------------------------------------------------------------------------ en spiller får en ikke-spillerpost
/** R(x, P, f, K): max(P, x)·f under K → ftol, ellers ftol(K) */
const R = (x: number, P: number, f: number, K: number) => { const m = Math.max(P, x) * f; return m < K ? ftol(m) : ftol(K); };

/** posten bliver spillerens (0x7a5d78–0x7a5ddd / 0x7a66f6–0x7a6752): Coaching GK-justeringen for målmænd (+0xf = 20) og 0x539490 */
function npForPlayer(g: GameState, p: Player, res: CmNpRes, rand: Rand): Staff {
  const np: CmNp = res.np ?? { ca: 0, pa: 0, a: new Array(22).fill(0), rep: [1, 1, 1] };
  const a = np.a.slice();
  while (a.length < 22) a.push(0);
  const pr = prOf(p);
  if (pr.gk === 20 && ((a[2] << 24) >> 24) > ((a[3] << 24) >> 24)) {               // +0x10 > +0x11: byttes
    const t = a[3]; a[3] = a[2]; a[2] = t;
    if (rand(4) === 0) a[3] = rand(50) + 50;
  }
  const cmNp = rebalanceStaffNp(np.ca, np.pa, a, 11);
  const attrs = np.attrs ?? { coaching: 1, judgingAbility: 1, judgingPotential: 1, physio: 1, motivating: 1, discipline: 1, tactics: 1 };
  const role: StaffRole = 'coach';
  const s: Staff = {
    id: g.nextId.staff++, first: p.first, last: p.last, nation: p.nation, dob: p.dob, club: 0, role, attrs: { ...attrs }, rep: np.srep ?? 1, wage: 0, expires: '',
    cmNp, ca: np.ca, cmPa: np.pa, cmId: p.id, cmMem: true, cmExtra: true, cmJob: 11, cmDbJob: 11, cmHid: hidOf(p), cmRep: [1, 1, 1],
    ...(np.tac ? { tac: np.tac.slice() } : {}),
  };
  if (p.club) s.cmClub = p.club;
  g.staff[s.id] = s;
  return s;
}

/** 0x7a5cdb: den pensionerede spiller uden ikke-spillerpost bliver ikke-spiller (puljens første post) – null: nej */
export function npOnRetire(g: GameState, p: Player, rand: Rand): Staff | null {
  const res = g.cmNpRes;
  if (!res) return null;
  const prof = pa8(p, A.prof), caps = Math.min(255, p.caps ?? 0);
  const pr = prOf(p);
  if (!(rand(prof) > rand(100))) return null;
  const P = caps ** 2;
  if (!(rand(ftol(caps ** 3 + pr.cur)) > rand(50000))) {
    const r2 = rand(200000) + 200000;
    if (!(s16(nation8e(g, p.nation)) * caps > r2)) return null;
  }
  if (res.length <= 2) return null;
  const e = res.shift()!;                                                            // [this+0x1c] + 0 → 0x7a82b0
  const s = npForPlayer(g, p, e, rand);
  // omdømmerne (§2.12): P = landskampe², verden af P·0,75
  const Pc = P * 0.75;
  let h: number, a: number, c: number;
  if (pr.cur > 7500) { a = R(pr.cur, P, 0.9, 7500); h = R(pr.home, P, 0.9, 7500); c = R(pr.world, Pc, 0.9, 5750); }
  else if (rand(pa8(p, A.amb)) !== 0) { a = R(pr.cur, P, 0.75, 6000); h = R(pr.home, P, 0.75, 6000); c = R(pr.world, Pc, 0.75, 3750); }
  else { a = R(pr.cur, P, 0.5, 4500); h = R(pr.home, P, 0.5, 4500); c = R(pr.world, Pc, 0.5, 1.0); }
  s.cmRep = [s16(h), s16(a), s16(c)];
  return s;
}

/** 0x7a7150: scoren for at få en ikke-spillerpost (−10000: har post, meldt/pensioneret eller under 31 år) */
function npScore(g: GameState, p: Player, rand: Rand): number {
  if (npStaffOf(g, p) || p.cmRetire) return -10000;
  const age = ageOn(p.dob, g.date);
  if (age < 31) return -10000;
  const pr = prOf(p);
  let v = rand((age - 31) * 150);
  const club = p.club ? g.clubs[p.club] : undefined;
  const crep = club ? s16(clubRepMem(g, club.id)) : 0;
  if (club && crep !== 0) v += 250 * ftol(pr.cur / crep);
  v += rand(ftol(ftol(pr.infl / 2) ** 3));
  if (pr.world > 7500) v += 100;
  if (pr.cur > 7500) v += 50;
  const b = ftol(pa8(p, A.prof) ** 2) + ftol(pa8(p, A.amb) ** 2);
  const pers = (pa8(p, A.pres) + pa8(p, A.temper)) * 3 + (pa8(p, A.loy) + pa8(p, A.det)) * 2 + pa8(p, A.adapt);
  v = 5 * pers + v + b;
  if (club) return rand(club.manager ? v : v + 75);
  const caps = Math.min(255, p.caps ?? 0);
  v += caps * caps;
  if (pr.world > rand(10000)) v *= 2;
  return rand(v);
}

/** 0x7a6e60: postens nation først (bedste > 0 over −1000), ellers alle (over −15000) */
function pickForNp(g: GameState, nation: number, rand: Rand): Player | null {
  // (de, 0x7a7150 giver −10000 uden tilfældige tal – har post, meldt/pensioneret eller under 31 år – kan aldrig vælges og sorteres fra først)
  const people = Object.values(g.players).filter((p) => !p.virtual && !p.cmRetire && ageOn(p.dob, g.date) >= 31 && cmInMemory(g, p) && !npStaffOf(g, p));
  let best: Player | null = null, bv = -1000;
  for (const p of people) {
    if (p.nation !== nation) continue;
    const v = npScore(g, p, rand);
    if (v > bv && v > 0) { bv = v; best = p; }
  }
  if (best) return best;
  bv = -15000;
  for (const p of people) {
    const v = npScore(g, p, rand);
    if (v > bv && v > 0) { bv = v; best = p; }
  }
  return best;
}

/** 0x7a66bd–0x7a6e10 (efter regen-køen): (puljen − 2) gange får en aktiv spiller puljens første post */
export function cmNpAssign(g: GameState): void {
  const res = g.cmNpRes;
  if (!res || res.length <= 2) return;
  const rand = cmRand(g.seed ?? 0, dayNo(g.date), 0x7a65d0);
  const n = res.length - 2;
  for (let i = 0; i < n && res.length; i++) {
    const p = pickForNp(g, res[0].nation, rand);
    if (!p) return;
    const e = res.shift()!;
    const s = npForPlayer(g, p, e, rand);
    const pr = prOf(p);
    const club = p.club ? g.clubs[p.club] : undefined;
    if (club && !isHumanClub(club.id)) {
      const crep = s16(clubRepMem(g, club.id));
      const mine = Object.values(g.staff).filter((x) => (x.club === club.id && !x.cmExtra) || (x.cmExtra && x.cmClub === club.id));
      const coaches = mine.filter((x) => (x.cmExtra ? x.cmJob === 15 : x.role === 'coach')).length;
      const hasAsst = mine.some((x) => (x.cmExtra ? x.cmJob === 13 : x.role === 'assistant'));
      let job = 11;
      if (crep * 0.5 > pr.cur) {
        if (coaches < 5) job = 15;                                                   // 0x7a67cd: første ledige trænerplads
        else if (!hasAsst) job = 13;
      } else if (crep * 0.75 > pr.cur && !hasAsst) job = 13;                         // 0x7a688e
      s.cmJob = job; s.cmDbJob = job;
    }
    // omdømmerne (§2.13): som 0x7a5cdb, men lofterne 7500/6000/4500 for alle tre
    const caps = Math.min(255, p.caps ?? 0), P = caps ** 2, Pc = P * 0.75;
    let h: number, a: number, c: number;
    if (pr.cur > 7500) { a = R(pr.cur, P, 0.9, 7500); h = R(pr.home, P, 0.9, 7500); c = R(pr.world, Pc, 0.9, 7500); }
    else if (rand(pa8(p, A.amb)) !== 0) { a = R(pr.cur, P, 0.75, 6000); h = R(pr.home, P, 0.75, 6000); c = R(pr.world, Pc, 0.75, 6000); }
    else { a = R(pr.cur, P, 0.5, 4500); h = R(pr.home, P, 0.5, 4500); c = R(pr.world, Pc, 0.5, 4500); }
    s.cmRep = [s16(h), s16(a), s16(c)];
  }
}
