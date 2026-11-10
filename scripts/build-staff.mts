// Stab (ikke-spillere) fra en CM 01/02 Data-mappe → JSON til SEO-siderne (og senere spillet).
//
// staff.dat: personposten (110 bytes) har klub +57, job +61, år i klubben +64 og ikke-spiller-referencen (fundet som i
// cm0102.ts); ikke-spillerposten (68 bytes) har CA +4, PA +6, omdømme +8/+10/+12 og 21 egenskaber +14..+34 i alfabetisk
// rækkefølge (Attacking … Working with Youngsters; Judging Player Potential +0x18 er bekræftet i Bosman-projektet).
// Mentale egenskaber (Adaptability … Temperament) står i personposten +86..+93 som for spillerne.
//
// Brug: npx tsx scripts/build-staff.mts <Data-mappe> <out.json> [world.json]
// Med en world-fil kommer kun stab i dens klubber med (+ klubløse med CA 100+).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2], out = process.argv[3], worldFile = process.argv[4];
const keepClubs = worldFile ? new Set((JSON.parse(readFileSync(worldFile, 'utf8')) as { clubs: [number][] }).clubs.map((c) => c[0])) : null;
if (!dir || !out) { console.error('brug: build-staff.mts <Data-mappe> <out.json>'); process.exit(1); }
const file = (f: string) => { const n = readdirSync(dir).find((x) => x.toLowerCase() === f)!; const b = readFileSync(join(dir, n)); return new DataView(b.buffer, b.byteOffset, b.byteLength); };
const dec = new TextDecoder('latin1');
const str = (v: DataView, o: number, len: number) => { const u = new Uint8Array(v.buffer, v.byteOffset + o, len); const e = u.indexOf(0); return dec.decode(u.subarray(0, e < 0 ? len : e)).trim(); };

export const STAFF_ATTRS = ['attacking', 'business', 'coaching', 'coachingGk', 'coachingTechnique', 'directness', 'discipline', 'freeRoles', 'interference',
  'judgingAbility', 'judgingPotential', 'manHandling', 'marking', 'motivating', 'offside', 'patience', 'physiotherapy', 'pressing', 'resources', 'tactics', 'youngsters'] as const;
export const MENTAL = ['adaptability', 'ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament'] as const;

const idx = file('index.dat');
const recs: { name: string; count: number; offset: number }[] = [];
for (let o = 8; o + 67 <= idx.byteLength; o += 67) recs.push({ name: str(idx, o, 51), count: idx.getInt32(o + 55, true), offset: idx.getInt32(o + 59, true) });
const S = file('staff.dat');
const T = recs.filter((r) => r.name.toLowerCase() === 'staff.dat' && r.count > 0).sort((a, b) => a.offset - b.offset);
const sizes = T.map((t, i) => Math.round(((T[i + 1]?.offset ?? S.byteLength) - t.offset) / t.count));
const tP = T[0], psz = sizes[0];
const tN = T.find((_, i) => i > 0 && sizes[i] === 68);
const tPl = T.find((_, i) => i > 0 && sizes[i] === 70);
if (!tN || !tPl) throw new Error('staff.dat: ingen ikke-spiller- eller spillertabel');
const nonAt = new Map<number, number>();
for (let k = 0; k < tN.count; k++) nonAt.set(S.getInt32(tN.offset + k * 68, true), tN.offset + k * 68);
const plAt = new Set<number>();
for (let k = 0; k < tPl.count; k++) plAt.add(S.getInt32(tPl.offset + k * 70, true));
// referencerne: det felt i personpostens sidste bytes, der rammer flest forskellige poster
const refOf = (has: (v: number) => boolean, skip = -1) => {
  let best = -1, bestN = 0;
  for (let off = psz - 24; off <= psz - 2; off++) {
    if (off === skip) continue;
    const seen = new Set<number>();
    for (let k = 0; k < Math.min(tP.count, 20000); k++) { const o = tP.offset + k * psz; const v = S.getInt32(o + off, true); if (v !== S.getInt32(o, true) && has(v)) seen.add(v); }
    if (seen.size > bestN) { bestN = seen.size; best = off; }
  }
  return best;
};
const PL_REF = refOf((v) => plAt.has(v));
const NON_REF = refOf((v) => nonAt.has(v), PL_REF);

const names = (f: string) => { const v = file(f); const o2: string[] = []; for (let o = 0; o + 60 <= v.byteLength; o += 60) o2[v.getInt32(o + 51, true)] = str(v, o, 51); return o2; };
const first = names('first_names.dat'), second = names('second_names.dat'), common = names('common_names.dat');
const N = file('nation.dat');
const nation = new Map<number, string>();
for (let o = 0; o + 290 <= N.byteLength; o += 290) nation.set(N.getInt32(o, true), str(N, o + 4, 51));
const C = file('club.dat');
const club = new Map<number, { name: string; nation: number; rep: number }>();
for (let o = 0; o + 581 <= C.byteLength; o += 581) club.set(C.getInt32(o, true), { name: str(C, o + 4, 51), nation: C.getInt32(o + 83, true), rep: C.getInt16(o + 128, true) });

const date = (o: number) => { const day = S.getInt16(o, true), yr = S.getInt16(o + 2, true); return yr > 1900 && yr < 2100 ? new Date(Date.UTC(yr, 0, 1 + day)).toISOString().slice(0, 10) : ''; };
type Row = { id: number; name: string; dob: string; nation: string; cid: number; club: string; clubNation: string; job: number; joined: number; ca: number; pa: number; rep: [number, number, number]; a: number[]; m: number[]; player: boolean };
const rows: Row[] = [];
for (let k = 0; k < tP.count; k++) {
  const o = tP.offset + k * psz;
  const n = nonAt.get(S.getInt32(o + NON_REF, true));
  if (n === undefined) continue;
  const a = STAFF_ATTRS.map((_, i) => S.getUint8(n + 14 + i));
  if (!a.some((x) => x > 0 && x <= 20)) continue;
  const cn = S.getInt32(o + 12, true);
  const nm = cn >= 0 && common[cn] ? common[cn] : `${first[S.getInt32(o + 4, true)] ?? ''} ${second[S.getInt32(o + 8, true)] ?? ''}`.trim();
  if (!nm) continue;
  const cid = S.getInt32(o + 57, true);
  const c = club.get(cid);
  let dob = date(o + 16);
  if (!dob) { const y = S.getInt16(o + 24, true); if (y > 1900 && y < 2100) dob = `${y}-01-01`; }
  rows.push({
    id: S.getInt32(o, true), name: nm, dob, nation: nation.get(S.getInt32(o + 26, true)) ?? '', cid: c ? cid : 0, club: c?.name ?? '', clubNation: c ? nation.get(c.nation) ?? '' : '',
    job: c ? S.getUint8(o + 61) : 0, joined: S.getInt16(o + 64, true), ca: S.getInt16(n + 4, true), pa: S.getInt16(n + 6, true),
    rep: [S.getInt16(n + 8, true), S.getInt16(n + 10, true), S.getInt16(n + 12, true)],
    a: a.map((x) => (x > 20 ? 0 : x)), m: MENTAL.map((_, i) => { const v = S.getInt8(o + 86 + i); return v > 0 && v <= 20 ? v : 0; }),
    player: plAt.has(S.getInt32(o + PL_REF, true)),
  });
}
const kept = keepClubs ? rows.filter((r) => (r.cid && keepClubs.has(r.cid)) || (!r.cid && r.ca >= 100)) : rows;
writeFileSync(out, JSON.stringify({ source: dir.split('/').pop(), attrs: STAFF_ATTRS, mental: MENTAL, staff: kept.map((r) => [r.id, r.name, r.dob, r.nation, r.cid, r.club, r.clubNation, r.job, r.joined, r.ca, r.pa, r.rep, r.a, r.m, r.player ? 1 : 0]) }));
console.log(`${kept.length} af ${rows.length} stabsfolk (ikke-spiller-ref +${NON_REF}, spiller-ref +${PL_REF}) → ${out}`);
