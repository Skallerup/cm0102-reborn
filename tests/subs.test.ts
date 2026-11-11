// Udskiftningerne (src/game/engine/grid/subs.ts) mod originalens egne kald: kampsporet ~/cm0102-engine/oracle/runs/subs2.txt
// (tools/match_trace.c – RT_WRAP af 0x6e1090/0x6e2f20/0x6d0b60/0x6e1aa0 i den instrumenterede original, seed 1, 60 dage, 3.9.60,
// 160 kampe) uddraget med oracle/tools/subs_extract.py til subs2-calls.jsonl (én linje pr. kald af 0x6e1090: spillerne før/efter
// og hvert kald af 0x6e2f20 med indgange og værdi). De indlejrede tilfælde nedenfor kører altid; hele sporet kun, når filen findes.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import {
  assignPlayers, compareFull, deadBallGate, msvcQsort, positionFactor, positionRecord, reselectFlags, ratingTerm, conditionTerm,
  combineScore, treatInjured, cappedMinute, estimatedQuality, type SubPlayer, type ScoreFn,
} from '../src/game/engine/grid/subs';

const CALLS = `${homedir()}/cm0102-engine/oracle/runs/subs2-calls.jsonl`;

/** to genvalg fra sporet (kald nr. 1 og 2 med en udskiftning i en kamp med 3 udskiftninger): kandidaterne i den sorterede rækkefølge
 *  (k = 3 svageste + bænken), værdien af hver kandidat på hver af de 3 pladser (0x6e2f20) og hvem der kom ind/ud. */
const INLINE = [
  { clock: 544, k: 3, cands: [7814, 2662, 3209, 5619, 4606, 1723, 3885, 5172, 2574, 1629], M: [[19600, -3200, -22100, -11352, -118610, 8100, -10896, -22900, 19400, 6318], [980, 19600, -111000, -105952, -118610, 8100, -97584, -41400, 950, 16000], [-19135, -56668, 159, 178, -149022, -35880, 60, 176, -18120, 0]], on: [5619], off: [3209] },
  { clock: 675, k: 3, cands: [319, 5404, 6294, 1015, 2400, 4683, 5243, 7977, 7015, 608], M: [[15300, 18000, 8700, -23750, -152400, 15750, -24500, -9168, 14480, 14256], [15000, 18000, 8400, -24100, -155700, 15600, -24750, -9336, 15600, 15450], [7623, -20188, 11704, -115750, -148500, -54766, -120250, -81106, -6656, -1167]], on: [4683], off: [319] },
];

const player = (o: Partial<SubPlayer>): SubPlayer => ({
  id: 0, idx: 0, slot: 0, prevSlot: 0, condition: 9000, pendingCondition: 0, rating: 6400, gkRating: 1, mustLeave: false, treat: false,
  substituted: false, minuteOn: -1, minuteOff: -1, minuteInjured: -1, injuredBy: null, ...o,
});
const seq = (xs: number[]) => { let i = 0; return (n: number) => { void n; return xs[i++]; }; };

/** ind/ud efter fordelingen: valgte bænkspillere kommer ind, ikke-valgte på banen går ud (0x6e1433) */
function outcome(cands: number[], k: number, M: number[][], benchFrom: number) {
  const out = assignPlayers(cands.length, k, (j, i) => M[j][i]);
  const on = cands.filter((_, i) => i >= benchFrom && out.includes(i));
  const off = cands.filter((_, i) => i < benchFrom && !out.includes(i));
  return { out, on, off };
}

describe('sub_6e2000 – fordelingen (indlejret)', () => {
  it.each(INLINE)('kald ved clock $clock giver samme ind/ud som originalen', (c) => {
    const r = outcome(c.cands, c.k, c.M, c.k);
    expect(r.on).toEqual(c.on);
    expect(r.off).toEqual(c.off);
  });
  it('konflikt: samme spiller bedst to steder – den med mindst tab flyttes', () => {
    const M = [[10, 9, 1], [10, 2, 8]];
    expect(assignPlayers(3, 2, (j, i) => M[j][i])).toEqual([1, 0]);    // tab 1 (j0 → kandidat 1) mod 2; 9 + 10 = 19
  });
  it('ombytning: byt, når summen bliver større', () => {
    // grådigt: j0 → 0 (5), j1 → 1 (5); byttet giver 6 + 6
    const M = [[5, 6], [6, 5]];
    expect(assignPlayers(2, 2, (j, i) => M[j][i])).toEqual([1, 0]);
  });
});

describe('MSVC-qsort (0x945333)', () => {
  it('sorterer som en almindelig sortering ved forskellige nøgler', () => {
    const r = seq(Array.from({ length: 400 }, (_, i) => (i * 7919) % 1000));
    for (let n = 0; n < 20; n++) {
      const a = Array.from({ length: n }, () => r(0));
      const b = [...a].sort((x, y) => x - y);
      msvcQsort(a, (x, y) => x - y);
      expect(a).toEqual(b);
    }
  });
  it('lige nøgler: rækkefølgen er originalens (shortsort lægger den sidste største bagerst)', () => {
    const a = [{ k: 1, n: 'a' }, { k: 1, n: 'b' }, { k: 0, n: 'c' }];
    msvcQsort(a, (x, y) => x.k - y.k);
    expect(a.map((x) => x.n).join('')).toBe('cba');
  });
});

describe('sub_6c54a0 – tidspunktet og flagene', () => {
  it('rand(50) trækkes for computerhold; genvalg når minut > rand + 10 og > 55 tik siden sidst', () => {
    expect(deadBallGate(seq([0]), { aiControlled: true, clock: 11 * 11, lastChange: 0 })).toBe(true);    // 11 > 10
    expect(deadBallGate(seq([1]), { aiControlled: true, clock: 11 * 11, lastChange: 0 })).toBe(false);
    expect(deadBallGate(seq([0]), { aiControlled: true, clock: 600, lastChange: 545 })).toBe(false);     // 55 tik
    let n = 0;
    expect(deadBallGate(() => { n++; return 0; }, { aiControlled: false, clock: 900, lastChange: 0 })).toBe(false);
    expect(n).toBe(0);
  });
  it('flagene: liga uden cup-slag 0x9a0cb, cup trækker rand(2000) + rand(−4000) først', () => {
    const base = { national: false, assisted: false, compType: 0, ownRep: 6000, oppRep: 6000, leagueBranch: true, b16: false, humanClubOption: false };
    expect(reselectFlags(seq([0]), base).toString(16)).toBe('9a0cb');
    expect(reselectFlags(seq([0]), { ...base, leagueBranch: false }).toString(16)).toBe('a1cb');
    expect(reselectFlags(seq([1999, 0]), { ...base, compType: 1, ownRep: 9000, oppRep: 2000 }).toString(16)).toBe('8a1cb');
  });
  it('minuttet loftes af perioden', () => {
    expect(cappedMinute(520, 495)).toBe(45);
    expect(cappedMinute(520, 990)).toBe(47);
  });
});

describe('sub_6e2f20 – stillingsfaktoren og de tidsafhængige led', () => {
  it('positionFactor: naturlig plads 100 + side 100 = 200', () => {
    const r = positionRecord(Object.assign(new Uint8Array(0x46), { 0x11: 20, 0x19: 20 }));
    expect(positionFactor(r, 0x204, 0x204, 0x9a0cb)).toBe(200);
    expect(positionFactor(r, 0x210, 0x210, 0x9a0cb)).toBe(-150 + 100);  // M-evne 0 → tabellen −150, C 20 → +100
    expect(positionFactor(r, 0x210, 0x204, 0x9a0cb)).toBe(Math.trunc((200 + 2 * -50) / 3));   // anden angrebsrolle: (P_att + 2·P)/3
  });
  it('ratingTerm: starter i 1. halvleg får grundværdien −2000, bænken max 3000 og målmanden +3500', () => {
    const ctx = { clock: 215, periodEnd: 495, humanControlled: false };
    expect(ratingTerm(player({ idx: 5, slot: 5, rating: 5599 }), ctx)).toBe(Math.trunc((5599 + 2000 + 1600) / 25));
    expect(ratingTerm(player({ idx: 12, slot: -1, rating: 6400 }), ctx)).toBe(Math.trunc((6400 - 3000) / 25));
    expect(ratingTerm(player({ idx: 12, slot: -1, rating: 6400, gkRating: 20 }), ctx)).toBe(Math.trunc((6400 - 6500) / 25));
    expect(ratingTerm(player({ idx: 12, slot: -1, rating: 6400 }), { ...ctx, clock: 990, periodEnd: 990 })).toBe(Math.trunc((6400 + 2000) / 25));
  });
  it('conditionTerm: +1500 i 1. halvleg, knæk ved 9000, under 5750 returneres straks', () => {
    const q = { flags: 0x9a0cb, staticSum: 0, staticCount: 0, staticAdd: 0, statusBonus: 0, dbFitness: 0, instrLo: 0, teamFlags: 0 };
    expect(conditionTerm(player({ condition: 8441 }), q, { clock: 215, periodEnd: 495, humanControlled: false }, 100)).toEqual({ add: 0 });
    expect(conditionTerm(player({ condition: 7669 }), q, { clock: 540, periodEnd: 990, humanControlled: false }, 100)).toEqual({ add: 230 - 280 });
    expect(conditionTerm(player({ condition: 5000 }), q, { clock: 540, periodEnd: 990, humanControlled: false }, 100)).toEqual({ final: 5000 + 100 * 100 - 25000 });
    expect(conditionTerm(player({ slot: -2 }), q, { clock: 540, periodEnd: 990, humanControlled: false }, 100)).toEqual({ final: -1000000 });
  });
  it('combineScore: P·s, s + P under 1, (500 − s)·P for negativ P', () => {
    expect(combineScore(193, 159, 0x9a0cb)).toBe(30687);
    expect(combineScore(200, -1, 0x9a0cb)).toBe(199);
    expect(combineScore(-37, 23, 0x9a0cb)).toBe(-17649);
  });
});

describe('sub_6d0b60 – behandlingen', () => {
  it('må ud: −2 og genvalg med udskiftninger; ellers rand(4) og spillet fortsætter', () => {
    const a = player({ id: 1, idx: 3, slot: 3, treat: true, mustLeave: true });
    const b = player({ id: 2, idx: 4, slot: 4, treat: true });
    const acts = treatInjured(seq([2]), [{ players: [a, b], subsLeft: 3, aiControlled: true }, { players: [], subsLeft: 3, aiControlled: true }], 600, 990);
    expect(acts.map((x) => x.kind)).toEqual(['carriedOff', 'continues', 'reselect']);
    expect(a.slot).toBe(-2); expect(a.prevSlot).toBe(3); expect(a.minuteInjured).toBe(54);
    expect(b.treat).toBe(false);
    const c = player({ id: 3, slot: 5, treat: true, mustLeave: true });
    expect(treatInjured(seq([]), [{ players: [c], subsLeft: 0, aiControlled: true }], 600, 990).map((x) => x.kind)).toEqual(['carriedOff', 'rearrange']);
  });
});

// ---------------------------------------------------------------- hele sporet

interface TraceCall {
  m: number; side: number; arg: number; subs: number; subs2: number; clock: number; tick: number;
  /** [idx, slot, staff, cond, w35, b1c, b1d, b1e, slotEfter, minutInd, minutUd, rec-hex, CA, omdømme, +0x1a] */
  pl: [number, number, number, number, number, number, number, number, number, number, number, string, number, number, number][];
  /** [staff, pos, att, lo, hi, tb, flag, værdi] */
  F: [number, number, number, number, number, number, number, number][];
}
const loadCalls = (): TraceCall[] => readFileSync(CALLS, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

describe.skipIf(!existsSync(CALLS))('mod hele sporet (subs2, 160 kampe)', () => {
  const calls = existsSync(CALLS) ? loadCalls() : [];
  /** fase 1 af 0x6e2000: k blokke à n kald med samme position → kandidaternes rækkefølge og værdimatricen */
  const phase1 = (c: TraceCall) => {
    const F = c.F.filter((f) => !(f[6] & 0x800));
    if (!F.length) return null;
    const same = (a: typeof F[0], b: typeof F[0]) => a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
    let n = 0; while (n < F.length && same(F[n], F[0]) && !F.slice(0, n).some((f) => f[0] === F[n][0])) n++;   // k = 1: fase 3 gentager kaldet
    const listed = c.pl.filter((p) => p[1] >= 0 || (p[1] === -2 && !p[7])).length;
    const k = Math.min(c.subs, listed);
    if (F.length < n * k) return null;
    const cands = F.slice(0, n).map((f) => f[0]);
    const lookup = new Map<string, number>();
    for (const f of F) lookup.set(`${f[0]}:${f[1]}:${f[2]}:${f[3]}:${f[4]}:${f[5]}`, f[7]);
    const specs = Array.from({ length: k }, (_, j) => F[j * n]);
    const score: ScoreFn = (j, i) => {
      const s = specs[j]; const v = lookup.get(`${cands[i]}:${s[1]}:${s[2]}:${s[3]}:${s[4]}:${s[5]}`);
      if (v === undefined) throw new Error('mangler værdi');
      return v;
    };
    return { cands, k, n, score, specs };
  };

  it('0x6e0fe0 + MSVC-qsort giver originalens kandidatrækkefølge (n ≥ 11)', () => {
    let ok = 0, all = 0;
    for (const c of calls) {
      const p1 = phase1(c); if (!p1) continue;
      const listed = c.pl.filter((p) => p[1] >= 0 || (p[1] === -2 && !p[7]));
      if (listed.length < 11) continue;
      const sp = listed.map((p) => player({ id: p[2], idx: p[0], slot: p[1], condition: p[3], rating: p[4], gkRating: parseInt(p[11].slice(30, 32), 16) }));
      msvcQsort(sp, compareFull((q) => (q.slot === 0 ? 1 : 0x10)));                 // plads 0 = målmand (sub_6c38c0) *forenklet*
      all++;
      if (sp.slice(0, p1.k).map((q) => q.id).join() === p1.cands.slice(0, p1.k).join()) ok++;
    }
    console.log(`kandidatrækkefølge: ${ok}/${all}`);
    expect(ok / all).toBeGreaterThan(0.97);
  });

  it('den/de der går ud er altid blandt de k svageste (0x6e1090: k = min(udskiftninger, n))', () => {
    let off = 0, inK = 0;
    for (const c of calls) {
      const p1 = phase1(c); if (!p1) continue;
      for (const p of c.pl) if (p[1] >= 0 && p[8] === -4) { off++; if (p1.cands.slice(0, p1.k).includes(p[2])) inK++; }
    }
    console.log(`ud blandt de k svageste: ${inK}/${off}`);
    expect(inK).toBe(off);
  });

  it('sub_6e2000 med sporets værdier giver originalens ind/ud i (næsten) alle kald', () => {
    let ok = 0, all = 0, subsOk = 0;
    for (const c of calls) {
      const p1 = phase1(c); if (!p1) continue;
      const out = assignPlayers(p1.n, p1.k, p1.score);
      const byId = new Map(c.pl.map((p) => [p[2], p]));
      const on = p1.cands.filter((id, i) => byId.get(id)![1] === -1 && out.includes(i)).sort();
      const off = p1.cands.filter((id, i) => byId.get(id)![1] !== -1 && !out.includes(i)).sort();
      const tOn = c.pl.filter((p) => p[1] === -1 && p[8] >= 0).map((p) => p[2]).sort();
      const tOff = c.pl.filter((p) => p[1] !== -1 && p[1] !== -4 && p[8] === -4).map((p) => p[2]).sort();
      all++;
      if (on.join() === tOn.join() && off.join() === tOff.join()) ok++;
      if (c.subs - on.length === c.subs2) subsOk++;
    }
    console.log(`ind/ud: ${ok}/${all}, udskiftninger tilbage: ${subsOk}/${all}`);
    expect(ok / all).toBeGreaterThan(0.99);
  });

  it('pladserne bagefter: genvalgets pladser + omrokeringen 0x6e1aa0 (sporets værdier med flag 0x8800) = originalens', () => {
    let ok = 0, all = 0;
    for (const c of calls) {
      const p1 = phase1(c); if (!p1) continue;
      const out = assignPlayers(p1.n, p1.k, p1.score);
      if (!c.pl.some((p) => p[1] === -1 && p[8] >= 0)) continue;              // kun kald med et skift (ellers ingen omrokering)
      const byId = new Map(c.pl.map((p) => [p[2], p]));
      const slotOf = p1.cands.slice(0, p1.k).map((id) => { const p = byId.get(id)!; return c.arg && id === p1.cands[0] ? 0 : p[1] === -2 ? p[14] : p[1]; });
      const slot = new Map(c.pl.map((p) => [p[2], p[1]]));
      p1.cands.forEach((id, i) => { const j = out.indexOf(i); if (j >= 0) slot.set(id, slotOf[j]); else if (slot.get(id) !== -1) slot.set(id, -4); });
      // 0x6e1aa0: markspillerne på banen i idx-rækkefølge (plads 0 = målmand *forenklet*), n × n kald med flag 0x8800
      const list = c.pl.filter((p) => slot.get(p[2])! > 0).map((p) => p[2]);
      const R = c.F.filter((f) => (f[6] & 0xffff) === 0x8800);                // 0x8c1 = 0x6e0230 før omrokeringen
      if (R.length < list.length * list.length) continue;
      const lk = new Map<string, number>(); for (const f of R) lk.set(`${f[0]}:${f[1]}:${f[2]}:${f[3]}:${f[4]}:${f[5]}`, f[7]);
      const specs = list.map((_, j) => R[j * list.length]);
      if (R.slice(0, list.length).map((f) => f[0]).join() !== list.join()) continue;
      const out2 = assignPlayers(list.length, list.length, (j, i) => lk.get(`${list[i]}:${specs[j][1]}:${specs[j][2]}:${specs[j][3]}:${specs[j][4]}:${specs[j][5]}`)!);
      const before = list.map((id) => slot.get(id)!);
      list.forEach((id, i) => { const j = out2.indexOf(i); if (j >= 0) slot.set(id, before[j]); });
      all++;
      if (c.pl.every((p) => slot.get(p[2]) === p[8])) ok++;
    }
    console.log(`pladser efter genvalg + omrokering: ${ok}/${all}`);
    expect(ok / all).toBeGreaterThan(0.95);
  });

  it('stillingsfaktoren P passer med værdierne (P·s, s + P eller (500 − s)·P)', () => {
    let ok = 0, all = 0;
    for (const c of calls.slice(0, 600)) {
      const recs = new Map(c.pl.map((p) => [p[2], p[11]]));
      for (const f of c.F) {
        const hex = recs.get(f[0]); if (!hex) continue;
        const rec = Uint8Array.from(Buffer.from(hex, 'hex'));
        const P = positionFactor(positionRecord(rec), f[1], f[2], f[6]);
        const sc = f[7];
        all++;
        if (sc === -10000 || sc === -1000000 || (P > 0 && ((sc % P === 0 && sc / P >= 1) || sc <= P)) || (P < 0 && sc % P === 0) || (P === 0)) ok++;
      }
    }
    console.log(`P: ${ok}/${all}`);
    expect(ok / all).toBeGreaterThan(0.98);
  });

  it('tidspunktet: genvalg først efter minut 10, og mindst 5 minutter mellem dødboldsgenvalg', () => {
    const per = new Map<string, TraceCall[]>();
    for (const c of calls) { const k = `${c.m}:${c.side}`; (per.get(k) ?? per.set(k, []).get(k)!).push(c); }
    let first = 0, firstOk = 0, gaps = 0, gapsOk = 0;
    const mins: number[] = [];
    for (const v of per.values()) {
      first++; if (Math.trunc(v[0].clock / 11) > 10) firstOk++;
      for (let i = 1; i < v.length; i++) { const d = v[i].clock - v[i - 1].clock; if (d < 0) continue; gaps++; if (d > 55) gapsOk++; }
      if (v[0].subs === 3) for (const c of v) for (let s = 0; s < c.subs - c.subs2; s++) mins.push(Math.trunc(c.clock / 11));
    }
    const mean = mins.reduce((a, b) => a + b, 0) / mins.length;
    console.log(`første kald efter minut 10: ${firstOk}/${first}; mellemrum > 55 tik: ${gapsOk}/${gaps}; udskiftningsminut (3 udsk.): snit ${mean.toFixed(1)}, n ${mins.length}`);
    expect(firstOk / first).toBeGreaterThan(0.95);
    expect(gapsOk / gaps).toBeGreaterThan(0.97);          // resten: genvalg efter skade (0x6d0b60) og rødt kort (0x6cda20)
  });

  it('*estimeret* kvalitet: andel kald med samme ind/ud som originalen (rapporteres)', () => {
    let ok = 0, all = 0, subsReal = 0, subsEst = 0;
    const comp = new Set<string>(), seen = new Set<string>();
    for (const c of calls) { const t = `${c.m}:${c.side}`; if (!seen.has(t)) { seen.add(t); if (c.subs === 3) comp.add(t); } }
    for (const c of calls) {
      const p1 = phase1(c); if (!p1 || !comp.has(`${c.m}:${c.side}`)) continue;
      const byId = new Map(c.pl.map((p) => [p[2], p]));
      const ctx = { clock: c.clock, periodEnd: c.clock < 495 ? 495 : 990, humanControlled: false };
      const est: ScoreFn = (j, i) => {
        const p = byId.get(p1.cands[i])!; const s = p1.specs[j];
        const rec = positionRecord(Uint8Array.from(Buffer.from(p[11], 'hex')));
        const sp = player({ id: p[2], idx: p[0], slot: p[1], condition: p[3], rating: p[4], gkRating: rec.gk, minuteOn: p[9] });
        return combineScore(positionFactor(rec, s[1], s[2], s[6]), estimatedQuality(sp, p[12], p[13], ctx), s[6]);
      };
      const out = assignPlayers(p1.n, p1.k, est);
      const on = p1.cands.filter((id, i) => byId.get(id)![1] === -1 && out.includes(i)).sort().join();
      const tOn = c.pl.filter((p) => p[1] === -1 && p[8] >= 0).map((p) => p[2]).sort().join();
      all++; if (on === tOn) ok++;
      subsReal += c.pl.filter((p) => p[1] === -1 && p[8] >= 0).length; subsEst += on ? on.split(',').length : 0;
    }
    console.log(`estimeret kvalitet: samme ind ${ok}/${all}; udskiftninger i alt originalen ${subsReal}, estimeret ${subsEst}`);
    expect(all).toBeGreaterThan(0);
  });
});
