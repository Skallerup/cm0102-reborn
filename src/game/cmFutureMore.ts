// Future-linjerne på spillerprofilens Transfer-fane, resten af 0x87dd80 (0x87ee70–0x8853ba; cm0102.exe 3.9.68, afkodet 16/11-2026 med
// ~/cm0102-engine/tools/cmdis.py). cmTransferList.ts har de første blokke og kalder grupperne herfra på originalens pladser.
//
// Kilderne, spillet ikke har (*estimeret* – grenene er porteret, men tages aldrig, før kilden findes): kontraktens begivenheder +0x40
// (0x8676f0 – sættes af transfer-/mediesystemerne 0x758200/0x741020/0x736c00/0x6b74a0), klubbens medieværdi [0xb67a44] (0x885800),
// klagerne +0x45 0x1/0x2/0x8/0x20/0x40/0x100/0x20000/0x1000000 (0x5ce2d0's kontrakttilfredshed 0x866620/0x866830), 0x1000/0x2000 (managerens/
// assistentens uven), 0x10000000 (ny manager, 0x5cccd0), 0x20000000/0x40000000 (salg af stjerner/talenter, 0x758200), tvisten 0x569e30,
// landsholdets pension 0x776380 og AWOL 0x418f60.
import type { Club, GameState, Player } from './types';
import type { FutureLine } from './cmTransferList';
import { ATTRS } from './attributes';
import { ageOn } from './dates';
import { cmContractOf, curRep, leagueAverage, statAvg, type CmContract } from './cmPlayerData';
import { dislikesClub, dislikesPerson, favoursClub, favoursPerson, personKey, managerStaff } from './cmRelations';
import { gameLeagueRow } from './engine/grid/gameTable';
import { DEMONYM } from '../ui/demonyms';

const s8 = (v: number) => (v << 24) >> 24;
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const sh = (p: Player, k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10);
const pname = (p: Player) => `${p.first} ${p.last}`.trim();
const worldRepOf = (p: Player) => Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[2] * 50);
const b4eOf = (p: Player) => cmContractOf(p).b4e ?? (p.listed ? 1 : 0);

/** det, grupperne læser af den viste spiller (bygges af cmTransferList.cmFutureLines) */
export interface FutX {
  g: GameState; p: Player; c: CmContract; club: Club | undefined;
  fl: number; b4e: number; b44: number; age: number; st: number;
  loy: number; prof: number; temp: number; amb: number; pres: number;
  future: boolean; leave: boolean;
  crep: number; rc: number; wr: number;
  /** dage siden han kom til klubben (+0x3e), siden kontraktens start (+0x25) og til udløbet (+0x2d) */
  daysJoined: number; daysStart: number; daysLeft: number;
  /** kontraktens begivenheder +0x40 (ingen kilde hos os) */
  ev: number;
  /** [0xae2d14] + 6·klub: +4 stemningen og +5 klagetælleren */
  mood: number; unhappy: number;
  /** klubbens medieværdi [0xb67a44] + 0x49·klub + 6 (0x885800) – mediesystemet findes ikke hos os (udefineret → de linjer tages ikke) */
  media?: number;
  /** navnet på det solgte talent/den solgte stjerne (0x549dd0 – udefineret → de ubenævnte linjer) */
  sold?: { youth?: string; star?: string };
}

const has = (x: FutX, bit: number) => (x.fl & bit) !== 0;
const ok1 = (x: FutX, ...codes: number[]) => codes.includes(x.st);
/** 0x62c400 (skadestatus 2 = ude) – spillets skade */
const injured = (p: Player) => !!p.injury;

// ---------------------------------------------------------------- 0x5481a0 – positionsgruppen

/** 0x5481a0(staff): bitmasken af de positioner (+0x10..+0x15) og sider (+0x17..+0x19), han har 20 i, ellers den første med mindst 15 */
export function posGroup(p: Player | null | undefined): number {
  if (!p) return 0;
  const pos = p.pos, sd = p.side;
  if (pos[0] === 20) return 1;
  const sw = pos[1], d = pos[2], dm = pos[3], m = pos[4], am = pos[5], f = pos[6];
  const L = sd[0], C = sd[1], R = sd[2];
  let v = 0;
  if (C === 20) v = R > 10 ? 0x180 : 0x80;
  if (L === 20) { v |= 0x800; if (R > 10) v |= 0x400; }
  if (R === 20) v |= 0x700;
  if (sw === 20) v |= 2;
  if (d === 20) v |= 4;
  if (dm === 20) v |= 0x18;
  if (m === 20) v |= 0x38;
  if (am === 20) v |= 0x30;
  if (f === 20) { v |= 0x40; if (am !== f && m !== f && dm !== f && d !== f && sw !== f) v |= 0x700; }
  if (v) return v;
  if (sw >= 15) return 2;
  if (d >= 15) return 4;
  if (dm >= 15) return 0x18;
  if (m >= 15) return 0x38;
  if (am >= 15) return 0x30;
  if (f >= 15) return am === 20 || m === 20 || dm === 20 || d === 20 || sw === 20 ? 0x40 : 0x740;
  return 0x10;
}

/** 0x5482f0(gruppe): positionens navn (cm.fut.pos.*) – gruppens bitmaske til den nærmeste almindelige position (*estimeret*) */
export function posKey(code: number): string {
  if (code === 1) return 'goalkeeper';
  if (code === 2) return 'sweeper';
  if (code === 4) return 'defender';
  if (code === 0x18 || code === 0x10) return 'defensiveMidfielder';
  if (code === 0x38) return 'midfielder';
  if (code === 0x30) return 'attackingMidfielder';
  if (code === 0x40) return 'striker';
  if (code === 0x740 || code === 0x700) return 'forward';
  if (code & 0x100 || code === 0x80) return 'wingBack';
  if (code & 0xf00) return 'winger';
  return 'player';
}

// ---------------------------------------------------------------- 0x548da0 – den beundrede holdkammerat

/** 0x548da0(staff, klub): holdkammeraten med den højeste score blandt de 50 første i klubben (skarpt > – den første ved lighed) */
export function admiredOf(x: FutX): Player | null {
  const { g, p, club } = x;
  if (!club) return null;
  const r = p.id % 6;
  if (x.loy < r + 6 || x.amb > 15 - r) return null;
  if (x.daysJoined < (p.id % 28) + 14) return null;
  const mean = leagueAverage(g);
  const mine = posGroup(p);
  let best: Player | null = null, bestV = -10000;
  const mates = Object.values(g.players).filter((q) => q.club === club.id && !q.loan && !q.virtual && !q.regen).sort((a, b) => a.id - b.id).slice(0, 50);
  for (const s of mates) {
    if (s === p || (s.id + p.id) % 3 === 0) continue;
    if (dislikesPerson(p, personKey(s))) continue;
    if (sh(s, 'pressure') < 11 && posGroup(s) === mine) continue;
    const cs = cmContractOf(s);
    const rcs = curRep(s);
    if (rcs <= 0x109a || rcs <= x.crep - 0x2ee) continue;
    if (s.contract?.futureClub) continue;
    if (s.ca <= 100) continue;
    let v = rcs;
    const rating = statAvg(s, 6, 0x11, 6.5), games = statAvg(s, 6, 1, 6.5);
    if (games > 5) { if (mean + 0.2 < rating) v += 500; else if (mean + 0.1 < rating) v += 250; }
    if (favoursPerson(p, personKey(s))) v += 0x4e2;
    const cons = sh(s, 'consistency');
    if (cons === 20) v += 0x4b; else if (cons > 15) v += 0x32;
    const pr = sh(s, 'professionalism');
    if (pr > 15) v += 0xfa; else if (pr < 6) v -= 0x64;
    v += (s.id + p.id) % 500;
    const st = (cs.b4f ?? 0) >> 4;
    if (st === 1) v += 0x2ee; else if (st === 2) v += 0x12c; else if (st === 3) v += 0x96;
    if (p.nation !== club.nation && s.nation === p.nation) {
      if (cs.b45 & 0x20020) v += 0x6d6;
      else if (x.daysJoined < 0x15e && x.age < 0x18) v += 0xfa; else v += 0x7d;
    }
    if (v > bestV) { best = s; bestV = v; }
  }
  return best;
}

/** 0x87f40b–0x87f80c: den beundrede holdkammerat (kun uden klager 0x10181, ikke listet, intet aftalt skifte og ikke udlejet) */
export function admiredLines(x: FutX, out: FutureLine[]): void {
  const { g, p } = x;
  if (p.loan || x.b4e & 9 || x.future || x.fl & 0x10181) return;
  const s = admiredOf(x);
  if (!s) return;
  const cs = cmContractOf(s);
  const name = pname(s);
  const push = (k: string, pr: Record<string, string | number> = {}): void => { out.push({ k, p: { name, ...pr } }); };
  const sAge = ageOn(s.dob, g.date), sRep = curRep(s);
  const sListed = !!(b4eOf(s) & 9);
  if (p.nation === s.nation && x.fl & 0x20020) {
    const nat = g.nations[s.nation]?.name;
    return push('fellowHelp', { adj: nat ? DEMONYM[nat] ?? nat : '' });
  }
  if (sAge > 0x22 && s8(cs.b3d) < 0x14) return push(x.prof > 15 && sh(s, 'influence') > 15 ? 'goodInfluence' : 'experience');
  if (sAge < 0x15) {
    if (sListed) return push('chanceDevelop');
    if (s.caps || (sRep > 0xea6 && sRep > x.crep - 0x2ee)) return push('talented');
    return push('hotProspect');
  }
  if (sListed) return push('retainServices');
  if (x.age < 0x18 && x.pres > 10 && posGroup(p) === posGroup(s)) return push('learnFrom');
  if (s8(cs.b3e) > 2 && s8(cs.b3d) < 0x32) return push('moreImportant');
  if ((sAge > 0x1c || (sAge > 0x18 && s.caps > 10)) && sRep > 0x1c52 && x.age < 0x19 && s8(cs.b3d) > 0 && s8(cs.b3f) > 0 && s8(x.c.b3d) < 0 && x.rc < 0x128e)
    return push(s8(x.c.b3f) !== 0 ? 'honouredPlaying' : !!p.reserves === !!s.reserves ? 'honouredTraining' : 'honouredClub');   // +0x5e: *estimeret* (samme hold)
  if (sAge < 0x1d && sRep > 0x1c52 && x.crep < 0x1a5e) return push('hangOnto');
  if (sAge > 0x1a && s8(cs.b3d) > 0 && sh(s, 'influence') > 15 && sRep > 0xea6 && (sRep > x.crep - 0x4e2 || worldRepOf(s) > 0x1676) && sh(p, 'influence') < 14)
    return push('inspiredLeader');
  return push(s8(cs.b3d) > 0x14 ? 'essential' : 'lotToOffer');
}

// ---------------------------------------------------------------- 0x8829d9 – klagen 2 (kontrakten)

/** 0x882926–0x882afb: kontraktklagen (+0x45 bit 2) */
export function contractLines(x: FutX, out: FutureLine[]): void {
  if (!has(x, 2)) return;
  const { loy, prof, temp, age } = x;
  const push = (k: string): void => { out.push({ k }); };
  if (loy < 10 && prof < 5 && x.wr > 0x128e) return push('agentBetter');
  if (temp < 5 && x.rc > 0x128e) return push('paidDeserves');
  if (x.future) return push(loy < 6 && prof < 10 ? 'gladMoving' : loy > 15 ? 'sadLeaving' : 'lookingFuture');
  const dislikes = dislikesClub(x.p, x.club?.id ?? 0);                           // 0x547d30
  if (dislikes && age < 0x20) {
    if (loy < 10 && prof < 10) return push('agentBetter');
    return push(x.fl === 2 ? 'considerEnd' : 'considering');
  }
  if (age > 0x20 && x.daysLeft < 0x5a) return push('extendContract');
  if (x.b44 > 0x19 && x.fl === 2 && x.daysLeft < loy * 10 + 0x7d) return push('extendContract');
  push(loy > 10 && prof > 10 ? 'negotiate' : 'wantsNew');
}

// ---------------------------------------------------------------- 0x87f80c–0x880a9b

/** 0x87fa94–0x880a9b: en ny kontrakt, begivenhederne +0x40, stemningen, ligaen, den nye manager, værdiansættelsen, økonomien og spillestilen */
export function clubLines(x: FutX, out: FutureLine[]): void {
  const { g, p, club, loy, prof, temp, amb, pres, ev } = x;
  const push = (k: string, pr?: Record<string, string | number>): void => { out.push(pr ? { k, p: pr } : { k }); };
  // 0x87f80c: salget af et stort talent (+0x45 & 0x40000000) og af en stjerne (0x20000000)
  if (has(x, 0x40000000)) {
    const nm = x.sold?.youth;
    if (nm) push(pres < 6 ? 'youthShortNamed' : 'youthDisappointedNamed', { name: nm });
    else push(pres < 6 ? 'youthUpset' : 'youthDisappointed');
  }
  if (has(x, 0x20000000)) {
    const nm = x.sold?.star, calm = x.mood > -2;
    if (nm) push(calm ? (amb > 15 && pres < 6 ? 'starAmbitionNamed' : 'starUnhappyNamed') : loy > 15 ? 'starDisappointedNamed' : 'starNeverNamed', { name: nm });
    else push(calm ? (amb > 15 && pres < 6 ? 'starAmbition' : 'starUnhappy') : loy > 15 ? 'starHold' : 'starNever');
  }
  // 0x87fa94: en ny kontrakt (kontrakten under 30 dage gammel)
  if (club && x.daysJoined > 0x12c && x.daysStart < 0x1e && !ev && !x.fl && loy > 15) push('pleasedNew');
  else if (!x.fl && x.daysJoined > 0xb4 && x.daysStart < 0x1e && loy > 10 && prof > 10) push('veryHappyNew');
  // 0x87fc14: begivenhederne +0x40 (0x200 konkurrence, 0x80000000 rival, 0x800 afløser, 0x4 harmoni)
  if (ev & 0x200) push('tooMuchCompetition');
  else if (ev & 0x80000000) push(pres < 6 ? 'rivalUpset' : 'rivalUnhappy', { pos: posKey(posGroup(p)) });
  else if (ev & 0x800) push('replacementRumour');
  else if (x.daysJoined > 0x1e && ev & 4) push(pres < 6 ? 'harmonyWorried' : pres > 15 ? 'harmonyDisappointed' : 'harmonyDismayed');
  // 0x87ff0e: stemningen i truppen (klagetælleren [0xae2d14]+5) og truppens bredde (+0x40 & 0x400)
  if (club) {
    if (!x.fl && !(x.b4e & 9) && x.unhappy === 0 && prof > 14) push('goodAtmosphere');
    if (ev & 0x400) {
      if (x.mood > 2) push(inSeason(g) ? 'squadDepthLeague' : 'squadDepth');
      else push(x.crep > 0x1676 ? 'believesDepth' : 'lackCompetition');
    }
  }
  const row = club ? gameLeagueRow(g, club.league, club.id) : null;
  const played = row?.played ?? 0;
  const ranked = played > 8;
  const pos = ranked ? row!.pos : 0, last = ranked ? row!.x72 : 0, lossRun = ranked ? row!.runs[1] : 0, winRun = ranked ? row!.runs[0] : 0;
  // 0x88010e: ligaplaceringen (+0x40 & 0x10 og en dårlig stemning)
  if (club && ev & 0x10 && x.mood < -1) {
    if (pres > 10 && loy < 6 && x.rc > 0x1676 && x.crep < 0x186a && ok1(x, 1, 2, 3)) push('tooGoodClub');
    else if (pres < 6 && loy < 6 && x.rc > 0x1676) push('worriedRep');
    else if (pos < 8 && last < 4 && amb > 10) push('shouldTop');
    else if (lossRun > 2 && loy > 15) push(pos < 8 && last < 4 ? 'shouldTop' : 'ashamed');
    else if (loy < 6 && (pos > 8 || last > 3) && ok1(x, 1, 2, 3)) push('poorPosition');
    else if (!injured(p) && !winRun && loy > 15 && pres > 10 && s8(x.c.b3d) > 10 && formSum(p) < 0x1e && ok1(x, 1, 2)) push('partlyResponsible');
    else push('underachieving');
  }
  // 0x8802ea: en dårlig stemning, men vilje til at hjælpe
  if (!(ev & 0x10) && played > 5 && club && x.mood < -2 && loy > 10 && prof > 10) push(pres > 15 ? 'morePotential' : 'strive');
  // 0x8803c7: den nye manager (+0x45 & 0x10000000)
  if (has(x, 0x10000000) && club) {
    const m = managerStaff(g, club.id);
    if (m) {
      const days = m.cmJoined ? dayNum(g.date) - dayNum(m.cmJoined) : 10000;
      const mrep = m.cmRep?.[1] ?? 0;
      if (days >= 0x5a) push('lostConfidence');
      else if (x.mood < 0 && mrep < x.crep - 0x2ee && loy < 10) push('notConvincedMgr');
      else push(mrep < x.crep - 0x4e2 ? 'worriedInexperience' : 'waitingMgr');
    }
  }
  // 0x8804e4: tilfreds med klubben (ingen klager og ingen begivenheder)
  const stats = () => ({ games: statAvg(p, 6, 1, 6.5), rating: statAvg(p, 6, 0x11, 6.5), mean: leagueAverage(g) });
  if (!x.fl && s8(x.c.b3d) > 0x19 && club) {
    if (x.mood > 2 && loy > 10) {
      const { games, rating, mean } = stats();
      if (x.daysJoined < 0x1e) push('pleasedJoined');
      else if (x.daysJoined < 0x5a) push('pleasedAt');
      else if (games > 5 && s8(x.c.b3f) > 1 && mean + 0.25 < rating) push('enjoysStyle');
      else push(s8(x.c.b3f) > 1 && loy > 15 ? 'proudPosition' : 'happyPerforming');
    } else if (club && s8(x.c.b3d) > 0x19 && loy < 10 && pres < 10 && amb > 15 && prof < 6 && p.pos[6] === 20 && x.rc > 0x128e && x.rc > x.crep - 0x2ee) {
      // 0x880660: en angriber, der klarer sig dårligt, bryder sig ikke om spillestilen
      const { games, rating, mean } = stats();
      if (games > 5 && s8(x.c.b3f) > 1 && mean - 0.35 > rating) push('dislikesStyle');
    }
  }
  // 0x8807d1: klubbens vurdering (+0x40 & 8)
  if (ev & 8 && !x.future) {
    if (x.fl & 0x10181) push(temp < 5 && prof < 15 ? 'valOutraged' : prof > 15 ? 'valDisappointed' : pres < 5 ? 'valUpset' : 'valUnrealistic');
    else if (x.age > 0x12) push(pres < 6 ? 'valPressured' : 'valUnrealistic');
    else if (pres < 6) push('valPressured');
  }
  // 0x8808ff: klubbens økonomi (+0x45 & 0x400000)
  if (has(x, 0x400000)) {
    if (amb > 15 && x.age > 0x15 && ok1(x, 1, 2) && Math.round(p.ca) > loy + 100 && x.rc > 0xcb2) push('financeAmbitions');
    else if (x.b44 < -75 && pres < 10) push('financeUnsettled');
    else if (pres < 6) push('financeWorried');
    else push(x.leave ? 'financeSecure' : 'financeConcerned');
  }
  // 0x8809e7: spillestilen (+0x40 & 0x1000)
  if (ev & 0x1000) push(x.future ? 'styleHopes' : !(p.renewal?.stance === 'refuses' && !p.renewal.convinced) && !(x.b4e & 8) ? 'styleAccept' : 'styleWants');
}

/** i sæsonen (august–maj) – *estimeret* (0x880003: dags dato mellem landets sæsonstart og -slut) */
const inSeason = (g: GameState) => { const m = Number(g.date.slice(5, 7)); return m >= 8 || m <= 5; };

/** 0x7c1950: summen af de fem seneste karakterer (nibbles) – *estimeret* */
function formSum(p: Player): number {
  const v = p.cmForm ?? 0;
  return [0, 4, 8, 12, 16].reduce((a, b) => a + ((v >>> b) & 0xf), 0);
}

// ---------------------------------------------------------------- 0x880dda–0x88128e

/** 0x880dda–0x88128e: agentens råd, afvisning af klubben, spilletiden og lønnen, hjemlængsel */
export function careerLines(x: FutX, out: FutureLine[]): void {
  const { g, p, club, loy, prof, temp, amb, age } = x;
  const push = (k: string, pr?: Record<string, string | number>): void => { out.push(pr ? { k, p: pr } : { k }); };
  const b49 = !!(p.renewal?.stance === 'refuses' && !p.renewal.convinced);
  // 0x880dda: agenten (kontrakten udløber inden for 210 dage)
  if (club && !b49 && x.daysLeft < 0xd2 && loy < 6 && prof < 10 && age < 0x20 && x.rc > x.crep && x.rc > 0x109a) push('agentMove');
  // 0x880ec2: en lille klub for en ung, ambitiøs spiller
  if (club && x.crep < 0x128e && age < 0x1a && p.pa + amb * 2 > 0x78 && loy < 6 && prof < 10 && amb > 10 && age < 0x1c)
    push(x.st === 7 ? 'misjudging' : 'steppingStone');
  // 0x880fac: udeblevet (AWOL 0x418f60) – så springes spilletiden over
  const awol = p.injury?.key === 'awol';
  if (awol) push('awol');
  // 0x88102c: spilletiden (b3e = kampe i træk uden spilletid)
  if (!awol) {
    if (s8(x.c.b3e) > Math.trunc(loy / 5) + 1 && ok1(x, 1, 2) && age > 0x14 && age < 0x22 && !injured(p)) {
      if (prof > 10 && sh(p, 'workRate') > 10) {
        if (loy > 10 && age > 0x1c && x.rc > 0x1482 && x.crep > 0x1a5e) push('moreInvolved');
        else push(x.leave ? 'eagerRegular' : 'fightPlace');
      } else if (prof < 6 && temp < 10) push('losingPlace');
    }
  }
  // 0x881185: lønnen (+0x45 & 0x1000000) – klubbens højeste løn er *estimeret* (0x5a0590 er ikke porteret)
  if (club && has(x, 0x1000000)) {
    const top = Math.max(0, ...Object.values(g.players).filter((q) => q.club === club.id && q !== p && q.contract).map((q) => q.contract!.wage));
    if (top && (p.contract?.wage ?? 0) <= top * 0.9) push('paidMore');
    else if (loy < 10 && prof < 5 && x.wr > 0x128e) push('payParity');
    else if (amb > 15 && loy < 6) push('payDemand');
    else push('payMatch');
  }
  // 0x88128e: hjemlængsel (+0x20000)
  if (has(x, 0x20000)) {
    if (age > 0x20) push('endCareer', { nation: g.nations[p.nation]?.name ?? '' });
    else push('homesick');
  }
}

/** 0x87ef2a: spilleren overvejer et nyt kontrakttilbud fra klubben (en udsat forlængelse, action renewLater) */
export function offerLine(x: FutX, out: FutureLine[]): void {
  const pr = x.g.pendingRenewals?.find((r) => r.pid === x.p.id && r.club === x.p.club);
  if (pr && x.club) out.push({ k: 'considerOffer', p: { club: x.club.short || x.club.name } });
}

export { favoursClub };

/** 0x8836a4: "Hopes the club's next manager will appreciate his talent more" (klagen 0x10, medieværdien under 4250) */
export function nextManagerLine(x: FutX, out: FutureLine[]): void {
  if (!(x.fl & 0x10) || x.media === undefined) return;
  if (x.loy < 6 && x.prof < 6 && x.p.ca > 0x50 && x.rc > 0x109a && x.media < 0x109a) out.push({ k: 'nextManager' });
}
