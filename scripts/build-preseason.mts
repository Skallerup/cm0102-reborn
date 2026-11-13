// Forsæsonens data fra originalens filer → src/game/data/cmPreseason.ts
//   npx tsx scripts/build-preseason.mts
// (1) player_setup.cfg (0x7a30c0 → 0x7a3a10, kaldt af 0x5cc850 efter forkørslen med maske 0x203b): linjerne "INJURY" findes i databasen
//     som 0x7a50f0 gør det (klubben på navnet – strncmp 0x33 – og dens trup, ellers hele staff-tabellen ved tom klub; fornavn/kælenavn/
//     efternavn med strncmp 0x1a, et tomt felt sammenlignes ikke) og skadens navn → type som 0x7a32e0 (strncmp med originalens længder).
//     Filen er den i appens Data/ (= Original-3.9.68-Database) – originalen bruger den også med 3.9.60/3.9.65 (Data-3.9.6x har ingen; målt i
//     oraklet fit1: Arsenals fire startskader Pires 26, Kanu 11, Ljungberg 37, Jeffers 13 = filens; Van Bronckhorst er ikke i Arsenal i 3.9.60).
// (2) nation.dat-felterne, venskabskampenes planlægning læser (Friendly 0x5c4680/0x5c4cb0/0x5c5040): +0x86 (i16), +0x84 (u8), +0x7e (u8),
//     +0x8e (i16), +0x75 (u8), +0x71 (verdensdelen) og de tre nabolande +0x110/+0x114/+0x118 (nation-id'er i filen, pegere i hukommelsen).
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = '/Users/martinskallerup/cm0102/.orig-db';
const CFG = `${ROOT}/Original-3.9.68-Database/player_setup.cfg`;
const DBS: Record<string, string> = {
  '3.9.60': `${ROOT}/Original-3.9.60-Database`,
  '3.9.65': `${ROOT}/Original-3.9.65-Database-Swedish_fixed`,
  '3.9.68': `${ROOT}/Original-3.9.68-Database`,
};
const dec = new TextDecoder('windows-1252');
const buf = (f: string) => { const b = readFileSync(f); return new DataView(b.buffer, b.byteOffset, b.byteLength); };
const str = (v: DataView, o: number, n: number) => { const a = new Uint8Array(v.buffer, v.byteOffset + o, n); const e = a.indexOf(0); return dec.decode(a.subarray(0, e < 0 ? n : e)); };

/** 0x7a32e0: skadens navn → type (strncmp(s, navn, n) i originalens rækkefølge; ukendt: "ARTHRITIS" 0x4c, ellers 0x4b) */
const NAMES: [string, number, number][] = [
  ['COLD', 4, 0], ['FLU', 3, 1], ['VIRUS', 5, 2], ['FOOD_POISONING', 10, 3], ['SERIOUS_VIRAL_INFECTION', 10, 4], ['TWISTED_ANKLE', 10, 5],
  ['SPRAINED_ANKLE', 10, 6], ['DAMAGED_FOOT', 10, 7], ['STUBBED_TOE', 10, 8], ['DAMAGED_HEEL', 10, 9], ['BROKEN_TOE', 10, 10],
  ['STRAINED_ANKLE_LIG', 15, 11], ['DAMAGED_ACHILLES_TEN', 15, 12], ['CHEMOTHERAPY', 10, 80], ['TORN_ANKLE_LIG', 10, 13], ['BROKEN_ANKLE', 10, 14],
  ['BROKEN_FOOT', 10, 15], ['BRUISED_SHIN', 10, 16], ['CALF_STRAIN', 10, 17], ['TORN_CALF_MUSCLE', 10, 18], ['GASHED_LEG_1', 10, 19],
  ['SHIN_SPLINTS', 10, 20], ['BROKEN_LEG_1', 10, 21], ['TWISTED_KNEE', 10, 22], ['STRAINED_KNEE_LIG', 10, 23], ['DAMAGED_KNEE_CAP', 10, 24],
  ['DAMAGED_KNEE_CART', 10, 25], ['TORN_KNEE_LIG', 10, 26], ['DAMAGED_CRUCIATE_LIG', 10, 27], ['PULLED_HAMSTRING', 10, 28], ['BRUISED_THIGH', 10, 29],
  ['THIGH_STRAIN', 10, 30], ['TORN_HAMSTRING', 10, 31], ['DEAD_LEG', 10, 32], ['GASHED_LEG_2', 10, 33], ['BROKEN_LEG_2', 10, 34], ['GROIN_STRAIN', 10, 35],
  ['TORN_GROIN_MUSCLE', 10, 36], ['HIP_INJURY', 5, 37], ['BROKEN_PELVIS', 10, 38], ['BRUISED_RIB', 10, 39], ['CHEST_INJURY', 10, 40], ['BACK_STRAIN', 10, 41],
  ['FRACTURED_RIBS', 14, 42], ['BROKEN_RIBS', 10, 43], ['SLIPPED_DISC', 10, 44], ['DAMAGED_SPINE', 10, 45], ['STUBBED_FINGER', 10, 46], ['CUT_HAND', 5, 47],
  ['BROKEN_FINGER', 10, 48], ['BROKEN_HAND', 10, 49], ['SPRAINED_WRIST', 10, 50], ['DAMAGED_ELBOW', 10, 52], ['FRACTURED_WRIST', 15, 53], ['GASHED_ARM', 5, 54],
  ['FRACTURED_ARM', 13, 55], ['BROKEN_WRIST', 10, 56], ['BROKEN_ARM', 10, 57], ['DAMAGED_SHOULDER', 10, 58], ['DISLOCATED_SHOULDER', 10, 59],
  ['BROKEN_SHOULDER', 10, 60], ['STRAINED_NECK', 10, 61], ['DAMAGED_NECK', 10, 62], ['BROKEN_COLLARBONE', 10, 63], ['BRUISED_HEAD', 10, 64],
  ['FACIAL_INJURY', 10, 65], ['GASHED_HEAD', 5, 66], ['BRUISED_JAW', 10, 67], ['CONCUSSION', 5, 68], ['BROKEN_NOSE', 5, 69], ['FRACTURED_JAW', 13, 70],
  ['DISLOCATED_JAW', 10, 71], ['FRACTURED_CHEEKBONE', 19, 72], ['BROKEN_CHEEKBONE', 10, 73], ['BROKEN_JAW', 10, 74],
];
/** C's strncmp: de første n tegn (en kortere streng skal slutte samme sted) */
const strncmpEq = (a: string, b: string, n: number) => a.slice(0, n) === b.slice(0, n);
function injuryType(s: string): number {
  for (const [name, n, k] of NAMES) if (strncmpEq(s, name, n)) return k;
  return strncmpEq(s, 'ARTHRITIS', 8) ? 0x4c : 0x4b;
}

/** cfg-linjen: "TYPE" "First" "Common" "Last" "Club" "Extra" [tal] */
function parseCfg(): { first: string; common: string; last: string; club: string; extra: string; num: number | null }[] {
  const out = [];
  for (const line of dec.decode(readFileSync(CFG)).split(/\r?\n/)) {
    if (!line.startsWith('"INJURY"')) continue;
    const q = line.split('"');
    // [ '', INJURY, ' ', first, ' ', common, ' ', last, ' ', club, ' ', extra, rest ]
    const rest = (q[12] ?? '').trim();
    out.push({ first: q[3], common: q[5], last: q[7], club: q[9], extra: q[11], num: /^-?\d+/.test(rest) ? parseInt(rest, 10) : null });
  }
  return out;
}

function readDb(dir: string) {
  const idx = buf(`${dir}/index.dat`);
  const tables: { name: string; count: number; offset: number }[] = [];
  for (let o = 8; o + 67 <= idx.byteLength; o += 67) tables.push({ name: str(idx, o, 51).trim().toLowerCase(), count: idx.getInt32(o + 55, true), offset: idx.getInt32(o + 59, true) });
  const S = buf(`${dir}/staff.dat`);
  const st = tables.filter((t) => t.name === 'staff.dat' && t.count > 0).sort((a, b) => a.offset - b.offset);
  const size = Math.round((st[1].offset - st[0].offset) / st[0].count);
  const names = (f: string) => { const v = buf(`${dir}/${f}`); const a: string[] = []; for (let o = 0; o + 60 <= v.byteLength; o += 60) a[v.getInt32(o + 51, true)] = str(v, o, 51); return a; };
  const first = names('first_names.dat'), second = names('second_names.dat'), common = names('common_names.dat');
  const staff: { id: number; f: string | null; l: string | null; c: string | null; club: number }[] = [];
  for (let k = 0; k < st[0].count; k++) {
    const o = st[0].offset + k * size;
    const nm = (arr: string[], i: number) => (i >= 0 && arr[i] !== undefined ? arr[i] : null);
    staff.push({ id: S.getInt32(o, true), f: nm(first, S.getInt32(o + 4, true)), l: nm(second, S.getInt32(o + 8, true)), c: nm(common, S.getInt32(o + 12, true)), club: S.getInt32(o + 57, true) });
  }
  const C = buf(`${dir}/club.dat`);
  const clubs: { id: number; name: string }[] = [];
  for (let o = 0; o + 581 <= C.byteLength; o += 581) clubs.push({ id: C.getInt32(o, true), name: str(C, o + 4, 51) });
  const N = buf(`${dir}/nation.dat`);
  const nations: Record<number, number[]> = {};
  for (let o = 0; o + 290 <= N.byteLength; o += 290) nations[N.getInt32(o, true)] = [N.getInt16(o + 0x86, true), N.getUint8(o + 0x84), N.getUint8(o + 0x7e), N.getInt16(o + 0x8e, true), N.getUint8(o + 0x75), N.getInt32(o + 0x71, true), N.getInt32(o + 0x110, true), N.getInt32(o + 0x114, true), N.getInt32(o + 0x118, true)];
  return { staff, clubs, nations };
}

/** 0x7a50f0 (flag 1): navnefelterne mod staff +4 (fornavn), +8 (efternavn), +0xc (kælenavn); et tomt cfg-felt eller et manglende navn sammenlignes ikke */
const nameOk = (s: { f: string | null; l: string | null; c: string | null }, e: { first: string; common: string; last: string }) =>
  (!e.first || s.f === null || strncmpEq(s.f, e.first, 0x1a)) && (!e.last || s.l === null || strncmpEq(s.l, e.last, 0x1a)) && (!e.common || s.c === null || strncmpEq(s.c, e.common, 0x1a));

const cfg = parseCfg();
const out: Record<string, [number, number, number, number][]> = {};
let nationsOut: Record<number, number[]> = {};
for (const [ver, dir] of Object.entries(DBS)) {
  const db = readDb(dir);
  if (ver === '3.9.60') nationsOut = db.nations;
  const players = new Set((JSON.parse(readFileSync(`public/data/${ver === '3.9.60' ? 'world-original' : `world-original-${ver.replace(/\./g, '')}`}.json`, 'utf8')).players as number[][]).map((p) => p[0]));
  const list: [number, number, number, number][] = [];
  let miss = 0;
  for (const e of cfg) {
    let hit: (typeof db.staff)[number] | undefined;
    if (e.club) {
      const club = db.clubs.find((c) => strncmpEq(c.name, e.club, 0x33));
      if (club) hit = db.staff.find((s) => s.club === club.id && nameOk(s, e));                // klubbens trup (+0xd7)
    } else hit = db.staff.find((s) => nameOk(s, e));                                          // hele staff-tabellen
    if (!hit || !players.has(hit.id)) { miss++; continue; }                                    // +0x61 = 0 (ingen spillerpost) / ikke i spillet
    // PERMANENT_<navn> %d → (type, niveau, 0); FUTURE_PERMANENT_<navn> %d → (type, niveau, 1); ellers (type, 0, 0)
    const fut = e.extra.startsWith('FUTURE_PERMANENT_'), perm = !fut && e.extra.includes('PERMANENT_') && e.num !== null;
    const t = injuryType(fut ? e.extra.slice(17) : perm ? e.extra.slice(e.extra.indexOf('PERMANENT_') + 10) : e.extra);
    list.push([hit.id, t, fut || perm ? (e.num ?? 0) : 0, fut ? 1 : 0]);
  }
  out[ver] = list;
  console.log(ver, `${list.length} fundet, ${miss} ikke fundet`);
}
const ts = `// Genereret af scripts/build-preseason.mts – ret ikke i hånden.
// Originalens player_setup.cfg (INJURY-linjerne, appens Data/ – også brugt med 3.9.60/3.9.65) fundet i databasen som 0x7a50f0:
// [spiller-id, skadetype (0x7a32e0), PERMANENT-niveau (0 = ingen), FUTURE (1 = kun tilbagevendende, ingen skade nu)]
export const CM_SETUP_INJURIES: Record<string, readonly (readonly [number, number, number, number])[]> = ${JSON.stringify(out)};
/** nation.dat pr. nation-id: [+0x86, +0x84, +0x7e, +0x8e, +0x75, +0x71 verdensdel, nabolandene +0x110, +0x114, +0x118] (3.9.60) */
export const CM_NATION_FR: Record<number, readonly number[]> = ${JSON.stringify(nationsOut)};
`;
writeFileSync('src/game/data/cmPreseason.ts', ts);
