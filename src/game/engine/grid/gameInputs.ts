// Spillets egne inddata til gittermotoren: kampstartens tilstand bygget af SPILLETS data (ikke af et spor) – spillerposten [+0x6d],
// staffposten [+0x69] og sub_6ec010's omgivelser (MatchValuesEnv) pr. spiller, anføreren (0x897590 → sub_6ec010's anførerdata) og kampens
// rammer (fixture+0x14/+0x3a/+0x40). Bruges af adapteren (spillets kampe) og scripts/grid-stats.ts; kontrolleret felt for felt mod
// originalens kampstart (MV-linjerne) med scripts/grid-input-check.ts.
//
// Med disse inddata kører kampværdierne sub_6ec010 (matchValues.ts) også i spillets kampe: ved kampstart (0x6bbb60 → 0x6eecb0(p, 1) for de 11)
// og ved hver genberegning i kampen – før brugte limen sit eget skøn (makePlayer) hele kampen.
//
// Kilderne (originalens adresse → spillets data):
//   spillerposten (0x46 bytes)       aiTeam.ts playerRecord (Player.cmInt, cmRepMem, positionerne, fødderne) + id på +0
//   staffposten +0x18 alder, +0x3e/+0x40 ankomst, +0x56..+0x5d de skjulte egenskaber (Player.attrs, Player.joined ?? cmJoined)
//   klub +0x80                        GameState.cmClubRep (databasens rå omdømme – cmPlayerData.ts clubRepMem)
//   comp +0x69                        GameState.cmCompRep (club_comp.dat byte 105) for ligaerne "CM<id>"
//   kontrakten 0x4cf5f0 +0x44/+0x45   Player.cmContract (cmPlayerData.ts – tilfredshed og klageflag)
//   0x53ce90 (sikker, 0x53ce90–0x53cedb) = (kontrakt +0x4f & 0xf) − 10 med egen klub, ellers 0 (Player.cmContract.b4f)
//   manageren np+0xe / 0x544410(np, np+0x21)   Staff.cmNp (ikke-spillerposten efter spilstarten, cmStaffInit.ts); ældre spil: Staff.tac[0]
//                                     og den viste Tactics af CA og databasens værdi
//   anføreren 0x6ebd70                captainBase (roleScore.ts) af spillets data
//   [0xae2d0c]+79·id+0xa (staffState)  Player.cmStaffState (cmPlayerData.ts – spilstarten 0x828110, dagligt 0x5ce2d0, ferie/skade 0x62c680/0x62d250)
// Ikke i spillet (dokumenteret i ENGINE_PORT_PLAN.md, runde 8 – grid-input-check.ts måler afvigelsen):
//   staff+0x65's forhold (yndlingspersoner/-klubber, uvenner – sat af spillets egne systemer, ikke databasens præferencer) = ingen
//   kontraktens +0xc/+0x10/+0x14 (løn/bonusser fra kontraktens oprettelse 0x85e960) – +0x10/+0x14 = −1 (ingen), så leddet 0x6eebda springes over
//   engine+0/+1 (oraklets ligakampe: 0 / 0 eller 2) = 0
import type { Player } from '../../types';
import { ageOn } from '../../dates';
import { ATTRS } from '../../attributes';
import { gs, hasGame } from '../../state';
import { isHumanClub } from '../../humans';
import { clubRepMem } from '../../cmPlayerData';
import { playerRecord, captainInputOf, joinedOf, type AiPickCtx } from './aiTeam';
import { captainBase, staffIntrinsic, staffShown } from './roleScore';
import type { MatchValuesCaptain, MatchValuesEnv } from './matchValues';
import { crowd85cba0, type CrowdCity, type CrowdClub, type CrowdFixture, type CrowdResult, type CrowdStadium } from './crowd';
import { gameLeagueRow } from './gameTable';
import type { AiModeInput } from './aiMode';
import type { Fixture, GameState } from '../../types';
import { daysBetween } from '../../dates';
import { npShown } from '../../cmStaffInit';

const s8 = (x: number) => (x << 24) >> 24;
const sh = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;

/** spillerposten [+0x6d] som Int8Array – playerRecord med spillerens id på +0 (recordId i matchSubs.ts læser det) */
export function recordBytes(p: Player): Int8Array {
  const r = playerRecord(p);
  r[0] = p.id & 0xff; r[1] = (p.id >> 8) & 0xff; r[2] = (p.id >> 16) & 0xff; r[3] = (p.id >>> 24) & 0xff;
  return Int8Array.from(r, (b) => s8(b));
}

const STAFF_HIDDEN = ['adaptability', 'ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'] as const;
/** dagen i året (fra 0) og året – staffpostens datoformat (+0x3e word dag, +0x40 word år) */
const dayYear = (iso: string): [number, number] => { const d = new Date(iso + 'T00:00:00Z'), y = d.getUTCFullYear(); return [Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000), y]; };

/** staffposten [+0x69] (de felter, motoren læser): +0x18 alder, +0x3e/+0x40 ankomsten til klubben, +0x56..+0x5d de skjulte egenskaber */
export function staffBytes(p: Player, date: string): Int8Array {
  const b = new Int8Array(0x70);
  b[0] = p.id & 0xff; b[1] = (p.id >> 8) & 0xff; b[2] = (p.id >> 16) & 0xff; b[3] = (p.id >>> 24) & 0xff;
  b[0x18] = s8(ageOn(p.dob, date));
  const jd = joinedOf(p);
  if (jd) { const [d, y] = dayYear(jd); b[0x3e] = s8(d); b[0x3f] = s8(d >> 8); b[0x40] = s8(y); b[0x41] = s8(y >> 8); }
  STAFF_HIDDEN.forEach((k, i) => { b[0x56 + i] = s8(Math.round(sh(p, k))); });
  return b;
}

/** kampens rammer (fixture-posten) for sub_6ec010 */
export interface GameFixtureInfo {
  /** fixture+0x3a: 1 venskabskamp, 2 ligakamp, 4 pokalkamp, 8 finale (oraklets kampe: 2/4/1) */
  fx3a: number;
  /** comp+0x69 (null = ingen turnering) og [comp] == [0x9cf590] (American Major League) */
  comp: { rep: number; mls: boolean } | null;
  /** hjemmeholdets liga er kampens turnering (fixture+0x1c → +0x57 == fixture+0x14) */
  homeLeagueIsComp: boolean;
}

/** fixture-info af spillets turnering (kampens comp-id) */
export function fixtureInfoOf(compId: string | undefined, homeClub: number, stage?: string): GameFixtureInfo {
  if (!hasGame()) return { fx3a: 2, comp: null, homeLeagueIsComp: false };
  const g = gs();
  // en kamp uden fixture (laboratoriet, tests): som en ligakamp i hjemmeholdets liga (originalens kampe har altid fixture+0x14 –
  // sub_6ec010 0x6ec561 læser comp +0x69 uden nul-tjek)
  compId ??= g.clubs[homeClub]?.league;
  if (!compId) return { fx3a: 2, comp: { rep: 0, mls: false }, homeLeagueIsComp: false };
  const c = g.comps[compId];
  const m = /^CM(\d+)$/.exec(compId);
  const rep = m && g.cmCompRep ? g.cmCompRep[+m[1]] : undefined;
  const league = c?.type === 'league';
  const fx3a = league ? 2 : stage === 'F' ? 8 : 4;
  // comp +0x69: club_comp.dat's omdømme (cmCompRep) for databasens turneringer; spillets egne turneringer (pokaler, Europa) har ikke posten → 0
  return { fx3a, comp: { rep: rep ?? 0, mls: false }, homeLeagueIsComp: league && g.clubs[homeClub]?.league === compId };
}

/** holdets manager: np+0xe (Attacking, databasens værdi) og 0x544410(np, np+0x21) (den viste Tactics) */
export function managerOf(club: number): { n0e: number; rating: number } | null {
  if (!hasGame()) return null;
  const g = gs(), st = g.staff[g.clubs[club]?.manager ?? -1];
  if (!st?.tac) return null;
  // Staff.cmNp: ikke-spillerposten efter originalens spilstart (cmStaffInit.ts – Attacking +0x0e og den interne Tactics +0x21)
  if (st.cmNp) return { n0e: st.cmNp[0], rating: npShown(st, 0x21)! };
  const ca = st.ca ?? st.rep * 2;
  return { n0e: st.tac[0], rating: staffShown(ca, staffIntrinsic(st.tac[6], ca)) };
}

const nationIndex = (name: string) => (hasGame() ? gs().nations.findIndex((n) => n.name === name) : -1);

export interface GameMatchSide { club: number; human: boolean; manager: { n0e: number; rating: number } | null; clubRep: number }

/** sub_6ec010's omgivelser for en spiller af spillets tilstand. De dynamiske felter (publikum, samspil, taktikkens ord, anføreren) sætter limen. */
export function matchValuesEnvOf(p: Player, side: GameMatchSide, fx: GameFixtureInfo, keys: MatchValuesEnv['keys']): MatchValuesEnv {
  const rec = playerRecord(p);
  const ownContract = p.contract && p.club === side.club && !p.loan;
  const c = p.cmContract;
  return {
    engByte0: 0, engByte1: 0, crowd: 0, cohesion: 0, fx40: 1, fx3a: fx.fx3a, comp: fx.comp, homeLeagueIsComp: fx.homeLeagueIsComp,
    ownClubRep: side.clubRep, captain: null, natOwn: false, natF9: false,
    contract: ownContract ? { b44: s8(c?.b44 ?? 0), flags: (c?.b45 ?? 0) >>> 0, d0c: Math.round((p.contract!.wage ?? 0) * 0.86), d10: -1, d14: -1 } : null,
    // 0x53ce90: (+0x4f & 0xf) − 10 for en spiller i databasen med kontrakt med klubben
    contractMod: ownContract && !p.regen && c?.b4f !== undefined ? (c.b4f & 0xf) - 10 : 0,
    inDb: !p.regen, staffState: (p.cmStaffState ?? 0) & 0xff, human: side.human, manager: side.manager,
    rel: { dislikesOpp: false, favoursOpp: false, oppMgrDislikes: false, oppMgrFavours: false, favoursOwn: false, dislikesOwn: false,
      ownMgrDislikes: false, ownMgrFavours: false, capDislikes: false, capFavours: false },
    player61: { b44: s8(rec[0x44]), w0b: ((rec[0xb] | (rec[0xc] << 8)) << 16) >> 16, w0d: ((rec[0xd] | (rec[0xe] << 8)) << 16) >> 16 },
    nation: p.nation ?? null, keys,
    tactics: [{ prim: [], sec: [] }, { prim: [], sec: [] }],
  };
}

/** sub_6ec010's anførerdata for kampspilleren q (0x6ebd70 af spillets data, +5/+0x39/+0x44, alder, Loyalty, Professionalism, dage i klubben) */
export function captainEnvOfPlayer(p: Player, pos: number, ctx: AiPickCtx, clubRep: number, date: string): MatchValuesCaptain {
  const ci = captainInputOf(p, ctx, clubRep);
  const rec = ci.rec;
  return { influence: s8(captainBase(ci)), pos, ca: ((rec[5] | (rec[6] << 8)) << 16) >> 16, r39: s8(rec[0x39]), r44: s8(rec[0x44]),
    s18: s8(ageOn(p.dob, date)), s59: s8(sh(p, 'loyalty')), s5b: s8(sh(p, 'professionalism')), days: ci.days };
}

/** GridMatchCtx-delen med spillets inddata for kampen mellem to klubber (adapteren og grid-stats.ts) */
export function gameInputsCtx(home: number, away: number, o: { compId?: string; stage?: string; date?: string; human?: [boolean, boolean]; fixtureId?: number } = {}) {
  const g = hasGame() ? gs() : null;
  const date = o.date ?? g?.date ?? '2001-08-18';
  const fixture = g && o.fixtureId !== undefined ? g.fixtures[o.fixtureId] : undefined;
  const fx = fixtureInfoOf(o.compId ?? fixture?.comp, home, o.stage ?? fixture?.stage);
  const codes = g ? fixtureCodesOf(g, fixture, o.compId ?? fixture?.comp, home) : null;
  const compId = o.compId ?? fixture?.comp ?? g?.clubs[home]?.league;
  const human = o.human ?? [isHumanClub(home), isHumanClub(away)];
  const sides: [GameMatchSide, GameMatchSide] = [home, away].map((c, i) => ({ club: c, human: human[i], manager: managerOf(c), clubRep: g ? clubRepMem(g, c) : 5000 })) as never;
  const keys = { us: nationIndex('United States'), can: nationIndex('Canada'), mex: nationIndex('Mexico') };
  const envs = new Map<string, MatchValuesEnv>();
  const caps = new Map<string, MatchValuesCaptain>();
  const pick: AiPickCtx = { date, cm: true };
  return {
    gameRecords: date,
    // fixture+0x3a (låsetrinet: sporets FX-byte) – pick_team/0x6ddab0/sub_6d42a0 tester 1/9 (venskabskamp), skuddet 2/8
    compType: fx.fx3a,
    // ligakampen: fixture-posten som standarden (egen liga); en pokalkamp ligger uden for klubbernes liga (fixture+0x14 ≠ klub+0x57) –
    // europæisk turnering (club+0x1db) og +0x30/+0x38 er ikke afbildet (*afvigelse*: 0)
    league: fx.fx3a !== 1 && fx.fx3a !== 9,                                                    // som låsetrinet: kun venskabskampe tæller ikke klubben (0x48f150)
    ...(fx.fx3a !== 2 ? { fixtureInfo: { hasComp: !!fx.comp, ownLeague: [false, false] as [boolean, boolean], ownContinental: [false, false] as [boolean, boolean],
      code30: codes?.w30 ?? 0, firstLeg: codes?.firstLeg ?? null, flags38: codes?.flags38 ?? 0 } } : {}),
    // (runde 9) tilskuertallet sub_85cba0 (crowd.ts) med kampens tilfældige tal ved kampstarten, og 0x6df460's ligadel af spillets tabel
    ...(g && codes && g.cmCrowd ? {
      crowdFn: (rand: (n: number) => number) => gameCrowd(g, home, away, codes, rand),
      // tabellen ændres ikke under kampen – regnet én gang pr. side (0x6df460 kaldes ved hver dødbold)
      leagueTable: ((memo: (AiModeInput['league'] | undefined)[]) => (s: 0 | 1) => (memo[s] === undefined ? (memo[s] = gameAiLeague(g, compId, [home, away], s, date)) : memo[s]))([]),
    } : {}),
    ...(fx.comp ? { compRep: fx.comp.rep } : {}),
    rep: [sides[0].clubRep, sides[1].clubRep] as [number, number],
    matchValuesEnv: (q: { side: number; src: Player }) => {
      const k = `${q.side},${q.src.id}`;
      let e = envs.get(k);
      if (!e) { e = matchValuesEnvOf(q.src, sides[q.side], fx, keys); envs.set(k, e); }
      return e;
    },
    // anførerdataene ændres ikke i kampen (undtagen positionsordet) – gemt pr. spiller
    captainEnvOf: (q: { side: number; src: Player; pos: number } | null | undefined) => {
      if (!q) return null;
      const k = `${q.side},${q.src.id}`;
      let c = caps.get(k);
      if (!c) { c = captainEnvOfPlayer(q.src, q.pos, pick, sides[q.side].clubRep, date); caps.set(k, c); }
      return c.pos === q.pos ? c : { ...c, pos: q.pos };
    },
    date,
  };
}

// ---------------------------------------------------------------- (runde 9) fixture-posten, tilskuertallet og ligatabellen

/** fixture-postens koder (+0x30/+0x32 word, +0x34 runden, +0x3a kamptypen, +0x3c neutral bane, +0x38 flag, +0x4b/+0x4c første ben) og
 *  turneringens tabelpost [0xadadfc][id] (+0x3c, +0x43, +8). Værdierne er originalens (crowd1.txt, en hel sæson: ligakampe +0x30 = 0,
 *  +0x3a = 2, tabellen +0x3c = gange mod hver, +0x43 = 2; pokaler +0x3a = 4 og fra kvartfinalen 6, +0x30 = runde·10 / 120 / 130 / 150, +0x3c = 1
 *  på neutral bane (FA Cup-semifinale og finale), tabellen +0x3c = antal runder, +0x43 = 1, +0x34 = runden fra 0; dobbeltkampe +3/+4 (første/
 *  andet ben – andet ben har +0x4b/+0x4c og +0x38 & 3); Champions League +0x3a = 8, UEFA Cup/Intertoto 7 før kvartfinalen (UEFA 3. runde)
 *  og 8 derefter; playoff +0x3a = 5, +0x32 = 160). Spillets turneringer afbildes på dem: runden og antallet af runder er spillets. */
export interface GameFixtureCodes {
  w30: number; w32: number; b34: number; b3a: number; b3b: number; b3c: number;
  firstLeg: [number, number] | null; flags38: number;
  /** turneringens id i originalen (comp +0) og omdømme (+0x69); tabelposten */
  compId: number; compRep: number; table: { b3c: number; b43: number; rows: boolean } | null;
}
const CM_COMP_ID = (g: GameState, id: string): number => {
  const m = /^CM(\d+)$/.exec(id);
  if (m) return +m[1];
  // spillets egne turneringer: originalens id efter navnet (Champions League 326, UEFA Cup 328, Intertoto 330, FA Cup 351, League Cup 352)
  const c = g.comps[id], n = (c?.name ?? id).toLowerCase();
  if (/champions/.test(n) || id === 'CL') return 326;
  if (/uefa|europa/.test(n) || id === 'UEFA' || id === 'EL') return 328;
  if (/intertoto|conference/.test(n) || id === 'UECL') return 330;
  if (/fa cup/.test(n)) return 351;
  if (/league cup|worthington|carling/.test(n)) return 352;
  return -1;
};
export function fixtureCodesOf(g: GameState, f: Fixture | undefined, compId: string | undefined, home: number): GameFixtureCodes {
  compId ??= f?.comp ?? g.clubs[home]?.league;
  const c = compId ? g.comps[compId] : undefined;
  const id = compId ? CM_COMP_ID(g, compId) : -1;
  const rep = id >= 0 ? g.cmCompRep?.[id] ?? 0 : 0;
  const base = { w30: 0, w32: 0, b34: 0, b3a: 2, b3b: 0xff, b3c: 0, firstLeg: null as [number, number] | null, flags38: 0, compId: id, compRep: rep, table: null as GameFixtureCodes['table'] };
  if (!c || c.type === 'league') {
    const rounds = (compId && g.customRules?.[compId]?.rounds) || 2;
    return { ...base, b34: Math.max(0, (f?.round ?? 1) - 1), table: { b3c: rounds, b43: 2, rows: true } };
  }
  const stage = f?.stage ?? '';
  const tie = f?.tieId !== undefined ? c.ties.find((t) => t.id === f.tieId) : undefined;
  const twoLeg = (tie?.legs ?? 1) > 1, leg = f?.leg ?? 1;
  let firstLeg: [number, number] | null = null;
  if (twoLeg && leg === 2 && tie) {
    const f1 = tie.fx.map((x) => g.fixtures[x]).find((x) => x && x.leg === 1 && x.result);
    if (f1?.result) firstLeg = f1.home === f!.home ? [f1.result.hg, f1.result.ag] : [f1.result.ag, f1.result.hg];
  }
  const legCode = twoLeg ? (leg === 1 ? 3 : 4) : 0;
  const flags38 = !tie ? 0 : twoLeg ? (leg === 2 ? 3 : 0) : 3;
  if (c.type === 'playoff') {
    const lg = c.playoffFor ? CM_COMP_ID(g, c.playoffFor) : -1;
    return { ...base, w30: stage === 'F' ? 150 : 130 + legCode, w32: 160, b3a: 5, b3c: stage === 'F' ? 1 : 0, firstLeg, flags38, compId: lg, compRep: lg >= 0 ? g.cmCompRep?.[lg] ?? 0 : 0,
      table: { b3c: (c.playoffFor && g.customRules?.[c.playoffFor]?.rounds) || 2, b43: 2, rows: true } };
  }
  if (c.type === 'cup') {
    const total = (c.meta?.roundsTotal as number | undefined) ?? Math.max(1, f?.round ?? 1);
    const r = f?.round ?? 1;
    const w30 = stage === 'F' ? 150 : stage === 'SF' ? 130 + legCode : stage === 'QF' ? 120 + legCode : 10 * r + legCode;
    const late = stage === 'F' || stage === 'SF' || stage === 'QF';
    return { ...base, w30, b34: r - 1, b3a: late ? 6 : 4, b3c: !twoLeg && (stage === 'F' || stage === 'SF') ? 1 : 0, firstLeg, flags38, table: { b3c: total, b43: 1, rows: true } };
  }
  // europæisk turnering: gruppe/ligafase (runden = spilledagen), så knockout-runderne
  const ORDER = ['Q1', 'Q2', 'Q3', 'PO', 'R1', 'R2', 'R3', 'LP', 'G', 'R32', 'R16', 'QF', 'SF', 'F'];
  const stageKey = (s: string | undefined) => (!s ? '' : /^G/.test(s) && s !== 'G' ? 'G' : s);
  const present = [...new Set(Object.values(g.fixtures).filter((x) => x.comp === compId).map((x) => stageKey(x.stage)))].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const si = Math.max(0, present.indexOf(stageKey(stage)));
  const group = stage === 'LP' || /^G/.test(stage);
  const cl = id === 326;
  const late = stage === 'QF' || stage === 'SF' || stage === 'F' || (stage === 'R16' && !cl);
  const w30 = group ? 0 : stage === 'F' ? 150 : stage === 'SF' ? 130 + legCode : stage === 'QF' ? 120 + legCode : 10 * (si + 1) + legCode;
  return { ...base, w30, w32: group ? 1085 + Math.max(0, (f?.round ?? 1) - 1) : 0, b34: si, b3a: cl || late ? 8 : 7, b3c: stage === 'F' ? 1 : 0, firstLeg, flags38,
    table: { b3c: Math.max(1, present.length), b43: 1, rows: true } };
}

/** byernes poster (samme objekt pr. id – originalen sammenligner pegere) */
let cityCache: { src: number[]; list: CrowdCity[] } | null = null;
function citiesOf(g: GameState): CrowdCity[] {
  const src = g.cmCities ?? [];
  if (cityCache?.src !== src) {
    const list: CrowdCity[] = [];
    for (let i = 0; i + 1 < src.length; i += 2) list.push({ id: i / 2, c23: src[i], c2b: src[i + 1] });
    cityCache = { src, list };
  }
  return cityCache.list;
}

/** klubposten til sub_85cba0 af spillets data (g.cmCrowd, cmClubRep, cmCompRep, cmNation7e) – null uden data (moderne database) */
function crowdClubOf(g: GameState, club: number, stadiums: Map<number, CrowdStadium>): CrowdClub | null {
  const c = g.clubs[club], d = g.cmCrowd?.[club];
  if (!c || !d) return null;
  const cities = citiesOf(g);
  const lg = c.league ? CM_COMP_ID(g, c.league) : -1;
  let st: CrowdStadium | null = null;
  if (d[3] >= 0) {
    st = stadiums.get(d[3]) ?? null;
    if (!st) { st = { id: d[3], city: d[4] >= 0 ? cities[d[4]] ?? null : null, cap: d[5] }; stadiums.set(d[3], st); }
  }
  return {
    id: club, nation: c.nation, nation7e: g.cmNation7e?.[c.nation] ?? 0,
    league: lg >= 0 && g.comps[c.league]?.type === 'league' ? { id: lg, rep: g.cmCompRep?.[lg] ?? 0 } : null,
    stadium: st,
    // 0x8298fd–0x82995c (spilstart): +0x6d = 0 for klubber, hvis navn begynder med "Bright" eller "Wimble" (strncmp 6), ellers 1
    b6d: /^(Bright|Wimble)/.test(c.name) ? 0 : 1,
    avg: d[0], min: d[1], max: d[2], rep: clubRepMem(g, club), rivals: [d[6], d[7], d[8]].filter((x) => x >= 0),
  };
}

/** sub_85cba0 med spillets data: i alt/hjemme/ude og kapaciteten (stadion +0x3c efter kaldet). null = ingen data (moderne database). */
export function gameCrowd(g: GameState, home: number, away: number, codes: GameFixtureCodes, rand: (n: number) => number): (CrowdResult & { capacity: number }) | null {
  const stadiums = new Map<number, CrowdStadium>();
  const H = crowdClubOf(g, home, stadiums), A = crowdClubOf(g, away, stadiums);
  if (!H || !A) return null;
  const cities = citiesOf(g);
  const compLeague = g.comps[g.clubs[home]?.league ?? '']?.type === 'league' && H.league?.id === codes.compId;
  const F: CrowdFixture = {
    comp: codes.compId >= 0 ? { id: codes.compId, rep: codes.compRep, table: codes.table, bias5c: false, odd7e: false } : null,
    // spillets kampe spilles på hjemmeholdets stadion (også finaler – neutral bane er +0x3c)
    stadium: H.stadium, home: H, away: A,
    w30: codes.w30, w32: codes.w32, b34: codes.b34, b3a: codes.b3a, b3b: codes.b3b, b3c: codes.b3c,
  };
  const res = crowd85cba0(F, {
    rand, cities: cities.length, cityAt: (i) => cities[i] ?? { id: i, c23: 0, c2b: 0 },
    row: () => {
      if (!compLeague) return null;
      const r = gameLeagueRow(g, g.clubs[home].league, home);
      return r ? { b4: r.played & 0xff, c19: r.runs[0], c2d: r.runs[1], c41: r.runs[2], c55: r.runs[3], b72: r.x72 & 0xff, b73: r.pos & 0xff, b74: r.best & 0xff, b75: r.worst & 0xff } : null;
    },
  });
  // kapaciteten skrives tilbage (0x85d730: < 1500 → omdømme/500 · 1000, mindst 1500)
  if (H.stadium) { for (const c of [home, away]) { const d = g.cmCrowd?.[c]; if (d && d[3] === H.stadium.id) d[5] = H.stadium.cap; } }
  return { ...res, capacity: H.stadium ? H.stadium.cap : 0 };
}

/** 0x6df460's ligadel (aiMode.ts `league`) af spillets tabel: kun ligakampe i klubbens egen liga */
export function gameAiLeague(g: GameState, compId: string | undefined, clubs: [number, number], side: 0 | 1, date: string): AiModeInput['league'] {
  if (!compId || g.comps[compId]?.type !== 'league' || g.clubs[clubs[side]]?.league !== compId) return null;
  const id = CM_COMP_ID(g, compId);
  const row = (c: number) => {
    const r = gameLeagueRow(g, compId, c);
    if (!r) return null;
    const days = (d: string | null) => (d ? daysBetween(d, date) : 1e9);
    // +0x72 (sæsonens udgangsplacering – aimode-sporet: Arsenal 3 før første kamp), ikke placeringen nu (+0x73)
    return { pos: r.x72, c19: r.runs[0], c2d: r.runs[1], c41: r.runs[2], c55: r.runs[3], days41: days(r.end41), days55: days(r.end55) };
  };
  // modstanderens række: kun placeringen bruges (aimode-sporets f[32] har ingen datoer)
  const opp = g.clubs[clubs[1 - side]]?.league === compId ? row(clubs[1 - side]) : null;
  return { teams: g.comps[compId].clubs.length, compRep: id >= 0 ? g.cmCompRep?.[id] ?? 0 : 0, own: row(clubs[side]), opp: opp ? { ...opp, days41: 1e9, days55: 1e9 } : null };
}
