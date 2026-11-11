// Udskiftningerne koblet ind i gittermotoren (createGridMatch) – de rene funktioner i subs.ts (notes/6d0b60-substitutions.md) på
// motorens spillere (GP). Fabrikken makeMatchSubs får kampens tilstand og giver de kroge, limen kalder:
//
//   gate(entry)       sub_6c54a0 0x6c581f/0x6c59c8: computerens genvalg ved hver dødbold (rand(50) for hvert computerhold)
//   treat()           sub_6d0b60 (kaldt fra 0x6ba73e efter et tik med engine+0x8eb5): de skadede behandles/bæres ud
//   sendOff(p)        sub_6cda20: rødt kort – plads −3, 6cdd50(p, −3), omrokering/genvalg for computeren
//   human(...)        menneskets udskiftning: lægges i kø og sker ved næste dødbold (engine+0x8eb4 "udskiftning venter", 0x6b9aea – *estimeret*
//                     at den samme kø gælder; originalens skærm venter selv på dødbolden)
//
// Spillernes plads (+0x19) er GP.slot: ≥ 0 på banen, −1 bænk, −2 skadet ude, −3 udvist, −4 skiftet ud (active = slot ≥ 0).
// Pladsens taktik (positionsflag 0x717410/0x717450, instruktioner 0x5b5270, taktikbyte 0x5b57c0, tabelpladsen) følger pladsen, ikke spilleren:
// den, der overtager en plads, får dens felter (slotTab, opdateret fra spilleren på pladsen før hvert skift).
// Udvælgelsesværdien 0x6e2f20 = roleScore.ts (hele funktionen, kontrolleret mod originalen) for hold med en computerudtagelse (env.aiPick);
// ellers *estimeret*: subs.ts estimatedQuality (CA, omdømme, karakter, kondition – samme ind i 77 %);
// hold+0x1a/+0x16/+0x19 (leagueBranch/b16/assisted) = nej; 0x6bbb60 (samspil/rul) og 0x6bbf60 (mandsopdækning) efter et skift er ikke porteret;
// 0x6e0230 (formationsvurderingen i omrokeringen med 11 på banen) er ikke kaldt.

import type { Player } from '../../types';
import { ATTRS } from '../../attributes';
import * as H from './helpers';
import * as L from './loop';
import { actionSkills } from './challenge';
import {
  afterSendOff, cappedMinute, combineScore, conditionTerm, deadBallGate, estimatedQuality, fillVacatedSlot, positionFactor, rearrange, reselect,
  treatInjured, type PositionRecord, type SlotSpec, type SubPlayer,
} from './subs';
import type { GP, GridMatchState } from './gridMatch';
import { matchRoleScore, type AiPickCtx } from './aiTeam';
import type { RoleData } from './roleScore';

type Side = 0 | 1;
type Rand = (n: number) => number;

/** pladsens felter (det, der følger pladsen, når en anden spiller overtager den) */
interface SlotFields { pos: number; posAttack: number; instr: bigint; tacticByte: number; pslot: number; tbl: GP['tbl']; baseX: number; baseY: number }
/** de bytes, udskiftningerne læser og skriver ud over GP (+0x00 idx, +0x1a, +0x1e, +0x1f/+0x20/+0x21/+0x22) */
interface SubState { idx: number; prevSlot: number; substituted: boolean; minuteOn: number; minuteOff: number; minuteRed: number; minuteInjured: number }

export interface MatchSubsEnv {
  m: GridMatchState;
  gp: GP[];
  rand: Rand;
  /** computeren vælger for holdet (ctx.ai – menneskets hold skifter aldrig selv) */
  ai: (s: Side) => boolean;
  /** hold+0x17 ved kampstart = min(turneringens +0x4d >> 4, antal på bænken) (0x6dbac0) */
  subs: [number, number];
  /** engine+0x8ed4 (495/990/1155/1320) */
  periodEnd: () => number;
  /** klubbernes omdømme (club +0x80) og turneringstypen (+0x3a) til flagene i 0x6e1090 */
  rep: [number, number];
  compType: number;
  onSub?: (on: GP, off: GP, auto: boolean) => void;
  onCarriedOff?: (p: GP) => void;
  /** computerens udtagelse pr. side (aiTeam.ts): rammerne, anføreren (hold+0x3b) og dødboldsskytterne (+6/+0xa/+0xe) – 0x6e2f20 under kampen */
  aiPick?: [{ ctx: AiPickCtx; captain: number | null; setPieces: number[] } | null, { ctx: AiPickCtx; captain: number | null; setPieces: number[] } | null];
}

const sh = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
/** spillerpostens +0x0f..+0x1a og fødderne (som aiTeam.ts' posRecord: højre +0x17 = side[2], venstre +0x18 = side[0], midt +0x19 = side[1]) */
const recOf = (p: Player): PositionRecord => ({
  gk: p.pos[0], sw: p.pos[1], d: p.pos[2], dm: p.pos[3], m: p.pos[4], am: p.pos[5], f: p.pos[6], wb: p.pos[7],
  r: p.side?.[2] ?? 20, l: p.side?.[0] ?? 20, c: p.side?.[1] ?? 20, free: 1, foot30: p.feet?.[0] ?? 0, foot3b: p.feet?.[1] ?? 0,
});

/** Bænken, når computerens udtagelse (pick_team, aiTeam.ts – den bruges, når den findes) ikke er med: *estimeret* taktikkens bænk og så de
 *  oprindelige startere, som opstillingen ikke brugte, til samme antal (højst 9). Menneskets bænk er taktikkens. */
export function benchFor(ps: Map<number, Player>, lineup: number[], tactic: { lineup: number[]; bench?: number[] }, ai: boolean): number[] {
  const used = new Set(lineup);
  const ok = (id: number) => { const p = ps.get(id); return !!p && !used.has(id) && !p.injury && !(p.banned > 0) && !(ai && p.reserves); };
  const bench = (tactic.bench ?? []).filter(ok);
  if (!ai) return bench.slice(0, 9);
  const n = Math.min(9, (tactic.bench ?? []).length);
  for (const id of tactic.lineup) if (bench.length < n && ok(id) && !bench.includes(id)) bench.push(id);
  return bench.slice(0, n);
}

export function makeMatchSubs(env: MatchSubsEnv) {
  const { m, gp, rand } = env;
  const st = new Map<GP, SubState>();
  const slotTab: SlotFields[][] = [[], []];
  const lastChange: [number, number] = [0, 0];                                        // engine+0x8ecc+2·side
  const subsLeft: [number, number] = [0, 0];
  const benchSize: [number, number] = [0, 0];
  const pending: { side: Side; out: GP; inn: GP }[][] = [[], []];
  const fieldsOf = (q: GP): SlotFields => ({ pos: q.pos, posAttack: q.posAttack, instr: q.instr, tacticByte: q.tacticByte, pslot: q.pslot, tbl: q.tbl, baseX: q.baseX, baseY: q.baseY });
  for (const s of [0, 1] as Side[]) {
    const side = gp.filter((q) => q.side === s);
    side.forEach((q, i) => {
      st.set(q, { idx: i, prevSlot: q.slot, substituted: false, minuteOn: -1, minuteOff: -1, minuteRed: -1, minuteInjured: -1 });
      if (q.slot >= 0) slotTab[s][q.slot] = fieldsOf(q);
    });
    benchSize[s] = side.filter((q) => q.slot === -1).length;
    subsLeft[s] = Math.max(0, Math.min(env.subs[s], benchSize[s]));                    // 0x6dbac0–0x6dbaed
  }
  const S = (q: GP) => st.get(q)!;
  const sideOf = (s: Side) => gp.filter((q) => q.side === s && st.has(q)).sort((a, b) => S(a).idx - S(b).idx);
  const minute = () => cappedMinute(m.clock, env.periodEnd());
  /** pladsernes felter fra spillerne på dem (aiRetune m.fl. ændrer instruktionerne undervejs) */
  const refresh = (s: Side) => { for (const q of gp) if (q.side === s && q.active && q.slot >= 0 && q.slot <= 10) slotTab[s][q.slot] = fieldsOf(q); };
  const toSub = (q: GP): SubPlayer => {
    const x = S(q);
    return { id: q.src.id, idx: x.idx, slot: q.slot, prevSlot: x.prevSlot, condition: q.condition, pendingCondition: q.pendingCond, rating: q.rating, gkRating: q.gkRating,
      mustLeave: !!q.b1c, treat: !!q.b1d, substituted: x.substituted, minuteOn: x.minuteOn, minuteOff: x.minuteOff, minuteInjured: x.minuteInjured,
      injuredBy: q.injuredBy ? q.injuredBy.src.id : null };
  };
  const byId = (s: Side, id: number) => gp.find((q) => q.side === s && q.src.id === id)!;
  /** spilleren overtager pladsens felter; 0x6eecb0(p, 0): positionstilpasningen +0x37 og handlingsevnerne regnes igen */
  const applySlot = (q: GP, slot: number, f: SlotFields | undefined) => {
    q.slot = slot;
    if (f) { q.pos = f.pos; q.posAttack = f.posAttack; q.instr = f.instr; q.tacticByte = f.tacticByte; q.pslot = f.pslot; q.tbl = f.tbl; q.baseX = f.baseX; q.baseY = f.baseY; }
    q.isKeeper = q.pos === L.POS.keeper;
    q.form = Math.min(0, H.positionFit(q.pos, q.posAttack, q.posR, sh(q.src, 'versatility'), (Number(q.instr & 0xffffffffn) & 0x200000) !== 0));
    q.skill = actionSkills(q);
    if (q.view) {
      const v = q.view as unknown as Record<string, unknown>;
      v.posFlags = q.pos; v.pos = q.pos; v.posAttack = q.posAttack; v.instr = { lo: Number(q.instr & 0xffffffffn), hi: Number(q.instr >> 32n) };
    }
  };
  /** 0x6cdd50: ud af cellelisterne og markeringerne */
  const detach = (q: GP) => {
    q.active = false;
    for (const o of gp) { if (o.marks === q) o.marks = null; if (o.markers.includes(q)) o.markers = o.markers.filter((x) => x !== q); }
    q.marks = null; q.markers = [];
    // boldholderen/modtageren røres ikke: løkken giver bolden til en ny skytte, når boldholderen ikke er på banen (sub_6ceb90, loop.ts)
  };
  /** 0x6cdd00: ind på banen ved sidelinjen (x 8, y 6) */
  const comeOn = (q: GP, slot: number, s: Side) => {
    q.active = true; applySlot(q, slot, slotTab[s][slot]); q.x = 8; q.y = 6; q.busy = 0; S(q).minuteOn = minute();
  };
  const goOff = (q: GP) => { const x = S(q); if (q.slot >= 0) x.prevSlot = q.slot; detach(q); q.slot = -4; x.substituted = true; x.minuteOff = minute(); };

  const posOf = (p: SubPlayer) => byIdAny(p.id).pos;
  const attOf = (p: SubPlayer) => byIdAny(p.id).posAttack;
  const byIdAny = (id: number) => gp.find((q) => q.src.id === id)!;
  const specOf = (s: Side) => (slot: number) => { const f = slotTab[s][slot]; return { instrLo: f ? Number(f.instr & 0xffffffffn) : 0, instrHi: f ? Number(f.instr >> 32n) : 0, tacticByte: f?.tacticByte ?? 0x12 }; };
  /** sub_6e2f20 under kampen: P sikker (positionFactor), konditionens tidlige retur sikker (conditionTerm), resten *estimeret* (estimatedQuality) */
  const roleCache = new Map<number, { rec: number[]; data: RoleData; age: number }>();
  /** sub_6e2f20 under kampen: hele værdien (roleScore.ts via aiTeam.ts matchRoleScore) med kampspilleren, anføreren og dødboldsskytterne fra
   *  udtagelsen (pick_team); uden udtagelse (env.aiPick mangler) som før: P og konditionens tidlige retur sikre, resten *estimeret* */
  const scoreOf = (s: Side) => (p: SubPlayer, spec: SlotSpec, flags: number) => {
    const q = byIdAny(p.id);
    const qc = { clock: m.clock, periodEnd: env.periodEnd(), humanControlled: false };
    const ap = env.aiPick?.[s];
    if (ap) {
      const sp = ap.setPieces.indexOf(q.src.id) + 1;
      return matchRoleScore(q.src, ap.ctx, { pos: spec.pos, att: spec.att, lo: spec.instrLo >>> 0, hi: spec.instrHi >>> 0, tb: spec.tacticByte, tf: m.teamFlags[s] }, flags,
        { p, ctx: qc }, ap.captain === q.src.id, sp, roleCache);
    }
    const P = positionFactor(recOf(q.src), spec.pos, spec.att, flags);
    const ct = conditionTerm(p, { flags, staticSum: 0, staticCount: 0, staticAdd: 0, statusBonus: 0, dbFitness: 0, instrLo: spec.instrLo, teamFlags: m.teamFlags[s] }, qc, P);
    if ('final' in ct) return ct.final;
    return combineScore(P, estimatedQuality(p, q.src.ca, (q.src.rep ?? 50) * 100, qc), flags);
  };

  /** sub_6e1090(keeperOut) for et computerhold, efterfulgt af omrokeringen 0x6e1aa0, når nogen kom ind */
  const doReselect = (s: Side, keeperOut: boolean) => {
    if (subsLeft[s] <= 0) return;                                                    // 0x6e10af (intet rand)
    refresh(s);
    const list = sideOf(s);
    const res = reselect(rand, {
      players: list.map(toSub), subsLeft: subsLeft[s], benchSize: benchSize[s], keeperOut, clock: m.clock, periodEnd: env.periodEnd(),
      posOf, attOf, slotSpec: specOf(s), score: scoreOf(s),
      flags: { national: false, assisted: false, compType: env.compType, ownRep: env.rep[s], oppRep: env.rep[1 - s], leagueBranch: false, b16: false, humanClubOption: false },
    });
    subsLeft[s] = res.subsLeft;
    const before = new Map(list.map((q) => [q, q.slot]));
    res.players.forEach((after) => {
      const q = byId(s, after.id), b = before.get(q)!;
      if (b === -1 && after.slot >= 0) comeOn(q, after.slot, s);
      else if (after.slot === -4 && b !== -4) goOff(q);
      else if (b >= 0 && after.slot >= 0 && after.slot !== b) applySlot(q, after.slot, slotTab[s][after.slot]);
    });
    res.on.forEach((on, i) => { const off = res.off[i]; if (off) env.onSub?.(byId(s, on.id), byId(s, off.id), true); });
    if (res.changed) doRearrange(s);
  };
  /** sub_6e1aa0: markspillerne fordeles på deres egne pladser (0x6e2000 med flag 0x8800) */
  const doRearrange = (s: Side) => {
    refresh(s);
    const list = sideOf(s);
    const r = rearrange({ players: list.map(toSub), posOf, attOf, slotSpec: specOf(s), score: scoreOf(s), flags: 0x8800 });
    for (const after of r.moved) { const q = byId(s, after.id); if (q.slot !== after.slot) applySlot(q, after.slot, slotTab[s][after.slot]); }
  };
  /** 0x6cdd50(p, mode) med mode ≠ −1: en markspiller overtager keeperens (eller den udvistes) plads, når computeren vælger */
  const fillFor = (s: Side, q: GP, slot: number, mode: number, wasKeeper: boolean) => {
    const leaving = { ...toSub(q), slot };
    const f = fillVacatedSlot(sideOf(s).map(toSub), leaving, mode, wasKeeper, env.ai(s), posOf);
    if (f) { refresh(s); const fq = byId(s, f.id); slotTab[s][slot] = slotTab[s][slot] ?? fieldsOf(q); applySlot(fq, slot, slotTab[s][slot]); }
  };

  return {
    subsLeft, benchSize, lastChange,
    state: (q: GP) => st.get(q),
    /** sub_6c54a0 0x6c581f–0x6c5879 (side 0) / 0x6c59c8 (side 1), efter tilstanden og tidsspildet: computerens genvalg */
    gate(entryClock: number, between?: () => void) {
      for (const s of [0, 1] as Side[]) {
        if (s === 1) between?.();                                                     // 0x6c587d: tillægstidens kommentar mellem holdene
        if (!env.ai(s)) continue;
        if (deadBallGate(rand, { aiControlled: true, clock: m.clock, entryClock, lastChange: lastChange[s] })) {
          doReselect(s, false); lastChange[s] = m.clock;                              // + 0x6bbb60(side), 0x6bbf60() – ikke porteret
        }
      }
    },
    /** sub_6d0b60 (kun når engine+0x8eb5 er sat; nulstilles til sidst) – side for side, som originalen trækker rand */
    treat() {
      if (!m.b8eb5) return;
      for (const s of [0, 1] as Side[]) {
        const list = sideOf(s), sps = list.map(toSub);
        const acts = treatInjured(rand, [{ players: sps, subsLeft: subsLeft[s], aiControlled: env.ai(s) }], m.clock, env.periodEnd());
        sps.forEach((sp, i) => { if (!sp.treat) list[i].b1d = 0; });
        for (const a of acts) {
          if (a.kind === 'carriedOff') {
            const q = byId(s, a.id), slot = q.slot, wasKeeper = q.pos === L.POS.keeper, x = S(q);
            x.minuteInjured = minute();
            if (slot >= 0) { x.prevSlot = slot; detach(q); q.slot = -2; env.onCarriedOff?.(q); if (a.mode !== -1) fillFor(s, q, slot, a.mode, wasKeeper); }
            // udvist og behandlet: 6cdd50(p, 0) – keepertesten gælder motorens keeper (+0xf59e), som allerede er en anden: intet
          } else if (a.kind === 'reselect') { doReselect(s, false); lastChange[s] = m.clock; }
          else if (a.kind === 'rearrange') { doRearrange(s); lastChange[s] = m.clock; }
        }
      }
      m.b8eb5 = 0;
    },
    /** sub_6cda20(p, 0) efter stats/kortet: +0x21 = minuttet, 6cdd50(p, −3), plads −3; computeren omrokerer/vælger igen (*estimeret*: altid straks –
     *  originalen venter, når en hændelse er i gang, +0x1a3 → 0x6d1210) */
    sendOff(q: GP) {
      const x = S(q); if (!x) { q.active = false; return; }
      const slot = q.slot, wasKeeper = q.pos === L.POS.keeper;
      if (slot < 0) return;
      x.prevSlot = slot; x.minuteRed = minute(); detach(q); q.slot = -3;
      const s = q.side;
      fillFor(s, q, slot, -3, wasKeeper);
      if (!env.ai(s)) return;
      for (const a of afterSendOff(wasKeeper, subsLeft[s])) {
        if (a === 'reselectKeeper') doReselect(s, true);
        else if (a === 'rearrange') doRearrange(s);
        else doReselect(s, false);
      }
      lastChange[s] = m.clock;
    },
    /** menneskets udskiftning: gyldig når der er udskiftninger tilbage (også efter de ventende), `inn` sidder på bænken og `out` er på banen
     *  eller skadet ude (−2). Sker ved næste dødbold (apply). */
    human(s: Side, outId: number, inId: number): boolean {
      const out = gp.find((q) => q.side === s && q.src.id === outId), inn = gp.find((q) => q.side === s && q.src.id === inId);
      if (!out || !inn || !st.has(out) || !st.has(inn)) return false;
      if (subsLeft[s] - pending[s].length <= 0) return false;
      if (inn.slot !== -1 || !(out.slot >= 0 || out.slot === -2)) return false;
      if (pending[s].some((x) => x.out === out || x.inn === inn || x.inn === out || x.out === inn)) return false;
      pending[s].push({ side: s, out, inn });
      return true;
    },
    /** de ventende menneskelige udskiftninger (ved dødbold, før sub_6c54a0's øvrige arbejde) */
    apply() {
      for (const s of [0, 1] as Side[]) {
        const list = pending[s]; if (!list.length) continue;
        pending[s] = [];
        refresh(s);
        for (const { out, inn } of list) {
          if (subsLeft[s] <= 0 || inn.slot !== -1 || !(out.slot >= 0 || out.slot === -2)) continue;
          const slot = out.slot >= 0 ? out.slot : S(out).prevSlot;
          goOff(out); comeOn(inn, slot, s); subsLeft[s]--;
          env.onSub?.(inn, out, false);
        }
      }
    },
    pending: (s: Side) => pending[s].length,
  };
}
export type MatchSubs = ReturnType<typeof makeMatchSubs>;
