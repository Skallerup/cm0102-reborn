// Tilskuertallet sub_85cba0 (src/game/engine/grid/crowd.ts) mod oraklets spor (match_trace.c RECOMP_CROWD_TRACE: K-linjen = indgangene,
// Kr = originalens tilfældige tal inde i funktionen, KO = resultatet + tabelrækken 0x4a4850). Porten får sporets indgange og tal og skal give
// samme i alt/hjemme/ude og samme kapacitet bagefter.
//   npx tsx scripts/crowd-check.ts [spor = ~/cm0102-engine/oracle/runs/crowd1.txt] [byer = .orig-db/Original-3.9.60-Database/city.dat]
import { createReadStream, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { crowd85cba0, type CrowdCity, type CrowdClub, type CrowdFixture, type CrowdRow, type CrowdStadium } from '../src/game/engine/grid/crowd';

export interface CrowdCase { F: CrowdFixture; rands: [number, number, number][]; out: number[]; row: CrowdRow | null; head: string }
/** én K/Kr/KO-gruppe → indgangene (cityOf: byens post pr. id – samme objekt pr. id, originalen sammenligner pegere) */
export function parseCase(k: string, rs: string[], ko: string, cityOf: (id: number) => CrowdCity | null): CrowdCase {
  const [pre, compS, hS, aS, sS] = k.split(' | ');
  const fx = Buffer.from(pre.split(' ')[3], 'hex');
  const c = compS.split(' ').map(Number);
  const stad = (id: number, city: number, cap: number): CrowdStadium | null => (id < 0 ? null : { id, city: cityOf(city), cap });
  const club = (s: string): CrowdClub => {
    const f = s.split(' ').slice(1).map(Number);
    const [id, nat, n7e, dv, dvrep, st, city, cap, b6d, avg, min, max, rep, r1, r2, r3] = f;
    return { id, nation: nat, nation7e: n7e, league: dv < 0 ? null : { id: dv, rep: dvrep }, stadium: stad(st, city, cap), b6d, avg, min, max, rep, rivals: [r1, r2, r3].filter((x) => x >= 0) };
  };
  const s = sS.split(' ').map(Number);
  const H = club(hS), A = club(aS);
  const fs = stad(s[1], s[2], s[3]);
  // samme stadionpost: klubbernes og fixturens stadion er ét objekt i originalen (kapaciteten skrives tilbage)
  if (fs && H.stadium?.id === fs.id) H.stadium = fs;
  if (fs && A.stadium?.id === fs.id) A.stadium = fs;
  // samme by = samme post (pegersammenligning i originalen)
  const F: CrowdFixture = {
    comp: c[0] < 0 ? null : { id: c[0], rep: c[1], table: c[2] < 0 ? null : { b3c: c[2], b43: c[3], rows: c[4] === 1 }, bias5c: c[5] === 1, odd7e: c[6] === 1 },
    stadium: fs, home: H, away: A,
    w30: fx.readUInt16LE(0x30), w32: fx.readUInt16LE(0x32), b34: fx[0x34], b3a: fx[0x3a], b3b: fx[0x3b], b3c: fx[0x3c],
  };
  const o = ko.split(' ');
  const rowHex = o[5];
  const R = rowHex && rowHex !== "-" && rowHex.length >= 2 * 0x76 ? Buffer.from(rowHex, "hex") : null;
  const row: CrowdRow | null = R ? { b4: R[4], c19: R.readInt32LE(0x19), c2d: R.readInt32LE(0x2d), c41: R.readInt32LE(0x41), c55: R.readInt32LE(0x55), b72: R[0x72], b73: R[0x73], b74: R[0x74], b75: R[0x75] } : null;
  return { F, rands: rs.map((l) => { const f = l.split(' '); return [+f[1], parseInt(f[2], 16), +f[4]]; }), out: o.slice(1, 5).map(Number), row, head: pre.split(' ').slice(0, 3).join(' ') + ' ' + compS };
}

if (process.argv[1]?.endsWith('crowd-check.ts')) {
  const file = process.argv[2] ?? `${process.env.HOME}/cm0102-engine/oracle/runs/crowd1.txt`;
  const cityFile = process.argv[3] ?? '.orig-db/Original-3.9.60-Database/city.dat';
  const cd = readFileSync(cityFile);
  const cities: CrowdCity[] = [];
  for (let o = 0, i = 0; o + 56 <= cd.length; o += 56, i++) cities.push({ id: cd.readInt32LE(o), c23: cd.readDoubleLE(o + 0x23), c2b: cd.readDoubleLE(o + 0x2b) });
  const cityOf = (id: number) => (id < 0 ? null : cities[id] ?? null);
  const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  let k = '', rs: string[] = [], n = 0, bad = 0, randBad = 0;
  const ex: string[] = [];
  const kinds = new Map<string, [number, number]>();
  for await (const l of rl) {
    if (l.startsWith('K ')) { k = l; rs = []; continue; }
    if (l.startsWith('Kr ')) { rs.push(l); continue; }
    if (!l.startsWith('KO ') || !k) continue;
    const cs = parseCase(k, rs, l, cityOf);
    let ri = 0, rbad = '';
    const res = crowd85cba0(cs.F, { cities: cities.length, cityAt: (i) => cities[i], row: () => cs.row,
      rand: (m) => { const e = cs.rands[ri++]; if (!e) { rbad = `ekstra rand(${m})`; return 0; } if (e[0] !== m) rbad = `rand(${m}) ≠ rand(${e[0]})@${e[1].toString(16)}`; return e[2]; } });
    if (ri !== cs.rands.length && !rbad) rbad = `brugte ${ri} af ${cs.rands.length} tal`;
    const got = [res.total, res.home, res.away, cs.F.stadium ? cs.F.stadium.cap : -1];
    const ok = got.join() === cs.out.join() && !rbad;
    const key = `3a=${cs.F.b3a} comp=${cs.F.comp?.id ?? -1}`;
    const t = kinds.get(key) ?? [0, 0]; t[0]++; if (!ok) t[1]++; kinds.set(key, t);
    n++; if (!ok) { bad++; if (rbad) randBad++; if (ex.length < 12) ex.push(`${cs.head}: orig ${cs.out.join(',')} port ${got.join(',')} ${rbad}`); }
    k = '';
  }
  console.log(`${n} kald, ${n - bad} ens (${bad} afviger, heraf ${randBad} i de tilfældige tal)`);
  for (const [kk, [a, b]] of [...kinds].sort((x, y) => y[1][0] - x[1][0]).slice(0, 25)) console.log(`  ${kk}: ${a - b}/${a}`);
  if (ex.length) console.log(ex.join('\n'));
}
