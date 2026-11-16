// Originalens pensioneringsliste (PLAYER_REGEN [0xb7434c]: +4 poster à 26 bytes, +8 antal) i oraklets øjebliksbilleder – kontrol af
// cmRetire.ts. Kørsel: npx tsx scripts/cm-retire-snap.ts [billede …]   (ALL=1 viser alle poster)
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import type { SparseMem } from '../src/game/cmMem';

const E = `${homedir()}/cm0102-engine`;
const files = process.argv.slice(2).length ? process.argv.slice(2) : [`${E}/work-r3/snap-start/pre-194-2001.bin`, `${E}/oracle/runs/xfer3-snap/pre-200-2001.bin`, `${E}/oracle/runs/xfer3-snap/pre-31-2002.bin`, `${E}/oracle/runs/xfer3-snap/pre-180-2002.bin`];
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
// UNION: alle engelske poster i billederne (id → stopdato, alder, årsag) – de forfaldne til 30/6 og 20/7 2002 = sæson 1's pensioneringer
const union = new Map<number, [number, number, number]>();
for (const f of files) {
  if (!existsSync(f)) { console.log('mangler', f); continue; }
  const m = loadSnap(f);
  const PR = m.u32(0xb7434c), S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4);
  console.log(`\n== ${f.split('/').pop()} dag ${m.s16(0xae2c90)}/${m.u16(0xae2c92)}  PLAYER_REGEN ${PR.toString(16)}  personer ${n}`);
  const hdr: string[] = []; for (let o = 0; o < 0x30; o += 4) hdr.push(m.u32(PR + o).toString(16)); console.log('hoved', hdr.join(' '));
  const arr = m.u32(PR + 4), cnt = m.s32(PR + 8);
  const byReason = new Map<string, number>();
  const ages: Record<string, number> = {};
  let eng = 0, shown = 0;
  for (let i = 0; i < cnt; i++) {
    const e = arr + 26 * i, id = m.s32(e), club = m.s32(e + 4);
    const ad = m.s16(e + 8), ay = m.u16(e + 0xa), rd = m.s16(e + 0x10), ry = m.u16(e + 0x12), reason = m.u8(e + 0x18), ann = m.u8(e + 0x19);
    const st = S + 0x6e * id, pr = m.u32(st + 0x61), age = m.s8(st + 0x18);
    const nat = str(m, m.u32(st + 0x1a) + 4, 51), cl = club >= 0 ? str(m, C + 0x245 * club + 4, 51) : '-';
    const cnat = club >= 0 ? str(m, m.u32(C + 0x245 * club + 0x53) + 4, 51) : '';
    const k = `r${reason.toString(16)} ${pr ? 'spiller' : 'stab'} ann${ann}`;
    byReason.set(k, (byReason.get(k) ?? 0) + 1);
    if (pr) ages[age] = (ages[age] ?? 0) + 1;
    if (cnat === 'England' || (club < 0 && nat === 'England')) { eng++; if (pr) union.set(id, [ry * 1000 + rd, age, reason]); }
    if (shown++ < Number(process.env.SHOW ?? 25) || process.env.ALL) console.log(`${id} ${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))} alder ${age} ${pr ? `CA ${m.s16(pr + 5)} PA ${m.s16(pr + 7)} rep ${m.s16(pr + 0xb)}` : 'stab'} klub ${cl}(${cnat}) nat ${nat} årsag ${reason.toString(16)} meldt ${ann} melding ${ad}/${ay} stop ${rd}/${ry}`);
  }
  console.log('antal', cnt, 'England (klub/klubløs eng.)', eng, [...byReason].map(([k, v]) => `${k}:${v}`).join(' '));
  console.log('alder (spillere)', JSON.stringify(ages));
  const ann: Record<string, number> = {}, ret: Record<string, number> = {};
  for (let i = 0; i < cnt; i++) {
    const e = arr + 26 * i, k1 = `${m.u16(e + 0xa)}:${Math.floor(m.s16(e + 8) / 30) * 30}`, k2 = `${m.u16(e + 0x12)}:${Math.floor(m.s16(e + 0x10) / 10) * 10}`;
    ann[k1] = (ann[k1] ?? 0) + 1; ret[k2] = (ret[k2] ?? 0) + 1;
  }
  console.log('meldingsdato (år:dag/30)', JSON.stringify(ann));
  console.log('stopdato (år:dag/10)', JSON.stringify(ret));
}

for (const [tag, lim] of [['30/6-2002', 2002179], ['20/7-2002', 2002199]] as const) {
  const xs = [...union.values()].filter(([r]) => r <= lim && r >= 2001194);
  const ages: Record<number, number> = {};
  for (const [, a] of xs) ages[a] = (ages[a] ?? 0) + 1;
  console.log(`UNION England, spillere med stop til ${tag}: ${xs.length}`, 'alder', JSON.stringify(ages));
}
