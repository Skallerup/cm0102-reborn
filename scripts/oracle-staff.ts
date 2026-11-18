// Oraklets stab over sæsonen (dagsbillederne, scripts/oracle-days.ts): stabsskifterne (staff +0x39 skifter for personer med ikke-spillerpost
// +0x69 og job +0x3d 6–10) og trupplanens stabspladser (Shortlist_Manager [[0xde1f54]+0x856] → [+0xdc] + 9·klub → pladserne à 0x25:
// +0 rolle, +3 T, +7 budget, +0xb, +0xf mål, +0x13 indehaver, +0x17 bud) for de engelske klubber.
// npx tsx scripts/oracle-staff.ts [til-dato]   (STEP=7, SLOTS=1 pladserne for CLUBS=Chelsea,Fulham, SLOTS=2 alle)
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const until = process.argv[2] ?? '2002-06-30';
const STEP = Math.max(1, Number(process.env.STEP ?? 7));
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const snaps = ix.snaps.filter((e, i, xs) => e.iso <= until && (i % STEP === 0 || i === xs.length - 1 || e.iso === until));
const SHOW = new Set((process.env.CLUBS ?? '').split(',').filter(Boolean));
let prev: Map<number, number> | null = null;
let prevMgr: Map<number, number> | null = null; let mgrChanges = 0; const mgrLog: string[] = []; let prevCnt = new Map<number, number>();
const names = new Map<number, string>();
const moves: string[] = [];
const kinds: Record<string, number> = {};
let cc = 0, fc = 0, out = 0;
for (const e of snaps) {
  const m = loadDaySnap(ix, e);
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const cname = (adr: number) => (adr ? str(m, adr + 4, 51) : '');
  const eng = (adr: number) => !!adr && str(m, m.u32(adr + 0x53) + 4, 51) === 'England';
  const cur = new Map<number, number>();
  const jobs = new Map<number, number>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, np = m.u32(st + 0x69);
    if (!np) continue;
    const job = m.u8(st + 0x3d);
    if (job < 6 || job > 10) continue;
    cur.set(id, m.u32(st + 0x39)); jobs.set(id, job);
    if (!names.has(id)) names.set(id, `${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}`.trim());
  }
  if (prev) for (const [id, c] of cur) {
    const was = prev.get(id);
    if (was === undefined || was === c) continue;
    if (c && eng(c)) { if (was) cc++; else fc++; }
    else if (!c) out++;
    const k = `${was ? (eng(was) ? 'eng' : 'utl') : 'ledig'}→${c ? (eng(c) ? 'eng' : 'utl') : 'ledig'}`;
    kinds[k] = (kinds[k] ?? 0) + 1;
    moves.push(`${e.iso} job ${jobs.get(id)} ${names.get(id)!.padEnd(24)} ${(cname(was) || '(ledig)').padEnd(22)} → ${cname(c) || '(ledig)'}`);
  }
  prev = cur;
  const mg = new Map<number, number>();
  for (let ci = 0; ci < nc; ci++) { const adr = C + 0x245 * ci; if (eng(adr)) mg.set(ci, m.u32(adr + 0xcf)); }
  const cnt = new Map<number, number>(); for (const [, c] of cur) if (c) cnt.set(c, (cnt.get(c) ?? 0) + 1);
  if (prevMgr) for (const [ci, a] of mg) if (prevMgr.get(ci) !== a && a) { mgrChanges++; const adr = C + 0x245 * ci; const e2 = m.u32(m.u32(m.u32(0xde1f54) + 0x856) + 0xdc) + 9 * ci; mgrLog.push(`${e.iso} ${cname(adr)} stab ${prevCnt.get(adr) ?? 0} → ${cnt.get(adr) ?? 0} tilstand ${m.u8(e2 + 4)} tæller ${m.u8(e2 + 8)}`); }
  prevCnt = cnt;
  prevMgr = mg;
  // stabspladserne
  const slm = m.u32(m.u32(0xde1f54) + 0x856);
  let vac = 0, tgt = 0, bid = 0, held = 0, clubs = 0, recent = 0, hi = 0;
  const rows: string[] = [];
  for (let ci = 0; ci < nc; ci++) {
    const adr = C + 0x245 * ci;
    if (!eng(adr)) continue;
    const ent = m.u32(slm + 0xdc) + 9 * ci, base = m.u32(ent);
    if (!base) continue;
    clubs++;
    const cnt = m.u8(ent + 8); if (cnt < 7) recent++; if (cnt >= 100) hi++;
    const parts: string[] = [];
    for (let i = 0; i < 40; i++) {
      const a = base + 0x25 * i, role = m.u8(a);
      if (role === 0xb || role === 7) continue;
      const f = m.s32(a + 0xf), h = m.s32(a + 0x13), b = m.s32(a + 0x17);
      if (h < 0) vac++; else held++;
      if (f >= 0 && f !== h) tgt++;
      if (b >= 0) bid++;
      parts.push(`${role}:${h < 0 ? '-' : 'h'}${f >= 0 && f !== h ? `→${names.get(f) ?? f}` : ''}${b >= 0 ? '[bud]' : ''}/b7=${m.s32(a + 7)}/bb=${m.s32(a + 0xb)}/T=${m.s32(a + 3)}`);
    }
    if (SHOW.has(cname(adr)) || process.env.SLOTS === '2') rows.push(`  ${cname(adr)} st=${m.u8(ent + 4)} c=${m.u8(ent + 8)} ${parts.join(' ')}`);
  }
  console.log(`${e.iso}: eng. klubber med plan ${clubs}, stabspladser uden indehaver ${vac}, med ${held}, mål ${tgt}, bud ${bid}, tæller<7 ${recent}, ≥100 ${hi} · skifter til eng. hidtil klub→klub ${cc}, ledig→klub ${fc}, →ledig ${out}`);
  if (process.env.SLOTS) for (const r of rows) console.log(r);
}
console.log(JSON.stringify(kinds), 'managerskifter (eng., ugentligt)', mgrChanges);
for (const x of moves) console.log(x);
for (const x of mgrLog) console.log('MGR', x);
