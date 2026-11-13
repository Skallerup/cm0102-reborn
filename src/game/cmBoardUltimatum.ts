// Bestyrelsens anmodninger og ultimatummet som i originalen (MANAGER_MANAGER, manager_manager.cpp / ultimatum.cpp i cm0102.exe 3.9.68) – kun den
// originale database i ægte tilstand. Oversat instruktion for instruktion fra disassemblyen (13/11-2026):
//
//   0x6ae180  board_request_available(klub, anmodning)  – Meet with Board-skærmen 0x4253f0 tegner punktet gråt, når den giver 0:
//             kun "Invest in youth development" (2), når træningsanlægget (club +0x7f) er 20
//   0x9064a0  ultimatum-skærmen (knappen "Ultimatum" i nyheden 0x1786, 0x782c6f: anmodning ≠ 5, svar ≠ 0 og ≠ 6, slot 5 = 0) → "Please Confirm"
//             (0xaa1bbc/0xaa1ca8/0xaa1da0/0xaa1e94) → Yes: 0x6ad610 og nyhedens slot 5 = 1 (knappen forsvinder)
//   0x6ad610  issue_ultimatum(manager, klub, anmodning)  → issueUltimatum
//   0x6aca50  board_decide_ultimatum(S, klub, manager)   → decideUltimatum (svar 1 ja, 2 fyret, 3 tilgivet "this once", 4 "inexperienced")
//   0x6ad930  nyheden 0x178f (type 1 = tilhængerne, type 3 = bestyrelsens svar) – teksterne 0x6adb70 i cmBoardText.ts (ultimatumTitle/-Body)
//
// Spillets data → originalens felter: se cmBoardGame.ts cmBoardUltimatum. Ikke i spillet: 0x547af0 (formanden bliver uven med manageren, når han
// fyrer ham – staffs præferencelister findes ikke; de tilfældige tal trækkes).
import { type BoardRec, type CmDate, type Rand, daysSince, ftol, s16, s8 } from './cmBoard';

/** 0x6ae180: punktet kan vælges (ellers gråt) – træningsanlæggets byte (club +0x7f) */
export function boardRequestAvailable(req: number, facilities: number): boolean {
  return !(req === 2 && s8(facilities) === 20);
}

/** 0x782c6f: nyheden 0x1786 (svaret på en anmodning) får knappen "Ultimatum" */
export function ultimatumOffered(req: number, code: number, done: boolean): boolean {
  return req !== 5 && code !== 0 && code !== 6 && !done;
}

/** klubbens og managerens data, som 0x6ad610/0x6aca50 læser dem */
export interface UltimatumIn {
  req: number;
  today: CmDate;
  /** [0xdd6ec8] spillets start */
  gameStart: CmDate;
  /** manageren: ikke-spillerpost +0xa (omdømmet) og staff +0x3e (ansat) */
  mrep: number; joined: CmDate;
  /** klubbens manager (club +0xcf) +0xa – mennesket selv */
  cmRep: number;
  /** club +0x80 omdømmet, +0x64 status (3 = amatør), +0x7f træningsanlægget, nation +0x85 */
  clubRep: number; status: number; facilities: number; nat85: number;
  /** stadionets kapacitet (club +0x69 → +0x3c); null = intet stadion */
  cap: number | null;
  /** [0xae2d14] + 6·klub + 4 klubbens stemning (s8) */
  mood: number;
  /** formanden (club +0xbf): Patience (np +0x1d), Ambition (+0x57), Business (np +0xf); null = ingen */
  chair: { patience: number; amb: number; business: number } | null;
  /** Finance (0x5a0590): null = ingen; saldo (£), 0x5986b0 formuebåndet, 0x598800 transferbudgettet, +0x14 lønloftet */
  fin: { balance: number; band: number; transferBudget: number; wageCap: number } | null;
}

export interface UltimatumOut {
  /** tilhængernes nyhed (type 1): 0 = ingen, 1 kritisk, 2 forstående; slot 9 (stadionet for lille) og 10 (træningsanlægget for dårligt) */
  fans: 0 | 1 | 2; fansStadium: boolean; fansTraining: boolean;
  /** 0x6aca50's svar (S+9): 1 ja, 2 fyret, 3 tilgivet, 4 "inexperienced" (0 = ingen nyhedstekst) */
  res: number;
  /** svar 2: afgangsposten [MM+4] {1, årsag 0xc..0xf, klub} */
  reason: number;
  /** svar 1 på anmodning 4: Finance::adjust_max_wage(fin, procent) 0x598340 */
  wagePct?: number;
}

/** 0x6aca50 board_decide_ultimatum – skriver R.d41 (datoen for seneste ultimatum), R.b5/R.d28 ved ja; returnerer svaret */
export function decideUltimatum(x: UltimatumIn, R: BoardRec, rand: Rand, out: { wagePct?: number }): number {
  if (!x.fin) return 3;
  const fin = x.fin;
  const old = R.d41;
  R.d41 = { ...x.today };
  const dLast = daysSince(x.today, old);
  const dJob = daysSince(x.today, x.joined);
  let adj = 250;
  if (dJob < 30) adj = -500;
  else if (dJob < 180) adj = -250;
  if (dLast < 15) adj += 750;
  else if (dLast < 30) adj += 500;
  else if (dLast < 180) adj -= 250;
  if (x.chair) {
    const pat = s8(x.chair.patience);
    if (pat === 1) adj -= 500;
    else if (pat < 6) adj -= 250;
    else if (pat > 15) adj += 250;
  }
  // 0x6ad598: intet ultimatum i det seneste halve år (eller i de første 90 dage i jobbet efter et for 90–180 dage siden) → tilgivet/uerfaren
  if (dLast > 180 || (dLast > 90 && dJob < 90)) {
    if (s16(x.mrep) < 5250) return 4;
    return daysSince(x.today, x.gameStart) >= 180 ? 3 : 4;
  }
  const rep = s16(x.clubRep), mood = s8(x.mood), conf = s16(R.w6);
  const spentOver = !(R.d38 > R.q30);                            // fcomp +0x38 med +0x30: ≤ (eller uordnet) → afslag
  switch (x.req) {
    case 1: {                                                     // 0x6ad414 stadion
      const mrep = s16(x.mrep);
      if (mrep < 4250) return 2;
      if (conf < 4250 && mrep < rep + adj + 750) return 2;
      const lvl = s8(x.nat85);
      let want = lvl > 18 ? 7 * rep + 5000 : lvl > 15 ? 5 * rep + 2500 : lvl > 11 ? 3 * rep + 10000 : lvl > 8 ? 2 * rep + 2500 : 2 * rep + 1250;
      if (x.status === 3) want = ftol(want * 0.5);
      if ((x.cap ?? 0) < want && rep > 5750 && mood >= 0 && conf > 7250) return 1;
      if (mood <= 2) {
        if (mrep <= 5250) return 2;
        if (mrep <= rep + adj + 750) return 2;
      }
      return conf <= s16(rand(7500) + 2500) ? 2 : 3;
    }
    case 2: {                                                     // 0x6ad259 træningsanlægget
      const mrep = s16(x.mrep);
      if (mrep < 4250 - adj) return 2;
      if (conf < 4250 - adj && mrep < rep - adj + 750) return 2;
      const lvl = s8(x.nat85);
      let want = lvl > 14 ? (rep > 6250 ? 20 : rep > 4250 ? 15 : rep <= 3250 ? 7 : 10)
        : lvl > 8 ? (rep > 6250 ? 15 : rep <= 4250 ? 4 : 10)
          : (rep > 6250 ? 10 : rep <= 4250 ? 2 : 7);
      if (x.status === 3) want = s16(ftol(want * 0.5));
      if (s8(x.facilities) < want && rep > 5750 && mood >= 0 && conf > 7250 - adj) return 1;
      if (mood <= 2) {
        if (mrep <= 5250 - adj) return 2;
        if (mrep <= rep - adj - 750) return 2;
      }
      return conf <= s16(rand(5250) + 2500) ? 2 : 3;
    }
    case 3: {                                                     // 0x6acf71 transferpenge
      const bud = fin.transferBudget + ftol(R.d38);
      let lim = rep > 7500 ? 5000 * rep - 25000000 : rep > 5250 ? 1000 * rep - 2250000 : 100 * rep - 450000;
      lim = ftol(lim * (mood > 4 ? 1.5 : mood >= 0 ? 0.75 : 0.25));
      const mrep = s16(x.mrep), cm = s16(x.cmRep);
      if (mrep < 4250 - adj) return 2;
      if (conf < 4250 - adj && mrep < rep - adj + 750) return 2;
      if (bud > lim) {
        if (spentOver) return 2;
        if (mood > 2) return 3;
        if (cm <= 5750) return 2;
        if (cm <= rep - adj - 750) return 2;
        return 3;
      }
      // (0x6ad0fd/0x6ad140 sætter svar 3, men 0x6ad199 overskriver det – kun tallene trækkes som i koden)
      if (x.chair) { if (rand(s8(x.chair.amb)) === 0) return 3; }
      else if (rand(5) === 0) return 3;
      const amt = rep > 7500 ? 5000 * rep - 32500000 : rep > 4250 ? 1000 * rep - 2250000 : 100 * rep + 50000;
      if (amt > fin.balance) {
        if (x.chair) { if (rand(s8(x.chair.business)) > 1) return 3; }
        else if (rand(5) !== 0) return 3;
      }
      R.d28 = amt;
      return 1;
    }
    default: {                                                    // 0x6accdd løn (4)
      let v = x.chair ? s8(10 - x.chair.business) : 0;
      const k = fin.band;
      v = s8(v + (k === -1 ? -5 : k === 0 ? 5 : k === 1 ? 10 : k === 2 ? 15 : -15));
      const x2 = s8(ftol(v * (mood > 4 ? 1.5 : mood > 0 ? 0.75 : 0.25)));
      const cm = s16(x.cmRep);
      if (cm < 5000) return 2;
      const edx = rep - adj;
      if (cm < edx - 1500) return 2;
      if (R.b5) {
        if (spentOver) return 2;
        if (mood > 2) return 3;
        if (cm <= 5750) return 2;
        if (cm <= edx - 1250) return 2;
        return 3;
      }
      if (fin.wageCap > 90000) {
        if (spentOver) return 2;
        if (mood > 2) return 3;
        if (cm <= 5750 - adj) return 2;
        if (cm <= edx - 1250) return 2;
        return 3;
      }
      const a = rand(x2), b = rand(50);
      if (a > b) {
        R.b5 = x.chair ? (s8(x.chair.amb) > 5 ? s8(x.chair.amb) - 5 : 5) & 0xff : (rand(10) + 5) & 0xff;
        out.wagePct = s8(R.b5);
        return 1;
      }
      if (spentOver) return 2;
      if (mood > 2) return 3;
      if (cm <= 5750 - adj) return 2;
      if (cm <= edx - 1250) return 2;
      return 3;
    }
  }
}

/** 0x6ad930's slot 9 og 10 (tilhængernes tekst): stadionet mindre end ønsket, træningsanlægget under klubbens niveau */
function fanSlots(x: UltimatumIn): [boolean, boolean] {
  const rep = s16(x.clubRep), lvl = s8(x.nat85);
  let want = lvl > 14 ? 3 * rep + 5000 : lvl > 8 ? 2 * rep + 2500 : 2 * rep + 1250;
  if (rep < 4250 && s16(want) > 5000) want = 5000;
  if (x.status === 3) want = ftol(s16(want) * 0.5);
  const small = (x.cap ?? 0) < s16(want);
  const tf = s8(x.facilities);
  const poor = (rep > 4250 && tf < 10) || (rep > 5750 && tf < 14);
  return [small, poor];
}

/** 0x6ad610 issue_ultimatum: tilhængernes reaktion (rand(6750) kun når omdømmet ≤ 6750), bestyrelsens beslutning og følgerne for posten
 *  (svar 2: R.b2 |= 2 og afgang; 3: tillid −1250; 4: −500, klemt til 1..10000). Afgangen lægges i [MM+4] af kalderen. */
export function issueUltimatum(x: UltimatumIn, R: BoardRec, rand: Rand): UltimatumOut {
  const mrep = s16(x.mrep);
  const dJob = daysSince(x.today, x.joined);
  const loud = mrep > 6750 || mrep > s16(rand(6750) + 2000);
  let fans: 0 | 1 | 2 = 0;
  if (loud) {
    const w8 = s16(R.w8);
    fans = s8(x.mood) > 0 || (w8 > 5250 && dJob > 1000) || w8 > 6250 || (dJob < 180 && mrep > 6500) ? 2 : 1;
  }
  const [fansStadium, fansTraining] = fanSlots(x);
  const o: { wagePct?: number } = {};
  const res = decideUltimatum(x, R, rand, o);
  let reason = 0;
  if (res === 2) {
    const cm = s16(x.mrep);
    if (cm > 5250 && (cm > 7250 || cm > s16(x.clubRep) - 750)) reason = 0xc;
    else if (dJob < 240) reason = 0xd;
    else reason = loud ? 0xe : 0xf;
    R.b2 |= 2;
    // formanden: rand(Patience) < rand(21) → 0x547af0 (uven) – ikke i spillet, tallene trækkes
    if (x.chair) { rand(s8(x.chair.patience)); rand(21); }
  } else if (res === 3 || res === 4) {
    R.w6 = Math.max(1, Math.min(10000, s16(R.w6 + (res === 3 ? -1250 : -500))));
  }
  return { fans, fansStadium, fansTraining, res, reason, wagePct: o.wagePct };
}
