// Originalens genererede fyldspillere ("virtual staff", virtual_staff.cpp – cm0102.exe 3.9.68). Kun den originale database i ægte tilstand
// (cmActive). Afkodet i ~/cm0102-engine/notes/filler-players.md.
//
// Originalen gemmer ikke fyldspillerne: før hver kamp (0x90d2f0, kaldt fra kampdagen 0x6b43f8/0x6b4a43/0x6b5bc1 og 0x84c339) og når en
// menneskelig manager åbner en klubs skærm (0x90d4f0 fra 0x484215) kører 0x90dae0 for klubben: de gamle fyldspillere fjernes (0x90d8f0), og
// mangler klubben spillere pr. "gruppe" (0x90e020: GK, D venstre/højre/central, M venstre/central/højre, F), laves nye i staff-poster efter de
// rigtige (id ≥ [0xae2364]). Efter kampen fjernes de igen (0x90d6b0). Hver ny spiller laves med CRT-rand efter srand((n + 10000)·(klub + 1)·
// (gruppe + 1000)) (0x90de48, n = nummer i gruppen) og frøet sættes tilbage bagefter – derfor er det de SAMME spillere hver gang (samme navn,
// alder, egenskaber), og de ser faste ud for spilleren (ejerens billeder 85/86: "Olaf Köhler (Babelsberg)", grå navne i truppen).
//
// Hos os: fyldspillerne lægges i g.players omkring klubbens kampe (sim.ts prepareMatch) og når truppen vises (cmVirtualView), og alle fjernes ved
// dagens start (sim.ts newDay) – så spillets daglige systemer aldrig ser dem (originalen har dem heller ikke i de daglige løkker). Id'erne er
// faste pr. (klub, gruppe, n), så den samme spiller får det samme id.
//
// Porteret (sikkert):
//   0x90d8f0  tællingen: klubbens rigtige spillere (alle i truppen +0xd7), "førsteholdet" (+0x5e & 1 – hos os ikke på reserveholdet),
//             ledige (ikke skadet 0x62c400 = 2, ikke udelukket i kampen 0x55d270) pr. gruppe 0x90e020
//   0x90dae0  løkken: mål pr. gruppe [4,4,4,8,4,8,4,8] (række 0 af tabellen fra konstruktøren 0x90d255), mindst [2,2,2,4,2,4,2,4], højst 50 i
//             truppen og 25 nye; computerens klubber fylder op til 20 ledige, menneskets ikke (0xff); en spiller ud over 20 ledige bliver en
//             reservespiller (+0x5e = 2) for klubber med reservehold (0x542740: ikke Spanien/Tyskland/Portugal); "fantomer" (pladsen tælles
//             uden spiller, 0x90df68)
//   0x90e0a0  spilleren: navn fra landet (0x539c60/0x53a1b0), født år Y − 17 (aktiv liga i et spilbart land) eller Y − 17 − rand(14) med
//             Y = året rundet ned til et multiplum af 3 (0x90e110), kom til klubben i Y − 1, kontrakt til Y + 6, løn = klubbens omdømme/5,
//             værdi 0, tilpasningsevne rand(10) + 1, de syv personlighedsegenskaber 10, omdømme 0; spillerposten KOPIERES fra en tilfældig
//             rigtig spiller med en passende position (op til 1000 forsøg, 0x90e49c – NB: gruppe 2 (højre forsvar) søger en central forsvarer
//             og gruppe 3 (central) en højre, sic), og CA = PA = omdømme > 5000 ? 0,016·omdømme + 20 : omdømme/25 − 100 (0x90e5fb),
//             −30 − rand(41) i en aktiv liga og igen for reserver; de 18 interne egenskaber vises derfor efter den nye CA
//   trøjenummer 51, 52 … (0x90e705, når 0x85add0 er sand)
// *estimeret*: 0x85add0 (trøjenumre altid), 0x7757d0 (landsholdsophold – ingen), Japans særregel (0x90dc04), landsholdenes gren (0x90dc66 –
// spillets landshold vælger selv blandt alle spillere), 0x539c60's navnelister (spillets egne pr. land, randomName), CA under 1 gemmes som 1
// (de viste egenskaber bruger originalens negative CA), lønnen betales aldrig (fyldspillerne er væk ved dagens start, som i originalen
// hvor de kun findes omkring kampene). Reservespillerne laves ikke (spillets reserver kan ikke spille, og frøene er pr. spiller).
import type { GameState, Player } from './types';
import { ATTRS } from './attributes';
import { addPlayer, dropPlayer, playersEpoch, squad } from './state';
import { cmActive, clubRepMem, NO_RESERVES } from './cmPlayerData';
import { shownFromInternal } from './playerInit';
import { emptyStats, randomName } from './data/generate';
import { Rng } from './rng';
import { isHumanClub } from './humans';

/** fyldspillernes id'er: VIRTUAL_ID0 + 256·klub + 32·gruppe + n */
export const VIRTUAL_ID0 = 20_000_000;
export const virtualId = (club: number, grp: number, n: number) => VIRTUAL_ID0 + club * 256 + grp * 32 + n;
export const isVirtual = (p: Player | undefined) => !!p?.virtual;

/** 0x90d255: målet pr. gruppe for klubber (række 0; række 1 [6,4,4,12,4,8,4,8] er landsholdenes) og mindstetallet (+0x10) */
export const GROUP_TARGET = [4, 4, 4, 8, 4, 8, 4, 8];
export const GROUP_MIN = [2, 2, 2, 4, 2, 4, 2, 4];

/** MSVC's rand/srand (0x9469fa/0x946a04) – fyldspillerne bruger CRT'en direkte, ikke spillets talrække 0x90cfc0 */
export class Crt {
  s = 0;
  srand(x: number) { this.s = x >>> 0; }
  rand(): number { this.s = (Math.imul(this.s, 214013) + 2531011) >>> 0; return (this.s >>> 16) & 0x7fff; }
  /** rand()·n / 0x8000 (0x945e40/0x945e80 – 64 bit) */
  r(n: number): number { return Math.floor((this.rand() * n) / 32768); }
}
/** spillets Rng oven på CRT'en (randomName) */
class CrtRng extends Rng {
  private crt: Crt;
  constructor(crt: Crt) { super(1); this.crt = crt; }
  next(): number { return this.crt.rand() / 32768; }
}

/** 0x90e020: gruppen af spillerposten (+0xf GK, +0x10 SW, +0x11 D, +0x12 DM, +0x13 M, +0x14 AM, +0x15 F, +0x17 R, +0x18 L, +0x19 C);
 *  0 GK, 1 D venstre, 2 D højre, 3 D central, 4 M venstre, 5 M central, 6 M højre, 7 F, −1 ingen. Player.pos = [GK SW D DM M AM F WB],
 *  Player.side = [L C R]. */
export function virtualGroup(p: Pick<Player, 'pos' | 'side'>): number {
  const [GK, SW, D, DM, M, AM, F] = p.pos, [L, , R] = p.side;
  if (GK >= 15) return 0;
  if (SW >= 15 || D >= 15) return L >= 15 ? 1 : R >= 15 ? 2 : 3;
  if (DM >= 15 || M >= 15 || AM >= 15) return L >= 15 ? 4 : R >= 15 ? 6 : 5;
  return F >= 15 ? 7 : -1;
}
/** 0x90e4d1's springtabel (skabelonen): 0 GK = 20; 1 D+L; 2 D+C (sic); 3 D+R (sic); 4 M+L; 5 M+C; 6 M+R; 7 F (alle ≥ 15) */
function templateFits(p: Player, grp: number): boolean {
  const D = p.pos[2], M = p.pos[4], [L, C, R] = p.side;
  switch (grp) {
    case 0: return p.pos[0] === 20;
    case 1: return D >= 15 && L >= 15;
    case 2: return D >= 15 && C >= 15;
    case 3: return D >= 15 && R >= 15;
    case 4: return M >= 15 && L >= 15;
    case 5: return M >= 15 && C >= 15;
    case 6: return M >= 15 && R >= 15;
    case 7: return p.pos[6] >= 15;
    default: return false;
  }
}

/** 0x542740: klubben har reservehold (+0x5e = 1/2) – almindelige klubber: ikke i Spanien, Tyskland eller Portugal (som cmPlayerData's squadPlacement) */
const hasReserves = (g: GameState, cid: number) => !NO_RESERVES.has(g.nations[g.clubs[cid]?.nation ?? -1]?.name ?? '');
/** nation +0x11c: landet har spilbare ligaer */
const nationActive = (g: GameState, nation: number) => g.activeNations.includes(nation);
/** [0xadadfc][division] ≠ 0: klubbens liga spilles */
function divisionRunning(g: GameState, cid: number): boolean {
  const lg = g.clubs[cid]?.league;
  return !!lg && g.comps[lg]?.type === 'league' && !g.leagues[lg]?.hidden;
}
/** førsteholdet (+0x5e & 1): ikke på reserveholdet; klubber uden reservehold har alle på førsteholdet (0x52d2b8) */
const firstTeam = (g: GameState, p: Player, cid: number) => !hasReserves(g, cid) || !(p.cmPlace === 1 || (p.cmPlace === undefined && p.reserves));

export interface VirtualSlot { grp: number; n: number; kind: 'first' | 'reserve' | 'phantom'; num: number }

/** 0x90d8f0 + 0x90dae0's løkke: hvilke fyldspillere klubben skal have (alle pladser – også reserver og fantomer, som tæller med) */
export function virtualPlan(g: GameState, cid: number, match: boolean): VirtualSlot[] {
  const club = g.clubs[cid];
  if (!club || club.nation === undefined || club.nation < 0 || !g.nations[club.nation]) return [];   // 0x90db33: klub uden land → intet
  const real = squad(cid).filter((p) => !p.virtual);
  let total = real.length, avail = 0, flagged = 0;
  const counts = new Array(8).fill(0);
  for (const p of real) {
    if (firstTeam(g, p, cid)) flagged++;                                  // 0x90d9e4
    if (p.injury) continue;                                               // 0x62c400 = 2
    if (match && p.banned > 0) continue;                                  // 0x55d270 (kun med kampen)
    const grp = virtualGroup(p);
    if (grp >= 0) counts[grp]++;
    avail++;
  }
  let X = hasReserves(g, cid);                                            // [base+0x20] = 0x542740(klub)
  const thr = isHumanClub(cid) || cid === g.userClub ? null : 20;         // 0x90dd92: computerens klubber 20, menneskets 0xff
  const running = divisionRunning(g, cid);
  const out: VirtualSlot[] = [];
  const genCount = new Array(8).fill(0);
  let gen = 0, num = 0x33;
  if (total >= 50) return out;                                            // 0x90ddac
  for (;;) {
    if (gen >= 25) break;                                                 // 0x90ddbc
    let any = false;
    for (let grp = 0; grp < 8; grp++) {
      if (total >= 50 || gen >= 25) break;                                // 0x90ddd5
      if (counts[grp] >= GROUP_TARGET[grp]) continue;                     // 0x90de05
      if (grp !== 0 && avail > 20 && !X) X = true;                        // 0x90de0e
      let kind: VirtualSlot['kind'];
      if (!running && !(counts[grp] >= GROUP_MIN[grp] && flagged >= 20)) kind = 'first';   // 0x90df16
      else if (thr !== null && avail < thr) kind = 'first';               // 0x90df38
      else if (X) kind = 'reserve';                                       // 0x90df46
      else kind = flagged >= 20 ? 'phantom' : 'first';                    // 0x90df68
      out.push({ grp, n: genCount[grp], kind, num: kind === 'phantom' ? 0 : num });
      if (kind !== 'phantom') num++;
      if (kind === 'first') flagged++;                                    // 0x90df88
      counts[grp]++; avail++; total++; gen++; genCount[grp]++; any = true; // 0x90df8c
    }
    if (!any || total >= 50) break;                                       // 0x90dfd8
  }
  return out;
}

/** de rigtige spillere i postrækkefølge (skabelonerne; [0xae236c], højst 30000) – genbruges pr. dag, så længe ingen rigtig spiller er kommet til
 *  eller forsvundet (state.ts playersEpoch; før talte den alle nøgler, og hver ny fyldspiller byggede listen om – ~12 s ved nyt spil) */
let tplCache: { g: GameState; players: GameState['players']; date: string; epoch: number; list: Player[] } | null = null;
function templates(g: GameState): Player[] {
  const epoch = playersEpoch();
  if (tplCache && tplCache.g === g && tplCache.players === g.players && tplCache.date === g.date && tplCache.epoch === epoch) return tplCache.list;
  const list = Object.values(g.players).filter((p) => !p.virtual && !p.regen).slice(0, 30000);
  tplCache = { g, players: g.players, date: g.date, epoch, list };
  return list;
}

const isoDay = (doy: number, y: number) => new Date(Date.UTC(y, 0, 1 + doy)).toISOString().slice(0, 10);
const A_ADAPT = ATTRS.indexOf('adaptability');
const TEN = ['ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'].map((k) => ATTRS.indexOf(k as never));

/** 0x90e0a0: én fyldspiller (frøet sat af kalderen 0x90de58) */
export function makeVirtual(g: GameState, cid: number, slot: VirtualSlot, crt: Crt): Player {
  const club = g.clubs[cid];
  const nation = club.nation;
  const active = nationActive(g, nation);
  const arg5 = active && divisionRunning(g, cid);                         // 0x90dbdf: spilbart land og ligaen spilles
  const Y = Math.trunc(+g.date.slice(0, 4) / 3) * 3;                     // 0x90e110: [0xae2c92] / 3 · 3
  const [first, last] = randomName(g.names, nation, new CrtRng(crt));     // 0x90e12d/0x90e139
  let by: number;                                                         // 0x90e1ae
  if (arg5) by = Y - 17;
  else { const k = crt.r(14); by = Y - k - 17; }
  const dob = isoDay(crt.r(365), by);
  const joined = isoDay(crt.r(365), Y - 1);                               // 0x90e34f
  const expires = isoDay(crt.r(365), Y + 6);                              // 0x90e395
  const rep = clubRepMem(g, cid);
  const wage = Math.trunc(rep / 5);                                       // 0x90e3df (£ pr. uge)
  const adapt = crt.r(10) + 1;                                            // 0x90e404
  // 0x90e49c: skabelonen – op til 1000 tilfældige rigtige spillere, ellers den sidste
  const tpl = templates(g);
  let t: Player | undefined;
  for (let k = 0; k < 1000 && tpl.length; k++) {
    t = tpl[crt.r(tpl.length)];
    if (templateFits(t, slot.grp)) break;
  }
  // 0x90e5fb: CA = PA af klubbens omdømme
  let v = rep > 5000 ? Math.trunc(rep * 0.016 + 20) : Math.trunc(rep / 25) - 100;
  if (arg5) v += -30 - crt.r(41);                                         // 0x90e674
  if (slot.kind === 'reserve') v += -30 - crt.r(41);                      // 0x90e6a4
  const src = t ?? squad(cid)[0];
  const attrs = src ? src.attrs.slice() : new Array(ATTRS.length).fill(10);
  attrs[A_ADAPT] = adapt;
  for (const i of TEN) attrs[i] = 10;
  const cmInt = src?.cmInt ? src.cmInt.slice() : undefined;
  const pos = src ? src.pos.slice() : [1, 1, 1, 1, 1, 1, 1, 1];
  if (cmInt) shownFromInternal(attrs, cmInt, v, pos[0]);                  // de 18 interne vises efter den nye CA (sub_544380)
  const ca = Math.max(1, Math.min(200, v));
  return {
    id: virtualId(cid, slot.grp, slot.n), first, last, dob, nation, club: cid,
    foot: src?.foot ?? 'R', ...(src?.feet ? { feet: [src.feet[0], src.feet[1]] as [number, number] } : {}), height: src?.height ?? 180,
    attrs, pos, side: src ? src.side.slice() : [1, 20, 1], ...(cmInt ? { cmInt } : {}), ...(src?.cmFree !== undefined ? { cmFree: src.cmFree } : {}),
    ca, pa: ca, rep: 0, cmRep: [0, 0, 0], cmRepMem: [0, 0, 0], value: 0,
    contract: { wage: wage / 0.86, expires }, condition: 100, morale: src?.morale ?? 10, form: [], injury: null, banned: 0, yellowCount: 0,
    training: src?.training ?? 'general', listed: false, loan: null, stats: emptyStats(), history: [], caps: 0, intGoals: 0,
    number: slot.num, joined, virtual: active ? 'active' : 'other',
  };
}

/** alle klubbens fyldspillere */
const virtualsOf = (cid: number) => squad(cid).filter((p) => p.virtual);

/** 0x90dae0 for klubben: de gamle fyldspillere ud (0x90d8f0), nye ind efter planen. Returnerer antallet af fyldspillere bagefter. */
export function cmVirtualSync(g: GameState, cid: number, match: boolean): number {
  if (!cmActive(g) || g.draft || !g.clubs[cid]) return 0;
  const old = virtualsOf(cid);
  for (const p of old) dropPlayer(p);
  const plan = virtualPlan(g, cid, match).filter((s) => s.kind === 'first');
  if (!plan.length) return 0;
  const crt = new Crt();
  for (const s of plan) {
    crt.srand(Math.imul(Math.imul(s.n + 10000, cid + 1), s.grp + 1000));  // 0x90de48
    addPlayer(makeVirtual(g, cid, s, crt));
  }
  return plan.length;
}

/** før kampen (0x90d2f0): begge hold */
export function cmVirtualMatch(g: GameState, home: number, away: number): void {
  if (!cmActive(g) || g.draft) return;
  cmVirtualSync(g, home, true);
  cmVirtualSync(g, away, true);
}

/** truppen vises (0x90d4f0): kun hvis klubben ikke allerede har sine fyldspillere. true = noget er ændret. */
export function cmVirtualView(g: GameState, cid: number): boolean {
  if (!cmActive(g) || g.draft || !g.clubs[cid] || virtualsOf(cid).length) return false;
  return cmVirtualSync(g, cid, false) > 0;
}

/** dagens start: alle fyldspillere ud (0x90d6b0 efter kampene) – menneskets egne klubber får deres igen bagefter (cmVirtualHumans) */
export function cmVirtualClear(g: GameState): void {
  // fyldspillerne ligger sidst (id ≥ VIRTUAL_ID0 – heltalsnøglerne kommer i stigende orden); et gemt spil kan have dem med
  const ids = Object.keys(g.players);
  for (let i = ids.length - 1; i >= 0 && +ids[i] >= VIRTUAL_ID0; i--) { const p = g.players[+ids[i]]; if (p?.virtual) dropPlayer(p); }
}

/** menneskets klubber: fyldspillerne, der hører til truppen (originalen laver dem, når manageren ser truppen – her efter dagens systemer, så
 *  udtagelsen ikke peger på spillere, der er væk) */
export function cmVirtualHumans(g: GameState, clubs: number[]): void {
  if (!cmActive(g) || g.draft) return;
  for (const c of clubs) if (c) cmVirtualSync(g, c, false);
}
