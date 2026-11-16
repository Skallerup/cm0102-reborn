// Karantæner og appel som i CM 01/02 – discipline.cpp + rb_*.cpp (RulingBody) og manager_manager.cpp i cm0102.exe 3.9.68
// (disassembleret med ~/cm0102-engine/tools/cmdis.py 16/11-2026; noter i ~/cm0102-engine/notes/discipline.md).
// Kun den originale database i ægte tilstand (cmActive) – det udvidede spil og 2026/27 bruger sim.ts' egen model som før.
//
//   0x6b5f00 (kampdagen) → Discipline::process_match 0x55ca00: turneringens disciplinærorgan (comp +0x50) → RulingBody 0x7e7ff0(kamp, 1, 1, 1);
//            venskabskampe og minturneringer (0x5c6710, comp ≥ [0xae2378] − 0x7f) → hvert holds LIGA-organ med (1,0,0)/(0,1,0) og
//            UDEN afsoning; en turnering uden organ (+0x50 = 0xff) → intet.
//   0x7e7ff0 afsoning først (0x556e90 for alle klubbens 50 pladser, kun når afsoning er slået til), så kortene pr. spiller: overfald på
//            dommeren (kode 12, 0x55e300) altid; i venskabskampe ellers intet (kun reservekampe [0x9cf684] med lige rødt og kode ≥ 10);
//            ellers organets vtbl+8: England 0x7dd010, Europa 0x7dd450.
//   0x7dd010 England: 5/10/15 advarsler (5 kun før 1/3, 10 kun før dagen efter 2. søndag i april – året efter sæsonstarten; derefter
//            (antal % 5 + 1)·5), rødt kort 1 kamp + 2 (kode ≥ 9) / + 3 (kode 12) + sæsonens tidligere røde; start om 14 dage; omfang [9].
//   0x7dd450 Europa: rødt 1 kamp, hver 3. kamp med advarsel 1 kamp; start i dag; omfang [·, 1].
//   0x556940 add_ban: findes der allerede en karantæne i et af omfangets organer, forlænges den (kampe/dage lægges til, bit 0 "further").
//   0x556e90 update_ban_progress: kamp tæller når startdatoen er nået; tidsbegrænset slutter på datoen. 0x7e85b0 er han udelukket?
//            (organ 0 først, så turneringens organ – venskabskampe har intet organ, så kun verdensomspændende karantæner gælder dér).
//   0x557280 nyheden 0x7d2 (felterne) → kun til spillerens klub (0x7875e0), lange karantæner (> 50 dage) til alle ved omdømme > 8000.
//   0x5576e0 nyhedens tekst: overskrift "banned for one match"/"N matches"/"<længde>" (0x7e5780), brødteksten efter grund (0 point,
//            1 advarsler, 2 rødt kort, 3 misconduct, 4 advarsler i træk), "further"/"starting on the …"/uden dato, og til sidst
//            "You have appealed against this decision …", når nyhedens felt 0 er sat.
//   0x7e7ed0 sæsonstart: tællerne nulstilles, karantæner ældre end 2 år (4 for det internationale organ) slettes – resten fortsætter.
//   Appel: knappen "Appeal" (0x782b70 → 0x55e620) på karantænenyheden, når den ikke er appelleret, grunden er rødt kort/misconduct
//            (ikke 0, 1, 4), bit 1 ikke er sat (overfald) og nyheden er fra i dag eller karantænen ikke er begyndt; bekræftelsen 0x55ea10
//            "Appeal against the N game ban that has been placed on X" → Yes 0x55ed00 → 0x6ab800 (afgørelsen træffes NU, svaret kommer om
//            2 dage) → 0x6abef0 dagligt → 0x557000 (karantænen) + nyheden 0x178a (0x6ac060/0x6ac190: "FA dismiss ban appeal" /
//            "FA reduce X's ban" / "FA revoke X's ban").
//
// Estimeret (ikke fundet i koden): kamppostens +0x48 (bit 2 i karantænen; antaget 0 → "a2" = 1 i appellen), dommerens værdi 0x79d3b0
// (antaget ≤ 6), klubbens medieværdi [0xae2d14]+4 (antaget 0), øvrige landes organer (vtbl+8 ikke læst: hver N. kamp med advarsel efter
// sweep-tabellen, rødt 1 kamp, start næste dag), sæsonslut for overfaldets 90/180 dage (klubbens sidste ligakamp), fixture +0x2c = sæsonens år.
// Ikke porteret: point-systemerne (Danmark, Skotland, Nordirland, USA), karantæner ved klubskifte (0x556270/0x5563f0), mediehistorierne
// 0x758de0, reservekampenes regel (reservekampene spilles ikke gennem applyMatchResult).

import type { Fixture, GameState, MatchReport, NewsItem, Player, PlayerMatchLine } from './types';
import { addDays } from './dates';
import { addNews, squad } from './state';
import { asOwner, isHumanClub } from './humans';
import { cmActive, cmRand, clubRepMem } from './cmPlayerData';
import { ATTRS } from './attributes';

/** 20-byte posten (0x556c70): +0 kampe (−1 = tidsbegrænset), +1 afsonet, +2 dage, +4 start, +0xc omfang (4 organer, −1 = intet),
 *  +0x10 grund, +0x11 antal (advarsler/point), +0x13 bit 0 forlænget, bit 1 (overfald – kan ikke appelleres), bit 2 (kampposten +0x48 = 0) */
export interface CmBan { rb: number[]; m: number; s: number; d: number; st: string; why: number; n: number; f: number }
/** appellen (0x6ab800's post, 0x19 bytes): afgørelsen D (0 afvist, 1 ophævet, 2 nedsat), dato for svaret, nedsættelsen */
export interface CmAppeal { pid: number; D: number; due: string; rb: number[]; ext: number; m: number; d: number; resM: number; resD: number; why: number }
export interface CmDiscState {
  /** spiller → karantæner */
  bans: Record<number, CmBan[]>;
  /** spiller → organ → [advarsler (+4), røde (+5)] – organets 14-byte post */
  ent: Record<number, Record<number, [number, number]>>;
  appeals: CmAppeal[];
  /** MANAGER_MANAGER's klubpost +0x40 >> 3: antal appeller */
  clubAp: Record<number, number>;
}
const st = (g: GameState): CmDiscState => (g.cmDisc ??= { bans: {}, ent: {}, appeals: [], clubAp: {} });

export const cmDiscOn = (g: GameState) => cmActive(g) && !g.draft;

const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const isoOf = (n: number) => new Date(n * 86400000).toISOString().slice(0, 10);
const u8 = (v: number) => v & 0xff;
const s8 = (v: number) => (v << 24) >> 24;
const AI = (k: string) => ATTRS.indexOf(k as never);
const attr = (p: Player, k: string) => s8(Math.round(p.attrs[AI(k)] || 10));

// ---------------------------------------------------------------- organerne

/** de 43 organers id'er (comp +0x50, sweep-rulebooks Appendix A): [liga, pokal] pr. land; −1 = intet organ (ingen karantæner) */
const NATION_RB: Record<string, [number, number]> = {
  Argentina: [3, 3], Australia: [0x22, 0x22], Belgium: [4, 5], Brazil: [6, 7], Croatia: [0x21, 0x21], Denmark: [8, 8], England: [9, 9],
  Finland: [0xa, 0xb], France: [0xc, 0xc], Germany: [0xd, 0xe], Greece: [0x20, 0x20], Holland: [0xf, 0xf], 'Republic of Ireland': [0x10, 0x10],
  Italy: [0x11, 0x12], Japan: [0x13, 0x14], 'South Korea': [0x2a, 0x2a], 'Northern Ireland': [0x24, 0x24], Norway: [0x15, 0x16],
  Poland: [0x1f, 0x1f], Portugal: [0x17, 0x17], Russia: [0x27, 0x27], Scotland: [0x18, 0x19], Spain: [0x1a, 0x1b], Sweden: [0x1c, 0x1d],
  Turkey: [0x25, 0x26], 'United States': [0x1e, 0x1e], Wales: [0x28, 0x28],
};
/** hver N. kamp med advarsel (vtbl+0x14, sweep §2.2) for organerne, hvis vtbl+8 ikke er læst – se listen over gæt øverst */
const EVERY: Record<number, number> = {
  4: 3, 5: 3, 6: 3, 7: 3, 0x21: 3, 0xa: 3, 0xb: 3, 0x20: 3, 0x13: 3, 3: 5, 0xd: 5, 0xe: 5, 0x1a: 5, 0x28: 5, 0x12: 2, 0x1b: 2, 0x14: 2,
  0x25: 4, 0x26: 4, 0x27: 4, 0xf: 3, 0x10: 5, 0x11: 4, 0x1f: 4, 0x15: 3, 0x16: 2, 0x17: 5, 0x1c: 3, 0x1d: 3, 0x2a: 3,
};
/** organets nation (+0x17) – til nyhedens omfang ("English matches") */
function rbNation(g: GameState, rb: number): number {
  for (const [name, ids] of Object.entries(NATION_RB)) if (ids.includes(rb)) return g.nations.findIndex((n) => n.name === name);
  return -1;
}

/** turneringens organ (comp +0x50): Europas turneringer 1, landets liga/pokal; −1 = intet */
export function rbOfComp(g: GameState, compId: string): number {
  const c = g.comps[compId];
  if (!c) return -1;
  if (c.type === 'continental' || c.nation < 0) return 1;
  const ids = NATION_RB[g.nations[c.nation]?.name ?? ''];
  if (!ids) return -1;
  return c.type === 'cup' ? ids[1] : ids[0];
}
/** klubbens liga-organ (venskabskampene, 0x55ca65: club +0x57 → comp +0x50) */
function leagueRb(g: GameState, club: number): number {
  const lg = g.clubs[club]?.league;
  return lg ? rbOfComp(g, lg) : -1;
}
const isFriendly = (g: GameState, f: Fixture) => !g.comps[f.comp] || f.comp === 'FRIENDLY' || f.comp.startsWith('FR');

// ---------------------------------------------------------------- posterne

function entry(g: GameState, pid: number, rb: number): [number, number] {
  const e = (st(g).ent[pid] ??= {});
  return (e[rb] ??= [0, 0]);
}
function banIn(g: GameState, pid: number, rb: number): CmBan | undefined {
  return st(g).bans[pid]?.find((b) => b.rb.includes(rb));
}
function release(g: GameState, pid: number, ban: CmBan) {
  const l = st(g).bans[pid];
  if (!l) return;
  const i = l.indexOf(ban);
  if (i >= 0) l.splice(i, 1);
  if (!l.length) delete st(g).bans[pid];
}

/** 0x556940 add_ban: en eksisterende karantæne i et af omfangets organer forlænges (bit 0 på begge), ellers en ny post */
function addBan(g: GameState, p: Player, ban: CmBan): CmBan {
  for (const rb of ban.rb) {
    if (rb < 0) continue;
    const old = banIn(g, p.id, rb);
    if (old) {
      if (old.m !== -1 && ban.m !== -1) old.m += ban.m; else old.d += ban.d;
      old.f |= 1; ban.f |= 1;
      return ban;
    }
  }
  ban.f &= ~1;
  (st(g).bans[p.id] ??= []).push(ban);
  return ban;
}

/** 0x556e90 update_ban_progress(staff, organ, tæl): kampen tæller fra startdatoen; tidsbegrænsede slutter på start + dage */
function progress(g: GameState, p: Player, rb: number, count: boolean) {
  const b = banIn(g, p.id, rb);
  if (!b) return;
  const today = dayNum(g.date);
  if (b.m !== -1) {
    if (today < dayNum(b.st) || !count) return;
    b.s++;
    if (b.s >= b.m) release(g, p.id, b);
  } else if (today >= dayNum(b.st) + b.d) release(g, p.id, b);
}

/** 0x7e85b0 (organ 0 først, så turneringens): resterende kampe (1 for en tidsbegrænset), 0 = må spille */
export function cmBanLeft(g: GameState, p: Player, rb: number): number {
  const l = st(g).bans[p.id];
  if (!l) return 0;
  const today = dayNum(g.date);
  let n = 0;
  for (const b of [...l]) {
    if (!(b.rb.includes(0) || (rb >= 0 && b.rb.includes(rb)))) continue;
    if (b.m === -1 && today >= dayNum(b.st) + b.d) { release(g, p.id, b); continue; }
    if (today < dayNum(b.st)) continue;
    n = Math.max(n, b.m === -1 ? 1 : b.m - b.s);
  }
  return n;
}

/** spillerens karantæner (til spillerprofilen/tests) */
export const cmBansOf = (g: GameState, pid: number): CmBan[] => st(g).bans[pid] ?? [];

// ---------------------------------------------------------------- kortene

interface Card { yel: number; red: boolean; codes: [number, number] }
function cardOf(line: PlayerMatchLine): Card {
  // kampposten +0x2c gule (2 = udvist for andet gule), +0x2d rødt, +0x2e/+0x2f kortenes koder (zonemotoren kender ikke koderne: 0xff)
  const yel = Math.max(0, Math.min(2, line.cy ?? Number(line.yellow ?? 0)));
  return { yel, red: !!line.red, codes: line.cw ?? [0xff, 0xff] };
}

/** dagen (iso) efter anden søndag i april (0x7dd088–0x7dd0c7: tæl søndage fra 1/4, læg 1 dag til efter hver dag) */
function afterSecondSundayApril(y: number): string {
  let d = dayNum(`${y}-04-01`), sundays = 0;
  while (sundays < 2) { if (new Date(d * 86400000).getUTCDay() === 0) sundays++; d++; }
  return isoOf(d);
}

/** 0x7dd010 England (organ 9) */
function englandCards(g: GameState, p: Player, c: Card, f: Fixture): CmBan | null {
  if (!c.yel && !c.red) return null;
  const y = g.season;                                    // fixture +0x2c (se listen over gæt øverst) + 1 = året for afskæringsdatoerne
  const date = dayNum(f.date);
  const cut5 = dayNum(`${y + 1}-03-01`), cut10 = dayNum(afterSecondSundayApril(y + 1));
  const e = entry(g, p.id, 9);
  let bl = 0, why = -1, n = 0;
  if (c.yel) {
    const cnt = e[0];
    const thr = cnt < 5 ? 5 : cnt < 10 ? 10 : cnt < 15 ? 15 : s8(((cnt % 5) + 1) * 5);
    const now = u8(cnt + c.yel);
    e[0] = now;
    if (now >= thr && (thr === 5 ? date < cut5 : thr === 10 ? date < cut10 : thr > 10)) { why = 1; bl = Math.trunc(thr / 5); n = now; }
  }
  if (c.red) {
    const code = c.yel === 0 ? c.codes[0] : c.yel === 1 ? c.codes[1] : 0xff;
    bl++;
    if (code !== 0xff) { if (code === 12) bl += 3; else if (code >= 9) bl += 2; }
    bl += e[1];
    e[1] = u8(e[1] + 1);
    why = 2; n = 1;
  }
  if (!bl) return null;
  return { rb: [9, -1, -1, -1], m: bl, s: 0, d: -1, st: addDays(g.date, 14), why, n, f: 4 };
}

/** 0x7dd450 Europa (organ 1): rødt 1 kamp; hver 3. kamp med advarsel 1 kamp (grunden bliver 1) */
function europeCards(g: GameState, p: Player, c: Card): CmBan | null {
  if (!c.yel && !c.red) return null;
  const e = entry(g, p.id, 1);
  let bl = 0, why = -1, n = 0;
  if (c.red) { bl = 1; why = 2; n = 1; }
  if (c.yel > 0) { e[0] = u8(e[0] + 1); if (e[0] % 3 === 0) { bl++; why = 1; n = c.yel; } }
  if (!bl) return null;
  return { rb: [-1, 1, -1, -1], m: bl, s: 0, d: -1, st: g.date, why, n, f: 4 };
}

/** de øvrige organer: som Europa med organets N og start næste dag (se listen over gæt øverst) */
function otherCards(g: GameState, p: Player, c: Card, rb: number): CmBan | null {
  if (!c.yel && !c.red) return null;
  const e = entry(g, p.id, rb);
  let bl = 0, why = -1, n = 0;
  if (c.red) { bl = 1 + e[1]; e[1] = u8(e[1] + 1); why = 2; n = 1; }
  if (c.yel > 0) { e[0] = u8(e[0] + 1); if (e[0] % (EVERY[rb] ?? 5) === 0) { bl++; if (why < 0) { why = 1; n = e[0]; } } }
  if (!bl) return null;
  return { rb: [rb, -1, -1, -1], m: bl, s: 0, d: -1, st: addDays(g.date, 1), why, n, f: 4 };
}

/** 0x55e300: overfald på dommeren (kode 12) – alle karantæner slettes, 90 dage (180 når sæsonen slutter om under 80 dage), hele verden */
function assault(g: GameState, p: Player, c: Card): CmBan | null {
  if (c.codes[0] !== 12 && c.codes[1] !== 12) return null;
  for (const b of [...(st(g).bans[p.id] ?? [])]) release(g, p.id, b);
  const lg = g.clubs[p.club]?.league;
  let last = '';
  if (lg) for (const f of Object.values(g.fixtures)) if (f.comp === lg && f.date > last) last = f.date;
  const days = last && dayNum(last) - dayNum(g.date) < 80 ? 180 : 90;
  return { rb: [-1, -1, -1, 0], m: -1, s: 0, d: days, st: g.date, why: 3, n: 0, f: 2 | 4 };
}

// ---------------------------------------------------------------- kampen

/** Discipline::process_match 0x55ca00 + RulingBody 0x7e7ff0 for kampen (efter tabellen, før konditionsmodulet) */
export function cmDiscAfterMatch(g: GameState, f: Fixture, rep: MatchReport) {
  if (!cmDiscOn(g)) return;
  const sides = [f.home, f.away];
  const friendly = isFriendly(g, f);
  const run = (rb: number, which: boolean[], serve: boolean) => {
    // afsoning (0x7e80a6/0x7e814c): alle klubbens spillere – før kortene, så kampens nye karantæne ikke tæller
    if (serve) for (let t = 0; t < 2; t++) if (which[t]) for (const p of squad(sides[t])) progress(g, p, rb, true);
    for (const line of rep.players) {
      if (!which[line.team]) continue;
      const p = g.players[line.id];
      if (!p || p.virtual) continue;
      const c = cardOf(line);
      let ban = assault(g, p, c);
      if (!ban) {
        if (friendly) continue;                                                // 0x7e8270: venskabskamp – ingen kort tæller
        ban = rb === 9 ? englandCards(g, p, c, f) : rb === 1 ? europeCards(g, p, c) : otherCards(g, p, c, rb);
      }
      if (!ban) continue;
      addBan(g, p, ban);
      postBanNews(g, p, ban, f, rep, line.team);
    }
  };
  if (!friendly) {
    const rb = rbOfComp(g, f.comp);
    if (rb >= 0) run(rb, [true, true], true);
  } else {
    // 0x55ca65: hvert holds liga-organ, kun eget hold, ingen afsoning
    for (let t = 0; t < 2; t++) { const rb = leagueRb(g, sides[t]); if (rb >= 0) run(rb, [t === 0, t === 1], false); }
  }
}

/** 0x557280 + 0x5576e0's felter: nyheden til spillerens klub (0x7875e0); lange karantæner (> 50 dage) til alle ved verdensomdømme > 8000 */
function postBanNews(g: GameState, p: Player, ban: CmBan, f: Fixture, rep: MatchReport, team: number) {
  const [hg, ag] = [rep.stats[0].goals, rep.stats[1].goals];
  const gf = team === 0 ? hg : ag, ga = team === 0 ? ag : hg;
  const opp = team === 0 ? f.away : f.home;
  const nat = ban.rb.find((r) => r >= 0) ?? -1;
  const params: Record<string, string | number> = {
    player: `${p.first} ${p.last}`.trim(), pid: p.id, m: ban.m, d: ban.d, st: dayNum(ban.st) > dayNum(g.date) ? ban.st : '', why: ban.why, n: ban.n,
    f: ban.f, rb: nat, scn: nat === 1 ? 'EUR' : String(rbNation(g, nat)), club: g.clubs[p.club]?.name ?? '', opp: g.clubs[opp]?.name ?? '',
    home: g.clubs[f.home]?.name ?? '', away: g.clubs[f.away]?.name ?? '', gf, ga,
  };
  const key = ban.m === -1 ? 'cmban.hD' : ban.m === 1 ? 'cmban.h1' : 'cmban.hN';
  (p.banLog ??= []).push({ d: g.date, n: ban.m === -1 ? 1 : ban.m, red: ban.why === 2 || ban.why === 3 });
  if (p.banLog.length > 30) p.banLog.shift();
  const news = { cat: 'injury' as const, key, params, link: { kind: 'player' as const, id: p.id } };
  if (ban.d > 50 && worldRep(p) > 8000) { addNews(news, { all: true }); return; }
  if (isHumanClub(p.club)) asOwner(p.club, () => addNews(news));
}
const worldRep = (p: Player) => Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[2] * 50);

/** p.banned i spillet = det, der gælder for klubbens næste kamp (venskabskamp: kun organ 0) – én gennemgang af kampprogrammet for alle klubberne */
function nextComps(g: GameState, clubs: Set<number>): Map<number, string> {
  const best = new Map<number, Fixture>();
  for (const f of Object.values(g.fixtures)) {
    if (f.result || f.date < g.date) continue;
    for (const c of [f.home, f.away]) if (clubs.has(c)) { const b = best.get(c); if (!b || f.date < b.date) best.set(c, f); }
  }
  return new Map([...best].map(([c, f]) => [c, f.comp]));
}
function syncPlayer(g: GameState, p: Player, comp: string | null) {
  const rb = comp === null ? leagueRb(g, p.club) : isFriendlyComp(g, comp) ? -1 : rbOfComp(g, comp);
  p.banned = cmBanLeft(g, p, rb);
}
const isFriendlyComp = (g: GameState, c: string) => !g.comps[c] || c === 'FRIENDLY' || c.startsWith('FR');
function cmBanSyncClubs(g: GameState, clubs: Set<number>) {
  if (!clubs.size) return;
  const next = nextComps(g, clubs);
  for (const club of clubs) for (const p of squad(club)) if (st(g).bans[p.id] || p.banned > 0) syncPlayer(g, p, next.get(club) ?? null);
}
/** før en kamp (prepareMatch): udelukkelsen for netop denne turnering */
export function cmBanPreMatch(g: GameState, f: Fixture) {
  if (!cmDiscOn(g)) return;
  for (const club of [f.home, f.away]) for (const p of squad(club)) if (st(g).bans[p.id] || p.banned > 0) syncPlayer(g, p, f.comp);
}

// ---------------------------------------------------------------- dagligt og sæsonen

/** dagligt: appellernes svar (0x6abef0) og p.banned efter klubbens næste kamp */
export function cmDiscDaily(g: GameState) {
  if (!cmDiscOn(g)) return;
  const s = st(g);
  if (s.appeals.length) {
    const today = dayNum(g.date);
    for (const a of [...s.appeals]) {
      if (dayNum(a.due) > today) continue;
      s.appeals.splice(s.appeals.indexOf(a), 1);
      const p = g.players[a.pid];
      if (!p) continue;
      if (a.D !== 0) for (const rb of a.rb) if (rb >= 0) applyAppeal(g, p, rb, a);
      appealNews(g, p, a);
    }
  }
  const clubs = new Set<number>();
  for (const pid of Object.keys(s.bans)) { const p = g.players[Number(pid)]; if (p?.club) clubs.add(p.club); }
  cmBanSyncClubs(g, clubs);
}

/** 0x7e7ed0 (sæsonstart): tællerne nulstilles; karantæner, der begyndte for 2+ år siden (4 for organ 0), slettes */
export function cmDiscSeason(g: GameState) {
  if (!cmDiscOn(g)) return;
  const s = st(g);
  s.ent = {};
  const year = Number(g.date.slice(0, 4));
  for (const [pid, l] of Object.entries(s.bans)) {
    for (const b of [...l]) if (year - Number(b.st.slice(0, 4)) >= (b.rb.includes(0) && b.rb.every((r) => r <= 0) ? 4 : 2)) l.splice(l.indexOf(b), 1);
    if (!l.length) delete s.bans[Number(pid)];
  }
  for (const pid of Object.keys(s.bans)) { const p = g.players[Number(pid)]; if (p) syncPlayer(g, p, null); }
}

// ---------------------------------------------------------------- appellen

/** 0x782b70: knappen "Appeal" på karantænenyheden (0x7d2/0x7d3) */
export function cmAppealOpen(g: GameState, n: NewsItem | undefined): boolean {
  if (!n || !n.key.startsWith('cmban.h') || !cmDiscOn(g)) return false;
  const P = n.params;
  if (P.appealed) return false;
  const why = Number(P.why);
  if (why === 0 || why === 1 || why === 4) return false;
  if (Number(P.f) & 2) return false;
  const p = g.players[Number(P.pid)];
  if (!p || p.club !== g.userClub) return false;
  const start = String(P.st ?? '');
  return n.date === g.date || (!!start && start > g.date);
}

/** bekræftelsen 0x55ea10: "Appeal against the 3 game ban that has been placed on X" */
export function cmAppealAsk(n: NewsItem): { key: string; n: number; player: string } {
  const m = Number(n.params.m), d = Number(n.params.d), player = String(n.params.player);
  return m > 0 ? { key: 'cmban.ask.games', n: m, player } : d > 0 ? { key: 'cmban.ask.days', n: d, player } : { key: 'cmban.ask', n: 0, player };
}

/** Yes (0x55ed00 → 0x6ab800): afgørelsen og svardatoen (i dag + 2). Felt 0 i nyheden sættes (0x786d30). */
export function cmAppeal(g: GameState, newsId: number): boolean {
  const n = g.news.find((x) => x.id === newsId);
  if (!n || !cmAppealOpen(g, n)) return false;
  const p = g.players[Number(n.params.pid)];
  const ban = st(g).bans[p.id]?.find((b) => b.rb.includes(Number(n.params.rb))) ?? null;
  const rec = decide(g, p, {
    a2: (Number(n.params.f) & 4) !== 0, ext: Number(n.params.f) & 1, m: Number(n.params.m), d: Number(n.params.d), why: Number(n.params.why),
    rb: ban?.rb ?? [Number(n.params.rb), -1, -1, -1],
  });
  st(g).appeals.push(rec);
  n.params.appealed = 1;
  return true;
}

interface AppealIn { a2: boolean; ext: number; m: number; d: number; why: number; rb: number[] }
/** 0x6ab800 MANAGER_MANAGER: FA'ens afgørelse (0 afvist, 1 ophævet, 2 nedsat) – svaret om 2 dage */
function decide(g: GameState, p: Player, a: AppealIn): CmAppeal {
  const rand = cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x6ab800);
  const base = { pid: p.id, due: addDays(g.date, 2), rb: a.rb, ext: a.ext, m: a.m, d: a.d, why: a.why };
  const done = (D: number, resM = -1, resD = -1): CmAppeal => ({ ...base, D, resM, resD });
  const club = g.clubs[p.club];
  if (!club) return done(0);
  const mgr = mgrRep(g, p.club);
  if (mgr === null) return done(0);                                            // 0x6abe48: ingen manager (+0xcf / +0x69)
  const clubRep = clubRepMem(g, p.club);
  let D = 1;
  // [0xb74340] 0x79d3b0(dommeren) > 6 → straks afvist ved a2 – dommerens værdi er antaget ≤ 6 (listen over gæt øverst)
  if (a.a2) D = 0;
  let L = clubRep > 6750 ? 7 : clubRep > 4250 ? 5 : clubRep > 2000 ? 3 : 2;
  if (mgr > 6750) L += 3; else if (mgr > 4250) L += 1;
  const ap = st(g).clubAp;
  const n = ap[p.club] ?? 0;
  const media = 0;                                                             // [0xae2d14][klub]+4 (listen over gæt øverst)
  let story = false;
  if (n > 3) {
    if (media < -3 && rand(5) === 0) story = true;
    else if (n > 5 && rand(5) === 0) story = true;
    else if (media > -1 && rand(5) === 0) story = true;
  }
  // 0x6aba11: for mange appeller ("har allerede brugt deres tid") – afvist, tælleren røres ikke
  if (n >= L && a.a2 && rand(10000) > clubRep) return done(0);
  if (a.why === 3) D = 0;
  if (!story) rand(1000);                                                      // 0x758de0(…, 0) – mediehistorien er ikke porteret
  if (n < 32) ap[p.club] = n + 1;
  const X = Math.trunc((clubRep + mgr) * 0.5);
  const dirt = attr(p, 'dirtiness'), aggr = attr(p, 'aggression'), prof = attr(p, 'professionalism');
  let Y = dirt + aggr - prof;
  if (worldRep(p) > 5250) Y = Math.trunc(Y * 1.5);
  const Z = X - 125 * Y;
  if (Z > 6250) { if (rand(3) === 0) D = 0; } else if (Z > 3250) { if (rand(20) !== 0) D = 0; } else if (rand(50) !== 0) D = 0;
  const nat = g.nations[club.nation]?.name ?? '';
  if (nat === 'Greece' || nat === 'Australia') D = 0;
  let resM = -1, resD = -1;
  if (a.why !== 3 && D === 0) {
    let W = 10 * (aggr * aggr - prof * prof + dirt * dirt);
    if (!a.a2) W -= 6000;
    const n2 = ap[p.club] ?? 0;
    if (!['Argentina', 'France', 'Croatia'].includes(nat) && a.d > 60) {     // 0x5487d0
      if (clubRep > rand(10000) + W + 3250) { D = 2; const r = rand(5); resD = r === 0 ? 40 : r === 1 ? 30 : r === 2 ? 20 : 10; }
    } else if (nat !== 'Argentina') {                                          // 0x5487b0
      if (a.m > 3 && clubRep > rand(12500) + W + 3250) {
        D = 2;
        resM = nat === 'France' ? 1 : nat === 'Greece' ? rand(2) + 1 : a.m <= 5 ? 1 : rand(2) + 1;
      } else if (a.m > 2 && n2 < L && clubRep > rand(15000) + W + 4250) { D = 2; resM = 1; }
    }
  }
  if (a.why === 0 || a.why === 4 || story) { D = 0; resM = -1; resD = -1; }
  return done(D, resM, resD);
}

/** managerens omdømme (klub +0xcf → +0x69 → +0xa); null = ingen manager */
function mgrRep(g: GameState, club: number): number | null {
  const c = g.clubs[club];
  if (!c) return null;
  if (c.manager === -1) return (g.userClub === club ? g.manager : g.humans?.find((h) => h.userClub === club)?.manager ?? g.manager).cmRep?.[1] ?? 0;
  const s = c.manager > 0 ? g.staff[c.manager] : undefined;
  return s ? s.cmRep?.[1] ?? 0 : null;
}

/** 0x557000 apply_appeal_result: kampe/dage trækkes fra, eller karantænen ophæves (ved en forlænget kun den appellerede del) */
function applyAppeal(g: GameState, p: Player, rb: number, a: CmAppeal) {
  const b = banIn(g, p.id, rb);
  if (!b) return;
  if (b.m !== -1) {
    if (a.resM !== -1) { b.m -= a.resM; if (b.m <= b.s) release(g, p.id, b); }     // originalen: kun < 0 slettes (0 bliver stående)
    else if (a.ext) { b.m -= a.m; if (b.m <= b.s) release(g, p.id, b); }
    else release(g, p.id, b);
  } else if (a.resD !== -1 || a.ext) { b.d -= a.d; if (b.d <= 0) release(g, p.id, b); } // sic: hele den appellerede længde (+0x24), ikke nedsættelsen
  else release(g, p.id, b);
  cmBanSyncClubs(g, new Set([p.club]));
}

/** 0x6ac060: nyheden 0x178a til spillerens klub (felterne: spilleren, D, nationen, kampe, dage, grund) */
function appealNews(g: GameState, p: Player, a: CmAppeal) {
  const c = g.clubs[p.club];
  if (!c || !isHumanClub(p.club)) return;
  const key = a.D === 0 ? 'cmban.fa.dismiss' : a.resM === -1 && a.resD === -1 ? 'cmban.fa.revoke' : 'cmban.fa.reduce';
  asOwner(p.club, () => addNews({ cat: 'injury', key, params: { player: `${p.first} ${p.last}`.trim(), last: p.last, pid: p.id, D: a.D, nat: c.nation,
    resM: a.resM, resD: a.resD, why: a.why }, link: { kind: 'player', id: p.id } }));
}
