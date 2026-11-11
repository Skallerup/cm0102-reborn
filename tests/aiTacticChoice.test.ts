// 0x6e0230 (aiTacticChoice.ts) mod originalens valg i kampsporet ~/cm0102-engine/oracle/runs/trace5.txt (80 kampe fra 14/7-2001,
// database 3.9.60, frø 1; samme spil som trace4 + AI-tilstanden pr. tik). Det valgte (P-tabellen) findes blandt blokkene i
// orakelkørslens samesave.sav (tactics.dat = listen i hukommelsen, A-blokke efter B-blokke i filen); klubber, landshold, managere og
// deres ikke-spillerposter (yndlingsformation +0x43) er spillets egne poster i samme gemte spil (club.dat/nat_club.dat +0xcf →
// staff.dat +0x69 → nonplayer.dat). Spillerne = R-linjernes Player-poster (kun kampens trup, ikke hele kandidatlisten), konditionen fra
// kampblokkens +0x4d. Tilstanden = sporets A-værdi ved første tik (= den, valget brugte; se noten §5). Statistikken genspilles kamp for
// kamp (resultat inkl. forlænget spilletid fra fixtures_*.tmp; kampe med Arsenal – menneskeklubben – springes over).
// Q er *estimeret* (estimateQuality), så det nøjagtige valg rammes ikke altid: testen kræver ≥ 60 % rigtige og ≥ 80 % i top 3.
// Uden sporet springes sammenligningen over. AITAC_DEBUG=1 skriver hver forkert.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { AI_TACTIC_LIST, FAVOURITE_FORMATION, chooseAiTactic, combineScore, estimateQuality, naturalMask, newTacticStats, positionFit,
  recordTacticResult, type ChoiceManager, type ChoicePlayer } from '../src/game/engine/grid/aiTacticChoice';
import { PRESET_TACTICS } from '../src/game/engine/grid/presetTactics';

const RUN = `${homedir()}/cm0102-engine/oracle/runs`;
const TRACE = `${RUN}/trace5.txt`, SAV = `${RUN}/trace4/user/samesave.sav`, FIX = `${RUN}/trace4/user`;
const DEBUG = !!process.env.AITAC_DEBUG;
const HUMAN = 299;                                                     // Arsenal (spillets id)

describe('0x6e0230 – byggesten', () => {
  const pl = (r: number[], q = 100): ChoicePlayer => ({ ratings: r, b30: 0, b3b: 0, quality: q });
  it('listen: 45 poster, de første 17 = PRESET_TACTICS', () => {
    expect(AI_TACTIC_LIST).toHaveLength(45);
    PRESET_TACTICS.forEach((p, i) => {
      expect(AI_TACTIC_LIST[i].preset).toBe(i);
      expect(AI_TACTIC_LIST[i].masks).toEqual(p.masks);
      expect(AI_TACTIC_LIST[i].flags).toBe(p.flags);
    });
    expect(FAVOURITE_FORMATION[3]).toBe(AI_TACTIC_LIST[0].formation); // 4-4-2
  });
  it('naturalMask = 0x5b7d20', () => {
    expect(naturalMask([20, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])).toBe(1);
    expect(naturalMask([1, 1, 12, 1, 1, 1, 1, 1, 15, 1, 1, 1])).toBe(4 | 0x800);
    expect(naturalMask([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 14, 1])).toBe(0);  // sider kun ≥ 15
  });
  it('positionFit / combineScore', () => {
    const gk = pl([20, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    expect(positionFit(gk, 1)).toBe(400 - 300 + 100);                  // GK² − 300, intet sidebit → +100
    expect(positionFit(gk, 0x804)).toBe(-200 + 10 * (1 - 10));          // målmand på markplads
    const rb = pl([1, 1, 20, 1, 1, 1, 1, 15, 20, 1, 1, 1]);
    expect(positionFit(rb, 0x804)).toBe(100 + 100);
    expect(positionFit(rb, 0x808)).toBe(50 + 100);                      // DM bredt = WB (15 → 50)
    expect(combineScore(120, 200)).toBe(24000);
    expect(combineScore(120, -10)).toBe(-3800);
  });
  it('randomPick = rand(45) uden score', () => {
    expect(chooseAiTactic({ players: [], mode: 2, manager: null, randomPick: true, rand: (n) => n - 1 }).index).toBe(44);
  });
  it('recordTacticResult = 0x896290', () => {
    const st = newTacticStats();
    recordTacticResult(st, 11, 5, 3);                                   // målt i gemt spil: (1,0,0, 5,3,3) → 75 / 45 / 5
    expect(st[11].perf.map((x) => +x.toFixed(6))).toEqual([75, 45, 5]);
  });
});

// ------------------------------------------------------------------ mod sporet
function savMembers(path: string): Map<string, Buffer> {
  const b = readFileSync(path), out = new Map<string, Buffer>();
  const ver = b.readInt32LE(0), count = b.readInt32LE(8), packed = ver === 2 || ver === 4;
  const ents: { off: number; size: number; name: string }[] = [];
  for (let k = 0; k < count; k++) {
    const o = 12 + k * 0x10c, nm = b.subarray(o + 8, o + 8 + 260);
    ents.push({ off: b.readInt32LE(o), size: b.readInt32LE(o + 4), name: nm.subarray(0, nm.indexOf(0)).toString('latin1') });
  }
  for (const e of ents) {
    if (!['club.dat', 'nat_club.dat', 'staff.dat', 'nonplayer.dat', 'tactics.dat'].includes(e.name)) continue;
    if (!packed) { out.set(e.name, b.subarray(e.off, e.off + e.size)); continue; }
    const d = Buffer.alloc(e.size);
    for (let i = e.off, n = 0; n < e.size;) { const c = b[i++]; if (c < 0x81) d[n++] = c; else { d.fill(b[i++], n, n + c - 0x80); n += c - 0x80; } }
    out.set(e.name, d);
  }
  return out;
}

describe.skipIf(!existsSync(TRACE) || !existsSync(SAV))('0x6e0230 mod kampsporet', () => {
  it('vælger samme forudindstilling som originalen', () => {
    const S = savMembers(SAV);
    const C = S.get('club.dat')!, NC = S.get('nat_club.dat')!, ST = S.get('staff.dat')!, NP = S.get('nonplayer.dat')!, TD = S.get('tactics.dat')!;
    // blokkene: B (28) står først i filen, A (17) bagefter; listens indeks = A, B
    const BS = 0x18e3, nb = TD.readInt32LE(0), blk: Buffer[] = [];
    for (let i = 0; i < nb; i++) blk.push(TD.subarray(4 + i * BS, 4 + (i + 1) * BS));
    const na = TD.readInt32LE(4 + nb * BS);
    const A: Buffer[] = []; for (let i = 0; i < na; i++) A.push(TD.subarray(8 + (nb + i) * BS, 8 + (nb + i + 1) * BS));
    const list = [...A, ...blk];
    expect(list.map((b) => b.readUInt32LE(0x187b))).toEqual(AI_TACTIC_LIST.map((e) => e.formation >>> 0));
    const t0 = new Map<string, number[]>(), t1 = new Map<string, number[]>();
    list.forEach((b, i) => {
      const k0 = b.subarray(0x5eb, 0x5eb + 2376).toString('hex'), k1 = b.subarray(0xf33, 0xf33 + 2376).toString('hex');
      t0.set(k0, [...(t0.get(k0) ?? []), i]); t1.set(k1, [...(t1.get(k1) ?? []), i]);
    });
    const club = (id: number) => { const [D, o] = id >= 1920 ? [NC, (id - 1920) * 581] : [C, id * 581]; return { rep: D.readInt16LE(o + 128), mgr: D.readInt32LE(o + 207) }; };
    const manager = (sid: number): ChoiceManager | null => {
      if (sid < 0 || sid * 110 >= ST.length) return null;
      const n = ST.readInt32LE(sid * 110 + 0x69); if (n < 0 || n * 68 >= NP.length) return null;
      const r = NP.subarray(n * 68, n * 68 + 68);
      return { attacking: r.readInt8(0xe), offside: r.readInt8(0x1c), pressing: r.readInt8(0x1f), freeRoles: r.readInt8(0x15), marking: r.readInt8(0x1a), favourite: r.readInt8(0x43) };
    };
    // resultater (fixtures_*.tmp: 79-byte poster, hjemme/ude +0xc/+0x10, dag +0x2a, mål +0x43/+0x44, forlænget +0x47/+0x48)
    const fx: { h: number; a: number; day: number; hg: number; ag: number; used?: boolean }[] = [];
    for (const f of ['fixtures_2001.tmp', 'fixtures_2002.tmp']) {
      if (!existsSync(`${FIX}/${f}`)) continue;
      const b = readFileSync(`${FIX}/${f}`), n = b.readInt32LE(0);
      for (let k = 0; k < n && 4 + 79 * (k + 1) <= b.length; k++) {
        const o = 4 + 79 * k; if (b[o + 0x43] === 255) continue;
        const et = b[o + 0x47] < 128;
        fx.push({ h: b.readInt32LE(o + 12), a: b.readInt32LE(o + 16), day: b.readUInt16LE(o + 42), hg: b[o + (et ? 0x47 : 0x43)], ag: b[o + (et ? 0x48 : 0x44)] });
      }
    }
    // sporet
    type Side = { truth: number[]; players: ChoicePlayer[] };
    const M: { cl: [number, number]; mode: number[]; s: [Side, Side] }[] = [];
    let cur: (typeof M)[number] | undefined;
    for (const l of readFileSync(TRACE, 'utf8').split('\n')) {
      if (l.startsWith('M ')) { const [, h, a] = l.split(' ').map(Number); cur = { cl: [h, a], mode: [], s: [{ truth: [], players: [] }, { truth: [], players: [] }] }; M.push(cur); }
      else if (l.startsWith('P ') && cur) { const [, s, h] = l.split(' '); cur.s[+s].truth = (s === '0' ? t0 : t1).get(h) ?? []; }
      else if (l.startsWith('R ') && cur) {
        const f = l.split(' '), p = Buffer.from(f[4], 'hex'), mb = Buffer.from(f[5], 'hex');
        const ratings = Array.from({ length: 12 }, (_, i) => p.readInt8(0xf + i));
        cur.s[+f[1]].players.push({ ratings, b30: p.readInt8(0x30), b3b: p.readInt8(0x3b),
          quality: estimateQuality({ ca: p.readInt16LE(5), rep: p.readInt16LE(0xb), b45: p.readInt8(0x45), condition: Math.trunc(mb.readFloatLE(0x4d)) }) });
      } else if (l.startsWith('T ') && cur && !cur.mode.length && l.includes(' A')) {
        const a = l.split(' A')[1].split(' ')[0].split(','); cur.mode = [+a[0], +a[1]];
      }
    }
    const stats = newTacticStats();
    let ok = 0, tot = 0, top3 = 0;
    for (const m of M) {
      const chosen = [-1, -1];
      for (const s of [0, 1]) {
        if (m.cl[s] === HUMAN) continue;
        const c = club(m.cl[s]), sd = m.s[s];
        const { index, scores } = chooseAiTactic({ players: sd.players, mode: m.mode[s], manager: manager(c.mgr), stats, divisor: Math.max(8 * c.rep, 2000) });
        const hit = sd.truth.includes(index), rank = Math.min(...sd.truth.map((t) => scores.filter((x) => x > scores[t]).length));
        tot++; ok += +hit; top3 += +(rank < 3);
        chosen[s] = hit ? index : sd.truth.reduce((b, t) => (scores[t] > scores[b] ? t : b), sd.truth[0]);
        if (DEBUG && !hit) console.log(m.cl[s], 'mode', m.mode[s], 'valgt', AI_TACTIC_LIST[index].name, 'orig', sd.truth.map((t) => AI_TACTIC_LIST[t].name).join('/'), 'plads', rank);
      }
      const f = fx.find((x) => !x.used && x.h === m.cl[0] && x.a === m.cl[1] && x.day >= 194);
      if (f) f.used = true;
      if (!f || m.cl.includes(HUMAN)) continue;
      recordTacticResult(stats, chosen[0], f.hg, f.ag); recordTacticResult(stats, chosen[1], f.ag, f.hg);
    }
    console.log(`0x6e0230: ${ok}/${tot} rigtige (${(100 * ok / tot).toFixed(1)} %), top 3: ${top3}/${tot}`);
    expect(tot).toBeGreaterThan(150);
    expect(ok / tot).toBeGreaterThanOrEqual(0.6);
    expect(top3 / tot).toBeGreaterThanOrEqual(0.8);
  });
});
