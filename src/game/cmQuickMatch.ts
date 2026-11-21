// engine+0 – kampens «hurtige» tilstand (cm0102.exe 3.9.68, afkodet 21/11-2026 til K7 #7 klubomdømmet).
//
// MATCH_DAY (0x6b4360 → 0x6b4af2) kalder init_match(fixture, 0x6b66a0(fixture), 0, 0): engine+0 = svaret. init_match sætter desuden engine+0 = 1,
// når [0xa5a390] = 0 (aldrig i et almindeligt spil – create_game 0x8277a6), når de to holds udtagne spillere (0x6db500's ud-parameter: pladserne
// 0..10 + bænken med staff-id < [0xae2364], dvs. ikke genererede) tilsammen er færre end 5 og kampen ikke vises (init_match's 4. argument = 0),
// og når engine+0x8eba ≠ 0 (kun nulstillet i init_match 0x6b828c – aldrig sat). engine+0 læses af:
//   0x6ec55f (sub_6ec010)          turneringens omdømme > 12 giver kun et løft, når engine+0 = 0 (matchValues.ts engByte0)
//   0x6d26b0/0x6d3610/0x6d3de0     spillernes, managerens og klubbens omdømme efter kampen: snittet [0xb74350]+0x10/+0x18 (engine+0 = 0) eller
//                                  +0x20/+0x28 (engine+0 ≠ 0) – postMatch.ts average(a7)
//   0x729ff0 (0x72a1d5)            resultatposten +0x4c = engine+0 → 0x7c0d70 lægger karaktererne i +0x10/+0x18 (0) eller +0x20/+0x28 (≠ 0)
//                                  (cmPlayerData.ts recordPlayerMatch – GameState.cmRatingAvg / cmRatingAvgQ, begge 680/100 ved spilstart 0x7c0073)
//   0x6cda20                       efter et rødt kort: engine+0 ≠ 0 springer menneskets gren over – hurtige kampe har ingen menneskeklub (se under),
//                                  så holdene er computerstyrede i begge tilfælde
//
// 0x6b66a0(fixture) → 1 (hurtig) eller 0 (fuld):
//   [0xdd7118] = 0 → 1 (spillet kører – 1 i oraklet)
//   en menneskeklub (0x600a50(klub, 1, 1, 0, 0)) eller dens B-/reservehold/moderklub (0x540a50(klub, 0, 1)) er med → 0
//   FIFA Club World Championship [0x9cf7bc] (104) / Intercontinental Cup [0x9cf6e4] (325) → 0; Welsh Premier Cup [0x9cf958] (185): England [0x9cf2e4]
//     eller Wales [0x9cf510] spilles fuldt (nation +0x11c & 2) → 0
//   Reserve [0x9cf684] uden menneske → spejderne (0x7f9720)
//   en menneskemanager (de sidste 16 staffposter, +0x5f = 1) i en klub, hvis division (+0x57) er hjemme- eller udeholdets → 0
//   udeholdet er et landshold (0x53b900) → Intertoto-testen; ellers venskabskamp (0x5c2990: turneringen = [[0xae2c74]+4]) → omdømmetesten;
//   Inter-Toto Cup [0x9cf6f8] (330) → omdømmetesten: hjemme +0x80 + ude +0x80 > 12000 → 0, ellers spejderne
//   ellers 0x48dd70(turnering, fixture) → rækken i 0xb63d60 med den kode (+0x14): 0 og 1 (landsholdsturneringerne) → 0; 3..7 (verdensdelene):
//     turneringens verdensdel (+0x59) er en af de fuldt spillede landes (mærket i 0xb67a58 af nation +0x71) → 0; en række med et fuldt spillet
//     land (+0x11c & 2) → 0; ellers spejderne
//   spejderne 0x7f9720 (SCOUT_MANAGER [0xb74448]): en klubvagt (listen 0xb74438) på holdene eller en anmodning (+0x5c) på en spiller i kampen,
//     som kan spille (ikke skadet 0x62c400 = 2, ikke udelukket 0x55d270, lejereglerne 0x8cf5e0) → 0; ellers 1
// 0x48dd70: venskabs-/turnéturneringer (0x5c6710) og Reserve ser på kampen: et landshold → 1; samme land, der er indlæst → landets kode, ellers 3.
//   Andre: turneringens land (+0x5d) indlæst → kode, ellers 3; uden land 0x669a10/0x669ae0 (landsholdsturneringerne) → 0/1, ellers 0x669470:
//   104/325 → 2, verdensdelens række (+4 = +0x59) → 3..7.
// Ikke porteret i 0x7f9720: klubvagterne (listen er tom – Assign Scout ▸ Club er ikke porteret, cmScoutAsg.ts), staff +0x24 (kun +0x39),
//   0x8c7560 (arbejdstilladelsen) og 0x7757d0 – de kræver en spejderanmodning fra mennesket.
import type { Fixture, GameState, Player } from './types';
import { isHumanClub } from './humans';
import { linkedClub } from './cmBTeam';
import { RSV_COMP } from './cmReserveMatches';
import { cmLoanBar } from './cmLoan';
import { CM_COMP_ID } from './engine/grid/gameInputs';
import { postHooks } from './cmPlayerData';

const s16 = (v: number) => (v << 16) >> 16;
const isFriendly = (c: string) => c === 'FRIENDLY' || c.startsWith('FR');
/** nation +0x11c & 2: landet spilles fuldt (Select League(s) = g.activeNations) */
const fullNation = (g: GameState, n: number) => n >= 0 && g.activeNations.includes(n);
const contOf = (g: GameState, n: number) => (n >= 0 ? g.cmNationCont?.[n] ?? -1 : -1);

/** 0x7f9720: en anmodet spiller (SCOUT_MANAGER +0x5c) spiller for et af holdene og kan spille */
function scouted(g: GameState, f: Fixture): boolean {
  for (const r of g.cmScoutReq ?? []) {
    const p = g.players[r.pid];
    if (!p || (p.club !== f.home && p.club !== f.away)) continue;
    if (p.injury || p.banned > 0) continue;
    if (cmLoanBar(g, p, f) === 0) return true;
  }
  return false;
}

/** 0x6b66a0 + init_match 0x6b85f9–0x6b8af6: engine+0 for en klubkamp. `picked` = de to holds udtagne (11 + bænken), `watched` = engine+0x8ebb. */
export function cmQuickMatch(g: GameState, f: Fixture, picked: [Player[], Player[]], watched: boolean): 0 | 1 {
  const q = quick6b66a0(g, f) ? 1 : 0;
  if (q) return 1;
  // init_match 0x6b8ade: færre end 5 databasespillere i de to trupper og kampen vises ikke
  const real = (ps: Player[]) => ps.filter((p) => !p.regen && !p.virtual).length;
  if (real(picked[0]) + real(picked[1]) < 5 && !watched) return 1;
  return 0;
}

function quick6b66a0(g: GameState, f: Fixture): boolean {
  const home = g.clubs[f.home], away = g.clubs[f.away];
  if (!home || !away) return true;
  const human = (c: number) => isHumanClub(c) || (() => { const l = linkedClub(g, c); return !!l && isHumanClub(l.other); })();
  if (human(f.home) || human(f.away)) return false;
  const id = CM_COMP_ID(g, f.comp);
  if (id === 104 || id === 325) return false;
  const eng = g.nations.findIndex((n) => n.name === 'England'), wal = g.nations.findIndex((n) => n.name === 'Wales');
  if (id === 185 && (fullNation(g, eng) || fullNation(g, wal))) return false;
  if (f.comp === RSV_COMP) return !scouted(g, f);
  // de sidste 16 staffposter med +0x5f = 1: menneskemanagerne i en klub i hjemme- eller udeholdets division
  const humans = [...new Set([g.userClub, ...(g.humans ?? []).map((h) => h.userClub)])].filter((c) => c && isHumanClub(c));
  for (const c of humans) { const l = g.clubs[c]?.league; if (l && (l === home.league || l === away.league)) return false; }
  const comp = g.comps[f.comp];
  const repTest = () => (s16(g.cmClubRep?.[f.home] ?? home.rep * 100) + s16(g.cmClubRep?.[f.away] ?? away.rep * 100) > 12000 ? false : !scouted(g, f));
  if (isFriendly(f.comp) || id === 330) return repTest();
  // 0x48dd70: turneringens land spilles fuldt → landets række (England: kode 8, række 14, +0x11c & 2)
  if (comp && comp.nation >= 0 && fullNation(g, comp.nation)) return false;
  // ellers kode 3..7 (verdensdelene – spillets klubturneringer uden land er de europæiske): verdensdelen (+0x59) mærket af et fuldt spillet land
  const cont = comp && comp.nation >= 0 ? contOf(g, comp.nation) : g.cmEurope ?? -1;
  if (cont >= 0 && g.activeNations.some((n) => contOf(g, n) === cont)) return false;
  return !scouted(g, f);
}

postHooks.quick = cmQuickMatch;
