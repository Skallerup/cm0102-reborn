// Originalens værdiformel (sub_4d0c60, Bosman-projektets player_gen.rs player_value) mod de værdier, originalen viser
// (scripts/data/original-values-3960.json – 3.283 spillere aflæst i Player Search). Sammenligner med vores tilpassede
// formel (originalValue.ts). Kør: npx tsx scripts/value-eval.ts [.orig-db/Original-3.9.60-Database-Swedish_fixed]
import { readFileSync } from 'node:fs';
import { originalValueGbp } from '../src/game/originalValue';

const dir = (process.argv[2] ?? '.orig-db/Original-3.9.60-Database-Swedish_fixed') + '/';
const buf = (f: string) => { const b = readFileSync(dir + f); return new DataView(b.buffer, b.byteOffset, b.byteLength); };
const bytes = (f: string) => readFileSync(dir + f);
const idx = buf('index.dat');
const staffTabs: { count: number; offset: number; size: number }[] = [];
for (let o = 8; o + 67 <= idx.byteLength; o += 67) {
  const nm = Buffer.from(idx.buffer, idx.byteOffset + o, 51).toString('latin1').split('\0')[0].toLowerCase();
  if (nm === 'staff.dat' && idx.getInt32(o + 55, true) > 0) staffTabs.push({ count: idx.getInt32(o + 55, true), offset: idx.getInt32(o + 59, true), size: 0 });
}
staffTabs.sort((a, b) => a.offset - b.offset);
const staffLen = readFileSync(dir + 'staff.dat').length;
staffTabs.forEach((t, i) => { t.size = Math.round(((staffTabs[i + 1]?.offset ?? staffLen) - t.offset) / t.count); });
const S = buf('staff.dat');
const str = (b: Buffer, o: number, n: number) => { const s = b.subarray(o, o + n); const z = s.indexOf(0); return s.subarray(0, z < 0 ? n : z).toString('latin1').trim(); };

// navne (first/second/common_names.dat: 60-byte poster? – samme format som vores parser: navn 51 + id)
function names(f: string): Map<number, string> {
  const b = bytes(f); const m = new Map<number, string>();
  for (let o = 0; o + 60 <= b.length; o += 60) m.set(b.readInt32LE(o + 51), str(b, o, 51));
  return m;
}
const first = names('first_names.dat'), second = names('second_names.dat'), common = names('common_names.dat');

// nationer (290 bytes): 0x7e økonomisk niveau, 0x8e omdømme (i16)
const NB = bytes('nation.dat'); const nation = new Map<number, { name: string; tier: number; rep: number }>();
for (let o = 0; o + 290 <= NB.length; o += 290) nation.set(NB.readInt32LE(o), { name: str(NB, o + 4, 51), tier: NB[o + 0x7e], rep: NB.readInt16LE(o + 0x8e) });
// turneringer (107): omdømme 105
const CB = bytes('club_comp.dat'); const comp = new Map<number, number>();
for (let o = 0; o + 107 <= CB.length; o += 107) comp.set(CB.readInt32LE(o), CB.readInt16LE(o + 105));
// klubber (581)
const KB = bytes('club.dat'); const club = new Map<number, { name: string; short: string; nation: number; division: number; rep: number; status: number; manager: number }>();
for (let o = 0; o + 581 <= KB.length; o += 581) club.set(KB.readInt32LE(o), { name: str(KB, o + 4, 51), short: str(KB, o + 56, 26), nation: KB.readInt32LE(o + 83), division: KB.readInt32LE(o + 87), rep: KB.readInt16LE(o + 128), status: KB[o + 100], manager: KB.readInt32LE(o + 207) });

const tStaff = staffTabs[0], tPl = staffTabs.find((t) => t.size === 70)!, tNp = staffTabs.find((t) => t.size === 68)!;
// referencerne fra personposten: spiller = felt med flest distinkte spiller-id'er (som vores parser); ikke-spiller = felt
// med flest distinkte gyldige indeks i ikke-spillertabellen (ikke postens eget id)
function bestRef(test: (v: number, own: number) => boolean, skipOff = -1): number {
  let best = -1, bestN = 0;
  for (let off = 40; off <= tStaff.size - 4; off++) {
    if (off === skipOff) continue;
    const seen = new Set<number>();
    for (let k = 0; k < Math.min(tStaff.count, 30000); k++) { const o = tStaff.offset + k * tStaff.size; const v = S.getInt32(o + off, true); if (test(v, S.getInt32(o, true))) seen.add(v); }
    if (seen.size > bestN) { bestN = seen.size; best = off; }
  }
  return best;
}
const SZ = tStaff.size;
const plIds = new Set<number>(); for (let k = 0; k < tPl.count; k++) plIds.add(S.getInt32(tPl.offset + k * 70, true));
const PL_REF = bestRef((v, own) => v !== own && plIds.has(v));
const npIdx = new Map<number, number>(); for (let k = 0; k < tNp.count; k++) npIdx.set(S.getInt32(tNp.offset + k * 68, true), k);
const NP_REF = bestRef((v, own) => v !== own && npIdx.has(v), PL_REF);
console.error('refs: spiller', PL_REF, 'ikke-spiller', NP_REF); console.error('staff-post', SZ, 'bytes; tabeller', staffTabs.map((t) => t.size).join('/'));
interface St { id: number; name: string; last: string; yob: number; nation: number; caps: number; club: number; pl: number; np: number; wage: number }
const staff = new Map<number, St>();
for (let i = 0; i < tStaff.count; i++) {
  const o = tStaff.offset + i * SZ;
  const id = S.getInt32(o, true);
  const cn = S.getInt32(o + 12, true);
  const f = first.get(S.getInt32(o + 4, true)) ?? '', l = second.get(S.getInt32(o + 8, true)) ?? '';
  const name = cn >= 0 && common.get(cn) ? common.get(cn)! : `${f} ${l}`.trim();
  const yr = S.getInt16(o + 18, true);
  staff.set(id, { id, name, last: cn >= 0 && common.get(cn) ? common.get(cn)! : l, yob: yr > 1900 ? yr : S.getInt16(o + 24, true), nation: S.getInt32(o + 26, true), caps: S.getUint8(o + 34), club: S.getInt32(o + 57, true), pl: S.getInt32(o + PL_REF, true), np: S.getInt32(o + NP_REF, true), wage: S.getInt32(o + 78, true) });
}
const plAt = (i: number) => tPl.offset + i * 70;
const npAt = (id: number) => tNp.offset + (npIdx.get(id) ?? 0) * 68;
// spillerposten: id 0, CA 5, PA 7, omdømme 9/11/13, positioner 15.., egenskaber 27.. (DB-rækkefølge, alfabetisk)
const plIndex = new Map<number, number>();
for (let i = 0; i < tPl.count; i++) plIndex.set(S.getInt32(plAt(i), true), i);
const DBA = ['Acceleration', 'Aggression', 'Agility', 'Anticipation', 'Balance', 'Bravery', 'Consistency', 'Corners', 'Crossing', 'Decisions', 'Dirtiness', 'Dribbling', 'Finishing', 'Flair', 'FreeKicks', 'Handling', 'Heading', 'ImportantMatches', 'InjuryProneness', 'Jumping', 'Leadership', 'LeftFoot', 'LongShots', 'Marking', 'Movement', 'NaturalFitness', 'OneOnOnes', 'Pace', 'Passing', 'Penalties', 'Positioning', 'Reflexes', 'RightFoot', 'Stamina', 'Strength', 'Tackling', 'Teamwork', 'Technique', 'ThrowIns', 'Versatility', 'Vision', 'WorkRate'];
const at = (o: number, k: string) => S.getUint8(o + 27 + DBA.indexOf(k));

const display = (X: number) => { const t = X * 0.05 + 10; let v = (t * t * 0.1 + t) / 3 + 0.5; if (v <= 1) v = 1; else if (v >= 20) v = 20; return Math.trunc(v); };
const AGE = [10, 15, 20, 35, 50, 70, 80, 90, 95, 100, 100, 98, 96, 92, 88, 84, 79, 75, 70, 65]; // 0x9a7f30
const rem = (a: number, b: number) => ((a % b) + b) % b;

/** sub_4d0c60 som player_gen.rs; `mode` styrer de usikre dele */
function value(s: St, mode: { repScale: number; attrMissing: number; portugal?: boolean }): number | null {
  const pi = plIndex.get(s.pl); if (pi === undefined) return null;
  const o = plAt(pi);
  const ca = S.getInt16(o + 5, true), pa0 = S.getInt16(o + 7, true);
  if (pa0 <= 0) return null; // tilfældig PA: rulles i spillet – udelades
  const pa = Math.max(pa0, ca);
  const [home, cur, world] = [S.getInt16(o + 9, true), S.getInt16(o + 11, true), S.getInt16(o + 13, true)].map((r) => r * mode.repScale);
  const pos = Array.from({ length: 12 }, (_, k) => S.getUint8(o + 15 + k)); // GK SW D DM M AM F WB R L C Free
  const age = 2001 - s.yob - 0; // ved 14/7-2001 (fødselsdag ignoreres – *estimeret*)
  const a = (k: string) => { const v = at(o, k); return v >= 1 && v <= 20 ? v : mode.attrMissing; };
  let base: number, peak: number;
  if (pos[6] >= 15) { base = 13e6; peak = 28; } else if (pos[5] >= 15) { base = 11e6; peak = 29; } else if (pos[4] >= 15) { base = 10e6; peak = 29; }
  else if (pos[3] >= 15) { base = 9e6; peak = 29; } else if (pos[0] === 20) { base = 6e6; peak = 33; } else { base = 8e6; peak = 29; }
  const d = peak - age;
  let x = d; if (x > 5) x = 8 - 0.5 * x;
  let m = 1 + x * Math.abs(Math.trunc(x)) / 36;
  if (pos[0] < 15) m *= (1 + (a('Flair') - 15) * 0.0133333) * (1 + a('Finishing') * 0.005) * (1 + (a('Vision') - 15) * 0.00333333) * (1 + (a('Pace') - 15) * 0.0133333) * (1 + (a('Leadership') - 15) * 0.0133333);
  m *= 1.33 - a('InjuryProneness') ** 2 * 0.0017;
  m = m < 0.01 ? 0.01 : Math.min(m, Math.max(1.1, home / 3000 + 0.17));
  const c = club.get(s.club);
  if (!c) return null;
  const mgr = c.manager >= 0 ? staff.get(c.manager) : undefined;
  const rep = mgr ? cur : world;
  const seed = rem(s.id + c.manager * 0 + s.club, 2147483647);
  let judge = 1;
  if (mgr && npIdx.has(mgr.np)) {
    const no = npAt(mgr.np);
    const npCa = S.getInt16(no + 4, true), jp = S.getUint8(no + 0x18);
    const rating = display(npCa + 2 * Math.trunc(Math.max(-200, Math.min(200, 10 * jp - npCa)) / 2));
    const f = (seed % 101) * 0.01;
    judge = seed % 10 === 0 ? Math.trunc(f * 20 + 0.5) : Math.min(20, Math.trunc(rating * f + 0.5));
  }
  judge = Math.max(1, judge);
  let r = Math.trunc(rep / 100); const over = age - (pos[0] === 20 ? 26 : 23); if (over > 0) r -= over * over;
  const span = Math.max(1, 2 * (21 - judge)); const noise = rem(seed, span) + judge - 21; const w = Math.trunc(judge / 2) + 10;
  const j = Math.trunc(((pa + noise) * w + (20 - w) * r) / 20);
  let ab = Math.max(1, Math.min(12000, Math.trunc((50 * Math.max(0, j) + rep + Math.min(rep, 5000) * m) / 3)));
  if (world > 5000 && age < peak + 4) { ab = Math.max(ab, Math.trunc(ab / 2) + world - 2500); if (world > 8000 && age <= peak) ab = Math.trunc(Math.max(ab, world * 2.25 + Math.trunc(ab / 2) - 12500)); }
  let val = ab * ab * base * 1e-8;
  const n = nation.get(c.nation);
  let eff = age;
  if (s.caps > 0) eff += Math.max(0, Math.min(d < 0 ? 0 : d, Math.trunc((n?.rep ?? 0) * s.caps / 18)));
  val *= AGE[Math.max(0, Math.min(19, peak - eff + 10))] * 0.01;
  const tier = n && n.tier >= 1 && n.tier <= 3 ? n.tier : 3;
  let f = (tier + 1) * 0.5; if (c.status === 2) f *= 2; else if (c.status === 3) f *= 7.5;
  const X = comp.get(c.division) ?? 1;
  const cf = (25 * X * X + c.rep) / (f * 1000);
  val *= Math.max(0.1, Math.min(1.1, 1 - 0.004 * (20 - cf) ** 2));
  if (65000 * cf * cf < val) val = val / 4 + 32500 * cf * cf;
  val = Math.max(val, 5000 * cf * cf);
  // flag = 1 og klubbens land = [0x9cf434] (0x4d12e3) – landet er *gættet* som Portugal (Bosman: identical/5 §9)
  if (mode.portugal && n?.name === 'Portugal') val = val < 6e6 ? Math.max(5000, val * (val * 1e-7 + 0.3)) : val * 0.9;
  return Math.trunc(val);
}

// de målte spillere: "Efternavn, Fornavn" + klub (kort navn)
const meas = (JSON.parse(readFileSync('scripts/data/original-values-3960.json', 'utf8')) as { players: { name: string; club: string; value: number }[] }).players;
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const byLast = new Map<string, St[]>();
for (const s of staff.values()) if (s.pl >= 0) { const k = norm(s.last); byLast.set(k, [...(byLast.get(k) ?? []), s]); }
const rows: { m: number; orig: number | null; fit: number }[] = [];
let unmatched = 0;
for (const mp of meas) {
  const [l, f] = mp.name.split(',').map((x) => x.trim());
  const cands = (byLast.get(norm(l)) ?? []).filter((s) => { const c = club.get(s.club); return c && (norm(c.short).includes(norm(mp.club)) || norm(c.name).includes(norm(mp.club)) || norm(mp.club).includes(norm(c.short))); }).filter((s) => !f || norm(s.name).includes(norm(f).split(' ')[0]));
  if (cands.length !== 1) { unmatched++; continue; }
  const s = cands[0];
  const o = plAt(plIndex.get(s.pl)!);
  const c = club.get(s.club)!;
  const ca = S.getInt16(o + 5, true);
  const repT: [number, number, number] = [S.getInt16(o + 9, true), S.getInt16(o + 11, true), S.getInt16(o + 13, true)];
  const n = nation.get(c.nation);
  // vores formel: liga = landets 1. række (approksimation – tier ukendt her)
  const fit = originalValueGbp(ca, 2001 - s.yob, Math.round(Math.max(3, Math.min(98, Math.pow(c.rep / 10000, 0.7) * 98))), s.wage, n?.name, 1, repT);
  rows.push({ m: mp.value, orig: value(s, { repScale: 50, attrMissing: 10, portugal: !!process.env.PT }), fit });
}
const stats = (k: 'orig' | 'fit') => {
  const ls = rows.filter((r) => r[k] && r.m > 0).map((r) => Math.log(r.m / (r[k] as number)));
  const mean = ls.reduce((s, x) => s + x, 0) / ls.length;
  const rms = Math.sqrt(ls.reduce((s, x) => s + x * x, 0) / ls.length);
  const within = (f: number) => (100 * ls.filter((x) => Math.abs(x) <= Math.log(f)).length / ls.length).toFixed(1);
  return `${k}: n ${ls.length} · log-rms ${rms.toFixed(3)} · bias ×${Math.exp(mean).toFixed(2)} · inden for ×1,25 ${within(1.25)} % · ×1,5 ${within(1.5)} % · ×2 ${within(2)} %`;
};
console.log(`matchet ${rows.length} af ${meas.length} (umatchet ${unmatched})`);
console.log(stats('orig'));
console.log(stats('fit'));
if (process.env.WORST) {
  // de største afvigelser og afvigelsen pr. liga-land
  const det: { name: string; club: string; nat: string; m: number; o: number; r: number }[] = [];
  for (const mp of meas) {
    const [l, f] = mp.name.split(',').map((x) => x.trim());
    const cands = (byLast.get(norm(l)) ?? []).filter((s) => { const c = club.get(s.club); return c && (norm(c.short).includes(norm(mp.club)) || norm(c.name).includes(norm(mp.club)) || norm(mp.club).includes(norm(c.short))); }).filter((s) => !f || norm(s.name).includes(norm(f).split(' ')[0]));
    if (cands.length !== 1) continue;
    const v = value(cands[0], { repScale: 50, attrMissing: 10 });
    if (!v) continue;
    const c = club.get(cands[0].club)!;
    det.push({ name: mp.name, club: mp.club, nat: nation.get(c.nation)?.name ?? '?', m: mp.value, o: v, r: Math.log(mp.value / v) });
  }
  const byNat = new Map<string, number[]>();
  for (const d of det) byNat.set(d.nat, [...(byNat.get(d.nat) ?? []), d.r]);
  console.log([...byNat].filter(([, v]) => v.length >= 25).map(([k, v]) => `${k} n${v.length} ×${Math.exp(v.reduce((s, x) => s + x, 0) / v.length).toFixed(2)}`).join(' · '));
  const bad = det.filter((d) => Math.abs(d.r) > Math.log(2));
  const grp = new Map<string, number>();
  for (const d of bad) { const k = `${d.nat} ${d.r > 0 ? 'orig højere' : 'orig lavere'}`; grp.set(k, (grp.get(k) ?? 0) + 1); }
  console.log('×2+:', bad.length, [...grp].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${v}`).join(' · '));
  console.log(det.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 12).map((d) => `${d.name} (${d.club}) målt ${d.m} formel ${d.o}`).join('\n'));
}
