// Bestyrelsens tekster som i originalen (MANAGER_MANAGER, manager_manager.cpp 3.9.68) – kun den originale database i ægte tilstand.
// Kilde: ~/cm0102-engine/notes/board/notes-D-expect.md (afkodet af exe'en; teksterne ordret fra exe'ens strenge).
//
//   0x6a4ae0 news_board_expectations_text: overskriften ("Board want the title" …) og brødteksten 0x694440 build_board_expectation_text
//   0x6a4d40 news_board_confidence_update_text: "Board Confidence Update" + 0x690d80
//   0x690d80 build_board_confidence_text (504 blade: dage i jobbet, formuebånd 0x5986b0, ligabånd 0x690bd0, tillidsbånd 0x690b70,
//            løbet 0x690c30) – også Board Confidence-skærmen 0x6b2080 (manager_screens.cpp)
//   0x6a9470 svaret på Board Request (stadionudvidelsen)
//
// Ikke porteret: 0x693850 build_board_squad_opinion_text (formandens favoritter/uvenner blandt spillerne – kræver formandens
// relationer), som originalen tilføjer efter tillidsteksten, når formanden har nogen.
import T from './data/cmBoardTexts.json';

const D = T as { S: string[]; t60: number[][][][]; t30: number[][][]; t0: number[] };
const fill = (s: string, club: string, n = 0) => s.replace(/\{club\}/g, club).replace(/\{n\}/g, String(n));

// ---------------------------------------------------------------- forventningerne (0x6a4ae0 / 0x694440)

/** 0x6a4ae0 overskriften (want_body = 0); `fa` = id > clubCount − 2·nationCount (landshold) */
export function expectTitle(f: number, fa = false): string {
  if (fa) return 'F.A. Announce Expectations';
  if (f & 0x400) return 'Board expect glory';
  if (f & 0x002) return 'Board want the title';
  if (f & 0x085) return 'Board hope for successful season';
  if (f & 0x030) return 'Board expecting difficult season';
  if (f & 0x308) return 'Board look forward to new season';
  return 'Board announce expectations';
}

/** 0x694440 brødteksten. `nonEurope` = klubbens land ligger uden for Europa ("Continental"), `autoPromo` = divisionen har direkte oprykning.
 *  Finansvarianterne (bit 0x800) er udeladt: bitten sættes ingen steder i originalen (notes-D-expect.md §5.6). */
export function expectBody(club: string, f: number, nonEurope: boolean, autoPromo: boolean): string {
  const pre = `The ${club} directors expect`;
  const eu = (e: string, c: string) => (nonEurope ? c : e);
  if (f & 1) {
    if (f & 0x400) return `${pre} success ${eu('in Europe', 'in Continental competition')} and an excellent league position at the end of the season.`;
    if (f & 0x100) return `${pre} success both domestically and ${eu('in Europe', 'on the Continent')}.`;
    return `${pre} ${eu('European', 'Continental')} qualification.`;
  }
  if (f & 2) {
    if (f & (0x400 | 0x100)) return `${pre} great success in every area this season.`;
    return `${pre} the club to mount a serious ${autoPromo ? 'promotion' : 'Championship'} challenge this season.`;
  }
  const grp = (who: string, base: string, euro: string, cup: string) => `${pre} ${who}${f & 0x400 ? euro : f & 0x100 ? cup : base} this season.`;
  if (f & 4) return grp('the team to ', 'achieve promotion', 'achieve promotion and achieve European success', 'achieve promotion and enjoy a successful cup run');
  if (f & 8) return grp('the club to ', 'reach the playoffs', 'reach the playoffs and achieve European success', 'reach the playoffs and enjoy a successful cup run');
  if (f & 0x40) return grp('the club to ', 'attain a respectable league position', 'achieve European success and attain a respectable league position', 'achieve cup success and attain a respectable league position');
  if (f & 0x10) return grp('the club to ', 'stay clear of relegation', 'achieve European success and stay clear of relegation', 'achieve cup success and stay clear of relegation');
  if (f & 0x20) return grp('the club to ', 'battle bravely against relegation', 'achieve European success and battle bravely against relegation', 'achieve cup success and battle bravely against relegation');
  return `${pre} you to improve the club's squad during this season.`;
}

// ---------------------------------------------------------------- tilliden (0x690d80)

export interface ConfidenceIn {
  club: string;
  /** dage i jobbet: (år − ansat år)·365 − ansat dag + dag (0x6b2080 / 0x6a4c40) */
  days: number;
  /** 0x5986b0 −2…2, 0x690bd0 (B+0x12) og 0x690b70 (B+6) 0…6, 0x690c30 type 1…5 og længde */
  wealth: number; leagueBand: number; confBand: number; runType: number; runLen: number;
  /** halen: dage siden B+0x41 ("arrogance"), B+6 og B+0x16 (fansene) */
  arrogDays: number; conf: number; fans: number;
  /** landshold: nationaliteten ("English") – så bruges FA-teksterne */
  national?: string;
}

const TAIL = {
  a1: 'The {club} board are somewhat unsatisfied with your performance as manager, especially in light of your recent arrogance towards the board.\n\nThe board have indicated that the fans\' enthusiastic support of you is all that is convincing them to retain you as manager.',
  a2: 'The {club} board are somewhat unsatisfied with your performance as manager, especially in light of your recent arrogance towards the board.',
  a3: 'The {club} board are disappointed with your performance as manager, especially in light of your recent arrogance towards the board.\n\nThe board have indicated that if wasn\'t for the enthusiastic support of the club\'s fans they would be reviewing your position at the club.',
  a4: 'The {club} board are somewhat disappointed with your performance as manager, especially in light of your recent arrogance towards the board.',
  f1: "If things don't improve then we may have to start listening to those supporters who have been calling for your resignation.",
  f2: 'Please ignore those supporters who have been calling for your resignation.\n\nYou have our total confidence and support.',
  f3: "We are sad to see that our fans' enthusiastic support for the team appears to be waning.",
  f4: 'We are pleased to see that you have built a rapport with the fans.',
};

/** 0x690d80 build_board_confidence_text */
export function confidenceText(i: ConfidenceIn): string {
  const W = Math.max(-2, Math.min(2, i.wealth)) + 2;
  let main: string;
  if (i.national !== undefined) {
    const v = i.conf;
    const how = v > 9500 ? 'delighted' : v > 8500 ? 'very pleased' : v > 6500 ? 'pleased' : v > 4275 ? 'satisfied' : v > 3500 ? 'unsatisfied' : 'very disappointed';
    main = `The ${i.national} Football Association are ${how} with your performance as manager.`;
  } else {
    if (i.days < 30) return fill(D.S[D.t0[W]], i.club);
    const T5 = Math.max(1, Math.min(5, i.runType)) - 1;
    if (i.days < 60) return fill(D.S[D.t30[W][i.confBand][T5]], i.club, i.runLen);
    main = fill(D.S[D.t60[W][i.leagueBand][i.confBand][T5]], i.club, i.runLen);
  }
  // halen 0x693267 (dage ≥ 60 og landshold)
  let extra = '';
  if (i.arrogDays < 120 && i.conf < 6500) {
    if (i.conf > 4275) main = fill(i.fans > 1500 ? TAIL.a1 : TAIL.a2, i.club);
    else if (i.conf > 3500) main = fill(i.fans > 1500 ? TAIL.a3 : TAIL.a4, i.club);
  } else if (i.fans < -750) { if (i.conf < 3750) extra = TAIL.f1; else if (i.conf < 5500) extra = TAIL.f2; }
  else if (i.fans < -500) extra = TAIL.f3;
  else if (i.fans > 1500) extra = TAIL.f4;
  return extra ? `${main}\n\n${extra}` : main;
}

// ---------------------------------------------------------------- Board Request (0x6a9470)

/** 0x6a9470 overskriften pr. anmodning (1–6; ellers "oranges"). NB: anmodning 2 (træningsanlægget) har overskriften om ungdommen i originalen */
const REQUEST_TITLE: Record<number, string> = {
  1: 'Board reaction to request to expand stadium', 2: 'Board reaction to request for youth investment', 3: 'Board reaction to request for transfer funds',
  4: 'Board reaction to request for higher wage budget', 5: 'Board reaction to request for time to rebuild squad', 6: 'Board reaction to request for player bonus payments',
};
export const requestTitle = (req: number) => REQUEST_TITLE[req] ?? 'Board reaction to request for larger half time oranges';

const RQ = {
  c: 'The {club} board have dismissed your request but stressed that if the situation changes they will inform you immediately.',
  a: 'The {club} board have dismissed your request.\n\nThey politely remind you that your job is to manage the team and not to run the business side of the club.',
};
/** 0x6a9470 svarteksterne pr. anmodning (1 stadion, 2 træningsanlæg) og svarkode; koder uden for tabellen giver standardteksten */
const REPLY: Record<number, [string[], string]> = {
  1: [["The {club} board concur that the club stadium needs to be improved if the club is to fulfil its full potential.\n\nThey assure you that there are plans afoot to expand the stadium.",
    'The {club} board do not consider the club stadium in need of expansion.\n\nThey would also prefer not have their time wasted repeatedly on this issue.',
    'The {club} board indicate that the club cannot consider expanding the stadium at this time due to lack of funds.',
    'The {club} board do not consider the club stadium in need of expansion.\n\nThey would also prefer not have their time wasted on issues which are not related to your managerial duties.',
    "The {club} board indicate that they don't believe that the club requires expansion of its stadium at this time.",
    "The {club} board indicate that they don't believe that the club requires expansion of its stadium at this time.",
    'The {club} board politely remind you that they have already indicated that they are considering the expansion of the club stadium.',
    "The {club} board remind you that unfortunately the club doesn't own the stadium and so cannot expand its capacity."],
  "The {club} board indicate that they don't believe that the club requires expansion of its stadium at this time."],
  2: [["The {club} board indicate that they are investing in expanding the club's training facilities.",
    "The {club} board do not consider the club's training facilities in need of improvement.\n\nThey would also prefer not have their time wasted repeatedly on this issue.",
    "The {club} board indicate that the club cannot consider improving the club's training facilities at this time due to lack of funds.",
    "The {club} board do not consider the club's training facilities in need of improvement.\n\nThey would also prefer not have their time wasted on issues which are not related to your managerial duties.",
    "The {club} board indicate that they don't believe that the club's training facilities require improvement.",
    "The {club} board indicate that they don't believe that the club's training facilities require improvement.",
    "The {club} board politely remind you that they have already approved the improvement of the club's training facilities."],
  "The {club} board indicate that they don't believe that the club's training facilities require improvement."],
};
/** anmodning 5 (tid): kode 0, 4, 6; ellers 0xa10234 */
const TIME: Record<number, string> = {
  0: 'The {club} board indicate that they have faith in your ability as a manager and will give you time to turn the club around.',
  4: "The {club} board are surprised by your request for more time to reshape the squad as the board haven't indicated any displeasure with your performance so far.",
  6: 'The {club} board have already indicated that they are willing to wait for your regime to produce results, however they find your insecurity rather unsettling.',
};

/** 0x6a9470 (want_body): klubbens lange navn, anmodningen og svarkoden fra 0x6a8810 */
export function requestReply(club: string, req: number, code: number): string {
  let s: string;
  if (code === 0xc) s = RQ.c;
  else if (code === 0xa) s = RQ.a;
  else if (req === 5) s = TIME[code] ?? 'The {club} board feel that you have had more than enough time to make this team your own.\n\nThe stability of your job will depend upon the results that your team obtain.';
  else { const [list, def] = REPLY[req] ?? [[], '']; s = list[code] ?? def; }
  return fill(s, club);
}
