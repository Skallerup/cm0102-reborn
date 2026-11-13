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

// ---------------------------------------------------------------- ultimatummet (0x9064a0 bekræftelsen, 0x6adb70 nyheden 0x178f)

const ULT_CONFIRM: Record<number, string> = {
  1: "either they agree to expand the club's stadium", 2: "either they agree to improve the club's training facilities",
  3: 'either they agree to make more transfer funds available',
};
/** 0x906610 "Please Confirm" (0xaa1bbc/0xaa1ca8/0xaa1da0, ellers 0xaa1e94) med klubbens korte navn (club +0x38) */
export function ultimatumConfirm(short: string, req: number): string {
  return `Are you sure that you wish to issue an ultimatum to the ${short} board ?\n\nThis would be a short statement indicating that ${ULT_CONFIRM[req] ?? 'either they agree to increase the wage budget'} or you will resign from your job.`;
}

/** 0x6adb70 overskriften: type 1 = "{kort navn} fans respond to speculation"; type 3: svar 2/3/4 = afslag, ellers ja (anmodning 4 deler 3's tekst) */
export function ultimatumTitle(type: number, req: number, res: number, short: string): string {
  if (type === 1) return `${short} fans respond to speculation`;
  const refuse = res === 2 || res === 3 || res === 4;
  if (req === 1) return refuse ? 'Board refuse to expand the stadium' : 'Board agree to expand the stadium';
  if (req === 2) return refuse ? 'Board refuse to improve the training facilities' : 'Board agree to improve the training facilities';
  return refuse ? 'Board refuse to make more money available for transfers' : 'Board agree to make more money available for transfers';
}

const RUMOUR = "{club} Manager {m} is rumoured to have issued an ultimatum to his club's board, either they";
const R2 = "{club} Manager {m}  is rumoured to have issued an ultimatum to his club's board, either they";
/** tilhængerne (0xa13050 … 0xa13ffc): kritisk (slot 7 = 1) og forstående (2) pr. anmodning; anmodning 1 og 2 har to kritiske varianter (slot 9/10) */
const FANS = {
  s1: `${R2} expand the stadium as a show of ambition for the future or he will leave the club.\n\nSupporters are said to be losing tolerance with {m}  and think that {stadium} is already a worthy home for the team.`,
  s1b: `${RUMOUR} expand the stadium as a show of ambition for the future or he will leave the club.\n\nWhile the club's supporters are said to be losing tolerance with {m}, they have indicated that it's about time the board improved the stadium.`,
  t1: `${R2} invest in improving the training facilities at the club or he will leave the club.\n\nSupporters are said to feel that the club already has a great training setup and they fail understand {m's} complaints.`,
  t1b: `${R2} invest in improving the training facilities or he will leave the club.\n\nWhile supporters are said to be losing patience with {m's} style of management, they have indicated that it's about time the board realised that the future of the club lies within the youth team and without proper investment in training facilities that future will be bleak.`,
  f1: `${RUMOUR} give him the transfer funds he requires to make the team truly competitive or he will leave the club.\n\nSupporters have indicated that they understand the reluctance of the board to lavish money upon {m} and they believe the cash would be better saved until there is a more competent manager at the helm.`,
  w1: `${R2} allow him to have a wage structure, which can attract a better calibre of players, or he will leave the club.\n\nSupporters said that they fail to understand {m's} complaints and believe he is trying to engineer a reason for leaving the club.`,
  s2: `${RUMOUR} expand the stadium or he will leave the club.\n\nSupporters are said to understand {m's} frustrations and have indicated that it's about time the board created the sort of stadium that the club deserves.`,
  t2: `${RUMOUR} invest in the training facilities or he will leave the club.\n\nSupporters are said to understand {m's} frustrations and have indicated that it's about time the board realised that the future of the club lies within the youth team and without proper investment in training facilities that future will be bleak.`,
  f2: `${RUMOUR} give him the transfer funds he requires to make the team truly competitive or he will leave the club.\n\nSupporters are said to understand {m's} frustrations and have indicated that it's about time the board matched their stated ambitions with hard cash.`,
  w2: `${RUMOUR} allow him to have a wage structure at the club which can attract a better calibre of players or he will leave the club.\n\nSupporters are said to understand {m's} frustrations and have indicated that it's about time the board matched their stated ambitions with hard cash.`,
};
/** bestyrelsens svar (0xa141c4 … 0xa14d30) pr. svarkode (1 ja, 2 fyret, 3 tilgivet) og anmodning 1–4; 4 = "inexperienced" (0xa14e5c, alle) */
const BOARD: Record<number, string[]> = {
  1: ['A terse fax from the {club} board has indicated that they were already considering expanding the stadium and expect building work to begin in the near future ',
    "A terse fax from the {club} board has indicated that they were already considering improving the club's training facilities and they expect work to begin on this in the near future.",
    'A terse fax from the {club} board has indicated that they are making extra transfer funds available to you.\n\nThey have made it plain that they expect this extra money to bring success to the club.',
    'A terse fax from the {club} board has indicated that they are increasing the budget for player wages.\n\nThey expect to see you make some important signings in the very near future.'],
  2: ['The {club} board indicated that they are unable to comply with your demand for expanding the stadium. They feel that this decision is a corporate one and not something that a manager should be involving himself with.\n\nThey cannot tolerate such outbursts and expect your desk to be cleared before tomorrow morning.',
    "The {club} board indicated that they are unable to comply with your demand for improvements in the club's training facilities.\n\nThey cannot tolerate such outbursts and expect your desk to be cleared before tomorrow morning.",
    'The {club} board indicated that they are unable to comply with your demand for extra transfer funds.\n\nThey cannot tolerate such outbursts and expect your desk to be cleared before tomorrow morning.',
    "The {club} board indicated that they are unable to comply with your demand to improve the current wage budget.\n\nThey feel that the current wage budget is correct considering the club's current financial situation.\n\nThey cannot tolerate such outbursts and expect your desk to be cleared before tomorrow morning."],
  3: ['In a private meeting with you the {club} board indicated that any decision to expand the stadium would be a commercial one and not something that the club manager would determine.\n\nThey do appreciate the work you have done in the past at the club however and are willing to overlook your outburst this once.',
    "In a private meeting with you the {club} board indicated that they are not willing to improve the club's training facilities at this time.\n\nThey do appreciate the work you have done in the past at the club however and are willing to overlook your outburst this once.",
    'In a private meeting with you the {club} board indicated that there is simply no more money available for transfer funds.\n\nThey do appreciate the work you have done in the past at the club however and are willing to overlook your outburst this once.',
    'In a private meeting with you the {club} board indicated that there is simply no more money available with which to increase the wage budget.\n\nThey do appreciate the work you have done in the past at the club however and are willing to overlook your outburst this once.'],
};
const INEXPERIENCED = 'In a private meeting with you the {club} board indicated that such demands are inappropriate from such an inexperienced manager.\n\nThey are willing to excuse this outburst but recommend that you do not repeat it again.';
/** "{s}" efter managerens navn */
const poss = (m: string) => (/s$/i.test(m) ? `${m}'` : `${m}'s`);

/** 0x6adb70 brødteksten: klubbens lange navn (club +4), managerens navn (0x53dba0) og stadionets navn; `sub` = slot 7 (type 1: 1 kritisk /
 *  2 forstående; type 3: svaret), `small`/`poor` = slot 9/10 (tilhængernes stadion-/træningsflag) */
export function ultimatumBody(type: number, req: number, sub: number, club: string, manager: string, stadium: string, small: boolean, poor: boolean): string {
  let s: string;
  const i = req === 1 ? 0 : req === 2 ? 1 : req === 3 ? 2 : 3;
  if (type === 1) {
    if (sub === 2) s = [FANS.s2, FANS.t2, FANS.f2, FANS.w2][i];
    else s = req === 1 ? (small ? FANS.s1b : FANS.s1) : req === 2 ? (poor ? FANS.t1 : FANS.t1b) : req === 3 ? FANS.f1 : FANS.w1;
  } else if (sub === 4) s = INEXPERIENCED;
  else s = BOARD[sub]?.[i] ?? '';
  return s.replace(/\{club\}/g, club).replace(/\{m's\}/g, poss(manager)).replace(/\{m\}/g, manager).replace(/\{stadium\}/g, stadium);
}
