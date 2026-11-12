// Låsetrin (lockstep) mellem gittermotoren og den instrumenterede original (~/cm0102-engine/tools/match_trace.c med
// RECOMP_MATCH_TRACE_RAND=1, evt. RECOMP_MATCH_TRACE_FULL=<tik>): porten startes med originalens præcise tilstand i toppen af tik 0
// (alle MATCH_PLAYER-poster, taktiktabellerne, holdflag, motorens felter fra EN-linjen) og får originalens tilfældige tal i samme
// rækkefølge (r-linjerne: n, returadresse, resultat). Ved hvert rand-kald skal n være originalens; efter hvert tik sammenlignes
// tilstanden med T-linjen (og XE-dumpet af hele motoren, når det findes). Første afvigelse = en oversættelsesfejl i porten.
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { attachView, cellIx, createGridMatch, GRID_UNKNOWN, type GP, type GridMatchState, type Rand, type Side } from '../src/game/engine/grid/gridMatch';
import { ATTRS } from '../src/game/attributes';
import type { AiModeInput, TableRow } from '../src/game/engine/grid/aiMode';
import { INJ_TYPES } from '../src/game/cmFitness';
import type { MatchValuesEnv } from '../src/game/engine/grid/matchValues';
import { caseInput, parseMv } from './mv-check';
import type { Player, Tactic } from '../src/game/types';

export interface Rec { side: Side; idx: number; slot: number; staff: number; rec: Uint8Array; mp: Uint8Array; sr?: Uint8Array; nat?: number; fit?: Uint8Array; injury?: Uint8Array | null }
export interface TickRec { T: string; XE?: Uint8Array; r: [number, number, number][]; other: string[] }
export interface MatchTrace { SC?: number; TK?: number[][]; FL?: string[]; MVL?: string[]; CAP?: number[]; RC?: Map<string, { club: boolean; clubRep: number; contract: boolean; b45: number; x: number }>; DT?: [number, number]; MG?: { b904b: number; mgr: Uint8Array | null; np: Uint8Array | null; tactic: string | null }[]; HU?: number[]; HU1?: number[]; M: number[]; P: Uint8Array[]; I: string[]; R: Rec[]; EN: Uint8Array; OF?: Uint8Array; FX?: Uint8Array; CP?: Uint8Array; CL: Uint8Array[]; KN?: number[]; RL: (number | null)[][]; pre: string[]; ticks: TickRec[] }

const hex = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));

/** k-te kamp (0 = første) i et spor */
export async function readMatch(file: string, k: number, maxTicks = Infinity): Promise<MatchTrace> {
  const raw = createReadStream(file);
  const rl = createInterface({ input: file.endsWith('.gz') ? raw.pipe(createGunzip()) : raw, crlfDelay: Infinity });
  let n = -1, tr: MatchTrace | null = null, cur: TickRec | null = null;
  const pre: string[] = [], preMv: string[] = [];   // preMv: kampstartens sub_6ec010-kald (tik −1) står før M-linjen (init_match)
  for await (const l of rl) {
    if (l.startsWith('M ')) {
      if (tr) break;
      n++;
      if (n === k) tr = { M: l.split(' ').slice(1).map(Number), P: [], I: [], R: [], EN: new Uint8Array(0), CL: [], RL: [[null, null], [null, null]], pre: pre.slice(), ticks: [], MVL: preMv.slice() };
      pre.length = 0; preMv.length = 0;
      continue;
    }
    if (tr && (l.startsWith('MV ') || l.startsWith('MVr ') || l.startsWith('MVO '))) { (tr.MVL ??= []).push(l); continue; }   // sub_6ec010 (matchValues.ts)
    if (!tr && (l.startsWith('MV ') || l.startsWith('MVr ') || l.startsWith('MVO '))) { preMv.push(l); continue; }
    if (!tr) { if (l.startsWith('c -1') || l.startsWith('C ') || l.startsWith('z ')) pre.push(l); else if (l.startsWith('r ')) pre.length = pre.length; continue; }
    const c = l.charCodeAt(0);
    if (c === 114 && l[1] === ' ') {                                       // r n ret = res
      const f = l.split(' ');
      (cur ?? (tr.ticks[0] ??= { T: '', r: [], other: [] })).r.push([+f[1], parseInt(f[2], 16), +f[4]]);
      continue;
    }
    if (l.startsWith('T ')) {
      if (tr.ticks.length >= maxTicks) break;
      cur = { T: l, r: [], other: [] }; tr.ticks.push(cur); continue;
    }
    if (l.startsWith('XE ')) { if (cur) cur.XE = hex(l.slice(l.indexOf(' ', 3) + 1)); continue; }
    if (l.startsWith('P ')) { const f = l.split(' '); tr.P[+f[1]] = hex(f[2]); continue; }
    if (l.startsWith('I ')) { tr.I[+l.split(' ')[1]] = l; continue; }
    if (l.startsWith('RS ')) { const f = l.split(' '); const r = tr.R.find((x) => x.side === +f[1] && x.idx === +f[2]); if (r) r.sr = hex(f[4]); continue; }
    if (l.startsWith('R ')) {
      const f = l.split(' '); const side = +f[1] as Side;
      tr.R.push({ side, idx: tr.R.filter((x) => x.side === side).length, slot: +f[2], staff: +f[3], rec: hex(f[4]), mp: hex(f[5]) }); continue;
    }
    if (l.startsWith('EN ')) { tr.EN = hex(l.slice(3)); continue; }
    if (l.startsWith('RF ')) { const f = l.split(' '); const r = tr.R.find((x) => x.side === +f[1] && x.idx === +f[2]); if (r && f[3] !== '-') { r.fit = hex(f[3]); r.injury = f[4] === '-' ? null : hex(f[4]); } continue; }
    if (l.startsWith('RN ')) { const f = l.split(' '); const r = tr.R.find((x) => x.side === +f[1] && x.idx === +f[2]); if (r) r.nat = +f[3]; continue; }
    if (l.startsWith('RL ')) { const f = l.split(' ').map(Number); tr.RL[f[1]] = [f[2] || null, f[3] || null]; continue; }
    if (l.startsWith('HU ')) { const f = l.split(' ').map(Number); (tr.HU ??= [0, 0])[f[1]] = f[2]; if (f.length > 3) (tr.HU1 ??= [0, 0])[f[1]] = f[3]; continue; }
    // "CP <side> <indeks>" (anføreren, fjerde runde) – ikke turneringsposten "CP <hex>"
    if (l.startsWith('CP ') && l.split(' ').length === 3) { const f = l.split(' ').map(Number); (tr.CAP ??= [])[f[1]] = f[2]; continue; }
    if (l.startsWith('RC ')) { const f = l.split(' ').map(Number); (tr.RC ??= new Map()).set(`${f[1]},${f[2]}`, { club: f[3] === 1, clubRep: f[4], contract: f[5] === 1, b45: f[7] >>> 0, x: f[9] }); continue; }
    if (l.startsWith('DT ')) { const f = l.split(' '); tr.DT = [+f[1], +f[2]]; continue; }
    if (l.startsWith('MG ')) { const f = l.split(' '); (tr.MG ??= [])[+f[1]] = { b904b: +f[2], mgr: f[3] === '-' ? null : hex(f[3]), np: f[4] === '-' ? null : hex(f[4]), tactic: f[5] === '-' ? null : f[5].replace(/_/g, ' ') }; continue; }
    if (l.startsWith('KN ')) { tr.KN = l.split(' ').slice(1).map(Number); continue; }
    if (l.startsWith('SC ')) { tr.SC = +l.split(' ')[1]; continue; }                                  // [0xae2364] (femte runde)
    if (l.startsWith('TK ')) { const f = l.split(' ').map(Number); (tr.TK ??= [[], []])[f[1]] = f.slice(2); continue; }   // sub_897990 (femte runde)
    if (l.startsWith('OF ')) { tr.OF = hex(l.slice(3)); continue; }
    if (l.startsWith('FX ')) { tr.FX = hex(l.slice(3)); continue; }
    if (l.startsWith('CP ')) { tr.CP = hex(l.slice(3)); continue; }
    if (l.startsWith('CL ')) { const f = l.split(' '); tr.CL[+f[1]] = hex(f[2]); continue; }
    if (cur) cur.other.push(l);
  }
  rl.close();
  if (!tr) throw new Error(`kamp ${k} findes ikke i ${file}`);
  return tr;
}

// ------------------------------------------------------------------ læsning af originalens bytes
export class Mem {
  dv: DataView;
  constructor(public b: Uint8Array) { this.dv = new DataView(b.buffer, b.byteOffset, b.byteLength); }
  u8(o: number) { return this.b[o]; }
  s8(o: number) { return (this.b[o] << 24) >> 24; }
  u16(o: number) { return this.dv.getUint16(o, true); }
  s16(o: number) { return this.dv.getInt16(o, true); }
  u32(o: number) { return this.dv.getUint32(o, true); }
  s32(o: number) { return this.dv.getInt32(o, true); }
  f32(o: number) { return this.dv.getFloat32(o, true); }
}

/** spillerpostens egenskaber fra +0x1b (samme liste som gridMatch.ts REC_ATTRS) */
export const REC_ATTRS = ['acceleration', 'aggression', 'agility', 'anticipation', 'balance', 'bravery', 'consistency', 'corners', 'crossing', 'decisions',
  'dirtiness', 'dribbling', 'finishing', 'flair', 'freeKicks', 'handling', 'heading', 'importantMatches', 'injuryProneness', 'jumping', 'influence',
  'leftFoot', 'longShots', 'marking', 'offTheBall', 'naturalFitness', 'oneOnOnes', 'pace', 'passing', 'penalties', 'positioning', 'reflexes',
  'rightFoot', 'stamina', 'strength', 'tackling', 'teamwork', 'technique', 'throwIns', 'versatility', 'creativity', 'workRate'] as const;
const STAFF_ATTRS = ['adaptability', 'ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'] as const;
/** kampværdierne (sub_6ec010) som floats fra +0x71, alfabetisk (vision = creativity, sidst workRate +0xf5) */
export const MATCH_FLOATS = ['acceleration', 'aggression', 'agility', 'anticipation', 'balance', 'bravery', 'corners', 'crossing', 'decisions', 'dribbling',
  'finishing', 'flair', 'freeKicks', 'handling', 'heading', 'jumping', 'longShots', 'marking', 'offTheBall', 'oneOnOnes', 'pace', 'passing', 'penalties',
  'positioning', 'reflexes', 'stamina', 'strength', 'tackling', 'teamwork', 'technique', 'throwIns', 'versatility', 'creativity', 'workRate'] as const;
const ROLLS = ['pace', 'anticipation', 'decisions', 'offTheBall', 'marking', 'flair', 'positioning', 'creativity', 'agility', 'workRate'] as const;   // +0x104..
const CAPS = ['pace', 'decisions', 'positioning', 'offTheBall', 'marking', 'flair', 'creativity', 'anticipation', 'workRate', 'agility'] as const;   // +0x10e..

/** (dag i året fra 0, år) → ISO-dato (staffpostens +0x3e og dagens dato [0xae2c90] – sub_54cdb0 regner forskellen i dage) */
export const dayDate = (d: number, y: number) => new Date(Date.UTC(y, 0, 1) + d * 86400000).toISOString().slice(0, 10);
/** en Player til porten ud fra originalens spillerpost (0x46 bytes) og staffpost – egenskaberne er postens bytes */
export function playerOf(r: Rec): Player {
  const R = new Mem(r.rec), attrs = new Array(ATTRS.length).fill(10);
  REC_ATTRS.forEach((k, i) => { const j = ATTRS.indexOf(k as never); if (j >= 0) attrs[j] = R.u8(0x1b + i); });
  if (r.sr) STAFF_ATTRS.forEach((k, i) => { const j = ATTRS.indexOf(k as never); if (j >= 0) attrs[j] = r.sr![0x56 + i]; });
  const pos = [0xf, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16].map((o) => R.u8(o));
  return {
    id: r.staff, first: '', last: `p${r.staff}`, dob: '1975-01-01', nation: 0, club: 0, foot: 'R', feet: [R.u8(0x30), R.u8(0x3b)], height: 180, attrs,
    pos, side: [R.u8(0x18), R.u8(0x19), R.u8(0x17)], ca: R.s16(5), pa: R.s16(7), rep: 50, cmRep: [R.s16(9), R.s16(0xb), R.s16(0xd)], value: 0, contract: null,
    condition: 100, morale: 10, form: [], injury: null, banned: 0, yellowCount: 0, training: '', listed: false, loan: null,
    stats: {} as Player['stats'], history: [], caps: 0, intGoals: 0, cmFree: R.u8(0x1a),
    ...(r.sr ? { joined: dayDate(r.sr[0x3e] | (r.sr[0x3f] << 8), r.sr[0x40] | (r.sr[0x41] << 8)) } : {}),
  } as unknown as Player;
}

/** holdene til createGridMatch: opstillingen i originalens rækkefølge (idx 0..10 = pladserne, så bænken) */
function teamsOf(tr: MatchTrace) {
  return [0, 1].map((s) => {
    const rs = tr.R.filter((r) => r.side === s);
    const players = rs.map(playerOf);
    // MV-linjernes indb ([staff] < [0xae2364]): genererede spillere er "regens" for porten (0x62ed70 giver NULL, historierne m.fl.)
    const indb = new Map<number, boolean>();
    for (const c of parseMv((tr.MVL ?? []).join('\n'))) { const h = c.head.split(' '); if (+h[2] === s) indb.set(+h[4], c.kv.indb === '1'); }
    for (const p of players) if (tr.SC !== undefined ? p.id >= tr.SC : indb.get(p.id) === false) (p as { regen?: boolean }).regen = true;   // SC: [0xae2364]
    const start = rs.filter((r) => r.slot >= 0).sort((a, b) => a.slot - b.slot);
    const slots = start.map(() => ({ pos: 'CM', side: 'C', x: 50, y: 50 })) as unknown as Tactic['slots'];
    slots[0] = { pos: 'GK', side: 'C', x: 2, y: 50 } as unknown as Tactic['slots'][number];
    const tactic = { formation: '4-4-2', slots, lineup: start.map((r) => r.staff), bench: rs.filter((r) => r.slot < 0).map((r) => r.staff),
      team: {} as Tactic['team'], individual: [], captain: 0, penalties: 0, freeKicks: 0, corners: 0 } as unknown as Tactic;
    return { players, tactic };
  });
}

// ------------------------------------------------------------------ indsættelsen af originalens tilstand
const PL0 = 0x4796, PSTRIDE = 8920, PSZ = 0x1be;
export interface Lock { tr: MatchTrace; base: number; gpOf(ptr: number): GP | null; side: GP[][] }

function unmirror(P1: Uint8Array): Uint8Array {
  const t = new Uint8Array(2376);
  for (let sl = 0; sl < 11; sl++) for (let a = 0; a < 2; a++) for (let bx = 0; bx < 9; bx++) for (let by = 0; by < 12; by++) {
    const c = P1[216 * sl + 108 * a + 12 * (8 - bx) + (11 - by)];
    t[216 * sl + 108 * a + 12 * bx + by] = (8 - (c & 15)) | ((11 - (c >> 4)) << 4);
  }
  return t;
}

/** spillerens felter fra MATCH_PLAYER-blokken (0x1be bytes) */
export function injectPlayer(L: Lock, q: GP, mpb: Uint8Array, E: Mem) {
  const p = new Mem(mpb), ptr = (o: number) => L.gpOf(p.u32(o));
  q.c01 = p.u8(1); q.injury = p.u8(1); q.c02 = p.u8(2); q.assists = p.u8(3); q.tacklesTried = p.u8(4); q.tacklesWon = p.u8(5); q.b6 = p.u8(6);
  q.b7 = p.u8(7); q.b8 = p.u8(8); q.b9 = p.u8(9); q.shots = p.u8(0xa); q.shotsOnTarget = p.u8(0xb); q.goals = p.u8(0xc); q.pensTaken = p.u8(0xd);
  q.penGoals = p.u8(0xe); q.b0f = p.u8(0xf); q.penGoalsWon = p.u8(0x10); q.dribblesPast = p.u8(0x11); q.blocks = p.u8(0x12); q.offsidesCaught = p.u8(0x13);
  q.fouls = p.u8(0x14); q.foulsSuffered = p.u8(0x15); q.b16 = p.u8(0x16); q.morale = p.s8(0x17); q.slot = p.s8(0x19); q.pslot = q.slot; q.active = q.slot >= 0;
  q.b1b = p.u8(0x1b); q.b1c = p.u8(0x1c); q.b1d = p.u8(0x1d); q.yellows = p.u8(0x24); q.reasons = [p.u8(0x25), p.u8(0x26)];
  q.w29 = p.s16(0x29); q.busy = p.s8(0x2b); q.strongFoot = p.u8(0x2c) as 0 | 1; q.weakFootPenalty = p.u8(0x2d); q.debut = p.u8(0x30);
  q.w31 = p.s16(0x31); q.w33 = p.s16(0x33); q.rating = p.s16(0x35); q.form = p.s16(0x37); q.w39 = p.s16(0x39); q.matchCA = p.s16(0x3b);
  q.goalWords = [0, 1, 2, 3, 4].map((k) => p.s16(0x3d + 2 * k));
  q.condition = p.f32(0x4d); q.injuredBy = ptr(0x55); q.pendingCond = p.f32(0x59);
  MATCH_FLOATS.forEach((k, i) => { q.f[k] = p.f32(0x71 + 4 * i); });
  for (const k of Object.keys(q.a) as (keyof GP['a'])[]) if (q.f[k] !== undefined) q.a[k] = q.f[k];
  q.bfd = p.u8(0xfd); q.temperCount = p.s8(0xff); q.motivation = p.s8(0x100); q.formRoll = p.s8(0x118); q.badDay = p.s8(0x119);
  q.x = p.s8(0x102); q.y = p.s8(0x103);
  ROLLS.forEach((k, i) => { q.roll[k] = p.u8(0x104 + i); });
  CAPS.forEach((k, i) => { q.cap[k] = p.u8(0x10e + i); });
  for (let k = 0; k < q.skill.length; k++) q.skill[k] = p.s16(0x11a + 2 * k);
  q.action = p.s16(0x198); q.facing = p.s16(0x19a); q.momentum = p.s16(0x19c);
  q.agitation = p.f32(0x1a2); q.grudge = ptr(0x1a6); q.marks = ptr(0x1aa);
  const nm = p.u8(0x101); q.markers = [];
  for (let k = 0; k < nm && k < 3; k++) { const o = ptr(0x1ae + 4 * k); if (o) q.markers.push(o); }
  q.marker0 = ptr(0x1ae) ?? null;
  q.agFloor = 2 * (25 - q.temperament);
  q.bffBase = Math.trunc((Math.trunc(q.motivation / 2) + (q.src.attrs[ATTRS.indexOf('dirtiness')] ?? 10) + 10) / 4);
  // positionsordene sub_6c38c0/sub_6c38f0: engine+0x8ebc/+0x8ec4 + 4·side → word-tabel pr. plads
  if (q.slot >= 0 && q.slot <= 10) {
    const w = (o: number) => { const a = E.u32(o + 4 * q.side) - L.base + 2 * q.slot; return a >= 0 && a + 2 <= E.b.length ? E.u16(a) : -1; };
    const pw = w(0x8ebc), pa = w(0x8ec4);
    if (pw >= 0) q.pos = pw; if (pa >= 0) q.posAttack = pa;
  }
  q.isKeeper = q.pos === 1;
  q.gkRating = q.src.pos[0];
}

export function inject(L: Lock, m: GridMatchState, ix: Record<string, unknown>) {
  const E = new Mem(L.tr.EN), tr = L.tr;
  const ptr = (o: number) => L.gpOf(E.u32(o));
  // taktikken: positionstabellerne (P), holdflag og pladsernes bytes/instruktioner (I)
  const tbl = [tr.P[0], unmirror(tr.P[1])];
  const I = tr.I.map((l) => { const f = l.split(' '); return { flags: parseInt(f[2], 16), slots: f.slice(3).map((x) => x.split(':').map((y) => parseInt(y, 16))) }; });
  for (const s of [0, 1] as Side[]) {
    m.teamFlags[s] = I[s].flags;
    L.side[s].forEach((q, i) => {
      const r = tr.R.find((x) => x.side === s && x.idx === i)!;
      injectPlayer(L, q, r.mp, E);
      q.tbl = tbl[s];
      q.ref = q.src.id;                                                                       // +0x69: staffposten (id = indekset)
      q.recRaw = new Int8Array(r.rec.buffer.slice(r.rec.byteOffset, r.rec.byteOffset + r.rec.byteLength));
      if (r.sr) q.staffRaw = new Int8Array(r.sr.buffer.slice(r.sr.byteOffset, r.sr.byteOffset + r.sr.byteLength));
      // staffpostens land → navnet, som nationFactor kender (de 6 med K = 1, de 3 med 0,6 – 0x6c6a60–0x6c6aa2)
      // konditionsmodulets post (RF): skaden +0xe → typen +0 → kategorien 0x62ec00, og 0x62ece0 af +0x12/+0x13
      if (r.fit) {
        const F = new Mem(r.fit), rt = F.s8(0x12), rl = F.s8(0x13);
        if (q.src.regen) r.injury = null;                                                   // 0x62edf5/0x62ecf3: id ≥ [0xae2364] → NULL / 0
        q.fat = q.src.regen ? 0 : F.s16(0xc);                                               // 0x62c3d0: trætheden (+0xc) – pausens restitution
        // 0x62ed70 kalder 0x62c680 (dagens opdatering) først: er skaden helet til i dag (dage siden +0x20 ≥ +0x28), slutter den, og opslaget
        // giver NULL (pokalkampen: type −1-posterne fra dag 42 er helet på dag 206). RF-posten er dumpet før opdateringen.
        let inj = r.injury ?? null;
        if (inj && tr.DT) { const J = new Mem(inj), start = Date.UTC(J.s16(0x22), 0, 1) / 86400000 + J.s16(0x20), today = Date.UTC(tr.DT[1], 0, 1) / 86400000 + tr.DT[0];
          if (today - start >= J.s16(0x28)) inj = null; }
        q.inj = { cat: inj ? INJ_TYPES[inj[0]]?.[0] ?? (inj[0] === 0xff ? 65 : -1) : -1,   /* type −1: 0x62ec00 læser 0x9e7ad9 − 13 = 65 */ s: rt > -1 && !q.src.regen ? (rl <= 1 ? 1 : rl) : 0 };
      }
      if (r.nat !== undefined) q.src.nation = r.nat;                                       // staff+0x1a (zonevalgets omdømme: samme land → hjemme-ry)
      if (r.nat !== undefined && tr.KN) { const k = tr.KN.indexOf(r.nat); q.nationName = k < 0 ? 'Other' : k < 6 ? 'England' : 'Sweden'; }
      if (q.slot >= 0) {
        const [tb, lo, hi] = I[s].slots[q.slot]; q.tacticByte = tb; q.instr = (BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0);
        const mr = E.s32(0x91e2 + 6371 * s + 0x5bf + 4 * q.slot); q.markRef = mr >= 0 ? mr : undefined;   // sub_5b58e0: mandsopdækningens mål
      }
    });
  }
  // arrays skrives på stedet: limens lukninger (fx sideByte i 0x6df460's indgange) holder på de samme objekter
  const set2 = <T,>(a: T[] | undefined, x: T, y: T) => { if (a) { a[0] = x; a[1] = y; } };
  m.formationWord = [E.u32(0x91e2 + 0x187b), E.u32(0x91e2 + 6371 + 0x187b)]; m.bAf = [E.s8(0xaf), E.s8(0xb0)];
  // motoren
  m.ballX = E.s8(0x8ea7); m.ballY = E.s8(0x8ea8); m.ballH = E.s8(0x8ea9); m.ballSpeed = E.s8(0x8eaa); m.lastTouch = E.s8(0x8eab) as Side;
  set2(m.keeperOut, E.u8(0x8eac) !== 0, E.u8(0x8ead) !== 0); m.poss = E.s8(0x8eae) as Side | -1; m.lineSide1 = E.s8(0x8eaf); m.lineSide0 = E.s8(0x8eb0);
  m.ballEvent = E.s8(0x8eb1); m.state = E.s8(0x8eb2); m.shootout = E.s8(0x8eb3); m.b8eb5 = E.s8(0x8eb5); m.stoppage = E.s8(0x8eb7);
  m.clock = E.s16(0x8ed0); m.subTick = E.s16(0x8ed2); m.periodEnd = E.s16(0x8ed4); m.margin = E.s16(0x8ed6); m.ballDir = E.s16(0x8ed8);
  m.carrier = ptr(0xf582); m.receiver = ptr(0xf57a); set2(m.chaser, ptr(0xf586), ptr(0xf58a)); m.passTo = ptr(0x477e);
  m.loftCountdown = E.s8(0x1c5); m.landX = E.s8(0x1c6); m.landY = E.s8(0x1c7); m.fromX = E.s8(0x1c8); m.fromY = E.s8(0x1c9);
  m.firstTime = E.u8(0x1a7); m.b1cd = E.u8(0x1cd); m.x4782 = E.s32(0x4782); m.x4786 = E.s32(0x4786);
  m.passRecv = ptr(0xf5aa); m.passGiver = ptr(0xf5a6); m.lastToucher = ptr(0xf5ae); m.lastPasser = ptr(0xf576); m.lastPassType = E.s16(0x8d4a);
  set2(m.inFlight, E.u8(0x1a5), E.u8(0x1a6)); set2(m.touchCount, E.s8(0x8d46), E.s8(0x8d47)); set2(m.aiMode, E.s8(0x1ab), E.s8(0x1ac));
  set2(m.sideByte, E.u8(0x1ad), E.u8(0x1ae)); set2(m.counterFlag, E.u8(6) !== 0, E.u8(7) !== 0); m.penaltyFor = ptr(0x478a); m.knocks = E.u8(0xf639);
  set2(m.goals, E.u8(0xf5bd), E.u8(0xf5f3));
  m.last = [ptr(0xf58e), ptr(0xf592)]; m.fwd = [ptr(0xf596), ptr(0xf59a)];                 // sub_6cd660s pegere
  const aiR = ix.aiR as number[]; aiR[0] = E.f32(0x476a); aiR[1] = E.f32(0x476e);
  { const sb = ix.subs as { cohesion: number[]; resyncSlots: () => void }; sb.cohesion[0] = E.s16(0x1ce); sb.cohesion[1] = E.s16(0x1d0); sb.resyncSlots(); }   // engine+0x1ce+2·side: holdets samspil (sub_6bbb60)
  const terr = ix.territory as number[]; terr[0] = E.s16(0x1fc); terr[1] = E.s16(0x206); terr[2] = E.s16(0x210);   // engine+0x1fc/+0x206/+0x210 (0x6df5df)
  (ix.set as (k: string, v: number) => void)('secondKick', E.s8(0x8eb6));
  (ix.set as (k: string, v: number) => void)('kickCommented', E.u8(0x1ca));
  (ix.set as (k: string, v: number) => void)('b8eb4', E.s8(0x8eb4));
  const ls = ix.lastStyle as number[]; ls[0] = E.s16(0x1d2); ls[1] = E.s16(0x1d4);
  const ta = ix.timeAdded as boolean[]; ta[0] = E.u8(0x8d48) !== 0; ta[1] = E.u8(0x8d49) !== 0;
  const sm = ix.shotMark as { minute: number; side: number }; sm.minute = E.s16(0x8d4c); sm.side = E.s8(0x8d4e);
  // dommeren (engine+0xf5b2: +4 = officials.dat-posten, +8 = humøret): Discipline 0x25, bytes 0x24/0x27/0x28 og linjevogterens 0x29
  if (tr.OF) { const O = new Mem(tr.OF); m.official = { discipline: O.s8(0x25), b24: O.s8(0x24), b27: O.s8(0x27), b28: O.s8(0x28), mood: E.s16(0xf5ba) }; m.official29 = O.s8(0x29); }
  const tb = ix.teamBlk as number[][]; for (const s of [0, 1]) for (let k = 0; k < 54; k++) tb[s][k] = E.u8(0xf5bc + 54 * s + k);
  for (const q of m.gp) attachView(m, q);
  // gittercellerne engine+0x215e (90 bytes pr. felt: 11 pegere pr. side, antallet +0x58/+0x59) og spillernes +0x28
  for (const l of m.cells) l.length = 0;
  for (let x = 0; x < 9; x++) for (let y = 0; y < 12; y++) for (const s of [0, 1]) {
    const o = 0x215e + 90 * (12 * x + y), n = E.s8(o + 0x58 + s), l = m.cells[cellIx(x, y, s)];
    for (let k = 0; k < n; k++) { const q = L.gpOf(E.u32(o + 4 * (11 * s + k))); if (q) l.push(q); }
  }
  for (const s of [0, 1] as Side[]) L.side[s].forEach((q, i) => { q.cell = (tr.R.find((x) => x.side === s && x.idx === i)!.mp[0x28] << 24) >> 24; });
}

/** gittercellernes lister mod originalens dump (EN/XE) */
export function diffCells(L: Lock, m: GridMatchState, en: Uint8Array): string[] {
  const E = new Mem(en), out: string[] = [], who = (g: GP | null | undefined) => (g ? `${g.side},${L.side[g.side].indexOf(g)}` : '-');
  for (let x = 0; x < 9; x++) for (let y = 0; y < 12; y++) for (const s of [0, 1]) {
    const o = 0x215e + 90 * (12 * x + y), n = E.s8(o + 0x58 + s);
    const want = Array.from({ length: Math.max(0, n) }, (_, k) => who(L.gpOf(E.u32(o + 4 * (11 * s + k))))).join(' ');
    const got = m.cells[cellIx(x, y, s)].map(who).join(' ');
    if (want !== got) out.push(`felt ${x},${y} side ${s}: orig [${want}] port [${got}]`);
  }
  return out;
}

// ------------------------------------------------------------------ sammenligningen
/** MATCH_PLAYER-felterne, som porten har (navn → originalens værdi) */
export function decodePlayer(L: Lock, mpb: Uint8Array): Record<string, number | string> {
  const p = new Mem(mpb), who = (o: number) => { const g = L.gpOf(p.u32(o)); return g ? `${g.side},${L.side[g.side].indexOf(g)}` : '-'; };
  const r: Record<string, number | string> = {
    c01: p.u8(1), c02: p.u8(2), assists: p.u8(3), tacklesTried: p.u8(4), tacklesWon: p.u8(5), b6: p.u8(6), b7: p.u8(7), b8: p.u8(8), b9: p.u8(9),
    shots: p.u8(0xa), shotsOnTarget: p.u8(0xb), goals: p.u8(0xc), pensTaken: p.u8(0xd), penGoals: p.u8(0xe), b0f: p.u8(0xf), penGoalsWon: p.u8(0x10),
    dribblesPast: p.u8(0x11), blocks: p.u8(0x12), offsidesCaught: p.u8(0x13), fouls: p.u8(0x14), foulsSuffered: p.u8(0x15), b16: p.u8(0x16), morale: p.s8(0x17),
    slot: p.s8(0x19), b1b: p.u8(0x1b), b1c: p.u8(0x1c), b1d: p.u8(0x1d), yellows: p.u8(0x24), w29: p.s16(0x29), busy: p.s8(0x2b), w31: p.s16(0x31), w33: p.s16(0x33),
    rating: p.s16(0x35), form: p.s16(0x37), w39: p.s16(0x39), matchCA: p.s16(0x3b), condition: p.f32(0x4d), injuredBy: who(0x55), pendingCond: p.f32(0x59),
    bfd: p.u8(0xfd), temperCount: p.s8(0xff), motivation: p.s8(0x100), x: p.s8(0x102), y: p.s8(0x103), action: p.s16(0x198), facing: p.s16(0x19a), momentum: p.s16(0x19c),
    agitation: p.f32(0x1a2), grudge: who(0x1a6), marks: who(0x1aa),
  };
  ROLLS.forEach((k, i) => { r['roll.' + k] = p.u8(0x104 + i); });
  CAPS.forEach((k, i) => { r['cap.' + k] = p.u8(0x10e + i); });
  MATCH_FLOATS.forEach((k, i) => { r['f.' + k] = p.f32(0x71 + 4 * i); });
  return r;
}
export function portPlayer(L: Lock, q: GP): Record<string, number | string> {
  const who = (g: GP | null) => (g ? `${g.side},${L.side[g.side].indexOf(g)}` : '-');
  const r: Record<string, number | string> = {
    c01: q.c01 & 0xff, c02: q.c02 & 0xff, assists: q.assists & 0xff, tacklesTried: q.tacklesTried & 0xff, tacklesWon: q.tacklesWon & 0xff, b6: q.b6 & 0xff, b7: q.b7 & 0xff,
    b8: q.b8 & 0xff, b9: q.b9 & 0xff, shots: q.shots & 0xff, shotsOnTarget: q.shotsOnTarget & 0xff, goals: q.goals & 0xff, pensTaken: q.pensTaken & 0xff,
    penGoals: q.penGoals & 0xff, b0f: q.b0f & 0xff, penGoalsWon: q.penGoalsWon & 0xff, dribblesPast: q.dribblesPast & 0xff, blocks: q.blocks & 0xff,
    offsidesCaught: q.offsidesCaught & 0xff, fouls: q.fouls & 0xff, foulsSuffered: q.foulsSuffered & 0xff, b16: q.b16 & 0xff, morale: q.morale, slot: q.slot,
    b1b: q.b1b & 0xff, b1c: q.b1c & 0xff, b1d: q.b1d & 0xff, yellows: q.yellows & 0xff, w29: (q.w29 << 16) >> 16, busy: q.busy, w31: q.w31, w33: q.w33,
    rating: (q.rating << 16) >> 16, form: q.form, w39: q.w39, matchCA: q.matchCA, condition: Math.fround(q.condition), injuredBy: who(q.injuredBy), pendingCond: Math.fround(q.pendingCond),
    bfd: q.bfd & 0xff, temperCount: q.temperCount, motivation: q.motivation, x: q.x, y: q.y, action: (q.action << 16) >> 16, facing: q.facing, momentum: q.momentum,
    agitation: Math.fround(q.agitation), grudge: who(q.grudge), marks: who(q.marks as GP | null),
  };
  ROLLS.forEach((k) => { r['roll.' + k] = q.roll[k]; });
  CAPS.forEach((k) => { r['cap.' + k] = q.cap[k]; });
  MATCH_FLOATS.forEach((k) => { r['f.' + k] = Math.fround(q.f[k]); });
  return r;
}
/** alle forskelle mellem portens spillere og originalens XE-dump */
export function diffXE(L: Lock, m: GridMatchState, xe: Uint8Array, skip = new Set<string>()): string[] {
  const out: string[] = [];
  for (const s of [0, 1] as Side[]) L.side[s].forEach((q, i) => {
    const o = PL0 + s * PSTRIDE + i * PSZ;
    const a = decodePlayer(L, xe.subarray(o, o + PSZ)), b = portPlayer(L, q);
    if (a.slot === -5 && b.slot < 0) return;
    const d = Object.keys(a).filter((k) => !skip.has(k) && a[k] !== b[k]).map((k) => `${k} ${a[k]}/${b[k]}`);
    if (d.length) out.push(`spiller ${s},${i} (plads ${a.slot}): ${d.join(' ')}`);
  });
  // holdflagene (taktikken +0x584) og pladsernes instruktioner (+0x188b + 8·plads) – 0x6c54a0 skriver dem om ved dødbolde
  const E = new Mem(xe);
  for (const s of [0, 1] as Side[]) {
    const t = 0x91e2 + 6371 * s, f = E.u32(t + 0x584);
    if (f !== m.teamFlags[s] >>> 0) out.push(`holdflag side ${s}: orig ${f.toString(16)} port ${(m.teamFlags[s] >>> 0).toString(16)}`);
    for (const q of L.side[s]) {
      if (q.slot < 0 || q.slot > 10) continue;
      const v = (BigInt(E.u32(t + 0x188f + 8 * q.slot)) << 32n) | BigInt(E.u32(t + 0x188b + 8 * q.slot));
      if (v !== q.instr) out.push(`instruktion side ${s} plads ${q.slot}: orig ${v.toString(16)} port ${q.instr.toString(16)}`);
    }
  }
  return out;
}

/** T-linjen fra portens tilstand (samme format som match_trace.c; A-tokenets r med 3 decimaler) */
export function tLine(m: GridMatchState, tick: number, aiR: number[]): string {
  const c = m.carrier as GP | null;
  const ps: string[] = [];
  for (const s of [0, 1]) for (const p of m.gp) if (p.side === s && p.slot >= 0)
    ps.push(`${p.side},${p.slot},${p.x},${p.y},${p.roll.offTheBall},${p.roll.positioning},${p.form},${p.action & 0xffff},${p.marks ? 1 : 0},${p.facing},${p.busy},${p.momentum}`);
  return `T ${tick} ${m.ballX} ${m.ballY} ${m.ballH} ${m.poss} ${m.lineSide1} ${m.lineSide0} ${c ? c.slot + 100 * c.side : -1} A${m.aiMode[0]},${m.aiMode[1]},${aiR[0].toFixed(3)},${aiR[1].toFixed(3)},${m.state} ${ps.join(' ')}`;
}

const T_FIELDS = ['side', 'slot', 'x', 'y', 'roll107', 'roll10a', 'w37', 'action', 'marks', 'facing', 'busy', 'momentum'];
export function diffT(a: string, b: string): string[] {
  if (a === b) return [];
  const A = a.split(' '), B = b.split(' '), out: string[] = [];
  const head = ['T', 'tick', 'ballX', 'ballY', 'ballH', 'poss', 'line8eaf', 'line8eb0', 'carrier', 'A'];
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    if (A[i] === B[i]) continue;
    if (i < 10) { out.push(`${head[i]}: orig ${A[i]} port ${B[i]}`); continue; }
    const x = (A[i] ?? '').split(','), y = (B[i] ?? '').split(',');
    const fs = T_FIELDS.filter((_, k) => x[k] !== y[k]).map((f) => `${f} ${x[T_FIELDS.indexOf(f)]}/${y[T_FIELDS.indexOf(f)]}`);
    out.push(`spiller ${x[0]},${x[1]}: ${fs.join(' ')}`);
  }
  return out;
}

// ------------------------------------------------------------------ 0x6df460's indgange (tools/aimode_trace.c, RECOMP_AIMODE_TRACE: <spor>-aimode.txt)
/** D-linjerne under kampen (inMatch) for kampen med klubberne (hjemme, ude) – felterne som i tests/aiMode.test.ts' parseCall */
export function readAiModeCalls(file: string, home: number, away: number): string[][] {
  if (!existsSync(file)) return [];
  const out: string[][] = []; let on = false;
  for (const l of readFileSync(file, 'utf8').split('\n')) {
    // samme par kan stå i flere M-blokke (udtagelsens kald før kampen 0x6dbc50, så kampens egne) – saml til en anden kamp følger
    if (l.startsWith('M ')) { const f = l.split(' '), same = +f[1] === home && +f[2] === away; if (on && !same && out.length) break; on = same; continue; }
    if (on && l.startsWith('D ')) { const f = l.trim().split(/\s+/); if (f[2] === '1') out.push(f); }
  }
  return out;
}
const pairOf = (s: string) => s.split(',').map(Number) as [number, number];
function rowOf(s: string, d41: number, d55: number): TableRow | null {
  if (s === '-') return null;
  const [pos, c19, c2d, c41, c55] = s.split(':').map(Number);
  return { pos, c19, c2d, c41, c55, days41: d41 === -9999 ? 1e9 : d41, days55: d55 === -9999 ? 1e9 : d55 };
}
/** spillets data fra originalens kald (styrken, omdømmet, kamptypen, tabelrækkerne, manageren); motorens egne felter sammenlignes */
function aiModeFromTrace(f: string[], port: AiModeInput): { inp: AiModeInput; diff: string[] } {
  const n = (k: number) => Number(f[k]);
  const side = port.side;
  const [repOwn, repOpp] = pairOf(f[10]);
  const rep: [number, number] = side === 0 ? [repOwn, repOpp] : [repOpp, repOwn];
  const sums = pairOf(f[13]);
  const [l0, l1] = pairOf(f[16]);
  const league = n(18) && n(19) && n(20) && n(21) === 2 ? { teams: n(22), compRep: n(23), own: rowOf(f[31], n(29), n(28)), opp: rowOf(f[32], 1e9, 1e9) } : null;
  const want = { side: n(1), clock: n(3), periodEnd: n(4), goals: `${n(6)},${n(7)}`, crowd: `${n(8)},${n(9)}`, onPitch: f[11], territory: f[12], prevMode: n(34) };
  const got = { side, clock: port.clock, periodEnd: port.periodEnd, goals: port.goals.join(), crowd: port.crowd.join(), onPitch: port.onPitch.join(), territory: port.territory.join(), prevMode: port.prevMode };
  const diff = Object.keys(want).filter((k) => String(want[k as keyof typeof want]) !== String(got[k as keyof typeof got])).map((k) => `${k} orig ${want[k as keyof typeof want]} port ${got[k as keyof typeof got]}`);
  if (Math.abs(n(35) - port.prevR) > 5e-4 * Math.max(1, Math.abs(n(35)))) diff.push(`prevR orig ${n(35)} port ${port.prevR}`);
  const inp: AiModeInput = {
    ...port, strength: [Math.trunc(50 * sums[0] / 11), Math.trunc(50 * sums[1] / 11)], rep,
    fixtureKind: n(15), firstLeg: l0 === -1 ? null : [l0, l1], fixtureFlags: n(17),
    sameDivision: n(18) === 1, compLink: n(19) === 1, league, mgrAttacking: n(24) === -99 ? null : n(24), rivals: n(25) === 1,
  };
  return { inp, diff };
}

export interface LockResult { ticks: number; rands: number; ok: boolean; at?: string; diff?: string[]; stack?: string; finished: boolean }

/** kører porten i låsetrin med originalen; stopper ved første afvigelse */
export function runLockstep(tr: MatchTrace, opts: { maxTicks?: number; log?: (s: string) => void; aimode?: string[][] } = {}): LockResult {
  const teams = teamsOf(tr);
  const base = new Mem(tr.R[0].mp).u32(0x19e);
  let mode: 'init' | 'lock' = 'init', feed: [number, number, number][] = [], fi = 0, fail: string | null = null, stack = '', rands = 0;
  let dummy = 12345;
  const hist: string[] | null = process.env.LOCKHIST ? [] : null;
  let poFail = ''; const poIdx: number[] = [];
  const turnLines: string[][] = [], turnIdx: number[] = [];
  let lastTurn = '';
  const zpLines: string[][] = [], zpIdx: number[] = [];
  let amI = 0;
  const rand: Rand = (n) => {
    const k = Math.trunc(n);
    if (mode === 'init') { if (k === 0) return 0; dummy = (dummy * 1103515245 + 12345) & 0x7fffffff; return k > 0 ? dummy % k : -(dummy % -k); }
    if (fail) return 0;
    const e = feed[fi++];
    if (!e) { fail = `tik ${tick}: porten trækker rand(${k}), men originalens tik har ikke flere tal`; stack = new Error().stack ?? ''; throw new Error('lockstep'); }
    rands++;
    if (hist) { const st = (new Error().stack ?? '').split('\n').slice(2, 4).map((x) => x.trim().replace(/^at /, '').replace(/\(.*\/(.*?):(\d+):\d+\)/, '$1:$2')).join(' < '); hist.push(`${k}/${e[0]}@${e[1].toString(16)}=${e[2]}  ${st}`); if (hist.length > +(process.env.LOCKHIST || 60)) hist.shift(); }
    // 0x90d06e: rand(|n| > 0xffff) kalder sig selv med trunc(10n/65535) – det indre kald står først i sporet (returadresse 0x90d073)
    if ((k > 0xffff || k < -0xffff) && e[1] === 0x90d073 && e[0] === Math.trunc((10 * k) / 65535)) return rand(n);
    if (e[0] !== k) { fail = `tik ${tick}: rand(${k}) ≠ originalens rand(${e[0]}) fra 0x${e[1].toString(16)} (nr. ${fi - 1} i tikket)${lastTurn ? ` – i turen ${lastTurn}` : ''}\n  før: ${feed.slice(Math.max(0, fi - 9), fi - 1).map((x) => `${x[0]}@${x[1].toString(16)}=${x[2]}`).join(' ')}\n  efter: ${feed.slice(fi, fi + 6).map((x) => `${x[0]}@${x[1].toString(16)}=${x[2]}`).join(' ')}`; stack = new Error().stack ?? ''; throw new Error('lockstep'); }
    return e[2];
  };
  let ix: Record<string, unknown> = {};
  const maxT = Math.min(opts.maxTicks ?? Infinity, tr.ticks.length);
  const L: Lock = { tr, base, side: [[], []], gpOf: () => null };
  let tick = 0, topSeen = false;
  // kampens rammer fra motoren, som porten ellers har som *estimerede* værdier: vejret engine+0x4756 (byte + næste byte) og banen engine+1
  const E0 = new Mem(tr.EN);
  const save = { aiTeam: GRID_UNKNOWN.aiTeam, weather: GRID_UNKNOWN.weather, weatherWord: GRID_UNKNOWN.weatherWord, byte1: GRID_UNKNOWN.byte1 };
  Object.assign(GRID_UNKNOWN, { aiTeam: false, weather: E0.s8(0x4756), weatherWord: E0.u16(0x4756), byte1: E0.u8(1) });
  let g;
  try {
    g = createGridMatch(teams[0] as never, teams[1] as never, rand, {
      compRep: tr.CP ? new Mem(tr.CP).s16(0x69) : undefined,
      aiModeInput: opts.aimode?.length ? (inp) => {
        if (!topSeen || fail) return inp;
        // originalens kald i rækkefølge; kald fra før låsetrinet (afsparket i init) springes over på uret
        while (amI < opts.aimode!.length && +opts.aimode![amI][3] < inp.clock) amI++;
        const f = opts.aimode![amI++];
        if (!f) { fail = `tik ${tick}: porten kalder 0x6df460 (side ${inp.side}, ur ${inp.clock}), men originalen har ikke flere kald`; throw new Error('lockstep'); }
        const r = aiModeFromTrace(f, inp);
        if (r.diff.length) { fail = `tik ${tick}: 0x6df460's indgange afviger (side ${inp.side}): ${r.diff.join('; ')}`; throw new Error('lockstep'); }
        return r.inp;
      } : undefined,
      compType: tr.FX ? tr.FX[0x3a] : undefined,                                            // fixture+0x3a (sub_6d42a0, venskabskamp 1/9)
      ai: tr.HU ? [tr.HU[0] === 0, tr.HU[1] === 0] : undefined,                               // sub_600a50: menneskets hold (HU-linjen)
      humanClub: tr.HU1 ? [tr.HU1[0] !== 0, tr.HU1[1] !== 0] : undefined,                      // sub_600a50(klub, 0, 1, 0, 0) (HU's 3. felt)
      roles: tr.RL as never,
      // klubbernes omdømme club +0x80 (CL-linjerne) – genvalgets flag 0x6e12ea, 0x6ddab0's holdflag/instruktioner og 0x6e0230's divisor
      ...(tr.CL[0] && tr.CL[1] ? { rep: [new Mem(tr.CL[0]).s16(0x80), new Mem(tr.CL[1]).s16(0x80)] as [number, number],
        clubNation: [new Mem(tr.CL[0]).u32(0x53), new Mem(tr.CL[1]).u32(0x53)] as [number, number] } : {}),
      ...(tr.TK ? { takers: tr.TK as [number[], number[]] } : {}),
      // FS/FT-linjerne (femte runde): holdets anfører/dødboldsskytter og taktiklistens statistik ved genvalget/omrokeringen – computerens
      // udtagelse for 0x6e1aa0's taktikvalg (0x6e0230/0x6ddab0) og 0x6e2f20's anfører-/skytteled
      ...(() => {
        const fs: (string[] | null)[] = [null, null]; let ft: string[] | null = null;
        for (const t of tr.ticks) for (const l of t.other) {
          if (l.startsWith('FS ')) { const f = l.split(' '); if (!fs[+f[1]]) fs[+f[1]] = f; }
          else if (!ft && l.startsWith('FT')) ft = l.split(' ').slice(1);
        }
        if (!fs[0] && !fs[1]) return {};
        const stats = ft?.length === 45 ? ft.map((x) => { const [, g, a, b, c] = x.split(':').map(Number); return { games: g, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0, perf: [a, b, c] as [number, number, number] }; }) : undefined;
        const mg = (s: number) => { const g = tr.MG?.[s]; return g?.np ? { id: new Mem(g.np).u32(0), ca: new Mem(g.np).s16(4), tac: [0x0e, 0x13, 0x15, 0x1a, 0x1c, 0x1f, 0x21, 0x43].map((k) => g.np![k]) } : null; };
        const pick = fs.map((f, s) => (f ? { date: tr.DT ? dayDate(tr.DT[0], tr.DT[1]) : undefined, clubId: tr.M[s], manager: mg(s), tacticStats: stats } : null));
        const pickTeam = fs.map((f) => (f ? { captain: +f[8] || null, setPieces: [+f[9], +f[10], +f[11]].map((x) => (x > 0 ? x : -1)) } : null));
        return { pick: pick as never, pickTeam: pickTeam as never };
      })(),
      rotation: [new Mem(tr.EN).s8(0x9032 + 0x1a), new Mem(tr.EN).s8(0x9032 + 0xd0 + 0x1a)],   // hold+0x1a fra motorens dump (spillets data)
      // 0x48f150(turneringen, klubben) (genvalgets ligagren 0x6e132c): sporet har den ikke – venskabskampe (fixture+0x3a = 1/9) tæller ikke
      // klubben (*antaget*; pokalsporets turnering 72 er en venskabsturnering), ligaen (turnering 7) gør
      ...(tr.FX && (tr.FX[0x3a] === 1 || tr.FX[0x3a] === 9) ? { league: false } : {}),
      subs: [new Mem(tr.EN).s8(0x9032 + 0x17), new Mem(tr.EN).s8(0x9032 + 0xd0 + 0x17)],   // hold+0x17: udskiftninger tilbage (venskabskamp 9)
      rotation16: [new Mem(tr.EN).u8(0x9032 + 0x16) !== 0, new Mem(tr.EN).u8(0x9032 + 0xd0 + 0x16) !== 0],   // hold+0x16
      // DT/MG-linjerne (fjerde runde): dagens dato og managerens ikke-spillerpost (+0x9051: [Attacking +0xe, Directness +0x13, Free Roles +0x15,
      // Marking +0x1a, Offside +0x1c, Pressing +0x1f, Tactics +0x21, +0x43]) og taktikkens navn (+0x905d)
      ...(tr.DT ? { date: dayDate(tr.DT[0], tr.DT[1]) } : {}),
      // MV-linjerne (sub_6ec010's indgange, fjerde runde): spillets data fra kampstartens kald (tik −1) pr. spiller (side, staff-id)
      ...(tr.MVL ? (() => {
        const envs = new Map<string, MatchValuesEnv>();
        // (kampstartens kald først; indskiftede spillere har kun kald i kampen – den statiske del er den samme)
        const cs = parseMv(tr.MVL.join('\n')), byTick = [...cs.filter((c) => c.head.split(' ')[1] === '-1'), ...cs];
        for (const c of byTick) { const h = c.head.split(' '); const k = `${h[2]},${h[4]}`; if (!envs.has(k)) envs.set(k, caseInput(c).env); }
        // hvert kald i kampen mod originalens næste kald for samme spiller (MVO: kamp-CA og floats bit for bit)
        const mid = cs.filter((c) => +c.head.split(' ')[1] >= 0 && tr.MVL!.indexOf(c.head) >= 0), seen = new Map<string, number>();
        const onMatchValues = (q: GP, env: MatchValuesEnv) => {
          if (!topSeen || fail) return;
          const k = `${q.side},${q.src.id}`, i = seen.get(k) ?? 0; seen.set(k, i + 1);
          const c = cs.filter((x) => { const h = x.head.split(' '); return +h[1] >= 0 && `${h[2]},${h[4]}` === k; })[i];
          if (!c) return;
          const o = new Mem(c.out), bad: string[] = [];
          if (o.s16(0x3b) !== q.matchCA) bad.push(`CA ${o.s16(0x3b)}/${q.matchCA}`);
          MATCH_FLOATS.forEach((f, j) => { const v = o.f32(0x71 + 4 * j); if (Math.fround(q.f[f]) !== v) bad.push(`${f} ${v}/${q.f[f]}`); });
          if (bad.length && process.env.LOCKMV) console.log(`MV tik ${tick} side ${q.side} id ${q.src.id} (orig ${c.head}): ${bad.slice(0, 6).join(' ')} | crowd ${env.crowd} coh ${env.cohesion} cap ${env.captain?.pos} ${JSON.stringify(c.kv.coh)} ${c.kv.crowd} ${c.kv.cpos} morale ${q.morale}/${(new Mem(hex(c.kv.mp))).s8(0x17)} pos ${q.pos},${q.posAttack}/${c.kv.pos},${c.kv.posA} tw ${JSON.stringify(env.tactics[q.side].prim)}/${c.kv[`tw${q.side}`]}`);
        };
        void mid;
        return { matchValuesEnv: (q: GP) => envs.get(`${q.side},${q.src.id}`), onMatchValues };
      })() : {}),
      // CP/RC-linjerne: anføreren og spillets data til holdets samspil sub_6bbb60
      ...(tr.RC ? { cohesionOf: (q: GP) => tr.RC!.get(`${q.side},${L.side[q.side].indexOf(q)}`), captainIdx: (s: Side) => tr.CAP?.[s] } : {}),
      ...(tr.MG ? { managers: tr.MG.map((g) => g.np ? { id: new Mem(g.np).u32(0), ca: new Mem(g.np).s16(4), tac: [0x0e, 0x13, 0x15, 0x1a, 0x1c, 0x1f, 0x21, 0x43].map((k) => g.np![k]) } : null) as never,
        tacticName: tr.MG.map((g) => g.tactic) as never } : {}),
      // F-linjerne (0x6e2f20 inde i genvalget 0x6e1090): originalens værdi for samme (spiller, plads, flag, instruktioner, taktikbyte, holdflag,
      // angrebsflag) i tikket injiceres (LOCKF=1 viser, hvor portens egen værdi afviger); uden F-linje portens værdi
      subScore: (_s, q, spec, flags, tf, v) => {
        if (!topSeen) return v;
        const key = `F ${q.src.id} ${(spec.pos & 0xffff).toString(16).padStart(4, '0')} ${(flags >>> 0).toString(16).padStart(8, '0')} ${(spec.instrLo >>> 0).toString(16).padStart(8, '0')} ${(spec.instrHi >>> 0).toString(16).padStart(8, '0')} ${(spec.tacticByte & 0xff).toString(16).padStart(2, '0')} ${(tf >>> 0).toString(16).padStart(8, '0')} ${(spec.att & 0xffff).toString(16).padStart(4, '0')} `;
        const l = (tr.ticks[tick]?.other ?? []).find((x) => x.startsWith(key));
        if (!l) { if (process.env.LOCKF) console.log(`F tik ${tick}: ingen F-linje for ${key}(port ${v})`); return v; }
        const o = +l.slice(l.indexOf('= ') + 2);
        if (o !== v && process.env.LOCKF) console.log(`F tik ${tick}: ${key}orig ${o} port ${v}`);
        return process.env.LOCKF === 'port' ? v : o;
      },
      expose: (x) => { ix = x; },
      // portens spor-linjer (Q/O/H/…) i match_trace.c's format: originalens tik-tal er +1 (tælleren øges efter T-linjen)
      onShot: (k, v) => {
        if (!topSeen) return;
        if (process.env.LOCKQ) console.log(`port ${k} ${tick + 1} ${v.join(' ')}`);
        if ((k as string) === 'PO' && !poFail) {                                              // afleveringsmulighedens værdier mod originalens PO-linje
          const o = (tr.ticks[tick]?.other ?? []).filter((l) => l.startsWith('PO '))[poIdx[tick] = (poIdx[tick] ?? -1) + 1];
          if (!o) return;
          const f = o.split(' '), fr = new Mem(hex(f[7]));
          const want = [+f[2], +f[3], +f[4], +f[5], +f[6]], got = v.slice(0, 5);
          if (want.join() !== got.join()) poFail = `PO tik ${tick}: orig side,slot,W,kort,lang ${want.join(',')} Sground ${fr.s32(0x38)} Slofted ${fr.s32(0x44)} mark ${fr.f32(0x20)} D ${fr.f32(0x24)} | port ${got.join(',')} ${JSON.stringify(v.slice(5))}`;
        }
      },
      // zonevalget sub_6bc030 mod originalens ZP-linjer (markøren og det valgte mål, i rækkefølge)
      onZonal: (p, r) => {
        if (!topSeen || fail) return;
        const ls = (zpLines[tick] ??= (tr.ticks[tick]?.other ?? []).filter((l) => l.startsWith('ZP ')));
        if (!ls.length) return;
        const k = (zpIdx[tick] = (zpIdx[tick] ?? -1) + 1), want = ls[k];
        const got = `ZP ${tick + 1} ${p.side} ${p.slot} -> ${r ? r.side : -1} ${r ? r.slot : -1}`; if (process.env.LOCKZP) console.log(`port ${got} / orig ${want}`);
        if (want !== got) { fail = `tik ${tick}: zonevalg nr. ${k}: originalen ${want ?? '(ingen)'} – porten ${got} (tallet nr. ${fi} i tikket)`; stack = new Error().stack ?? ''; throw new Error('lockstep'); }
      },
      // turene sub_7103e0 mod originalens TU/TV-linjer (rækkefølgen, spilleren og hans felt ved indgangen og udgangen)
      onTurn: (p, out) => {
        if (!topSeen || fail) return;
        const ls = (turnLines[tick] ??= (tr.ticks[tick]?.other ?? []).filter((l) => l.startsWith('TU ') || l.startsWith('TV ')));
        if (!ls.length) return;                                                                // spor uden TU-linjer
        const k = (turnIdx[tick] = (turnIdx[tick] ?? -1) + 1), want = ls[k];
        const got = out ? `TV ${tick + 1} ${p.side} ${p.slot} ${p.x} ${p.y} ${(p.action << 16) >> 16}` : `TU ${tick + 1} ${p.side} ${p.slot} ${p.x} ${p.y}`;
        lastTurn = out ? '' : `${got} (nr. ${k >> 1})`;
        if (want !== got) {
          fail = `tik ${tick}: tur nr. ${k >> 1}: originalen ${want ?? '(ingen)'} – porten ${got} (tallet nr. ${fi} i tikket)\n  forrige: ${ls.slice(Math.max(0, k - 4), k).join(' | ')}`;
          stack = new Error().stack ?? ''; throw new Error('lockstep');
        }
      },
      onTop: (m) => {
        if (!topSeen) {
          topSeen = true;
          L.side = [m.gp.filter((q) => q.side === 0), m.gp.filter((q) => q.side === 1)];
          L.gpOf = (p: number) => { if (!p) return null; const o = p - base - PL0; if (o < 0) return null; const s = Math.floor(o / PSTRIDE), i = Math.floor((o % PSTRIDE) / PSZ); return L.side[s]?.[i] ?? null; };
          inject(L, m, ix);
          // fejlsøgning: LOCKWATCH="side,idx,felt" udskriver hver ændring af feltet med tik, tal-nummer og stak
          if (process.env.LOCKWATCH) {
            const [ws, wi, wf] = process.env.LOCKWATCH.split(','); const q = L.side[+ws][+wi] as unknown as Record<string, unknown>;
            let v = q[wf];
            Object.defineProperty(q, wf, { get: () => v, set: (nv) => { if (nv !== v) console.log(`watch tik ${tick} tal ${fi}: ${wf} ${v} → ${nv}  ${(new Error().stack ?? '').split('\n').slice(2, 5).map((x) => x.trim().replace(/^at /, '').replace(/\(.*\/(.*?):(\d+):\d+\)/, '$1:$2')).join(' < ')}`); v = nv; }, configurable: true });
          }
          // LOCKMWATCH="felt" (fx ballH): det samme for et felt i motoren (Match)
          if (process.env.LOCKMWATCH) {
            const wf = process.env.LOCKMWATCH, q = m as unknown as Record<string, unknown>;
            let v = q[wf];
            Object.defineProperty(q, wf, { get: () => v, set: (nv) => { if (nv !== v) console.log(`mwatch tik ${tick} tal ${fi}: ${wf} ${v} → ${nv}  ${(new Error().stack ?? '').split('\n').slice(2, 5).map((x) => x.trim().replace(/^at /, '').replace(/\(.*\/(.*?):(\d+):\d+\)/, '$1:$2')).join(' < ')}`); v = nv; }, configurable: true });
          }
          mode = 'lock'; feed = tr.ticks[0].r; fi = 0;
        } else {
          // forrige tik: alle originalens tal skal være brugt
          if (!fail && fi !== feed.length) { fail = `tik ${tick}: porten brugte ${fi} af originalens ${feed.length} tal (næste rand(${feed[fi][0]}) fra 0x${feed[fi][1].toString(16)})`; }
          tick++;
          if (!fail) {
            const want = tr.ticks[tick]?.T;
            if (want) { const d = diffT(want, tLine(m, tick, ix.aiR as number[])); if (d.length) { fail = `tilstanden efter tik ${tick - 1} afviger`; (L as { diff?: string[] }).diff = d; } }
            const xe = tr.ticks[tick]?.XE;
            if (!fail && xe && process.env.LOCKXE) { const d = diffXE(L, m, xe); if (d.length) { fail = `XE-dumpet efter tik ${tick - 1} afviger`; (L as { diff?: string[] }).diff = d; } }
            if (!fail && xe && process.env.LOCKCELL !== '0') { const d = diffCells(L, m, xe); if (d.length) { fail = `gittercellerne efter tik ${tick - 1} afviger`; (L as { diff?: string[] }).diff = d; } }
          }
          feed = tr.ticks[tick]?.r ?? []; fi = 0;
        }
        if (fail) throw new Error('lockstep');
        if (tick >= maxT) throw new Error('lockstep-stop');                                    // toppen af tik maxT nået: stop (ingen tal herfra)
      },
    });
  } catch (e) { Object.assign(GRID_UNKNOWN, save); throw e; }
  // LOCKC=1: portens kald af 0x6d6f70 (som sporets c-linjer: tik id p1 s1 p2 s2 extra dybde)
  if (process.env.LOCKC) (g as unknown as { events: { onCall?: (...a: number[]) => void } }).events.onCall = (...a) => console.log(`portc ${tick + 1} ${a.join(' ')}`);
  const max = maxT;
  let finished = false;
  try {
    while (!fail && tick < max) { if (!g.tick()) { finished = true; break; } }
  } catch (e) { if ((e as Error).message !== 'lockstep' && (e as Error).message !== 'lockstep-stop') { fail = `undtagelse: ${(e as Error).message}`; stack = (e as Error).stack ?? ''; } }
  finally { Object.assign(GRID_UNKNOWN, save); }
  if (hist && fail) console.log(hist.join('\n'));
  if (poFail) console.log('første PO-forskel: ' + poFail);
  return { ticks: tick, rands, ok: !fail, at: fail ?? undefined, diff: (L as { diff?: string[] }).diff, stack, finished };
}
