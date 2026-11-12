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
//   manageren np+0xe / 0x544410(np, np+0x21)   Staff.tac[0] (Attacking) og den viste Tactics (staffShown af CA og databasens værdi)
//   anføreren 0x6ebd70                captainBase (roleScore.ts) af spillets data
// Ikke i spillet (dokumenteret i ENGINE_PORT_PLAN.md, runde 8 – grid-input-check.ts måler afvigelsen):
//   [0xae2d0c]+0x4f·id+0xa (staffState – "trætheden" løftes dagligt af 0x5ce2d0 og på ferie/skadedage af 0x62c680/0x62d250) = 0
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
    inDb: !p.regen, staffState: 0, human: side.human, manager: side.manager,
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
export function gameInputsCtx(home: number, away: number, o: { compId?: string; stage?: string; date?: string; human?: [boolean, boolean] } = {}) {
  const g = hasGame() ? gs() : null;
  const date = o.date ?? g?.date ?? '2001-08-18';
  const fx = fixtureInfoOf(o.compId, home, o.stage);
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
    ...(fx.fx3a !== 2 ? { fixtureInfo: { hasComp: !!fx.comp, ownLeague: [false, false] as [boolean, boolean], ownContinental: [false, false] as [boolean, boolean], code30: 0, firstLeg: null, flags38: 0 } } : {}),
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
