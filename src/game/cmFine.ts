// Discipline Player (bøde/advarsel) som i CM 01/02 – Fine.cpp i cm0102.exe 3.9.68 (disassembleret med ~/cm0102-engine/tools/cmdis.py 14/11-2026).
// Kun den originale database i ægte tilstand (cmActive) – det udvidede spil og 2026/27 bruger personality.ts' interact som før.
//
//   0x5a83e0 dialogen "Discipline Player": straffen (1 "Official Warning", 2 "1 Week Fine", 3 "2 Week Fine" – "<n> Week Fine" = straf − 1)
//            og grunden (0 no reason, 1 unprofessional behaviour, 2 dismissal in prior match, 3 violent behaviour, 4 poor performance) → 0x5a5980
//   0x5a5980 Fine::fine_player(staff, straf, grund): fortjent (0x5a69b0) → spilleren tager imod (personligheden kan rette sig), ellers
//            klagen 0x200 "treated unfairly" (Future), tilfredsheden +0x44, holdkammeraternes protest (0x400), bestyrelsens tålmodighed
//   0x5a69b0 fortjent?  0x5a74b0/0x5a76e0 nyheden 0xbc6 (overskrift og brødtekst)  0x5a73a0 grundens tekst
//   0x5a5820 dagligt (0x5cdb05, lige før 0x5d6d10): de udløbne poster og trænerens rapport (0x5a7f20 → nyheden 0x1394, tekst 0x5a8090)
//   0x5a7ed0 bestyrelsens nyhed 0x1784 "The board make concerns known"   0x5a5930/0x5a5960 tælleren halveres (0x6a3770) / nulstilles (0x69b790)
//
// Originalen flytter INGEN penge (hverken 0x5a5980 eller dialogen 0x5a83e0 rører økonomien): straffens størrelse virker kun gennem `sev` i
// tilfredsheden (−5/−15/−20 pr. trin), personlighedens grænser og hvor længe posten huskes (7·sev dage, 0x54c770).
//
// Felterne: staff +0x57 Ambition, +0x58 Determination, +0x59 Loyalty, +0x5a Pressure, +0x5b Professionalism, +0x5d Temperament, +0x18 alder;
// spillerposten +5 CA, +0xb nuværende og +0xd verdensomdømme, +0x1c Aggression, +0x44 Work Rate; kontrakten +0x40 (findes ikke hos os = 0),
// +0x44 (b44), +0x45 (b45), +0x4f høj nibble trupstatus. Tilfældige tal: cmRand (egen talrække – spillets rng røres ikke).

import type { GameState, Player, Staff } from './types';
import { ATTRS } from './attributes';
import { ageOn, addDays } from './dates';
import { addNews, squad } from './state';
import { asOwner, isHumanClub } from './humans';
import { cmActive, cmContractOf, cmFlagSet, cmRand, clubRepMem, curRep, statusCode, wantsToLeave, withFlagCtx } from './cmPlayerData';
import { addDisClub, favoursPerson } from './cmRelations';
import { npShown } from './cmStaffInit';
import { newRec } from './cmBoard';

const s8 = (v: number) => (v << 24) >> 24;
const u8 = (v: number) => v & 0xff;
const cl100 = (v: number) => (v > 100 ? 100 : v < -100 ? -100 : v);
const cl10k = (v: number) => (v < 1 ? 1 : v > 10000 ? 10000 : v);
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const AI = (k: string) => ATTRS.indexOf(k as never);
const sh = (p: Player, k: string) => s8(Math.round(p.attrs[AI(k)] || 10));
const bump = (p: Player, k: string, d: number) => { const i = AI(k); if (i >= 0) p.attrs[i] = Math.max(1, Math.min(20, Math.round(p.attrs[i] || 10) + d)); };
const pname = (p: Player) => `${p.first} ${p.last}`.trim();
const worldRep = (p: Player) => Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[2] * 50);

/** straffen: 1 advarsel, 2 én uges bøde, 3 to ugers bøde (dialogens tal) */
export type FineSev = 1 | 2 | 3;
/** grunden: 0 no reason, 1 unprofessional, 2 dismissal, 3 violent, 4 poor performance (5 = AWOL, sat af 0x5a5980 selv) */
export const FINE_REASONS = ['none', 'unprofessional', 'dismissal', 'violent', 'poor'] as const;

/** Fine-objektet [0xae2a3c]: +0 posterne (0xe bytes: staff-id, grund, fortjent, udløb), +4 trænerens rapporter (0x11 bytes), +8 tæller pr. klub */
export interface CmFineState {
  recs: { pid: number; why: number; ok: number; until: string }[];
  coach: { coach: number; pid: number; flag: number; due: string }[];
  count: Record<number, number>;
}
const stateOf = (g: GameState): CmFineState => (g.cmFine ??= { recs: [], coach: [], count: {} });

/** spillerens seneste kamp for klubben inden for 8 dage (0x54cab0(8) + 0x5acbe0, listen bagfra – den nyeste spillede) og hans linje */
function lastMatchLine(g: GameState, p: Player) {
  const today = dayNum(g.date);
  let best: { d: number; id: number } | null = null;
  for (const f of Object.values(g.fixtures)) {
    if (!f.result || (f.home !== p.club && f.away !== p.club)) continue;
    const d = dayNum(f.date);
    if (d < today - 8 || d > today) continue;
    if (!best || d > best.d || (d === best.d && f.id > best.id)) best = { d, id: f.id };
  }
  if (!best) return { match: false as const };
  const line = g.reports[best.id]?.players.find((l) => l.id === p.id);
  if (!line) return { match: true as const, line: null };
  // MATCH_PLAYER +0x24 (gule, 2 ved andet gule), +0x25/+0x26 kortenes årsagskoder → kampposten +0x9d/+0x9f/+0xa0; +0x9e udvist.
  // Zonemotoren kender ikke årsagerne (0) – kun gittermotoren (adapter.ts) gemmer dem.
  const cy = line.cy ?? line.yellow + (line.red && line.yellow ? 1 : 0);
  return { match: true as const, line: { cy, red: line.red, cw: line.cw ?? [0, 0] } };
}
const VIOLENT = (c: number) => c === 0xb || c === 0xc;

/** 0x5a69b0: er straffen fortjent? (staff, straf, grund) */
export function fineDeserved(g: GameState, p: Player, sev: number, why: number, rand: (n: number) => number): boolean {
  if (!p.club) return true;                                                     // 0x5a6a10: uden klub
  // 0x5a6aa1: en aktiv post for spilleren (udløbet efter i dag): uretfærdig før → uretfærdig nu; fortjent → rand(Professionalism) = 0 → uretfærdig
  const today = dayNum(g.date);
  for (const r of stateOf(g).recs) {
    if (r.pid !== p.id || dayNum(r.until) <= today) continue;
    if (!r.ok) return false;
    if (rand(sh(p, 'professionalism')) === 0) return false;
  }
  const c = cmContractOf(p);
  switch (why) {
    case 1: case 5: {                                                           // 0x5a6b45 unprofessional (og AWOL)
      // 0x7357c0 (mediernes historie om spilleren) findes ikke hos os
      if (p.injury?.key === 'awol') return true;                                // 0x418f60(staff, 0)
      // 0x418ff0 (AWOL-bit 2) findes ikke hos os; 0x419070 (AWOL-listen +8) *estimeret*: udeblevet inden for 30 dage (rules2001.ts sætter lastIncident)
      if (p.lastIncident && today - dayNum(p.lastIncident) <= 30 && (sev === 1 || sev === 2)) return true;
      if (s8(c.b44) < -25 && sh(p, 'workRate') < 10 && sh(p, 'professionalism') < 10 && curRep(p) > clubRepMem(g, p.club) + 250) return true;
      const m = lastMatchLine(g, p);
      if (m.match && m.line) {                                                  // 0x5a6d59
        const L = m.line;
        if (L.cy === 1) { if ([1, 2, 4, 5, 6, 8].includes(L.cw[0]) && sev === 1) return true; }
        else {
          if (VIOLENT(L.cw[0]) || VIOLENT(L.cw[1])) return true;
          if (L.cy === 2) { if (sev <= 2) return true; }
          else if (L.red && L.cy < 2 && sev <= 3) return true;
        }
      }
      // 0x5a6c98
      if (sev === 1 && sh(p, 'temperament') + sh(p, 'pressure') > rand(50)) return true;
      return rand(100) === 0;
    }
    case 2: {                                                                   // 0x5a6e49 dismissal in prior match
      const m = lastMatchLine(g, p);
      if (!m.match || !m.line) return false;
      const L = m.line;
      if (VIOLENT(L.cw[0]) || VIOLENT(L.cw[1])) return true;
      if (L.cy === 2) return sev === 1;
      return L.red && L.cy < 2 && sev <= 2;
    }
    case 3: {                                                                   // 0x5a702f violent behaviour
      const m = lastMatchLine(g, p);
      return !!(m.match && m.line && (VIOLENT(m.line.cw[0]) || VIOLENT(m.line.cw[1])));
    }
    case 4: {                                                                   // 0x5a71d4 poor performance: formens nyeste karakter (+0x26 & 0xf)
      const n = ((p.cmForm ?? 0) >>> 16) & 0xf;
      if (n === 0) return false;
      if (n < 4) return true;
      if (n === 4) return sev <= 2;
      if (n === 5) return sev <= 1;
      return false;
    }
    default: return false;                                                      // 0 no reason
  }
}

/** grundens tekstkode til nyheden (0x5a73a0: 1..4, ellers "no reason") */
const whyCode = (why: number) => (why >= 1 && why <= 4 ? why : 0);

/** 0x5a74b0 + 0x5a76e0: nyheden 0xbc6 til manageren – overskrift efter reaktionen (0 uretfærdig, 1 protest, 2 accepterer), brødtekst efter
 *  p6 = rand(2), p7 = Temperament + Professionalism < 12, Loyalty < 6 og nuværende omdømme > 5250, p9 = trupstatus 7, p10 = aftalt skifte
 *  (0x8cca10), p11 = flagene fra 0x5a5980, p12 = (over 23 år og status 1) eller status 2 */
function fineNews(g: GameState, p: Player, why: number, react: 0 | 1 | 2, sev: number, flags: number, rand: (n: number) => number): void {
  if (!isHumanClub(p.club)) return;                                             // 0x7875e0
  const p6 = rand(2);
  const p7 = sh(p, 'temperament') + sh(p, 'professionalism') < 12 && sh(p, 'loyalty') < 6 && curRep(p) > 5250;
  const warn = sev === 1;
  const st = statusCode(p);
  const p9 = st === 7, p10 = !!p.contract?.futureClub, p11 = flags !== 0;
  const p12 = (ageOn(p.dob, g.date) > 23 && st === 1) || st === 2;
  const r = why >= 1 && why <= 4 ? why : 5;
  let body: string;
  if (warn) {
    if (react === 0) body = p10 ? 'wLeaving' : p9 ? 'wForceOut' : p7 ? 'wUndeserved' : 'wUnfair';
    else if (react === 1) body = p6 ? 'wSeveral' : 'wUnrest';
    else body = r === 1 ? (p11 ? 'wUnproAck' : p7 ? (p12 ? 'wUnproSenior' : 'wUnproGrudge') : 'wUnproOk')
      : r === 2 ? (p7 ? 'wDismissGrudge' : 'wDismissOk')
      : r === 3 ? (p7 ? (p11 ? 'wViolentOk' : 'wViolentGrudge') : p11 ? 'wViolentOk' : 'wNoComment')
      : r === 4 ? (p11 ? 'wPoorSorry' : p7 ? 'wPoorForm' : 'wPoorOk') : 'wNoComment';
  } else {
    if (react === 0) body = p10 ? 'fLeaving' : p9 ? 'fForceOut' : p7 ? 'fMotivate' : 'fUnfair';
    else if (react === 1) body = p6 ? 'fSeveral' : 'fUnrest';
    else body = r === 1 ? (p11 ? 'fUnproAck' : 'fNoComment')
      : r === 2 ? 'fDismissOk'
      : r === 3 ? (p7 ? (p11 ? 'fViolentOk' : 'fViolentGrudge') : p11 ? 'fViolentOk' : 'fViolentQuiet')
      : r === 4 ? (p11 ? 'fPoorSorry' : 'fPoorOk') : 'fNoComment';
  }
  const key = `cmfine.${warn ? 'w' : 'f'}${react}`;
  asOwner(p.club, () => addNews({ cat: 'general', key, params: { player: pname(p), last: p.last, why: whyCode(why), body }, link: { kind: 'player', id: p.id } }));
}

/** 0x419840 (spilleren udebliver): varigheden er *estimeret* som rules2001.ts' awolMonthly (3–10 dage) */
function goAwol(g: GameState, p: Player, rand: (n: number) => number): void {
  if (p.injury) return;
  const days = 3 + rand(8);
  p.injury = { key: 'awol', days, total: days };
  p.lastIncident = g.date;
  asOwner(p.club, () => addNews({ cat: 'injury', key: 'awol.gone', params: { player: pname(p), days }, link: { kind: 'player', id: p.id } }));
}

/** klubbens assistent (club +0xd3) med ikke-spillerpost */
function assistantOf(g: GameState, club: number): Staff | null {
  for (const s of Object.values(g.staff)) if (s.club === club && s.role === 'assistant' && s.cmNp) return s;
  return null;
}

/** bestyrelsens del af den uretfærdige straf (0x5a6077–0x5a6431). Returnerer true, når bestyrelsen griber ind og 0x5a5980 stopper (0x5a6991). */
function boardPart(g: GameState, club: number, why: number, sev: number, rand: (n: number) => number): boolean {
  const F = stateOf(g);
  const ch = g.cmChair?.[club];
  // 0x5a6077: grænsen = formandens Patience (np +0x1d) >> 2 + 5, uden formand 8
  const thr = ch ? s8((s8(ch[1]) >> 2) + 5) : 8;
  let n = F.count[club] ?? 0;
  if (n < 100) n++;
  if (n < 0) n = 0;
  F.count[club] = n;
  // 0x5a60c0: menneskets klub og rand(3) ≠ 0 → managerens Loyalty −rand(sev + 1) (menneskets manager har ingen staffpost hos os – kun tallene trækkes)
  if (isHumanClub(club) && rand(3) !== 0) rand(sev + 1);
  const B = g.cmBoard;
  if (!B) return false;                                                         // (originalen har altid bestyrelsen [0xb67a44])
  const R = (B.rec[club] ??= newRec());
  const news = (concern: boolean) => asOwner(club, () => addNews({ cat: 'board', key: 'cmfine.board', params: { body: concern ? 'boardConcern' : 'boardUpset' } }));
  const w6 = (R.w6 << 16) >> 16;
  if (w6 < 4250 && n > thr) {
    if (ch) {
      if (why === 0 && n === thr + 1) {
        // 0x5a618f: afgangen {1, 8, klub} i MM+4 og rec +2 |= 2 (bestyrelsen fyrer manageren – cmBoard.ts processDepartures)
        B.dep.push({ type: 1, reason: 8, club });
        R.b2 |= 2;
        news(false);
        return true;
      }
      // 0x5a620e: tilliden −100·formandens np +0x14 (findes ikke i world-filerne – *estimeret* 10)
      R.w6 = cl10k(w6 - 100 * 10);
    } else R.w6 = cl10k(w6 - 500);                                             // 0x5a622d
    R.wa = cl10k(((R.wa << 16) >> 16) - 250);
    R.wc = cl10k(((R.wc << 16) >> 16) - 250);
    news(false);
    return true;
  }
  if (w6 < 4250 && n === thr) {                                                 // 0x5a633f
    R.wa = cl10k(((R.wa << 16) >> 16) - 100);
    R.wc = cl10k(((R.wc << 16) >> 16) - 100);
    news(true);
    return false;
  }
  R.wa = cl10k(((R.wa << 16) >> 16) - 50);                                      // 0x5a6431
  R.wc = cl10k(((R.wc << 16) >> 16) - 50);
  return false;
}

/** 0x5a5980 Fine::fine_player – menneskets Discipline Player. Returnerer, om straffen var fortjent. */
export function cmFinePlayer(g: GameState, p: Player, sev: FineSev, reason: number): boolean {
  const club = p.club;
  if (!club) return false;
  const rand = cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x5a5980, stateOf(g).recs.length);
  const c = cmContractOf(p);
  let why = reason;
  if ((why === 0 || why === 1) && p.injury?.key === 'awol') why = 5;            // 0x5a5a8a: udebleven → grund 5
  let flags = 0, mflag = 0, first = true;
  const ok = fineDeserved(g, p, sev, why, rand);
  const flag = (bit: number) => withFlagCtx(g, p, rand, () => cmFlagSet(c, bit));
  const loy = () => sh(p, 'loyalty'), prof = () => sh(p, 'professionalism'), temp = () => sh(p, 'temperament'), pres = () => sh(p, 'pressure');
  const age = ageOn(p.dob, g.date);
  const star = (rcMin: number) => curRep(p) > 6750 && worldRep(p) > rcMin && Math.trunc(p.ca) > 120 && age > 19 && age < 34;
  // 0x56a100 (tvisten) findes ikke hos os – betingelserne og deres tilfældige tal er med, kaldet ikke
  const dispute = (_k: number) => undefined;
  done: {
    if (ok) {
      // 0x5a5aca: holdkammeraternes kontrakt +0x40 bit 2 ryddes ved rand(Professionalism) ≠ 0 – +0x40 findes ikke hos os
      const P = prof();
      let go: boolean;
      if ((P > 2 && why === 2) || (P > 4 && why === 1) || (P > 2 && why === 3)) go = true;
      else go = rand(P) !== 0;                                                  // 0x5a5b52
      if (!go) {
        // 0x5a5f43: fortjent, men han føler sig uretfærdigt behandlet
        fineNews(g, p, why, 0, sev, 0, rand);
        flag(0x200);
        if (star(3750)) {
          if (s8(sh(p, 'ambition')) > 15 && prof() < 6 && loy() < 6 && temp() < 6 && c.b45 !== 0 && s8(c.b44) < -25
            && wantsToLeave({ id: p.id, loy: loy(), pres: pres(), prof: prof(), temp: temp(), amb: sh(p, 'ambition'), repCur: curRep(p), b40: 0 }, c)
            && rand(loy() + 2) === 0) dispute(4);
        } else if (c.b45 & 0x20 && rand(pres()) === 0 && loy() < 5 && rand(temp() * (temp() + 5)) === 0) goAwol(g, p, rand);
        break done;
      }
      if (why === 1) {                                                          // 0x5a5b76
        if (prof() < sev + 8 && rand(prof()) !== 0) { flags = 1; bump(p, 'professionalism', 1); }
        if (s8(c.b44) < -25 && sh(p, 'workRate') < 10 && prof() < 10 && curRep(p) > clubRepMem(g, club) + 250) {
          if (rand(prof()) !== 0 || flags) { bump(p, 'workRate', 1); flags |= 2; c.b44 = 0; }
        }
      } else if (why === 2) {                                                   // 0x5a5c29
        if (temp() < sev + 8 && rand(temp()) === 0) { flags = 4; bump(p, 'temperament', 1); }
      } else if (why === 3) {                                                   // 0x5a5c68
        const ag = sh(p, 'aggression');
        if (ag > 14 - sev) { const a = rand(ag); if (a > rand(21)) { flags = 8; bump(p, 'aggression', -1); } }
        if (temp() < sev + 10 && rand(temp()) === 0) { bump(p, 'temperament', 1); flags |= 4; }
      } else if (why === 4) {                                                   // 0x5a5ceb
        const det = sh(p, 'determination');
        if (det < sev + 14) { const a = rand(det); if (a < rand(21)) { const b = rand(prof()); if (b > rand(10)) { flags = 0x10; bump(p, 'determination', 1); } } }
        const wr = sh(p, 'workRate');
        if (wr < sev + 14) { const r21 = rand(21); if (wr < r21) { const b = rand(prof()); if (b > rand(10)) { bump(p, 'workRate', 1); flags |= 2; } } }
        // 0x5a5d97: Pressure mod rand(30) – indkøringsbyten [0xae2d0c]+0xa halveres (> 12), ellers rand(10) > Pressure og < 30 → +rand(10) + 1
        const ss = u8(p.cmStaffState ?? 0);
        if (pres() > rand(30) && ss > 12) { p.cmStaffState = u8(Math.trunc(ss * 0.5)); mflag = 1; }
        else if (pres() < rand(10) && ss < 30) { p.cmStaffState = u8(ss + rand(10) + 1); mflag = 2; }
      }
      fineNews(g, p, why, 2, sev, flags, rand);                                // 0x5a5e33
      // 0x5a5e54: trænerens rapport om nogle dage – menneskets klub, assistenten (club +0xd3) med rand(Man Management) > rand(6) + 5
      if (mflag && isHumanClub(club)) {
        const a = assistantOf(g, club);
        const mm = a ? npShown(a, 0x19) : null;
        if (a && mm !== null && rand(mm) > rand(6) + 5) stateOf(g).coach.push({ coach: a.id, pid: p.id, flag: mflag, due: addDays(g.date, rand(5) + 2) });
      }
      break done;
    }
    // ---- uretfærdig (0x5a6077)
    if (boardPart(g, club, why, sev, rand)) return ok;
    // 0x5a64c2
    const rc = curRep(p);
    if (c.b45 === 0 && rc <= clubRepMem(g, club)) {                            // 0x5a64ff
      fineNews(g, p, why, 0, sev, 0, rand);
      flag(0x200);
      c.b44 = cl100(s8(c.b44) + s8((rand(loy()) === 0 ? -15 : -5) * sev));
    } else {                                                                    // 0x5a6595
      c.b44 = cl100(s8(c.b44) + s8(-20 * sev));
      if (rand(loy()) !== 0) {                                                  // 0x5a67d9
        fineNews(g, p, why, 0, sev, 0, rand);
        flag(0x200);
        c.b44 = cl100(s8(c.b44) + s8((rand(loy()) === 0 ? -15 : -5) * sev));
      } else {                                                                  // 0x5a65dd
        flag(0x200);
        const half = Math.trunc(prof() / 2);
        if (rand(half) === 0) addDisClub(g, p, club, true, rand);              // 0x547e70(staff, klub, 1)
        rand(half);                                                             // 0x547af0(staff, manager, 1): menneskets manager har ingen staffpost
        // 0x5a6633: formanden (club +0xbf) får spilleren som uven ved rand(formandens Temperament) = 0 – formanden er ingen person hos os
        if (sev === 1 && (rand(prof()) !== 0 || rand(2) !== 0)) return ok;     // 0x5a6660: en advarsel – ingen protest og ingen post
        const pk = p.id, myRep = curRep(p), crep = clubRepMem(g, club);
        for (const t of squad(club)) {                                          // 0x5a6691: truppens 50 pladser (club +0xd7)
          if (t === p) continue;
          let bl = sh(t, 'loyalty');                                      // holdkammeratens Loyalty (+0x59)
          if (curRep(t) + 1250 < myRep) bl = bl > 5 ? bl - 2 : bl - 1;
          if (myRep > 3250 && myRep > crep) bl = bl > 5 ? bl - 2 : bl === 0 ? 0 : bl - 1;
          let protest: boolean;
          if (favoursPerson(t, pk)) {                                           // 0x547810: holdkammeraten holder af ham
            if (bl > 15) protest = true;
            else { bl = bl > 5 ? bl - 2 : bl === 0 ? 0 : bl - 1; protest = bl === 0 || rand(bl) === 0; }
          } else protest = bl === 0 || rand(bl) === 0;
          if (!protest) continue;
          const tc = cmContractOf(t);
          withFlagCtx(g, t, rand, () => cmFlagSet(tc, 0x400));
          if (first) { fineNews(g, p, why, 1, sev, 0, rand); first = false; }
          rand(sh(t, 'professionalism'));                                       // 0x547af0(holdkammerat, manager, 1) – mennesket
        }
      }
      // 0x5a686a: klagen 0x20, rand(Pressure) = 0 og Loyalty < 10 → han udebliver
      if (c.b45 & 0x20 && rand(pres()) === 0 && loy() < 10) goAwol(g, p, rand);
    }
    // 0x5a6897: stjernens tvist
    if (star(3250) && s8(sh(p, 'ambition')) > 10 && prof() < 10 && loy() < 10 && temp() < 10 && c.b45 !== 0 && s8(c.b44) < -25
      && wantsToLeave({ id: p.id, loy: loy(), pres: pres(), prof: prof(), temp: temp(), amb: sh(p, 'ambition'), repCur: curRep(p), b40: 0 }, c)
      && (why === 0 || rand(loy()) === 0)) dispute(3);
  }
  // 0x5a6930: posten {staff, grund, fortjent, i dag + 7·sev}
  stateOf(g).recs.push({ pid: p.id, why, ok: ok ? 1 : 0, until: addDays(g.date, 7 * sev) });
  return ok;
}

/** 0x5a5820 (dagligt fra 0x5cccd0, før 0x5d6d10): den første udløbne post fjernes; den første forfaldne trænerrapport sendes (træneren har været
 *  i klubben over 30 dage og er ikke skadet – 0x5a7f20) og fjernes */
export function cmFineDaily(g: GameState): void {
  if (!cmActive(g) || !g.cmFine) return;
  const F = g.cmFine, today = dayNum(g.date);
  const i = F.recs.findIndex((r) => dayNum(r.until) < today);
  if (i >= 0) F.recs.splice(i, 1);
  const j = F.coach.findIndex((r) => dayNum(r.due) < today);
  if (j < 0) return;
  const e = F.coach.splice(j, 1)[0];
  const s = g.staff[e.coach], p = g.players[e.pid];
  if (!s || !p || !p.club || s.club !== p.club) return;
  if (s.cmJoined && today - dayNum(s.cmJoined) <= 30) return;
  // 0x5a8090: brødteksten efter flaget (1 → p9 = rand(5): 0 motivere, 1 den rette virkning, ellers fokus; 2 → presset). Overskriften læser
  // p14, som 0x5a7f20 ikke sætter – her efter flaget (*estimeret*)
  const r = cmRand(g.seed ?? 0, p.id, today, 0x5a7f20)(5);
  const body = e.flag === 1 ? (r === 0 ? 'coachMotivate' : r === 1 ? 'coachEffect' : 'coachFocus') : 'coachPressure';
  asOwner(p.club, () => addNews({ cat: 'general', key: e.flag === 1 ? 'cmfine.coachPleased' : 'cmfine.coachPressure',
    params: { coach: `${s.first} ${s.last}`.trim(), coachLast: s.last, player: pname(p), last: p.last, body }, link: { kind: 'player', id: p.id } }));
}

/** 0x5a5930 (fra 0x6a3770 set_season_expectations): klubbens tæller halveres */
export function cmFineSeasonHalve(g: GameState, club: number): void {
  const n = g.cmFine?.count[club];
  if (n) g.cmFine!.count[club] = Math.trunc(s8(n) * 0.5);
}
/** 0x5a5960 (fra 0x69b790 remove_club_manager): klubbens tæller nulstilles */
export function cmFineReset(g: GameState, club: number): void {
  if (g.cmFine?.count[club]) g.cmFine.count[club] = 0;
}
