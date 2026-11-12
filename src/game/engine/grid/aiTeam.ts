// Computerholdets holdudtagelse før kampen som i originalen: MATCH_MAN::pick_team 0x6dbc50(modstander, 2) – flagene og de tilfældige tal,
// anføreren 0x6e1940, dødboldsskytterne, taktikvalget 0x6e0230 (aiTacticChoice.ts – en af de 45 faste taktikker), bænkpladserne og
// fordelingen 0x6e2000 med bænken (pickTeam.ts) med hele udvælgelsesværdien 0x6e2f20 (roleScore.ts). Kaldes af createGridMatch for
// computerstyrede hold (ctx.ai). Kontrolleret mod den instrumenterede original (scripts/pick-trace-eval.ts/pick-trace-check.ts):
// 0x6e2f20 1.415.898/1.415.898 kald ens af originalens egne input, de 11 og bænken 399/400 ens af originalens værdier.
//
// Vores spillerdata → originalens poster (playerRecord/roleDataOf): spillerposten bygges af Player (CA/PA, omdømmet efter spilstartens udfyldning
// ×50 (cmRepMem, sub_535a80), positionerne og Free Role (+0x1a, cmFree) som i databasen, de viste egenskaber regnet tilbage til de interne –
// intrinsicFromShown, moralen +0x45, fødderne), personposten af alder/klub/ankomst (+0x59 Loyalty, +0x5b Professionalism). Originalens
// spilsystemer holdes i spiltilstanden (game/cmPlayerData.ts): kampstatistikken pr. kategori 0x7c1e30 og formens nibbles (0x7c0d70), spillets
// karaktersnit [0xb74350]+0x10/+0x18, kontraktens +0x3e/+0x3f/+0x44 (0x4ca6d0) og taktiklistens statistik (0x896290, GameState.aiTacticStats).
// Konditionen 0x62c590, trætheden 0x62c3d0 og skaden 0x62ed70 fra originalens konditionsmodul (game/cmFitness.ts, Player.cmFit).
// *estimeret* (findes ikke i vores spil): kontraktens flag +0x45 = 0 (sættes af systemer, der ikke er porteret), trupstatus +0x4f fra
// Player.squadStatus (0 uden); 0x8c7260/0x8c7560 (arbejdstilladelsens kampe spillet/ikke spillet) fra cmPermit.ts; ikke-spillerpostens adresse mod 20
// (anføreren) = id mod 20. Uden for den originale database: kondition = Player.condition, ingen træthed/skade.

import type { Player } from '../../types';
import { ATTRS } from '../../attributes';
import { ageOn } from '../../dates';
import { CM_INT_OFFSETS } from '../../playerInit';
import { AI_TACTIC_LIST, chooseAiTactic, type AiTacticEntry, type ChoiceManager, type ChoicePlayer, type TacticStat } from './aiTacticChoice';
import { assignSquad, benchSlots, pickFlags, setPieceTakers, type Rand } from './pickTeam';
import { gs, hasGame } from '../../state';
import { cmActive, cmContractOf, cmFormRatings, leagueAverage, statAvg, statusCode } from '../../cmPlayerData';
import { cmFitRead, setMatchSquad } from '../../cmFitnessGame';
import { cmPermitHistory } from '../../cmPermit';
import { newTacticStats, recordTacticResult } from './aiTacticChoice';
import { chooseCaptain, judgeAbility, recentForm, roleScore, staffIntrinsic, staffShown, type CaptainInput, type Day, type RoleData, type RoleInput } from './roleScore';
import { gridTacOf, npShown } from '../../cmStaffInit';

/** spillerens 12 positionsevner som spillerposten +0x0f..+0x1a: GK SW D DM M AM F WB, højre (+0x17, maske 0x800), venstre (+0x18, 0x80),
 *  midt (+0x19, 0x200), fri rolle (+0x1a). Vores Player.side er [L, C, R]. */
export function recordRatings(p: Player): number[] {
  return [...p.pos.slice(0, 8), p.side[2], p.side[0], p.side[1], p.cmFree ?? 1];
}

/** spillerpostens +0x1b..+0x44 (alfabetisk som player.dat) → vores egenskab; de 18 med * er interne værdier i hukommelsen */
const REC_ATTRS: [number, string, boolean][] = [
  [0x1b, 'acceleration', false], [0x1c, 'aggression', false], [0x1d, 'agility', false], [0x1e, 'anticipation', true], [0x1f, 'balance', false],
  [0x20, 'bravery', false], [0x21, 'consistency', false], [0x22, 'corners', false], [0x23, 'crossing', true], [0x24, 'decisions', true],
  [0x25, 'dirtiness', false], [0x26, 'dribbling', true], [0x27, 'finishing', true], [0x28, 'flair', false], [0x29, 'freeKicks', false],
  [0x2a, 'handling', true], [0x2b, 'heading', true], [0x2c, 'importantMatches', false], [0x2d, 'injuryProneness', false], [0x2e, 'jumping', false],
  [0x2f, 'influence', false], [0x31, 'longShots', true], [0x32, 'marking', true], [0x33, 'offTheBall', true], [0x34, 'naturalFitness', false],
  [0x35, 'oneOnOnes', true], [0x36, 'pace', false], [0x37, 'passing', true], [0x38, 'penalties', true], [0x39, 'positioning', true],
  [0x3a, 'reflexes', true], [0x3c, 'stamina', false], [0x3d, 'strength', false], [0x3e, 'tackling', true], [0x3f, 'teamwork', false],
  [0x40, 'technique', false], [0x41, 'throwIns', true], [0x42, 'versatility', false], [0x43, 'creativity', true], [0x44, 'workRate', false],
];
/** målmandsvarianten (0,1·CA) for disse, når GK = 20 (sub_5442f0 via sub_543540); Handling/Reflexes/One on Ones med 0,1·CA for markspillere */
const GK_LOW = new Set(['crossing', 'creativity', 'dribbling', 'finishing', 'marking', 'offTheBall', 'throwIns']);
const OUT_LOW = new Set(['handling', 'reflexes', 'oneOnOnes']);

/** sub_544380's omvendte: den interne værdi (midten af dem, der vises som `shown`) for X = (CA eller 0,1·CA) + 2·intern */
export function intrinsicFromShown(shown: number, ca: number, low: boolean): number {
  const base = low ? 0.1 * ca : ca;
  const ok: number[] = [];
  for (let v = -125; v <= 125; v++) if (displayX(base + 2 * v) === Math.round(shown)) ok.push(v);
  return ok.length ? ok[ok.length >> 1] : Math.max(-125, Math.min(125, Math.round((10 * shown - base) / 2)));
}
function displayX(X: number): number {
  const t = X * 0.05 + 10;
  const v = (t * t * 0.1 + t) * (1 / 3) + 0.5;
  return v <= 1 ? 1 : v >= 20 ? 20 : Math.trunc(v);
}

/** Spillerposten (0x46 bytes) af vores Player – som originalen har den i hukommelsen under kampen */
export function playerRecord(p: Player): number[] {
  const r = new Array(0x46).fill(0);
  const w = (o: number, v: number) => { r[o] = v & 0xff; r[o + 1] = (v >> 8) & 0xff; };
  const b = (o: number, v: number) => { r[o] = Math.round(v) & 0xff; };
  b(4, p.number ?? 0); w(5, p.ca); w(7, p.pa);
  // omdømmet: spilstartens udfyldte værdier (sub_535a80, cmRepMem) ×50 (0x536e8e); uden dem databasens (cmRep) eller vores 0–100 ×2
  const rep = (p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2]).map((v) => v * 50);
  w(9, rep[0]); w(0xb, rep[1]); w(0xd, rep[2]);
  // positionerne og Free Role som i databasen (1 = ingen – originalens spor har 01, ikke 0)
  recordRatings(p).forEach((v, k) => b(0xf + k, v));
  const gk = p.pos[0] >= 20;
  for (const [o, k, intr] of REC_ATTRS) {
    const shown = p.attrs[ATTRS.indexOf(k as never)] || 10;
    b(o, intr ? intrinsicFromShown(shown, p.ca, gk ? GK_LOW.has(k) : OUT_LOW.has(k)) : shown);
  }
  // originalens interne værdier (Player.cmInt, sub_535a80 ved spilstarten – playerInit.ts), når vi har dem
  if (p.cmInt) CM_INT_OFFSETS.forEach((o, k) => b(o, p.cmInt![k]));
  b(0x30, p.feet?.[0] ?? (p.foot === 'L' || p.foot === 'B' ? 18 : 8));
  b(0x3b, p.feet?.[1] ?? (p.foot === 'R' || p.foot === 'B' ? 18 : 8));
  b(0x45, p.morale ?? 10);
  return r;
}

/** staff +0x3e/+0x40: datoen han kom til klubben – skiftet i spillet (Player.joined), ellers databasens (Player.cmJoined) */
export const joinedOf = (p: Player): string | undefined => p.joined ?? p.cmJoined;

const dayOf = (iso: string): Day => {
  const d = new Date(iso + 'T00:00:00Z'), y = d.getUTCFullYear();
  return { day: Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000), year: y };
};

/** Holdets kontekst ud over truppen (alt valgfrit – mangler noget, bruges originalens "uden"-grene) */
export interface AiPickCtx {
  /** spildatoen (ISO) – alder, dage i klubben, året før (0x54c8e0) */
  date?: string;
  /** spillets frø [0xdd7120] (GameState.seed) – 0x6e86d0's spredning */
  gameSeed?: number;
  /** navngivne udskiftere (turneringens +0x4d & 0xf; Premier League 2001/02: 5) */
  benchSize?: number;
  /** manageren (hold+0x1b, ikke-spiller +0x17/+0x18 vist via 0x544410): id, viste Judging Ability/Potential, ankomst */
  judge?: { id: number; ja: number; jp: number; joined?: string } | null;
  /** turneringen tæller klubben (0x48f150 ≠ 0 – ligakamp) */
  leagueMember?: boolean;
  national?: boolean;
  /** klubben (taktiklistens indeks gemmes pr. klub – 0x8967d0) */
  clubId?: number;
  /** taktiklistens statistik (0x896290, GameState.aiTacticStats) – samme liste for alle hold */
  tacticStats?: TacticStat[];
  /** spillets karaktersnit [0xb74350]+0x10/+0x18 (standard 6,8) */
  leagueAvg?: number;
  /** spillerdataene fra spiltilstanden (cmPlayerData.ts) – kun den originale database i ægte tilstand */
  cm?: boolean;
  /** managerens taktiske egenskaber (team+0x1f, Staff.tac) – omrokeringens taktikvalg 0x6e1aa0 → 0x6e0230/0x6ddab0 */
  manager?: { id: number; ca: number; tac: number[] } | null;
}

export interface AiTeamInput {
  /** kandidaterne i truppens rækkefølge: uden skadede/udelukkede/reserver (pick_teams liste) */
  squad: Player[];
  /** managerens taktiske egenskaber (Staff.tac: [Attacking, Directness, Free Roles, Marking, Offside, Pressing, Tactics, yndlingsformation]) */
  tac: number[] | null;
  /** computerens tilstand før kampen (0x6df460 med inMatch = false) */
  mode: number;
  /** klubbens og modstanderens omdømme i originalens skala (club +0x80, 0–10000) */
  rep: number;
  oppRep?: number;
  /** turneringstypen (+0x3a; 1/9 venskabskamp) */
  compType?: number;
  stats?: TacticStat[];
  /** motorens rand (0x90cfc0) – flagenes og bænkpladsernes tilfældige tal; uden: ingen trækkes (rand = 0) */
  rand?: Rand;
  pick?: AiPickCtx;
  /** kun sammenligning med sporet: flagene fra originalen (ellers trukket med rand, pickFlags) */
  flags?: number;
}
export interface AiTeamResult {
  index: number; entry: AiTacticEntry; presetIndex: number;
  /** de 11 (staff-id pr. taktikkens plads) og bænken i pladsrækkefølge (idx 11..) */
  lineup: (number | null)[]; bench: number[];
  captain: number | null; setPieces: number[]; flags: number;
}

/** 0x6e86d0's spillerdel: id, CA, PA, alder, GK */
function judgeFor(p: Player, ctx: AiPickCtx, age: number) {
  return (kind: 1 | 2, hint: number) => judgeAbility({ playerId: p.id, ca: p.ca, pa: p.pa, age, gk: p.pos[0], gameSeed: ctx.gameSeed ?? 0,
    judge: ctx.judge ? { id: ctx.judge.id, ja: ctx.judge.ja, jp: ctx.judge.jp } : null, kind, hint, repSeen: repOf(p)[1] * 50 });
}
/** RoleData af vores spiller (se filhovedet for de *estimerede* dele) */
export function roleDataOf(p: Player, ctx: AiPickCtx, age: number): RoleData {
  const st = p.stats, last = p.history?.[p.history.length - 1];
  const c = ctx.cm && p.contract ? cmContractOf(p) : null;
  // konditionsmodulet (cmFitness.ts): 0x62c590 (konditionen efter dagens opdatering 0x62c680), 0x62c3d0 (trætheden), 0x62ed70 (skaden)
  const fit = ctx.cm && hasGame() ? cmFitRead(gs()) : null;
  return {
    contract: p.contract ? { b3e: c?.b3e ?? 0, b3f: c?.b3f ?? 0, b44: c?.b44 ?? 0, b45: c?.b45 ?? 0, b4f: (statusCode(p) << 4) | 10 } : null,
    condition: fit ? fit.condition(p) : Math.round((p.condition ?? 100) * 100),
    load: fit ? () => fit.fatigue(p) : () => 0,
    injury: fit ? () => fit.injury(p) : () => null,
    form: () => recentForm(ctx.cm ? cmFormRatings(p) : (p.form ?? []).map((r) => Math.round(r))),
    repSeen: repOf(p)[1] * 50,
    judge: judgeFor(p, ctx, age),
    contractClubIsOwn: () => !p.loan,
    // 0x7c1e30 af spiltilstandens PlayerStats-poster (cmPlayerData.ts); uden dem *estimeret* af sæsonens/sidste sæsons snit
    avg: ctx.cm ? (cat, kind, def) => statAvg(p, cat, kind, def) : (cat, kind, def) => {
      if (kind !== 0x12) return def;
      if (cat === 1) return last && last.apps > 0 && last.avg > 0 ? last.avg : def;
      return st && st.ratingCount > 0 ? st.ratingSum / st.ratingCount : def;
    },
    leagueAvg: ctx.leagueAvg ?? 6.8,
    sameNation: true,
    // 0x8c7260/0x8c7560: arbejdstilladelsens historik (cmPermit.ts)
    history: ctx.cm && hasGame() ? () => cmPermitHistory(gs(), p) : () => null,
  };
}
const repOf = (p: Player) => p.cmRepMem ?? p.cmRep ?? [0, p.rep * 2, 0];
const shAttr = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;

export function aiTeamSetup(o: AiTeamInput): AiTeamResult {
  const ctx = o.pick ?? {};
  const rand: Rand = o.rand ?? (() => 0);
  const date = ctx.date ?? '2001-08-18';
  const today = dayOf(date), yearAgo = dayOf(`${+date.slice(0, 4) - 1}${date.slice(4)}`);
  const mgrJoined = ctx.judge ? (ctx.judge.joined ? dayOf(ctx.judge.joined) : { day: 0, year: 1900 }) : null;
  const ps = o.squad;
  const ages = ps.map((p) => ageOn(p.dob, date));
  const recs = ps.map((p) => playerRecord(p));
  const data = ps.map((p, i) => roleDataOf(p, ctx, ages[i]));
  // 0x6dcd90: flagene (rand)
  const flags = o.flags ?? pickFlags(rand, { national: !!ctx.national, compType: o.compType ?? 0, ownRep: o.rep, oppRep: o.oppRep ?? o.rep, leagueMember: ctx.leagueMember ?? true });
  // 0x6dced9: anføreren over kandidaterne
  const capIn = ps.map((p, i) => ({ id: p.id, age: ages[i], rec: recs[i], a: 0, clubRep: o.rep, contract: data[i].contract ? { b44: data[i].contract!.b44, b4f: data[i].contract!.b4f } : null,
    days: joinedOf(p) ? Math.max(0, Math.round((Date.parse(date) - Date.parse(joinedOf(p)!)) / 86400000)) : 1000, b59: shAttr(p, 'loyalty'), b5b: shAttr(p, 'professionalism') }));
  const judgeJa = ctx.judge ? { ja: ctx.judge.ja, npMod20: ctx.judge.id % 20 } : null;
  let capIdx = chooseCaptain(capIn, judgeJa);
  // 0x6dcf5f: dødboldsskytterne
  const sp = flags & 0x80000 ? setPieceTakers(recs.map((r, i) => ({ worldRep: (r[0xd] | (r[0xe] << 8)), curRep: (r[0xb] | (r[0xc] << 8)), real: !ps[i].regen }))) : [];
  const input = (i: number, slot: { pos: number; att: number; lo: number; hi: number; tb: number; tf: number }, fl: number): RoleInput => ({
    id: ps[i].id, age: ages[i], atClub: true, joined: joinedOf(ps[i]) ? dayOf(joinedOf(ps[i])!) : { day: 0, year: 1990 }, realPlayer: !ps[i].regen, nationFlag11c: true,
    rec: recs[i], ...slot, flags: fl, mgrJoined, today, yearAgo, captain: i === capIdx, setPiece: sp.indexOf(i) + 1, data: data[i],
  });
  // 0x6dd057: taktikken
  const players: ChoicePlayer[] = ps.map((p, i) => ({
    ratings: recordRatings(p), b30: recs[i][0x30], b3b: recs[i][0x3b], quality: 0,
    score: (mask: number) => roleScore(input(i, { pos: mask, att: 0, lo: 0, hi: 0, tb: 0, tf: 0 }, flags)),
  }));
  const manager: ChoiceManager | null = o.tac ? { attacking: o.tac[0], freeRoles: o.tac[2], marking: o.tac[3], offside: o.tac[4], pressing: o.tac[5], favourite: o.tac[7] } : null;
  const { index } = chooseAiTactic({ players, mode: o.mode, manager, stats: o.stats ?? ctx.tacticStats, divisor: Math.max(8 * o.rep, 2000), flags });
  // 0x6e0b8e: 0x8967d0 gemmer klubbens indeks (0x896290 lægger kampens resultat til det efter kampen)
  setChosenTactic(ctx.clubId, index);
  const entry = AI_TACTIC_LIST[index];
  // 0x6dd07f: pladserne (11 fra taktikken, bænken med rand) og 0x6e2000
  const bench = ctx.benchSize ?? 5;
  const bpos = benchSlots(rand, bench);
  const slot = (j: number) => j < 11 ? { pos: entry.masks[j], att: entry.masks2[j], lo: entry.lo[j] >>> 0, hi: 0, tb: entry.tb[j], tf: entry.flags }
    : { pos: bpos[j - 11], att: 0, lo: 0, hi: 0, tb: 0, tf: entry.flags };
  const memo = new Map<string, number>();
  const sc = (i: number, s: ReturnType<typeof slot>, fl: number) => {
    const k = `${i}|${s.pos}|${s.att}|${s.lo}|${s.tb}|${fl}`;
    let v = memo.get(k);
    if (v === undefined) { v = roleScore(input(i, s, fl)); memo.set(k, v); }
    return v;
  };
  const out = assignSquad(ps.length, 11, bench, (j, i) => sc(i, slot(j), flags),
    (j, i) => sc(i, { ...slot(11 + j), lo: entry.lo[j] >>> 0, tb: entry.tb[j] }, flags | 0x200),
    (i) => ps[i].pos[0], (j) => (slot(j).pos & 1) === 1);
  // 0x6dd6bf: anføreren over de 11
  const xi = out.slice(0, 11);
  const c2 = chooseCaptain(xi.map((i) => (i === null ? null : capIn[i])), judgeJa);
  capIdx = c2 >= 0 ? xi[c2] ?? -1 : -1;
  // kamptruppen (de 11 + bænken) til konditionsmodulets 0x62c080 efter kampen (de ubrugte udskiftere får også træthed)
  if (ctx.cm && ctx.clubId !== undefined) setMatchSquad(ctx.clubId, out.filter((i): i is number => i !== null).map((i) => ps[i].id));
  return {
    index, entry, presetIndex: entry.preset, flags,
    lineup: xi.map((i) => (i === null ? null : ps[i].id)),
    bench: out.slice(11).filter((i): i is number => i !== null).map((i) => ps[i].id),
    captain: capIdx >= 0 ? ps[capIdx].id : null, setPieces: sp.map((i) => ps[i].id),
  };
}

/** AiPickCtx for en klub af spillets tilstand (adapteren): dato, frø, managerens viste Judging Ability/Potential (0x544410 af databasens
 *  værdi og stabens CA – uden CA: værdien som den er) og ankomst (seneste karrierelinje). */
export function aiPickCtx(clubId: number): AiPickCtx | null {
  if (!hasGame()) return null;
  const g = gs();
  const st = g.staff[g.clubs[clubId]?.manager ?? -1];
  // med Staff.cmNp (originalens spilstart, cmStaffInit.ts) de interne værdier i hukommelsen; ellers databasens værdi omregnet uden afbalancering
  const shownOf = (v: number, off: number) => npShown(st, off) ?? (st?.ca ? staffShown(st.ca, staffIntrinsic(v, st.ca)) : v);
  const cm = cmActive(g);
  const tac = gridTacOf(st);
  return {
    date: g.date, gameSeed: g.seed, clubId, manager: st && tac ? { id: st.id, ca: st.ca ?? st.rep * 2, tac } : null,   // ikke-spillerpostens +4 (CA) – 0x6ddab0's 0x544410/0x543f30
    judge: st ? { id: st.id, ja: shownOf(st.attrs.judgingAbility, 0x17), jp: shownOf(st.attrs.judgingPotential, 0x18), joined: st.career?.[st.career.length - 1]?.from } : null,
    ...(cm ? { cm, leagueAvg: leagueAverage(g), tacticStats: (g.aiTacticStats ??= newTacticStats()) } : {}),
  };
}

/** klubbens senest valgte taktik i listen (0x8967d0, pick_team og omrokeringen 0x6e1aa0) til 0x896290 efter kampen */
const chosenTactic = new Map<number, number>();
export function setChosenTactic(clubId: number | undefined, index: number): void { if (clubId !== undefined) chosenTactic.set(clubId, index); }
/** Tactics::record_tactic_result 0x896290 (kaldt ved 0x6ba9a0 efter kampen): begge holds taktik får resultatet – springes helt over, når et
 *  menneske styrer et af holdene (0x600a50). Kun kampe, gittermotoren spillede (dér er taktikken fra listen); zonemotorens kampe har ingen. */
export function recordAiTactics(home: number, away: number, hg: number, ag: number, human: (club: number) => boolean): void {
  const a = chosenTactic.get(home), b = chosenTactic.get(away);
  chosenTactic.delete(home); chosenTactic.delete(away);
  if (a === undefined || b === undefined || human(home) || human(away) || !hasGame()) return;
  const stats = (gs().aiTacticStats ??= newTacticStats());
  recordTacticResult(stats, a, hg, ag);
  recordTacticResult(stats, b, ag, hg);
}

/** anførerens/samspillets spillerdel (0x6e1cf0/0x6ebd70) af vores spiller: klubbens omdømme, kontraktens +0x44/+0x4f, dage i klubben,
 *  Loyalty (+0x59) og Professionalism (+0x5b) */
export function captainInputOf(p: Player, ctx: AiPickCtx, clubRep: number): CaptainInput {
  const date = ctx.date ?? '2001-08-18';
  const d = roleDataOf(p, ctx, ageOn(p.dob, date));
  return { id: p.id, age: ageOn(p.dob, date), rec: playerRecord(p), a: 0, clubRep, contract: d.contract ? { b44: d.contract.b44, b4f: d.contract.b4f } : null,
    days: joinedOf(p) ? Math.max(0, Math.round((Date.parse(date) - Date.parse(joinedOf(p)!)) / 86400000)) : 1000, b59: shAttr(p, 'loyalty'), b5b: shAttr(p, 'professionalism') };
}

/** 0x6e2f20 under kampen (genvalget 0x6e1090 og omrokeringen 0x6e1aa0, matchSubs.ts): samme værdi som før kampen med kampspilleren
 *  (karakterleddet, konditionen af +0x4d/+0x59) og holdets anfører/dødboldsskytter fra udtagelsen. */
export function matchRoleScore(p: Player, ctx: AiPickCtx, slot: { pos: number; att: number; lo: number; hi: number; tb: number; tf: number }, flags: number,
  match: RoleInput['match'], captain: boolean, setPiece: number, cache?: Map<number, { rec: number[]; data: RoleData; age: number }>): number {
  const date = ctx.date ?? '2001-08-18';
  let c = cache?.get(p.id);
  if (!c) { const age = ageOn(p.dob, date); c = { rec: playerRecord(p), data: roleDataOf(p, ctx, age), age }; cache?.set(p.id, c); }
  return roleScore({ id: p.id, age: c.age, atClub: true, joined: joinedOf(p) ? dayOf(joinedOf(p)!) : { day: 0, year: 1990 }, realPlayer: !p.regen, nationFlag11c: true,
    rec: c.rec, ...slot, flags, mgrJoined: ctx.judge ? (ctx.judge.joined ? dayOf(ctx.judge.joined) : { day: 0, year: 1900 }) : null,
    today: dayOf(date), yearAgo: dayOf(`${+date.slice(0, 4) - 1}${date.slice(4)}`), captain, setPiece, match, data: c.data });
}
