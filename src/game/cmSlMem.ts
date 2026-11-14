// Ønskelisternes hukommelse (cmShortlistGame.ts buildSlMem), bygget hurtigere (14/11-2026): samme bytes som cmContractGame.ts buildWantMem(g, alle
// klubber, { full: true }) oven på cmWageGame.ts buildWageMem(…, recalc = false, full = true) – samme rækkefølge af skrivninger, samme id'er og
// adresser – men uden de små hjælpefunktioner pr. byte: posterne skrives direkte i SparseMem's sider, spillerposten (aiTeam.ts playerRecordInto)
// gemmes pr. spiller (genbruges, så længe dens inddata er de samme), og datoerne slås op i en tabel. Kontrol: scripts/cm-sl-memcheck.ts
// sammenligner alle sider med de to oprindelige byggere (og cmShortlistGame.ts gør det selv med CM_SL_MEMCHECK=1). Ændres buildWageMem/
// buildWantMem, skal denne følge med (kontrollen fanger det).
import type { GameState, Player, Staff } from './types';
import { type CmCtx, G, SparseMem } from './cmMem';
import { cmMemCall, scanOf, writeKeyIds, KEY_NATIONS, OTHER_GLOBALS, NAT7F, STAFF0, PREC0, CLUB0, NAT0, DIV0, FIN0, K0, ROWS0, TM0, PTRS, type WageMem } from './cmWageGame';
import type { WantMem } from './cmContractGame';
import { getMaxWage_5968d0 } from './cmMaxWage';
import { getClubFinance_5a0590 } from './cmWage';
import { genCtx } from './cmGen/impls';
import { slCall, slmOf } from './cmShortlist';
import { clubRepMem } from './cmPlayerData';
import { leagueOf } from './cmContractInit';
import { formulaValueGbp } from './originalValue';
import { playerRecordInto } from './engine/grid/aiTeam';
import { nationLanguage } from './engine/grid/nationLanguage';
import { regionOf } from './leagues';
import { ATTRS } from './attributes';
import { ageOn } from './dates';
import { squadIds } from './state';
import { isHumanClub } from './humans';
import { boardEnv } from './cmBoardGame';
import { leagueClash } from './cmBoardInterest';
import type { BoardEnv } from './cmBoard';

const GBP = 0.86;
// (cmContractGame.ts' adresser)
const MMOBJ = 0x2bff0000, MMREC = 0x2b000000, EURO0 = 0x2c000000, STAD0 = 0x2d000000, CITY0 = 0x2c800000, COMP0 = 0x3e000000, VT = 0x3dff0000, CONT0 = 0x3dfe0000, PREF0 = 0x2f000000, STATS0 = 0x3e800000, ROW4A = 0x3dfd0000, NOBODY = 0x2e000000;
// (cmContractGame.ts SEASON_ROWS – sæsontabellen 0xb63d60)
const SEASON_ROWS: [string, string][] = [
  ['', '01000000cc0702000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10702000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701f4b15c720000000000000000ad00d10700000000170005d107ffff8a00d10700000000140004d1070500'],
  ['', '01000000d107010fb95c720000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701f0415c720000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['', '01000000d10701000000000000000000000000b400d10700000000010006d1070500b400d10700000000010006d1070500'],
  ['Argentina', '01000000000000000000000000000000000000dc00d1070000000000000000000000c700d1070000000000000000000000'],
  ['Australia', '010000000000000000000000000000000000001201d1070000000000000000000000a000d1070000000000000000000000'],
  ['Belgium', '0100000000000076b45c720000000000000000d700d10700000000000000000000009700d1070000000000000000000000'],
  ['Brazil', '000000000000001e465c7200000000000000001100d20700000000000000000000005b01d2070000000000000000000000'],
  ['Croatia', '01000000000000a1645c720000000000000000c900d10700000000000000000000009300d1070000000000000000000000'],
  ['Denmark', '010000000000004cb55c720000000000000000d100d1070000000000000000000000a400d1070000000000000000000000'],
  ['England', '01000000d1070167bc5c72d2bc5c723dbd5c72de00d107000000000a0007d10705009000d20700000000180004d2070500'],
  ['Finland', '00000000000000ed585c7200000000000000007400d20700000000000000000000003b01d2070000000000000000000000'],
  ['France', '01000000000000b7b55c7222b65c7200000000de00d10700000000000000000000008f00d1070000000000000000000000'],
  ['Germany', '010000000000008db65c720000000000000000d000d10700000000000000000000009100d1070000000000000000000000'],
  ['Greece', '010000000000000c655c720000000000000000e500d10700000000000000000000008c00d1070000000000000000000000'],
  ['Holland', '01000000000000f8b65c720000000000000000e500d10700000000000000000000009d00d1070000000000000000000000'],
  ['Republic of Ireland', '01000000000000b05c5c720000000000000000d100d10700000000000000000000008b00d1070000000000000000000000'],
  ['Italy', '0100000000000063b75c720000000000000000ed00d10700000000000000000000009e00d1070000000000000000000000'],
  ['Japan', '000000000000000000000000000000000000004300d20700000000000000000000004b01d1070000000000000000000000'],
  ['Northern Ireland', '01000000000000516b5c720000000000000000de00d10700000000000000000000007f00d1070000000000000000000000'],
  ['Norway', '00000000000000e5b95c7200000000000000006700d20700000000000000000000002f01d2070000000000000000000000'],
  ['Poland', '01000000000000f5625c720000000000000000c200d10700000000000000000000009b00d1070000000000000000000000'],
  ['Portugal', '01000000000000bbba5c720000000000000000ed00d10700000000000000000000009e00d1070000000000000000000000'],
  ['Russia', '000000000000001c795c7200000000000000005100d20700000000000000000000003901d2070000000000000000000000'],
  ['Scotland', '0100000000000013be5c720000000000000000d700d10700000000000000000000008f00d1070000000000000000000000'],
  ['South Korea', '00000000000000d4895c7200000000000000005200d20700000000000000000000004801d2070000000000000000000000'],
  ['Spain', '0100000000000026bb5c720000000000000000f400d1070000000000000000000000a400d1070000000000000000000000'],
  ['Sweden', '00000000000000fcbb5c7200000000000000006000d20700000000000000000000002a01d2070000000000000000000000'],
  ['Turkey', '0100000000000001725c720000000000000000d800d10700000000000000000000008c00d1070000000000000000000000'],
  ['United States', '000000000000000000000000000000000000005100d20700000000000000000000000500d2070000000000000000000000'],
  ['Wales', '0100000000000046785c720000000000000000e500d10700000000000000000000007d00d1070000000000000000000000'],
];
const SEASON_BYTES = SEASON_ROWS.map(([, hex]) => { const b: number[] = []; for (let i = 0; i + 1 < hex.length; i += 2) b.push(parseInt(hex.slice(i, i + 2), 16)); return b; });
const OCEANIA = new Set(['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa', 'American Samoa', 'Tonga', 'Vanuatu', 'Tahiti', 'Solomon Islands', 'New Caledonia', 'Cook Islands']);

/** ageOn(dob, date) uden midlertidige strenge (samme regel: årene, minus 1 før fødselsdagen – "MM-DD" sammenlignet som tal) */
const DIGITS = [0, 1, 2, 3, 5, 6, 8, 9];
function ageFast(dob: string, dy: number, dmd: number, date: string): number {
  if (dob.length < 10) return ageOn(dob, date);
  const c = (i: number) => dob.charCodeAt(i) - 48;
  for (const i of DIGITS) { const d = c(i); if (!(d >= 0 && d <= 9)) return ageOn(dob, date); }
  const y = c(0) * 1000 + c(1) * 100 + c(2) * 10 + c(3), md = (c(5) * 10 + c(6)) * 100 + c(8) * 10 + c(9);
  return dmd < md ? dy - y - 1 : dy - y;
}
const leap = (y: number) => (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 1 : 0);
/** dagen i året og året for en ISO-dato (gemt pr. streng) – som cmWageGame/cmContractGame isoDay */
const ISO_D = new Map<string, number>(), ISO_Y = new Map<string, number>();
function isoD(iso: string): number {
  let d = ISO_D.get(iso);
  if (d === undefined) {
    const y = +iso.slice(0, 4);
    d = Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000);
    if (ISO_D.size > 200000) { ISO_D.clear(); ISO_Y.clear(); }
    ISO_D.set(iso, d); ISO_Y.set(iso, y);
  }
  return d;
}
const isoY = (iso: string) => { isoD(iso); return ISO_Y.get(iso)!; };
const ATTR_IX = new Map<string, number>(ATTRS.map((k, i) => [k, i]));
const IX = (k: string) => ATTR_IX.get(k) ?? -1;
const A_AMB = IX('ambition'), A_DET = IX('determination'), A_LOY = IX('loyalty'), A_PRE = IX('pressure'), A_PRO = IX('professionalism');
const attrI = (p: Player, ix: number) => Math.round(p.attrs[ix] || 10);

/** spillerposten +0x16..+0x45 og +4 (playerRecordInto) gemt pr. spiller: genbruges, når inddataene (alle felter, playerRecordInto læser – moralen
 *  afrundet som den skrives) er de samme. `ver` skifter, når posten regnes igen (fingeraftrykket nedenfor sammenligner det). */
interface RecMemo { key: Float64Array; n: number; rec: Uint8Array; ver: number }
const REC_MEMO = new WeakMap<Player, RecMemo>();
const REC_SCRATCH: number[] = new Array(0x46).fill(0);
let recVer = 0;
/** udefineret i et fingeraftryk (NaN kan ikke sammenlignes) */
const UND = -1.2345e300;
const num = (v: number | undefined | null) => (v === undefined || v === null ? UND : v);
let RK = new Float64Array(256);
function recOf(p: Player): RecMemo {
  const rp = p.cmRepMem ?? p.cmRep, pos = p.pos, side = p.side, ci = p.cmInt, at = p.attrs;
  const need = 24 + pos.length + (ci ? ci.length : 0) + at.length;
  if (RK.length < need) RK = new Float64Array(need * 2);
  const k = RK;
  let n = 0;
  k[n++] = num(p.number); k[n++] = p.ca; k[n++] = p.pa;
  if (rp) { k[n++] = 1; k[n++] = rp[0]; k[n++] = rp[1]; k[n++] = rp[2]; } else { k[n++] = 0; k[n++] = p.rep; }
  k[n++] = num(side[0]); k[n++] = num(side[1]); k[n++] = num(side[2]); k[n++] = num(p.cmFree);
  k[n++] = num(p.feet?.[0]); k[n++] = num(p.feet?.[1]); k[n++] = p.foot === 'L' ? 1 : p.foot === 'R' ? 2 : p.foot === 'B' ? 3 : 0;
  k[n++] = Math.round(p.morale ?? 10);                                     // (b(0x45, morale) = Math.round – moralen glider hver dag)
  k[n++] = pos.length; for (let i = 0; i < pos.length; i++) k[n++] = num(pos[i]);
  if (ci) { k[n++] = ci.length; for (let i = 0; i < ci.length; i++) k[n++] = num(ci[i]); } else k[n++] = -1;
  k[n++] = at.length; for (let i = 0; i < at.length; i++) k[n++] = num(at[i]);
  const e = REC_MEMO.get(p);
  if (e && e.n === n) {
    const o = e.key;
    let i = 0;
    while (i < n && o[i] === k[i]) i++;
    if (i === n) return e;
  }
  const r = playerRecordInto(p, REC_SCRATCH), rec = new Uint8Array(0x46);
  for (let i = 0; i < 0x46; i++) rec[i] = r[i] & 0xff;
  const m: RecMemo = { key: k.slice(0, n), n, rec, ver: ++recVer };
  REC_MEMO.set(p, m);
  return m;
}

/** klubbernes spillere [id, CA] (cmContractGame.ts clubCaIdx) */
function clubCaIdx(g: GameState) {
  const byClub = new Map<number, [number, number][]>();
  return {
    of(cid: number) {
      let l = byClub.get(cid);
      if (!l) { l = []; for (const id of squadIds(cid)) { const x = g.players[id]; if (x && x.club === cid && !x.loan) l.push([x.id, x.ca]); } byClub.set(cid, l); }
      return l;
    },
  };
}
/** (cmContractGame.ts newClubStatus) */
function newClubStatus(g: GameState, p: Player, cid: number, idx: ReturnType<typeof clubCaIdx>): number {
  let better = 0;
  for (const [id, ca] of idx.of(cid)) if (id !== p.id && ca > p.ca) better++;
  if (better < 2) return 1;
  if (better < 11) return 2;
  if (better < 16) return 3;
  const age = ageOn(p.dob, g.date);
  if (age <= 21) return p.pa > p.ca + 20 ? 5 : 6;
  return 4;
}
/** (cmContractGame.ts valueOf) */
function valueOf(g: GameState, p: Player | undefined, clubId: number): number {
  const club = g.clubs[clubId];
  if (!p) return 0;
  if (!club?.vc || !p.cmRep) return Math.round((p.value ?? 0) * GBP);
  return Math.trunc(formulaValueGbp({ pa: p.pa, age: ageOn(p.dob, g.date), pos: p.pos, attrs: p.attrs, rep: p.cmRep, caps: p.caps ?? 0, staffId: p.id, clubId, vc: club.vc }));
}


// ---------------------------------------------------------------- personerne (spillerne) – den varige del
// Spillernes poster (personposten 0x6e, rækken +0/+4, spillerposten, kontrakten, præferenceposten) afhænger kun af spilleren selv, hans id, hans
// klub og præferencepostens nummer – ikke af andre poster (adresserne er faste: klub, land, personer efter id). De ligger i en varig hukommelse
// pr. spil (Base.P), som kun opdateres for de spillere, hvis inddata (fingeraftrykket – alt, posterne skrives af) er ændret siden i går; dagens
// hukommelse er en kopi ved første brug af hver side (SparseMem `miss`), hvor resten (klubberne, staben, landene, globalerne) skrives som før.

type StaffOfId = { get(x: number): number | undefined };
/** (hastighed) spillets id → tal (i stedet for en Map): id'er < 2^18 i typede tabeller (databasens id'er går til ~133.000), resten i en Map */
const PID_N = 1 << 18;
class PidMap {
  private v = new Int32Array(PID_N); private e = new Uint8Array(PID_N); private big = new Map<number, number>();
  set(x: number, v: number): void { if (x >= 0 && x < PID_N) { this.v[x] = v; this.e[x] = 1; } else this.big.set(x, v); }
  get(x: number): number | undefined { return x >= 0 && x < PID_N ? (this.e[x] ? this.v[x] : undefined) : this.big.get(x); }
  has(x: number): boolean { return this.get(x) !== undefined; }
}
interface Ent { p: Player; id: number; cid: number; hasK: boolean; pref: number }
/** (hastighed) id → værdi i et array (personernes id'er er tætte, < ~200.000) i stedet for en Map */
class IdMap<T> {
  private a: (T | undefined)[] = [];
  size = 0;
  get(k: number): T | undefined { return this.a[k]; }
  set(k: number, v: T): void { if (this.a[k] === undefined) this.size++; this.a[k] = v; }
  delete(k: number): void { if (this.a[k] !== undefined) { this.a[k] = undefined; this.size--; } }
  keys(): number[] { const out: number[] = []; for (let i = 0; i < this.a.length; i++) if (this.a[i] !== undefined) out.push(i); return out; }
}
interface Base { P: SparseMem; fp: IdMap<Float64Array>; fs: IdMap<(string | undefined)[]>; fpPref: IdMap<unknown[]>; prefs: IdMap<number[]>; prefMax: number }
const BASES = new WeakMap<GameState, Base>();
const ENV = typeof process !== 'undefined' ? process.env ?? {} : {};
/** målinger: personer i alt, skrevet igen, hele genopbygninger */
export const SLMEM_STATS = { persons: 0, rewritten: 0, prefOnly: 0, builds: 0, stale: 0, deferredWritten: 0, copied: 0 };
/** målinger (ms): id'erne, den varige del, dagens personer/klubber, buildWantMem's felter */
export const SLMEM_T = { i: 0, p: 0, b: 0, c: 0 };
const tnow = () => (typeof performance !== 'undefined' ? performance.now() : 0);
/** kontrollen (scripts/cm-sl-stalecheck.ts): de udskudte id'er, der endnu ikke er skrevet i dag (`ids` sættes af kontrollen), og om refreshClub skriver */
export const SLMEM_DEFER: { ids: Set<number> | null; inRefresh: boolean } = { ids: null, inRefresh: false };
/** fejlsøgning (CM_SL_FPDEBUG=1): hvilket felt i fingeraftrykket der oftest ændres */
export const FPDBG: Record<string, number> | null = ENV.CM_SL_FPDEBUG === '1' ? {} : null;
/** dagens hukommelse → den varige under den (kontrollen: slMemPages) */
const UNDER = new WeakMap<SparseMem, SparseMem>();
/** alle sider, som dagens hukommelse ser dem (dens egne, ellers den varige hukommelses) */
export function slMemPages(m: SparseMem): Map<number, Uint8Array> {
  const out = new Map(UNDER.get(m)?.pageList() ?? []);
  for (const [k, v] of m.pageList()) out.set(k, v);
  return out;
}
/** glem den varige hukommelse (fx efter en kontrol) */
export function resetSlBase(g: GameState): void { BASES.delete(g); }

let FP = new Float64Array(256);
const recAdr = (id: number) => PREC0 + 0x50 * (id % 0x200000);
const natA = (n: number | undefined, nNat: number) => (n === undefined || n < 0 || n >= nNat ? 0 : NAT0 + 0x200 * n);

/** fingeraftrykket for én post (alt, writeRec/writeWant læser, undtagen præferenceposten): tallene i `o` fra `at` (giver den nye længde),
 *  datoerne (strenge) i `ss` fra `si` */
function fpInto(o: Float64Array, at: number, ss: (string | undefined)[], si: number, e: Ent, date: string, dy: number, dmd: number): number {
  const p = e.p, ct = p.contract, rp = p.cmRepMem ?? p.cmRep, cc = p.cmContract, A = p.attrs;
  ss[si] = p.dob; ss[si + 1] = p.cmJoined; ss[si + 2] = p.joined; ss[si + 3] = ct?.expires;
  o[at++] = e.id; o[at++] = e.cid; o[at++] = e.hasK ? 1 : 0;
  o[at++] = ageFast(p.dob, dy, dmd, date); o[at++] = num(p.nation); o[at++] = num(p.caps);
  o[at++] = num(A[A_AMB]); o[at++] = num(A[A_DET]); o[at++] = num(A[A_LOY]); o[at++] = num(A[A_PRE]); o[at++] = num(A[A_PRO]);
  o[at++] = p.ca; o[at++] = p.pa;
  if (rp) { o[at++] = 1; o[at++] = rp[0]; o[at++] = rp[1]; o[at++] = rp[2]; } else { o[at++] = 0; o[at++] = p.rep; }
  for (let i = 0; i < 7; i++) o[at++] = num(p.pos[i]);
  o[at++] = Math.round((p.value ?? 0) * GBP); o[at++] = num(p.cmNation2);
  o[at++] = recOf(p).ver;
  if (ct) {
    o[at++] = 1; o[at++] = ct.wage; o[at++] = ct.partTime ? 1 : 0; o[at++] = num(ct.cmClauseFee);
    const b = ct.cmBonusGbp; if (b) { o[at++] = 3; o[at++] = num(b[0]); o[at++] = num(b[1]); o[at++] = num(b[2]); } else o[at++] = -1;
    const cl = ct.cmClauses; if (cl) { o[at++] = cl.length; for (let i = 0; i < cl.length; i++) o[at++] = num(cl[i]); } else o[at++] = -1;
  } else o[at++] = 0;
  if (cc) { o[at++] = 1; o[at++] = num(cc.b45); o[at++] = num(cc.b4f); o[at++] = num(cc.b3d); o[at++] = num(cc.b3e); o[at++] = num(cc.b3f); o[at++] = num(cc.b44); o[at++] = num(cc.b4e); } else o[at++] = 0;
  return at;
}
/** fingeraftrykket for præferenceposten (nummeret, Player.cmRel og de personposter, den peger på) */
function fpPref(o: unknown[], at: number, e: Ent, staffOfId: StaffOfId): number {
  o[at++] = e.pref;
  const rel = e.pref >= 0 ? e.p.cmRel! : null;
  if (rel) { o[at++] = rel.length; for (let i = 0; i < rel.length; i++) { o[at++] = rel[i]; if (i >= 6 && rel[i]) o[at++] = staffOfId.get(rel[i]); } }
  return at;
}

/** én spillers poster (buildWageMem playerRec + contract, buildWantMem's personløkke) i `m` – i originalens rækkefølge */
function writeRec(m: SparseMem, e: Ent, date: string, nNat: number): void {
  const p = e.p, id = e.id, cid = e.cid;
  const st = STAFF0 + 0x6e * id, pr = recAdr(id);
  m.w32(st, id); m.w32(ROWS0 + 79 * id, -1); m.w32(ROWS0 + 79 * id + 4, -1);
  m.w8(st + 0x18, ageOn(p.dob, date));
  m.w32(st + 0x1a, natA(p.nation, nNat));
  m.w8(st + 0x22, Math.min(255, p.caps ?? 0));
  m.w32(st + 0x39, cid ? CLUB0 + 0x245 * cid : 0);
  m.w8(st + 0x3d, 0xb);
  const j = p.cmJoined ?? p.joined;
  if (j) { m.w16(st + 0x3e, isoD(j)); m.w16(st + 0x40, isoY(j)); }
  m.w8(st + 0x57, attrI(p, A_AMB)); m.w8(st + 0x58, attrI(p, A_DET)); m.w8(st + 0x59, attrI(p, A_LOY)); m.w8(st + 0x5a, attrI(p, A_PRE));
  m.w32(st + 0x61, pr);
  const rep = p.cmRepMem ?? p.cmRep;
  m.w16(pr + 5, p.ca); m.w16(pr + 7, p.pa);
  if (rep) { m.w16(pr + 9, Math.round(rep[0] * 50)); m.w16(pr + 0xb, Math.round(rep[1] * 50)); m.w16(pr + 0xd, Math.round(rep[2] * 50)); }
  else { const v = Math.round(p.rep * 2 * 50); m.w16(pr + 9, v); m.w16(pr + 0xb, v); m.w16(pr + 0xd, v); }
  for (let i = 0; i < 7; i++) m.w8(pr + 0xf + i, p.pos[i] ?? 1);
  m.w32(st + 0x52, Math.round((p.value ?? 0) * GBP));
  if (e.hasK) {
    const k = K0 + 80 * id;
    m.w32(ROWS0 + 79 * id, id); m.w32(ROWS0 + 79 * id + 4, -1);
    m.w32(k + 4, cid); m.w32(k + 0xc, Math.round(p.contract!.wage * GBP));
    m.w8(k + 0x35, p.contract?.partTime ? 0x80 : 0); m.w8(k + 0x45, p.cmContract?.b45 ?? 0); m.w8(k + 0x4f, p.cmContract?.b4f ?? 0);
  }
}
function writeWant(m: SparseMem, e: Ent, staffOfId: StaffOfId, nNat: number): void {
  const p = e.p, id = e.id, st = STAFF0 + 0x6e * id;
  if (p.dob) { const y = isoY(p.dob); m.w16(st + 0x10, isoD(p.dob)); m.w16(st + 0x12, y); m.w32(st + 0x14, leap(y)); }
  if (p.cmNation2 !== undefined && p.cmNation2 >= 0) m.w32(st + 0x1e, natA(p.cmNation2, nNat));
  const ct = p.contract;
  if (ct?.expires) { const y = isoY(ct.expires); m.w16(st + 0x46, isoD(ct.expires)); m.w16(st + 0x48, y); m.w32(st + 0x4a, leap(y)); }
  m.w8(st + 0x5b, attrI(p, A_PRO));
  writePref(m, e, staffOfId);
  const rec = recOf(p).rec, pr = recAdr(id);
  const pg = m.page(pr >>> 12)!, po = pr & 0xfff;
  if (po + 0x46 <= 0x1000) { pg[po + 4] = rec[4]; for (let o = 0x16; o < 0x46; o++) pg[po + o] = rec[o]; }
  else { m.w8(pr + 4, rec[4]); for (let o = 0x16; o < 0x46; o++) m.w8(pr + o, rec[o]); }
  if (e.hasK && ct) {
    const k = K0 + 80 * id;
    const b = ct.cmBonusGbp ?? [-1, -1, -1];
    for (let i = 0; i < 3; i++) m.w32(k + 0x10 + 4 * i, b[i]);
    const cl = ct.cmClauses ?? [0, 0, 0, 0, 0];
    for (let i = 0; i < cl.length; i++) m.w8(k + 0x1c + i, cl[i]);
    m.w32(k + 0x21, Math.round((ct.cmClauseFee ?? 0) * GBP));
    const j = p.joined ?? p.cmJoined;
    if (j) { const y = isoY(j); m.w16(k + 0x25, isoD(j)); m.w16(k + 0x27, y); m.w32(k + 0x29, leap(y)); }
    const y = isoY(ct.expires); m.w16(k + 0x2d, isoD(ct.expires)); m.w16(k + 0x2f, y); m.w32(k + 0x31, leap(y));
    m.w8(k + 0x35, 2 | (ct.partTime ? 0x80 : 0));
    const cc = p.cmContract;
    if (cc) { m.w8(k + 0x3d, cc.b3d); m.w8(k + 0x3e, cc.b3e); m.w8(k + 0x3f, cc.b3f); m.w8(k + 0x44, cc.b44); m.w8(k + 0x4e, cc.b4e ?? 0); }
    m.w32(k + 0x4a, -1);
  }
}
/** præferenceposten (PREF0 + 0x40 · nummer) og personpostens +0x65 */
function writePref(m: SparseMem, e: Ent, staffOfId: StaffOfId): void {
  if (e.pref < 0) return;
  const rel = e.p.cmRel!, pr = PREF0 + 0x40 * e.pref;
  for (let k = 0; k < rel.length; k++) {
    const x = rel[k];
    if (!x) continue;
    m.w32(pr + 4 + 4 * k, k < 6 ? (CLUB0 + 0x245 * x) >>> 0 : staffOfId.get(x) ?? (NOBODY + x) >>> 0);
  }
  m.w32(STAFF0 + 0x6e * e.id + 0x65, pr);
}
function zeroRange(m: SparseMem, a: number, n: number): void {
  for (let i = 0; i < n; ) {
    const pg = m.page((a + i) >>> 12, false), o = (a + i) & 0xfff, k = Math.min(n - i, 0x1000 - o);
    if (pg) pg.fill(0, o, o + k);
    i += k;
  }
}
/** et ids poster nulstilles (personposten, rækken, spillerposten, kontrakten) */
function zeroId(m: SparseMem, id: number): void {
  zeroRange(m, STAFF0 + 0x6e * id, 0x6e); zeroRange(m, ROWS0 + 79 * id, 8); zeroRange(m, recAdr(id), 0x46); zeroRange(m, K0 + 80 * id, 80);
}

/** Som buildWantMem(g, clubs, { full: true, call, useLog }) – samme hukommelse og samme kald */
export function buildSlWantMem(g: GameState, clubs: Iterable<number>, opts: { call?: (adr: number, a: number[]) => number | undefined; useLog?: (adr: number) => boolean;
  /** (hastighed) spillere, hvis poster ingen læser, før deres klubs trupplan eller bud kører (cmShortlistGame.ts staleOk): beholder gårsdagens
   *  poster (når id, klub og kontrakt er de samme), indtil `refreshClub(klub)` skriver dem (WantMem.refreshClub) */
  stale?: (p: Player, cid: number) => boolean }): WantMem & { refreshClub?: (cid: number, pids?: Set<number>) => number[]; deferredPids?: { has(pid: number): boolean }; pidStaff?: (pid: number) => number | undefined } {
  let tq = tnow();
  const incr = ENV.CM_SL_INCR !== '0';
  let B = incr ? BASES.get(g) : undefined;
  if (!B) { B = { P: new SparseMem(), fp: new IdMap(), fs: new IdMap(), fpPref: new IdMap(), prefs: new IdMap(), prefMax: 0 }; if (incr) BASES.set(g, B); SLMEM_STATS.builds++; }
  const P = B.P;
  const date = g.date;
  const dYear = Number(date.slice(0, 4)), dMd = Number(date.slice(5, 7)) * 100 + Number(date.slice(8, 10));
  const nNat = g.nations.length;
  const clubIds = [...new Set(clubs)].filter((id) => g.clubs[id]);
  const sc = scanOf(g);
  // ---------------------------------------------------------------- id'erne (som buildWageMem: truppernes spillere, formanden, staben pr. klub; de klubløse; menneskets manager)
  const memId = new Map<Player, number>();
  let next = sc.maxId + 1;
  const pid = (p: Player) => { if (!p.regen && p.id < 1_000_000) return p.id; let v = memId.get(p); if (v === undefined) { v = next++; memId.set(p, v); } return v; };
  const ents: Ent[] = [];
  const squads = new Map<number, number[]>(), chairs = new Map<number, number>(), staffIds = new Map<number, [Staff, number][]>();
  for (const cid of clubIds) {
    // (squad(cid) uden udlejede, så de udlejede fra klubben – uden de mellemliggende lister)
    const sts: number[] = [];
    const add = (p: Player) => {
      if (sts.length >= 50 || p.virtual) return;
      const id = pid(p);
      sts.push(STAFF0 + 0x6e * id);
      ents.push({ p, id, cid, hasK: !!p.contract, pref: -1 });
    };
    for (const x of squadIds(cid)) { const p = g.players[x]; if (p && p.club === cid && !p.loan) add(p); }
    for (const p of sc.loanedOut.get(cid) ?? []) add(p);
    squads.set(cid, sts);
    if (g.cmFin?.[cid]?.chair) chairs.set(cid, next++);
    const ss: [Staff, number][] = [];
    for (const s of sc.staffOf.get(cid) ?? []) ss.push([s, next++]);
    staffIds.set(cid, ss);
  }
  for (const p of Object.values(g.players)) {
    if (p.club || p.virtual || p.loan) continue;
    ents.push({ p, id: pid(p), cid: 0, hasK: false, pref: -1 });
  }
  const count = next + 16;
  let prefN = 0;
  for (const e of ents) { const rel = e.p.cmRel; if (rel && rel.some((x) => x)) e.pref = prefN++; }
  const players: [Player, number][] = ents.map((e) => [e.p, STAFF0 + 0x6e * e.id]);
  // spillets id → personposten (alle spillere; de genererede i genPid); staffOfId: kun de ikke-regenererede med id < 1.000.000 (præferenceposterne)
  const byPid = new PidMap(), genPid = new Map<number, number>();
  for (const [p, st] of players) byPid.set(p.id, st);
  const staffOfId = { get: (x: number) => { if (x >= 1_000_000) return undefined; const st = byPid.get(x); return st === undefined || g.players[x]?.regen ? undefined : st; } };
  SLMEM_T.i += tnow() - tq; tq = tnow();
  // ---------------------------------------------------------------- den varige del: de ændrede spillere skrives igen
  // personerne efter id (i rækkefølgen, de først ses – som en Map): én post pr. id i `one`, flere i `multi` (sjældent)
  const ids: number[] = [], one: (Ent | undefined)[] = new Array(count).fill(undefined), multi = new Map<number, Ent[]>();
  for (const e of ents) {
    const o = one[e.id];
    if (!o) { one[e.id] = e; ids.push(e.id); }
    else { const l = multi.get(e.id); if (l) l.push(e); else multi.set(e.id, [o, e]); }
  }
  const ONE: Ent[] = [ents[0]];
  const scr2: unknown[] = [], strs: (string | undefined)[] = [];
  const changed: [number, Ent[]][] = [], prefOnly: Ent[] = [];
  const same = (old: unknown[] | undefined, a: unknown[], n: number) => {
    if (!old || old.length !== n) return false;
    for (let i = 0; i < n; i++) if (!Object.is(old[i], a[i])) { if (FPDBG) FPDBG['p' + i] = (FPDBG['p' + i] ?? 0) + 1; return false; }
    return true;
  };
  const sameNum = (old: Float64Array | undefined, a: Float64Array, n: number) => {
    if (!old || old.length !== n) return false;
    for (let i = 0; i < n; i++) if (old[i] !== a[i]) { if (FPDBG) FPDBG[i] = (FPDBG[i] ?? 0) + 1; return false; }
    return true;
  };
  const sameStr = (old: (string | undefined)[] | undefined, a: (string | undefined)[], n: number) => {
    if (!old || old.length !== n) return false;
    for (let i = 0; i < n; i++) if (old[i] !== a[i]) { if (FPDBG) FPDBG['s' + i] = (FPDBG['s' + i] ?? 0) + 1; return false; }
    return true;
  };
  const zeroPrefs = (id: number) => { for (const k of B.prefs.get(id) ?? []) zeroRange(P, PREF0 + 0x40 * k, 0x40); };
  // (to trin: først nulstilles alle gamle poster – præferenceposternes numre kan skifte mellem spillere – så skrives de ændrede)
  const stale = opts.stale;
  const deferred = new Map<number, Ent[]>(), deferredPids = new PidMap();
  SLMEM_DEFER.ids?.clear();
  for (const id of ids) {
    let es = multi.get(id);
    if (!es) { ONE[0] = one[id]!; es = ONE; }
    let n = 0, n2 = 0, ns = 0;
    const old = B.fp.get(id), oldP = B.fpPref.get(id);
    for (const e of es) n2 = fpPref(scr2, n2, e, staffOfId);
    let sameCore: boolean;
    const e0 = es[0];
    if (stale && old && es.length === 1 && old[0] === e0.id && old[1] === e0.cid && old[2] === (e0.hasK ? 1 : 0) && stale(e0.p, e0.cid)) {
      sameCore = true; SLMEM_STATS.stale++;
      const l = deferred.get(e0.cid); if (l) l.push(e0); else deferred.set(e0.cid, [e0]);
      deferredPids.set(e0.p.id, 1);
      SLMEM_DEFER.ids?.add(e0.id);
    }
    else {
      if (FP.length < 80 * es.length) FP = new Float64Array(160 * es.length);
      for (const e of es) { n = fpInto(FP, n, strs, ns, e, date, dYear, dMd); ns += 4; }
      sameCore = sameNum(old, FP, n) && sameStr(B.fs.get(id), strs, ns);
    }
    if (sameCore && same(oldP, scr2, n2)) continue;
    if (sameCore && es.length === 1) {
      // kun præferenceposten (nummeret skifter, når en spiller før ham får eller mister sin): posten og +0x65
      zeroPrefs(id); zeroRange(P, STAFF0 + 0x6e * id + 0x65, 4);
      prefOnly.push(es[0]);
    } else {
      if (old) { zeroId(P, id); zeroPrefs(id); }
      B.fp.set(id, FP.slice(0, n)); B.fs.set(id, strs.slice(0, ns));
      changed.push([id, es === ONE ? [es[0]] : es]);
    }
    B.fpPref.set(id, scr2.slice(0, n2));
    if (es.length === 1) { if (es[0].pref >= 0) B.prefs.set(id, [es[0].pref]); else B.prefs.delete(id); }
    else { const pr = es.filter((e) => e.pref >= 0).map((e) => e.pref); if (pr.length) B.prefs.set(id, pr); else B.prefs.delete(id); }
  }
  // id'er uden spiller i dag: nulstilles
  if (B.fp.size > ids.length) for (const id of B.fp.keys()) if (!(id >= 0 && id < count && one[id])) { zeroId(P, id); zeroPrefs(id); B.fp.delete(id); B.fs.delete(id); B.fpPref.delete(id); B.prefs.delete(id); }
  for (const [, es] of changed) {
    for (const e of es) if (e.pref >= 0) zeroRange(P, PREF0 + 0x40 * e.pref, 0x40);
    for (const e of es) writeRec(P, e, date, nNat);
    for (const e of es) writeWant(P, e, staffOfId, nNat);
  }
  for (const e of prefOnly) { if (e.pref >= 0) zeroRange(P, PREF0 + 0x40 * e.pref, 0x40); writePref(P, e, staffOfId); }
  SLMEM_STATS.prefOnly += prefOnly.length;
  SLMEM_STATS.rewritten += changed.length;
  B.prefMax = prefN;
  SLMEM_STATS.persons += ids.length;

  SLMEM_T.p += tnow() - tq; tq = tnow();
  // ---------------------------------------------------------------- dagens hukommelse: kopi af den varige ved første brug + resten
  const m = new SparseMem((pg, mem) => { const src = P.page(pg, false); if (src) { mem.page(pg, false)!.set(src); SLMEM_STATS.copied++; } }, ENV.CM_SL_READTHRU === '0' ? undefined : P);
  UNDER.set(m, P);
  const wc: CmCtx = { m, rand: () => { throw new Error('cmWageGame: rand'); }, call: (adr, ...a) => cmMemCall(wc, adr, ...a) };
  let maxClub = 0;
  for (const id of Object.keys(g.clubs)) if (+id > maxClub) maxClub = +id;
  m.w32(G.CLUBS, CLUB0); m.w32(G.STAFF, STAFF0); m.w32(0xae235c, maxClub + 1 + 2 * nNat); m.w32(0xae2350, nNat);
  m.w32(0xae2a38, PTRS); m.w32(PTRS, FIN0);
  m.w32(G.CM, PTRS + 8); m.w32(PTRS + 8, K0); m.w32(G.ROWS, ROWS0);
  m.w32(0xde1f54, TM0); m.w32(TM0 + 0x856, TM0 + 0x1000); m.w32(TM0 + 0x1000 + 0xdc, TM0 + 0x10000);
  const day = isoD(date), year = isoY(date);
  m.w16(G.TODAY, day); m.w16(G.TODAY + 2, year);
  m.w8(G.B_AE233C, 0);
  for (const a of OTHER_GLOBALS) m.w32(a, -1);
  for (let a = 0x9d0120; a <= 0x9d0524; a += 4) m.w32(a, -1);
  for (let a = 0xb63c9c; a <= 0xb63d00; a += 4) m.w32(a, -1);
  const byName = new Map(g.nations.map((n, i) => [n.name, i]));
  for (const [a, nm] of KEY_NATIONS) m.w32(a, byName.get(nm) ?? -1);
  writeKeyIds(m, g, byName);
  const natInit = new Uint8Array(nNat);
  const natAdr = (n: number | undefined) => {
    if (n === undefined || n < 0 || n >= nNat) return 0;
    const a = NAT0 + 0x200 * n;
    if (!natInit[n] && m.s32(a + 0xfc) !== 1) {
      m.w32(a + 0xfc, 1); m.w32(a, n);
      m.w8(a + 0x76, g.cmNation76?.[n] ?? 0); m.w8(a + 0x7e, g.cmNation7e?.[n] ?? 3); m.w8(a + 0x85, g.cmNation85?.[n] ?? 0);
      m.w8(a + 0x7f, NAT7F.get(g.nations[n].name) ?? 0);
    }
    natInit[n] = 1;
    return a;
  };
  const divs = new Map<number, number>();
  const divAdr = (id: number | undefined) => {
    if (id === undefined || id < 0) return 0;
    let a = divs.get(id);
    if (a === undefined) { a = DIV0 + 0x80 * divs.size; divs.set(id, a); m.w32(a, id); m.w16(a + 0x69, g.cmCompRep?.[id] ?? 0); }
    return a;
  };
  const clubAdr = (cid: number) => CLUB0 + 0x245 * cid;
  const finAdr = (cid: number) => FIN0 + 0x167 * cid;
  const staffAdr = (id: number) => STAFF0 + 0x6e * id;
  const noContract = (id: number) => { m.w32(ROWS0 + 79 * id, -1); m.w32(ROWS0 + 79 * id + 4, -1); };
  let contracts: Map<number, number> | null = null;
  const contractsOf = () => { if (!contracts) { contracts = new Map(); for (const e of ents) if (e.hasK) contracts.set(e.p.id, K0 + 80 * e.id); } return contracts; };
  const staffContract = (id: number, club: number, wage: number) => {
    const k = K0 + 80 * id;
    m.w32(ROWS0 + 79 * id, id); m.w32(ROWS0 + 79 * id + 4, -1);
    m.w32(k + 4, club); m.w32(k + 0xc, wage);
  };
  const npRec = (id: number, f: (np: number) => void) => { const np = PREC0 + 0x0c000000 + 0x30 * id; f(np); return np; };
  const humanMgr: number[] = [];
  const built = new Set<number>();
  const byRole: Record<string, [number, number]> = { assistant: [0xd3, 1], coach: [0x19f, 5], scout: [0x1b3, 7], physio: [0x1cf, 3] };
  for (const cid of clubIds) {
    const club = g.clubs[cid], a = clubAdr(cid);
    built.add(cid);
    m.w32(a, cid);
    m.w32(a + 0x53, natAdr(club.nation));
    const lm = /^CM(\d+)$/.exec(club.league ?? '');
    m.w32(a + 0x57, divAdr(lm ? +lm[1] : g.cmFinRaw?.[cid]?.[0]));
    const last = g.cmClubStat?.[cid]?.[2];
    m.w32(a + 0x5b, last !== undefined && last >= 0 ? divAdr(last) : 0);
    m.w8(a + 0x64, g.cmFin?.[cid]?.status ?? g.cmClubStat?.[cid]?.[0] ?? 1);
    m.w16(a + 0x80, clubRepMem(g, cid));
    m.w8(a + 0x82, g.cmFinRaw?.[cid]?.[1] ?? 0);
    m.w8(a + 0x244, 0);
    m.w16(TM0 + 0x10000 + 9 * cid + 5, g.cmTargetRep?.[cid] ?? 0);
    const sts = squads.get(cid)!;
    for (let i = 0; i < sts.length; i++) m.w32(a + 0xd7 + 4 * i, sts[i]);
    const ch = g.cmFin?.[cid]?.chair;
    if (ch) {
      const id = chairs.get(cid)!, st = staffAdr(id);
      m.w32(st, id); noContract(id); m.w8(st + 0x57, ch[2]); m.w8(st + 0x59, ch[3]); m.w8(st + 0x3d, 1);
      m.w32(st + 0x69, npRec(id, (np) => { m.w8(np + 0xf, ch[0]); m.w8(np + 0x20, ch[1]); }));
      m.w32(a + 0xbf, st);
    }
    if (isHumanClub(cid)) humanMgr.push(cid);
    const used: Record<string, number> = {};
    for (const [s, id] of staffIds.get(cid)!) {
      const st = staffAdr(id);
      m.w32(st, id); noContract(id); m.w32(st + 0x39, a);
      m.w8(st + 0x57, s.cmHid?.[1] ?? 10);
      m.w8(st + 0x3d, s.role === 'manager' ? 5 : s.role === 'assistant' ? 6 : s.role === 'coach' ? 8 : s.role === 'scout' ? 9 : 10);
      m.w32(st + 0x69, npRec(id, (np) => { m.w16(np + 0xa, s.cmRep?.[1] ?? (s.rep ?? 0) * 2); m.w16(np + 4, s.ca ?? (s.rep ?? 0) * 2); m.w16(np + 6, s.cmPa ?? s.ca ?? 0); s.cmNp?.slice(0, 21).forEach((v, k) => m.w8(np + 0x0e + k, v)); }));
      if (s.wage) staffContract(id, cid, Math.round(s.wage * GBP));
      if (s.role === 'manager' && !isHumanClub(cid)) m.w32(a + 0xcf, st);
      const r = byRole[s.role]; if (r && (used[s.role] ?? 0) < r[1]) m.w32(a + r[0] + 4 * (used[s.role] = (used[s.role] ?? 0) + 1) - 4, st);
    }
    const f = finAdr(cid), bal = Math.round(club.balance * GBP);
    m.w32(f, bal >>> 0); m.w32(f + 4, Math.floor(bal / 4294967296)); m.w32(f + 8, cid);
    const r = g.cmFin?.[cid];
    m.w32(f + 0xc, r?.wb ?? 0); m.w32(f + 0x10, r?.top ?? 0);
  }
  // (spillernes landes poster – playerRec's natAdr)
  for (const e of ents) natAdr(e.p.nation);
  m.w32(G.STAFF_COUNT, count);
  for (const cid of humanMgr) { const st = staffAdr(count - 1); m.w32(st, count - 1); noContract(count - 1); m.w32(clubAdr(cid) + 0xcf, st); }
  for (const cid of clubIds) { const pr = g.clubs[cid].cmPrefs; if (pr) for (let k = 0; k < 3; k++) m.w32(clubAdr(cid) + 0x9b + 4 * k, byPid.get(pr[k]) ?? 0); }
  for (const cid of clubIds) { const f = finAdr(cid); m.w32(f + 0x14, getMaxWage_5968d0(wc, f, 0, -1)); }
  let gen = count;
  const W: WageMem = {
    c: wc,
    staffOf: (p) => byPid.get(p.id) ?? genPid.get(p.id) ?? 0,
    addGenerated: (p, club) => { const id = gen++; const st = staffAdr(id); writeRec(m, { p, id, cid: club, hasK: false, pref: -1 }, date, nNat); natAdr(p.nation); genPid.set(p.id, st); return st; },
    clubOf: (cid) => (built.has(cid) ? clubAdr(cid) : 0),
    finOf: (cid) => (built.has(cid) ? finAdr(cid) : 0),
    players,
    staffAdr,
    natOf: natAdr,
    divOf: divAdr,
    divIds: () => [...divs],
    contractOf: (p) => contractsOf().get(p.id) ?? 0,
  };

  SLMEM_T.b += tnow() - tq; tq = tnow();
  // ---------------------------------------------------------------- buildWantMem's felter (uden personerne)
  m.w8(0xa83608, 10);
  [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334].forEach((d, i) => { m.w16(0x9b8448 + 2 * i, d); m.w16(0x9b8460 + 2 * i, d + (i >= 2 ? 1 : 0)); });
  const contOf = (name: string | undefined) => {
    if (!name) return 0;
    if (OCEANIA.has(name)) return CONT0 + 0x100 * 4;
    const r = regionOf(name);
    return r === 'europe' ? CONT0 : r === 'northAmerica' ? CONT0 + 0x100 : r === 'southAmerica' ? CONT0 + 0x200 : r === 'asia' ? CONT0 + 0x300 : CONT0 + 0x500;
  };
  [2, 3, 5, 1, 4, 0].forEach((id, k) => m.w32(CONT0 + 0x100 * k, id));
  const seasonYear = day >= 181 ? year : year - 1;
  const dy = seasonYear - 2001;
  SEASON_ROWS.forEach(([nm], r) => {
    const a = 0xb63d60 + 0x48 * r, bytes = SEASON_BYTES[r];
    for (let i = 0; i < bytes.length; i++) m.w8(a + 0x17 + i, bytes[i]);
    for (let o = 0x1e; o < 0x2a; o++) m.w8(a + o, 0);
    for (const o of [0x1b, 0x2c, 0x35, 0x3b, 0x44]) { const y = m.u16(a + o); if (y) m.w16(a + o, y + dy); }
    const n = nm ? byName.get(nm) : undefined;
    m.w32(a, n === undefined ? 0 : natAdr(n));
    if (n !== undefined) m.w8(natAdr(n) + 0x11c, 1);
    m.w32(a + 4, !nm && r >= 3 ? CONT0 + 0x100 * (r - 3) : 0);
  });
  const nat8e = new Map<number, number>();
  for (const cl of Object.values(g.clubs)) if (cl.vc && !nat8e.has(cl.nation)) nat8e.set(cl.nation, cl.vc[1]);
  const natDone = new Uint8Array(nNat);
  const nat = (n: number | undefined) => {
    const a = natAdr(n);
    if (a && !natDone[n!]) {
      natDone[n!] = 1;
      const nm = g.nations[n!]?.name;
      m.w32(a + 0x71, contOf(nm)); m.w8(a + 0x77, nationLanguage(nm)); m.w16(a + 0x8e, nat8e.get(n!) ?? 0);
    }
    return a;
  };
  for (const cid of clubIds) {
    const a = clubAdr(cid);
    nat(g.clubs[cid].nation);
    const cr = g.cmCrowd?.[cid];
    m.w32(a + 0x73, cr?.[0] ?? 0);
    if (cr) for (let k = 0; k < 3 && 6 + k < cr.length; k++) { const r = cr[6 + k]; m.w32(a + 0xb3 + 4 * k, r >= 0 ? (CLUB0 + 0x245 * r) >>> 0 : 0); }
    m.w32(a + 0x1db, -1);
    const br = g.cmBoard?.rec[cid];
    if (br) { const ra = MMREC + 73 * cid; m.w16(ra + 6, br.w6); m.w16(ra + 8, br.w8); m.w16(ra + 0xa, br.wa); m.w16(ra + 0xc, br.wc); }
    m.w32(EURO0 + 6 * cid, -1);
    if (cr && cr[3] >= 0) {
      const sa = STAD0 + 0x80 * (cid % 0x8000);
      m.w32(a + 0x69, sa);
      if (cr[4] >= 0) { const ca = CITY0 + 0x40 * (cid % 0x8000); m.w32(sa + 0x38, ca); m.w8(ca + 0x33, g.cmCity33?.[cr[4]] ?? 0); }
    }
    const mg: Staff | undefined = g.staff[g.clubs[cid].manager ?? -1], ms = m.u32(a + 0xcf);
    if (mg && ms && m.u32(ms + 0x69)) {
      const np = m.u32(ms + 0x69);
      m.w16(np + 4, mg.ca ?? (mg.rep ?? 0) * 2); m.w16(np + 6, mg.cmPa ?? mg.ca ?? 0);
      mg.cmNp?.slice(0, 21).forEach((v, k) => m.w8(np + 0x0e + k, v));
    }
  }
  m.w32(0xdd7120, g.seed ?? 0);
  m.w32(0xae2d14, EURO0);
  if (g.cmBoard) { m.w32(0xb67a44, MMOBJ); m.w32(MMOBJ, MMREC); }
  m.w32(0xadadfc, COMP0);
  m.w32(VT + 0x98, 0x684790); m.w32(VT + 0x9c, 0x6847b0);
  const leagueClub = new Map<number, number>();
  for (const cid of clubIds) { const lm = /^CM(\d+)$/.exec(g.clubs[cid].league ?? ''); if (lm && !leagueClub.has(+lm[1])) leagueClub.set(+lm[1], cid); }
  for (const [id] of divs) {
    const cid = leagueClub.get(id);
    if (cid === undefined) continue;
    const L = leagueOf(g, cid);
    if (!L) continue;
    const o = COMP0 + 0x10000 + 0x100 * (id % 0x8000);
    m.w32(COMP0 + 4 * id, o); m.w32(o, VT); m.w8(o + 0x43, 2); m.w32(o + 8, STATS0 + 0x100 * (id % 0x8000));
    if (L.promotion) { m.w8(o + 0xbe, 1); m.w8(o + 0xd9, 2); }
    if (L.relegation) m.w8(o + 0xc1, 1);
  }
  // (personløkkens landeposter: nat(andet land), nat(landet))
  for (const e of ents) { const p = e.p; if (p.cmNation2 !== undefined && p.cmNation2 >= 0) nat(p.cmNation2); nat(p.nation); }
  let byStaffM: Map<number, Player> | null = null;
  const byStaffOf = () => { if (!byStaffM) { byStaffM = new Map(); for (const [p, st] of players) byStaffM.set(st, p); } return byStaffM; };
  let env: BoardEnv | null = null;
  let rand: (n: number) => number = () => { throw new Error('cmContractGame: rand uden frø'); };
  const envOf = () => (env ??= boardEnv(g));
  const base: CmCtx = { m, rand: (n) => rand(n), useLog: opts.useLog, call: (adr, ...a) => call(adr, a) };
  const caIdx = clubCaIdx(g);
  const call = (adr: number, a: number[]): number => {
    if (opts.call) { const v = opts.call(adr, a); if (v !== undefined) return v; }
    switch (adr) {
      case 0x849f00: {
        const withThis = a.length === 4, st = a[withThis ? 1 : 0] >>> 0, club = a[withThis ? 2 : 1] >>> 0, out = withThis ? a[3] >>> 0 : 0;
        const p = byStaffOf().get(st), cid = m.s32(club);
        if (p && m.u32(st + 0x39) !== club && g.clubs[cid]) { if (out) m.w32(out, 0xb); return newClubStatus(g, p, cid, caIdx); }
        return withThis ? slCall(gc, adr, a[0], ...a.slice(1)) : slCall(gc, adr, slmOf(m), ...a);
      }
      case 0x846920: case 0x844780: return slCall(gc, adr, slmOf(m), ...a);
      case 0x8cca10: return slCall(gc, adr, m.u32(0xde1f54), ...a);
      case 0x5a0590: return getClubFinance_5a0590(gc, a[a.length - 1]);
      case 0x4d0c60: return valueOf(g, byStaffOf().get(a[0] >>> 0), m.s32(a[1]));
      case 0x4b02e0: return leagueClash(envOf(), m.s32(a[0]), m.s32(a[1]));
      case 0x4a4850: {
        const e = envOf().entry(m.s32(a[a.length - 1]));
        if (!e) return 0;
        const r = ROW4A;
        m.w8(r + 4, e.played); m.w8(r + 0x72, e.pos); m.w8(r + 0x73, e.p73); m.w8(r + 0x74, e.p74); m.w8(r + 0x75, e.p75);
        return r;
      }
      case 0x8cf470: case 0x8cf0e0: case 0x8c61e0: case 0x549c90: case 0x62ed70:
      case 0x944cff: case 0x90d130: case 0x944c9f: case 0x5e8290: return 0;
    }
    return cmMemCall(gc, adr, ...a);
  };
  const gc = genCtx(base);
  /** de udskudte spillere i klubben: fingeraftrykket, og er det ændret, skrives posterne igen – i den varige hukommelse og i dagens (som den varige
   *  dels ændrede spillere ovenfor; præferenceposten er allerede skrevet). Giver personposterne for de skrevne. */
  const done = new Set<Ent>();
  /** klubbens udskudte spillere – eller kun dem med de givne spil-id'er (pids); giver personposterne for alle de behandlede */
  const refreshClub = (cid: number, pids?: Set<number>): number[] => {
    const l0 = deferred.get(cid);
    if (!l0) return [];
    const l = pids ? l0.filter((e) => pids.has(e.p.id) && !done.has(e)) : l0.filter((e) => !done.has(e));
    if (!pids) deferred.delete(cid);
    const out: number[] = [];
    SLMEM_DEFER.inRefresh = true;
    for (const e of l) {
      done.add(e);
      SLMEM_DEFER.ids?.delete(e.id);
      out.push(STAFF0 + 0x6e * e.id);
      const n = fpInto(FP, 0, strs, 0, e, date, dYear, dMd);
      if (sameNum(B.fp.get(e.id), FP, n) && sameStr(B.fs.get(e.id), strs, 4)) continue;
      B.fp.set(e.id, FP.slice(0, n)); B.fs.set(e.id, strs.slice(0, 4));
      for (const mm of [P, m]) { zeroId(mm, e.id); writeRec(mm, e, date, nNat); writeWant(mm, e, staffOfId, nNat); }
      SLMEM_STATS.deferredWritten++;
    }
    SLMEM_DEFER.inRefresh = false;
    return out;
  };
  SLMEM_T.c += tnow() - tq;
  return { W, c: gc, g, env: envOf, setRand: (f) => { rand = f; }, get byStaff() { return byStaffOf(); }, refreshClub, deferredPids,
    pidStaff: (pid: number) => byPid.get(pid) };
}
