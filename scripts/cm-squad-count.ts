// Antallet af spillere i klubbens trup (club+0xd7, 50 pladser) i originalens hukommelse ved spilstart – det 0x8cd450 tæller (peger ≠ 0 og
// personens id < [0xae2364]) – mod spillets squad() ved spilstart (ægte tilstand, 3.9.60).   npx tsx scripts/cm-squad-count.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';

const om = loadSnap(`${homedir()}/cm0102-engine/work-r3/snap-start/${process.argv[2] ?? 'pre-194-2001'}.bin`);
const base = om.u32(0xae23b4), nStaff = om.s32(0xae2364);
const str = (a: number) => { let s = ''; for (let i = 0; i < 60; i++) { const ch = om.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const names = process.argv[3] ? process.argv[3].split(',') : ['Man Utd', 'Arsenal', 'Liverpool', 'Bolton'];
// find klubben i hukommelsen: prøv strengpegere på forskellige offsets
for (const nm of names) {
  const mine = Object.values(g.clubs).find((c) => c.name === nm || c.short === nm);
  let id = -1, off = 4;
  for (let i = 0; i < 3000 && id < 0; i++) if (str(base + 0x245 * i + 4) === nm) id = i;
  const cnt = (c: number) => { let n = 0, all = 0; for (let k = 0; k < 50; k++) { const p = om.u32(c + 0xd7 + 4 * k); if (p) { all++; if (om.s32(p) < nStaff) n++; } } return [n, all]; };
  const orig = id >= 0 ? cnt(base + 0x245 * id) : [-1, -1];
  const sq = mine ? squad(mine.id) : [];
  console.log(nm, 'orig id', id, 'navn@', off.toString(16), 'tæller/ikke-null', orig, '| vores squad()', sq.length, 'reserves', sq.filter((p) => p.reserves).length, 'udlejet-ind', sq.filter((p) => p.loan).length);
}

// Hvor står de angivne spillere (efternavne i argument 4) i originalen? (kontraktens klub/type)
if (process.argv[4]) {
  const want = process.argv[4].split(',');
  const K = om.u32(om.u32(0xae1050)), rows = om.u32(0xae2d0c), sa = om.u32(0xae23bc);
  for (let id = 0; id < nStaff; id++) {
    const st = sa + 0x6e * id;
    const last = str(om.u32(st + 8));
    if (!want.includes(last)) continue;
    const ix = om.s32(rows + 79 * id), k = ix >= 0 ? K + 80 * ix : 0;
    const cl = k ? om.s32(k + 4) : -1;
    console.log(last, str(om.u32(st + 4)), 'dob', om.s16(st + 0x10), om.u16(st + 0x12), 'kontrakt-klub', cl >= 0 ? str(base + 0x245 * cl + 4) : '-', 'type', k ? om.u8(k + 0x35) & 0x3f : -1, '+0x3d', om.u8(st + 0x3d));
  }
}

// Forskellen pr. klub: spillere i originalens liste, som spillet ikke har i truppen, og omvendt (efternavn + fødselsdato)
const staffA = om.u32(0xae23bc);
const isoDay = (iso: string) => { const y = +iso.slice(0, 4); return `${Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000)}|${y}`; };
for (const nm of names) {
  const mine = Object.values(g.clubs).find((c) => c.name === nm); if (!mine) continue;
  let id = -1; for (let i = 0; i < 3000 && id < 0; i++) if (str(base + 0x245 * i + 4) === nm) id = i;
  const c = base + 0x245 * id;
  const keys = new Map<string, string>();
  for (let k = 0; k < 50; k++) { const p = om.u32(c + 0xd7 + 4 * k); if (!p) continue; const st = staffA + 0x6e * om.s32(p); keys.set(str(om.u32(st + 8)) + '|' + om.s16(st + 0x10) + '|' + om.u16(st + 0x12), str(om.u32(st + 4)) + ' ' + str(om.u32(st + 8))); }
  const ours = squad(mine.id);
  const ok = new Set(ours.map((p) => `${p.last}|${isoDay(p.dob)}`));
  console.log(nm, 'kun i originalen:', [...keys].filter(([k]) => !ok.has(k)).map(([, v]) => v), '| kun hos os:', ours.filter((p) => !keys.has(`${p.last}|${isoDay(p.dob)}`)).map((p) => `${p.last} ${p.dob} (res ${!!p.reserves}, CA ${p.ca ?? ''}, kontrakt ${p.contract?.expires})`));
}
