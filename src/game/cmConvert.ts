// Konvertering af gamle gemte spil til originalens systemer (ejerens valg 16/11-2026, ORIGINAL_PARITY.md punkt 15).
//
// Et gammelt spil med den originale database (udvidet tilstand eller ægte tilstand fra før originalens systemer) konverteres som en KOPI:
// spillets karriere (dato, klubber, trupper, resultater, penge, kontrakter) bliver, og originalens lag lægges oven på:
//  * spillerne fra databasen tager udgangspunkt i databasens interne egenskaber (Player.cmInt fra en frisk spilstart med samme frø), PA fra
//    originalens spilstart, CA ≤ PA, og for spillere over 30 originalens aldringsgren (0x5d5115, cmAgeing) på de udviklingsdage, der er gået
//    siden databasens start; de viste værdier regnes af de interne (shownFromInternal) – egne regens: intrinsicOf → normaliseInternals →
//    shownFromInternal, så de passer til deres CA (de gamle "20 overalt"/"fart 1"-værdier forsvinder);
//  * bestyrelse og forhold nulstilles neutralt (ingen fyring og ingen sure spillere fra dag ét) – spilleren får en kort besked;
//  * kalenderen: sæsonen spilles færdig med spillets egen kalender, originalens kalender gælder fra næste sæson (sæsonskiftet).
// Et spil med 2026/27-databasen kan ikke konverteres (andre spillere og klubber) – "Start again in the original": nyt spil med den originale
// database og samme klub (navn + land), managerens navn/nationalitet og karrieren (historik, trofæer, Hall of Fame) som forhistorie.
import type { CMWorld } from './data/cm0102';
import type { GameState, Player, Staff } from './types';
import { CM_SAVE_VER, type NewGameOptions } from './newgame';
import { addNews, rebuildIndexes, setGame } from './state';
import { cmActive } from './cmPlayerData';
import { normaliseInternals, shownFromInternal } from './playerInit';
import { cmAgeing, devPersOf, ensureCmInt } from './cmDevelop';
import { normaliseRec, recInto, recOf, cmIntSync } from './cmTraining';
import { cmRand } from './cmPlayerData';
import { ageOn } from './dates';
import { rng } from './rng';
import { cmBoardHumanAppoint, cmBoardInit } from './cmBoardGame';
import { cmRelNewGame } from './cmRelations';
import { cmRetireInit } from './cmRetire';
import { cmFitConvert } from './cmFitnessGame';
import { cmFinanceNewGame, cmFinanceWageBills } from './cmFinance';
import { cmContractsNewGame } from './cmContractInit';
import { cmPermitNewGame } from './cmPermit';
import { cmSquadPlanStart } from './cmSquadPlanGame';
import { cmShortlistStart } from './cmShortlistGame';
import { cmContractManagerDay } from './cmContractManager';
import { cmValuesApply } from './cmValueGame';

/** pund → spillets euro (som newgame.ts) */
const GBP = 0.86;

export { saveKindFromText, saveKindOf, type SaveKind } from './saveKind';

/** Hvad konverteringen gjorde (vises efter konverteringen) */
export interface ConvertReport {
  kind: 'convert' | 'restart';
  date: string;
  season: number;
  club: string;
  /** konverteret: originalens kalender først fra næste sæson */
  nextSeason?: boolean;
  dbPlayers?: number;
  regens?: number;
  clamped?: number;
  aged?: number;
  staff?: number;
  injuries?: number;
  /** genstart: forhistoriens sæsoner og trofæer, og om klubben blev valgt af spilleren (fandtes ikke i 2001) */
  history?: number;
  trophies?: number;
  picked?: boolean;
}

// ------------------------------------------------------------------------------------------------ fælles

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, 'and')
  .replace(/\b(fc|afc|cf|sc|ac|fk|sk|if|bk|club|de|cd|ud|sd|ssc|as|rc|sv|vfb|vfl|tsv|1\.)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const NATION_ALIAS: Record<string, string> = { netherlands: 'holland', 'republic of ireland': 'ireland', eire: 'ireland', 'korea republic': 'south korea', usa: 'united states', czechia: 'czech republic', turkiye: 'turkey' };
const natKey = (s: string) => { const k = norm(s); return NATION_ALIAS[k] ?? k; };

/** nationens indeks i den originale verden for et navn (null = findes ikke) */
export function mapNation(name: string | undefined, world: { nations: { name: string }[] }): number | null {
  if (!name) return null;
  const k = natKey(name);
  const i = world.nations.findIndex((n) => natKey(n.name) === k);
  return i >= 0 ? i : null;
}

/** Klubben i den originale verden med samme navn i samme land (navn eller kort navn, uden FC/AFC og accenter) */
export function matchClubIn(world: CMWorld, name: string, short: string, nation: number | null): number | null {
  if (nation === null) return null;
  const keys = new Set([norm(name), norm(short)].filter(Boolean));
  const hit = world.clubs.find((c) => c[3] === nation && (keys.has(norm(c[1])) || keys.has(norm(c[2]))));
  return hit ? hit[0] : null;
}

/** Klubber i samme land og på samme niveau (ejerens valg 4: klubben fandtes ikke i 2001) – sorteret efter navn */
export function clubCandidates(world: CMWorld, nation: number | null, tier: number): { id: number; name: string; league: string }[] {
  if (nation === null) return [];
  const lg = world.leagues.filter((l) => l.nation === nation && !l.hidden);
  const tiers = [...new Set(lg.map((l) => l.tier))].sort((a, b) => a - b);
  if (!tiers.length) return [];
  const want = tiers.includes(tier) ? tier : tiers.reduce((b, t) => (Math.abs(t - tier) < Math.abs(b - tier) ? t : b), tiers[0]);
  const ids = new Set(lg.filter((l) => l.tier === want).map((l) => l.id));
  return world.clubs.filter((c) => ids.has(c[4])).map((c) => ({ id: c[0], name: c[1], league: world.leagues.find((l) => l.id === c[4])?.name ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Nyt-spil-valgene for genstarten i den originale (mennesket bliver i klubbens land først; de øvrige valgte lande, der findes i 2001) */
export function restartOptions(old: GameState, world: CMWorld, clubId: number, lang: NewGameOptions['lang']): NewGameOptions {
  const club = world.clubs.find((c) => c[0] === clubId)!;
  const playable = new Set(world.leagues.filter((l) => !l.hidden).map((l) => l.nation));
  const others = old.activeNations.map((n) => mapNation(old.nations[n]?.name, world)).filter((n): n is number => n !== null && playable.has(n) && n !== club[3]);
  return {
    managerName: old.manager.name, managerNation: mapNation(old.nations[old.manager.nation]?.name, world) ?? club[3], clubId,
    activeNations: [club[3], ...new Set(others)], lang, masking: old.options.masking, seed: old.seed || 1,
  };
}

/** Konverteringens nye-spil-valg (samme klub, manager, lande og frø – den friske spilstart giver databasens lag) */
export function convertOptions(old: GameState, world: CMWorld, lang: NewGameOptions['lang']): NewGameOptions {
  const own = world.clubs.find((c) => c[0] === old.userClub && c[1] === old.clubs[old.userClub]?.name);
  const active = old.activeNations.filter((n) => world.leagues.some((l) => l.nation === n && !l.hidden));
  const clubId = own ? own[0] : world.clubs.find((c) => active.includes(c[3]))?.[0] ?? world.clubs[0][0];
  return { managerName: old.manager.name, managerNation: old.manager.nation, clubId, activeNations: active.length ? active : [world.clubs.find((c) => c[0] === clubId)![3]], lang, masking: old.options.masking, seed: old.seed || 1 };
}

/** Er spillet med den udgave af databasen (de fleste af ens spillere har samme id og efternavn)? 0..1 */
export function versionMatch(old: GameState, world: CMWorld): number {
  const F = Object.fromEntries(world.playerFields.map((f, i) => [f, i]));
  const byId = new Map(world.players.map((r) => [r[F.id] as number, r[F.last] as string]));
  const ps = Object.values(old.players).filter((p) => !p.regen && p.id < 8_000_000).slice(0, 3000);
  if (!ps.length) return 0;
  return ps.filter((p) => byId.get(p.id) === p.last).length / ps.length;
}

// ------------------------------------------------------------------------------------------------ konverteringen

const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const isoOf = (d: number) => new Date(d * 86400000).toISOString().slice(0, 10);
const staffKey = (s: Staff) => `${s.first}|${s.last}|${s.nation}`;

/** Udviklingsdagene (staff-id mod 365, +120, +240) efter `from` til og med `to` – cmDevDaily's dage */
function devDays(id: number, from: string, to: string): string[] {
  const a = id % 365, b = (a + 120) % 365, c = (b + 120) % 365;
  const out: string[] = [];
  const d0 = dayNum(from), d1 = dayNum(to);
  for (let y = +from.slice(0, 4); y <= +to.slice(0, 4); y++) {
    const jan1 = Math.round(Date.UTC(y, 0, 1) / 86400000);
    for (const doy of [a, b, c]) { const d = jan1 + doy; if (d > d0 && d <= d1) out.push(isoOf(d)); }
  }
  return out.sort();
}

/**
 * Konvertér `old` (et gammelt spil med den originale database) med `fresh` = en frisk spilstart med samme database, klub, manager, lande og frø
 * (createGame med convertOptions – den giver databasens lag). `old` ændres og bliver det globale spil. `world` = databasen (forholdene, bestyrelsen,
 * økonomien). Kaldes i en Web Worker (ui/newGameWorker.ts).
 */
export function convertOriginal(old: GameState, fresh: GameState, world: CMWorld): ConvertReport {
  const g = old, F = fresh;
  const rep: ConvertReport = { kind: 'convert', date: g.date, season: g.season, club: g.clubs[g.userClub]?.name ?? '', dbPlayers: 0, regens: 0, clamped: 0, aged: 0, staff: 0, injuries: 0 };
  // tilstand og database
  g.options.mode = 'authentic';
  g.options.rules = 'classic';
  if (F.options.engine) g.options.engine = F.options.engine;
  g.dbKind = 'cm0102'; g.dbYear = F.dbYear; g.dbVersion = F.dbVersion;
  if (F.customRules) g.customRules = F.customRules;
  if (!g.officials && F.officials) g.officials = F.officials;
  if (!g.econ && F.econ) g.econ = F.econ;
  if (!g.intl && F.intl) g.intl = F.intl;
  // databasens faste data (originalens rå omdømme, tilskuere, stadioner, byer, landenes felter, Staff Search, turneringshistorik)
  const STATIC = ['cmClubRep', 'cmNationRep', 'cmClubStat', 'cmCompRep', 'cmCrowd', 'cmStadium', 'cmCities', 'cmNation7e', 'cmNation85', 'cmNation76',
    'cmNationCont', 'cmEurope', 'cmCity33', 'cmCompHist', 'cmClubNames', 'cmStaffMem', 'cmMaxMem'] as const;
  const gr = g as unknown as Record<string, unknown>, fr = F as unknown as Record<string, unknown>;
  for (const k of STATIC) if (fr[k] !== undefined) gr[k] = fr[k];
  // den gamle tilstand fra originalens systemer (et delvist konverteret spil) bygges forfra
  for (const k of ['cmBoard', 'cmFin', 'cmPlan', 'cmCm', 'cmPermit', 'cmRet', 'cmFine', 'cmDisc', 'cmRum', 'cmClubUnhappy', 'cmClubMood', 'cmSlPairs', 'cmTmKept', 'cmSup']) delete gr[k];

  // klubberne: originalens værdiklub-felter
  for (const c of Object.values(g.clubs)) {
    const f = F.clubs[c.id];
    if (!f || f.name !== c.name) continue;
    if (f.vc) c.vc = f.vc;
    delete c.cmPrefs;
  }

  // spillerne
  const start = F.date;
  for (const p of Object.values(g.players)) {
    if (p.virtual) { delete g.players[p.id]; continue; }
    // ingen sure spillere fra dag ét: utilfredshed, klager, transferanmodninger og originalens dynamiske poster nulstilles; gamle skader (spillets
    // egen skademodel) ryddes – originalens konditionsmodul overtager
    p.unhappy = undefined; p.complaint = undefined; p.cmReq = undefined;
    delete p.cmContract; delete p.cmFit; delete p.cmTrain; delete p.cmStats; delete p.cmForm; delete p.cmRel; delete p.cmAsk; delete p.cmStaffState;
    if (p.injury) { p.injury = null; rep.injuries!++; }
    const f = F.players[p.id];
    const db = !!f && !f.regen && !p.regen && f.last === p.last && f.first === p.first && f.dob.slice(0, 4) === p.dob.slice(0, 4);
    if (db) {
      rep.dbPlayers!++;
      // databasens egenskaber, positioner og interne værdier (en frisk spilstart med samme frø), originalens PA og CA ≤ PA
      p.pa = f.pa;
      if (p.ca > p.pa) { p.ca = p.pa; rep.clamped!++; }
      p.attrs = f.attrs.slice(); p.pos = f.pos.slice(); p.side = f.side.slice();
      if (f.feet) p.feet = [f.feet[0], f.feet[1]];
      p.foot = f.foot;
      p.cmInt = f.cmInt ? f.cmInt.slice() : undefined;
      for (const k of ['cmRep', 'cmFree', 'cmLang', 'cmMem', 'cmNation2'] as const) { if (f[k] !== undefined) (p as unknown as Record<string, unknown>)[k] = structuredClone(f[k]); else delete p[k]; }
      // omdømmet i hukommelsen: spilstartens, flyttet med karrierens udvikling af omdømmet (konverteringens skøn – originalen har ingen konvertering)
      if (f.cmRepMem) { const k = Math.max(0.5, Math.min(2, f.rep > 0 ? p.rep / f.rep : 1)); p.cmRepMem = f.cmRepMem.map((v) => Math.min(200, v * k)) as [number, number, number]; }
      p.cmJoined = p.club === f.club && f.cmJoined ? f.cmJoined : p.joined ?? f.cmJoined ?? g.date;
      // originalens aldringsgren for de udviklingsdage, der er gået, hvor spilleren var over 30 (CA bliver karrierens)
      if (p.cmInt) {
        const ca = p.ca;
        let n = 0;
        for (const d of devDays(p.id, start, g.date)) {
          const age = ageOn(p.dob, d);
          if (age < 30) continue;
          const r = recOf(p);
          cmAgeing(r, age, devPersOf(p), cmRand(g.seed ?? 0, p.id, dayNum(d), 0xc0be));
          normaliseRec(r, null);
          recInto(g, p, r);
          n++;
        }
        p.ca = ca;
        if (n) rep.aged!++;
      }
    } else {
      // egne spillere (regens, opfyldte): de interne af de viste, re-centreret som originalen, og de viste regnet tilbage af CA
      rep.regens!++;
      if (p.pa >= 1 && p.ca > p.pa) { p.ca = p.pa; rep.clamped!++; }
      if (!p.cmInt || p.cmInt.length !== 18) { delete p.cmInt; ensureCmInt(p); }
      normaliseInternals(p.cmInt!, p.pos[0]);
      for (let i = 0; i < p.attrs.length; i++) { const v = p.attrs[i]; p.attrs[i] = Number.isFinite(v) ? Math.max(1, Math.min(20, v)) : 10; }
      shownFromInternal(p.attrs, p.cmInt!, Math.trunc(p.ca), p.pos[0]);
      if (!p.cmJoined && p.joined) p.cmJoined = p.joined;
    }
    cmIntSync(g, p);
  }

  // staben: databasens folk (samme navn og land) får ikke-spillerposten; Staff Search's øvrige personer kommer med
  const freshByKey = new Map<string, Staff>();
  for (const s of Object.values(F.staff)) if (s.cmId !== undefined || s.cmExtra) freshByKey.set(staffKey(s), s);
  const have = new Set<string>();
  const active = new Set(g.activeNations);
  for (const s of Object.values(g.staff)) {
    have.add(staffKey(s));
    const f = freshByKey.get(staffKey(s));
    if (f && !f.cmExtra) {
      rep.staff!++;
      for (const k of ['cmId', 'cmNp', 'cmPa', 'cmRep', 'cmHid', 'cmNat', 'cmMem', 'cmDbJob', 'tac'] as const) if (f[k] !== undefined) (s as unknown as Record<string, unknown>)[k] = structuredClone(f[k]);
      if (f.ca !== undefined) s.ca = f.ca;
      s.cmJoined = s.club === f.club ? f.cmJoined : g.date;
    } else if (F.cmStaffMem && s.club && active.has(g.clubs[s.club]?.nation ?? -1)) s.cmMem = true;
    delete s.cmRel;
  }
  for (const f of Object.values(F.staff)) {
    if (!f.cmExtra || have.has(staffKey(f))) continue;
    const s = structuredClone(f);
    s.id = g.nextId.staff++;
    g.staff[s.id] = s;
  }

  // originalens systemer bygges på spillets dato (som createGame efter klubber, spillere og stab)
  setGame(g, { keepCarry: true });   // bygger videre på createGame's modultilstand (carry.ts)
  cmBoardInit(g, world.cmRaw?.chairBoard, world.cmRaw?.nationBoard);
  const club = g.clubs[g.userClub];
  g.board = { confidence: 65, expectation: 'mid', expectedPos: 10, warnings: 0 };
  if (club) cmBoardHumanAppoint(g, club, false);
  for (const p of Object.values(g.players)) if (!p.regen) p.morale = 10;
  if (world.cmRaw) cmRelNewGame(g, world.cmRaw.prefs, world.cmRaw.clubPrefs);
  cmRetireInit(g);
  cmFitConvert(g);
  // pengene er karrierens: saldo, budget og lønninger beholdes (originalens poster og formænd bygges oven på dem)
  const money = new Map(Object.values(g.clubs).map((c) => [c.id, [c.balance, c.transferBudget, c.wageBudget]] as const));
  const wages = new Map(Object.values(g.players).filter((p) => p.contract).map((p) => [p.id, p.contract!.wage] as const));
  g.cmFinStartYear = g.season;
  cmFinanceNewGame(g, world, g.seed);
  cmFinanceWageBills(g);
  const dbWage = new Map([...wages].map(([id, w]) => [id, Math.round(w * GBP)] as const));
  cmContractsNewGame(g, dbWage, g.seed);
  for (const [id, w] of wages) { const c = g.players[id]?.contract; if (c) c.wage = w; }
  for (const [id, [b, t, w]] of money) { const c = g.clubs[id]; c.balance = b; c.transferBudget = t; c.wageBudget = w; }
  cmPermitNewGame(g);
  cmSquadPlanStart(g);
  cmShortlistStart(g);
  cmContractManagerDay(g);
  cmValuesApply(g);
  g.cmSaveVer = CM_SAVE_VER;
  (g.fixes ??= []).push('cmConvert');
  // originalens kalender fra næste sæson: kampe, der stadig skal spilles i år, spilles med spillets egen kalender
  rep.nextSeason = Object.values(g.fixtures).some((f) => !f.result && f.date >= g.date);
  addNews({ cat: 'general', key: 'conv.done', params: { club: rep.club } });
  rebuildIndexes();
  g.rng = rng.state;
  if (!cmActive(g)) throw new Error('convert: not active');
  return rep;
}

/** "Start again in the original": `fresh` = det nye spil (createGame med restartOptions); karrieren fra `old` lægges ind som forhistorie */
export function restartInOriginal(old: GameState, fresh: GameState, world: CMWorld, picked: boolean): ConvertReport {
  const g = fresh;
  setGame(g);
  const mapClub = (cid: number): number => {
    const c = old.clubs[cid];
    if (!c) return 0;
    const id = matchClubIn(world, c.name, c.short, mapNation(old.nations[c.nation]?.name, world));
    return id !== null && g.clubs[id] ? id : 0;
  };
  const nameOf = (cid: number) => old.clubs[cid]?.name ?? '';
  g.manager.history = old.manager.history.map((h) => {
    const id = mapClub(h.club);
    return { season: h.season, club: id, league: old.leagues[h.league]?.name ?? h.league, pos: h.pos, ...(id ? {} : { clubName: nameOf(h.club) }) };
  });
  g.manager.trophies = old.manager.trophies.map((x) => { const id = mapClub(x.club); return { season: x.season, comp: x.comp, club: id, ...(id ? {} : { clubName: nameOf(x.club) }) }; });
  g.manager.sacked = old.manager.sacked ?? 0;
  const club = g.clubs[g.userClub];
  addNews({ cat: 'general', key: 'conv.restart', params: { club: club?.name ?? '', old: old.clubs[old.userClub]?.name ?? '', n: g.manager.history.length } });
  rebuildIndexes();
  g.rng = rng.state;
  return { kind: 'restart', date: g.date, season: g.season, club: club?.name ?? '', history: g.manager.history.length, trophies: g.manager.trophies.length, picked };
}

/** Konsistenskontrol (tests og scripts): spillere med CA > PA, viste værdier uden for 1..20 eller viste ≠ de interne */
export function convertProblems(g: GameState): string[] {
  const out: string[] = [];
  for (const p of Object.values(g.players) as Player[]) {
    if (p.virtual) continue;
    if (p.ca > p.pa && p.pa >= 1) out.push(`${p.id} CA ${p.ca} > PA ${p.pa}`);
    // (de genererede egenskaber uden for de 18 må være brøker – som i et nyt spil)
    if (p.attrs.some((v) => !(v >= 1 && v <= 20))) out.push(`${p.id} attrs`);
    if (!p.cmInt || p.cmInt.length !== 18) { out.push(`${p.id} cmInt`); continue; }
    const a = p.attrs.slice();
    shownFromInternal(a, p.cmInt, Math.trunc(p.ca), p.pos[0]);
    if (a.some((v, i) => v !== p.attrs[i])) out.push(`${p.id} shown≠internal`);
  }
  return out;
}
