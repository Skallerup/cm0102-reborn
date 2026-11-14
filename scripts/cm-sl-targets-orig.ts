// Ønskelisternes pladser i ORIGINALENS hukommelse (øjebliksbilleder): pr. engelsk klub (de fire ligaer) antal pladser (+0 rolle), med mål
// (+0xf ≥ 0), med et mål uden for klubben (målets kontrakt +4 ≠ klubben), med bud (+0x17 ≥ 0), og pladsernes +7 (budget).
// Brug: npx tsx scripts/cm-sl-targets-orig.ts <bin> …
import { readFileSync } from 'node:fs';
import { loadSnap } from './ct-snap';
import { G, getContract } from '../src/game/cmMem';

const leagueClubs = new Set((JSON.parse(readFileSync('public/data/world-original.json', 'utf8')).clubs as [number, string, string, number, string][]).filter((c) => ['CM7', 'CM8', 'CM9', 'CM10'].includes(c[4])).map((c) => c[1]));
for (const file of process.argv.slice(2)) {
  const m = loadSnap(file);
  const cb = m.u32(G.CLUBS), staff = m.u32(0xae23bc), nClubs = m.s32(0xae235c);
  const str = (a: number) => { let s = ''; for (let i = 0; i < 54; i++) { const ch = m.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
  const slm = m.u32(m.u32(0xde1f54) + 0x856);
  let clubs = 0, slots = 0, tgt = 0, ext = 0, bid = 0, extFree = 0, b7 = 0;
  const per: string[] = [];
  for (let id = 0; id < nClubs; id++) {
    const name = str(cb + 0x245 * id + 4);
    if (!leagueClubs.has(name)) continue;
    const ent = m.u32(slm + 0xdc) + 9 * id, base = m.u32(ent), n = m.u8(ent + 4);
    void n;
    if (!base) continue;
    clubs++;
    let e = 0;
    for (let i = 0; i < 40; i++) {
      const s = base + 0x25 * i;
      const role = m.u8(s);
      if (role === 0 || role === 0xff) continue;
      slots++;
      const t = m.s32(s + 0xf);
      if (t < 0) continue;
      tgt++;
      const k = getContract(m, staff + 0x6e * t);
      const own = k && m.s32(k + 4) === id;
      if (!own) { ext++; e++; b7 += m.s32(s + 7); if (!k) extFree++; }
      if (m.s32(s + 0x17) >= 0) bid++;
    }
    if (e) per.push(`${name} ${e}`);
  }
  console.log(`${file.split('/').slice(-2).join('/')}: ${clubs} klubber, pladser ${slots}, med mål ${tgt}, mål uden for klubben ${ext} (klubløse ${extFree}, +7 i snit £${Math.round(b7 / Math.max(1, ext))}), med bud ${bid}`);
  console.log('  ' + per.slice(0, 40).join(' · '));
}
