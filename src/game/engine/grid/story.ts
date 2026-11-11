// Historie- og sammenhængskommentarens betingelser (2026-11-11, oversat instruktion for instruktion fra cm0102.exe 3.9.68):
//   sub_717470 MATCH_PLAYER::is_story_event_applicable(id)      → storyApplies
//   sub_6d4b70 CM3_MATCH_ENGINE::is_context_commentary_allowed(side, id, &extra) → teamStoryApplies
//   sub_6ce310 CM3_MATCH_ENGINE::get_goal_margin(side, &own, &opp, &awayLead, &agg, &secondLeg, countGoal) → goalMargin
// Mediehistorikken: begge funktioner spørger Media::has_logged_story 0x757da0 ([0xb6b7c8]) med nyhedstypen −1. Opslaget er en
// eksakt bsearch (sammenligneren 0x757ee0: +8 person-id, +0xc klub-id, +0x13 nyhedstype, +0x11 undertype) i loggen, som kun
// Media::log_story 0x757a50 skriver – og dens fire kaldere (0x72d0d7, 0x733f65, 0x744e93, 0x74babd) logger altid typen 0xbd0/0xbd9/
// 0xbdd/0xbdf. Med −1 findes posten aldrig, så 0x757da0 giver altid 0 (særvejen 0x757dba gælder kun type 0xbdf) → hasLoggedStory = false.
import type { ShotEnv } from './takeShot';
import type { GP, Side } from './gridMatch';

/** De felter i MATCH_PLAYER, historierne læser, og som GP endnu ikke har (navne til limen) */
export interface StoryFields {
  goals: number;      // +0xc  mål i kampen (byte; ++ i sub_702050 0x706efb)
  assists: number;    // +0x3  afleveringer til skud (byte; ++ 0x7022bb / 0x707146) – takeShot.ts' navn
  minuteOn: number;   // +0x1f minuttet, han kom ind (byte; 0 for startere, sat i sub_6e1090 0x6e152b/0x6e1590 og klemt til periodens slut)
  debut: number;      // +0x30 debut (byte; MATCH_PLAYER::init 0x6eb22c/0x6eb31a/0x6eb3df: ingen kampe for klubben før (sub_7c3a40 = 0)
                      //        eller landsholdsdebut (spillerpost +0x22 = 0) – ellers 0 (0x6eb402))
  w39: number;        // +0x39 skudkvaliteten (word; sub_700bd0)
}

/** Hvad historierne kræver af limen ud over ShotEnv */
export interface StoryEnv {
  /** sætter flaget eng[4·(1000·side + id) − 0x7ae2] = 1 (0x717b28: id 8629 IMPRESSIVE_DEBUT ved 8630) */
  setEvFlag(side: number, id: number): void;
  /** [staff +0x69] < [0xae2364] g_staff_count: en spiller fra databasen (regens/genererede har id ≥ antallet) – vores: ikke en regen */
  isDatabasePlayer(q: GP): boolean;
  /** 0x54cdb0(g_current_date, staff +0x3e): dage siden han kom til klubben (Player.joined → g.date) */
  daysAtClub(q: GP): number;
  /** Media::has_response_two_for_player 0x735780: en logget historie om ham, som manageren besvarede med svar 2 (+0x10 = 2).
   *  Vores spil har ingen mediehistorik → false. */
  hasResponseTwo(q: GP): boolean;
  /** kampens rammer (fixture = engine+0x4792) */
  fixture: {
    /** fixture+0x14 ≠ 0 (turneringens objekt) */
    hasComp: boolean;
    /** klub(side) +0x57 == fixture+0x14: kampen er i klubbens liga (side 0 = fixture+0x1c, side 1 = +0x20) */
    inOwnLeague(side: Side): boolean;
    /** klub(side) +0x1db == fixture[0]: kampen er i klubbens europæiske turnering */
    inOwnContinental(side: Side): boolean;
    /** Comp::is_club_still_in_contention 0x48f150 (ingen tal): klubben er ikke slået ud af turneringen. Læses kun lige før et
     *  mediehistorik-opslag, der altid er 0 – værdien ændrer intet. */
    stillInContention(side: Side): boolean;
    /** Comp_Stats::find_club_entry 0x4a4850 på turneringens statistik (comp +8): løbene i holdets post (statistik 6–9 i 0x4a2ec0):
     *  +0x19, +0x2d, +0x41, +0x55 (dword). *Tolkning* af brugen: [sejre i træk, nederlag i træk, ubesejret i træk, uden sejr i træk]
     *  (overføres mellem sæsoner, 0x4aceb0). null = ingen post/statistik. Vores: klubbens kampe i turneringen i rækkefølge. */
    runs(side: Side): [number, number, number, number] | null;
    /** fixture +0x30 (word): < 1000 og %10 = 3 → andet ben (0x6ce383 sub_4b0850) */
    code30: number;
    /** fixture +0x4b/+0x4c: første bens mål (hjemmeholdet i denne kamp, udeholdet); 0xff = ingen */
    firstLeg: [number, number] | null;
    /** fixture +0x38 (word): & 4 = ingen udebaneregel, & 0x4000 = udebanemål først efter forlænget (periodEnd > 990) */
    flags38: number;
  };
}

type E = ShotEnv & StoryEnv;
type Q = GP & StoryFields;

/** Media::has_logged_story(staff, klub, −1, undertype, siden) 0x757da0 – altid 0 med nyhedstypen −1 (se øverst) */
const hasLoggedStory = (_q: GP | null, _side: Side, _type: number, _days: 7 | 10 | 30): boolean => false;

const minute = (E: E) => Math.trunc(E.m.clock / 11);                                      // movsx word +0x8ed0, imul 0x2e8ba2e9, sar 1
const played = (E: E, q: Q) => minute(E) - ((q.minuteOn << 24) >> 24);                    // − movsx byte +0x1f
const sb = (x: number) => (x << 24) >> 24;
const sw = (x: number) => (x << 16) >> 16;

/** fælles forudsætning 0x717530/0x71760d/0x71769d/0x717741: ingen mål (+0xc), ingen målgivende (+0x10), moral (+0x17) ≤ 8,
 *  ≤ 2 afleveringer til skud (+3, uden fortegn), karakteren ≤ min(33·spillet + 4000, 6500) */
function quiet(E: E, q: Q): boolean {
  if ((q.goals & 0xff) !== 0) return false;
  if ((q.penGoalsWon & 0xff) !== 0) return false;
  if (sb(q.morale) > 8) return false;
  if ((q.assists & 0xff) > 2) return false;
  let cap = 33 * played(E, q) + 4000;                                                      // shl 5 + 1 = ·33, lea +0xfa0
  if (cap > 0x1964) cap = 0x1964;
  return sw(q.rating) <= cap;
}

/** bytetabellen 0x717c4c: 8606–8610 → sag 0–4, 8611–8623 → 14 (ja), 8624–8632 → 5–13 */
const STORY_CASE = [0, 1, 2, 3, 4, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/** sub_717470 MATCH_PLAYER::is_story_event_applicable (thiscall q, id; ret 4). Tilfældige tal kun på de veje, originalen trækker dem. */
export function storyApplies(E: E, q0: GP, id: number): boolean {
  const q = q0 as Q, rand = E.rand, side = q.side;
  // 0x71748d/0x7174a2: datoerne i dag − 7 ([esp+0xc]) og i dag − 30 ([esp+0x14]) – kun til opslagene
  if (id < 0x1f40 || id > 0x21e4) return false;                                           // 0x7174bf
  if (E.evFlag(side, id)) return false;                                                    // 0x7174ec
  if (!E.isDatabasePlayer(q)) return false;                                                // 0x7174f9–0x71750c (+0x69 ≠ 0 og [rec] ≥ [0xae2364])
  const rating = sw(q.rating);
  // 0x717512: indekset id − 0x219e (0..0x1a, ellers 0x717bf7) slås op i bytetabellen 0x717c4c, som giver sagen i springtabellen 0x717c10
  const k = id - 0x219e;
  switch (k >= 0 && k <= 0x1a ? STORY_CASE[k] : 14) {
    case 0: {                                                                              // 8606 PLAYER_FEELING_PRESSURE 0x717530
      if (!quiet(E, q)) return false;
      for (let t = 0; t <= 0x1d; t++) if (hasLoggedStory(q, side, t, 7)) return true;      // 0x717593
      for (let t = 0x1e; t <= 0x27; t++) if (hasLoggedStory(q, side, t, 7)) return true;   // 0x7175c6
      return false;
    }
    case 1: {                                                                              // 8607 PLAYER_HITS_BACK_AT_CRITICS 0x7177d3
      if (rating < rand(0x7d0) + 0x1b58) return false;                                     // 0x7177eb jl
      for (let t = 0; t <= 0x1d; t++) if (hasLoggedStory(q, side, t, 7)) return true;      // 0x7177f1
      return false;
    }
    case 2: {                                                                              // 8608 PLAYER_HITS_BACK_AT_MANAGER 0x717827
      if (E.daysAtClub(q) < 0x5a) return false;                                            // 0x717834 sub_54cdb0(staff +0x3e/+0x42)
      if (rating <= rand(0x7d0) + 0x1b58) return false;                                    // 0x71785a jle
      return E.hasResponseTwo(q);                                                          // 0x71786a sub_735780
    }
    case 3: {                                                                              // 8609 GOOD_SERVICE_TO_PLAYER 0x717874
      if (q !== E.m.passRecv) return false;                                                // +0xf5aa
      if (!E.m.passGiver) return false;                                                    // +0xf5a6
      if ((q.shots & 0xff) <= 4) return false;                                             // +0xa (jbe)
      if (sw(q.w39) <= 0xfa) return false;                                                 // +0x39
      const r = rand(6) + 0xc;                                                             // 0x7178ab
      if (Math.trunc(played(E, q) / (q.shots & 0xff)) >= r) return false;                  // 0x7178d9 idiv
      return hasLoggedStory(q, side, 0x52, 7);                                             // 0x7178e3
    }
    case 4: {                                                                              // 8610 POOR_SERVICE_TO_PLAYER 0x7178ef
      if (q !== E.m.passRecv) return false;
      if (!E.m.passGiver) return false;
      const sh = q.shots & 0xff;
      if (sh >= 3) return false;                                                           // 0x71790d jae
      if (sh <= 0) return false;                                                           // 0x717915 jbe
      const r = rand(0x19) + 0x32;                                                         // 0x717924
      if (minute(E) <= r) return false;                                                    // 0x717946
      if (Math.trunc(played(E, q) / sh) <= 0x1e) return false;                             // 0x717977
      return hasLoggedStory(q, side, 0x52, 7);                                             // 0x717982
    }
    case 5: {                                                                              // 8624 PLAYER_STILL_STARRING_IN_TOURNAMENT 0x71798b
      if (rating <= rand(0x3e8) + 0x1f40) return false;                                    // 0x7179a3
      return hasLoggedStory(q, side, 0x34, 7);                                             // 0x7179a9
    }
    case 6:                                                                                // 8625 STARRING_IN_TOURNAMENT_BUT_NOT_TODAY 0x71760d
      if (!quiet(E, q)) return false;
      return hasLoggedStory(q, side, 0x34, 7);                                             // 0x717660
    case 7:                                                                                // 8626 TIPPED_PLAYER_NOT_IMPRESSING 0x71769d
      if (!quiet(E, q)) return false;
      return hasLoggedStory(q, side, 0x33, 30);                                            // 0x717704
    case 8: {                                                                              // 8627 TIPPED_PLAYER_IMPRESSING_IN_TOURNAMENT 0x7179bf
      if (rating <= rand(0x3e8) + 0x1f40) return false;                                    // 0x7179d7
      return hasLoggedStory(q, side, 0x33, 30);                                            // 0x7179dd
    }
    case 9: {                                                                              // 8628 PRAISED_PLAYER_IMPRESSING 0x717a1d
      if (rating < rand(0x7d0) + 0x1b58) return false;                                     // 0x717a35 jl
      for (let t = 0x28; t <= 0x3b; t++) if (hasLoggedStory(q, side, t, 7)) return true;   // 0x717a3d
      return false;
    }
    case 10: {                                                                             // 8629 IMPRESSIVE_DEBUT 0x717a73
      if (rating <= rand(0x3e8) + 0x1f40) return false;                                    // 0x717a8b
      return (q.debut & 0xff) !== 0;                                                       // 0x717a91
    }
    case 11: {                                                                             // 8630 SCORES_TO_CAP_IMPRESSIVE_DEBUT 0x717ab3
      if (rating <= rand(0x7d0) + 0x1c52) return false;                                    // 0x717acb
      if ((q.goals & 0xff) !== 1) return false;                                            // 0x717ad1
      if (played(E, q) <= 0x41) return false;                                              // 0x717afe
      if ((q.debut & 0xff) === 0) return false;                                            // 0x717b07
      E.setEvFlag(side, 0x21b5);                                                           // 0x717b28: eng+0xbf2+4000·side = 8629's flag
      return true;
    }
    case 12:                                                                               // 8631 DISAPPOINTING_DEBUT 0x717741
      if ((q.debut & 0xff) === 0) return false;
      if ((q.goals & 0xff) !== 0) return false;
      if ((q.penGoalsWon & 0xff) !== 0) return false;
      if (sb(q.morale) > 8) return false;
      if ((q.assists & 0xff) > 2) return false;
      if (played(E, q) < 0x37) return false;                                               // 0x71778d
      { let cap = 33 * played(E, q) + 4000; if (cap > 0x1964) cap = 0x1964; if (rating > cap) return false; }
      return true;
    case 13: {                                                                             // 8632 (ingen tekst i events_eng.cfg) 0x717b40
      if (rating >= 0x1964) return false;                                                  // 0x717b40
      if ((q.fouls & 0xff) <= rand(3)) return false;                                       // 0x717b4c: +0x14 > rand(3)
      if ((q.pos & 4) === 0) return false;                                                 // 0x717b6e sub_6c38c0 & 4
      if (q.posR.d <= rand(4) + 0xf) return false;                                         // 0x717b7f: spillerpost (+0x6d) +0x11 Defender
      if ((q.goals & 0xff) !== 0) return false;                                            // 0x717b9b
      if (sb(q.morale) >= rand(6)) return false;                                           // 0x717ba4: +0x17 < rand(6)
      return played(E, q) > rand(0x32) + 0x1e;                                             // 0x717bc0
    }
    case 14: default:                                                                      // 8611–8623 (0x717bf7) og alt uden for 8606–8632 (ja)
      return true;
  }
}

/** sub_6ce310 CM3_MATCH_ENGINE::get_goal_margin(side, &own, &opp, &awayLead, &agg, &secondLeg, countGoal) (ingen tal).
 *  Returnerer al: 1 ved udebanemålsføring (*awayLead), ellers own − opp (byte). */
export function goalMargin(E: E, side: Side, countGoal: boolean) {
  const fx = E.fixture, m = E.m;
  let own = 0, opp = 0, awayLead = 0, agg = 0, secondLeg = 0;
  let cntOwn0 = 0, cntOwn1 = 0;                                                            // [esp+0x13] (side 0) / bl (side 1)
  if (side === 0) { if (countGoal) cntOwn0 = 1; } else if (countGoal) cntOwn1 = 1;         // 0x6ce341–0x6ce366
  // side 0: esi = own, edi = opp; side 1: esi = opp, edi = own; *esi = +0xf5bd (side 0's mål), *edi = +0xf5f3 (side 1's)
  let e0 = m.goals[0], e1 = m.goals[1];
  if (fx.code30 < 1000 && fx.code30 % 10 === 3) secondLeg = 1;                             // 0x6ce383 sub_4b0850
  if (fx.firstLeg) {                                                                       // 0x6ce39c: +0x4b ≠ 0xff
    e0 = sb(e0 + fx.firstLeg[0]); e1 = sb(e1 + fx.firstLeg[1]); agg = 1;                   // *esi += +0x4b, *edi += +0x4c
    if (e0 + cntOwn0 === e1 + cntOwn1 && (fx.flags38 & 4) === 0 && ((fx.flags38 & 0x4000) === 0 || m.periodEnd > 0x3de)) {
      if (side === 0) { if ((m.goals[1] & 0xff) + cntOwn0 < sb(fx.firstLeg[0])) awayLead = 1; }   // 0x6ce406
      else if ((m.goals[1] & 0xff) + cntOwn1 > sb(fx.firstLeg[0])) awayLead = 1;           // 0x6ce421
    }
  }
  if (side === 0) { own = e0; opp = e1; } else { own = e1; opp = e0; }
  const ret = awayLead ? 1 : sb(own - opp);                                                // 0x6ce441 / 0x6ce45a
  return { ret, own, opp, awayLead, agg, secondLeg };
}

/** sub_6d4b70 CM3_MATCH_ENGINE::is_context_commentary_allowed(side, id, &extra) (ret 0xc). extra skrives kun ved løbene (8619–8623).
 *  Datoerne: [esp+0x18] = i dag − 10, [esp+0x20] = i dag − 30 (kun til opslagene). */
export function teamStory(E: E, side: Side, id: number): { ok: boolean; extra?: number } {
  const rand = E.rand, fx = E.fixture, no = { ok: false };
  if (id < 0x1f40 || id > 0x21e4) return no;                                               // 0x6d4bc0
  if (E.evFlag(side, id)) return no;                                                       // 0x6d4beb
  if (!fx.hasComp) return no;                                                              // 0x6d4c00 fixture+0x14
  const gd = goalMargin(E, side, false);                                                   // 0x6d4c28 (countGoal = 0)
  const g = gd.ret;                                                                        // [esp+0x3c] (byte)
  const flag13 = gd.secondLeg;                                                             // [esp+0x13]
  const row = fx.runs(side);                                                               // 0x6d4c5f ebx (0 uden statistik)
  const mn = () => minute(E);
  // fælles hale 0x6d587c: løbet [esp]-feltet > rand(3) + 1 og længden > rand(5) + 8 → extra = længden
  const tail = (cnt: number, len: number): { ok: boolean; extra?: number } => {
    if (!row) return no;                                                                   // 0x6d587c / 0x6d570d
    if (cnt <= rand(3) + 1) return no;                                                     // 0x6d5880 / 0x6d5715
    if (len <= rand(5) + 8) return no;                                                     // 0x6d5895
    return { ok: true, extra: len };                                                       // 0x6d58ae
  };
  switch (id - 0x21a3) {                                                                   // 0x6d4c75 springtabel 0x6d58b8
    case 0:                                                                                // 8611 TEAM_BACKS_UP_TITLE_TALK 0x6d4c7c
      if (!fx.inOwnLeague(side)) return no;
      if (g <= rand(3)) return no;                                                         // 0x6d4cb1
      if (!fx.stillInContention(side)) return no;                                          // 0x6d4cd5
      // 0x6d4d0c/0x6d4d8e/0x6d4e10: opslag af typerne 0x61/0x62/0x63 siden −10 dage; et fund ville give 1, når snittet af +0x35 over
      // spillerne med +0x19 < 0 er > 8000 / 7750 / (0x63:) 7500 – opslagene giver altid 0 (hasLoggedStory)
      return no;
    case 1:                                                                                // 8612 TEAM_BACKS_UP_EURO_TALK 0x6d4e5c
      if (!fx.inOwnContinental(side)) return no;
      if (g <= rand(flag13 + 3 !== 0 ? 3 : 0)) return no;                                  // 0x6d4e82 (altid rand(3))
      if (!fx.stillInContention(side)) return no;
      return no;                                                                           // 0x6d4efb type 0x5c siden −30 dage → 0
    case 2:                                                                                // 8613 TEAM_BACKS_UP_PROMOTION_TALK 0x6d4f47
      if (!fx.inOwnLeague(side)) return no;
      if (g <= rand(3)) return no;
      if (!fx.stillInContention(side)) return no;
      return no;                                                                           // 0x6d4fd7 type 0x5f → 0
    case 3:                                                                                // 8614 TEAM_BACKS_UP_RELEGATION_TALK 0x6d503d
      if (!fx.inOwnLeague(side)) return no;
      if (g >= rand(-3)) return no;                                                        // 0x6d5061 rand(−3) ∈ −2..0
      if (mn() <= 0x1e) return no;
      if (!fx.stillInContention(side)) return no;
      return no;                                                                           // 0x6d50ed type 0x3f → 0
    case 4:                                                                                // 8615 TEAM_TITLE_HOPES_DAMAGED 0x6d5139
      if (!fx.inOwnLeague(side)) return no;
      if (g >= rand(-3)) return no;
      if (mn() <= 0x1e) return no;
      if (!fx.stillInContention(side)) return no;
      return no;                                                                           // 0x61/0x62/0x41/0x63 → 0
    case 5:                                                                                // 8616 TEAM_EURO_HOPES_DASHED 0x6d52d2
      if (!fx.inOwnContinental(side)) return no;
      if (g >= rand(-3 - flag13 !== 0 ? -3 : 0)) return no;                                // 0x6d52f8 (altid rand(−3))
      if (!fx.stillInContention(side)) return no;
      return no;                                                                           // 0x5c → 0
    case 6:                                                                                // 8617 TEAM_PROMOTION_HOPES_DAMAGED 0x6d53c0
      if (!fx.inOwnLeague(side)) return no;
      if (g >= rand(-3)) return no;
      if (mn() <= 0x1e) return no;
      if (!fx.stillInContention(side)) return no;
      return no;                                                                           // 0x5f/0x40 → 0
    case 7:                                                                                // 8618 TEAM_RELEGATION_FEARS_ALLAYED 0x6d5509
      if (!fx.inOwnLeague(side)) return no;
      if (g <= rand(3)) return no;
      if (mn() <= 0x1e) return no;
      if (!fx.stillInContention(side)) return no;
      return no;                                                                           // 0x3f/0x60 → 0
    case 8:                                                                                // 8619 TEAM_MARCH_ON 0x6d5652
      if (!fx.inOwnLeague(side)) return no;
      if (g <= rand(2) + 1) return no;                                                     // 0x6d5676
      if (mn() <= 0x1e) return no;                                                         // 0x6d56a5 → 0x6d587a
      return tail(row ? row[0] : 0, row ? row[2] : 0);                                     // 0x6d587c: +0x19, +0x41
    case 9: {                                                                              // 8620 TEAM_LOSING_AGAIN 0x6d56ad
      if (!fx.inOwnLeague(side)) return no;
      if (g >= -1 - rand(2)) return no;                                                    // 0x6d56d1
      if (mn() <= 0x1e) return no;                                                         // 0x6d5704
      return tail(row ? row[1] : 0, row ? row[3] : 0);                                     // 0x6d570d: +0x2d, +0x55
    }
    case 10:                                                                               // 8621 TEAM_BREAK_BAD_RUN 0x6d5733
      if (!fx.inOwnLeague(side)) return no;
      if (g <= rand(3) + 1) return no;                                                     // 0x6d5757
      if (mn() <= 0x1e) return no;                                                         // → 0x6d5704
      return tail(row ? row[1] : 0, row ? row[3] : 0);
    case 11: {                                                                             // 8622 UNBEATEN_RUN_UNDER_THREAT 0x6d578b
      if (!fx.inOwnLeague(side)) return no;
      if (g >= rand(-3)) return no;                                                        // 0x6d57af
      const t = mn();
      if (t <= 0x1e) return no;
      if (t > 0x4b && g < -1) return no;                                                   // 0x6d57de/0x6d57e7
      return tail(row ? row[0] : 0, row ? row[2] : 0);
    }
    case 12: {                                                                             // 8623 UNBEATEN_RUN_SURELY_BROKEN 0x6d57f3
      if (!fx.inOwnLeague(side)) return no;
      if (g === -1) { if (mn() > 0x50) return tail(row ? row[0] : 0, row ? row[2] : 0); return no; }   // 0x6d5813
      if (g === -2) { const r = rand(0xa) + 0x46; if (mn() > r) return tail(row ? row[0] : 0, row ? row[2] : 0); return no; }   // 0x6d584e
      return no;
    }
    default: return { ok: true };                                                          // 0x6d58b0 (ja)
  }
}

/** sub_6d4b70 med ud-argumentet som i originalen (thiscall eng, (side, id, &extra)): extra skrives kun, når løbene giver det */
export function teamStoryApplies(E: ShotEnv, side: number, id: number, out?: { v: number } | null): boolean {
  const r = teamStory(E as E, side as Side, id);
  if (out && r.extra !== undefined) out.v = r.extra;
  return r.ok;
}
