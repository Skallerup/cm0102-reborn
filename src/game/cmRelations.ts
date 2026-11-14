// Originalens forhold mellem personer og klubber (cm0102.exe 3.9.68, afkodet 12/11-2026 – noten ~/cm0102-engine/notes/relations.md):
//
//   staff+0x65 (præferenceposten, én pr. person):  +4/+8/+0xc   klubber   (0x547d60 – "yndlingsklubber"; databasens første tripel)
//                                                  +0x10..+0x18 klubber   (0x547d30 – "uvenklubber")
//                                                  +0x1c..+0x24 personer  (0x547810 – yndlingspersoner)
//                                                  +0x28..+0x30 personer  (0x547840 – uvenner)
//   club +0x9b/+0x9f/+0xa3 personer (0x547790)  og  +0xa7/+0xab/+0xaf personer (0x5477d0)
//
// Startværdierne er databasens: staff.dat +97..+144 (originaludgavens 157-bytes post) og club.dat +155..+178 – personer/klubber, der ikke er
// indlæst, bliver 0 på deres plads (kontrolleret mod oraklet: kampsporets RP-linjer ls20 = databasens præferencer for de indlæste, 148/180
// spillere plads for plads; resten har en person uden for spillet eller én af spillets hændelser). Skriverne i spillet:
//   game_update_squad_relationships 0x5d6d10 (dagligt fra 0x5cccd0, efter 0x5ce2d0/0x5ce0b0 – IKKE i forkørslen 0x5cc850): 10 forsøg pr. dag
//     (en tilfældig klub, to tilfældige af dens 50 pladser; rand(Professionalism) = 0 → uven fjernes / rand(3) = 0 ny uven / rand(3) = 0 ny
//     yndling / ellers yndlingen fjernes); dag i året % 50 = 0: trunc(klubber/100) klubber gennem 0x5d7190, ellers personløkken 0x5d6f15;
//   udviklingsblokken i 0x5ce2d0 (cmDevelop.ts): personligheden 0x5d3b43 (Loyalty 20 → 0x547d90, Loyalty 1 → 0x547f50) og falmningen 0x547f90;
//   0x867700 (kontraktens klage sættes, cmPlayerData.ts cmFlagSet): managerens uven 0x547af0 (0x867835–0x867915);
// Ikke porteret (systemer, spillet ikke har, eller som er de andre porteringers): formanden (club +0xbf – findes ikke hos os: 0x5cf1fe,
// 0x867918, 0x8c9a3e), mediehistorierne (0x72c1f0, 0x735870, 0x736c00, 0x741020, 0x744240, 0x755340, 0x75a340), skadernes nyheder 0x630ee0,
// bøderne 0x5a5980, transfers 0x842320/0x8c1290/0x8c18c0, AWOL 0x419840, tvister 0x569ed0/0x56a100, kontrakterne 0x4ce4e0 og 0x5ce2d0's
// kontraktgrene 0x5d1a47/0x5d1e45 (managerens/klubbens uven ved klager), kampens hændelser 0x6b74a0/0x6b79a0, regens 0x7abac0,
// Staff_Records 0x86dc30 og 0x7a3a10/0x7a6f10/0x69ba50/0x444930/0x448760/0x4e06e0. Primitiverne nedenfor er alle porteret, så de kan kobles på.
//
// Kun den originale database i ægte tilstand (cmActive). Tilfældighederne trækkes af egne talrækker (cmRand) – spillets rng røres ikke.
import type { Club, GameState, Player, Staff } from './types';
import { ATTRS } from './attributes';
import { cmActive, cmRand, setRelFlagHook } from './cmPlayerData';
import { ageOn } from './dates';
import { isHumanClub } from './humans';

export type Person = Player | Staff;
const s8 = (v: number) => (v << 24) >> 24;
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const doyOf = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`), y = d.getUTCFullYear(); return Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000); };

/** pladserne i præferenceposten (Player.cmRel/Staff.cmRel): +4, +0x10, +0x1c, +0x28 */
export const FAV_CLUB = 0, DIS_CLUB = 3, FAV_PERSON = 6, DIS_PERSON = 9;

const isPlayer = (s: Person): s is Player => 'pos' in s;
/** personens nøgle (hukommelsens peger): databasens person-id – stab uden for databasen får en nøgle uden for id-rummet */
export function personKey(s: Person | null | undefined): number {
  if (!s) return 0;
  if (isPlayer(s)) return s.id;
  return s.cmId ?? 1_000_000_000 + s.id;
}
/** staffpostens skjulte egenskab (+0x56 Adaptability … +0x5d Temperament) som byte */
const HID = ['adaptability', 'ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'] as const;
export function hidOf(s: Person, k: (typeof HID)[number]): number {
  if (isPlayer(s)) return s8(Math.round(s.attrs[ATTRS.indexOf(k as never)] || 10));
  return s8(s.cmHid?.[HID.indexOf(k)] ?? 10);
}
/** præferenceposten (oprettes ved første skrivning – alle databasens personer har en i originalen) */
const blk = (s: Person): number[] => (s.cmRel ??= Array(12).fill(0));
const has3 = (b: number[] | undefined, at: number, x: number) => !!b && !!x && (b[at] === x || b[at + 1] === x || b[at + 2] === x);

// ---------------------------------------------------------------- læserne

/** 0x547810(t, o): o's yndlingspersoner (+0x1c..+0x24) rummer t */
export const favoursPerson = (o: Person | null | undefined, t: number) => !!o && has3(o.cmRel, FAV_PERSON, t);
/** 0x547840(t, o): o's uvenner (+0x28..+0x30) rummer t */
export const dislikesPerson = (o: Person | null | undefined, t: number) => !!o && has3(o.cmRel, DIS_PERSON, t);
/** 0x547d60(o, klub): +4..+0xc rummer klubben */
export const favoursClub = (o: Person | null | undefined, club: number) => !!o && has3(o.cmRel, FAV_CLUB, club);
/** 0x547d30(o, klub): +0x10..+0x18 rummer klubben */
export const dislikesClub = (o: Person | null | undefined, club: number) => !!o && has3(o.cmRel, DIS_CLUB, club);
/** 0x547790(t, klub): club +0x9b/+0x9f/+0xa3 rummer t */
export const clubFavours = (c: Club | null | undefined, t: number) => !!c && has3(c.cmPrefs, 0, t);
/** 0x5477d0(t, klub): club +0xa7/+0xab/+0xaf rummer t */
export const clubDislikes = (c: Club | null | undefined, t: number) => !!c && has3(c.cmPrefs, 3, t);

// ---------------------------------------------------------------- skriverne (0x547870–0x548082)

/** fælles mønster for 0x547a10/0x547af0/0x547d90/0x547e70/0x547870/0x547940: findes x i "add"-tripellen → intet; i "mod"-tripellen → den første
 *  plads ryddes; ellers den første tomme plads i "add"-tripellen; alle optaget og flag → rand(3) vælger pladsen (0/1/2) */
function addTo(b: number[], add: number, mod: number, x: number, flag: boolean, rand: (n: number) => number): void {
  if (b[add] === x || b[add + 1] === x || b[add + 2] === x) return;
  for (let k = 0; k < 3; k++) if (b[mod + k] === x) { b[mod + k] = 0; return; }
  for (let k = 0; k < 3; k++) if (!b[add + k]) { b[add + k] = x; return; }
  if (!flag) return;
  const r = rand(3);
  if (r >= 0 && r <= 2) b[add + r] = x;
}
/** første plads med x ryddes (0x547c10/0x547c50/0x547bd0/0x547f50) */
function clear3(b: number[] | undefined, at: number, x: number): void {
  if (!b || !x) return;
  for (let k = 0; k < 3; k++) if (b[at + k] === x) { b[at + k] = 0; return; }
}

/** 0x547a10(o, t, flag): o får t som yndling (en uven t fjernes i stedet) */
export function addFavPerson(o: Person | null | undefined, t: number, flag: boolean, rand: (n: number) => number): void {
  if (!o || !t) return;
  addTo(blk(o), FAV_PERSON, DIS_PERSON, t, flag, rand);
}
/** 0x547af0(o, t, flag): o får t som uven (en yndling t fjernes i stedet); ikke sig selv */
export function addDisPerson(o: Person | null | undefined, t: number, flag: boolean, rand: (n: number) => number): void {
  if (!o || !t || personKey(o) === t) return;
  addTo(blk(o), DIS_PERSON, FAV_PERSON, t, flag, rand);
}
/** 0x547c10(o, t) */
export const removeFavPerson = (o: Person | null | undefined, t: number) => { if (o) clear3(o.cmRel, FAV_PERSON, t); };
/** 0x547c50(o, t) */
export const removeDisPerson = (o: Person | null | undefined, t: number) => { if (o) clear3(o.cmRel, DIS_PERSON, t); };
/** 0x547d90(o, klub, flag): klubben ind i +4..+0xc (fra +0x10.. fjernes den i stedet) – intet, hvis klubben har o i +0x9b.. */
export function addFavClub(g: GameState, o: Person | null | undefined, club: number, flag: boolean, rand: (n: number) => number): void {
  if (!o || !club || clubFavours(g.clubs[club], personKey(o))) return;
  addTo(blk(o), FAV_CLUB, DIS_CLUB, club, flag, rand);
}
/** 0x547e70(o, klub, flag): klubben ind i +0x10..+0x18 (fra +4.. fjernes den i stedet) – intet, hvis klubben har o i +0xa7.. */
export function addDisClub(g: GameState, o: Person | null | undefined, club: number, flag: boolean, rand: (n: number) => number): void {
  if (!o || !club || clubDislikes(g.clubs[club], personKey(o))) return;
  addTo(blk(o), DIS_CLUB, FAV_CLUB, club, flag, rand);
}
/** 0x547f50(o, klub) */
export const removeFavClub = (o: Person | null | undefined, club: number) => { if (o) clear3(o.cmRel, FAV_CLUB, club); };
/** 0x547870(klub, t, flag): t ind i club +0x9b.. (fra +0xa7.. fjernes han i stedet) */
export function clubAddFav(c: Club | null | undefined, t: number, flag: boolean, rand: (n: number) => number): void {
  if (!c || !t) return;
  addTo(c.cmPrefs ??= Array(6).fill(0), 0, 3, t, flag, rand);
}
/** 0x547940(klub, t, flag): t ind i club +0xa7.. (fra +0x9b.. fjernes han i stedet) */
export function clubAddDis(c: Club | null | undefined, t: number, flag: boolean, rand: (n: number) => number): void {
  if (!c || !t) return;
  addTo(c.cmPrefs ??= Array(6).fill(0), 3, 0, t, flag, rand);
}
/** 0x547bd0(klub, t) */
export const clubRemoveFav = (c: Club | null | undefined, t: number) => { if (c) clear3(c.cmPrefs, 0, t); };

/** 0x547f90(o): falmningen (udviklingsblokkens slutning 0x5d5778): hver yndling med rand(Loyalty + 15) = 0, hver uven med
 *  rand(35 − Temperament) = 0 forsvinder */
export function fadeRelations(o: Person, rand: (n: number) => number): void {
  const b = o.cmRel;
  if (!b) return;
  for (let k = FAV_PERSON; k < FAV_PERSON + 3; k++) if (b[k] && rand(hidOf(o, 'loyalty') + 0xf) === 0) b[k] = 0;
  for (let k = DIS_PERSON; k < DIS_PERSON + 3; k++) if (b[k] && rand(0x23 - hidOf(o, 'temperament')) === 0) b[k] = 0;
}

// ---------------------------------------------------------------- nyt spil

/** de indlæste personer pr. databasens id (spillere og databasens stab) */
function personIndex(g: GameState): Map<number, Person> {
  const m = new Map<number, Person>();
  for (const p of Object.values(g.players)) if (!p.regen) m.set(p.id, p);
  for (const s of Object.values(g.staff)) if (s.cmId !== undefined && !s.cmExtra) m.set(s.cmId, s);
  return m;
}

/** Spilstarten: præferenceposterne og klubbernes personer fra databasen; et id, der ikke er indlæst (personen eller klubben findes ikke i
 *  spillet), bliver 0 på sin plads (originalens indlæsning slår id'et op i hukommelsens tabel) */
export function cmRelNewGame(g: GameState, prefs: Record<number, number[]> | undefined, clubPrefs: Record<number, number[]> | undefined): void {
  if (!cmActive(g) || !prefs) return;
  const persons = personIndex(g);
  const club = (id: number) => (id && g.clubs[id] ? id : 0);
  const person = (id: number) => (id && persons.has(id) ? id : 0);
  for (const [k, v] of Object.entries(prefs)) {
    const o = persons.get(Number(k));
    if (!o) continue;
    const b = [...v.slice(0, 6).map(club), ...v.slice(6, 12).map(person)];
    if (b.some(Boolean)) o.cmRel = b;
  }
  for (const [k, v] of Object.entries(clubPrefs ?? {})) {
    const c = g.clubs[Number(k)];
    if (!c) continue;
    const b = v.map(person);
    if (b.some(Boolean)) c.cmPrefs = b;
  }
}

// ---------------------------------------------------------------- den daglige 0x5d6d10

/** klubbens 50 pladser (club +0xd7) – spillets trup i spillets rækkefølge, tomme pladser derefter */
type SquadOf = (club: number) => Player[];

/** 0x5d7190(klub): for hver spiller med kontrakt i klubben og en præferencepost – den første holdkammerat på pladserne, han ikke kan lide; er
 *  (dag % 14) + staff-id = 0 (sic: kun person 0 på hver 14. dag) → nyheden 0x587c60 (ikke porteret) og kontraktklagen 0x2000 (manageren +0xcf),
 *  0x1000 (assistenten +0xd3) eller 0x800 (en anden) via 0x867700 */
function squadFallouts(club: number, squadOf: SquadOf, doy: number, onFlag: (p: Player, flag: number) => void): void {
  const sq = squadOf(club).slice(0, 50);
  for (const p of sq) {
    if (!p.contract || p.club !== club || !p.cmRel) continue;
    const mate = sq.find((m) => m !== p && dislikesPerson(p, m.id));
    if (!mate) continue;
    if ((doy % 14) + p.id !== 0) continue;
    onFlag(p, 0x800);                                                          // spillerne er aldrig klubbens manager/assistent (Staff)
  }
}

/** game_update_squad_relationships 0x5d6d10 (dagligt, 0x5cdb0a). onFlag(spiller, klage) = 0x867700 på spillerens kontrakt. */
export function cmRelDaily(g: GameState, squadOf: SquadOf, onFlag: (p: Player, flag: number) => void): void {
  if (!cmActive(g) || g.draft) return;
  const day = dayNum(g.date), doy = doyOf(g.date);
  const rand = cmRand(g.seed ?? 0, day, 0x5d6d10);
  const clubs = Object.keys(g.clubs).map(Number).sort((a, b) => a - b);          // [0xae23b4]: klubberne i databasens rækkefølge
  const n = clubs.length;
  const squads = new Map<number, Player[]>();
  const sq = (c: number) => { let s = squads.get(c); if (!s) { s = squadOf(c).slice(0, 50); squads.set(c, s); } return s; };
  for (let k = 0; k < 10; k++) {
    const c = clubs[rand(n)];
    const s = sq(c);
    const a = s[rand(0x32)] ?? null, b = s[rand(0x32)] ?? null;
    if (!a || !b || a === b) continue;
    if (rand(hidOf(a, 'professionalism')) !== 0) continue;
    if (dislikesPerson(a, b.id)) {
      removeDisPerson(a, b.id);
      // 0x5d6da8–0x5d6e89: samme kontraktklub og a's kontrakt +0x45 & 0x800 → nyheden 0x5888a0 ("har lagt det bag sig" – ikke porteret)
      continue;
    }
    if (rand(3) === 0) addDisPerson(a, b.id, true, rand);
    else if (rand(3) === 0) addFavPerson(a, b.id, true, rand);
    else removeFavPerson(a, b.id);
  }
  if (doy % 0x32 === 0) {
    for (let i = 0; i < Math.trunc(n / 100); i++) squadFallouts(clubs[rand(n)], squadOf, doy, onFlag);
    return;
  }
  // personløkken 0x5d6f15–0x5d711e: dens eneste virkning (0x5d70bb: (dag % 14) + staff-id = 0 → nyhed og klage) kan kun ramme person 0 – de
  // tilfældige tal før den er spillerens egne (egen talrække pr. spiller), så løkken over de andre ændrer intet og springes over
  const p0 = g.players[0];
  if (p0 && doy % 14 === 0) personLoop(g, p0, squadOf, day, doy, onFlag);
}

/** 0x5d6f15–0x5d711e for én spiller (kun person 0 kan få en virkning – se cmRelDaily) */
function personLoop(g: GameState, p: Player, squadOf: SquadOf, day: number, doy: number, onFlag: (p: Player, flag: number) => void): void {
  if (!p.cmRel || !p.club || !p.contract) return;
  const club = g.clubs[p.club];
  if (!club) return;
  const sq = squadOf(p.club).slice(0, 50);
  // ebx = 0x4cf5f0([klub+0xff], klub): kontrakten for spilleren på klubbens 11. plads (+0xd7 + 4·10 – sic)
  const slot10 = sq[10];
  const k10 = slot10 && slot10.club === p.club && slot10.contract ? slot10.cmContract : undefined;
  if (!k10) return;
  const rand = cmRand(g.seed ?? 0, p.id, day, 0x5d6f15);
  if (rand(hidOf(p, 'professionalism') + 5) !== 0 && rand(hidOf(p, 'temperament') + 5) !== 0 && rand(hidOf(p, 'pressure') + 5) !== 0) return;
  let edi = hidOf(p, 'sportsmanship') + s8(ageOn(p.dob, g.date)) + hidOf(p, 'loyalty') + hidOf(p, 'pressure') + hidOf(p, 'professionalism');
  if (rand(hidOf(p, 'loyalty')) === 0) edi -= 3;
  if (rand(hidOf(p, 'pressure')) === 0) edi -= 5;
  if (k10.b45 !== 0 || rand(100) === 0) {
    if (rand(hidOf(p, 'professionalism')) === 0) edi -= 15;
    if (rand(hidOf(p, 'temperament')) === 0) edi -= 15;
  }
  const rep = (p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[0] * 50;
  if (Math.round(rep) > 4500 && Math.round(rep) > (g.cmClubRep?.[p.club] ?? 0)) edi -= 5;
  if (rand(edi) >= 1) return;
  const mate = sq.find((m) => m !== p && dislikesPerson(p, m.id));
  if (!mate || (doy % 14) + p.id !== 0) return;
  void k10;
  onFlag(p, 0x800);                                                            // (sic: originalen sætter klagen på 11.-pladsens kontrakt)
}

// ---------------------------------------------------------------- 0x867700's manager (cmPlayerData.ts cmFlagSet)

/** klubbens manager (club +0xcf) som Staff – computerens klubber (menneskets manager har ingen staffpost hos os) */
export function managerStaff(g: GameState, club: number): Staff | null {
  const c = g.clubs[club];
  return c?.manager !== undefined ? g.staff[c.manager] ?? null : null;
}

/** 0x867820–0x867915: en ny klage (bit i 0x16288) hos en spiller i en computerklub – managerens uven: rand(Temperament) = 0, ellers
 *  rand(np +0x14) > rand(trunc(+0x44/15) + 10) → 0x547af0(manager, spiller, 1). Menneskets klub (0x600a50): managerens Loyalty −1 ved rand(5) = 0
 *  (hans staffpost findes ikke hos os). Formanden (club +0xbf, 0x867918–0x867965) findes ikke hos os. */
export function cmRelOnFlag(g: GameState, p: Player, flag: number, b44: number, rand: (n: number) => number): void {
  if (!cmActive(g) || !p.club || !(flag & 0x16288)) return;
  if (isHumanClub(p.club)) return;
  const m = managerStaff(g, p.club);
  if (!m?.cmNp) return;
  let dislike = rand(hidOf(m, 'temperament')) === 0;
  if (!dislike) {
    const r1 = rand(Math.trunc(s8(b44) / 15) + 10);
    dislike = rand(s8(m.cmNp[0x14 - 0x0e])) > r1;
  }
  if (dislike) addDisPerson(m, p.id, true, rand);
}
setRelFlagHook(cmRelOnFlag);

// ---------------------------------------------------------------- kampens læsere

/** sub_6ec010's forhold (0x6ee745–0x6eebaa) for spilleren mod de to klubber og managerne (anføreren sættes af limen – captainRel) */
export function matchRelOf(g: GameState, p: Player, own: number, opp: number) {
  const om = personKey(managerStaff(g, opp)), mm = personKey(managerStaff(g, own));
  return {
    dislikesOpp: dislikesClub(p, opp), favoursOpp: favoursClub(p, opp),
    oppMgrDislikes: dislikesPerson(p, om), oppMgrFavours: favoursPerson(p, om),
    favoursOwn: favoursClub(p, own), dislikesOwn: dislikesClub(p, own),
    ownMgrDislikes: dislikesPerson(p, mm), ownMgrFavours: favoursPerson(p, mm),
    capDislikes: false, capFavours: false,
  };
}
/** 0x6eeae4/0x6eebaa: spilleren og anføreren */
export const captainRel = (p: Player, cap: Player | null | undefined) =>
  ({ capDislikes: !!cap && dislikesPerson(p, cap.id), capFavours: !!cap && favoursPerson(p, cap.id) });
/** afleveringsmulighederne 0x6c82e0/0x6c82fe: yndlingspersoner og uvenner (person-id'er) */
export const relPersons = (p: Player, at: number) => (p.cmRel ? p.cmRel.slice(at, at + 3).filter((x) => x > 0) : []);
