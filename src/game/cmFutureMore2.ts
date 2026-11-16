// Future-linjerne på spillerprofilens Transfer-fane, 0x88150a–0x8836a4 (holdkammerater, manager, status, position, medier) – se cmFutureMore.ts.
import type { Club, GameState, Player } from './types';
import type { FutureLine } from './cmTransferList';
import { ATTRS } from './attributes';
import { ageOn } from './dates';
import { cmContractOf } from './cmPlayerData';
import { isHumanClub } from './humans';
import { favoursClub, favoursPerson, managerStaff, personKey } from './cmRelations';
import { gameLeagueRow } from './engine/grid/gameTable';
import { posGroup, posKey, type FutX } from './cmFutureMore';

const s8 = (v: number) => (v << 24) >> 24;
const sh = (p: Player, k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10);
const pname = (p: { first: string; last: string }) => `${p.first} ${p.last}`.trim();
const b4eOf = (p: Player) => cmContractOf(p).b4e ?? (p.listed ? 1 : 0);
const has = (x: FutX, bit: number) => (x.fl & bit) !== 0;

/** klubbens manager findes (menneskets manager har ingen staffpost, men klubben har en manager) */
const hasManager = (x: FutX) => !!x.club && (isHumanClub(x.club.id) || !!managerStaff(x.g, x.club.id));

/** 0x5480f0: de tre uvenner (+0x28..+0x30), som er spillere i samme klub */
function dislikedMates(x: FutX): Player[] {
  const keys = (x.p.cmRel ?? []).slice(9, 12).filter(Boolean);
  const out: Player[] = [];
  for (const k of keys) {
    const q = x.g.players[k];
    if (q && q.club === x.club?.id && q !== x.p) out.push(q);
  }
  return out;
}

/** 0x88150a–0x881d2f: uvennerne på holdet (+0x45 & 0x800), assistenten (0x1000), dommerne (+0x40 & 0x20) og stolt af klubben */
export function mateLines(x: FutX, out: FutureLine[]): void {
  const { g, p, club, loy, prof, temp, amb, ev } = x;
  const push = (k: string, pr?: Record<string, string | number>): void => { out.push(pr ? { k, p: pr } : { k }); };
  const mates = () => {
    const list = dislikedMates(x);
    for (const d of list) {
      const name = pname(d);
      const dca = Math.round(d.ca), dprof = sh(d, 'professionalism'), damb = sh(d, 'ambition');
      if (prof > 15 && dprof < 6) push('disruptive', { name });
      else if (d.pos[0] !== 20 && sh(d, 'teamwork') < 6) push(dca > 100 - amb && damb > 15 && dprof < 6 ? 'selfishArrogant' : 'selfishPlayer', { name });
      else push(dca > 100 - amb && damb > 15 && dprof < 6 ? 'arrogant' : 'dislikes', { name });
      if (b4eOf(d) & 1) push(temp < 6 && prof < 10 ? 'gladBack' : p.id % 3 === 0 ? 'restoreHarmony' : 'managerAction', { name });
    }
    return list.length;
  };
  // 0x88150a: holdkammeratens bemærkninger (+0x800) – efter (id % 7) + 4 dage i klubben
  if (has(x, 0x800) && x.daysJoined > (p.id % 7) + 4) { if (!mates()) push('unsettledMates'); }
  // 0x881849: assistenten (+0x1000)
  if (has(x, 0x1000) && hasManager(x)) push('dislikesAssistant');
  // 0x8818d5: uvennerne, når begivenheden +0x40 & 1 er sat (og ikke 0x800)
  if (ev & 1 && !has(x, 0x800) && x.daysJoined > (p.id % 7) + 4) {
    for (const d of dislikedMates(x)) {
      const name = pname(d);
      if (prof > 15 && sh(d, 'professionalism') < 6 && ageOn(d.dob, g.date) < 0x18) push('immature', { name });
      else if (ageOn(d.dob, g.date) < 0x18) push('learnMistakes', { name });
      else push('irritated', { name });
      if (b4eOf(d) & 1) push(temp < 6 && prof < 10 ? 'gladBack' : p.id % 3 === 0 ? 'restoreHarmony' : 'managerAction', { name });
    }
  }
  // 0x881ba6: dommerne i et fremmed land (+0x40 & 0x20)
  if (club && ev & 0x20 && club.nation !== p.nation && g.nations[club.nation]) push('referees', { nation: g.nations[club.nation].name });
  // 0x881c5f: stolt af klubben (ingen klager og begivenheder, Loyalty over 15 og klubben er hans yndlingsklub)
  if (!x.fl && !ev && club && loy > 15 && favoursClub(p, club.id)) push(s8(x.c.b3f) !== 0 ? 'proudPlaying' : 'proudAt', { club: club.short || club.name });
  // 0x881d2f: managerens ros (kræver klubbens medieværdi over 6250 – ukendt hos os)
  const m = club ? managerStaff(g, club.id) : null;
  if (!x.fl && !ev && club && x.media !== undefined && loy > 15 && prof > 15 && hasManager(x) && x.media > 0x186a && x.mood > 0 && s8(x.c.b3d) > 0) {
    const name = m ? pname(m) : g.manager.name;
    const row = gameLeagueRow(g, club.league, club.id);
    const mrep = m?.cmRep?.[1] ?? 0;
    if (x.age < 0x14 && (row?.played ?? 0) > 8 && row!.runs[0] > 0 && mrep > 0x1c52) push('tacticalGenius', { name });
    else if (favoursPerson(p, m ? personKey(m) : 0)) push(s8(x.c.b3f) !== 0 && amb > 15 ? 'proudPlayingFor' : 'hopesRemain', { name });
    else push('extremelyCompetent', { name });
  }
}

const clubRepOf = (g: GameState, id: number) => g.cmClubRep?.[id] ?? (g.clubs[id]?.rep ?? 50) * 100;

/** 0x881f02–0x882926: managerens uven (+0x45 & 0x2000 – medieværdien [0xb67a44] og managerens taktiske egenskaber kendes ikke: kun den
 *  almindelige linje), statussen og værdien for holdet, en amatør, der vil være professionel, afskeden (+0x45 & 2 sammen med andre klager) og
 *  et skifte til en større klub (+0x45 & 1). Managerens ros (0x881d2f) og rygterne/bestyrelsen (0x882194/0x882282) kræver klubbens
 *  medieværdi over 6250/under 4000/4250 – den findes ikke hos os, så de tages ikke. */
export function statusLines(x: FutX, out: FutureLine[], deserved: number): void {
  const { g, p, club, loy, prof, temp, amb, pres, age } = x;
  const push = (k: string, pr?: Record<string, string | number>): void => { out.push(pr ? { k, p: pr } : { k }); };
  if (has(x, 0x2000) && club) push('dislikesManager');
  // 0x882011: en trupstatus under det, han mener at fortjene (ikke klagen 1, ikke listet)
  const s = x.st;
  if (!has(x, 1) && !(x.b4e & 1)) {
    const skip = !(s > deserved) || s === 0 || s === 8 || (s === 3 && (amb <= 12 || prof >= 15 || temp >= 15)) || deserved === 6 || deserved === 5;
    if (!skip) {
      let done = false;
      if (deserved === 1 && x.rc > 0xcb2 && prof < 10 && temp < 6) { push('indispensable'); done = true; }
      else if (s === 3 && s8(x.c.b3e) > 1) { push('rotation'); done = true; }
      if (!done) {
        const wage = Math.round((p.contract?.wage ?? 0) * 0.86);
        if (prof > 14 && x.rc > 0x128e && s !== 3 && s !== 2 && wage < 10000) push('reassess');
        else if (prof < 6 && x.rc > 0xea6 && wage < 10000) push('acknowledge');
        else if (pres < 10 && x.rc > 0x109a && s !== 3 && s !== 2 && wage < 10000) push('moreImportantThanMgr');
      }
    }
  }
  // 0x882194: rygter om, at manageren forlader klubben (medieværdien under 4000) og 0x882282: bestyrelsen
  const m = club ? managerStaff(g, club.id) : null;
  if (club && m && x.media !== undefined) {
    const name = pname(m);
    if (favoursPerson(p, personKey(m)) && !x.fl && loy > 10 && x.media < 0xfa0) push('managerLeaveRumours', { name });
    if (!x.ev && !x.fl && x.media < 0x109a && loy > 15) {
      if (x.mood < 0) push('turnAround', { name });
      else push(x.rc > x.crep + 0x4e2 && amb > 10 && prof < 10 ? 'boardFoolish' : 'boardWrong', { name });
    }
  }
  // 0x88257c: en amatør (deltidskontrakt), der vil være professionel, og afskeden (klage 2 sammen med andre klager)
  if (x.fl & 2 && x.fl !== 2 && !x.future) {
    if (p.contract?.partTime && !has(x, 1) && amb > 15 && loy < 15 && p.pa > 0x50 - amb && age < 0x19)
      push(loy < 10 ? (amb > 14 && prof < 10 ? 'shouldBePro' : 'wantsPro') : 'opportunityPro');
    else if (club && x.rc > 0x109a && loy > 10 && x.rc > x.crep - 0x113) {
      if (prof > 5 && x.daysJoined > 0x190) push('loyaltyRewarded');
      else if (hasManager(x) && temp < 5 && x.media !== undefined && x.media < 0xfa0) push('appreciatesManager');
      else push(temp < 5 && x.rc > 0x1194 ? 'agentLook' : 'thinkingMoving');
    } else push(temp < 6 && prof < 10 && temp < 5 && x.rc > 0x1194 ? 'agentLook' : 'thinkingMoving');
  }
  // 0x882806: et skifte til en større klub (+0x45 & 1)
  if (has(x, 1)) {
    const dest = p.contract?.futureClub ? g.clubs[p.contract.futureClub] : undefined;
    if (x.rc > 0x1194 && prof < 10 && temp < 5) push(x.future ? 'relievedBigger' : 'asapBigger');
    else if (x.future) push(dest && x.crep + 0x2ee < clubRepOf(g, dest.id) ? 'bigMove' : 'movingClubs');
    else push(age < 0x1c && prof > 15 ? 'furtherCareer' : 'biggerClub');
  }
}

/** 0x882afb–0x883004: positionen (+0x45 & 0x2000000 og +0x40), tilliden (+0x45 & 0x8000000), delen (+0x45 & 0x4000000) */
export function positionLines(x: FutX, out: FutureLine[]): void {
  const { p, prof, temp, pres, ev } = x;
  const push = (k: string, pr?: Record<string, string | number>): void => { out.push(pr ? { k, p: pr } : { k }); };
  const group = posKey(posGroup(p));
  if (has(x, 0x2000000) && !(x.b4e & 9)) {
    if (x.daysJoined < 0x3c) push(temp < 6 ? 'wouldntHaveJoined' : 'wantsPlayAs', { pos: group });
    else push(temp < 6 && prof < 6 ? 'moveToPlay' : 'wantsPlayAs', { pos: group });
    if (prof < 6 && pres > 10 && x.age > 0x14 && x.rc > 0x1676 && !has(x, 0x2000)) push('tacticallyInept');
  }
  if (!(x.b4e & 9) && ev & 0x40 && !has(x, 0x2000000)) push(prof > 5 ? 'bestPosition' : 'wouldLikePlay', { pos: group });
  if (has(x, 0x8000000)) push('cantTrust');
  if (ev & 0x100) push(temp < 6 ? 'angryPositions' : prof > 10 ? 'thinksPositions' : 'upsetPositions');
  if (ev & 0x80) push('managerNoListen');
  if (has(x, 0x4000000)) {
    const s = x.st;
    push(x.amb > 15 && x.age > 0x17 && s8(x.c.b3d) < 0 && s !== 0 && s !== 8 && s !== 7 && s !== 1 && s !== 2 ? 'fringe' : 'substituted');
  }
}

/** 0x883107–0x8831ad: lederen (+0x45 & 0x400) og hindringen for et skifte (+0x45 & 0x800000) */
export function patientLines(x: FutX, out: FutureLine[]): void {
  const { temp, prof, pres } = x;
  const push = (k: string): void => { out.push({ k }); };
  if (has(x, 0x400)) push(temp > 10 && pres > 10 ? 'patient' : pres < 5 && prof < 10 ? 'treatmentMorale' : 'treatmentMate');
  if (has(x, 0x800000) && !x.future) push(x.b4e & 9 ? 'cantTrustObstruct' : 'obstructing');
}

const dislikesFan = (c: Club, p: Player) => (c.cmPrefs ?? []).slice(3, 6).includes(personKey(p));
const favoursFan = (c: Club, p: Player) => (c.cmPrefs ?? []).slice(0, 3).includes(personKey(p));

/** 0x88336e–0x883612: medierne (+0x45 & 0x40000; mediehistorien 0x7357c0 kendes ikke → type 0), udfordringen (0x100) og managerens uven (8) */
export function mediaLines(x: FutX, out: FutureLine[]): void {
  const { p, club, loy, pres } = x;
  const push = (k: string): void => { out.push({ k }); };
  if (has(x, 0x40000) && club) {
    const dis = dislikesFan(club, p), fav = favoursFan(club, p);
    if (x.daysJoined < 0x5a) {
      if (dis) push(loy > 15 ? 'winOver' : loy < 5 ? 'fedUpSniping' : 'hopesSupporters');
      else if (fav) push(loy > 15 ? 'caresOnly' : loy < 5 ? 'dislikesCriticism' : 'proveMediaWrong');
      else push(x.crep > 0x1388 ? 'mediaCritical' : 'localMediaCritical');
    } else if (dis) push(loy > 15 ? 'proveSupportersWrong' : loy < 5 ? 'hadEnough' : x.fl === 0x40000 ? 'anotherChance' : 'moreAppreciative');
    else if (fav) {
      if (loy > 15 && pres > 5) push('caresOnly');
      else push(pres < 6 ? 'leaveAlone' : loy < 5 ? 'unhappyCriticism' : 'aimsProveWrong');
    } else push(x.crep > 0x1388 ? 'mediaCritical' : 'localMediaCritical');
  }
  if (has(x, 0x100)) push(x.future ? 'lookingForwardChallenge' : 'wantsChallenge');
  if (has(x, 8) && hasManager(x)) push('unhappyManager');
}
