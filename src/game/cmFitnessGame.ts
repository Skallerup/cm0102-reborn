// Konditionsmodulet (cmFitness.ts – originalens injury.cpp) koblet til spillet: spilstarten, dagen, kampene og aflæsningerne.
// Kun den originale database i ægte tilstand (cmActive); ellers gør intet her noget, og spillets egen model (sim.ts) gælder.

import type { Fixture, GameState, MatchReport, Player } from './types';
import { cmActive } from './cmPlayerData';
import {
  applyMatchEffects, clearKnocks, condition, currentInjury, dayNum, fatigue, fitIso, fitRand, initRecords, initSquadFitness, injuryDaily,
  newFit, recordKnock, recoverFatigue, setKnockHook, syncPlayer, trainingLoad, updateFitness, type CmInjury, type FitCtx, type MatchEntry,
} from './cmFitness';
import { addNews, squad } from './state';
import { asOwner, isHumanClub } from './humans';
import { statCategory } from './cmPlayerData';

const pname = (p: Player) => `${p.first} ${p.last}`.trim();
/** modulet gælder: original DB i ægte tilstand, ikke draft-ligaen */
export const cmFitOn = (g: GameState) => cmActive(g) && !g.draft;

/** formålene for talrækken (en pr. kaldested, så rækkefølgen inden for et formål er originalens) */
const SALT = { daily: 1, recover: 2, match: 3, read: 4, init: 5, prerun: 6 } as const;

export function fitCtx(g: GameState, salt: number, today = dayNum(g.date)): FitCtx {
  return {
    g, today, rand: fitRand(g, today, salt),
    squadOf: (club) => squad(club),
    human: (club) => isHumanClub(club),
    news: (kind, p, inj) => injuryNews(g, kind, p, inj),
    retire: (p) => { p.cmRetire = true; },
  };
}

function injuryNews(g: GameState, kind: 'injury' | 'recovered', p: Player, inj: CmInjury): void {
  if (!p.club) return;
  const key = `cm${inj.t}`;
  if (kind === 'recovered') asOwner(p.club, () => addNews({ cat: 'injury', key: 'news.recovered', params: { player: pname(p), last: p.last, injury: key }, link: { kind: 'player', id: p.id } }));
  else asOwner(p.club, () => addNews({ cat: 'injury', key: 'injury.cmNew', params: { player: pname(p), injury: key, days: inj.w2a }, link: { kind: 'player', id: p.id } }));
  void g;
}

/** de rigtige spillere i "staff-tabellens" rækkefølge (id – heltalsnøgler kommer i stigende orden) */
function realPlayers(g: GameState): Player[] {
  return Object.values(g.players).filter((p) => !p.regen);
}

/** Nyt spil: Injury::Injury (0x62cf70) på databasens dato (1/1), dagene frem til spillets start (0x5cc850 kører 0x62b7b0 hver dag – uden
 *  kampe og uden 0x5ce2d0), så 0x62a920 på startdagen. */
export function cmFitNewGame(g: GameState): void {
  if (!cmFitOn(g)) return;
  g.cmFitStart = g.date;
  const ps = realPlayers(g);
  const start = dayNum(g.date);
  const db = dayNum(`${g.date.slice(0, 4)}-01-01`);
  setKnockHook(true);
  initRecords(fitCtx(g, SALT.init, db), ps);
  const staff = Object.keys(g.staff).length;
  for (let d = db + 1; d < start; d++) injuryDaily(fitCtx(g, SALT.prerun, d), ps, staff);
  const c = fitCtx(g, SALT.init, start);
  initSquadFitness(c, ps);
  for (const p of ps) { if (p.cmFit) p.cmFit.load = trainingLoad(p, !!p.club && isHumanClub(p.club)); syncPlayer(c, p); }
}

/** Dagen (sim.ts newDay): 0x62b7b0, så 0x5ce2d0's del – trætheden falder for alle (0x62c2f0) – og aflæsningerne: menneskets spillere
 *  (0x5cf226) og de skadede (deres status, så spillets udtagelse og skærme ser skaden). */
export function cmFitDay(g: GameState): void {
  if (!cmFitOn(g)) { setKnockHook(false); return; }
  setKnockHook(true);
  g.cmFitStart ??= g.date;
  const ps = realPlayers(g);
  const today = dayNum(g.date);
  for (const p of ps) p.cmFit ??= newFit(today);
  injuryDaily(fitCtx(g, SALT.daily), ps, Object.keys(g.staff).length);
  const rc = fitCtx(g, SALT.recover), rd = fitCtx(g, SALT.read);
  for (const p of ps) {
    recoverFatigue(rc, p);
    const human = !!p.club && isHumanClub(p.club);
    // +0x1e: 0x8b1750 – et menneskes spillere på standardskemaet, de andre 50 (sættes, når spilleren forlader menneskets klub)
    const load = trainingLoad(p, human);
    if (p.cmFit && p.cmFit.load !== load) p.cmFit.load = load;
    if (human || p.cmFit?.inj || p.injury) syncPlayer(rd, p);
  }
}

/** før kampen: holdenes spillere læses (0x62c590 i 0x6e2f20 og MATCH_PLAYER::setup 0x6eb026) – kondition og skade til begge motorer */
export function cmFitPreMatch(g: GameState, clubs: number[]): void {
  if (!cmFitOn(g)) return;
  setKnockHook(true);
  const c = fitCtx(g, SALT.read);
  for (const club of clubs) for (const p of squad(club)) syncPlayer(c, p);
}

/** aflæsningen (0x62c590/0x62c400) for bestemte spillere – fx et landsholds trup før kampen */
export function cmFitSync(g: GameState, ps: Player[]): void {
  if (!cmFitOn(g)) return;
  const c = fitCtx(g, SALT.read);
  for (const p of ps) syncPlayer(c, p);
}

/** kamptrupperne (de 11 + bænken) pr. klub – sat før kampen (sim.ts prepareMatch og computerens udtagelse aiTeam.ts) */
const matchSquads = new Map<number, number[]>();
export function setMatchSquad(club: number, ids: number[]): void { matchSquads.set(club, ids); }

/** efter kampen (sim.ts applyMatchResult): 0x62c080 for begge hold – kampkonditionen, trætheden og skaderne af kampens knocks.
 *  Zonemotorens kampe har ingen knockliste: en skadet spiller får en knock med gittermotorens kategori/sværhed (*estimeret*). */
export function cmFitAfterMatch(g: GameState, f: Fixture, rep: MatchReport): boolean {
  if (!cmFitOn(g)) return false;
  cmFitMatch(g, rep, statCategory(g, f) !== 1, f.id, [f.home, f.away]);
  return true;
}

/** 0x62c080 for en kamp uden for klubkampene (landskampe international.ts, venskabskampe friendlies.ts): ingen ubrugte udskiftere kendt
 *  (`clubs` udelades), venskabskampe tæller halvt. Spillets egen træthed/skade for de kampe springes over i ægte tilstand. */
export function cmFitMatch(g: GameState, rep: MatchReport, competitive: boolean, fixture: number, clubs?: [number, number]): void {
  if (!cmFitOn(g)) return;
  const c = fitCtx(g, SALT.match);
  if (rep.engine !== 'original') {
    for (const line of rep.players) if (line.injured) {
      let sev = c.rand(c.rand(102)); if (sev > 50 && c.rand(3) !== 0) sev = c.rand(c.rand(76));
      recordKnock(line.id, 1 + c.rand(9), sev, () => true);
    }
  }
  const entries: MatchEntry[] = [];
  for (const team of [0, 1]) {
    const lines = rep.players.filter((l) => l.team === team);
    const seen = new Set(lines.map((l) => l.id));
    for (const l of lines) {
      const p = g.players[l.id]; if (!p) continue;
      entries.push({ p, starter: !l.sub, minutes: Math.max(0, l.minutes), cond: Math.round(l.cond * 100), hurt: l.injured });
    }
    // ubrugte udskiftere (k ≥ 11, +0x32 = 0xff): 0 minutter, konditionen som ved kampstart
    const club = clubs?.[team];
    if (club === undefined) continue;
    for (const id of matchSquads.get(club) ?? []) {
      const p = g.players[id];
      if (!p || seen.has(id)) continue;
      entries.push({ p, starter: false, minutes: 0, cond: condition(c, p), hurt: false });
    }
    matchSquads.delete(club);
  }
  applyMatchEffects(c, entries, competitive, fixture);
  clearKnocks();
  const rd = fitCtx(g, SALT.read);
  for (const e of entries) syncPlayer(rd, e.p);
}

/** 0x62c590/0x62c3d0/0x62ed70 til computerens udtagelse (aiTeam.ts roleDataOf) */
export function cmFitRead(g: GameState) {
  const c = fitCtx(g, SALT.read);
  return {
    condition: (p: Player) => condition(c, p),
    fatigue: (p: Player) => fatigue(p),
    injury: (p: Player) => { const e = currentInjury(c, p); return e ? { w28: e.w28 } : null; },
    update: (p: Player) => updateFitness(c, p),
  };
}
export { fitIso };
