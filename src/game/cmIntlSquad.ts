// Landsholdenes udtagelse som originalen (national_teams.cpp; kun den originale database i ægte tilstand – cmIntlOn). Noter: ~/cm0102-engine/notes/international.md.
//
// Porteret:
//  - NationalTeams::init_tables 0x76a840: puljernes størrelse pr. land (antal spillere af nationaliteten n: i alt clamp(n, 10, 100); under 100 én gruppe,
//    ellers målmænd 10 og forsvar/midtbane/angreb 30; U21 clamp(n, 10, 50), under 50 én gruppe, ellers 5/15/15/15) og den første udtagelse ved spilstart
//    (A-holdet og U21 for alle lande med verdensdel, uden kamp).
//  - build_selection_pools 0x76abf0 (spilstart, 1/1, 15/4 og 1/8 – daily_update 0x76b100): spillere over 16 år med klub, efter hjemmeomdømmet (spillerpost +9,
//    qsort 0x778ed0 når gruppen er fuld, derefter indsættelse) i fire grupper 0x76d810 (målmand +0xf ≥ 15, forsvar +0x10/+0x11 ≥ 15, midtbane +0x12–+0x14 ≥ 15,
//    ellers angreb); andet statsborgerskab (+0x1e) kun uden landskampe (+0x22 = 0); U21-puljen: højst 21 år og under 5 landskampe.
//  - select_squads_for_fixture 0x76bab0 (ved kampens oprettelse 0x5aa680 og 14 dage før 0x76b100): A-holdet, 'B' (+0x4d 0x100) eller U21 (+0x4d 0x200) for begge
//    hold; en udtaget trup, hvis slutdato ligger højst 14 dage fra i dag, beholdes og forlænges til kampen.
//  - select_squad 0x76c120: kandidaterne fra puljerne (skadesfri 0x62c400, ingen karrierestop 0x7a7eb0, klub, ikke på et andet landshold, U21 højst 23 år,
//    spillere i 'B'-/U21-truppen kun efter deres slutdato, andet statsborgerskab kun når landet har højere omdømme +0x8e, Australiens omdømmegrænser
//    0x76c187), spillere i klubber i en anden verdensdel kun til venskabskampe mod et landshold med omdømme ≥ 0,8 · klubbens (0x76cce7) og til
//    turneringskampe, når klubbens ligaomdømme · 0,7 ≤ turneringens (0x76cc6c); truppens skabelon (26/24/22 positionsmasker 0x76c76b) fordelt med 0x6e2000
//    (assignSquad) og udvælgelsesværdien 0x6e2f20 (roleScore, flag 0x814 / 'B' 0x2100914 / U21 0x2000814); kun spillere, hvis positioner passer til pladsen,
//    kommer med; størrelserne 0x76d430 (slutrunde 23/23, 'B' 24/22, ellers 26/22).
//  - nyhederne: 0x76e0b0/0x76e3b0 (0x1d "X selected in Nation squad" til hver menneskeklub med udtagne spillere – op til tre navne, modstanderne i kampen og de
//    næste 13 dages kampe 0x76d560; "squad chosen for" ved slutrunder), 0x76f1a0/0x76f370 (0x1e: menneskets eget landshold – "squad to be decided"),
//    0x7706c0/0x770d20 (0x24 efter kampen: "X selected for Nation match" med originalens tekster efter resultat, anfører, mål, udvisning, kampens spiller
//    og brændt straffe; rand(2) vælger mellem to formuleringer – egen talrække).
// *Estimeret*: talrækken (cmRand i stedet for originalens rand), 0x53b620(+0x3d), 0x547d30 (forholdet til landsholdet), karantæner i turneringen 0x55d270,
// [this+0x24] (klubber med en kamp på dagen) og kontraktens +0x3d i venskabskampreglen, nøglelandet 0x9cf434 i puljens andet statsborgerskab, 23. plads i
// slutrundeskabelonen (ikke sat i originalen – udeladt), andet statsborgerskabs +0x85-gren, afbud og erstatninger (0x775cd0/0x775f90 – skadede melder afbud, og
// international.ts topUp fylder en trup under 16 eller uden målmand op af landets bedste og fyldspillerne), FIFA-ranglistens koefficient med én decimal
// (world-filens `fifa`) og turneringernes klasse 0x48dd70 pr. vores turneringer (cmFifa.ts).
import type { GameState, MatchReport, Player } from './types';
import { ageOn, addDays } from './dates';
import { asOwner, forEachHuman, isHumanClub } from './humans';
import { addNews } from './state';
import { cmRand, clubRepMem, clubDivRep, nationRepMem, staffJoined } from './cmPlayerData';
import { aiPickCtx, playerRecord, roleDataOf } from './engine/grid/aiTeam';
import { roleScore } from './engine/grid/roleScore';
import { assignSquad } from './engine/grid/pickTeam';
import { naturalMask } from './engine/grid/aiTacticChoice';
import { msvcQsort } from './engine/grid/subs';
import { INJ_TYPES } from './cmFitness';
import { onHoliday } from './cmHoliday';

/** skadetypernes kategori (0x9e7ad9 +0 – 0x62ec00) */
const INJ_CAT = INJ_TYPES.map((t) => t[0]);

/** 0 = A-holdet, 1 = 'B', 2 = U21 */
export type SquadSlot = 0 | 1 | 2;
/** squad slot-posten (0x14 bytes ved nation +0x32 + slot·0x14): +0x32 udtaget, +0x3a slutdato, +0x42/+0x43 størrelserne (0x76d430) */
export interface CmSquad { ids: number[]; from: string; until: string; max: number; second: number;
  /** slutrundens trup (0x76c304: landsholdsopholdet – 0x775cd0 trækker ingen ud undervejs) */
  finals?: 1;
  /** +0x45: afbud, der venter på menneskets erstatning (0x775f5a ++, 0x76d7b0 læser, 0x76d7e0 nulstiller) */
  wd?: number }
export interface CmIntlSquads {
  /** puljerne (0x76abf0) pr. land: [A-grupper, U21-grupper], hver gruppe spiller-id'er efter hjemmeomdømmet */
  pool?: Record<number, [number[][], number[][]]>;
  poolDate?: string;
  /** de udtagne trupper pr. land: [A, 'B', U21] */
  sq: Record<number, (CmSquad | null)[]>;
}

const st = (g: GameState): CmIntlSquads => {
  const s = (g.intl ??= { results: [], history: [] });
  return (s.cmSq ??= { sq: {} });
};

const contOf = (g: GameState, n: number) => g.cmNationCont?.[n] ?? -1;
const repW = (rec: number[], o: number) => rec[o] | (rec[o + 1] << 8);
const s16 = (v: number) => (v << 16) >> 16;

// ---------------------------------------------------------------- puljerne (0x76a840/0x76abf0)

/** antal spillere af nationaliteten (nation-postens word +0 – 0x76a840 tæller staff +0x1a) */
function nationCounts(g: GameState): Map<number, number> {
  const m = new Map<number, number>();
  for (const p of Object.values(g.players)) if (!p.virtual) m.set(p.nation, (m.get(p.nation) ?? 0) + 1);
  return m;
}

/** 0x76d810: puljens gruppe (0 målmand, 1 forsvar, 2 midtbane, 3 angreb; lande med få spillere kun gruppe 0) */
function group(rec: number[], count: number, u21: boolean): number {
  if (count < (u21 ? 50 : 100)) return 0;
  if (s8(rec[0xf]) >= 15) return 0;
  if (s8(rec[0x10]) >= 15 || s8(rec[0x11]) >= 15) return 1;
  if (s8(rec[0x12]) >= 15 || s8(rec[0x13]) >= 15 || s8(rec[0x14]) >= 15) return 2;
  return 3;
}
const s8 = (v: number) => (v << 24) >> 24;

/** gruppernes pladser (0x76a840) */
function caps(count: number, u21: boolean): number[] {
  const total = Math.max(10, Math.min(count, u21 ? 50 : 100));
  if (!u21) return total < 100 ? [total, 0, 0, 0] : [10, 30, 30, 30];
  return total < 50 ? [Math.max(10, Math.min(count, 100)), 0, 0, 0] : [5, 15, 15, 15];
}

/** én gruppe som originalen: tilføjet til den er fuld, så qsort (0x778ed0, højeste omdømme først) og indsættelse af bedre spillere */
function insert(list: { id: number; rep: number }[], cap: number, e: { id: number; rep: number }): void {
  if (!cap) return;
  if (list.length < cap) {
    list.push(e);
    if (list.length === cap) msvcQsort(list, (a, b) => b.rep - a.rep);
    return;
  }
  if (e.rep <= list[cap - 1].rep) return;
  let j = cap - 2;
  while (j >= 0 && !(e.rep < list[j].rep)) j--;
  list.splice(j + 1, 0, e);
  list.length = cap;
}

export function buildPools(g: GameState): void {
  const s = st(g);
  const counts = nationCounts(g);
  const work = new Map<number, [{ id: number; rep: number }[][], { id: number; rep: number }[][]]>();
  const get = (n: number) => { let w = work.get(n); if (!w) { w = [[[], [], [], []], [[], [], [], []]]; work.set(n, w); } return w; };
  const ids = Object.keys(g.players).map(Number).sort((a, b) => a - b);
  for (const id of ids) {
    const p = g.players[id];
    if (!p || p.virtual || !p.club || ageOn(p.dob, g.date) <= 16) continue;
    const rec = playerRecord(p);
    const rep = s16(repW(rec, 9));
    const age = ageOn(p.dob, g.date);
    for (let k = 0; k < 2; k++) {
      let n = p.nation;
      if (k === 1) {
        // andet statsborgerskab (+0x1e): kun uden landskampe for det første (+0x22 = 0)
        if (p.cmNation2 === undefined || p.cmNation2 < 0 || (p.caps ?? 0) > 0 || p.cmNation2 === p.nation) continue;
        n = p.cmNation2;
      }
      if (contOf(g, n) < 0) continue;
      const cnt = counts.get(n) ?? 0;
      const w = get(n);
      const gr = group(rec, cnt, false);
      insert(w[0][gr], caps(cnt, false)[gr], { id, rep });
      if (age <= 21 && (p.caps ?? 0) < 5) {
        const gu = group(rec, cnt, true);
        insert(w[1][gu], caps(cnt, true)[gu], { id, rep });
      }
    }
  }
  s.pool = {};
  for (const [n, w] of work) s.pool[n] = [w[0].map((l) => l.map((e) => e.id)), w[1].map((l) => l.map((e) => e.id))];
  s.poolDate = g.date;
}

// ---------------------------------------------------------------- udtagelsen (0x76c120)

/** 0x76c76b: truppens positionsmasker efter størrelsen (+0x42) */
const TEMPLATE: Record<number, number[]> = {
  26: [1, 1, 1, 0x202, 0x202, 0x204, 0x204, 0x204, 0x84, 0x804, 0x88, 0x808, 0xc, 0x210, 0x210, 0x210, 0x220, 0x90, 0x810, 0xa0, 0x820, 0x240, 0x240, 0x240, 0x240, 0x240],
  24: [1, 1, 0x202, 0x202, 0x204, 0x204, 0x204, 0x84, 0x804, 0x88, 0x808, 0xc, 0x210, 0x210, 0x210, 0x220, 0x90, 0x810, 0xa0, 0x820, 0x240, 0x240, 0x240, 0x240],
  // 23 (slutrunder): originalen sætter kun 22 masker – den 23. plads er ikke sat (udeladt her)
  23: [1, 1, 1, 0x202, 0x204, 0x204, 0x204, 0x204, 0x84, 0x804, 0xc, 0x210, 0x210, 0x220, 0x90, 0x810, 0xa0, 0x820, 0x240, 0x240, 0x240, 0x240],
};

export interface SelFixture {
  d: string; h: number; a: number;
  /** 'friendly' | 'euroq' | slutrundens navn ('wc', 'euro', 'copa', 'afcon', 'asian') */
  kind: string;
  slot: SquadSlot;
  /** slutrunde (0x76d940) */
  finals?: boolean;
}
/** comp.dat-id'erne for turneringernes omdømme (+0x69) */
const COMP_ID: Record<string, number> = { euroq: 396, wc: 404, euro: 406, copa: 407, afcon: 408, asian: 399 };

const playerMask = (p: Player) => naturalMask([...p.pos.slice(0, 8), p.side?.[2] ?? 1, p.side?.[0] ?? 1, p.side?.[1] ?? 1]);

/** 0x76d430 */
function sizes(f: SelFixture | null, slot: SquadSlot): [number, number] {
  if (f?.finals) return [23, 23];
  return slot === 1 ? [24, 22] : [26, 22];
}

function onOtherDuty(g: GameState, pid: number, nation: number, slot: SquadSlot, date: string): boolean {
  const all = st(g).sq;
  for (const [nk, list] of Object.entries(all)) {
    for (let s = 0; s < 3; s++) {
      const q = list[s];
      if (!q || !q.ids.includes(pid)) continue;
      const n = +nk;
      if (n !== nation) { if (q.until >= date) return true; continue; }
      if (s === slot) continue;
      // samme land: spillere i 'B'- eller U21-truppen kun efter deres slutdato (0x76ce40/0x76ce87)
      if (s !== 0 && date <= q.until) return true;
    }
  }
  return false;
}

/** 0x76c120(nation, slot, dato, kamp) – den nye trup (spiller-id'er) */
export function selectSquad(g: GameState, n: number, slot: SquadSlot, f: SelFixture | null): CmSquad {
  const s = st(g);
  if (!s.pool) buildPools(g);
  const date = g.date;
  const [max, second] = sizes(f, slot);
  const until = f ? f.d : addDays(date, 1);
  const pool = s.pool![n];
  const name = g.nations[n]?.name;
  // Australiens omdømmegrænser (0x76c187): venskabskampe/uden kamp 2250–8500, ellers som originalens turneringer (OFC/VM – ikke spillet hos os)
  const [minRep, maxRep] = name === 'Australia' ? (!f || f.kind === 'friendly' ? [2250, 8500] : f.kind === 'wc' ? [2750, 10000] : [2250, 8500]) : [-1, 10001];
  const myCont = contOf(g, n);
  const myRep = nationRepMem(g, n);
  const cands: Player[] = [];
  const kinds = slot === 2 ? [1] : [0];
  for (const kind of kinds) {
    for (const grp of pool?.[kind] ?? []) {
      for (const id of grp) {
        const p = g.players[id];
        if (!p || p.injury || p.cmRetire || !p.club) continue;
        if (onOtherDuty(g, id, n, slot, date)) continue;
        if (slot === 2 && ageOn(p.dob, date) > 23) continue;
        const club = g.clubs[p.club];
        const clubCont = club ? contOf(g, club.nation) : -1;
        if (f && clubCont !== myCont && clubCont >= 0) {
          if (f.kind === 'friendly') {
            if (slot !== 0) continue;
            const opp = f.h === n ? f.a : f.h;
            if (clubRepMem(g, p.club) * 0.8 > (g.intl?.info?.[opp]?.rep ?? nationRepMem(g, opp))) continue;
          } else {
            const lr = clubDivRep(g, p.club), cr = g.cmCompRep?.[COMP_ID[f.kind] ?? -1];
            if (lr !== null && cr !== undefined && lr * 0.7 > cr) continue;
          }
        }
        // andet statsborgerskab: ingen landskampe, og landet har højere omdømme end det første (samme verdensdel og +0x85 ≥ 5 ikke porteret – se filhovedet)
        if (p.nation !== n) {
          if ((p.caps ?? 0) > 0 || p.cmNation2 !== n) continue;
          if (!(myRep > nationRepMem(g, p.nation))) continue;
        }
        const rec = playerRecord(p);
        const rep = s16(repW(rec, 9));
        if (rep <= minRep || rep > maxRep) continue;
        if (!cands.includes(p)) cands.push(p);
      }
    }
  }
  const masks = (TEMPLATE[max] ?? TEMPLATE[26]).slice(0, max);
  const flags = slot === 1 ? 0x2100914 : slot === 2 ? 0x2000814 : 0x814;
  const ctx = aiPickCtx(-1) ?? { date, gameSeed: g.seed };
  const today = dayOf(date), yearAgo = dayOf(addDays(date, -365));
  const recs = cands.map(playerRecord);
  const memo = new Map<number, number>();
  const sc = (j: number, i: number) => {
    const k = j * 4096 + i;
    let v = memo.get(k);
    if (v === undefined) {
      const p = cands[i];
      const age = ageOn(p.dob, date);
      const d = roleDataOf(p, ctx as Parameters<typeof roleDataOf>[1], age);
      v = roleScore({
        id: p.id, age, atClub: false, joined: dayOf(staffJoined(p) ?? date), realPlayer: !p.regen, rec: recs[i], pos: masks[j], att: 0, lo: 0, hi: 0, tb: 0, tf: 0,
        flags, mgrJoined: null, today, yearAgo, captain: false, setPiece: 0, nationRep: nationRepMem(g, p.nation),
        data: { ...d, contract: null },
        tail: { caps: p.caps ?? 0, hasClub: !!p.club, leagueRep: clubDivRep(g, p.club) },
      });
      memo.set(k, v);
    }
    return v;
  };
  const out = assignSquad(cands.length, masks.length, 0, sc, sc, (i) => s8(recs[i][0xf]), (j) => (masks[j] & 1) === 1);
  const ids: number[] = [];
  out.forEach((i, j) => { if (i !== null && (playerMask(cands[i]) & masks[j])) ids.push(cands[i].id); });
  // 0x778ef0: truppen sorteres efter klub (klubløse sidst)
  ids.sort((a, b) => (g.players[a].club || 1e9) - (g.players[b].club || 1e9) || a - b);
  const q: CmSquad = { ids, from: date, until, max, second, ...(f?.finals ? { finals: 1 as const } : {}) };
  (s.sq[n] ??= [null, null, null])[slot] = q;
  return q;
}

const dayOf = (iso: string) => { const d = new Date(iso + 'T00:00:00Z'), y = d.getUTCFullYear(); return { day: Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000), year: y }; };
const daysBetween = (a: string, b: string) => Math.abs(Math.round((Date.parse(b) - Date.parse(a)) / 86400000));

/** truppen til kampen (eller den seneste udtagelse); null = ingen udtaget */
export function cmSquadOf(g: GameState, n: number, slot: SquadSlot): CmSquad | null {
  return st(g).sq[n]?.[slot] ?? null;
}

/** den menneskelige landstræners eget landshold (0x600a50) */
const humanNational = (g: GameState, n: number) => g.manager?.national?.nation === n || !!g.humans?.some((h) => h.manager?.national?.nation === n);

/** 0x76bab0: begge holds trupper til kampen (højst 14 dage frem), `opps` = landets modstandere i kampen og de næste 13 dage (0x76d560) */
export function selectForFixture(g: GameState, f: SelFixture, opps: (n: number) => number[], tour?: string): void {
  if (daysBetween(g.date, f.d) > 14 && f.d > g.date) return;
  for (const n of [f.h, f.a]) {
    const cur = cmSquadOf(g, n, f.slot);
    if (cur && cur.ids.length && daysBetween(g.date, cur.until) <= 14) {
      cur.from = g.date;
      if (cur.until < f.d) cur.until = f.d;
      continue;
    }
    // 0x76c58b/0x76c6bb: kun A-holdet – 'B' og U21 vælger mennesket kun med "Control All Teams" (0x5fd6b0 = HUMAN_MANAGER +0x9a06, ikke porteret: 0)
    if (f.slot === 0 && humanNational(g, n)) { squadRequestNews(g, n, f, opps(n), tour); continue; }
    const q = selectSquad(g, n, f.slot, f);
    callUpNews(g, n, f.slot, q, opps(n), tour);
  }
}

/** spilstarten (0x76a840): A-holdet og U21 for alle lande med verdensdel, uden kamp og uden nyheder */
export function initSquads(g: GameState): void {
  buildPools(g);
  for (let n = 1; n < g.nations.length; n++) {
    if (contOf(g, n) < 0) continue;
    selectSquad(g, n, 0, null);
    selectSquad(g, n, 2, null);
    // +0x43/+0x6b = 0: udtagelsen ved spilstarten gælder ikke som en trup (næste kamp vælger igen)
    const l = st(g).sq[n]!;
    for (const q of l) if (q) q.until = '0000-00-00';
  }
}

/** daily_update 0x76b100: puljerne 1/1, 15/4 og 1/8 */
export function cmIntlSquadDaily(g: GameState): void {
  const md = g.date.slice(5);
  if (!st(g).pool || md === '01-01' || md === '04-15' || md === '08-01') if (st(g).poolDate !== g.date) buildPools(g);
}

// ---------------------------------------------------------------- nyhederne

const fullName = (p: Player) => `${p.first} ${p.last}`.trim();

/** 0x76e0b0 (nyhed 0x1d) til hver menneskeklub med udtagne spillere; teksten 0x76e3b0 */
function callUpNews(g: GameState, n: number, slot: SquadSlot, q: CmSquad, opps: number[], tour?: string): void {
  const byClub = new Map<number, Player[]>();
  for (const id of q.ids) {
    const p = g.players[id];
    if (!p?.club || !isHumanClub(p.club)) continue;
    (byClub.get(p.club) ?? byClub.set(p.club, []).get(p.club)!).push(p);
  }
  for (const [cid, list] of byClub) {
    const club = g.clubs[cid];
    const k = list.length > 3 ? 'n' : String(list.length);
    const sfx = slot === 1 ? 'b' : slot === 2 ? 'u' : '';
    const nat = g.nations[n]?.name ?? '';
    const body = tour ? `t${k}` : `${k}${opps.length === 1 ? 'o' : opps.length > 1 ? 'l' : 'f'}`;
    asOwner(cid, () => addNews({ cat: 'general', key: tour ? 'cmint.h.tour' : `cmint.h.${list.length === 1 ? 'p1' : 'pn'}${sfx}`, params: {
      body, last: list[0].last, club: club?.short ?? club?.name ?? '', nation: nat, n: list.length,
      p1: fullName(list[0]), p2: list[1] ? fullName(list[1]) : '', p3: list[2] ? fullName(list[2]) : '',
      opp: opps.length === 1 ? g.nations[opps[0]]?.name ?? '' : '', opps: opps.map((o) => g.nations[o]?.name ?? '').join(' & '), ...(tour ? { tour } : {}),
    }, link: list.length === 1 ? { kind: 'player', id: list[0].id } : { kind: 'club', id: cid } }));
  }
}

/** 0x76f1a0 (nyhed 0x1e): menneskets landshold – "You have been requested to select a Scotland squad …". Felterne: 2 = besvaret (0 → knappen
 *  Respond 0x782fc3 og Continue Game spærret, 0x779df0/0x784100 sætter 1), 3 = slutrunde, 5–7 kampen, 8.. modstanderne (0x76d560). Truppen er
 *  landsholdets liste (club +0xd7) – den forrige udtagelse står der stadig; 0x76c614 tager skadede med mere end 10 dage tilbage ud af den.
 *  På ferie (deliver 0x785d40 → auto_respond 0x784100, 0x7844c9) udtager assistenten truppen med det samme (0x76c120 + 0x76c0f0). */
function squadRequestNews(g: GameState, n: number, f: SelFixture, opps: number[], tour?: string, until?: string): void {
  forEachHuman(() => {
    const nj = g.manager.national;
    if (nj?.nation !== n) return;
    const nat = g.nations[n]?.name ?? '';
    // 0x76c614: skadet (0x62c400 = 2) og mere end 10 dage tilbage (0x62ed70 +0x2e > 10) → ud af listen
    const list = humanList(g, n).filter((id) => { const p = g.players[id]; return !!p && !(p.injury && p.injury.days > 10); });
    nj.picks = list;
    const [max, min] = sizes(f, 0);
    const base = { body: tour ? 'rt' : opps.length === 1 ? 'ro' : opps.length > 1 ? 'rl' : 'rf', nation: nat,
      opp: opps.length === 1 ? g.nations[opps[0]]?.name ?? '' : '', opps: opps.map((o) => g.nations[o]?.name ?? '').join(' & '), ...(tour ? { tour } : {}),
      ans: 0, max, min, fd: f.d, fin: f.finals ? 1 : 0, until: until ?? f.d, oi: opps.join(',') };
    addNews({ cat: 'general', key: 'cmint.h.req', params: base });
    const item = g.news[0]?.key === 'cmint.h.req' ? g.news[0] : undefined;
    if (onHoliday(g) && item) {
      const q = selectSquad(g, n, 0, f);
      if (f.finals) { q.until = until ?? f.d; q.finals = 1; }
      nj.picks = q.ids.slice();
      callUpNews(g, n, 0, q, opps, tour);
      item.params.ans = 1;
    }
  });
}

/** landsholdets liste (club +0xd7; U21-holdets for slot 2) – til 0x7771c0 (cmCalendar.ts cmCallupRecord) */
export function cmNatList(g: GameState, n: number, slot: SquadSlot): number[] {
  return slot === 0 ? humanList(g, n) : (st(g).sq[n]?.[slot]?.ids ?? []).slice();
}

/** landsholdets liste (club +0xd7): menneskets udtagelse – ellers den seneste udtagelse */
function humanList(g: GameState, n: number): number[] {
  const nj = g.manager?.national;
  if (nj?.nation === n && nj.picks) return nj.picks.slice();
  return (st(g).sq[n]?.[0]?.ids ?? []).slice();
}

/** truppens dialog 0x779a50/0x77a270: antallet (0x7798c0 tæller listen) mod størrelserne 0x775520 (mindst) og 0x7754c0 (højst) */
export interface CmSquadAsk { nation: string; count: number; min: number; max: number; ok: boolean }

/** 0x782fc3 (0x1e, felt 2 = 0) og 0x782ff4 (0x22, felt 7 = 0, kun samme dag, 0x76d7b0 ≠ 0): nyheden har knappen Respond og skal besvares */
export function cmSquadAnswerOpen(g: GameState, item: { key: string; date: string; params: Record<string, string | number> } | undefined): boolean {
  if (!item) return false;
  const nj = g.manager?.national;
  if (item.key === 'cmint.h.req') return item.params.ans === 0 && !!nj && g.nations[nj.nation]?.name === item.params.nation;
  if (item.key === 'cmint.rq') {
    if (item.params.ans !== 0 || !nj || item.date !== g.date) return false;     // 0x783025: en anden dag → felt 7 = 1 (ingen knap)
    return (st(g).sq[nj.nation]?.[0]?.wd ?? 0) > 0;                              // 0x76d7b0
  }
  return false;
}

/** dialogens indhold (0x779a50/0x77a270) */
export function cmSquadAsk(g: GameState, item: { key: string; params: Record<string, string | number> }): CmSquadAsk | null {
  const nj = g.manager?.national;
  if (!nj) return null;
  const n = nj.nation;
  const q = st(g).sq[n]?.[0];
  const max = Number(item.params.max ?? q?.max ?? 26), min = Number(item.params.min ?? q?.second ?? 22);
  const count = humanList(g, n).length;
  return { nation: g.nations[n]?.name ?? '', count, min, max, ok: count >= min && count <= max };
}

/** Yes i dialogen: 0x779df0 (0x1e) – truppen bekræftes (0x76c0f0), felt 2 = 1 og indkaldelsesnyhederne 0x76e0b0 til klubberne; 0x77a610 (0x22) –
 *  nyheden 0x21 (0x76fd10) til klubberne for de spillere, der kom ind i dag, felt 7 = 1 og afbuddene nulstilles (0x76d7e0) */
export function cmSquadConfirm(g: GameState, item: { key: string; params: Record<string, string | number> }): boolean {
  const a = cmSquadAsk(g, item);
  if (!a?.ok) return false;
  const nj = g.manager.national!;
  const n = nj.nation;
  const ids = humanList(g, n);
  const l = (st(g).sq[n] ??= [null, null, null]);
  if (item.key === 'cmint.h.req') {
    const fin = item.params.fin === 1;
    const q: CmSquad = { ids, from: g.date, until: String(item.params.until || item.params.fd || g.date), max: a.max, second: a.min, ...(fin ? { finals: 1 as const } : {}) };
    l[0] = q;
    item.params.ans = 1;
    const opps = String(item.params.oi ?? '').split(',').filter(Boolean).map(Number);
    callUpNews(g, n, 0, q, opps, typeof item.params.tour === 'string' ? item.params.tour : undefined);
    return true;
  }
  if (item.key === 'cmint.rq') {
    const q = l[0];
    if (q) {
      for (const id of ids) if (!q.ids.includes(id)) { const p = g.players[id]; if (p) calledUpNews(g, p, n, 0); }
      q.ids = ids;
      q.wd = 0;
    }
    item.params.ans = 1;
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- 0x7706c0/0x770d20: klubbernes nyhed efter kampen

/** flagene pr. spiller (0x7707a8): mål 1/2/3/4+ = 2/8/0x20/0x40, udvist 4, kampens spiller 0x10, en brændt straffe 1 */
function flagsOf(rep: MatchReport, line: MatchReport['players'][number]): number {
  let f = line.goals >= 4 ? 0x40 : line.goals === 3 ? 0x20 : line.goals === 2 ? 8 : line.goals === 1 ? 2 : 0;
  if (line.red) f |= 4;
  if (rep.mom === line.id) f |= 0x10;
  const missed = rep.events.filter((e) => e.k === 'pen-miss' && (e as { p?: number }).p === line.id).length;
  if (missed === 1) f |= 1;
  return f;
}

/** de prøvede masker i rækkefølge pr. gren (0x7711c7 …): [maske, nøgle(r)] – to nøgler = rand(2) vælger (0 = den første) */
type Tree = [number, string | [string, string]][];
const CAP_W: Tree = [[0x44, 'a62d4c'], [0x14, 'a62c08'], [0x40, 'a62afc'], [0x24, 'a629a4'], [0x20, ['a628c4', 'a627c0']], [8, ['a626f0', 'a625f4']], [0x12, ['a62534', 'a623e4']],
  [0x10, ['a62334', 'a621f0']], [2, ['a62144', 'a62074']], [4, ['a61fd0', 'a61ed0']], [1, 'a61e00'], [0, ['a61d10', 'a61c4c']]];
const CAP_D: Tree = [[0x14, 'a61b04'], [0x40, 'a619f8'], [0x24, 'a6189c'], [0x20, ['a617bc', 'a616b4']], [8, ['a615e4', 'a614e4']], [0x12, ['a613f8', 'a612a4']],
  [0x10, ['a611cc', 'a61084']], [2, ['a60fb0', 'a60eb4']], [4, ['a60de8', 'a60cbc']], [1, 'a60be8'], [0, ['a60af8', 'a60a04']]];
const CAP_L: Tree = [[0x24, 'a608a8'], [0x20, ['a607c4', 'a606b0']], [8, ['a605e0', 'a604d4']], [2, ['a60428', 'a60350']], [4, ['a60274', 'a60168']], [1, 'a60094'], [0, ['a5ffa4', 'a5fea4']]];
const ONE_W: Tree = [[0x44, 'a5f638'], [0x14, 'a5f504'], [0x40, 'a5f410'], [0x24, 'a5f2c8'], [0x20, ['a5f1f0', 'a5f104']], [8, ['a5f03c', 'a5ef58']], [0x12, ['a5eea4', 'a5ed70']],
  [0x10, ['a5ecc8', 'a5eb8c']], [2, ['a5eae8', 'a5ea34']], [4, ['a5e998', 'a5e8dc']], [1, 'a5e814'], [0, ['a5e72c', 'a5e678']]];
const ONE_D: Tree = [[0x14, 'a5e540'], [0x40, 'a5e44c'], [0x24, 'a5e2f0'], [0x20, ['a5e218', 'a5e12c']], [8, ['a5e064', 'a5df80']], [0x12, ['a5dea0', 'a5dd68']],
  [0x10, ['a5dcc0', 'a5db80']], [2, ['a5dadc', 'a5da10']], [4, ['a5d974', 'a5d87c']], [1, 'a5d7b0'], [0, ['a5d6c8', 'a5d5e4']]];
const ONE_L: Tree = [[0x24, 'a5d494'], [0x20, ['a5d3b4', 'a5d2b8']], [8, ['a5d1f0', 'a5d0fc']], [2, ['a5d058', 'a5cf9c']], [4, ['a5cec8', 'a5cdc4']], [1, 'a5ccf8'], [0, ['a5cc18', 'a5cb4c']]];

function pick(tree: Tree, f: number, r: number): string {
  for (const [m, k] of tree) if (m === 0 || (f & m) === m) return typeof k === 'string' ? k : k[r];
  return '';
}

/** 0x770d20's valg af brødtekst (nøglerne er tekstens adresse i exe'en): resultatet, anføreren i klubbens spillere, antallet, flagene for den første og anden */
export function reportKeys(res: 'W' | 'D' | 'L', cap: boolean, count: number, f0: number, f1: number, rnd: number): { main: string; tail: string } {
  if (!cap && count > 1) return { main: count > 4 ? { W: 'a5fc08', D: 'a5fb30', L: 'a5fa58' }[res] : { W: 'a5f968', D: 'a5f878', L: 'a5f788' }[res], tail: '' };
  const main = pick(cap ? { W: CAP_W, D: CAP_D, L: CAP_L }[res] : { W: ONE_W, D: ONE_D, L: ONE_L }[res], f0, rnd);
  // 0x772b25: de andre spillere fra klubben
  const tail = !cap || count === 1 ? '' : count === 2 ? ((f1 & 0x7a) && res === 'W' ? 'a5fe64' : 'a5fe24') : count > 4 ? 'a5fdc0' : 'a5fd70';
  return { main, tail };
}

/** kampens rundenavn (0x4bff70; "Friendly" med lille f) */
export type FixName = 'friendly' | 'qual' | 'group' | 'R16' | 'QF' | 'SF' | '3P' | 'F';

/** 0x7706c0: efter en A-landskamp – én nyhed pr. menneskeklub med spillere, der spillede */
export function cmIntlMatchReport(g: GameState, rep: MatchReport, home: number, away: number, hg: number, ag: number, fix: FixName, captains: [number | undefined, number | undefined]): void {
  const played = rep.players.filter((l) => l.minutes > 0);
  for (const side of [0, 1] as const) {
    const nat = side === 0 ? home : away, opp = side === 0 ? away : home;
    const mine = side === 0 ? hg : ag, theirs = side === 0 ? ag : hg;
    const byClub = new Map<number, { p: Player; f: number }[]>();
    for (const l of played) {
      if (l.team !== side) continue;
      const p = g.players[l.id];
      if (!p?.club || !isHumanClub(p.club)) continue;
      (byClub.get(p.club) ?? byClub.set(p.club, []).get(p.club)!).push({ p, f: flagsOf(rep, l) });
    }
    for (const [cid, all] of byClub) {
      const count = all.length;
      const list = all.slice(0, 4);
      const capIdx = list.findIndex((x) => x.p.id === captains[side]);
      if (capIdx > 0) [list[0], list[capIdx]] = [list[capIdx], list[0]];
      // 0x770b19: plads 1–3 sorteres efter flagene (højeste først)
      const rest = list.slice(1).sort((a, b) => b.f - a.f);
      const ord = [list[0], ...rest];
      const rnd = cmRand(g.seed ?? 0, cid, Math.round(Date.parse(g.date) / 86400000), 0x7706c0 + nat)(2);
      const { main, tail } = reportKeys(mine > theirs ? 'W' : mine === theirs ? 'D' : 'L', capIdx >= 0, count, ord[0].f, ord[1]?.f ?? 0, rnd);
      const club = g.clubs[cid];
      asOwner(cid, () => addNews({ cat: 'general', key: count === 1 ? 'cmint.r.h1' : 'cmint.r.hn', params: {
        body: main, tail, last: ord[0].p.last, player: fullName(ord[0].p), club: club?.short ?? club?.name ?? '', nation: g.nations[nat]?.name ?? '', opp: g.nations[opp]?.name ?? '',
        score: `${Math.max(hg, ag)}-${Math.min(hg, ag)}`, fix, n: count, n1: count - 1,
        list: (count > 4 ? [] : ord).map((x) => fullName(x.p)).join(' & '),
        p2: ord[1] ? fullName(ord[1].p) : '', others: ord.slice(1).map((x) => fullName(x.p)).join(' & '),
      }, link: count === 1 ? { kind: 'player', id: ord[0].p.id } : { kind: 'club', id: cid } }));
    }
  }
}

/** slutrundens trupper (0x76c120 med en slutrundekamp: 23/23) – kaldt ved lodtrækningen; `until` = finaledagen */
export function selectFinals(g: GameState, field: number[], tour: string, first: string, until: string): void {
  for (const n of field) {
    if (humanNational(g, n)) { squadRequestNews(g, n, { d: first, h: n, a: n, kind: tour, slot: 0, finals: true }, [], tour, until); continue; }
    const q = selectSquad(g, n, 0, { d: first, h: n, a: n, kind: tour, slot: 0, finals: true });
    q.until = until;
    q.finals = 1;
    callUpNews(g, n, 0, q, [], tour);
  }
}

// ---------------------------------------------------------------- afbud og erstatninger (0x775cd0/0x775f90)

/** 0x456740: datoen a ligger efter b */
const after = (a: string, b: string) => a > b;

/** NationalTeams::withdraw_injured_player 0x775cd0 (kaldt af Injury::add_injury 0x62d994 for en spiller på et landshold, staff +0x24): skadet i mindst
 *  14 dage → ud af truppen, hvis den stadig gælder (slutdatoen +0x3a efter i dag) og holdet ikke er på slutrundeophold (listen this+0: 0x76c304 –
 *  under en slutrunde bliver han); skadetype 81 (0x51 – karrierens slut) tages ud uden nyhed. Ellers nyheden 0x20 til hans klub (0x76f7d0), ud af
 *  truppen (0x7762f0) og en erstatning (0x775f90) – menneskets landshold får i stedet nyheden 0x22 (0x7701f0) og vælger selv. */
export function cmWithdrawInjured(g: GameState, p: Player, days: number, type: number): void {
  if (days < 14) return;                                                             // 0x775cd6
  for (const [nk, list] of Object.entries(st(g).sq)) {
    for (let slot = 0 as SquadSlot; slot < 3; slot = (slot + 1) as SquadSlot) {
      const q = list[slot];
      if (!q || !q.ids.includes(p.id)) continue;
      const n = +nk;
      const drop = () => { q.ids = q.ids.filter((id) => id !== p.id); };
      if (type === 0x51) { drop(); continue; }                                       // 0x775db4
      if (!after(q.until, g.date)) continue;                                         // 0x775e1a
      if (q.finals) continue;                                                        // 0x775e45: slutrundeophold (til holdet er ude)
      const ill = (INJ_CAT[type] ?? 1) === 0;                                        // 0x62ec00: kategori 0 = sygdom
      withdrawnNews(g, p, n, slot, ill);
      drop();
      const human = humanNational(g, n) && slot === 0;
      if (human) { q.wd = (q.wd ?? 0) + 1; replacementNeededNews(g, p, n, slot, ill, q); continue; }  // 0x775f5a +0x45++, 0x775f68 (menneskets A-hold)
      callUpReplacement(g, n, slot, p, q);
    }
  }
  const nj = g.manager?.national;
  if (nj?.picks?.includes(p.id) && days >= 14 && type !== 0x51) nj.picks = nj.picks.filter((id) => id !== p.id);
}

/** NationalTeams::call_up_replacement 0x775f90: den første i landets pulje (samme gruppe 0x76d810 som den skadede, i puljens rækkefølge) med en
 *  plads, der passer (0x5b7d20-maskerne & 0x7f), skadesfri (0x62c400), ikke på vej på pension ('B'/U21, 0x7a7eb0), ikke på et andet lands hold, ikke i
 *  en anden af landets trupper, der stadig gælder (0x456770); andet statsborgerskab kun uden landskampe. Ind i truppen (0x776250) og nyheden 0x21
 *  til hans klub (0x76fd10). Ingen fundet: ingen erstatning. */
function callUpReplacement(g: GameState, n: number, slot: SquadSlot, out: Player, q: CmSquad): void {
  const s = st(g);
  if (!s.pool) buildPools(g);
  const u21 = slot === 2;
  const cnt = [...nationCounts(g)].find(([k]) => k === n)?.[1] ?? 0;
  const gr = group(playerRecord(out), cnt, u21);
  const pool = s.pool![n]?.[u21 ? 1 : 0]?.[gr] ?? [];
  const mask = playerMask(out);
  for (const id of pool) {
    const c = g.players[id];
    if (!c || c.id === out.id || c.virtual) continue;
    if (c.injury) continue;                                                          // 0x62c400
    if (c.cmRetire && slot !== 0) continue;                                          // 0x7a7eb0
    if (q.ids.includes(c.id)) continue;
    // på et landshold: et andet land → nej; en af landets andre trupper, der stadig gælder → nej (0x456770)
    let elsewhere: { n: number; s: number; q: CmSquad } | null = null;
    for (const [nk, list] of Object.entries(s.sq)) list.forEach((x, k) => { if (x && x !== q && x.ids.includes(c.id) && !elsewhere) elsewhere = { n: +nk, s: k, q: x }; });
    const e = elsewhere as { n: number; s: number; q: CmSquad } | null;
    if (e && e.n !== n) continue;
    if (c.nation !== n && (e || (c.caps ?? 0) > 0 || c.cmNation2 !== n)) continue;   // 0x7760b4–0x7760e9
    if (!(playerMask(c) & mask & 0x7f)) continue;                                   // 0x776125
    if (e) {
      if (e.s === slot) continue;
      if (!after(g.date, e.q.until)) continue;                                       // 0x77618d: hans anden trup gælder stadig
      if (e.s === 0 && humanNational(g, n)) continue;
      e.q.ids = e.q.ids.filter((x) => x !== c.id);                                   // 0x7762f0
    }
    q.ids.push(c.id);                                                                // 0x776250
    calledUpNews(g, c, n, slot);
    return;
  }
}

/** 0x775610: truppens navn ("Scotland", "Scotland 'B'", "Scotland Under 21") – nøglens endelse */
const sqSfx = (slot: SquadSlot) => (slot === 2 ? 'u' : slot === 1 ? 'b' : '');

/** 0x76f7d0/0x76fa40 (nyhed 0x20) til spillerens klub (kun et menneskes): "X removed from Nation squad" */
function withdrawnNews(g: GameState, p: Player, n: number, slot: SquadSlot, ill: boolean): void {
  if (!p.club || !isHumanClub(p.club)) return;
  asOwner(p.club, () => addNews({ cat: 'injury', key: 'cmint.wd', params: { body: `${ill ? 'will' : 'winj'}${sqSfx(slot)}`, player: fullName(p), nation: g.nations[n]?.name ?? '' }, link: { kind: 'player', id: p.id } }));
}
/** 0x76fd10/0x76ff40 (nyhed 0x21) til spillerens klub: "X brought in to Nation squad" */
function calledUpNews(g: GameState, p: Player, n: number, slot: SquadSlot): void {
  if (!p.club || !isHumanClub(p.club)) return;
  asOwner(p.club, () => addNews({ cat: 'general', key: 'cmint.ci', params: { body: `cin${sqSfx(slot)}`, player: fullName(p), nation: g.nations[n]?.name ?? '' }, link: { kind: 'player', id: p.id } }));
}
/** 0x7701f0/0x7703f0 (nyhed 0x22) til landstræneren (mennesket): "X removed from Nation squad" – "A replacement player must be called up instead."
 *  Felt 7 = 0 → Respond (kun samme dag). På ferie (auto_respond 0x7846d0) kalder assistenten en erstatning ind (0x775f90). */
function replacementNeededNews(g: GameState, p: Player, n: number, slot: SquadSlot, ill: boolean, q: CmSquad): void {
  forEachHuman(() => {
    const nj = g.manager.national;
    if (nj?.nation !== n) return;
    if (nj.picks) nj.picks = nj.picks.filter((id) => id !== p.id);
    addNews({ cat: 'general', key: 'cmint.rq', params: { body: `${ill ? 'xill' : 'xinj'}${sqSfx(slot)}`, player: fullName(p), nation: g.nations[n]?.name ?? '', ans: 0 }, link: { kind: 'player', id: p.id } });
    const item = g.news[0]?.key === 'cmint.rq' ? g.news[0] : undefined;
    if (onHoliday(g) && item) {
      callUpReplacement(g, n, slot, p, q);
      nj.picks = q.ids.slice();
      q.wd = 0;
      item.params.ans = 1;
    }
  });
}
