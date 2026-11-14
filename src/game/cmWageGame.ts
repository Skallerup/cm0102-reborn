// Lønportene på spillets data (kun den originale database i ægte tilstand – cmActive): originalens poster bygges af spiltilstanden i en
// SparseMem, så de porterede funktioner kører uændret – STAFF_CONTRACT::calc_unset_default_wage 0x862720 og default_staff_contract 0x864550
// (cmWage.ts), Finance::get_max_wage 0x5968d0 og recalc_wages 0x598370 (cmMaxWage.ts), Shortlist_Manager 0x83a1b0's udfyldning (cmWageFill.ts).
//
// Posterne (adresser i den byggede hukommelse – felterne er originalens; *estimeret* hvor spillet ikke har feltet):
//   person (0x6e): +0 id, +0x18 alder, +0x1a landet, +0x22 landskampe (byte), +0x39 klubben, +0x3d job 0xb, +0x57 Ambition, +0x58 Determination,
//      +0x59 Loyalty, +0x5a Pressure, +0x61 spillerposten. Id'et = databasens id (så id/[0xae2364] følger databasens rækkefølge som i originalen,
//      *estimeret* – originalens hukommelse har sine egne id'er), legender bagefter, staben og formændene efter dem, menneskets manager som den
//      sidste (id ≥ [0xae2364] − 16 = menneske, 0x600a50); genererede spillere (regens) får id ≥ [0xae2364] (ingen kontrakt via 0x4cf5a0).
//   spillerpost: +5 CA, +7 PA, +9/+0xb/+0xd omdømmet (Player.cmRepMem · 50), +0xf..+0x15 positionerne.
//   klub (0x245 = club.dat-posten): +0 id, +0x53 landet, +0x57 divisionen og +0x5b sidste sæsons (club_comp +0x69 = turneringens omdømme),
//      +0x64 status, +0x80 omdømme, +0x82 PLC, +0x9b/+0x9f/+0xa3 klubbens yndlingspersoner, +0xbf formanden, +0xcf manageren, +0xd7 truppen (50),
//      +0x19f/+0x1b3/+0x1cf staben (5/7/3), +0x244 = 0 (ingen B-hold-kæde).
//   land: +0 id (nationsindekset), +0x76 (nation.dat), +0x7e, +0x85; nøglelandenes id-globaler [0x9cf218 …] efter navnet.
//   finansposten [[0xae2a38]] + 0x167·klub: +0 saldoen (£, int64), +8 klub-id, +0xc/+0x10/+0x14 af 0x598370 (kørt to gange: den første med
//      +0x14 = 0 – originalens +0x14 er den forrige uges).
//   kontrakten (80 bytes, indeks = personens id): +4 klubbens id, +0xc ugelønnen (£, −1 = ikke sat), +0x35 bit 7 deltid, +0x45/+0x4f
//      (Player.cmContract: trupstatus i høj nibble).
//   Shortlist_Manager [0xde1f54] → [+0x856] → [+0xdc] + 9·klub + 5 = klubbens mål-omdømme (GameState.cmTargetRep, 0x83bf40).
// *Estimeret*: ingen relationer (+0x65 – formandens yndlingsspillere), lejede spillere regnes i moderklubben (spillets lejemodel), menneskets
// manager uden ikke-spillerpost, ferietjekket 0x5fe040 i 0x600a50 ikke porteret.
import type { Club, GameState, Player } from './types';
import { type CmCtx, G, SparseMem } from './cmMem';
import { getMaxWage_5968d0, recalcWages_598370 } from './cmMaxWage';
import { clubInSeason_669bd0, linkedClub_540a50 } from './cmClubLinks';
import { defaultStaffContract_864550, defaultWageUnset_862720 } from './cmWage';
import { fillUnsetWage_83a1b0 } from './cmWageFill';
import { cmActive, clubRepMem } from './cmPlayerData';
import { ageOn } from './dates';
import { ATTRS } from './attributes';
import { squad } from './state';
import { isHumanClub } from './humans';
import { updateWageBill } from './cmFinance';

/** £ → € som newgame.ts */
const GBP = 0.86;

/** Menneskets klub 0x600a50(klub, a, …): klubbens manager +0xcf er en af de 16 sidste personer (id ≥ [0xae2364] − 16). Ferietjekket 0x5fe040
 *  (a = 0) er ikke porteret – spilstarten har ingen ferie. */
export function humanClub_600a50(c: CmCtx, club: number): boolean {
  const m = c.m;
  if (!club) return false;
  const mg = m.u32(club + 0xcf);
  return !!mg && m.s32(mg) >= m.s32(G.STAFF_COUNT) - 16;
}

/** c.call for lønportene */
export function cmMemCall(c: CmCtx, adr: number, ...a: number[]): number {
  switch (adr) {
    case 0x5968d0: return getMaxWage_5968d0(c, a[0], a[1], a[2]);
    case 0x540a50: return linkedClub_540a50(c.m, a[0], a[1], a[2]);
    case 0x669bd0: return clubInSeason_669bd0(c, a[0], a[1], a[2]);
    case 0x600a50: return humanClub_600a50(c, a[0]) ? 1 : 0;
  }
  throw new Error(`cmWageGame: kald 0x${adr.toString(16)} er ikke porteret`);
}

/** nøglelandenes id-globaler (adresse → nation.dat-navnet), de lønportene læser */
const KEY_NATIONS: [number, string][] = [
  [0x9cf218, 'Argentina'], [0x9cf224, 'Australia'], [0x9cf244, 'Belgium'], [0x9cf260, 'Brazil'], [0x9cf2ac, 'Croatia'], [0x9cf2c0, 'Denmark'],
  [0x9cf2dc, 'Republic of Ireland'], [0x9cf2e4, 'England'], [0x9cf2fc, 'Finland'], [0x9cf300, 'France'], [0x9cf314, 'Germany'], [0x9cf338, 'Holland'],
  [0x9cf360, 'Italy'], [0x9cf36c, 'Japan'], [0x9cf3e4, 'Northern Ireland'], [0x9cf408, 'Norway'], [0x9cf430, 'Poland'], [0x9cf434, 'Portugal'],
  [0x9cf45c, 'Scotland'], [0x9cf484, 'South Korea'], [0x9cf488, 'Spain'], [0x9cf4a8, 'Sweden'], [0x9cf4f8, 'United States'], [0x9cf510, 'Wales'],
];
/** de øvrige globaler, portene sammenligner med (0x9cf594 er et turnerings-id, ikke et land) – −1 = ingen */
const OTHER_GLOBALS = [0x9cf594, 0x9cf2e8, 0x9cf2ec];

const STAFF0 = 0x10000000, PREC0 = 0x20000000, CLUB0 = 0x30000000, NAT0 = 0x38000000, DIV0 = 0x3c000000, FIN0 = 0x40000000, K0 = 0x50000000,
  ROWS0 = 0x58000000, TM0 = 0x5f000000, PTRS = 0x5e000000;

const attr = (p: Player, k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10);
const isoDay = (iso: string) => {
  const y = +iso.slice(0, 4);
  return [Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000), y] as const;
};

export interface WageMem {
  c: CmCtx;
  /** personens post (0 = ikke bygget) */
  staffOf(p: Player): number;
  /** en genereret spiller (regen) i klubben: posten med id ≥ [0xae2364] */
  addGenerated(p: Player, club: number): number;
  clubOf(cid: number): number;
  finOf(cid: number): number;
  /** (ønskekontrakten, cmContractGame.ts) de byggede spillere og deres poster, personpostens adresse for et hukommelses-id, landet og
   *  divisionen (posterne bygges ved første brug) og kontraktposten for en byggede spiller (0 = ingen) */
  players: [Player, number][];
  staffAdr(id: number): number;
  natOf(n: number | undefined): number;
  divOf(id: number | undefined): number;
  divIds(): [number, number][];
  contractOf(p: Player): number;
}

/** spiltilstandens gennemløb, som alle opbygninger samme dag deler (største database-id, udlejede pr. moderklub, staben pr. klub) – genbruges,
 *  så længe dato, antal spillere og antal stab er de samme */
const SCAN = new WeakMap<GameState, { key: string; maxId: number; loanedOut: Map<number, Player[]>; staffOf: Map<number, import('./types').Staff[]> }>();
function scanOf(g: GameState) {
  // samme dag og ingen nye personer (lejeaftaler og stabsskift samme dag ses først næste dag – *estimeret*, kun for hastigheden)
  const key = `${g.date}|${g.nextId?.player}|${g.nextId?.staff}`;
  const c = SCAN.get(g);
  if (c && c.key === key) return c;
  const ps = Object.values(g.players), ss = Object.values(g.staff);
  let maxId = 0;
  const loanedOut = new Map<number, Player[]>(), staffOf = new Map<number, import('./types').Staff[]>();
  for (const p of ps) {
    if (!p.regen && !p.virtual && p.id < 1_000_000 && p.id > maxId) maxId = p.id;
    if (p.loan?.from !== undefined) { const l = loanedOut.get(p.loan.from) ?? []; l.push(p); loanedOut.set(p.loan.from, l); }
  }
  for (const s of ss) if (s.club) { const l = staffOf.get(s.club) ?? []; l.push(s); staffOf.set(s.club, l); }
  const r = { key, maxId, loanedOut, staffOf };
  SCAN.set(g, r);
  return r;
}

/** Bygger originalens poster for klubberne `clubs` (alle deres spillere og stab). `unset`: spillere, hvis løn +0xc = −1 (0x85e960 forkastede
 *  databasens løn). `recalc` = 0x598370 for klubberne (ellers +0xc/+0x10 fra cmFinance og +0x14 = 0x5968d0(fin, 0, −1)). */
/** `full` (ønskelisterne, cmShortlistGame.ts): også de klubløse spillere (+0x39 = 0), værdien staff +0x52 (£), staben på originalens pladser
 *  (+0xd3 assistenten, +0x19f trænerne, +0x1b3 spejderne, +0x1cf fysioterapeuterne) og ikke-spillerpostens +4 (CA) */
export function buildWageMem(g: GameState, clubs: Iterable<number>, unset: Set<number> = new Set(), recalc = true, full = false): WageMem {
  const m = new SparseMem();
  const c: CmCtx = { m, rand: () => { throw new Error('cmWageGame: rand'); }, call: (adr, ...a) => cmMemCall(c, adr, ...a) };
  const clubIds = [...new Set(clubs)].filter((id) => g.clubs[id]);
  // id'erne: databasens spillere efter deres id, legender (id ≥ 1e6) bagefter, så stab/formænd, menneskets manager sidst
  const sc = scanOf(g);
  const maxId = sc.maxId;
  const memId = new Map<Player, number>();
  let next = maxId + 1;
  const pid = (p: Player) => { let v = memId.get(p); if (v === undefined) { v = !p.regen && p.id < 1_000_000 ? p.id : next++; memId.set(p, v); } return v; };
  // skrives først, når alle id'er er kendt – antallet sættes til sidst (så ingen database-person er ≥ [0xae2364])
  const nNat = g.nations.length;
  let maxClub = 0;
  for (const id of Object.keys(g.clubs)) if (+id > maxClub) maxClub = +id;
  m.w32(G.CLUBS, CLUB0); m.w32(G.STAFF, STAFF0); m.w32(0xae235c, maxClub + 1 + 2 * nNat); m.w32(0xae2350, nNat);
  m.w32(0xae2a38, PTRS); m.w32(PTRS, FIN0);
  m.w32(G.CM, PTRS + 8); m.w32(PTRS + 8, K0); m.w32(G.ROWS, ROWS0);
  m.w32(0xde1f54, TM0); m.w32(TM0 + 0x856, TM0 + 0x1000); m.w32(TM0 + 0x1000 + 0xdc, TM0 + 0x10000);
  const [day, year] = isoDay(g.date);
  m.w16(G.TODAY, day); m.w16(G.TODAY + 2, year);
  m.w8(G.B_AE233C, 0);
  for (const a of OTHER_GLOBALS) m.w32(a, -1);
  // B-hold-parrene (0x540a50) og Spaniens 23 klubber (0x53d7f0): ingen (−1)
  for (let a = 0x9d0120; a <= 0x9d0524; a += 4) m.w32(a, -1);
  for (let a = 0xb63c9c; a <= 0xb63d00; a += 4) m.w32(a, -1);
  const byName = new Map(g.nations.map((n, i) => [n.name, i]));
  for (const [a, nm] of KEY_NATIONS) m.w32(a, byName.get(nm) ?? -1);
  const natAdr = (n: number | undefined) => {
    if (n === undefined || n < 0 || n >= nNat) return 0;
    const a = NAT0 + 0x200 * n;
    if (m.s32(a + 0xfc) !== 1) {
      m.w32(a + 0xfc, 1); m.w32(a, n);
      m.w8(a + 0x76, g.cmNation76?.[n] ?? 0); m.w8(a + 0x7e, g.cmNation7e?.[n] ?? 3); m.w8(a + 0x85, g.cmNation85?.[n] ?? 0);
    }
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
  /** rækken uden kontrakt (0x4cf5a0 → 0) */
  const noContract = (id: number) => { m.w32(ROWS0 + 79 * id, -1); m.w32(ROWS0 + 79 * id + 4, -1); };
  const contracts = new Map<number, number>();
  const contract = (id: number, club: number, wage: number, p?: Player) => {
    const k = K0 + 80 * id;
    m.w32(ROWS0 + 79 * id, id); m.w32(ROWS0 + 79 * id + 4, -1);
    m.w32(k + 4, club); m.w32(k + 0xc, wage);
    if (p) { m.w8(k + 0x35, p.contract?.partTime ? 0x80 : 0); m.w8(k + 0x45, p.cmContract?.b45 ?? 0); m.w8(k + 0x4f, p.cmContract?.b4f ?? 0); contracts.set(p.id, k); }
    return k;
  };
  const playerRec = (p: Player, id: number, club: number) => {
    const st = staffAdr(id), pr = PREC0 + 0x50 * (id % 0x200000);
    m.w32(st, id); noContract(id);
    m.w8(st + 0x18, ageOn(p.dob, g.date));
    m.w32(st + 0x1a, natAdr(p.nation));
    m.w8(st + 0x22, Math.min(255, p.caps ?? 0));
    m.w32(st + 0x39, club ? clubAdr(club) : 0);
    m.w8(st + 0x3d, 0xb);
    const j = p.cmJoined ?? p.joined;
    if (j) { const [d, y] = isoDay(j); m.w16(st + 0x3e, d); m.w16(st + 0x40, y); }
    m.w8(st + 0x57, attr(p, 'ambition')); m.w8(st + 0x58, attr(p, 'determination')); m.w8(st + 0x59, attr(p, 'loyalty')); m.w8(st + 0x5a, attr(p, 'pressure'));
    m.w32(st + 0x61, pr);
    const rep = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
    m.w16(pr + 5, p.ca); m.w16(pr + 7, p.pa);
    m.w16(pr + 9, Math.round(rep[0] * 50)); m.w16(pr + 0xb, Math.round(rep[1] * 50)); m.w16(pr + 0xd, Math.round(rep[2] * 50));
    for (let i = 0; i < 7; i++) m.w8(pr + 0xf + i, p.pos[i] ?? 1);
    if (full) m.w32(st + 0x52, Math.round((p.value ?? 0) * GBP));
    return st;
  };
  const npRec = (id: number, f: (np: number) => void) => { const np = PREC0 + 0x0c000000 + 0x30 * id; f(np); return np; };

  // udlejede spillere hører til moderklubben
  const loanedOut = sc.loanedOut;
  // klubberne
  const humanMgr: number[] = [];
  const built = new Set<number>();
  const players: [Player, number][] = [];
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
    // truppen +0xd7: spillerne i klubben (lejede spillere i moderklubben – spillets lejemodel, *estimeret*)
    const sq = squad(cid).filter((p) => !p.loan).concat(loanedOut.get(cid) ?? []);
    let i = 0;
    for (const p of sq) {
      if (i >= 50 || p.virtual) continue;
      const id = pid(p);
      const st = playerRec(p, id, cid);
      m.w32(a + 0xd7 + 4 * i++, st);
      if (p.contract) contract(id, cid, unset.has(p.id) ? -1 : Math.round(p.contract.wage * GBP), p);
      players.push([p, st]);
    }
    // formanden +0xbf (cmFinance: [np +0x0f, np +0x20, +0x57, +0x59])
    const ch = g.cmFin?.[cid]?.chair;
    if (ch) {
      const id = next++, st = staffAdr(id);
      m.w32(st, id); noContract(id); m.w8(st + 0x57, ch[2]); m.w8(st + 0x59, ch[3]); m.w8(st + 0x3d, 1);
      m.w32(st + 0x69, npRec(id, (np) => { m.w8(np + 0xf, ch[0]); m.w8(np + 0x20, ch[1]); }));
      m.w32(a + 0xbf, st);
    }
    // manageren +0xcf og staben (+0x19f/+0x1b3/+0x1cf – lønnen i 0x598370)
    if (isHumanClub(cid)) humanMgr.push(cid);
    let si = 0;
    const slots = [...Array(5).keys()].map((k) => 0x19f + 4 * k).concat([...Array(7).keys()].map((k) => 0x1b3 + 4 * k), [...Array(3).keys()].map((k) => 0x1cf + 4 * k));
    const byRole: Record<string, [number, number]> = { assistant: [0xd3, 1], coach: [0x19f, 5], scout: [0x1b3, 7], physio: [0x1cf, 3] };
    const used: Record<string, number> = {};
    for (const s of sc.staffOf.get(cid) ?? []) {
      const id = next++, st = staffAdr(id);
      m.w32(st, id); noContract(id); m.w32(st + 0x39, a);
      m.w8(st + 0x57, s.cmHid?.[1] ?? 10);
      m.w8(st + 0x3d, s.role === 'manager' ? 5 : s.role === 'assistant' ? 6 : s.role === 'coach' ? 8 : s.role === 'scout' ? 9 : 10);
      m.w32(st + 0x69, npRec(id, (np) => { m.w16(np + 0xa, s.cmRep?.[1] ?? (s.rep ?? 0) * 2); if (full) { m.w16(np + 4, s.ca ?? (s.rep ?? 0) * 2); m.w16(np + 6, s.cmPa ?? s.ca ?? 0); s.cmNp?.slice(0, 21).forEach((v, k) => m.w8(np + 0x0e + k, v)); } }));
      if (s.wage) contract(id, cid, Math.round(s.wage * GBP));
      if (s.role === 'manager' && !isHumanClub(cid)) m.w32(a + 0xcf, st);
      if (full) { const r = byRole[s.role]; if (r && (used[s.role] ?? 0) < r[1]) m.w32(a + r[0] + 4 * (used[s.role] = (used[s.role] ?? 0) + 1) - 4, st); }
      else if (s.wage && si < slots.length) m.w32(a + slots[si++], st);
    }
    // finansposten
    const f = finAdr(cid), bal = Math.round(club.balance * GBP);
    m.w32(f, bal >>> 0); m.w32(f + 4, Math.floor(bal / 4294967296)); m.w32(f + 8, cid);
    const r = g.cmFin?.[cid];
    m.w32(f + 0xc, r?.wb ?? 0); m.w32(f + 0x10, r?.top ?? 0);
  }
  // de klubløse spillere (full): posterne på deres id, uden klub og kontrakt
  if (full) for (const p of Object.values(g.players)) {
    if (p.club || p.virtual || p.loan) continue;
    const st = playerRec(p, pid(p), 0);
    players.push([p, st]);
  }
  // menneskets manager (de 16 sidste id'er) og antallet [0xae2364]
  const count = next + 16;
  m.w32(G.STAFF_COUNT, count);
  for (const cid of humanMgr) { const st = staffAdr(count - 1); m.w32(st, count - 1); noContract(count - 1); m.w32(clubAdr(cid) + 0xcf, st); }
  // klubbens yndlingspersoner +0x9b/+0x9f/+0xa3 (spillere i de byggede klubber)
  const byPid = new Map(players.map(([p, st]) => [p.id, st]));
  for (const cid of clubIds) { const pr = g.clubs[cid].cmPrefs; if (pr) for (let k = 0; k < 3; k++) m.w32(clubAdr(cid) + 0x9b + 4 * k, byPid.get(pr[k]) ?? 0); }
  // 0x598370 to gange (den første med +0x14 = 0), ellers kun +0x14
  for (const cid of clubIds) {
    const f = finAdr(cid);
    if (recalc) { m.w32(f + 0x14, 0); recalcWages_598370(c, f); recalcWages_598370(c, f); }
    else m.w32(f + 0x14, getMaxWage_5968d0(c, f, 0, -1));
  }
  let gen = count;
  return {
    c,
    staffOf: (p) => byPid.get(p.id) ?? 0,
    addGenerated: (p, club) => {
      const id = gen++;
      const st = playerRec(p, id, club);
      byPid.set(p.id, st);
      return st;
    },
    clubOf: (cid) => (built.has(cid) ? clubAdr(cid) : 0),
    finOf: (cid) => (built.has(cid) ? finAdr(cid) : 0),
    players,
    staffAdr,
    natOf: natAdr,
    divOf: divAdr,
    divIds: () => [...divs],
    contractOf: (p) => contracts.get(p.id) ?? 0,
  };
}

/** Spilstarten (newgame.ts, efter trupplanen cmSquadPlanStart): 0x83a1b0's udfyldning for spillerne i `unset` (0x85e960 gav +0xc = −1).
 *  Lønnen skrives i spillets kontrakt (€) og klubbernes lønsum regnes igen (cmFinance updateWageBill). */
export function cmWageFillNewGame(g: GameState, unset: Set<number>): { n: number } {
  if (!cmActive(g) || g.draft || !unset.size) return { n: 0 };
  const clubs = new Set<number>();
  for (const id of unset) { const p = g.players[id]; if (p?.contract) clubs.add(p.loan?.from ?? p.club); }
  const W = buildWageMem(g, clubs, unset);
  let n = 0;
  // originalens rækkefølge: personerne efter id
  const ps = [...unset].map((id) => g.players[id]).filter((p): p is Player => !!p?.contract).sort((a, b) => a.id - b.id);
  for (const p of ps) {
    const st = W.staffOf(p);
    if (!st) continue;
    const w = fillUnsetWage_83a1b0(W.c, st);
    if (w === null) continue;
    p.contract!.wage = w / GBP;
    n++;
  }
  for (const cid of clubs) { const c = g.clubs[cid], r = g.cmFin?.[cid]; if (c && r) updateWageBill(g, c, r); }
  return { n };
}

/** 0x85e960's standardløn til bonusserne (0x85eca3: 0x864550(staff, klub, 0, −1, 0xb, 0)) for spillerne i `ids` – £ pr. spiller-id */
export function cmStandardWages(g: GameState, ids: Player[], unset: Set<number>): Map<number, number> {
  const out = new Map<number, number>();
  if (!ids.length) return out;
  const W = buildWageMem(g, new Set(ids.map((p) => p.loan?.from ?? p.club)), unset);
  for (const p of ids) {
    const st = W.staffOf(p), club = W.clubOf(p.loan?.from ?? p.club);
    if (st && club) out.set(p.id, Math.trunc(defaultStaffContract_864550(W.c, st, club, 0, -1, 0xb, 0)));
  }
  return out;
}

/** player_regen_sign_for_club 0x7a6f10 → STAFF_CONTRACT::set_default_wage 0x8626e0: en genereret spiller, der kommer til en klub, får
 *  max(55, ftol(0x862720(staff, klub, 1, −1, 0xb, 0))) i ugeløn (£) */
export function cmRegenWage(g: GameState, p: Player, club: Club): number | null {
  if (!cmActive(g) || g.draft) return null;
  // spillets ugentlige lønsum (cmFinance: +0xc/+0x10) og lønloftet +0x14 = 0x5968d0(fin, 0, −1) – ikke 0x598370 igen
  const W = buildWageMem(g, [club.id], new Set(), false);
  const st = W.addGenerated(p, club.id);
  const w = Math.trunc(defaultWageUnset_862720(W.c, st, W.clubOf(club.id), 1, -1, 0xb, 0));
  return w < 0x37 ? 0x37 : w;
}
