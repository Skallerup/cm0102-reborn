// Oraklet: spillere, der stopper og bliver stab (PLAYER_REGEN 0x7a59e0 0x7a62c2: pr +0x61 → 0, np +0x69 bliver) i sæson 1 – dagsbilleder
// (s1-3.9.60-e1). Kørsel: [STEP=7] [LIST=1] npx tsx scripts/oracle-retire-staff.ts
import { readDaySnapIndex, loadDaySnap } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const ix = readDaySnapIndex()!;
const step = Number(process.env.STEP ?? 7);
const snaps = ix.snaps.filter((_, i) => i % step === 0 || i === ix.snaps.length - 1);
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
type P = { name: string; pr: boolean; np: boolean; club: number; job: number; age: number };
const read = (m: SparseMem) => {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), out = new Map<number, P>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id;
    const name = `${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}`;
    out.set(id, { name, pr: !!m.u32(st + 0x61), np: !!m.u32(st + 0x69), club: m.u32(st + 0x39), job: m.s8(st + 0x3d), age: m.s8(st + 0x18) });
  }
  return { out, m };
};
let prev = read(loadDaySnap(ix, snaps[0]));
let npStart = 0;
for (const p of prev.out.values()) if (p.pr && p.np) npStart++;
console.log('start', snaps[0].iso, 'personer', prev.out.size, 'spillere med ikke-spillerpost', npStart, 'pool', prev.m.s32(prev.m.u32(0xb7434c) + 0x20));
let total = 0, npGain = 0;
const jobs: Record<string, number> = {};
for (const e of snaps.slice(1)) {
  const cur = read(loadDaySnap(ix, e));
  for (const [id, p] of cur.out) {
    const q = prev.out.get(id);
    if (!q || q.name !== p.name) continue;
    if (q.pr && !q.np && p.pr && p.np) { npGain++; if (process.env.LIST) console.log(e.iso, id, p.name, 'alder', p.age, 'fik ikke-spillerpost'); }
    if (q.pr && !p.pr && p.np) {
      total++;
      const k = `${q.np ? 'np før' : 'np ny'} job ${q.job}→${p.job} ${p.club ? 'klub' : 'klubløs'}`;
      jobs[k] = (jobs[k] ?? 0) + 1;
      if (process.env.LIST) console.log(e.iso, id, p.name, 'alder', p.age, k, p.club ? str(cur.m, p.club + 4) : '');
    }
  }
  console.log(e.iso, 'blev stab i alt', total, 'spillere fik ikke-spillerpost', npGain, 'pool', cur.m.s32(cur.m.u32(0xb7434c) + 0x20));
  prev = cur;
}
console.log(JSON.stringify(jobs, null, 1));
