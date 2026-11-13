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
// hold+0x1a/+0x16/+0x19 (leagueBranch/b16/assisted) = nej.
// Omrokeringen 0x6e1aa0 med 11 på banen: computeren vælger taktik igen (0x6e0230 med flag 0x8c1, de 11 på banen, uden kampspiller), kopierer
// den – masker, instruktioner, taktikbyte, holdflag og positionstabellen – og kører 0x6ddab0 (aiPrematch.ts) før fordelingen 0x6e2000.
// Efter genvalget ved dødbold, udvisningen og behandlingen: 0x6bbb60(side) (holdets samspil engine+0x1ce, engine+0xaf = 0, rand(20)/rand(7000)/
// rand(6)/rand(Professionalism) pr. spiller, 0x6eecb0(p, 1)) og 0x6bbf60 (mandsopdækningens mål for taktikbyte 0x14, 0x6d4330/0x5b5910).
// *estimeret*: samspillet læses af 0x6ec010 (kamp-CA'en), som ikke bruger det i porten endnu (gemmes i `cohesion`); 0x897590 (klubbens
// anfører i den gemte taktik) = anføreren fra udtagelsen (uden: indeks 0); 0x6eecb0(p, 1) = positionstilpasningen og handlingsevnerne.

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
import { cellAdd, cellRemove } from './cells';
import { captainInputOf, matchRoleScore, playerRecord, recordRatings, setChosenTactic, type AiPickCtx, type MatchRoleCache } from './aiTeam';
import { captainBase } from './roleScore';
import { AI_TACTIC_LIST, chooseAiTactic, type ChoiceManager, type ChoicePlayer } from './aiTacticChoice';
import { PRESET_TACTICS } from './presetTactics';
import { instrBig, presetTable } from './tacticTable';
import { aiPrematch, FORM_BIT, oppositeIndex, PREMATCH_ATTR_KEYS, recordAttr } from './aiPrematch';

type Side = 0 | 1;
type Rand = (n: number) => number;

/** pladsens felter (det, der følger pladsen, når en anden spiller overtager den) */
interface SlotFields { pos: number; posAttack: number; instr: bigint; tacticByte: number; pslot: number; tbl: GP['tbl']; baseX: number; baseY: number; markRef?: unknown }
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
  /** sub_6df460 for siden i kampen (0x6e0230's eget kald): tilstanden; r gemmes i engine+0x476a som i originalen */
  aiModeNow?: (s: Side) => number;
  /** add_event 0x6d6f70 (behandlingens kommentarer 0x6d0b60) */
  comment?: (id: number, p1: GP | null, s1: number, p2: GP | null, s2: number, extra: number) => void;
  /** hele sub_6eecb0(q) (limens recompute: handlingsevner, lofter og rullene sub_6f44a0 – trækker tal) */
  refresh?: (q: GP) => void;
  /** sub_6e1090 0x6e1312–0x6e1333: hold+0x1a = 3 (fixture+0x40/+0x41 ≠ 0) og 0x48f150(turneringen fixture+0 → [0xadadfc], klubben) – klubben
   *  spiller i turneringen (ligaen); så 0x10000 i stedet for 0x100 ^ 0x80000. *estimeret* for porten: ligakamp (GridMatchCtx.league) */
  leagueBranch?: boolean | ((s: Side) => boolean);
  /** hold+0x16 → 0x800000 (0x6e1359) */
  b16?: (s: Side) => boolean;
  /** kun låsetrinstesten (scripts/lockstep.ts RC/CP-linjerne): spillets data for holdets samspil sub_6bbb60 – 0x4cf5a0 (klub, +0x80 omdømme),
   *  0x4cf5f0 (kontrakten, +0x45) og 0x6ebd70's byte – og anføreren 0x897590 (indekset i holdets blok) */
  cohesionOf?: (q: GP) => { club: boolean; clubRep: number; contract: boolean; b45: number; x: number } | undefined;
  captainIdx?: (s: Side) => number | undefined;
  /** sub_6e1cf0(0, p, klub): anførerværdien (word) – genvalget 0x6e1090 vælger anføreren igen efter udskiftninger (0x6e18d0–0x6e1927); mangler =
   *  anføreren beholdes */
  captainValue?: (q: GP) => number;
  /** 0x6ddab0's roller efter computerens nye taktik (0x897ee0: spillemager, target man) – afleveringsmulighederne læser dem */
  onRoles?: (s: Side, roles: [number | null, number | null]) => void;
  /** kun låsetrinstesten: originalens 0x6e2f20-værdi i stedet for portens (GridMatchCtx.subScore) */
  subScore?: (s: Side, q: GP, spec: SlotSpec, flags: number, tf: number, value: number) => number;
  /** computerens udtagelse pr. side (aiTeam.ts): rammerne, anføreren (hold+0x3b) og dødboldsskytterne (+6/+0xa/+0xe) – 0x6e2f20 under kampen */
  aiPick?: [{ ctx: AiPickCtx; captain: number | null; setPieces: number[] } | null, { ctx: AiPickCtx; captain: number | null; setPieces: number[] } | null];
}

const sh = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
/** spillerpostens id (+0, dword) – 0x6ddd8b læser [player+0x6d]→+0. Kun låsetrinstesten har posten (GP.recRaw); ellers *estimeret* stab-id'et */
export const recordId = (g: GP) => (g.recRaw ? ((g.recRaw[0] & 0xff) | ((g.recRaw[1] & 0xff) << 8) | ((g.recRaw[2] & 0xff) << 16) | ((g.recRaw[3] & 0xff) << 24)) >>> 0 : g.src.id);
/** pladsens grundposition (gridMatch maskSlot → makePlayer): kolonne og række ud fra masken */
function baseOf(mask: number, side: Side): { baseX: number; baseY: number } {
  if (mask & 1) return { baseX: 4, baseY: 0 };
  const row = mask & 2 ? 1 : mask & 4 ? 2 : mask & 8 ? 3 : mask & 0x10 ? 4 : mask & 0x20 ? 5 : 6;
  const y = mask & 0x80 ? 10 : mask & 0x100 ? 30 : mask & 0x400 ? 70 : mask & 0x800 ? 90 : 50;
  const bx = Math.max(0, Math.min(8, Math.round((y / 100) * 8))), by = Math.min(10, Math.round(([2, 12, 20, 35, 50, 65, 85][row] / 100) * 11));
  return { baseX: side === 1 ? 8 - bx : bx, baseY: by };
}
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
  const fieldsOf = (q: GP): SlotFields => ({ pos: q.pos, posAttack: q.posAttack, instr: q.instr, tacticByte: q.tacticByte, pslot: q.pslot, tbl: q.tbl, baseX: q.baseX, baseY: q.baseY, markRef: q.markRef });
  /** holdets samspil engine+0x1ce+2·side (0x6bbb60) */
  const cohesion: [number, number] = [0, 0];
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
  // (runde 11B) holdets liste i blokkens rækkefølge, gemt så længe gp har samme længde (st ændres ikke efter opbygningen; listen læses kun)
  const sideCache: [GP[] | null, GP[] | null] = [null, null], sideLen: [number, number] = [-1, -1];
  const sideOf = (s: Side) => {
    const c = sideCache[s];
    if (c && sideLen[s] === gp.length) return c;
    sideLen[s] = gp.length;
    return (sideCache[s] = gp.filter((q) => q.side === s && st.has(q)).sort((a, b) => S(a).idx - S(b).idx));
  };
  const minute = () => cappedMinute(m.clock, env.periodEnd());
  /** pladsernes felter fra spillerne på dem (aiRetune m.fl. ændrer instruktionerne undervejs) */
  const refresh = (s: Side) => { for (const q of gp) if (q.side === s && q.active && q.slot >= 0 && q.slot <= 10) slotTab[s][q.slot] = fieldsOf(q); };
  const toSub = (q: GP): SubPlayer => {
    const x = S(q);
    return { id: q.src.id, idx: x.idx, slot: q.slot, prevSlot: x.prevSlot, condition: q.condition, pendingCondition: q.pendingCond, rating: q.rating, gkRating: q.gkRating,
      mustLeave: !!q.b1c, treat: !!q.b1d, substituted: x.substituted, minuteOn: x.minuteOn, minuteOff: x.minuteOff, minuteInjured: x.minuteInjured,
      injuredBy: q.injuredBy ? q.injuredBy.src.id : null };
  };
  // (runde 10B) id → første spiller med id'et i gp-rækkefølge (som gp.find), bygget én gang – gp ændres ikke i kampen
  let idFirst: Map<number, GP> | null = null;
  const firstById = (id: number) => {
    if (!idFirst || idFirst.size === 0) { idFirst = new Map(); for (const q of gp) if (!idFirst.has(q.src.id)) idFirst.set(q.src.id, q); }
    return idFirst.get(id);
  };
  const byId = (s: Side, id: number) => { const q = firstById(id); return q && q.side === s ? q : gp.find((q) => q.side === s && q.src.id === id)!; };
  /** spilleren overtager pladsens felter; 0x6eecb0(p, 0): positionstilpasningen +0x37 og handlingsevnerne regnes igen */
  const applySlot = (q: GP, slot: number, f: SlotFields | undefined) => {
    q.slot = slot;
    if (f) { q.pos = f.pos; q.posAttack = f.posAttack; q.instr = f.instr; q.tacticByte = f.tacticByte; q.pslot = f.pslot; q.tbl = f.tbl; q.baseX = f.baseX; q.baseY = f.baseY; q.markRef = f.markRef; }
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
    cellRemove(m, q);                                                                       // 0x6cdda5: ud af feltets liste
    q.active = false;
    for (const o of gp) { if (o.marks === q) o.marks = null; if (o.markers.includes(q)) o.markers = o.markers.filter((x) => x !== q); }
    q.marks = null; q.markers = [];
    // boldholderen/modtageren røres ikke: løkken giver bolden til en ny skytte, når boldholderen ikke er på banen (sub_6ceb90, loop.ts)
  };
  /** 0x6cdd00: ind på banen ved sidelinjen (x 8, y 6) */
  const comeOn = (q: GP, slot: number, s: Side) => {
    q.active = true; applySlot(q, slot, slotTab[s][slot]); q.x = 8; q.y = 6; q.cell = -1; cellAdd(m, q); q.busy = 0; S(q).minuteOn = minute();   // 0x6cdd0a–0x6cdd45 (bagerst i feltets liste)
  };
  const goOff = (q: GP) => { const x = S(q); if (q.slot >= 0) x.prevSlot = q.slot; detach(q); q.slot = -4; x.substituted = true; x.minuteOff = minute(); };

  const posOf = (p: SubPlayer) => byIdAny(p.id).pos;
  const attOf = (p: SubPlayer) => byIdAny(p.id).posAttack;
  const byIdAny = (id: number) => firstById(id)!;
  const specOf = (s: Side) => (slot: number) => { const f = slotTab[s][slot]; return { instrLo: f ? Number(f.instr & 0xffffffffn) : 0, instrHi: f ? Number(f.instr >> 32n) : 0, tacticByte: f?.tacticByte ?? 0x12 }; };
  /** sub_6e2f20 under kampen: P sikker (positionFactor), konditionens tidlige retur sikker (conditionTerm), resten *estimeret* (estimatedQuality) */
  const roleCache = new Map<number, MatchRoleCache>();
  /** sub_6e2f20 under kampen: hele værdien (roleScore.ts via aiTeam.ts matchRoleScore) med kampspilleren, anføreren og dødboldsskytterne fra
   *  udtagelsen (pick_team); uden udtagelse (env.aiPick mangler) som før: P og konditionens tidlige retur sikre, resten *estimeret* */
  const scoreOf = (s: Side) => (p: SubPlayer, spec: SlotSpec, flags: number) => {
    const v = scoreOf0(s)(p, spec, flags);
    return env.subScore ? env.subScore(s, byIdAny(p.id), spec, flags, m.teamFlags[s], v) : v;
  };
  const scoreOf0 = (s: Side) => (p: SubPlayer, spec: SlotSpec, flags: number) => {
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
  /** klubbens kampanfører (0x897590: indekset i holdets blok) – fra udtagelsen, sat igen af genvalget (0x897760) */
  const captainSlot: [GP | null, GP | null] = [null, null];
  const captainOf = (s: Side): GP => {
    if (captainSlot[s]) return captainSlot[s]!;
    const list = sideOf(s), ap = env.aiPick?.[s], ci = env.captainIdx?.(s);
    return (captainSlot[s] = ci !== undefined ? list[ci] : (ap?.captain != null ? list.find((q) => q.src.id === ap.captain) : undefined) ?? list[0]);
  };
  /** 0x6e18d0–0x6e1927: over holdets 20 i blokken med plads ≥ 0 den første med højest 0x6e1cf0 (word, ">") → 0x897760(klub, indeks) */
  const repickCaptain = (s: Side) => {
    if (!env.captainValue) return;
    let best: GP | null = null, bv = 0;
    for (const q of sideOf(s)) {
      if (q.slot < 0) continue;
      const v = s16(env.captainValue(q));
      if (!best || v > bv) { best = q; bv = v; }
    }
    if (best) captainSlot[s] = best;
  };
  const doReselect = (s: Side, keeperOut: boolean) => {
    if (subsLeft[s] <= 0) return;                                                    // 0x6e10af (intet rand)
    refresh(s);
    const list = sideOf(s);
    const res = reselect(rand, {
      players: list.map(toSub), subsLeft: subsLeft[s], benchSize: benchSize[s], keeperOut, clock: m.clock, periodEnd: env.periodEnd(),
      posOf, attOf, slotSpec: specOf(s), score: scoreOf(s),
      flags: { national: false, assisted: false, compType: env.compType, ownRep: env.rep[s], oppRep: env.rep[1 - s], leagueBranch: typeof env.leagueBranch === 'function' ? env.leagueBranch(s) : env.leagueBranch ?? false, b16: env.b16?.(s) ?? false, humanClubOption: false },
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
    if (res.changed) { repickCaptain(s); doRearrange(s); }                          // 0x6e16e4: ingen udskiftninger → slut (ingen ny anfører)
  };
  /** sub_6e1aa0 0x6e1ad3: med 11 på banen vælger computeren taktik igen – 0x6e0230(de 11, 11, 0x8c1, 2) uden kampspiller (arg3 = 0, så
   *  karakterleddet 0x1 og konditionen 0x800 er ude) – og kopierer den valgte (0x6e0c2e: blokken til engine+0x91e2 og team+0x2b) og kører
   *  0x6ddab0. 0x6e0230 returnerer altid 0 (kommentaren 0x2007 vises aldrig). Kun computerhold med en udtagelse (env.aiPick). */
  const retactic = (s: Side) => {
    const ap = env.aiPick?.[s]; if (!ap) return;
    const on = sideOf(s).filter((q) => q.slot >= 0);
    if (on.length !== 11) return;
    const mg = ap.ctx.manager ?? null;
    const players: ChoicePlayer[] = on.map((q) => {
      const rec = playerRecord(q.src), sp = ap.setPieces.indexOf(q.src.id) + 1, cap = ap.captain === q.src.id;
      return { ratings: recordRatings(q.src), b30: rec[0x30], b3b: rec[0x3b], quality: 0,
        score: (mask: number) => {
          const v = matchRoleScore(q.src, ap.ctx, { pos: mask, att: 0, lo: 0, hi: 0, tb: 0, tf: 0 }, 0x8c1, undefined, cap, sp, roleCache);
          return env.subScore ? env.subScore(s, q, { slot: -1, pos: mask, att: 0, instrLo: 0, instrHi: 0, tacticByte: 0 }, 0x8c1, 0, v) : v;
        } };
    });
    const manager: ChoiceManager | null = mg ? { attacking: mg.tac[0], freeRoles: mg.tac[2], marking: mg.tac[3], offside: mg.tac[4], pressing: mg.tac[5], favourite: mg.tac[7] } : null;
    // 0x6e025d: 0x6e0230 kalder selv 0x6df460 (tilstanden i kampen; den skriver r til engine+0x476a) og vælger efter dens svar
    const mode = env.aiModeNow ? env.aiModeNow(s) : m.aiMode[s];
    const { index } = chooseAiTactic({ players, mode, manager, stats: ap.ctx.tacticStats, divisor: Math.max(8 * env.rep[s], 2000), flags: 0x8c1 });
    setChosenTactic(ap.ctx.clubId, index);                                         // 0x8967d0
    const entry = AI_TACTIC_LIST[index], pr = PRESET_TACTICS[entry.preset];
    if (!pr) return;
    const tbl = presetTable(pr);
    for (let j = 0; j < 11; j++) slotTab[s][j] = { ...(slotTab[s][j] ?? {}), pos: entry.masks[j], posAttack: entry.masks2[j], instr: instrBig({ lo: entry.lo[j], hi: pr.hi[j] }),
      tacticByte: entry.tb[j], pslot: j, tbl, ...baseOf(entry.masks[j], s) };
    m.teamFlags[s] = entry.flags;
    for (const q of on) applySlot(q, q.slot, slotTab[s][q.slot]);
    // 0x6ddab0: computerens instruktioner på den nye taktik (som før kampen, gridMatch) – trækker motorens tal
    const at = (p: Player, n: number) => p.attrs[ATTRS.indexOf(PREMATCH_ATTR_KEYS[n] as never)] || 10;
    // sub_5431e0(staff, n): den viste værdi – af spillerposten, når låsetrinstesten har den (GP.recRaw; dens 18 interne værdier er ikke viste)
    const attrOf = (g: GP, n: number) => (g.recRaw ? recordAttr(Array.from(g.recRaw, (b) => b & 0xff), n, g.staffRaw ? g.staffRaw[0x58] : 10) : at(g.src, n));
    const mgr = mg ? (() => { const [attacking, directness, freeRoles, , offside, pressing, tactics] = mg.tac; return { id: mg.id, ca: mg.ca, attacking, directness, freeRoles, offside, pressing, tactics }; })() : null;
    const res = aiPrematch({
      flags: entry.flags, lo: entry.lo, hi: pr.hi, masks: entry.masks, masks2: entry.masks2,
      players: on.map((g) => ({ slot: g.pslot, recId: recordId(g), staffId: g.src.id, condition: g.condition, b24: g.yellows, attr: (n: number) => attrOf(g, n),
        raw: { dm: g.src.pos[3], m: g.src.pos[4], am: g.src.pos[5], f: g.src.pos[6], right: g.src.side[2], left: g.src.side[0], central: g.src.side[1], freeRole: g.src.cmFree ?? 1,
          jumping: at(g.src, 17), technique: at(g.src, 30), stamina: at(g.src, 26), workRate: at(g.src, 31) } })),
      manager: mgr, ownRep: env.rep[s], oppRep: env.rep[1 - s], b19: false, compType: env.compType, homeTeam: s === 0, setPieces: ap.setPieces,
    }, rand);
    if (res.roles) env.onRoles?.(s, res.roles);                                     // 0x6ddc83/0x6df432: klubbens spillemager/target man
    for (const q of on) {
      const j = q.pslot;
      slotTab[s][q.slot] = { ...slotTab[s][q.slot], instr: res.instr[j], pos: res.masks[j], posAttack: res.masks2[j] };
      applySlot(q, q.slot, slotTab[s][q.slot]);
    }
    m.teamFlags[s] = res.teamFlags;
  };
  /** sub_6e1aa0: (taktikvalget med 11 på banen, retactic) og markspillerne fordeles på deres egne pladser (0x6e2000 med flag 0x8800) */
  const doRearrange = (s: Side) => {
    refresh(s);
    retactic(s);
    const list = sideOf(s);
    const r = rearrange({ players: list.map(toSub), posOf, attOf, slotSpec: specOf(s), score: scoreOf(s), flags: 0x8800 });
    // 0x6e1c6f–0x6e1cae: hver af de fordelte får sin plads (+0x19) og sub_6eecb0 – også når pladsen er den samme
    for (const after of r.moved) { const q = byId(s, after.id); if (q.slot !== after.slot) applySlot(q, after.slot, slotTab[s][after.slot]); env.refresh?.(q); }
  };
  /** sub_6eecb0(p) (argumentet bruges ikke): positionstilpasningen +0x37, handlingsevnerne, lofterne og rullene sub_6f44a0 (0x6f05b9 – trækker
   *  tal; før uden rullene) */
  const recompute = (q: GP) => { applySlot(q, q.slot, undefined); env.refresh?.(q); };
  /** sub_6bbb60(side): holdets samspil. Hver spiller på banen: −500 hvis hans plads' formationsbit (0x5b5a60) allerede er talt (summen, ikke
   *  OR); med kontrakt og klub: rand(20) < Influence, rand(7000) < omdømmet (+0xb), rand(6) > Professionalism, omdømmet > klubbens − 750 og
   *  kontraktflag & 0x17a0b → −3x (anføreren), −2x (rand(Professionalism) = 0) eller −x; alle undtagen anføreren (0x897590): +x, x = 0x6ebd70
   *  (captainBase som byte). Til sidst 0x6eecb0(p, 1) for dem på banen. */
  const capBase = new Map<GP, number>();
  const doCohesion = (s: Side) => {
    let w = 0, acc = 0;
    if (m.bAf) m.bAf[s] = 0;                                                         // engine+0xaf+side
    const list = sideOf(s), ap = env.aiPick?.[s];
    const capQ = captainOf(s);                                                       // 0x897590 (ikke fundet → 0)
    const ctx = ap?.ctx ?? {};
    for (const q of list) {
      if (q.slot < 0) continue;
      const bit = FORM_BIT[q.pos] ?? 0;
      if (acc & bit) w = s16(w - 500);
      acc = (acc + bit) | 0;
      // spillerposten: originalens bytes, når låsetrinstesten har dem (GP.recRaw), ellers bygget af spillerens data
      // (runde 10B) kun bytes +0xb/+0xc/+0x2f læses: direkte fra GP.recRaw (& 0xff som Array.from før), ellers playerRecord (ren) – først når de bruges
      const p = q.src, rr = q.recRaw, cd = env.cohesionOf?.(q);
      let recP: number[] | null = null;
      const rec = (o: number) => (rr ? rr[o] & 0xff : (recP ??= playerRecord(p))[o]);
      // 0x6ebd70 af spillerens data – uændret i kampen (posten, kontrakten, dagene), så værdien gemmes pr. spiller (samme tal, hurtigere)
      const x = () => {
        if (cd) return s8(cd.x);
        let v = capBase.get(q);
        if (v === undefined) { v = s8(captainBase(captainInputOf(p, ctx, env.rep[s]))); capBase.set(q, v); }
        return v;
      };
      // 0x6bbbff–0x6bbc46: klubben (0x4cf5a0 → [0xae23b4] + 581·[r+4]) og kontrakten med den (0x4cf5f0)
      if (cd ? cd.club && cd.contract : p.contract && p.club) {
        const curRep = s16(rec(0xb) | (rec(0xc) << 8)), clubRep = cd ? cd.clubRep : env.rep[s];
        if (s8(rec(0x2f)) > rand(20) && curRep > rand(7000) && s8(sh(p, 'professionalism')) < rand(6) && curRep > s16(clubRep - 750)
          && ((cd ? cd.b45 : p.cmContract?.b45 ?? 0) & 0x17a0b)) {
          if (q === capQ) w = s16(w - 3 * x());
          else if (rand(s8(sh(p, 'professionalism'))) === 0) w = s16(w - 2 * x());
          else w = s16(w - x());
        }
      }
      if (q !== capQ) w = s16(w + x());
    }
    cohesion[s] = w;
    for (const q of list) if (q.slot >= 0) { recompute(q); if (m.bAf) m.bAf[s] = s8(m.bAf[s] + attackOverlap(q)); }
  };
  /** sub_6eecb0(p, 1)'s tæller engine+0xaf+side (0x6ef33e–0x6ef4d4; kun med flaget – 0x6bbb60): angrebspositionen ≠ positionen og første
   *  angrebsrække AM (0x20, når positionen hverken er F eller AM) → +1, F (0x40, når positionen ikke er F) → +2 – kun med en side (0x100/0x200/0x400).
   *  Mandsopdækningen sub_7160f0 (0x7161f5) slipper sin mand, når modstandernes tæller er over 1. */
  const attackOverlap = (q: GP) => {
    const pa = q.posAttack & 0xffff, pos = q.pos & 0xffff;
    if (pa === pos || pa & 0x1e) return 0;                                         // 0x6ef1e2 / SW, D, DM, M (0x6ef1fc–0x6ef2c4)
    if (pa & 0x20) return !(pos & 0x40) && !(pos & 0x20) && pa & 0x700 ? 1 : 0;    // 0x6ef311–0x6ef3f5
    if (pa & 0x40) return !(pos & 0x40) && pa & 0x700 ? 2 : 0;                     // 0x6ef40e–0x6ef4d4
    return 0;
  };
  /** sub_6bbf60: for begge hold – spillere på banen, hvis plads har taktikbyte 0x10 og 4, får modstanderen over for sig (0x6d4330(side, indeks))
   *  som mandsopdækningens mål (0x5b5910 på pladsen). Ingen modstander (−1): hjemmeholdet får sic indeks 19 i sit eget hold, udeholdet uændret. */
  const doMarking = () => {
    for (const s of [0, 1] as Side[]) {
      const list = sideOf(s), opp = sideOf((1 - s) as Side);
      list.forEach((q) => {
        if (q.slot < 0) return;
        const tb = slotTab[s][q.slot]?.tacticByte ?? q.tacticByte;
        if (!(tb & 0x10) || !(tb & 4)) return;
        const idx = oppositeIndex(q.slot, q.pos, opp.map((o) => ({ slot: o.slot, pos: o.pos })));
        const target = idx >= 0 ? opp[idx] : s === 0 ? list[19] : undefined;
        if (!target) return;
        q.markRef = target.ref;
        if (slotTab[s][q.slot]) slotTab[s][q.slot].markRef = target.ref;
      });
    }
  };
  /** efter computerens genvalg/omrokering (0x6c586b, 0x6cdcea, 0x6d0f4d): 0x6bbb60(side) og 0x6bbf60 */
  const afterChange = (s: Side) => { doCohesion(s); doMarking(); };
  /** 0x6cdd50(p, mode) med mode ≠ −1: en markspiller overtager keeperens (eller den udvistes) plads, når computeren vælger */
  const fillFor = (s: Side, q: GP, slot: number, mode: number, wasKeeper: boolean) => {
    const leaving = { ...toSub(q), slot };
    const f = fillVacatedSlot(sideOf(s).map(toSub), leaving, mode, wasKeeper, env.ai(s), posOf);
    if (f) {
      refresh(s); const fq = byId(s, f.id); slotTab[s][slot] = slotTab[s][slot] ?? fieldsOf(q);
      // 0x6ce0a5: 6cdd50 skriver kun +0x19 (pladsens taktik følger pladsen); +0x37 og handlingsevnerne regnes først af sub_6eecb0 i
      // omrokeringen (0x6e1cae, kun for dem den fordeler) – udebliver den (optøjer i gang 0x6cdb85, eller han skiftes ud i genvalget), bliver
      // de gamle stående
      const form = fq.form, skill = fq.skill;
      applySlot(fq, slot, slotTab[s][slot]);
      fq.form = form; fq.skill = skill;
    }
  };

  return {
    subsLeft, benchSize, lastChange, cohesion,
    /** klubbens kampanfører (0x897590) – sub_6ec010's anførerled og samspillet */
    captain: (s: Side) => captainOf(s),
    /** taktikkens positionsord pr. plads (engine+0x91e2+6371·side +0x12d/+0x14e), som pladserne er udfyldt – sub_6ec010 (0x6d5b20/0x6d5af0) */
    slotWords: (s: Side, j: number) => slotTab[s][j] ? { pos: slotTab[s][j].pos, posAttack: slotTab[s][j].posAttack } : undefined,
    /** (runde 11B) samme som slotWords(s, j)?.pos / .posAttack uden et nyt objekt pr. opslag (null = tom plads) */
    slotWord: (s: Side, j: number, att: boolean): number | null => { const f = slotTab[s][j]; return f ? (att ? f.posAttack : f.pos) : null; },
    /** kun låsetrinstesten: pladstabellen igen fra spillerne på banen (efter at originalens tilstand er sprøjtet ind) */
    resyncSlots() { refresh(0); refresh(1); },
    /** init_match 0x6b8bc5–0x6b8bd5: sub_6bbb60(0), sub_6bbb60(1), sub_6bbf60 ved kampstart (kaldt af gridMatch.ts) */
    kickoffSetup() { doCohesion(0); doCohesion(1); doMarking(); },
    state: (q: GP) => st.get(q),
    /** sub_6c54a0 0x6c581f–0x6c5879 (side 0) / 0x6c59c8 (side 1), efter tilstanden og tidsspildet: computerens genvalg */
    gate(entryClock: number, between?: () => void) {
      for (const s of [0, 1] as Side[]) {
        if (s === 1) between?.();                                                     // 0x6c587d: tillægstidens kommentar mellem holdene
        if (!env.ai(s)) continue;
        if (deadBallGate(rand, { aiControlled: true, clock: m.clock, entryClock, lastChange: lastChange[s] })) {
          doReselect(s, false); lastChange[s] = m.clock; afterChange(s);              // 0x6c586b: + 0x6bbb60(side), 0x6bbf60()
        }
      }
    },
    /** sub_6d0b60 (kun når engine+0x8eb5 er sat; nulstilles til sidst) – side for side, som originalen trækker rand */
    treat() {
      if (!m.b8eb5) return;
      for (const s of [0, 1] as Side[]) {
        const list = sideOf(s), sps = list.map(toSub);
        // 0x6d0d34–0x6d0d6f: en modspiller skadede ham → 0x20f6 (offeret, skadevolderen)
        const injurer = (q: GP) => { const by = q.injuredBy; if (by) env.comment?.(0x20f6, q, q.side, by, by.side, 0); };
        treatInjured(rand, [{ players: sps, subsLeft: subsLeft[s], aiControlled: env.ai(s) }], m.clock, env.periodEnd(), (a) => {
          if (a.kind === 'carriedOff') {
            const q = byId(s, a.id), slot = q.slot, wasKeeper = q.pos === L.POS.keeper, x = S(q);
            env.comment?.(slot >= 0 ? 0x1f56 : 0x1f57, q, q.side, null, -1, 0);           // 0x6d0bed / 0x6d0c4f (båret fra banen / udvist)
            x.minuteInjured = minute();
            // pladsens taktik (instruktioner m.m. ligger på pladsen i originalen) gemmes, før han forlader den – 0x6c54a0 kan have ændret den
            if (slot >= 0) { refresh(s); x.prevSlot = slot; detach(q); q.slot = -2; env.onCarriedOff?.(q); if (a.mode !== -1) fillFor(s, q, slot, a.mode, wasKeeper); }
            // udvist og behandlet: 6cdd50(p, 0) – keepertesten gælder motorens keeper (+0xf59e), som allerede er en anden: intet
            injurer(q); q.b1d = 0;
          } else if (a.kind === 'continues') {
            const q = byId(s, a.id);
            if (a.comment) env.comment?.(0x1f58, q, q.side, null, -1, 0);                   // 0x6d0d2f: fortsætter
            injurer(q); q.b1d = 0;
          } else if (a.kind === 'reselect') { doReselect(s, false); lastChange[s] = m.clock; afterChange(s); }
          else if (a.kind === 'rearrange') { doRearrange(s); lastChange[s] = m.clock; afterChange(s); }
        });
      }
      m.b8eb5 = 0;
    },
    /** sub_6cda20(p, 0) efter stats/kortet: +0x21 = minuttet, 6cdd50(p, −3), plads −3; computeren omrokerer/vælger igen (*estimeret*: altid straks –
     *  originalen venter, når en hændelse er i gang, +0x1a3 → 0x6d1210) */
    sendOff(q: GP, fightsPending = false) {
      const x = S(q); if (!x) { q.active = false; return; }
      const slot = q.slot, wasKeeper = q.pos === L.POS.keeper;
      if (slot < 0) return;
      refresh(q.side);                                                                // pladsens taktik gemmes, før pladsen tømmes
      x.prevSlot = slot; x.minuteRed = minute(); detach(q); q.slot = -3;
      const s = q.side;
      fillFor(s, q, slot, -3, wasKeeper);
      if (fightsPending) return;                                                     // 0x6cdb85: engine+0x1a3 ≠ 0 (optøjer afgøres) → intet mere her (0x6d1210 tager keeperen)
      if (!env.ai(s)) { afterChange(s); return; }                                    // 0x6cdce4: samspillet og mandsopdækningen også for mennesket
      for (const a of afterSendOff(wasKeeper, subsLeft[s])) {
        if (a === 'reselectKeeper') doReselect(s, true);
        else if (a === 'rearrange') doRearrange(s);
        else doReselect(s, false);
      }
      lastChange[s] = m.clock;
      afterChange(s);                                                                // 0x6cdcea/0x6cdcf1
    },
    /** sub_6d1210 0x6d1591–0x6d16ea: keeperen blev udvist under optøjerne (engine+0x1cb+side) – computeren 0x6e1090(1), mennesket 0x6e1aa0 +
     *  0x6ce110 (her som omrokeringen); uret i +0x8ecc, samspillet og mandsopdækningen */
    keeperOffAfterFights(s: Side) {
      if (env.ai(s)) doReselect(s, true); else doRearrange(s);
      lastChange[s] = m.clock;
      afterChange(s);
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
