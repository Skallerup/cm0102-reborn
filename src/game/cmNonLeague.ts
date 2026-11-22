// Sæsonskiftet mellem den nederste kørende liga og en inaktiv division (cm0102.exe 3.9.68) – alle CM-databaser med originalens sæsonskifte
// (cmSeasonOn): England (eng_prm.cpp, "English Third Division" ↔ "English Conference") og Danmark ("Danish Second Division" ↔ "A Lower Division",
// 0x553cb0 – nederst).
//
// Premier Divisions nye sæson 0x574c10: først vt+0xb0 (0x5752e0 – ombytningerne Premier ↔ First ↔ Second ↔ Third, 0x689c80: spillets
// promotionRelegation i season.ts), så [0xadadfc][Conference] ≠ 0 ? 0x5750a0 : 0x574e60. Conference er aldrig en kørende liga hos os
// (nation +0x11c & 4 – Third Divisions +0x20 = −1, 0x5780c0), så det er altid 0x574e60:
//   1. alle klubber med division (+0x57) = Conference i klubrækkefølgen; ingen → fejlboks (0x574f08) og intet skifte
//   2. 0x4afbd0(liste, n, 1): qsort 0x4b07d0 (omdømme +0x80, faldende) og min(3·1, n) ombytninger arr[rand(m)] ↔ arr[rand(m)] (0x90cfc0)
//   3. kandidaten arr[0]: Finance 0x5a0590 → 0x599e00(sæder +0xe4 = 1000, kapacitet +0xe2 = 6000 – Third Divisions ctor 0x576dd0, Third
//      Divisions id, 1) – stadionet udvides, hvis der er råd (formandens Resources np +0x20 / rand(5))
//      - nej: Thirds sidste række får status 0xfe (reddet) og nyheden 0x23 (0x48ece0 → 0x7862d0 til Thirds og Conferences managere)
//      - ja: 0x6830b0(kandidaten → Third, 1), og alle Thirds rækker med status 3 (de nederste +0xc1 = 1, 0x5780c0) → 0x6831a0(→ Conference, 1)
// Nedrykningens rekord (add_relegation_record 0x86a1c0, via vt+0x44 0x576c50 kode 3, når status 3 sættes) gives af cmMedia.ts' cmRecordsDaily
// (cmNonLeagueRelegated).
//
// Ikke porteret (som i spillets øvrige op-/nedrykning): kontrakternes divisionsskifte 0x4cd030/0x4cd120 og trøjenumrene 0x85add0 i
// 0x6830b0/0x6831a0. Nyheden 0x1780 fra 0x599e00 (0x5a0410 → klubbens manager, kun et menneske) kan ikke nås: kandidaten er en
// Conference-klub, som intet menneske kan styre. 0x5750a0 (Conference som kørende liga) kan ikke nås.
// Talrækken er spillets egen (cmRand), kaldene i originalens rækkefølge.
import type { Club, GameState } from './types';
import { addNews, gs } from './state';
import { forEachHuman } from './humans';
import { cmRand, clubRepMem } from './cmPlayerData';
import { cmSeasonOn } from './cmSeason';
import { balGbp, book, K } from './cmFinance';
import { finalOrder } from './competitions';
import { msvcQsort } from './engine/grid/subs';
import { cmBoardClubMoved } from './cmBoardGame';
import { tableStatusHooks } from './cmTableHooks';

const s16 = (v: number) => (v << 16) >> 16;
const s8 = (v: number) => (v << 24) >> 24;
const THIRD = 'English Third Division';
/** Third Divisions ctor 0x576dd0: +0xe2 kapaciteten og +0xe4 sæderne, en oprykker skal have */
const THIRD_CAP = 6000, THIRD_SEATS = 1000;
/** Third Divisions +0xc1 (0x5780c0): én nedrykker */
const THIRD_DOWN = 1;
const DK_SECOND = 'Danish Second Division';
/** Danish Second Divisions +0xc1 (0x554b60): fire nedrykkere; 0x553cb0 rykker fire op (løkken 0x553de2, 0x4afbd0's 3. argument 4) */
const DK_DOWN = 4, DK_UP = 4;

/** "English Conference"s id [0x9cf69c]: world-filens cmRaw.confDiv; world-filer bygget før feltet (de tre originale databaser 3.9.60/65/68)
 *  har id 93 – kun når en klub i landets inaktive divisioner har den */
export function cmConfDiv(g: GameState): number {
  if (g.cmConfDiv !== undefined) return g.cmConfDiv;
  const third = thirdId(g);
  if (!third) return -1;
  const n = g.leagues[third].nation;
  return Object.values(g.clubs).some((c) => c.nation === n && g.leagues[c.league]?.hidden && g.cmFinRaw?.[c.id]?.[0] === 93) ? 93 : -1;
}
/** den kørende ligas id ud fra navnet (nøgle-id'erne [0x9cf5c8] Third Division, [0x9cf5b4] Danish Second Division – sat på navnet 0x60f33e) */
function leagueId(g: GameState, name: string): string | null {
  for (const [id, l] of Object.entries(g.leagues)) if (l.name === name && !l.hidden) return id;
  return null;
}
const thirdId = (g: GameState) => leagueId(g, THIRD);
/** klubbens division +0x57: den kørende liga (CM<id>), ellers club.dat's division (cmFinRaw[0] – opdateres af flytningerne her) */
function divOf(g: GameState, c: Club): number {
  const m = /^CM(\d+)$/.exec(c.league);
  return m && !g.leagues[c.league]?.hidden ? +m[1] : g.cmFinRaw?.[c.id]?.[0] ?? -1;
}
const on = (g: GameState) => cmSeasonOn(g) && !g.draft;

/** has_relegation for en liga uden kørende liga under (+0xc1 ≠ 0 – status 3 og add_relegation_record): Third Division 1, Danish Second
 *  Division 4, ellers 0 */
export function cmNonLeagueRelegated(g: GameState, compId: string): number {
  if (!on(g)) return 0;
  if (compId === thirdId(g) && cmConfDiv(g) >= 0) return THIRD_DOWN;
  if (compId === leagueId(g, DK_SECOND) && (g.cmLowerDiv ?? -1) >= 0) return DK_DOWN;
  return 0;
}

tableStatusHooks.relegated = cmNonLeagueRelegated;

// ------------------------------------------------------------------------------------------------ stadionet (0x599e00)

interface Stad { cap: number; seats: number; exp: number }
/** stadionet club +0x69: kapaciteten +0x3c (cmCrowd[5]), sæderne +0x40 og udvidelsen +0x44 (cmStadium – uden posten: sæderne = kapaciteten) */
function stadOf(g: GameState, c: Club): Stad | null {
  const cr = g.cmCrowd?.[c.id];
  if (!cr || cr[3] < 0) return null;
  const s = g.cmStadium?.[cr[3]] ?? [cr[5], 0];
  return { cap: cr[5], seats: s[0], exp: s[1] };
}
/** skriv stadionet tilbage – posten deles af alle klubber på stadionet (Club.seats = kapaciteten) */
function setStad(g: GameState, c: Club, st: Stad): void {
  const id = g.cmCrowd![c.id][3];
  (g.cmStadium ??= {})[id] = [st.seats, st.exp];
  for (const [cid, cr] of Object.entries(g.cmCrowd!)) {
    if (cr[3] !== id) continue;
    cr[5] = st.cap;
    const cl = g.clubs[+cid];
    if (cl) cl.seats = st.cap;
  }
}

/** Finance 0x599e00(sæder, kapacitet, division, flag): stadionet udvides til mindst `seatT` sæder og `capT` pladser. 1 = opfyldt (udvidet eller
 *  allerede), 0 = ikke (intet stadion, for stort, ingen penge). Prisen £125·(manglende sæder + 6000·(manglende sæder/1000 + 1)) + £75 pr.
 *  ombygget ståplads + £50 pr. ny ståplads bogføres som Ground Maintenance (+0x8c/+0x12c); med flaget: formanden (club +0xbf → np +0x20
 *  Resources R) – prisen ≥ saldoen og ≥ 500.000·R → R + 1 (højst 20) og 0; ellers rand(R) = 0 og prisen > saldoen → formanden betaler
 *  (Investments +0xb4/+0x154). Uden formand: prisen ≥ saldoen og ≥ £1.000.000 → rand(5) ≠ 0 giver 0. Landshold (0x53b900) kan ikke nås her. */
export function expandStadium_599e00(g: GameState, c: Club, seatT: number, capT: number, flag: boolean, rand: (n: number) => number): boolean {
  const st = stadOf(g, c);
  if (!st) return false;
  const S = st.seats, Cp = st.cap;
  let seatNeed = Math.max(0, seatT - S);
  let capNeed: number;
  if (seatT === capT) {
    capNeed = 0;
    if (Cp > seatT && Cp - S > 0) seatNeed += Cp - S;
  } else capNeed = Math.max(0, capT - Cp - seatNeed);
  if (seatNeed === 0 && capNeed === 0) return true;
  let conv = 0;
  if (seatNeed > S && Cp - S > 0) conv = Math.min(seatNeed - S, Cp - S);
  if (flag && Cp > 120000) return false;
  if (st.exp < Cp + capNeed + seatNeed) st.exp = Cp + capNeed + seatNeed;
  const cost = 125 * (seatNeed + 6000 * (Math.trunc(seatNeed / 1000) + 1)) + 75 * conv + 50 * capNeed;
  const r = g.cmFin?.[c.id];
  const chair = flag ? r?.chair ?? null : null;
  const bal = balGbp(g, c);
  let invest = false;
  if (flag && chair) {
    const R = s8(chair[1]);
    if (cost >= bal && cost >= 500000 * R) {
      if (R < 20) chair[1] = R + 1;
      setStad(g, c, st);
      return false;
    }
    st.cap += s16(capNeed + seatNeed);
    st.seats += s16(seatNeed + conv);
    const r0 = R === 0 ? 0 : rand(R);                                    // 0x90cfc0(0) = 0 uden at trække
    invest = r0 === 0 && cost > bal && cost < 500000 * R;
  } else {
    if (flag && cost >= bal && cost >= 1000000 && rand(5) !== 0) { setStad(g, c, st); return false; }
    st.cap += s16(capNeed + seatNeed);
    st.seats += s16(seatNeed + conv);
  }
  if (invest) book(g, c, K.investments, cost);
  book(g, c, K.maintenance, cost);
  // 0x5a0410(klub, division, conv ≠ 0 og ingen nye ståpladser ? 0 : 1): nyheden 0x1780 til klubbens manager (kun et menneske – se øverst)
  if (seatT === capT) st.seats = st.cap;
  setStad(g, c, st);
  return true;
}

// ------------------------------------------------------------------------------------------------ flytningerne

/** League 0x6830b0 (op, 3. argument 1) / 0x6831a0 (ned): +0x5b = den gamle division, +0x57 = den nye; op: uden manager en ledig stilling
 *  (0x69ba50), amatørstatus +0x64 = 3 → 2, når den nye division er en kørende liga; ned i en inaktiv division: et menneske forlader klubben
 *  (0x600a50 → 0x69b790(klub, 1, 7, 0)) */
function moveClub(g: GameState, c: Club, league: string, div: number, up: boolean): void {
  const old = divOf(g, c);
  c.league = league;
  const raw = (g.cmFinRaw ??= {})[c.id] ??= [div, 0, 0, 0];
  raw[0] = div;
  const cs = g.cmClubStat?.[c.id];
  if (cs) cs[2] = old;
  if (up) {
    const r = g.cmFin?.[c.id];
    if (r && r.status === 3) r.status = 2;
    else if (!r && cs && cs[0] === 3) cs[0] = 2;
  }
  cmBoardClubMoved(g, c.id, up);
}

/** sæsonskiftet (season.ts seasonRollover, lige efter promotionRelegation – originalens vt+0xb0-ombytninger): England 0x574e60 og Danmark 0x553cb0 */
export function cmNonLeagueRollover(g: GameState = gs(), inScope: (cid: number) => boolean = () => true): void {
  if (!on(g)) return;
  engRollover(g, inScope);
  dkRollover(g, inScope);
}

/** 0x4afbd0(arr, n, k): qsort 0x4b07d0 (omdømme +0x80, faldende) og min(3·k, n) ombytninger arr[rand(m)] ↔ arr[rand(m)] (0x90cfc0); n < k → fejlboks
 *  (0x4afc64) uden sortering */
function pickByRep(g: GameState, arr: Club[], k: number, rand: (n: number) => number): void {
  if (arr.length < k) return;
  msvcQsort(arr, (x, y) => s16(clubRepMem(g, y.id)) - s16(clubRepMem(g, x.id)));
  const m = Math.min(3 * k, arr.length);
  for (let n = 0; n < m; n++) {
    const i = rand(m), j = rand(m);
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
}

/** Danish Premier Divisions nye sæson 0x553aa0: vt+0xb0 (ombytningerne Premier ↔ First ↔ Second) og så altid 0x553cb0:
 *   1. alle klubber med land (+0x53) Denmark og division (+0x57) "A Lower Division" [0x9cf764] (ikke landshold, 0x53b900) i klubrækkefølgen;
 *      ingen → intet skifte (heller ingen nedrykning)
 *   2. 0x4afbd0(liste, n, 4) og arr[0..3] → 0x6830b0(→ Second Division [0x9cf5b4], 1) – intet stadionkrav
 *   3. alle Second Divisions rækker med status 3 (de nederste +0xc1 = 4, 0x554b60) → 0x6831a0(→ A Lower Division, 1)
 *  (0x553cb0 tjekker ikke, at der er fire: med færre læser løkken uden for listen – her flyttes de, der er.) */
function dkRollover(g: GameState, inScope: (cid: number) => boolean): void {
  const second = leagueId(g, DK_SECOND), lower = g.cmLowerDiv ?? -1;
  if (!second || lower < 0) return;
  const comp = g.comps[second];
  if (!comp?.finished || !comp.clubs.length || !inScope(comp.clubs[0])) return;
  const nation = g.leagues[second].nation;
  const secondDiv = +(/^CM(\d+)$/.exec(second)?.[1] ?? -1);
  const arr = Object.values(g.clubs).filter((c) => c.nation === nation && divOf(g, c) === lower).sort((a, b) => a.id - b.id);
  if (!arr.length) return;
  const lowerLeague = arr[0].league;
  pickByRep(g, arr, DK_UP, cmRand(g.seed ?? 0, 0x553cb0, g.season));
  const order = finalOrder(comp);
  const down = order.slice(Math.max(0, order.length - DK_DOWN)).map((cid) => g.clubs[cid]).filter((c): c is Club => !!c && c.league === second);
  for (const c of arr.slice(0, DK_UP)) moveClub(g, c, second, secondDiv, true);
  for (const c of down) moveClub(g, c, lowerLeague, lower, false);
}

/** 0x574e60: Conference ↔ Third Division */
function engRollover(g: GameState, inScope: (cid: number) => boolean): void {
  const third = thirdId(g), conf = cmConfDiv(g);
  if (!third || conf < 0) return;
  const comp = g.comps[third];
  if (!comp?.finished || !comp.clubs.length || !inScope(comp.clubs[0])) return;
  const thirdDiv = +(/^CM(\d+)$/.exec(third)?.[1] ?? -1);
  // 1. Conferences klubber i klubrækkefølgen (klub-id'erne stiger som originalens klubtabel)
  const arr = Object.values(g.clubs).filter((c) => divOf(g, c) === conf).sort((a, b) => a.id - b.id);
  if (!arr.length) return;
  const confLeague = arr[0].league;
  const rand = cmRand(g.seed ?? 0, 0x574e60, g.season);
  // 2. 0x4afbd0(arr, n, 1)
  pickByRep(g, arr, 1, rand);
  const cand = arr[0];
  // 3. stadionet
  if (!expandStadium_599e00(g, cand, THIRD_SEATS, THIRD_CAP, true, rand)) {
    // Thirds sidste række reddes (status 0xfe); nyheden 0x23 til Thirds og Conferences managere
    const name = g.leagues[third]?.name ?? '';
    forEachHuman(() => {
      const me = g.clubs[g.userClub];
      if (!me || (me.league !== third && divOf(g, me) !== conf)) return;
      addNews({ cat: 'general', key: 'news.cmNotPromoted', params: { club: cand.name, comp: name }, link: { kind: 'club', id: cand.id } });
    });
    return;
  }
  const order = finalOrder(comp);
  const down = order.slice(Math.max(0, order.length - THIRD_DOWN)).map((cid) => g.clubs[cid]).filter((c): c is Club => !!c && c.league === third);
  moveClub(g, cand, third, thirdDiv, true);
  for (const c of down) moveClub(g, c, confLeague, conf, false);
}
