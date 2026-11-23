// CM 01/02 "Go on holiday ?" (0x6b2d80): HUMAN_MANAGER-posten (0xa6ef bytes pr. menneske, [0xb63c98] → +0 posterne, +4 antallet):
//   +0x9a01 dword = på ferie (HM.is_on_holiday 0x5fd210), +0x9b23 + i = ferievalg i (HM.get_holiday_option 0x5fea50, sat af 0x5feb60).
// Valgene (skærmens rækker, 0x6b2f90–0x6b3340, og klikkene 0x6b35c1):
//   0 bud på spillerne: 1 "Reject all offers for players", 2 "Reject all offers below asking price" (rækkerne udelukker hinanden, et klik
//     på den valgte slår fra) – læst af asking price 0x4d16ce (2 og 1: udbudsprisen = værdien +0x52) og ai_respond_to_bid 0x8c822a/0x8c825d
//   1 "Apply for manager position at higher reputation clubs" – add_job_vacancy 0x69c4e7 og jobtilbuddets auto_respond 0x784209
//   2 "Use current match tactics" og 3 "Use current team selection when possible" – kampens udtagelse (0x6dbc50/0x6e0230 …)
//   4 køb: 1 "Do not buy any players", 2 "Only buy players from shortlist" (udelukker hinanden) – trupplanen 0x83fb09/0x842ecf
// Valgene bliver stående i posten til næste ferie (skærmen viser posten).
import type { GameState, HolidaySettings } from './types';
import type { CmMem } from './cmMem';

/** HM.get_holiday_option 0x5fea50 for spillets indstillinger */
export function holidayOpt(h: HolidaySettings | undefined, i: number): number {
  if (!h) return 0;
  switch (i) {
    case 0: return h.rejectAll ? 1 : h.rejectBelow ? 2 : 0;
    case 1: return h.applyJobs ? 1 : 0;
    case 2: return h.useTactics ? 1 : 0;
    case 3: return h.useSelection ? 1 : 0;
    case 4: return h.noBuy ? 1 : h.onlyShortlist ? 2 : 0;
  }
  return 0;
}

/** 0x6b35c1: et klik på en række – valg 0 og 4 er tre-tilstandsbytes (rækken sætter sin værdi, eller 0 hvis den allerede er sat) */
export function holidayToggle(s: HolidaySettings, k: keyof HolidaySettings): HolidaySettings {
  const n = { ...s, [k]: !s[k] };
  if (n[k]) {
    if (k === 'rejectAll') n.rejectBelow = false;
    if (k === 'rejectBelow') n.rejectAll = false;
    if (k === 'noBuy') n.onlyShortlist = false;
    if (k === 'onlyShortlist') n.noBuy = false;
  }
  return n;
}

/** HUMAN_MANAGER i den byggede hukommelse (cmSlMem/cmWageGame): menneskets manager er den sidste person (id = antal − 1 → post 15) */
const HM0 = 0x6c000000, HM_POSTS = 0x6c000100, HM_POST = 0xa6ef;
export function writeHolidayMem(m: CmMem, g: GameState): void {
  const h = g.manager?.holiday;
  if (!h || !g.userClub) { m.w32(0xb63c98, 0); return; }
  m.w32(0xb63c98, HM0); m.w32(HM0, HM_POSTS); m.w32(HM0 + 4, 16);
  const p = HM_POSTS + 15 * HM_POST;
  m.w32(p + 0x9a01, 1);
  for (let i = 0; i < 5; i++) m.w8(p + 0x9b23 + i, holidayOpt(h, i));
}

/** 0x5fd210 / 0x5fea50 på hukommelsen: post = [HM] + 0xa6ef · (id − [0xae2364] + 16); uden for 0..antal−1 → 0 */
function hmPost(m: CmMem, staffAdr: number, staffCount: number): number {
  const hm = m.u32(0xb63c98);
  if (!hm || !staffAdr) return 0;
  const idx = m.s32(staffAdr) - staffCount + 16;
  if (idx < 0 || idx > m.s32(hm + 4) - 1) return 0;
  return (m.u32(hm) + idx * HM_POST) >>> 0;
}
export function onHoliday_5fd210(m: CmMem, staffAdr: number, staffCount: number): number {
  const p = hmPost(m, staffAdr, staffCount);
  return p ? m.s32(p + 0x9a01) : 0;
}
export function holidayOpt_5fea50(m: CmMem, i: number, staffAdr: number, staffCount: number): number {
  const p = hmPost(m, staffAdr, staffCount);
  return p ? m.u8(p + 0x9b23 + i) : 0;
}

/** Spillets egen tilstand: mennesket er på ferie (assistenten styrer klubben) */
export function onHoliday(g: GameState): boolean {
  return !!g.manager?.holiday && !!g.userClub;
}

/** 0x600a50(klub, 0, …) = 0 for menneskets klub: på ferie (+0x9a01) regnes den ikke som menneskets – de AI-funktioner, der kalder 0x600a50
 *  med andet argument 0 (CONTRACT_MANAGER 0x4c7ac0/0x4cda70, trupplanen 0x83cb40's daglige kald, make_club_bids 0x84a020), behandler den som en
 *  computerklub. Kun i dét tilfælde; kald med andet argument 1 (nyheder 0x7875e0, trupplanens menneskegrupper) ser stadig mennesket. */
export function holidayClub(g: GameState, cid: number): boolean {
  return HOLIDAY_AI && !!cid && onHoliday(g) && cid === g.userClub;
}
/** CM_HOLIDAY_AI=0: menneskets klub regnes som menneskets også på ferie (målinger før/efter) */
export const HOLIDAY_AI = (typeof process !== 'undefined' ? process.env?.CM_HOLIDAY_AI : undefined) !== '0';

/** 0x600a50(klub, 0, 1, 0, 0): et menneske styrer klubben og er ikke på ferie */
export function humanClub0(g: GameState, cid: number): boolean {
  return !!cid && g.clubs[cid]?.manager === -1 && !holidayClub(g, cid);
}

/** acceptJob (board.ts) til assistentens ja på ferie (cmBoardGame.ts holidayJobAnswers) – sat af board.ts (ingen cirkulær import) */
export const holidayHooks: { acceptJob?: (cid: number) => void } = {};
