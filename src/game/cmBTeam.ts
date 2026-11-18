// B-holdene og reserveholdet i cm0102.exe 3.9.68 (ægte CM 01/02 med den originale database) – porteret 17/11-2026.
//
// Klubparrene (moderklub ↔ B-hold) er globale klub-id'er, som indlæsningen 0x601a40 sætter: alle 1.256 globaler = −1, så går 0x604385 gennem
// klubberne i databasens rækkefølge og kalder 0x6146b0(klubbens navn +4, id), som sammenligner navnet med _stricmp (0x951c50 – kun A–Z
// foldes) mod en fast navneliste; første gren med navnet vinder, og en senere klub med samme navn overskriver id'et. Parrene og deres
// rækkefølge er 0x540a50's (cmClubLinks.ts' LINKS); navnene herunder er 0x6146b0's for hver af globalerne. To globaler deler navn med en
// tidligere (C.D. Badajoz/C.D. Logroñés 0x9d04c0/0x9d04c8) og forbliver −1.
//   0x540a50 get_linked_club(club, &erFørstehold, flag): kun klubber i Spanien [0x9cf488], Tyskland [0x9cf314] og Portugal [0x9cf434];
//            et førstehold giver B-holdet (ud = 1), et B-hold moderklubben (ud = 0). flag ≠ 0 kræver club +0x244, som create_game sætter i
//            0x541e60 for alle klubber med en partner (med land) – dvs. det samme som at parret findes.
//   0x541e60 (create_game 0x8282f1): moderklub + B-hold over 48 spillere tilsammen → de laveste efter nuværende omdømme (+0xb, qsort
//            0x945333 med 0x5402f0) fjernes fra klubben (0x53c190), men mindst to med målmandsposition ≥ 15 (+0xf) bliver.
//   0x542740 club_has_reserve_team(club): ingen reservehold for en klub med B-hold-partner eller i Spanien/Tyskland/Portugal.
//   0x4cbb60 player_squad_move_option(spiller, klub): 1 Promote To Seniors / 2 Relegate To Reserves (klubben har reservehold: +0x5e bit 1),
//            3 Promote To 'A' Team (spilleren er i klubbens B-hold), 4 Relegate To 'B' Team (spilleren er i klubben, der har et B-hold).
//            Grenen for udlejede spillere (kontraktens +0x35 bit 0x40) er ikke porteret – spillets lejemodel er en anden.
//   0x4cbd20 player_squad_move(spiller, klub): 3/4 → plads i den nye trup (0x53b9a0: < 50), statistikken arkiveres (0x7c5fe0), ud af klubben
//            (0x53c190) og ud af begge holds udtagelser (0x896c60), ind i den anden klub (0x53bd10). Kontrakten bliver (kun mærket 0x40 vendes,
//            når kontrakten er en anden klubs) – lønnen betales derfor af kontraktens klub (`Player.cmCon`, FinanceTable 0x598370).
//   0x5a0590 getClubFinance: B-holdets økonomi er moderklubbens (`financeClub`).
//   Managermenuen 0x75db00 (0x75eade–0x75ecb8): "{klub} Squad", "{klub} Reserves" og "Control Reserve Team"/"Control Senior Team Only"
//            (0x5fd480 = HUMAN_MANAGER +0x9a05) kun når 0x542740, og "{B-hold} Squad", når 0x540a50(klub, 0, 1) ≠ 0. Valget 0x425 i 0x7615d0
//            (0x762fcd): Please Confirm "Control the {klub} reserve team ?" / "Control the {klub} senior team only ?" → 0x5fd590.
//            Hvad +0x9a05 styrer i kampene (0x600a50, 0x6dbb10, 0x7e6f70): reserveholdets kampe (fixture +0x40/+0x41) – originalen har ingen
//            reservekampe for klubberne i de spilbare ligaer (cmReserves.ts), så valget mærkes ikke i 2001/02-databasen.
import type { GameState, Player } from './types';
import { cmActive, cmLogic } from './cmPlayerData';
import { moveSquadOnly, setClub, squad } from './state';
import { msvcQsort } from './engine/grid/loop';

/** [moderklubbens navne, B-holdets navne] pr. par – 0x6146b0's navne for 0x540a50's globaler */
const PAIRS: [string[], string[]][] = [
  [["Atlético de Madrid"], ["Atlético de Madrid B"]], // [0x9d012c] ↔ [0x9d0130]
  [["Athletic Club de Bilbao"], ["Athletic Club de Bilbao B"]], // [0x9d0120] ↔ [0x9d0134]
  [["F.C. Barcelona"], ["F.C. Barcelona B"]], // [0x9d0138] ↔ [0x9d013c]
  [["Real Valladolid"], ["Real Valladolid B"]], // [0x9d0140] ↔ [0x9d0144]
  [["Málaga C.F."], ["Málaga C.F. B"]], // [0x9d0148] ↔ [0x9d014c]
  [["Real Betis Balompié"], ["Real Betis Balompié B"]], // [0x9d0150] ↔ [0x9d0154]
  [["Real Club Celta de Vigo"], ["Real Club Celta de Vigo B"]], // [0x9d0158] ↔ [0x9d015c]
  [["Deportivo de La Coruña"], ["Deportivo de La Coruña B"]], // [0x9d0160] ↔ [0x9d0164]
  [["R.C.D. Espanyol"], ["R.C.D. Espanyol B"]], // [0x9d0168] ↔ [0x9d016c]
  [["C.D. Logroñés"], ["C.D. Logroñés B"]], // [0x9d0170] ↔ [0x9d0174]
  [["R.C.D. Mallorca"], ["R.C.D. Mallorca B"]], // [0x9d0178] ↔ [0x9d017c]
  [["Club Atlético Osasuna"], ["Club Atlético Osasuna B"]], // [0x9d0180] ↔ [0x9d0184]
  [["Real Oviedo C.F."], ["Real Oviedo C.F. B"]], // [0x9d0188] ↔ [0x9d018c]
  [["Real Madrid C.F."], ["Real Madrid C.F. B"]], // [0x9d0190] ↔ [0x9d0194]
  [["Sevilla C.F."], ["Sevilla C.F. B"]], // [0x9d0198] ↔ [0x9d019c]
  [["Real Sociedad C.F."], ["Real Sociedad C.F. B"]], // [0x9d0128] ↔ [0x9d01a0]
  [["Valencia C.F."], ["Valencia C.F. B"]], // [0x9d0254] ↔ [0x9d0258]
  [["S.D. Éibar"], ["S.D. Éibar B"]], // [0x9d02e4] ↔ [0x9d0328]
  [["Albacete Balompié"], ["Albacete Balompié B"]], // [0x9d03ac] ↔ [0x9d03b0]
  [["C.D. Badajoz"], ["C.D. Badajoz B"]], // [0x9d03b4] ↔ [0x9d03b8]
  [["C.D. Leganés"], ["C.D. Leganés B"]], // [0x9d03bc] ↔ [0x9d03c0]
  [["C.D. Tenerife"], ["C.D. Tenerife B"]], // [0x9d03c4] ↔ [0x9d03c8]
  [["C.D. Alavés"], ["Deportivo Alavés B"]], // [0x9d0124] ↔ [0x9d03d4]
  [["Extremadura C.F."], ["Extremadura C.F. B"]], // [0x9d03d8] ↔ [0x9d03dc]
  [["Racing Club de Santander"], ["Racing Club de Santander B"]], // [0x9d03e0] ↔ [0x9d03e4]
  [["Rayo Vallecano de Madrid"], ["Rayo Vallecano de Madrid B"]], // [0x9d03e8] ↔ [0x9d03ec]
  [["Real Murcia C.F."], ["Real Murcia C.F. B"]], // [0x9d03f0] ↔ [0x9d03f4]
  [["Real Sporting de Gijón"], ["Real Sporting de Gijón B"]], // [0x9d03f8] ↔ [0x9d03fc]
  [["Real Zaragoza"], ["Real Zaragoza B"]], // [0x9d0400] ↔ [0x9d0404]
  [["S.D. Compostela"], ["S.D. Compostela B"]], // [0x9d0408] ↔ [0x9d040c]
  [["U.D. Las Palmas"], ["U.D. Las Palmas B"]], // [0x9d0410] ↔ [0x9d0414]
  [["U.D. Salamanca"], ["U.D. Salamanca B"]], // [0x9d0418] ↔ [0x9d041c]
  [["1.FC Kaiserslautern"], ["1.FC Kaiserslautern Amateure", "1.FC Kaiserslautern (A)"]], // [0xb63cdc] ↔ [0xb63c9c]
  [["Bayer 04 Leverkusen"], ["Bayer Leverkusen Amateure", "Bayer Leverkusen (A)", "Bayer 04 Leverkusen U21"]], // [0xb63cbc] ↔ [0xb63ca0]
  [["Borussia Dortmund", "BV Borussia Dortmund"], ["Borussia Dortmund Amateure", "Borussia Dortmund (A)"]], // [0xb63ce8] ↔ [0xb63cac]
  [["FC Bayern München"], ["Bayern München Amateure", "FC Bayern München Amateure"]], // [0xb63cd8] ↔ [0xb63cd0]
  [["FC St. Pauli"], ["FC St. Pauli Amateure", "FC St. Pauli (A)"]], // [0xb63cb4] ↔ [0xb63cb0]
  [["Hamburger SV"], ["Hamburger SV Amateure", "Hamburger SV (A)"]], // [0xb63cd4] ↔ [0xb63ca8]
  [["Hertha BSC Berlin"], ["Hertha BSC Amateure", "Hertha BSC (A)"]], // [0xb63ce4] ↔ [0xb63cec]
  [["Karlsruher SC"], ["Karlsruher SC Amateure", "Karlsruher SC (A)", "Karlsruher SC II"]], // [0xb63cf0] ↔ [0xb63cf8]
  [["SV Werder Bremen"], ["SV Werder Bremen Amateure", "SV Werder Bremen (A)"]], // [0xb63cc0] ↔ [0xb63d00]
  [["TSV München 1860", "TSV 1860 München"], ["TSV München 1860 Amateure", "TSV 1860 München Amateure"]], // [0xb63cc8] ↔ [0xb63ccc]
  [["Tennis Borussia Berlin"], ["Tennis Borussia Amateure", "Tennis Borussia (A)", "Tennis Borussia Berlin II"]], // [0xb63ce0] ↔ [0xb63cb8]
  [["VfB Stuttgart"], ["VfB Stuttgart Amateure", "VfB Stuttgart (A)"]], // [0xb63cc4] ↔ [0xb63cf4]
  [["VfL Bochum"], ["VfL Bochum Amateure", "VfL Bochum (A)"]], // [0xb63cfc] ↔ [0xb63ca4]
  [["Eintracht Frankfurt"], ["Eintracht Frankfurt Amateure", "Eintracht Frankfurt (A)"]], // [0x9d02a4] ↔ [0x9d02a8]
  [["FC Hansa Rostock"], ["FC Hansa Rostock Amateure", "FC Hansa Rostock (A)"]], // [0x9d02ac] ↔ [0x9d02b0]
  [["FC Schalke 04"], ["FC Schalke 04 Amateure", "FC Schalke 04 (A)"]], // [0x9d02b4] ↔ [0x9d02b8]
  [["SG Wattenscheid 09"], ["SG Wattenscheid 09 Amateure", "SG Wattenscheid 09 (A)", "SG Wattenscheid 09 II"]], // [0x9d02bc] ↔ [0x9d02c0]
  [["Sport Lisboa e Benfica"], ["Sport Lisboa e Benfica B"]], // [0x9d02c4] ↔ [0x9d02c8]
  [["Sporting Clube de Braga"], ["Sporting Clube de Braga B"]], // [0x9d02cc] ↔ [0x9d02d0]
  [["Clube Sport Marítimo"], ["Clube Sport Marítimo B"]], // [0x9d02d4] ↔ [0x9d02d8]
  [["Futebol Clube do Porto"], ["Futebol Clube do Porto B"]], // [0x9d02dc] ↔ [0x9d02e0]
  [["Sporting Clube De Portugal"], ["Sporting Clube De Portugal B"]], // [0x9d0440] ↔ [0x9d0444]
  [["Arminia Bielefeld"], ["Arminia Bielefeld Amateure", "Arminia Bielefeld II"]], // [0x9d0448] ↔ [0x9d044c]
  [["FC Energie Cottbus"], ["FC Energie Cottbus Amateure", "FC Energie Cottbus II"]], // [0x9d0450] ↔ [0x9d0454]
  [["MSV Duisburg"], ["MSV Duisburg Amateure"]], // [0x9d0458] ↔ [0x9d045c]
  [["Hannover 96"], ["Hannover 96 Amateure"]], // [0x9d0460] ↔ [0x9d0464]
  [["1.FC Köln"], ["1.FC Köln Amateure", "1.FC Köln U23"]], // [0x9d0468] ↔ [0x9d046c]
  [["Borussia M'gladbach", "Borussia Mgladbach"], ["Bor. M'gladbach Amateure"]], // [0x9d0470] ↔ [0x9d0474]
  [["1.FC Nürnberg"], ["1.FC Nürnberg Amateure"]], // [0x9d0478] ↔ [0x9d047c]
  [["Rot-Weiss Oberhausen", "Rot-Weiß Oberhausen"], ["RW Oberhausen Amateure"]], // [0x9d0480] ↔ [0x9d0484]
  [["SC Freiburg"], ["SC Freiburg Amateure"]], // [0x9d0488] ↔ [0x9d048c]
  [["1.FC Saarbrücken"], ["1.FC Saarbrücken Amateure", "1.FC Saarbrücken II"]], // [0x9d0490] ↔ [0x9d0494]
  [["SSV Ulm 1846"], ["SSV Ulm 1846 Amateure", "SSV Ulm 1846 II"]], // [0x9d0498] ↔ [0x9d049c]
  [["SpVgg Unterhaching"], ["SpVgg Unterhaching Amateure", "SpVgg Unterhaching II"]], // [0x9d04a0] ↔ [0x9d04a4]
  [["VfB Leipzig"], ["VfB Leipzig Amateure", "VfB Leipzig II"]], // [0x9d04a8] ↔ [0x9d04ac]
  [["VfL Wolfsburg"], ["VfL Wolfsburg Amateure"]], // [0x9d04b0] ↔ [0x9d04b4]
  [["C.D. Castellón"], ["C.D. Castellón B"]], // [0x9d04b8] ↔ [0x9d04bc]
  [[], []], // [0x9d04c0] ↔ [0x9d04c4]
  [[], []], // [0x9d04c8] ↔ [0x9d04cc]
  [["C.D. Ourense"], ["C.D. Ourense B"]], // [0x9d04d0] ↔ [0x9d04d4]
  [["Córdoba C.F."], ["Córdoba C.F. B"]], // [0x9d04d8] ↔ [0x9d04dc]
  [["Cultural Leonesa"], ["Cultural Leonesa B"]], // [0x9d04e0] ↔ [0x9d04e4]
  [["Elche C.F."], ["Elche C.F. B"]], // [0x9d04e8] ↔ [0x9d04ec]
  [["Levante U.D."], ["Levante U.D. B"]], // [0x9d04f0] ↔ [0x9d04f4]
  [["Real Unión de Irún"], ["Real Unión de Irún B"]], // [0x9d04f8] ↔ [0x9d04fc]
  [["Recreativo de Huelva"], ["Recreativo de Huelva B"]], // [0x9d0500] ↔ [0x9d0504]
  [["Fortuna Düsseldorf"], ["Fortuna Düsseldorf ii"]], // [0x9d0508] ↔ [0x9d050c]
  [["sg hoechst"], ["sg hoechst ii"]], // [0x9d0510] ↔ [0x9d0514]
  [["fsv mainz 05"], ["fsv mainz 05 ii"]], // [0x9d0518] ↔ [0x9d051c]
  [["stuttgarter kickers"], ["stuttgarter kickers ii"]], // [0x9d0520] ↔ [0x9d0524]
];
/** [0x9cf488], [0x9cf314], [0x9cf434] */
const B_NATIONS = new Set(['Spain', 'Germany', 'Portugal']);

/** _stricmp 0x951c50 (C-lokalet): kun A–Z foldes */
const fold = (s: string) => s.replace(/[A-Z]/g, (c) => c.toLowerCase());

type Links = Map<number, { other: number; first: boolean }>;
const cache = new WeakMap<GameState, { n: number; links: Links }>();

/** parrene, som indlæsningen 0x601a40/0x6146b0 sætter dem, og 0x540a50's opslag (klub → partner) */
function links(g: GameState): Links {
  const n = Object.keys(g.clubs).length;
  const hit = cache.get(g);
  if (hit && hit.n === n) return hit.links;
  // navn → globalens plads (første gren med navnet vinder)
  const slot = new Map<string, number>();
  PAIRS.forEach(([a, b], i) => {
    for (const s of a) if (!slot.has(fold(s))) slot.set(fold(s), 2 * i);
    for (const s of b) if (!slot.has(fold(s))) slot.set(fold(s), 2 * i + 1);
  });
  const glob = new Array<number>(PAIRS.length * 2).fill(-1);
  for (const c of Object.values(g.clubs).sort((x, y) => x.id - y.id)) {
    const k = slot.get(fold(c.name));
    if (k !== undefined) glob[k] = c.id;   // en senere klub med samme navn overskriver (0x604385)
  }
  const out: Links = new Map();
  const bNat = (id: number) => B_NATIONS.has(g.nations[g.clubs[id]?.nation]?.name ?? '');
  // 0x540a50: førsteholdene først, så B-holdene; et par uden partner (−1) giver 0 (og club +0x244 = 0)
  for (let i = 0; i < PAIRS.length; i++) {
    const a = glob[2 * i], b = glob[2 * i + 1];
    if (a > -1 && b > -1 && !out.has(a) && bNat(a) && g.clubs[b]?.nation) out.set(a, { other: b, first: true });
  }
  for (let i = 0; i < PAIRS.length; i++) {
    const a = glob[2 * i], b = glob[2 * i + 1];
    if (a > -1 && b > -1 && !out.has(b) && bNat(b) && g.clubs[a]?.nation) out.set(b, { other: a, first: false });
  }
  cache.set(g, { n, links: out });
  return out;
}

/** gælder i ægte CM 01/02 med den originale database (cmActive) og (MODERN_PARITY 12) nye 2026/27-spil i ægte tilstand (g.cmBTeams – sat ved
 *  spilstarten: indlæsningens 0x604385 bruger exe'ens faste navneliste også på opdateringens klubber, fx Celta/Real Sociedad B) */
export const bTeamsOn = (g: GameState) => (cmActive(g) || (cmLogic(g) && !!g.cmBTeams)) && !g.draft;

/** 0x540a50(klub, &ud, 1): partneren og om klubben er førsteholdet (ud = 1) – eller null */
export function linkedClub(g: GameState, cid: number): { other: number; first: boolean } | null {
  if (!bTeamsOn(g)) return null;
  return links(g).get(cid) ?? null;
}
/** B-holdet til en moderklub (managermenuens "{B-hold} Squad") */
export function bTeamOf(g: GameState, cid: number): number | null {
  const l = linkedClub(g, cid);
  return l?.first ? l.other : null;
}
/** 0x5a0590 getClubFinance: B-holdets økonomi er moderklubbens */
export function financeClub(g: GameState, cid: number): number {
  const l = linkedClub(g, cid);
  return l && !l.first ? l.other : cid;
}

/** 0x542740 club_has_reserve_team (klubber – landsholdenes gren bruges ikke af spillet) */
export function hasReserveTeam(g: GameState, cid: number): boolean {
  if (!bTeamsOn(g)) return true;
  if (linkedClub(g, cid)) return false;
  return !B_NATIONS.has(g.nations[g.clubs[cid]?.nation]?.name ?? '');
}

/** 0x4cbb60: 0 = intet, 1 Promote To Seniors, 2 Relegate To Reserves, 3 Promote To 'A' Team, 4 Relegate To 'B' Team */
export function squadMoveOption(g: GameState, p: Player, cid: number): 0 | 1 | 2 | 3 | 4 {
  if (!p.club || p.virtual) return 0;
  if (p.club === cid && hasReserveTeam(g, cid)) return p.reserves ? 1 : 2;
  // et gemt spil fra før porten: spillets egne reserver i en klub uden reservehold kan stadig kaldes op
  if (p.club === cid && p.reserves) return 1;
  const l = linkedClub(g, p.club);
  if (!l) return 0;
  if (l.first) return cid === p.club ? 4 : 0;
  return cid === l.other ? 3 : 0;
}

/** 0x4cbd20 for 3/4 (flyt mellem moderklub og B-hold); 1/2 er spillets 'reserves'-handling. Svar: flyttet */
export function moveLinked(g: GameState, p: Player, cid: number): boolean {
  const code = squadMoveOption(g, p, cid);
  if (code !== 3 && code !== 4) return false;
  const l = linkedClub(g, cid)!;
  const from = code === 3 ? l.other : cid, to = code === 3 ? cid : l.other;
  // 0x53b9a0: en ledig plads blandt klubbens 50 (club +0xd7)
  if (squad(to).filter((x) => !x.virtual).length >= 50) return false;
  const con = p.cmCon ?? from;
  // 0x896c60(klub, spiller, 1, 1/0): ud af begge klubbers udtagelser (førsteholdet og reserverne)
  for (const t of [g.tactic, g.resTactic]) if (t && (from === g.userClub || to === g.userClub)) {
    t.lineup = t.lineup.map((id) => (id === p.id ? 0 : id));
    t.bench = t.bench.filter((id) => id !== p.id);
  }
  p.reserves = undefined;
  moveSquadOnly(p, to);
  p.cmCon = con === to ? undefined : con;
  return true;
}

/** 0x541e60 (create_game): moderklub + B-hold højst 48 spillere – de laveste efter nuværende omdømme fjernes, mindst to målmænd bliver */
export function trimLinkedSquads(g: GameState): void {
  if (!bTeamsOn(g)) return;
  for (const c of Object.values(g.clubs).sort((x, y) => x.id - y.id)) {
    const l = links(g).get(c.id);
    if (!l?.first) continue;
    // 0x541f90(klub, liste, 1): førsteholdets 50 pladser, så B-holdets, op til 100 (de genererede spillere id ≥ [0xae2364] springes over)
    const list: (Player | null)[] = [...squad(c.id), ...squad(l.other)].filter((p) => !p.virtual).slice(0, 100);
    while (list.length < 100) list.push(null);
    const rep = (p: Player) => p.cmRepMem?.[1] ?? p.cmRep?.[1] ?? 0;
    // 0x5402f0: tom bagerst, ellers faldende efter +0xb
    msvcQsort(list, (a, b) => (!a ? (b ? 1 : 0) : !b ? -1 : rep(b) - rep(a)));
    let bl = 0, gk = 0;
    for (const p of list) if (p) { bl++; if ((p.pos[0] ?? 0) >= 15) gk++; }
    if (bl <= 48) continue;
    for (let i = 99; i >= 0 && bl > 48; i--) {
      const p = list[i];
      if (!p) continue;
      if ((p.pos[0] ?? 0) >= 15) { if (gk < 3) continue; gk--; }
      // 0x53c190(klub, spiller, 0, 1, 0): ud af klubben – klubløs uden kontrakt
      setClub(p, 0);
      p.contract = null;
      p.reserves = undefined;
      bl--;
    }
  }
}
