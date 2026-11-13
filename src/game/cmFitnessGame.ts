// Konditionsmodulet (cmFitness.ts – originalens injury.cpp) koblet til spillet: spilstarten, dagen, kampene og aflæsningerne.
// Kun den originale database i ægte tilstand (cmActive); ellers gør intet her noget, og spillets egen model (sim.ts) gælder.

import type { Fixture, GameState, MatchReport, Player } from './types';
import { cmActive, cmStaffStateInit, setCmPlayerCtx } from './cmPlayerData';
import {
  applyMatchEffects, clearKnocks, clubSeason, condition, currentInjury, dayNum, fatigue, fitIso, fitRand, hasSeasonRow, initRecords, initSquadFitness, injuryDaily, injuryStatus,
  newFit, recordKnock, recoverFatigue, setKnockHook, syncPlayer, trainingLoad, updateFitness, type CmInjury, type FitCtx, type MatchEntry,
} from './cmFitness';
import { addNews, squad } from './state';
import { asOwner, isHumanClub } from './humans';
import { cmRand, statCategory } from './cmPlayerData';
import { cmTrainPlayer, setTrainCtx } from './cmTraining';
import { setDevCtx } from './cmDevelop';
import { registerPrerun, runPrerun } from './cmPrerun';

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
    onDuty: (p) => intlDuty?.(p) ?? false,
    inEurope: (club) => cmClubEuro(g, club) > -1,
    train: (p) => cmTrainPlayer(g, p, 0x62d312),
  };
}

/** landsholdsopholdet (staff +0x24 og datoen 0x76e040) – international.ts sætter den (undgår en cirkulær import) */
let intlDuty: ((p: Player) => boolean) | null = null;
export function setIntlDuty(f: (p: Player) => boolean): void { intlDuty = f; }

/** club +0x1db: den europæiske turnering, klubben er med i lige nu (−1 = ingen). Skrives af de europæiske turneringers kode
 *  (0x4c6430 ved tildelingen af pladserne, 0x585ab0/0x586330 videre til næste turnering eller −1 ved udslagning); oraklets værdier
 *  326/328/330 = turneringernes id'er (Champions League, UEFA Cup og den tredje – rækkefølgen 326 → 328 ses, når et CL-hold ryger ned).
 *  Hos os: en ufærdig kontinental turnering, klubben er med i og ikke slået ud af (seneste dobbeltkamp ikke tabt; i ligafasen alle;
 *  efter ligafasen uden dobbeltkamp: de 8 bedste i tabellen) → CL 326, UEFA 328, andre 330. Læses af 0x62ce30 og 0x83cb40. */
export function cmClubEuro(g: GameState, club: number): number {
  for (const c of Object.values(g.comps)) {
    if (c.type !== 'continental' || c.finished || !c.clubs.includes(club)) continue;
    const mine = c.ties.filter((t) => t.a === club || t.b === club);
    let alive: boolean;
    if (!c.ties.length) alive = true;
    else if (mine.length) { const last = mine[mine.length - 1]; alive = last.winner === undefined || last.winner === club; }
    else alive = c.table.slice(0, 8).some((r) => r.club === club);
    if (alive) return c.id === 'CL' ? 326 : c.id === 'UEFA' ? 328 : 330;
  }
  return -1;
}

/** periodens ord (originalen: "a few days", "about a week", "about a month", "about a year" …) */
function rangeKey(days: number): string {
  if (days <= 5) return 'injury.r.few';
  if (days <= 10) return 'injury.r.week';
  if (days <= 24) return `injury.r.weeks${Math.round(days / 7)}`;
  if (days <= 45) return 'injury.r.month';
  if (days <= 300) return `injury.r.months${Math.min(9, Math.round(days / 30))}`;
  return 'injury.r.year';
}

function injuryNews(g: GameState, kind: 'injury' | 'recovered', p: Player, inj: CmInjury): void {
  if (!p.club) return;
  const key = `cm${inj.t}`;
  if (kind === 'recovered') asOwner(p.club, () => addNews({ cat: 'injury', key: 'news.recovered', params: { player: pname(p), last: p.last, injury: key }, link: { kind: 'player', id: p.id } }));
  // CM 01/02 (strengene i cm0102.exe): overskriften "Keane injured" / "suffers injury" / "injury shocker" / "Injury blow for …" / "out for …",
  // brødteksten "X will be out of action for <periode> after he suffered <skade>." – hvilken overskrift og periodens ord er *estimeret*
  else asOwner(p.club, () => addNews({ cat: 'injury', key: `injury.o.h${p.id % 5}`, params: { player: pname(p), last: p.last || pname(p), injury: key, range: rangeKey(inj.w2a), days: inj.w2a }, link: { kind: 'player', id: p.id } }));
  void g;
}

/** konditionsmodulets aflæsninger til kontraktens opdatering 0x4cb250 (cmPlayerData.ts): 0x62c400 og sæsontabellen for klubbens land
 *  (0x669340 → 0xb63d60 +0x2a/+0x39: i dag efter starten og før slutningen – tabellens år følger clubSeason, *estimeret*) */
function linkPlayerCtx(g: GameState): void {
  // træningen 0x8b1750 (0x8b39f0: skadestatus 2 → skemaet "No Training") og udviklingen 0x5ce2d0 (trætheden 0x62c3d0, skadens +0x2c 0x62ed70)
  setTrainCtx({
    injured: (p) => injuryStatus(fitCtx(g, SALT.read), p) === 2,
    human: (club) => isHumanClub(club),
    rand: (p, salt) => cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x8b1750, salt),
  });
  setDevCtx({
    fatigue: (p) => fatigue(p),
    injuryW2c: (p) => { const e = currentInjury(fitCtx(g, SALT.read), p); return e ? e.w2c : null; },
  });
  setCmPlayerCtx({
    fatigue: (p) => fatigue(p),
    injury: (p) => injuryStatus(fitCtx(g, SALT.read), p),
    injuryW2c: (p) => { const e = currentInjury(fitCtx(g, SALT.read), p); return e ? e.w2c : null; },
    inSeason: (club) => {
      const n = g.clubs[club]?.nation, today = dayNum(g.date);
      if (!hasSeasonRow(n)) return false;
      const [inS, start, end] = clubSeason(n, today);
      return inS && today > start && today < end;
    },
  });
}

/** de rigtige spillere i "staff-tabellens" rækkefølge (id – heltalsnøgler kommer i stigende orden) */
function realPlayers(g: GameState): Player[] {
  return Object.values(g.players).filter((p) => !p.regen);
}

/** Nyt spil: Injury::Injury (0x62cf70) på databasens dato (1/1), dagene frem til spillets start (0x5cc850 kører 0x62b7b0 hver dag – uden
 *  kampe og uden 0x5ce2d0), så 0x62a920 på startdagen. */
export function cmFitNewGame(g: GameState): void {
  if (!cmFitOn(g)) return;
  linkPlayerCtx(g);
  g.cmFitStart = g.date;
  const ps = realPlayers(g);
  const start = dayNum(g.date);
  const db = dayNum(`${g.date.slice(0, 4)}-01-01`);
  setKnockHook(true);
  initRecords(fitCtx(g, SALT.init, db), ps);
  cmStaffStateInit(g, `${g.date.slice(0, 4)}-01-01`);                                 // 0x828110: staffpostens +0xa (indkøringsbyten) på databasens dato
  // forkørslen 0x5cc850 (cmPrerun.ts): trinet Injury 0x62b7b0 hver dag fra dagen efter databasens dato til dagen før start
  const staff = Object.keys(g.staff).length;
  prerunInjury = { ps, staff };
  try { runPrerun(g, db + 1, start); } finally { prerunInjury = null; }
  const c = fitCtx(g, SALT.init, start);
  initSquadFitness(c, ps);
  for (const p of ps) { if (p.cmFit) p.cmFit.load = trainingLoad(p, !!p.club && isHumanClub(p.club)); syncPlayer(c, p); }
}

/** forkørslens Injury-trin (0x5cc850 → 0x62b7b0 ved tidspunkt 2) – spillerlisten og stabens antal fra cmFitNewGame */
let prerunInjury: { ps: Player[]; staff: number } | null = null;
registerPrerun('injury', (g, d) => { if (prerunInjury) injuryDaily(fitCtx(g, SALT.prerun, d), prerunInjury.ps, prerunInjury.staff); });

/** Dagen (sim.ts newDay): 0x62b7b0, så 0x5ce2d0's del – trætheden falder for alle (0x62c2f0) – og aflæsningerne: menneskets spillere
 *  (0x5cf226) og de skadede (deres status, så spillets udtagelse og skærme ser skaden). */
export function cmFitDay(g: GameState): void {
  if (!cmFitOn(g)) { setKnockHook(false); return; }
  setKnockHook(true);
  linkPlayerCtx(g);
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
  linkPlayerCtx(g);
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
    injury: (p: Player) => { const e = currentInjury(c, p); return e ? { w28: e.w28, w2c: e.w2c } : null; },
    update: (p: Player) => updateFitness(c, p),
  };
}
export { fitIso };
