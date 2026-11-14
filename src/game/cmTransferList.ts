// Transferlisten, trupstatus og spillerens utilfredshed som i CM 01/02 (cm0102.exe 3.9.68, disassembleret med ~/cm0102-engine/tools/cmdis.py
// 13/11-2026; noten ~/cm0102-engine/notes/transfer-list.md). Kun den originale database i ægte tilstand (cmActive) – det udvidede spil og
// 2026/27 bruger transfers.ts/will.ts som før.
//
//   0x8f7640 transfer_screens_handle_transfer_status_screen (OK, 0x8f7f08–0x8f80dd): 0x8ce0e0, så transfer-/lejeliste og "listed by request"
//   0x8ce0e0 TRANSFER_MANAGER::set_player_squad_status: udbudsprisen → værdien +0x52, tilfredsheden +0x44, klagen 0x200/0x4000 efter 7 dage
//   0x8f8450 transfer_screens_handle_transfer_list_dialog, 0x842320 Shortlist_Manager::transfer_list_player (+0x4e |= 1, status 7)
//   0x4ca470 contract_manager_get_deserved_squad_status
//   0x87dd80 staff_screens_draw_transfer_tab: Availability, Value (+0x52) og Future (de porterede blokke er nævnt ved hver linje)
//   0x4d8610 handle_transfer_request (menneskets gren: nyheden 0xbbf), 0x4d8990 nyhedens tekst, 0x4dcd70 svaret (Transfer Request-skærmen)
//   0x842180 Shortlist_Manager::collect_interested_clubs – computerklubbernes ønskelister er ikke porteret (cmInterested er *estimeret*)
//
// Kontrakten: +0x44 b44 (tilfredshed ±100), +0x45 b45 (klagerne), +0x4e b4e (1 transferlistet, 2 lejelistet, 8 listet efter eget ønske),
// +0x4f b4f (trupstatus i høj nibble: 1 Key … 7 Not Needed). Tilfældige tal: cmRand (egen talrække – spillets rng røres ikke).

import type { GameState, NewsItem, Player } from './types';
import { ATTRS } from './attributes';
import { ageOn } from './dates';
import { addNews } from './state';
import { asOwner, isHumanClub } from './humans';
import { cmAdjustMorale, cmContractOf, cmFlagSet, cmRand, clubRepMem, curRep, statusCode, wantsToLeave, withFlagCtx, type CmContract } from './cmPlayerData';
import { valueTarget } from './training';
import { hash01 } from './rng';
import { favoursClub, favoursPerson, managerStaff, personKey } from './cmRelations';
import { DEMONYM } from '../ui/demonyms';

const s8 = (v: number) => (v << 24) >> 24;
const cl100 = (v: number) => (v > 100 ? 100 : v < -100 ? -100 : v);
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const sh = (p: Player, k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10);
const pname = (p: Player) => `${p.first} ${p.last}`.trim();
export const STATUS_NAMES = ['', 'key', 'first', 'rotation', 'backup', 'prospect', 'young', 'surplus'] as const;
const STATUS_OF: Record<string, number> = { key: 1, first: 2, rotation: 3, backup: 4, prospect: 5, young: 6, surplus: 7 };
export const statusNum = (s: Player['squadStatus'] | undefined) => (s ? STATUS_OF[s] ?? 0 : 0);

/** spillerdata +0xd verdensomdømme (0..10000) */
const worldRep = (p: Player) => Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[2] * 50);
/** klubbens omdømme +0x80 (0..10000) */
const clubRep = (g: GameState, club: number) => clubRepMem(g, club);
const daysSince = (g: GameState, iso: string | undefined) => (iso ? dayNum(g.date) - dayNum(iso) : 10000);
const leaveIn = (p: Player) => ({ id: p.id, loy: sh(p, 'loyalty'), pres: sh(p, 'pressure'), prof: sh(p, 'professionalism'), temp: sh(p, 'temperament'),
  amb: sh(p, 'ambition'), repCur: curRep(p), b40: 0 });

/** kontraktens bits ↔ spillets felter (menneskets klub: p.listed/p.loanListed/p.wantsAway følger +0x4e) */
function syncFlags(p: Player, c: CmContract): void {
  const b = c.b4e ?? 0;
  p.listed = !!(b & 9);
  p.loanListed = b & 2 ? true : undefined;
  p.wantsAway = b & 8 ? true : undefined;
  if (!p.listed) p.listPrice = undefined;
}
function setStatus(p: Player, c: CmContract, st: number): void {
  c.b4f = ((c.b4f ?? 0) & 0xf) | ((st & 0xf) << 4);
  p.squadStatus = (STATUS_NAMES[st] || undefined) as Player['squadStatus'];
}

// ---------------------------------------------------------------- 0x4ca470

/** 0x4ca470 contract_manager_get_deserved_squad_status(staff, kontrakt): den status, spilleren mener, han fortjener. Kontrakttype 5 → 8 (ikke hos os). */
export function deservedStatus(p: Player, c: CmContract, age: number): number {
  const st = ((c.b4f ?? statusCode(p) << 4) >> 4) & 0xf;
  const cl = s8(c.b3d);
  const amb = sh(p, 'ambition'), loy = sh(p, 'loyalty');
  const r3 = () => (cl <= 0 ? 4 : 3);                                          // 0x4ca535
  const neg = (lim: number) => (cl <= lim ? 7 : 4);                            // 0x4ca5d0 / 0x4ca62a
  switch (st) {
    case 0:                                                                    // 0x4ca652
      if (age > 0x15) { if (cl > 0x4b) return 1; if (cl >= 0x28) return 2; if (cl >= 0xa) return 3; return neg(-30); }
      if (cl > 0) return 5;
      return cl > -30 || amb > 5 ? 6 : 7;
    case 1: return cl > 0x2d ? 1 : cl <= 0x19 ? 3 : 2;                         // 0x4ca4c7
    case 2:                                                                    // 0x4ca4e6
      if (cl > 0x4b && 25 * amb - 10 * loy + worldRep(p) > 0x186a && age > 0x17 && age < 0x22) return 1;
      return cl > 0x19 ? 2 : r3();
    case 3: return cl > 0x37 && age > 0x17 && age < 0x22 ? 2 : r3();          // 0x4ca543
    case 4:                                                                    // 0x4ca560
      if (cl > 0x41 && age > 0x17) return age < 0x22 ? 3 : 2;
      if (cl > -30) return 4;
      return age >= 0x18 ? 7 : 5;
    case 5:                                                                    // 0x4ca59f
      if (age > 0x18) { if (age > 0x22) return 4; if (cl > 0x4b) return 2; if (cl > 0) return 3; return neg(-30); }
      return amb > 5 && curRep(p) > 0x4e2 ? 5 : 6;
    case 6:                                                                    // 0x4ca5fb
      if (age > 0x17) { if (cl > 0x4b) return 1; if (cl > 0x1e) return 2; if (cl > 0) return 3; return neg(-50); }
      return curRep(p) > 0x4e2 && amb > 0xf ? 5 : 6;
    default: return 7;
  }
}

// ---------------------------------------------------------------- 0x8ce0e0

/** 0x8ce0e0's tilfredshed (+0x44): uden status før (nibble 0) springtabellen 0x8ce8f0 – `flags` = transfer_flags (fra skærmen: den gamle +0x4e;
 *  & 3 = han var transfer-/lejelistet): 1 +100 / −100, 2 +50 / −100, 3 +25 / −100, 4 0 / −100, 5 0 / −50 (kun & 1), 6 −20, 7 −100 (med flag: *ud = 1).
 *  Med status før: kun nedrykning (gammel < ny): (gammel − ny)·25, 3 → 4 −50, højst −125. */
export function statusHappiness(b44: number, old: number, next: number, flags: number): number {
  if (old === 0) {
    const f3 = (flags & 3) !== 0;
    switch (next) {
      case 1: return cl100(b44 + (f3 ? -100 : 100));
      case 2: return cl100(b44 + (f3 ? -100 : 50));
      case 3: return cl100(b44 + (f3 ? -100 : 25));
      case 4: return f3 ? cl100(b44 - 100) : b44;
      case 5: return flags & 1 ? cl100(b44 - 50) : b44;
      case 6: return cl100(b44 - 20);
      case 7: return cl100(b44 - 100);
      default: return b44;
    }
  }
  if (old >= next) return b44;
  let d = (old - next) * 25;
  if (old === 3 && next === 4) d = -50;
  if (d < -125) d = -125;
  return cl100(b44 + s8(d));
}

/** TRANSFER_MANAGER::set_player_squad_status 0x8ce0e0(spiller, klub, udbudspris, &ud, status, transfer_flags, clear) for menneskets klub */
export function setSquadStatus(g: GameState, p: Player, asking: number | null, next: number, flags: number, rand: (n: number) => number): void {
  const c = cmContractOf(p);
  const human = isHumanClub(p.club);
  // 0x8ce19e: kontrakttype 2 og spillerdata: udbudsprisen bliver værdien +0x52 – for et menneske kun, hvis den ikke er over formlen 0x4d0c60
  if (asking !== null && asking > 0 && !p.contract?.partTime && (!human || asking <= valueTarget(p))) {
    p.value = asking;
    if (human) p.cmAsk = { v: asking, club: p.club }; else p.cmAsk = undefined;
  } else if (asking !== null && human) p.cmAsk = undefined;
  if (next === 0xff) return;                                                   // 0x8ce229: −1 = statusen røres ikke
  const old = ((c.b4f ?? statusCode(p) << 4) >> 4) & 0xf;
  // 0x8ce1f8: ny status 7 (og ikke allerede 7): +0x3d −= 100
  if (next === 7 && old !== 7) c.b3d = cl100(s8(c.b3d) - 100);
  c.b44 = statusHappiness(s8(c.b44), old, next, flags);
  // 0x8ce52a: klagerne – først når spillet er mindst 7 dage gammelt ([0xdd6ec8])
  const start = g.cmStart ?? g.cmFitStart ?? g.cmBoardStart;
  if (!start || daysSince(g, start) >= 7) withFlagCtx(g, p, rand, () => grievance(g, p, c, old, next, rand));
  setStatus(p, c, next);                                                       // 0x8ce896
}

/** 0x8ce541–0x8ce891: rykket op til Key (med klagen 0x4000) eller ned fra en status – klagen 0x200 ("treated unfairly") eller 0x4000 */
function grievance(g: GameState, p: Player, c: CmContract, old: number, next: number, rand: (n: number) => number): void {
  const prof = sh(p, 'professionalism'), loy = sh(p, 'loyalty'), amb = sh(p, 'ambition');
  const unfair = () => cmFlagSet(c, 0x200);                                    // 0x8ce888: 0x867700(0x200)
  const profOrLoy = () => { if (rand(prof) === 0 || rand(loy) === 0) unfair(); }; // 0x8ce56e
  if (next === 1) {                                                            // 0x8ce551
    if (c.b45 & 0x4000) { c.b45 &= ~0x4000; profOrLoy(); }
    return;
  }
  if (old === 0 || old >= next) return;                                        // 0x8ce59d: kun nedrykning
  // 0x8ce5b3: aldersgrænsen bl (32 ± Loyalty/Professionalism, positionerne GK/angriber +0xf/+0x15 > 15, skaden 0x62ed70 +0x2c)
  let bl = 0x20;
  if (loy > rand(3) + 0xf) bl = 0x1f; else if (loy < rand(3) + 5) bl = 0x21;
  if (prof > rand(3) + 0xf) bl--; else if (prof < rand(3) + 5) bl++;
  if ((p.pos[0] ?? 0) > 15) bl++;
  if ((p.pos[6] ?? 0) > 15) bl--;
  const inj = p.injury?.days ?? 0;
  if (inj > 0xb4) bl -= 8;
  else if (inj > 0x5a && prof > 5) bl -= 5;
  if (inj > 0x1e) bl -= 2;
  const age = ageOn(p.dob, g.date);
  if (old === 1 && age < bl) {                                                 // 0x8ce667: var nøglespiller og er ikke for gammel
    if (next !== 2) {
      if (rand(prof) === 0 || rand(loy) === 0 || rand(5) === 0) {
        // 0x8ce6b7: 0x5882d0 (avisens historie om den utilfredse spiller – ikke porteret), 0x4000, +0x44 −5
        cmFlagSet(c, 0x4000);
        c.b44 = cl100(s8(c.b44) - 5);
        return;
      }
    }
    if (rand(5) === 0 && rand(amb) !== 0) unfair();                            // 0x8ce705
    return;
  }
  if (next === 3 && old === 2 && clubRep(g, p.club) >= 0x1676) return;        // 0x8ce731
  // 0x8ce755: dage siden kontrakten (+0x25) – hos os ankomstdatoen (*estimeret*)
  if (daysSince(g, p.joined ?? p.cmJoined) < (amb + 6) * 5) { unfair(); return; }
  switch (deservedStatus(p, c, age)) {                                         // 0x8ce779, springtabellen 0x8ce90c
    case 1:
      if (rand(prof) === 0 || rand(loy) === 0 || rand(3) === 0) { cmFlagSet(c, 0x200); c.b44 = cl100(s8(c.b44) - 10); }
      return;
    case 2: if (rand(10) !== 0) profOrLoy(); return;
    case 3: case 4:
      if (age < bl && rand(5) !== 0 && amb > 10) profOrLoy();
      return;
    case 5:
      if (amb > 15 && rand(3) !== 0) profOrLoy();
      return;
  }
}

// ---------------------------------------------------------------- Set Staff Transfer Status (OK) og transferlisten

export interface TransferStatusIn { status: number; price: number | null; listed: boolean; loan: boolean; request: boolean }

/** 0x8f7f08–0x8f80dd: Set Staff Transfer Status → OK for menneskets spiller */
export function cmSetTransferStatus(g: GameState, p: Player, o: TransferStatusIn): void {
  const c = cmContractOf(p);
  const rand = cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x8f7640);
  const flags = (c.b4e ?? (p.listed ? 1 : 0) | (p.loanListed ? 2 : 0)) & 0xff;
  c.b4e = flags;
  setSquadStatus(g, p, o.price, o.status || 0xff, flags, rand);
  if (o.listed) listPlayer(g, p, true, rand);                                  // 0x8f801d: 0x842320(staff, 1)
  else if (c.b4e & 1) c.b4e &= ~1;                                             // 0x8f8056: 0x844280
  if (o.loan) c.b4e |= 2; else c.b4e &= ~2;                                    // 0x8f806c / 0x8f808f
  c.b4e = o.request ? (c.b4e & ~2) | 8 : c.b4e & ~8;                           // 0x8f8094–0x8f80ad
  syncFlags(p, c);
  if (o.listed && o.price) p.listPrice = p.value;
}

/** 0x842320 Shortlist_Manager::transfer_list_player(staff, post_news): +0x4e |= 1, status 7 (Not Needed). (0x547af0 – spilleren kan komme til
 *  ikke at bryde sig om manageren – kræver menneskets staffpost, som vi ikke har; 0x4d71b0's nyhed til køberne: spillets egen.) */
export function listPlayer(g: GameState, p: Player, news: boolean, _rand: (n: number) => number): void {
  const c = cmContractOf(p);
  if ((c.b4e ?? 0) & 1) return;
  c.b4e = ((c.b4e ?? 0) | 1) & 0xff;
  setStatus(p, c, 7);
  syncFlags(p, c);
  if (news && isHumanClub(p.club)) asOwner(p.club, () => addNews({ cat: 'transfer', key: 'transfer.listedByYou', params: { player: pname(p), manager: g.manager.name, fee: p.value }, link: { kind: 'player', id: p.id } }));
}

/** 0x8f8450 (Yes i "Transfer list …?"): listet → af listen, og vil han væk (0x866f60) uden klagen 0x10000 og med Loyalty < 15: +0x44 −50 og 0x10000;
 *  ellers 0x842320 med nyheden. Lejelisten (0x8442b0/0x8442d0) skifter bare. */
export function cmToggleListed(g: GameState, p: Player, loan = false): void {
  const c = cmContractOf(p);
  const rand = cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x8f8450);
  c.b4e = (c.b4e ?? (p.listed ? 1 : 0) | (p.loanListed ? 2 : 0)) & 0xff;
  if (loan) { c.b4e ^= 2; syncFlags(p, c); return; }
  if (c.b4e & 1) {
    c.b4e &= ~1;
    if (!(c.b45 & 0x10000) && wantsToLeave(leaveIn(p), c) && sh(p, 'loyalty') < 15) {
      c.b44 = cl100(s8(c.b44) - 50);
      withFlagCtx(g, p, rand, () => cmFlagSet(c, 0x10000));
    }
    syncFlags(p, c);
    return;
  }
  listPlayer(g, p, true, rand);
}

// ---------------------------------------------------------------- transferanmodningen 0x4d8610 / 0x4d8990 / 0x4dcd70

/** 0x4d8610's menneskegren (0x4d87ff): ingen aftalt skifte/åbne forhandlinger (0x8c1870/0x8c5cf0/0x8c5e40) → nyheden 0xbbf med pladserne
 *  6 = +0x45, 9 = agent (rand(Loyalty) = 0 eller rand(Professionalism) = 0, og verdensomdømmet +0xd > 4750), 10 = hjemlandet, 11 = over 32 år,
 *  12 = +0x40 (0 hos os). *estimeret*: kun én ubesvaret anmodning ad gangen (originalen sender en ny ved hver ny klage). */
export function cmRequestNews(g: GameState, p: Player, c: CmContract, rand: (n: number) => number): void {
  if (p.contract?.futureClub || g.offers.some((o) => o.player === p.id && (o.status === 'pending' || o.status === 'negotiating'))) return;
  if (p.cmReq !== undefined && g.news.some((n) => n.id === p.cmReq && !n.params?.ans)) return;
  const agent = (rand(sh(p, 'loyalty')) === 0 || rand(sh(p, 'professionalism')) === 0) && worldRep(p) > 0x128e ? 1 : 0;
  const club = g.clubs[p.club];
  asOwner(p.club, () => {
    addNews({ cat: 'contract', key: 'cm.req', params: {
      player: p.last || pname(p), full: pname(p), club: club?.name ?? '', flags: c.b45 >>> 0, sid: p.id, agent,
      nat: g.nations[p.nation]?.name ?? '', cnat: g.nations[club?.nation ?? -1]?.name ?? '', crep: clubRep(g, p.club),
      old: ageOn(p.dob, g.date) > 0x20 ? 1 : 0, ans: 0,
    }, link: { kind: 'player', id: p.id } });
    p.cmReq = g.news[0]?.id;
  });
}

/** 0x4d8990's grunde (højst 5, i rækkefølge): nøgle + om den tager landet */
export function requestReasons(flags: number, agent: boolean, clubRep: number, natKnown: boolean, old: boolean, b40 = 0): string[] {
  const out: string[] = [];
  const add = (k: string) => { if (out.length < 5) out.push(k); };
  if (flags & 1) add('bigger');
  if (flags & 2) add(agent ? 'agentContract' : flags & 0x1000000 ? 'payDemands' : 'contract');
  if (flags & 4) add('leftOut');
  if (flags & 0x100) add('challenge');
  if (flags & 8) add('manager');
  if (flags & 0x10) add('regular');
  if (clubRep < 0x1a5e && flags & 0x20000000) add('ambitious');
  if (flags & 0x20 && natKnown) add('adapt');
  if (flags & 0x40) add('personal');
  if (flags & 0x80) add('talk');
  if (flags & 0x200) add('unfair');
  if (flags & 0x4000) add('role');
  if (flags & 0x400) add('respect');
  if (flags & 0x800) add('teammate');
  if (flags & 0x2000) add('style');
  if (flags & 0x800) add('assistant');
  if (flags & 0x20000) add(old && natKnown ? 'endCareer' : 'homesick');
  if (flags & 0x400000) add('finance');
  if (flags & 0x2000000) add('position');
  if (flags & 0x4000000) add('bitPart');
  if (flags & 0x200000) add('loyalty');
  if (flags & 0x40000 && !(flags & 1)) add('media');
  if (b40 & 0x80) add('listens');
  return out;
}

/** 0x4d8fd9–0x4d92d7: hvilken brødtekst (nøglen under cm.req.b.*) og grundenes sammensætning ('one' | 'two' | 'three' | 'some' | 'nightmare') */
export function requestBodyKind(n: number, sid: number, flags: number, agent: boolean): { body: string; join: string; pick?: [number, number] } {
  // 0x4d910b: idiv med fortegn (staff-id'er er positive); 0x4d906a: buffer (id & 1) og (id & 1) + 2
  const join = n === 1 ? 'one' : n === 2 ? 'two' : n === 3 ? 'three' : n === 4 ? 'some' : n === 5 ? 'nightmare' : 'none';
  const pick: [number, number] | undefined = n === 4 ? [((sid % 2) + 2) % 2, ((sid % 2) + 2) % 2 + 2] : undefined;
  if (!n) return { body: 'unhappy', join };
  const k = sid % 3;
  const m = (((flags - sid) % 3) + 3) % 3;
  if (n > k + 2) {
    if (agent && m !== 0) return { body: n < 4 ? 'agentDemand' : 'agentDemandMany', join, pick };
    return { body: 'furious', join, pick };
  }
  if (agent && m === 0) return { body: n < 4 ? 'agentRequest' : 'agentRequestMany', join, pick };
  return { body: 'request', join, pick };
}

/** 0x4dcd70: svaret på Transfer Request ("Put X on the transfer list at his own request ?"). Ja (0x20): pladserne 7/8 = 1/1, af lejelisten,
 *  +0x4e = (+0x4e & ~2) | 8, moral +12, nyheden "… grants … transfer request" (0x4d71b0/0x4d7770). Nej (0x21): 7/8 = 1/0; +0x44 < −50, Loyalty < 6
 *  og Professionalism < 10 → 0x10000, ellers rand(+0x44 + 20·Loyalty + 50) < rand(5·(75 − Temperament − Professionalism)) → 0x10000; så
 *  +0x44 += s8(5·Loyalty + 56) (8 bit) og moral −12. */
export function cmAnswerRequest(g: GameState, newsId: number, grant: boolean): 'ok' | 'error' {
  const n = g.news.find((x) => x.id === newsId && x.key === 'cm.req');
  const p = n?.link ? g.players[Number(n.link.id)] : undefined;
  if (!n || !p || n.params.ans || p.club !== g.userClub) return 'error';
  const c = cmContractOf(p);
  const rand = cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x4dcd70);
  n.params = { ...n.params, ans: grant ? 1 : 2 };
  p.cmReq = undefined;
  if (grant) {
    c.b4e = (((c.b4e ?? 0) & ~2) | 8) & 0xff;
    cmAdjustMorale(p, 0xc, false, rand);
    syncFlags(p, c);
    addNews({ cat: 'transfer', key: 'transfer.requestGranted', params: { player: pname(p), manager: g.manager.name, fee: p.value }, link: { kind: 'player', id: p.id } });
    return 'ok';
  }
  const loy = sh(p, 'loyalty'), prof = sh(p, 'professionalism'), temp = sh(p, 'temperament');
  const b44 = s8(c.b44);
  let flag = false;
  if (b44 < -50 && loy < 6 && prof < 10) flag = true;
  else {
    const r1 = rand(5 * (75 - temp - prof));
    flag = rand(b44 + 20 * loy + 50) < r1;
  }
  if (flag) withFlagCtx(g, p, rand, () => cmFlagSet(c, 0x10000));
  c.b44 = cl100(s8(c.b44) + s8(s8(5 * loy) + 0x38));
  cmAdjustMorale(p, -0xc, false, rand);
  return 'ok';
}
/** en anmodning, der venter på svar (Respond i indbakken) */
export const requestOpen = (g: GameState, n: NewsItem | undefined) => !!n && n.key === 'cm.req' && !n.params?.ans && !!n.link && g.players[Number(n.link.id)]?.club === g.userClub;

// ---------------------------------------------------------------- Transfer-fanen 0x87dd80

export type FutureLine = { k: string; p?: Record<string, string | number> };

/** Availability (0x87df52): "Transfer listed by club" (0x5444a0), "… by request" (0x544600), "Listed for loan" (0x544590), ellers "Unknown" */
export function cmAvailability(p: Player): 'club' | 'request' | 'loan' | 'unknown' {
  const b = p.cmContract?.b4e ?? (p.listed ? 1 : 0) | (p.loanListed ? 2 : 0);
  return b & 1 ? 'club' : b & 8 ? 'request' : b & 2 ? 'loan' : 'unknown';
}

/** Future (0x87ee70–0x8853ba): hele blokken i originalens rækkefølge – også den tilfredse blok og "Unknown", når intet er skrevet (0x8852ef).
 *  `interested` = antallet i Interested-rækken (0x842180's liste [esp+0x4c]). Ikke porteret (*estimeret* – vises ikke) i 0x87ee70–0x880a9b:
 *  det nye kontrakttilbud (0x4cc9e0), landsholdskarrieren (0x776380), tvisten "Sporting Just Cause" (0x569e30), de beundrede holdkammerater
 *  (0x548da0), salget af talenter/stjerner (+0x45 0x40000000/0x80000000), kontraktens begivenheder +0x40 (ny kontrakt, rivalen, erstatningen),
 *  konkurrencen om pladserne, harmonien, truppens bredde, ligaplaceringen, den nye manager, spillestilen, vurderingen og økonomien. */
export function cmFutureLines(g: GameState, p: Player, interested = 0): FutureLine[] {
  const out: FutureLine[] = [];
  if (!p.club) return out;
  const c = cmContractOf(p);
  const fl = c.b45 >>> 0;
  const b4e = c.b4e ?? (p.listed ? 1 : 0);
  const age = ageOn(p.dob, g.date);
  const loy = sh(p, 'loyalty'), prof = sh(p, 'professionalism'), temp = sh(p, 'temperament'), amb = sh(p, 'ambition'), pres = sh(p, 'pressure');
  const future = !!p.contract?.futureClub;
  const crep = clubRep(g, p.club), rc = curRep(p);
  const st = ((c.b4f ?? statusCode(p) << 4) >> 4) & 0xf;
  // 0x87f01d: karrieren slutter (0x7a7eb0 = 1 – hos os en karrierestoppende skade, Player.cmRetire) → kun den linje (0x87f0be → 0x8853a0)
  if (p.cmRetire) return [{ k: age < 0x1e ? 'noFuture' : 'retiring' }];       // (+0x69 ikke-spillerpost → "… from the playing staff" – findes ikke)
  // 0x87f16a: universitetet (påskeægget "Andrew Mainwaring", PA > 100, 18–21 år)
  if (pname(p) === 'Andrew Mainwaring' && p.pa > 100 && age > 0x11 && age < 0x16) out.push({ k: 'university' });
  // 0x87f2c5: interessen (Interested-listen ikke tom, ikke listet, intet aftalt skifte, mere end 150 dage i klubben)
  if (interested > 0 && !(b4e & 9) && !future && daysSince(g, p.joined ?? p.cmJoined) > 0x96) {
    const a = !!(fl & 0x14) || crep < 0x109a;
    if (fl & 0x101 || (a && amb > 15 && loy < 6)) out.push({ k: 'impressScouts' });
    else if (a && pres < 6) out.push({ k: 'pressuredInterest' });
    else if (a && crep < 0x109a && amb > 15 && pres > 15) out.push({ k: 'flattered' });
  }
  const leave = wantsToLeave(leaveIn(p), c);
  // 0x880a9b: transferlistet af klubben, ingen klager, vil ikke væk
  if (b4e & 1 && !future && fl === 0 && !leave) {
    const ds = deservedStatus(p, c, age);
    if (st === 0 || st === 8 || ds === 6 || ds === 5) {                         // 0x880c28
      out.push({ k: amb > 15 ? 'forceBack' : pres < 10 && loy > 15 ? 'noLeave' : 'listDisappointed' });
    } else {
      if (daysSince(g, p.joined ?? p.cmJoined) > 0x28a && loy > 15 && prof > 10) out.push({ k: 'noLeave' });
      out.push({ k: loy > 10 && temp > 10 && prof > 10 ? 'listShocked' : temp < 6 ? 'listAngry' : amb > 10 && ds === 1 ? 'listTooGood'
        : pres < 6 && ds === 1 ? 'listSurprised' : 'listDisappointed' });
    }
  } else if (b4e & 9 && loy < 6 && prof < 10 && fl & 1) {                      // 0x880c52
    out.push({ k: loy === 1 && amb > 15 && temp < 10 ? 'betterClub' : amb > 15 && temp < 6 ? 'movingClubs' : 'listPleased' });
  } else if (b4e & 8 && fl === 0 && !leave) {                                  // 0x880d0c
    out.push({ k: future ? (pres < 10 ? 'nervous' : loy > 10 ? 'greatClub' : 'shame') : 'nowStay' });
  }
  // 0x881331: 0x10000 – vil væk nu / vil sættes på listen
  if (fl & 0x10000 && !future) out.push({ k: prof < 10 && temp < 5 ? 'leaveNow' : 'wantsList' });
  // 0x8813d6: 0x80000
  if (fl & 0x80000) out.push({ k: 'noSupport' });
  // 0x88144e: 0x4000 – vigtigere rolle
  if (fl & 0x4000) out.push({ k: temp < 6 && amb > 10 && Math.round(p.ca) + amb > prof + 0x5a && rc > crep ? 'expectsRole' : 'deservesRole' });
  // 0x883004: 0x200 – behandlet uretfærdigt
  if (fl & 0x200) {
    const d = daysSince(g, p.joined ?? p.cmJoined);
    out.push({ k: d < 0xe ? 'falsePretences' : d < 0x3c ? 'wrongDecision' : pres < 6 && prof < 15 ? 'victimised'
      : loy > 5 && prof < 11 && temp < 11 && age > 0x18 && sh(p, 'influence') > 8 && rc > 0x1194 ? 'respect' : 'unfair' });
  }
  // 0x88325e: 4 – burde være fast mand
  if (fl & 4) {
    let k = 'shouldBeRegular';
    if (future && pres < 10 && rc > 0xea6 && rc > crep - 0x2ee) k = 'leavingOut';
    else if (rc > 0xea6 && rc > crep && prof < 15) {
      if (temp < 6) k = 'angryRegular';
      else if (amb > 10) k = p.id % 3 === 0 ? 'shockedConsider' : 'shockedTreat';
    }
    out.push({ k });
  }
  // 0x8836a4: 0x10 – spilletid (0x8857c0 = +0x3f, kampe i træk med spilletid)
  if (fl & 0x10) out.push(...regularLines(p, c, fl, crep, rc, age, { loy, prof, pres, amb }));
  tailLines(g, p, c, out, { fl, b4e, age, loy, prof, temp, amb, pres, future, crep, rc, st });
  return out;
}

/** Den tilfredse blok i Future (0x8844e1–0x884dbc), når ingen af de porterede linjer kom: originalen springer hele blokken over (→ "Unknown"
 *  0x8852f9, når der ingen linjer er), hvis +0x45 ≠ 0 (0x5d5a50), +0x44 < −Loyalty (0x8857b0 mod staff +0x59), +0x4e & 8 (0x8857f0), og inde i
 *  blokken (0x884b39) hvis han er transferlistet (0x544520: +0x4e & 9) eller i en tvist (0x569e30 – findes ikke hos os). Ellers skriver den altid
 *  én tilfreds linje (varianterne 0x884b78–0x884d48 – kun "Happy to stay at the club" er med, *estimeret*). Rettet 14/11: før stod "Happy to stay"
 *  altid, når der ingen linjer var – også efter Not Needed (statusHappiness: Key → Not Needed −125, så +0x44 < −Loyalty → "Unknown").
 *  14/11: varianterne er porteret i happyLines (cmFutureLines viser dem) – denne fortæller kun, om blokken når frem til en tilfreds linje. */
export function cmFutureHappy(p: Player): boolean {
  if (!p.club) return false;
  const c = cmContractOf(p);
  if (c.b45 >>> 0) return false;
  if (s8(c.b44) < -sh(p, 'loyalty')) return false;
  const b4e = c.b4e ?? (p.listed ? 1 : 0);
  return !(b4e & 8) && !(b4e & 9);
}

/** 0x8836b1–0x883bcf (klagen 0x10) */
function regularLines(p: Player, c: CmContract, fl: number, crep: number, rc: number, age: number, a: { loy: number; prof: number; pres: number; amb: number }): FutureLine[] {
  const out: FutureLine[] = [];
  const only = fl === 0x10;
  const unsettled = () => { if (only) out.push({ k: 'unsettled' }); };
  if (s8(c.b3f) > 1) {                                                         // 0x8836fb: han spiller igen
    if (fl & 0x6046008 || p.listed || (c.b4e ?? 0) & 9) { unsettled(); out.push({ k: 'notConvinced' }); return out; }
    if (a.prof > 10 && a.pres > 10) { if (only) out.push({ k: 'longRun' }); out.push({ k: 'backInTeam' }); return out; }
    unsettled();
    out.push({ k: a.pres < 6 ? 'droppedAgain' : 'stayPlans' });
    return out;
  }
  if (rc > 0x186a && rc > crep - 0x4e2 && a.amb > 10 && a.prof < 6) { out.push({ k: 'repGuarantee' }); return out; }
  if (a.amb > 0xe && rc < crep) {
    if (a.prof < 6 && a.loy < 6 && p.pa > a.amb + (p.id % 8) + 0x64) { unsettled(); out.push({ k: 'lookElsewhere' }); return out; }
    if (a.prof < 0xf && age < 0x17) {
      out.push({ k: sh(p, 'determination') < 10 && a.pres < 6 ? 'worriedFuture' : a.pres <= 10 && a.loy <= 10 ? 'readyFirst'
        : s8(c.b44) > 0 ? 'happyWait' : 'unsettled' });
      return out;
    }
    unsettled();
    out.push({ k: fl & 0x101 ? 'fedUp' : 'forceWay' });
    return out;
  }
  out.push({ k: 'wantsFirst' });
  return out;
}

// ---------------------------------------------------------------- Future 0x883bcf–0x8853ba (resten af fanen)

type TailCtx = { fl: number; b4e: number; age: number; loy: number; prof: number; temp: number; amb: number; pres: number; future: boolean; crep: number; rc: number; st: number };

/** klubbens manager (club +0xcf): ankomstdatoen (personpost +0x3e) og personnøglen (menneskets manager har ingen staffpost hos os – nøgle 0) */
function managerOf(g: GameState, club: number): { key: number; joined?: string } {
  if (isHumanClub(club)) return { key: 0, joined: g.manager?.cmJoined };
  const m = managerStaff(g, club);
  return { key: m ? personKey(m) : 0, joined: m?.cmJoined };
}

/** Future-blokkene 0x883bcf–0x8853ba i originalens rækkefølge (efter klagen 0x10). Felter, spillet ikke har (*estimeret* – grenen findes, men
 *  tages aldrig): kontraktens +0x40 (0x8676f0: managerens disciplin & 2 og "Willing to stay"-grenen), mediehistorien 0x735780 ([0xb6b7c8], type 2),
 *  tvisten 0x569e30, ikke-spillerposten staff +0x69 (spillertrænere) og spillermanagere (job 12). Kontraktens +0x49 ("sat fri" – Bosman) =
 *  spillerens afviste forlængelse (Player.renewal 'refuses', *estimeret*). Sproget [0x9eb2dc] (0x66f4d0) = engelsk (0). */
function tailLines(g: GameState, p: Player, c: CmContract, out: FutureLine[], x: TailCtx): void {
  const { fl, b4e, age, loy, prof, temp, amb, pres, future, crep, rc, st } = x;
  const push = (k: string, pr?: FutureLine['p']) => out.push(pr ? { k, p: pr } : { k });
  const club = g.clubs[p.club];
  const joinedDays = daysSince(g, p.joined ?? p.cmJoined);
  const b44 = s8(c.b44);
  const b40 = 0;                                                               // kontrakt +0x40 – findes ikke hos os
  const media = false;                                                         // 0x735780 – mediehistorierne er ikke porteret
  const dispute = false;                                                       // 0x569e30
  const listedClub = !!(b4e & 1), loanListed = !!(b4e & 2);                    // 0x5444a0 / 0x544590
  const listed9 = !!(b4e & 9);                                                 // 0x544520
  const ca = Math.round(p.ca);
  const expiry = p.contract?.expires;
  const daysLeft = expiry ? dayNum(expiry) - dayNum(g.date) : 10000;           // 0x54cdb0(+0x2d, i dag)
  const nat = g.nations[club?.nation ?? -1]?.name;

  // 0x883c04: 0x20 – tilpasningen (klubbens land club +0x53)
  if (fl & 0x20 && nat) {
    if (joinedDays > 0x2d0) push('timeToMove');
    else if (temp < 6 && prof < 15) push('mistakeMoving', { nation: nat });
    else push('adjustLifestyle', { nation: nat, adj: DEMONYM[nat] ?? nat });
  }
  // 0x883d67: 0x40 – personlige problemer
  if (fl & 0x40) push(pres < 5 && prof < 6 && temp < 10 && worldRep(p) > 0x109a ? 'depression' : 'personal');
  // 0x883e0a: 0x200000 – holdkammeratens bemærkninger
  if (fl & 0x200000) push(pres < 6 ? 'hurtRemarks' : 'unhappyRemarks');
  // 0x883e95: managerens håndtering af medierne (0x735780)
  if (media && pres > 15 && temp < 6 && rc > 0xea6 && age > 0x12 && (st === 1 || st === 2))
    push(temp < 6 && prof < 10 && pres > 5 ? 'mediaOutraged' : pres < 6 ? 'mediaHurt' : 'mediaUpset');
  // 0x883f89: kontrakt +0x40 & 2
  if (b40 & 2) push('discipline');
  // 0x884005: motivationen (spillerpost +0x44 Work Rate)
  if (club && b44 < -25 && sh(p, 'workRate') < 10 && prof < 10 && rc > crep + 0xfa) push('motivating');
  // 0x8840c4: 0x100000 – presset/trætheden (spillerpost +0x3c Stamina)
  if (fl & 0x100000) {
    if (age < 0x17 && pres < 10 && prof < 6) push('pressureFirst');
    else if (age < 0x17 && prof > 15 && sh(p, 'stamina') < 15) push('rested');
    else if (age > 0x1e && pres < 6) push('pastPeak');
    else if (age <= 0x1e && pres < 6 && !(fl & 0x20181)) push('worriedFuture');
    else push((s8(c.b3f) > 4 || s8(c.b3d) > 0x4b) && age < 0x1b ? 'reliesTooMuch' : 'jaded');   // 0x88418a (sproget 0x66f4d0 = 0)
  }
  // 0x88422d: 0x8000 – træningen
  if (fl & 0x8000) push(pres < 10 && prof < 10 && age < 0x18 ? 'trainingHarm' : 'unhappyTraining');

  if (future) futureMove(c, out, x, { dispute, b44, loanListed, ca, daysLeft });  // 0x8842c7: et aftalt skifte (0x8cca10) → 0x884e12
  else {
    // 0x8842dd: 0x80 – må ikke skifte klub
    if (fl & 0x80) push(temp < 6 && prof < 15 ? 'angryMove' : prof > 14 ? 'frustratedMove' : 'unhappyMove');
    const b49 = p.renewal?.stance === 'refuses' && !p.renewal.convinced;      // +0x49 (*estimeret*)
    if (b49 && expiry) push('bosman', { date: expiry });                        // 0x88437d
    else if (st === 0) push('clarification');                                   // 0x884406: ingen trupstatus (job 0xb = spiller)
    else happyLines(g, p, c, out, x, { b44, b40, media, dispute, listedClub, loanListed, listed9, ca, daysLeft, joinedDays });
  }
  // 0x88520a: pralet om den større klub (ingen aftalt skifte [esp+0x38])
  if (club && !future && amb > 15 && loy < 6 && prof < 6 && crep < 0x1676 && rc > 0xcb2 && rc > crep + 0x2ee) push('biggerSoon');
  if (!out.length) push('unknown');                                             // 0x8852ef
}

/** 0x8844e1–0x884e0d: den tilfredse blok (springes over ved klager, +0x44 < −Loyalty eller listet efter eget ønske) */
function happyLines(g: GameState, p: Player, c: CmContract, out: FutureLine[], x: TailCtx,
  o: { b44: number; b40: number; media: boolean; dispute: boolean; listedClub: boolean; loanListed: boolean; listed9: boolean; ca: number; daysLeft: number; joinedDays: number }): void {
  const { fl, b4e, age, loy, prof, temp, amb, pres, crep, rc, st } = x;
  const push = (k: string, pr?: FutureLine['p']) => out.push(pr ? { k, p: pr } : { k });
  if (fl || o.b44 < -loy || b4e & 8) return;
  // 0x88451d: kontrakten løber ud
  if (pres < 6 && age < 0x18 && !o.listed9 && rc < 0xcb2 && rc < crep + 0xfa && o.daysLeft < 200 - pres) push('anxiousContract');
  // 0x884616: han kan lide sin manager (0x547810)
  const mgr = managerOf(g, p.club);
  if (favoursPerson(p, mgr.key)) {
    let rest = true;
    if (loy > 15 && !o.listed9 && rc > crep - 0x2ee && o.ca > 100 - amb && crep < 0x128e) push('helpPotential');
    if (!o.media && (rc < 0xcb2 || rc < crep) && age < 0x18) {
      rest = false;
      if (o.listed9) {
        if (o.listedClub) {
          if (amb > 15) push('proveWrong');
          else if (age < 0x13 && rc < 0x9c4 && amb < 6) push('ambitionOver');
          else if (mgr.joined && daysSince(g, mgr.joined) > 0x258 && age < 0x1c && o.joinedDays > 0x258 && temp < 6 && sh(p, 'aggression') > 15) push('mentorLeft');
          else if (prof > 15) push('careerOver', { club: g.clubs[p.club]?.name ?? '' });
          else if (age < 0x13 && amb > 15 && rc < 0x9c4) push('stillMakeIt');
        } else push('enthusiastic');
      } else push('managerHelp');                                               // (0x884a20 skriver "Enthusiastic" i bufferen uden at vise den)
    }
    if (rest && o.listedClub && age < 0x13 && amb > 15 && rc < 0x9c4) push('stillMakeIt');   // 0x8849dd
  }
  // 0x884a32: lejelistet ung spiller
  if (o.loanListed && age < 0x18 && rc < 0x109a && prof > 15 && pres > 10 && (st < 1 || st > 4)) push('loanExperience');
  // 0x884b2f: listet eller i en tvist → kun "Unknown", hvis intet er skrevet
  if (o.listed9 || o.dispute) return;
  const club = g.clubs[p.club];
  let k = 'happyStay';
  if (favoursClub(p, p.club) && loy > 5) {                                      // 0x884b62: klubben er hans yndlingsklub (0x547d60)
    // job 12 (spillermanager) og ikke-spillerposten +0x69 findes ikke hos os; job 0xb → 0x53b620 ≠ 0
    if (age < 0x19) k = 'enthusiastic';
    else if (o.joinedDays < 0x1e) k = 'impressManager';
    else if (st === 1 || (st === 2 && s8(c.b3d) > 0x19 && o.joinedDays > 0x2d)) k = 'enjoyPlaying';
    else if (st === 3) k = s8(c.b3e) > 1 ? 'happyStay' : 'enjoyPlaying';
    else k = age < 0x1f ? 'content' : 'happyStay';
  } else if (o.b40) {                                                           // 0x884c88: kontrakt +0x40
    k = loy < 6 ? (prof < 10 ? 'considering' : 'willingCurrently') : 'willing';
  } else if (club) {
    if (loy > 15 && o.b44 > 0x19 && rc < crep && age < 0x19) k = 'commitFuture';
    else if (loy < 5 && prof < 5 && rc > 0x109a && rc > crep - 0x5dc && age < 0x1f) k = 'conditionsNow';
  }
  push(k);
}

/** 0x884e12–0x8851a9: spilleren har et aftalt skifte (0x8cca10 – hos os en forhåndsaftale, Player.contract.futureClub) */
function futureMove(_c: CmContract, out: FutureLine[], x: TailCtx, o: { dispute: boolean; b44: number; loanListed: boolean; ca: number; daysLeft: number }): void {
  const { fl, age, loy, prof, temp, amb, pres, crep, rc, st } = x;
  const push = (k: string) => out.push({ k });
  if (o.dispute) return;
  if (fl || o.b44 < -50 - loy) {                                                // 0x8850b4
    if (fl) return;
    // 0x8850dd: "Considering his options" kræver, at der intet aftalt skifte er (0x8cca10 = 0) – kan ikke ske her
    if (!o.loanListed) { push('unsure'); return; }
    if (age < 0x18) push(prof > 15 && pres > 10 ? 'loanExperience' : loy < 6 && prof < 10 ? 'loanNotSure' : 'unsure');
    else if (prof < 10 && amb > 15 && rc > 0xcb2) push('loanAbility');
    else if (prof < 10 && temp < 10) push('loanUpset');
    else push('unknown');
    return;
  }
  if (o.loanListed) {                                                           // 0x884e5a
    if (age < 0x18) {
      if (prof > 15 && pres > 10 && rc < 0xcb2 && (st < 1 || st > 4)) push('loanExperience');
      else if (loy < 6 && prof < 10 && o.ca > prof - amb + 100) push('loanNotSure');
      else push('unsure');
    } else if (prof < 10 && amb > 15 && o.ca > prof - amb + 100 && rc > 0xcb2) push('loanAbility');
    else if (prof < 10 && temp < 10) push('loanDisappointed');
    else push('unknown');
    return;
  }
  if (pres < 5 && age < 0x17) push('insecure');                                 // 0x884fa5
  else if (loy < 5 && age > 0x1f) push('jaded');
  else if (pres < 10 && rc < 0xcb2 && rc < crep + 0xfa && o.daysLeft < pres + 0x1e) push(age < 0x15 ? 'insecure' : 'extendContract');
  else push(out.length ? 'unsettled' : 'unknown');
}

// ---------------------------------------------------------------- interesserede klubber (0x842180) og deres bud – *estimeret*

/** 0x842180 (computerklubbernes del): klubber, hvis plads på ønskelisten vurderer ham over værdien +0x52. Ønskelisterne (0x842e10/0x83b6e0) er
 *  ikke porteret – *estimeret*: computerklubber, hvis niveau passer (CA mod de 14 bedstes snit −10…+30), med råd (transferbudget ≥ værdien) og
 *  omdømme mindst hans klubs −15, vurderer ham til modelværdien (0x4d0c60) × 0,7–1,3 (fast pr. klub, spiller og måned); højst fire, størst omdømme først. */
export function cmInterested(g: GameState, p: Player, level: (club: number) => number): number[] {
  if (!p.club || p.loan) return [];
  return interestMap(g, level).get(p.id) ?? [];
}

/** *estimeret* (ejerens fund 14/11: med Bolton havde ALLE spillere interesserede klubber): originalen har ved spilstart kun 258 mål på
 *  ønskelisterne for 137 klubber i England (cm-shortlist-orig.ts på pre-194-2001.bin), dvs. ~2 pr. klub. Her vælger hver computerklub i en
 *  synlig liga højst 2 mål pr. måned: de spillere med niveauet (CA mod de 14 bedstes snit −10…+30), som den har råd til, og som den vurderer
 *  højest over værdien (modelværdien × 0,7–1,3 > værdien); spillerens Interested = de klubber, der valgte ham (højst fire, størst omdømme først). */
let imCache: { key: string; map: Map<number, number[]> } | null = null;
function interestMap(g: GameState, level: (club: number) => number): Map<number, number[]> {
  const ym = g.date.slice(0, 7);
  const key = `${g.id}|${ym}`;
  if (imCache?.key === key) return imCache.map;
  const ymN = Number(ym.replace('-', ''));
  const players = Object.values(g.players).filter((p) => p.club && !p.loan && !p.virtual && !g.leagues[g.clubs[p.club]?.league]?.hidden);
  const target = new Map(players.map((p) => [p.id, valueTarget(p)]));
  const picks = new Map<number, { id: number; rep: number }[]>();
  for (const c of Object.values(g.clubs)) {
    if (isHumanClub(c.id) || g.leagues[c.league]?.hidden) continue;
    const lv = level(c.id);
    const best: { pid: number; r: number }[] = [];
    for (const p of players) {
      if (p.club === c.id || c.transferBudget < p.value || p.ca < lv - 10 || p.ca > lv + 30) continue;
      const own = g.clubs[p.club];
      if (c.rep < (own?.rep ?? 0) - 15) continue;
      const v = (target.get(p.id) ?? 0) * (0.7 + 0.6 * hash01(g.seed ?? 0, p.id, c.id, ymN));
      if (v <= p.value) continue;
      best.push({ pid: p.id, r: v / Math.max(1, p.value) });
    }
    best.sort((a, b) => b.r - a.r);
    for (const b of best.slice(0, 2)) { const a = picks.get(b.pid) ?? []; a.push({ id: c.id, rep: c.rep }); picks.set(b.pid, a); }
  }
  const map = new Map<number, number[]>();
  for (const [pid, a] of picks) map.set(pid, a.sort((x, y) => y.rep - x.rep).slice(0, 4).map((x) => x.id));
  imCache = { key, map };
  return map;
}

/** dagens chance for, at en interesseret klub byder (*estimeret*): på listen eller vurderet til mindst det dobbelte af værdien 1/8, Not Needed 1/25 */
export function cmBidChance(p: Player): number {
  if (p.listed || ((p.cmContract?.b4e ?? 0) & 9)) return 1 / 8;
  if (p.value * 2 <= valueTarget(p)) return 1 / 8;
  if (statusCode(p) === 7) return 1 / 25;
  return 0;
}
