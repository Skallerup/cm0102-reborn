// sub_6ddab0 (aiPrematch.ts) mod originalens hukommelse ved første tik (kampsporet ~/cm0102-engine/oracle/runs/trace4.txt, 80 kampe,
// database 3.9.60, frø 1). Forudindstillingen findes ud fra positionstabellen (P), spillerne fra R-linjerne, managerens egenskaber og
// klubbernes omdømme fra databasen (.orig-db/Original-3.9.60-Database): klubben findes ved at slå spillerposterne op (spillets id'er i
// hukommelsen er omnummererede). Managerens id i hukommelsen kendes ikke – den indgår kun som (id + spillerid) mod d, så resten k = id mod d
// vælges som den bedste (én fri parameter pr. hold, d ≤ 7). Spillet er startet med England: udenlandske klubber har ikke altid en manager i
// hukommelsen – dér prøves begge grene. Tacklingens 0x20 (b19/venskabskampens rand-slag, kan ikke genskabes) tages fra sporet, fordi blok F
// læser den. Fremadløbet (0xc00000) overskrives af den første sub_6c54a0 (tilstand 2–5 → 0x400000) og sammenlignes for sig.
// Uden sporet/databasen springes sammenligningen over. Kør med AIPRE_DEBUG=1 for detaljer pr. hold.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { aiPrematch, formationWord, oppositeIndex, recordAttr, shown, type PrematchInput, type PrematchManager, type PrematchPlayer } from '../src/game/engine/grid/aiPrematch';
import { PRESET_TACTICS } from '../src/game/engine/grid/presetTactics';
import { expandGrid, presetTable } from '../src/game/engine/grid/tacticTable';

const TRACE = `${homedir()}/cm0102-engine/oracle/runs/trace4.txt`;
const DB = resolve(__dirname, '../.orig-db/Original-3.9.60-Database');
const PCT = `${homedir()}/cm0102-engine/notes/pct-tables.json`;
const DEBUG = !!process.env.AIPRE_DEBUG;

// ------------------------------------------------------------------ altid: små enhedstests
describe('sub_6ddab0 – byggesten', () => {
  it('shown = sub_544380', () => {
    expect(shown(100)).toBe(13);                    // t = 15 → (22,5 + 15)/3 + 0,5 = 13
    expect(shown(-300)).toBe(1);                    // t = −5 → (2,5 − 5)/3 + 0,5 < 1
    expect(shown(-1000)).toBe(20);                  // sic: parablen vender (t = −40)
    expect(shown(1000)).toBe(20);
  });
  it('formationWord = 0x5b59a0 (OR af pladsernes bits + normaliseringen)', () => {
    // 532_attacking_default: OR = 0x288a8b81 → 0x281b2381 (filens +0x187b er den normaliserede); 3-5-2-typen 0x38115381 → 0x381b0381
    expect(formationWord([1, 0x808, 0x88, 0x104, 0x404, 0x204, 0x410, 0x220, 0x140, 0x440, 0x110])).toBe(0x281b2381);
    // NB: .pct-filernes gemte ord er ikke altid genberegnet (fx 532_v2: OR 0x280e07c1, filen 0x280aab81) – loaderen bruger filens ord
  });
  it('uden manager ændres kun tacklingen (holdets flag +0x40/+0x41 = 0 → let)', () => {
    const p = PRESET_TACTICS[0];
    const r = aiPrematch({ flags: p.flags, lo: p.lo, hi: p.hi, masks: p.masks, masks2: p.masks2, players: [], manager: null, ownRep: 5000, oppRep: 5000,
      b19: true, compType: 0, homeTeam: true }, () => 0);
    expect(r.teamFlags).toBe(((p.flags & ~0x70) | 0x20) >>> 0);
    expect(r.lo).toEqual(p.lo.map((v) => v >>> 0));
  });
  it('oppositeIndex = sub_6d4330: modsat rolle på den spejlede side, ellers nærmeste efter DIST', () => {
    const opp = [{ slot: 0, pos: 0x1 }, { slot: 1, pos: 0x240 }, { slot: 2, pos: 0xc0 }, { slot: -1, pos: 0x840 }, { slot: 3, pos: 0x110 }];
    expect(oppositeIndex(1, 0x804, opp)).toBe(2);   // D højre ↔ F venstre
    expect(oppositeIndex(1, 0x204, opp)).toBe(1);   // D central ↔ F central
    expect(oppositeIndex(1, 0x1, opp)).toBe(-1);    // målmand
    expect(oppositeIndex(1, 0x410, opp)).toBe(4);   // M højre-central ↔ M venstre-central
    expect(oppositeIndex(1, 0x820, opp)).toBe(4);   // ingen DM: nærmeste (M LC: række 3 vs AM 4, kolonne 5 vs 7 → DIST[1][2])
  });
  it('venskabskamp (type 1): rand(2000) + rand(−4000) før omdømmeforskellen', () => {
    const calls: number[] = [];
    const p = PRESET_TACTICS[0];
    aiPrematch({ flags: p.flags, lo: p.lo, hi: p.hi, masks: p.masks, masks2: p.masks2, players: [], manager: null, ownRep: 5000, oppRep: 5000,
      b19: false, compType: 1, homeTeam: true }, (n) => { calls.push(n); return 0; });
    expect(calls).toEqual([2000, 4000]);   // rand(−4000) = −rand(4000)
  });
});

// ------------------------------------------------------------------ kampsporet
interface Side { side: number; table: Uint8Array; flags: number; tb: number[]; lo: number[]; hi: number[]; R: { slot: number; staff: number; rec: Uint8Array; mp: Uint8Array }[] }
function parseTrace(): { home: number; away: number; sides: Side[] }[] {
  const out: { home: number; away: number; sides: Side[] }[] = [];
  let cur: (typeof out)[number] | null = null, s: Side | null = null;
  for (const l of readFileSync(TRACE, 'utf8').split('\n')) {
    if (l.startsWith('M ')) { const [, h, a] = l.split(' '); cur = { home: +h, away: +a, sides: [] }; out.push(cur); continue; }
    if (!cur) continue;
    if (l.startsWith('P ')) { const [, sd, h] = l.split(' '); s = { side: +sd, table: Buffer.from(h, 'hex'), flags: 0, tb: [], lo: [], hi: [], R: [] }; cur.sides.push(s); continue; }
    if (l.startsWith('I ') && s) { const f = l.split(' '); s.flags = parseInt(f[2], 16) >>> 0; for (let k = 0; k < 11; k++) { const [tb, lo, hi] = f[3 + k].split(':').map((x) => parseInt(x, 16) >>> 0); s.tb.push(tb); s.lo.push(lo); s.hi.push(hi); } continue; }
    if (l.startsWith('R ') && s) { const f = l.split(' '); s.R.push({ slot: +f[2], staff: +f[3], rec: Buffer.from(f[4], 'hex'), mp: Buffer.from(f[5], 'hex') }); }
  }
  return out;
}
/** alle 40 .pct-filer (~/cm0102-engine/pct + notes/pct-tables.json; loaderen 0x5b5d10 som i tools/gen_presets_ts.py), ellers de 17 i presetTactics.ts */
interface Tac { file: string; name: string; masks: number[]; masks2: number[]; grid: Uint8Array; formation?: number; flags: number; lo: number[]; hi: number[]; tb: number[]; table: Uint8Array }
function loadTacs(): Tac[] {
  const dir = `${homedir()}/cm0102-engine/pct`;
  if (!existsSync(PCT) || !existsSync(dir)) return PRESET_TACTICS.map((p) => ({ ...p, grid: Buffer.from(p.grid, 'base64'), table: presetTable(p) }));
  const pct = JSON.parse(readFileSync(PCT, 'utf8')) as Record<string, { name: string; masks: number[]; masks2: number[]; formation: number; grid: number[] }>;
  return Object.entries(pct).map(([f, k]) => {
    const b = readFileSync(`${dir}/${f}.pct`), v = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const ver = (v.getUint32(0, true) - 0x075bcd15) >>> 0;
    let fl = v.getUint32(0x559, true), lo: number[], hi: number[], o: number;
    if (ver >= 0x98ec5e) { lo = []; hi = []; for (let i = 0; i < 11; i++) { lo.push(v.getUint32(0x55d + 8 * i, true)); hi.push(v.getUint32(0x561 + 8 * i, true)); } o = 0x55d + 0x58; }
    else { lo = Array.from({ length: 11 }, (_, i) => v.getUint32(0x55d + 4 * i, true)); hi = Array(11).fill(0xa); o = 0x55d + 0x2c; }
    const tb = Array.from(b.subarray(o, o + 11));
    if (!(fl & 0x4000)) fl |= 0x2000;
    if (ver < 0x98ec5d) fl |= 0x20000;
    const grid = new Uint8Array(k.grid);
    return { file: f, name: PRESET_TACTICS.find((p) => p.file === f)?.name ?? f, masks: k.masks, masks2: k.masks2, grid, formation: k.formation >>> 0, flags: fl >>> 0, lo, hi, tb, table: expandGrid(grid) };
  });
}
const mirror = (t0: Uint8Array) => {
  const m = new Uint8Array(2376);
  for (let sl = 0; sl < 11; sl++) for (let a = 0; a < 2; a++) for (let bx = 0; bx < 9; bx++) for (let by = 0; by < 12; by++) {
    const c = t0[216 * sl + 108 * a + 12 * (8 - bx) + (11 - by)]; m[216 * sl + 108 * a + 12 * bx + by] = (8 - (c & 15)) | ((11 - (c >> 4)) << 4);
  }
  return m;
};
const block = (t: Uint8Array, sl: number) => Buffer.from(t.subarray(216 * sl, 216 * sl + 216)).toString('hex');
/** forudindstillingen med flest ens pladsblokke (side 1 spejlet) */
function findPreset(s: Side, tacs: Tac[]): { p: Tac; same: number } | null {
  let best: { p: Tac; same: number } | null = null;
  for (const p of tacs) {
    const t = s.side ? mirror(p.table) : p.table;
    let same = 0; for (let sl = 0; sl < 11; sl++) if (block(t, sl) === block(s.table, sl)) same++;
    if (!best || same > best.same || (same === best.same && p.tb.every((v, k) => v === s.tb[k]) && !best.p.tb.every((v, k) => v === s.tb[k]))) best = { p, same };
  }
  return best && best.same >= 5 ? best : null;
}
// ------------------------------------------------------------------ databasen (3.9.60, personpost 157 bytes)
function loadDb() {
  const file = (f: string) => { const n = readdirSync(DB).find((x) => x.toLowerCase() === f)!; const b = readFileSync(join(DB, n)); return new DataView(b.buffer, b.byteOffset, b.byteLength); };
  const dec = new TextDecoder('latin1');
  const str = (v: DataView, o: number, len: number) => { const u = new Uint8Array(v.buffer, v.byteOffset + o, len); const e = u.indexOf(0); return dec.decode(u.subarray(0, e < 0 ? len : e)).trim(); };
  const idx = file('index.dat');
  const recs: { name: string; count: number; offset: number }[] = [];
  for (let o = 8; o + 67 <= idx.byteLength; o += 67) recs.push({ name: str(idx, o, 51), count: idx.getInt32(o + 55, true), offset: idx.getInt32(o + 59, true) });
  const S = file('staff.dat');
  const T = recs.filter((r) => r.name.toLowerCase() === 'staff.dat' && r.count > 0).sort((a, b) => a.offset - b.offset);
  const sizes = T.map((t, i) => Math.round(((T[i + 1]?.offset ?? S.byteLength) - t.offset) / t.count));
  const tP = T[0], psz = sizes[0];
  const PL_REF = psz === 157 ? 145 : 97, NP_REF = psz === 157 ? 153 : 105;     // fundet som i cm0102.ts (flest forskellige poster)
  const tN = T.find((_, i) => i > 0 && sizes[i] === 68)!, tPl = T.find((_, i) => i > 0 && sizes[i] === 70)!;
  const nonAt = new Map<number, number>(); for (let k = 0; k < tN.count; k++) nonAt.set(S.getInt32(tN.offset + k * 68, true), tN.offset + k * 68);
  const plAt = new Map<number, number>(); for (let k = 0; k < tPl.count; k++) plAt.set(S.getInt32(tPl.offset + k * 70, true), tPl.offset + k * 70);
  const staffAt = new Map<number, number>(), staffOfPl = new Map<number, number>();
  for (let k = 0; k < tP.count; k++) { const o = tP.offset + k * psz; staffAt.set(S.getInt32(o, true), o); const pl = S.getInt32(o + PL_REF, true); if (pl >= 0) staffOfPl.set(pl, S.getInt32(o, true)); }
  const byCaPa = new Map<string, number[]>();
  for (const [id, o] of plAt) {
    const k2 = `${S.getInt16(o + 5, true)}/${S.getInt16(o + 7, true)}`; (byCaPa.get(k2) ?? byCaPa.set(k2, []).get(k2)!).push(id);
  }
  const C = file('club.dat'), CC = file('club_comp.dat'), N = file('nation.dat');
  const nationName = new Map<number, string>(); for (let o = 0; o + 290 <= N.byteLength; o += 290) nationName.set(N.getInt32(o, true), str(N, o + 4, 51));
  const compNation = new Map<number, number>(); for (let o = 0; o + 107 <= CC.byteLength; o += 107) compNation.set(CC.getInt32(o, true), CC.getInt32(o + 93, true));
  const club = new Map<number, { name: string; rep: number; mgr: number; nation: string }>();
  for (let o = 0; o + 581 <= C.byteLength; o += 581) club.set(C.getInt32(o, true), { name: str(C, o + 4, 51), rep: C.getInt16(o + 128, true), mgr: C.getInt32(o + 207, true),
    nation: nationName.get(compNation.get(C.getInt32(o + 87, true)) ?? C.getInt32(o + 83, true)) ?? '' });
  /** spillerposten i hukommelsen → databasens spiller: samme positionsevner og flest ens rå egenskaber (de udfyldte/omregnede er 0 eller
   *  interne i hukommelsen og tæller ikke); CA/PA kan være rettet ved spilstart (initialisePA/capCA) og bruges kun som tillæg */
  const matchRec = (rec: Uint8Array): number | null => {
    const ca = (rec[5] | (rec[6] << 8)) << 16 >> 16, pa = (rec[7] | (rec[8] << 8)) << 16 >> 16;
    // samme CA/PA og flest ens bytes (positionerne skal passe; de interne/udfyldte tæller ikke, fordi de er 0 i databasen)
    let b2 = -1, s2 = -1, tie = false;
    for (const id of byCaPa.get(`${ca}/${pa}`) ?? []) {
      const o = plAt.get(id)!; let sc = 0;
      for (let i = 0x0f; i < 0x45; i++) { const b = S.getUint8(o + i); if (b !== 0 && b === rec[i]) sc++; else if (i < 0x1b && b !== rec[i]) sc -= 5; }
      if (sc > s2) { s2 = sc; b2 = id; tie = false; } else if (sc === s2) tie = true;
    }
    return b2 >= 0 && !tie && s2 >= 8 ? b2 : null;
  };
  const clubOf = (recs: Uint8Array[]): number | null => {
    const votes = new Map<number, number>(); let n = 0;
    for (const r of recs) { const id = matchRec(r); if (id === null) continue; const so = staffAt.get(staffOfPl.get(id) ?? -1); if (so === undefined) continue; n++; const c = S.getInt32(so + 57, true); votes.set(c, (votes.get(c) ?? 0) + 1); }
    const b = [...votes].sort((a, c) => c[1] - a[1])[0];
    if (DEBUG) console.log(`klub: ${recs.length} poster, ${n} fundet, stemmer ${[...votes].sort((a, c) => c[1] - a[1]).slice(0, 3).map(([c, v]) => `${club.get(c)?.name}:${v}`).join(' ')}`);
    return b && b[1] >= 3 && b[1] >= 0.6 * n ? b[0] : null;
  };
  const manager = (cid: number): Omit<PrematchManager, 'id'> | null => {
    const so = staffAt.get(club.get(cid)?.mgr ?? -1); if (so === undefined) return null;
    const no = nonAt.get(S.getInt32(so + NP_REF, true)); if (no === undefined) return null;
    const a = (i: number) => S.getInt8(no + 0x0e + i);
    return { ca: S.getInt16(no + 4, true), attacking: a(0), directness: a(5), freeRoles: a(7), offside: a(14), pressing: a(17), tactics: a(19) };
  };
  return { club, clubOf, manager };
}

describe.skipIf(!existsSync(TRACE) || !existsSync(DB))('sub_6ddab0 mod kampsporet (trace4)', () => {
  it('holdflag og individuelle instruktioner som i originalens hukommelse', () => {
    const db = loadDb(), tacs = loadTacs();
    const ms = parseTrace();
    const tot = { sides: 0, used: 0, noPreset: 0, noClub: 0, noMgr: 0, zeroMgr: 0, noOpp: 0, nullMgr: 0, foreignMgr: 0, unkSlots: 0, unkNull: 0, zeroSlots: 0, zeroNull: 0, gFull: { teams: 0, slots: 0, lo: 0, hi: 0 }, gPart: { teams: 0, slots: 0, lo: 0, hi: 0 }, gNull: { teams: 0, slots: 0, lo: 0, hi: 0 }, fFull: [] as boolean[], fRest: [] as boolean[], slots: 0, lo: 0, hi: 0, lo0: 0, hi0: 0, runs: 0, runsAll: 0, flag: 0, flag0: 0, tackle20: 0, masks: 0, masksOk: 0 };
    const misses: string[] = [];
    for (const [mi, m] of ms.entries()) {
      const info = m.sides.map((s) => ({ s, pr: findPreset(s, tacs), cid: db.clubOf(s.R.map((r) => r.rec)) }));
      for (const [si, { s, pr, cid }] of info.entries()) {
        tot.sides++;
        if (!pr) { tot.noPreset++; continue; }
        const oc = info[1 - si].cid;
        const p = pr.p;
        const players: PrematchPlayer[] = s.R.map((r) => {
          const rec = r.rec, mp = r.mp;
          return { slot: (mp[0x19] << 24) >> 24, recId: rec[0] | (rec[1] << 8) | (rec[2] << 16) | (rec[3] << 24), condition: new DataView(mp.buffer, mp.byteOffset).getFloat32(0x4d, true),
            b24: mp[0x24], raw: { dm: rec[0x12], m: rec[0x13], am: rec[0x14], f: rec[0x15], right: rec[0x17], left: rec[0x18], central: rec[0x19], freeRole: rec[0x1a],
              jumping: rec[0x2e], technique: rec[0x40], stamina: rec[0x3c], workRate: rec[0x44] }, attr: (n: number) => recordAttr(rec, n) };
        });
        const base: Omit<PrematchInput, 'manager'> = { flags: p.flags, lo: p.lo, hi: p.hi, masks: p.masks, masks2: p.masks2, formation: p.formation, players,
          ownRep: cid !== null ? db.club.get(cid)!.rep : 0, oppRep: oc !== null ? db.club.get(oc)!.rep : 0,
          // tacklingen 0x20 sættes før løkken (b19 eller venskabskampens rand-slag) og læses af blok F – sporet viser resultatet
          b19: (s.flags & 0x70) === 0x20, compType: 0, homeTeam: si === 0 };
        const score = (r: ReturnType<typeof aiPrematch>) => { let n = 0; for (let sl = 0; sl < 11; sl++) n += +(((r.lo[sl] ^ s.lo[sl]) & ~0xc00000) === 0) + +(r.hi[sl] === s.hi[sl]); return n; };
        if (cid === null) {                                                                // ukendt klub: kun en kontrol af grenen uden manager
          tot.noClub++; const r = aiPrematch({ ...base, manager: null }, () => 0); tot.unkSlots += 22; tot.unkNull += score(r); continue;
        }
        // spillet er startet med England: klubberne i de engelske ligaer har deres manager indlæst (databasens); for udenlandske klubber er
        // team+0x1f kun sat for nogle (Bayern ja, Werder/Sampdoria/Flamengo nej) – dér prøves begge grene, og valget tælles
        const english = db.club.get(cid)!.nation === 'England';
        const mg = db.manager(cid);
        if (english && !mg) { tot.noMgr++; continue; }
        if (english && mg && !mg.attacking && !mg.directness && !mg.offside && !mg.pressing && !mg.freeRoles) {   // ikke udfyldt i databasen (udfyldes ved spilstart ?)
          tot.zeroMgr++; tot.zeroSlots += 22; tot.zeroNull += score(aiPrematch({ ...base, manager: null }, () => 0)); continue;
        }
        if (oc === null) { tot.noOpp++; continue; }
        let best = { k: -1, score: -1, r: aiPrematch({ ...base, manager: null }, () => 0) };
        if (!english) best.score = score(best.r);
        if (mg && oc !== null) {
          const div = 13 - Math.trunc(shown(mg.ca + 22) / 2);
          for (let k = 0; k < div; k++) { const r = aiPrematch({ ...base, manager: { ...mg, id: k } }, () => 0), sc = score(r); if (sc > best.score) best = { k, score: sc, r }; }
        }
        if (!english) { if (best.k < 0) tot.nullMgr++; else tot.foreignMgr++; }
        const r = best.r;
        tot.used++;
        // managere med 0 i en af de brugte egenskaber: databasen mangler værdien, og originalen udfylder den ved spilstart (?) – usikre
        const complete = !!mg && best.k >= 0 && [mg.attacking, mg.directness, mg.freeRoles, mg.offside, mg.pressing, mg.tactics].every((v) => v > 0);
        const grp = best.k < 0 ? tot.gNull : complete ? tot.gFull : tot.gPart;
        grp.teams++; for (let sl = 0; sl < 11; sl++) { grp.slots++; grp.lo += +(((r.lo[sl] ^ s.lo[sl]) & ~0xc00000) === 0); grp.hi += +(r.hi[sl] === s.hi[sl]); }
        const allRuns = s.lo.every((v) => (v & 0xc00000) === 0x400000);                    // tilstand 2–5: 0x6c54a0 satte 0x400000 for alle
        for (let sl = 0; sl < 11; sl++) {
          tot.slots++;
          const okLo = ((r.lo[sl] ^ s.lo[sl]) & ~0xc00000) === 0, okHi = r.hi[sl] === s.hi[sl];
          tot.lo += +okLo; tot.hi += +okHi;
          tot.lo0 += +(((p.lo[sl] ^ s.lo[sl]) & ~0xc00000) === 0); tot.hi0 += +((p.hi[sl] >>> 0) === s.hi[sl]);
          if (!allRuns) { tot.runsAll++; tot.runs += +((r.lo[sl] & 0xc00000) === (s.lo[sl] & 0xc00000) || (s.lo[sl] & 0xc00000) === 0x800000); }
          if (r.masks[sl] !== p.masks[sl] || r.masks2[sl] !== p.masks2[sl]) { tot.masks++; tot.masksOk += +(block(s.side ? mirror(p.table) : p.table, sl) === block(s.table, sl)); }
          if ((!okLo || !okHi) && misses.length < 60) misses.push(`M${mi} s${s.side} ${p.name} k${best.k} sl${sl} m${r.masks[sl].toString(16)}/${r.masks2[sl].toString(16)} lo ${(p.lo[sl] >>> 0).toString(16)}→${s.lo[sl].toString(16)} port ${r.lo[sl].toString(16)} (x${((r.lo[sl] ^ s.lo[sl]) & ~0xc00000).toString(16)}) hi ${p.hi[sl]}→${s.hi[sl]} port ${r.hi[sl]} J ${r.J[sl]?.toFixed(3)}`);
        }
        const G = 0xf | 0x180 | 0x600;
        const fOk = ((r.teamFlags ^ s.flags) & G) === 0, tOk = (s.flags & 0x70) === (r.teamFlags & 0x70) || (s.flags & 0x70) === 0x20;
        tot.flag += +(fOk && tOk); (complete ? tot.fFull : tot.fRest).push(fOk && tOk);
        if (DEBUG && !(fOk && tOk)) misses.push(`FLAG M${mi} s${s.side} ${db.club.get(cid)!.name} ${p.flags.toString(16)}→${s.flags.toString(16)} port ${r.teamFlags.toString(16)} ${complete ? 'fuldstændig' : 'ufuldstændig/ingen'}`); tot.flag0 += +(((p.flags ^ s.flags) & (G | 0x70)) === 0); tot.tackle20 += +((s.flags & 0x70) === 0x20 && (r.teamFlags & 0x70) !== 0x20);
        if (DEBUG) console.log(`M${mi} s${s.side} ${p.name} (${pr.same}/11) klub ${db.club.get(cid)!.name} (${db.club.get(cid)!.nation}) rep ${base.ownRep}/${base.oppRep} ${mg && best.k >= 0 ? `mgr A${mg.attacking} D${mg.directness} P${mg.pressing} O${mg.offside} FR${mg.freeRoles} T${mg.tactics} CA${mg.ca} k${best.k}/${13 - Math.trunc(shown(mg.ca + 22) / 2)}` : 'ingen manager'} score ${best.score}/22 flags ${p.flags.toString(16)}→${s.flags.toString(16)} port ${r.teamFlags.toString(16)}`);
      }
    }
    const pct = (a: number, b: number) => `${a}/${b} (${b ? ((100 * a) / b).toFixed(1) : '-'} %)`;
    console.log(`sub_6ddab0 mod trace4: hold ${tot.used}/${tot.sides} brugt (ingen forudindstilling ${tot.noPreset}, klub ukendt ${tot.noClub}, modstander ukendt ${tot.noOpp}, engelsk uden manager ${tot.noMgr}, manager uden egenskaber ${tot.zeroMgr}); udenlandske: ${tot.nullMgr} bedst uden manager, ${tot.foreignMgr} med databasens\n`
      + `  lav (uden 0xc00000) ${pct(tot.lo, tot.slots)} [.pct uændret: ${pct(tot.lo0, tot.slots)}]\n`
      + `  høj ${pct(tot.hi, tot.slots)} [.pct: ${pct(tot.hi0, tot.slots)}]\n`
      + `  holdflag (afleveringer/pres/offside, tackling 0x20 tilladt) ${pct(tot.flag, tot.used)} [.pct: ${pct(tot.flag0, tot.used)}], 0x20 fra rand/b19: ${tot.tackle20}\n`
      + `  fremadløb 0xc00000 på hold uden tilstand 2–5 ${pct(tot.runs, tot.runsAll)}\n`
      + `  fuldstændige managere (${tot.gFull.teams} hold): lav ${pct(tot.gFull.lo, tot.gFull.slots)}, høj ${pct(tot.gFull.hi, tot.gFull.slots)}, holdflag ${pct(tot.fFull.filter(Boolean).length, tot.fFull.length)}\n`
      + `  managere med 0-egenskaber (${tot.gPart.teams} hold): lav ${pct(tot.gPart.lo, tot.gPart.slots)}, høj ${pct(tot.gPart.hi, tot.gPart.slots)} (holdflag for dem og uden manager: ${pct(tot.fRest.filter(Boolean).length, tot.fRest.length)})\n`
      + `  uden manager (${tot.gNull.teams} hold): lav ${pct(tot.gNull.lo, tot.gNull.slots)}, høj ${pct(tot.gNull.hi, tot.gNull.slots)}\n`
      + `  pladser med ændret maske, hvis blok i positionstabellen stadig er forudindstillingens (0x5b2ba0 udvider ikke TBL) ${pct(tot.masksOk, tot.masks)}\n`
      + `  engelske managere med lutter 0 (sprunget over) med grenen uden manager: lav+høj ${pct(tot.zeroNull, tot.zeroSlots)}\n`
      + `  ukendte klubber med grenen uden manager: lav+høj ${pct(tot.unkNull, tot.unkSlots)}`);
    if (DEBUG) console.log(misses.join('\n'));
    expect(tot.used).toBeGreaterThan(20);
    expect(tot.lo / tot.slots).toBeGreaterThan(0.9);
    expect(tot.hi / tot.slots).toBeGreaterThan(0.9);
  }, 120_000);
});
