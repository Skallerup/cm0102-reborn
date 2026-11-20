// UEFA Cup'ens deltagere pr. land ved spilstart (assign_uefa_cup_places 0x904580 + UefaCup::build_entrants 0x902b90): 1. runde/kvalifikation pr. land,
// på 2001 sammenlignet med oraklets dagsbillede 14/7-01 (klubbernes +0x1db/+0x1df, scripts/oracle-euro-entrants.ts).
//   WORLD=<world-dbs2.json> npx tsx scripts/cm-uefa-entrants.ts            (2001 mod oraklet, Arsenal, frø 1)
//   DB=2026 npx tsx scripts/cm-uefa-entrants.ts [klub=Brentford] [lande=England,Denmark]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { loadDaySnap, readDaySnapIndex } from './oracle-days';

const modern = process.env.DB === '2026';
const w = JSON.parse(readFileSync(modern ? 'public/data/world.json' : process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
if (modern) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const name = process.argv[2] ?? (modern ? 'Brentford' : 'Arsenal');
const lands = (process.argv[3] ?? (modern ? 'England,Denmark' : 'England')).split(',');
const nat = lands.map((n) => w.nations.findIndex((x) => x.name === n));
const club = w.clubs.find((c) => c[1] === name || c[2] === name)![0] as number;
createGame(w, { managerName: 'Test Smoke', managerNation: nat[0], clubId: club, activeNations: nat, lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
const g = gs();
const u = g.comps.UEFA;
const entry = (u?.meta?.entry ?? {}) as Record<string, number[]>;
const ours = new Map<string, [number, number, string[]]>();
for (const [k, ids] of [['R1', entry.R1 ?? []], ['Q', entry.Q ?? []]] as const) {
  for (const c of ids) {
    const n = g.nations[g.clubs[c]?.nation ?? -1]?.name ?? '?';
    const v = ours.get(n) ?? [0, 0, []];
    v[k === 'R1' ? 0 : 1]++; v[2].push(`${g.clubs[c].name}(${k})`);
    ours.set(n, v);
  }
}
const theirs = new Map<string, [number, number, string[]]>();
if (!modern) {
  const ix = readDaySnapIndex();
  if (ix) {
    const m = loadDaySnap(ix, ix.snaps[0]);
    const str = (a: number, n = 51) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
    const C = m.u32(0xae23b4), N = m.u32(0xae235c), id = m.u32(0x9cf6f0);
    // 0x902dbf: koden faldende, omdømmet stigende; kvalifikationen = de 82 første, 1. runde resten
    const all: { n: string; c: string; code: number; rep: number }[] = [];
    for (let i = 0; i < N; i++) {
      const a = C + 0x245 * i;
      if (m.u32(a + 0x1db) !== id) continue;
      all.push({ n: str(m.u32(a + 0x53) + 4), c: str(a + 4), code: m.u8(a + 0x1df), rep: m.u16(a + 0x80) });
    }
    all.sort((a, b) => b.code - a.code || a.rep - b.rep);
    all.forEach((x, i) => {
      const k = i < 82 ? 'Q' : 'R1';
      const v = theirs.get(x.n) ?? [0, 0, []];
      v[k === 'R1' ? 0 : 1]++; v[2].push(`${x.c}(${k})`);
      theirs.set(x.n, v);
    });
  }
}
const tot = (mp: Map<string, [number, number, string[]]>) => [...mp.values()].reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
const [r1, q] = tot(ours);
console.log(`UEFA Cup ${modern ? '2026/27' : '2001/02'}: vores ${r1 + q} (1. runde ${r1}, kval. ${q})${theirs.size ? ` · oraklet ${tot(theirs).join('/')}` : ''}`);
let diff = 0;
for (const n of [...new Set([...ours.keys(), ...theirs.keys()])].sort()) {
  const a = ours.get(n) ?? [0, 0, []], b = theirs.get(n);
  const same = b && a[0] === b[0] && a[1] === b[1];
  if (b && !same) diff++;
  console.log(`${b ? (same ? '  ' : '≠ ') : ''}${n}\tR1 ${a[0]} Q ${a[1]}${b ? `\t| orakel R1 ${b[0]} Q ${b[1]}` : ''}\t${a[2].join(', ')}${b && !same ? `\t| ${b[2].join(', ')}` : ''}`);
}
if (theirs.size) console.log(`lande med andet antal end oraklet: ${diff}`);
