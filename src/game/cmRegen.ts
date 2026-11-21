// Originalens regens (PLAYER_REGEN, player_regen.cpp i cm0102.exe 3.9.68) – spil med originalens pensioneringsliste (cmRetireOn: enhver
// CM-database i ægte tilstand). Læst 21/11-2026:
//   • Puljen af spillerposter (PLAYER_REGEN +0x3c/+0x40, 16 bytes: +0 posten, +4 nationen, +8 anden nation, +0xc personen): HVER pensioneret
//     spiller lægger sin post i puljen – også den, der bliver stab (0x7a59e0 0x7a62c2 → add_player_data_to_pool 0x7a8350, uden kø-post).
//   • Køen (+0x10/+0x14, 12 bytes: +0 personen, +4 datoen): spillere uden ikke-spillerpost (0x7a64e2) og stabens pensioner (0x7a64c9 – ikke
//     porteret) → queue_staff_for_regen 0x7a87d0; sorteres efter (dato, person) til sidst i 0x7a59e0 (qsort 0x7ae240, 0x7a65a2).
//   • process_regen_queue 0x7a65d0 (0x5cda7a): så længe køens første post er forfalden og puljen ikke er tom → 0x7abac0 på køens person med
//     PULJENS FØRSTE post (FIFO): PA'en er postens uændret, positionerne/egenskaberne følger posten, nationen er postens.
//   • regenerate_as_youth_player 0x7abac0: nationen (0x7abcd4–0x7abd1d), anden nation (0x7abd20), alder/CA/omdømme ad to veje (0x7abe87 / 0x7ac3dd),
//     de store landes verdensomdømme (0x549ea0, 0x7ac6f6), fødselsdatoen (0x7ac73b), klubben (0x7ace65–0x7acf61): pick_best_club_for_player
//     0x7ad0e0 (score 0x7ad220) eller pick_club_from_nation_list 0x7ad590 (listerne 0x7acfc0 fra indlæsningen) → player_regen_sign_for_club
//     0x7a6f10; uden klub og under 20: omdømmet ≤ 1250, verdensomdømme 1 (0x7acf61).
// *Ikke porteret*: de personlige/mentale egenskaber 0x7ac7c5–0x7ace62 (spillets profil efter forbilledet, season.ts), nyheden 0xbce til menneskets
// klub (0x7a8ba0), formandens yndling (0x547a10, 0x7acedb) og 0x547d90 i 0x7a6f10, værdien 0x4d0c60 ved underskriften (værdierne regnes dagligt),
// stabens pensioner (køens poster uden spillerpost); en spansk anden nation med rand(100) = 0 beholder pladsens gamle (her: ingen).
import type { Club, GameState, RegenSeed } from './types';
import { cmRand } from './cmPlayerData';
import { nationLoaded } from './cmFinance';
import { linkedClub } from './cmBTeam';
import { NATION_MONTH } from './cmContractEnd';
import { isHumanClub } from './humans';
import { npShown } from './cmStaffInit';
import { KEY_CLUB_GLOBALS } from './cmKeyIds';
import { squad } from './state';

type Rand = (n: number) => number;
/** nation +0x88: de indlæste spillere af nationaliteten (0x524d70) – én optælling pr. spil (som cmBoardGame.ts natPlayers) */
const n88Cache = new WeakMap<GameState, Record<number, number>>();
function natPlayers(g: GameState, n: number): number {
  let m = n88Cache.get(g);
  if (!m) { m = {}; for (const p of Object.values(g.players)) if (!p.virtual) m[p.nation] = (m[p.nation] ?? 0) + 1; n88Cache.set(g, m); }
  return m[n] ?? 0;
}
const ftol = Math.trunc;
const s16 = (v: number) => ((v & 0xffff) << 16) >> 16;
const dayNo = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** køens post: forfaldsdagen og personen (den pensioneredes id) */
export interface CmRegenQ { due: string; id: number }

/** 0x7a8350 / 0x7a87d0 (+0x3c): spillerposten i puljen; 0x7a87d0 (+0x10): kø-posten (kun uden ikke-spillerpost) */
export function cmRegenRetired(g: GameState, seed: RegenSeed, toQueue: boolean, due: string, id: number): void {
  if (seed.pa > 0) (g.cmRegenPool ??= []).push(seed);
  if (toQueue) (g.cmRegenQ ??= []).push({ due, id });
}
/** 0x7a65a2: qsort 0x7ae240 – datoen, så personen */
export function cmRegenSortQueue(g: GameState): void {
  g.cmRegenQ?.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.id - b.id));
}
/** 0x7a65d0: de forfaldne kø-poster med puljens første post (FIFO) */
export function cmRegenDue(g: GameState): { q: CmRegenQ; rec: RegenSeed }[] {
  const Q = g.cmRegenQ, P = g.cmRegenPool, out: { q: CmRegenQ; rec: RegenSeed }[] = [];
  while (Q?.length && Q[0].due <= g.date && P?.length) out.push({ q: Q.shift()!, rec: P.shift()! });
  return out;
}

// ------------------------------------------------------------------------------------------------ landene/klubberne
const nationId = (g: GameState, name: string) => g.nations.findIndex((n) => n.name === name);
const keyIds = new WeakMap<GameState, Record<string, number>>();
function K(g: GameState): Record<string, number> {
  let k = keyIds.get(g);
  if (!k) {
    k = {};
    for (const n of ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland', 'Australia', 'New Zealand', 'Italy', 'Ukraine',
      'Portugal', 'Spain', 'Pays Basque', 'Saudi Arabia', 'Turkey', 'France', 'Germany', 'Holland']) k[n] = nationId(g, n);
    keyIds.set(g, k);
  }
  return k;
}
const clubKeys = new WeakMap<GameState, Map<number, number>>();
/** de faste klub-id'er ([0x9d00a4] …, cmKeyIds.ts) – adressen → spillets klub-id (−1 = ikke i spillet) */
function clubKey(g: GameState, adr: number): number {
  let m = clubKeys.get(g);
  if (!m) {
    m = new Map();
    const byName = new Map<string, number>();
    for (const c of Object.values(g.clubs)) if (!byName.has(c.name)) byName.set(c.name, c.id);
    for (const [a, nm] of KEY_CLUB_GLOBALS) m.set(a, byName.get(nm) ?? -1);
    clubKeys.set(g, m);
  }
  return m.get(adr) ?? -1;
}
const isClub = (g: GameState, c: Club, ...adr: number[]) => adr.some((a) => clubKey(g, a) === c.id);
/** 0x53d7f0: Spaniens 23 klubber (PL23 i cmClubLinks.ts) */
const PL23 = [0x9d0120, 0x9d0134, 0x9d02e4, 0x9d02e8, 0x9d02ec, 0x9d02f0, 0x9d02f4, 0x9d02f8, 0x9d02fc, 0x9d0304, 0x9d0308, 0x9d030c, 0x9d0310,
  0x9d0314, 0x9d0318, 0x9d031c, 0x9d0320, 0x9d0324, 0x9d0328, 0x9d032c, 0x9d0330, 0x9d0334, 0x9d0338];
const BASQUE_CLUBS = [0x9d0120, 0x9d0134, 0x9d0128, 0x9d01a0, 0x9d0124];   // Bilbao, Bilbao B, Real Sociedad, Real Sociedad B, Alavés

/** 0x53d980(person, land, 1) for en person med nation n og anden nation n2 uden kontrakt: 0 = landet er hans (også via landegrupperne) */
function notOfNation(g: GameState, n: number, n2: number, nat: number): number {
  if (nat < 0) return 1;
  if (n === nat || (n2 >= 0 && n2 === nat)) return 0;
  const k = K(g);
  const UK = [k.England, k.Scotland, k.Wales, k['Northern Ireland'], k['Republic of Ireland']];
  if (UK.includes(nat) && (UK.includes(n) || (n2 >= 0 && UK.includes(n2)))) return 0;
  if (n >= 0 && (nat === k.Australia || nat === k['New Zealand']) && (n === k.Australia || n === k['New Zealand'])) return 0;
  if (nat === k.Italy && n === k.Ukraine) return 0;
  return 1;                                                    // Portugal (0x53dab6): uden kontrakt → 1
}

/** club +0x80 (omdømmet i hukommelsen) */
const repOf = (g: GameState, c: Club) => g.cmClubRep?.[c.id] ?? Math.round(c.rep * 100);
/** club +0x57 ≠ 0 og divisionens turnering findes ([0xadadfc]) */
function divComp(g: GameState, c: Club): boolean {
  const comp = g.comps[c.league];
  return !!comp && comp.type === 'league' && !g.leagues[c.league]?.hidden;
}
const hasDivision = (g: GameState, c: Club) => (g.cmFinRaw?.[c.id]?.[0] ?? (c.league ? 0 : -1)) >= 0;
/** club +0xd7 (50 pladser) / 0x53c590: truppens spillere */
const squadCount = (_g: GameState, c: Club) => squad(c.id).filter((p) => !p.virtual).length;

/** 0x8ce990 can_club_bid_for_player for en ny klubløs regen (ingen bud, lister eller handler endnu): Saudi-Arabien, de spanske/baskiske og de
 *  tyrkiske regler */
function canSign(g: GameState, r: RegenView, c: Club): boolean {
  const k = K(g);
  if (r.nation === k['Saudi Arabia'] && c.nation !== r.nation) return false;                       // 0x8ce9ce
  if (c.nation === k.Spain && isClub(g, c, ...PL23) && notOfNation(g, r.nation, r.n2, k['Pays Basque'])) return false;   // 0x8ceba4
  if (c.nation === k.Turkey && g.comps[c.league]?.name !== 'Turkish Premier Division' && notOfNation(g, r.nation, r.n2, c.nation)) return false;
  if (isClub(g, c, 0x9d0128, 0x9d01a0) && r.nation === k.Spain && r.n2 !== k['Pays Basque']) return false;     // 0x8ceca9
  return true;
}

export interface RegenView { nation: number; n2: number; pa: number; ca: number; rep: [number, number, number] }

/** 0x7ad220(regen, klub, truppens størrelse): klubbens score for regen'en (rand af en 16-bit sum) */
function scoreClub(g: GameState, r: RegenView, c: Club, squadN: number, rand: Rand): number {
  const rep = repOf(g, c), cur = r.rep[1], fac = s16(c.facilities << 24 >> 24);
  let s = rep - Math.abs(cur - rep) - Math.abs(s16(r.pa * 50) - rep) - Math.abs(s16(r.ca * 50) - rep) + 5000;
  if (r.pa > rand(20) + 100) {
    if (fac === 20) s += ftol(rep / 2) + 7000;
    else if (rand(fac) > rand(20)) s += ftol(rep / 2) + (fac + 100) * 50;
  }
  const human = isHumanClub(c.id);
  if (r.pa > 50 && divComp(g, c)) {
    if (human && r.pa > 120) { const mood = (g.cmClubMood?.[c.id] ?? 0) << 24 >> 24; if (mood < 0) s += 500; else if (mood === 0) s += 250; }
    if (rep > 5750) s += squadN < 40 ? 1000 : squadN < 45 ? 750 : 250;
    else if (rep > 4250) s += squadN < 35 ? 750 : squadN < 40 ? 500 : 250;
    else s += 250;
  }
  const mgr = c.manager > 0 ? g.staff[c.manager] : undefined;
  if (mgr?.cmNp && !human) {
    const b22 = mgr.cmNp[0x22 - 0x0e] << 24 >> 24;
    s += (b22 - 10) * 30;
    const jp = npShown(mgr, 0x18) ?? 10;
    if (r.pa > rand(75) + 100) s += (jp - 10) * 60;
    if (jp + b22 + fac > 40 && rep > 4250 && r.pa > 80) { if (s16(s) < s16(rep)) s = rep; else s += 250; }
  } else if (human) {
    s += 200;
    if (r.pa > 120) { if (fac === 20 && s16(s) < s16(rep)) s = rep; s += fac * 25; }
  }
  const k = K(g);
  if (r.nation === c.nation) s += 1000;
  if (isClub(g, c, 0x9d0430, 0x9d0434, 0x9d043c)) {                  // Swansea, Cardiff, Wrexham
    if (r.nation === k.Wales) s += 1000; else if (r.nation === k.England) s -= 750;
  }
  if (c.nation === k.England && (r.nation === k.Wales || r.nation === k.England)) s -= 750;
  return rand(s16(s));
}

const idsCache = new WeakMap<GameState, number[]>();
/** klubberne i id-rækkefølgen (klubtabellen) */
function clubIds(g: GameState): number[] {
  let v = idsCache.get(g);
  if (!v) { v = Object.keys(g.clubs).map(Number).sort((a, b) => a - b); idsCache.set(g, v); }
  return v;
}

/** 0x7ad0e0: den bedste klub (score > −25000) blandt klubberne i regen'ens land (0x53d980), ikke B-hold, under 50 i truppen */
function pickBest(g: GameState, r: RegenView, rand: Rand): Club | undefined {
  let best: Club | undefined, top = -25000;
  for (const id of clubIds(g)) {
    const c = g.clubs[id];
    if (!c || notOfNation(g, r.nation, r.n2, c.nation)) continue;
    const l = linkedClub(g, c.id);
    if (l && !l.first) continue;                                                           // 0x540a50: reserveholdet
    if (r.n2 === K(g)['Pays Basque'] && !isClub(g, c, ...BASQUE_CLUBS)) continue;
    const n = squadCount(g, c);
    if (!canSign(g, r, c) || n >= 50) continue;
    const v = s16(scoreClub(g, r, c, n, rand));
    if (v > top) { best = c; top = v; }
  }
  return best;
}

const lists = new WeakMap<GameState, Map<number, number[]>>();
/** 0x7acfc0 (ved indlæsningen): landenes klublister – klubber med division i lande med verdensdel (+0x71); i de indlæste lande kun med omdømme ≤ 2 */
function nationList(g: GameState, n: number): number[] {
  let m = lists.get(g);
  if (!m) {
    m = new Map();
    const mls = [clubKey(g, 0x9d00a4), clubKey(g, 0x9d00a8)];
    for (const c of Object.values(g.clubs).sort((a, b) => a.id - b.id)) {
      if (c.nation < 0 || (g.cmNationCont?.[c.nation] ?? 0) < 0) continue;
      if (!hasDivision(g, c)) continue;
      if (nationLoaded(g, c.nation) && repOf(g, c) > 2) continue;
      if (mls.includes(c.id)) continue;
      const L = m.get(c.nation) ?? [];
      L.push(c.id);
      m.set(c.nation, L);
    }
    lists.set(g, m);
  }
  return m.get(n) ?? [];
}

/** 0x7ad590: klubben fra landets liste (Wales/Irland – og Nordirland med rand(5) < 2 – bruger Englands) med højst rand(score) */
function pickFromList(g: GameState, r: RegenView, rand: Rand): Club | undefined {
  const k = K(g);
  let n = r.nation;
  if (n === k.Wales || n === k['Republic of Ireland'] || (n === k['Northern Ireland'] && rand(5) < 2)) n = k.England;
  let best: Club | undefined, top = -25000;
  for (const id of nationList(g, n)) {
    const c = g.clubs[id];
    if (!c) continue;
    if (r.n2 === k['Pays Basque'] && !isClub(g, c, ...BASQUE_CLUBS)) continue;
    if (!canSign(g, r, c) || squadCount(g, c) >= 50) continue;
    const rep = repOf(g, c);
    const v = s16(rand(s16(rep - Math.abs(r.rep[1] - rep) - Math.abs(r.pa * 50 - rep) - Math.abs(r.ca * 50 - rep) + 5000)));
    if (v > top) { best = c; top = v; }
  }
  return best;
}

// ------------------------------------------------------------------------------------------------ 0x7abac0
export interface CmRegenPlan { nation: number; n2: number; age: number; dob: string; ca: number; rep: [number, number, number]; club?: Club; contractEnd?: string }

/** 0x7abac0 for spillerposten rec på personen id: alt undtagen egenskaberne og selve personen (season.ts) */
export function cmRegenPlan(g: GameState, rec: RegenSeed, id: number): CmRegenPlan {
  const rand = cmRand(g.seed ?? 0, dayNo(g.date), id, 0x7abac0);
  const year = +g.date.slice(0, 4);
  const cont = (n: number) => n >= 0 && (g.cmNationCont?.[n] ?? 0) >= 0;
  // 0x7abcd4: nationen – et lille land (+0x88 < 100) bytter med rand(4) = 0 til et tilfældigt lille land med verdensdel
  let nation = rec.nation;
  if (natPlayers(g, nation) < 100 && rand(4) === 0) {
    const j = rand(g.nations.length);
    if (cont(j) && natPlayers(g, j) < 100) nation = j;
  }
  // 0x7abd20: anden nation – Baskerlandet altid, ellers rand(3) = 0
  const k = K(g);
  let n2 = -1;
  const r2 = rec.n2 ?? -1;
  if (r2 > 0 && r2 < g.nations.length && !(nation === k.Spain && rand(100) === 0) && (r2 === k['Pays Basque'] || rand(3) === 0)) n2 = r2;
  const pa = rec.pa;
  const loaded = nationLoaded(g, nation);
  const n88 = natPlayers(g, nation);
  const [GK, SW, D, , , , F] = rec.pos;
  let age: number, ca: number, home: number, cur: number, world: number;
  if (!loaded && n88 < 350) {
    // 0x7abea0: sti 1 (et ikke indlæst land med under 350 spillere)
    age = rand(n88) < rand(1000) ? rand(5) + 23 : rand(7) + 17;
    ca = age > 20 ? ftol(rand(ftol(pa * 0.55)) + pa * 0.25) : ftol(rand(ftol(pa * 0.6)) + pa * 0.25);
    home = rand(750) + ca * 30 + 250;
    if (pa > 140 && ca > 100 && home < 6500 && age > 18 && age < 22 && rand(4) !== 0) home = ftol(home * 1.2);
    if (age <= 18) world = ca < 140 ? rand(200) + ca * 5 + 1 : rand(200) + (ca + 25) * 10;
    else if (ca < 120) world = rand(200) + ca * 15 + 1;
    else if (age > 21 && ca > 120) world = rand(200) + (ca + 10) * 25;
    else world = ca < 140 ? rand(200) + ca * 20 + 1 : rand(200) + ca * 20 + 250;
    if (home < 2250) world = rand(5) + 1;
    if (home < world) { home = world + 10; world = 1; }
    cur = rand(50) + home;
    if (age > 23) {
      if (home < 6000) home = ftol(home * 1.35);
      if (cur < 6000) cur = ftol(cur * 1.35);
    } else if (age < 20) {
      if (ca < ftol(pa * 0.5) && rand(4) !== 0) ca = ftol(pa * 0.5);
      if (ca > 120 && rand(age < 18 ? 150 : 50) !== 0) ca = 120;
    } else {
      if (home < 5750) home = ftol(home * 1.25);
      if (cur < 5750) cur = ftol(cur * 1.25);
      if (ca < ftol(pa * 0.6) && rand(4) !== 0) ca = ftol(pa * 0.6);
      if (ca > 140 && rand(50) !== 0) ca = 140;
    }
  } else {
    // 0x7ac3dd: sti 2 – CA efter positionen, alderen efter rand(10000)
    ca = F === 20 ? ftol(rand(ftol(pa * 0.6)) + pa * 0.3) : D === 20 || SW === 20 ? ftol(rand(ftol(pa * 0.55)) + pa * 0.25)
      : GK === 20 ? ftol(rand(ftol(pa * 0.5)) + pa * 0.25) : ftol(rand(ftol(pa * 0.6)) + pa * 0.25);
    if (rand(250) !== 0) { home = rand(750) + ca * 20 + 250; world = rand(20) + ca * 5 + 1; }
    else { home = rand(750) + ca * 15 + 125; world = 1; }
    if (home < world) { home = world + 10; world = 1; }
    cur = rand(50) + home;
    const x = rand(10000);
    const cap = (lim: number, odds: number) => { if (ca > lim && rand(odds) !== 0) ca = lim; };
    if (x === 0) { age = rand(4) + 15; if (age === 15) cap(80, 250); else cap(100, 150); }
    else if (x < 5000) { age = rand(3) + 16; if (age < 18) cap(80, 250); else cap(100, 150); }
    else if (x > 9975) age = rand(6) + 21;
    else { age = rand(4) + 17; if (age === 17) cap(90, 250); else cap(110, 150); }
  }
  // 0x7ac6f6: uden for de store lande (0x549ea0: England, Frankrig, Tyskland, Italien, Spanien, Holland) – verdensomdømmet ned
  if (![k.England, k.France, k.Germany, k.Italy, k.Spain, k.Holland].includes(nation)) {
    if (age < 25 && ca < 120) world = 1; else world = ftol(world * 0.65);
  }
  // 0x7ac73b: fødselsåret = i år − alder, dagen rand(365)
  const dob = new Date(Date.UTC(year - age, 0, 1 + rand(365))).toISOString().slice(0, 10);
  const view: RegenView = { nation, n2, pa, ca, rep: [home, s16(cur), world] };
  // 0x7ace65: klubben
  let club: Club | undefined;
  if (age < 19 && loaded && rand(4) !== 0) club = pickBest(g, view, rand);
  else if ((!loaded && rand(15) !== 0) || rand(10) === 0) club = pickFromList(g, view, rand);
  let contractEnd: string | undefined;
  if (club) {
    // 0x7a6f10: under 19 → om 2 år, ellers om 1 + rand(6) år; dagen rand(28) + 1 i landets sæsonslutmåned (0x4d45f0); computerklubber højst 1/1 om 5 år
    const y = age < 19 ? year + 2 : year + rand(6) + 1;
    const month = NATION_MONTH[g.nations[club.nation]?.name ?? ''] ?? 6;
    const day = rand(28) + 1;
    contractEnd = !isHumanClub(club.id) && y > year + 5 ? `${year + 5}-01-01` : `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } else if (age < 20) {
    // 0x7acf61: klubløs og under 20
    if (cur > 1250) cur = 1250;
    if (home > 1250) home = 1250;
    world = 1;
  }
  return { nation, n2, age, dob, ca, rep: [home, cur, world], club, contractEnd };
}

/** omdømmet i hukommelsen (+9/+0xb/+0xd) → Player.cmRepMem (÷50) */
export const repMem = (r: [number, number, number]): [number, number, number] => [r[0] / 50, r[1] / 50, r[2] / 50];
