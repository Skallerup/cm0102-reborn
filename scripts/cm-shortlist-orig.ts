// Originalens ønskelister i øjebliksbilledet (Shortlist_Manager [[0xde1f54] + 0x856]): parrene, pladsernes mål/budgetandele og buddene.
//   npx tsx scripts/cm-shortlist-orig.ts [snap]   (standard ~/cm0102-engine/work-r3/snap-start/pre-194-2001.bin = 14/7-2001, frø 1)
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { G } from '../src/game/cmMem';

const snap = process.argv[2] ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`;
const m = loadSnap(snap);
const name = (a: number) => { let s = ''; for (let i = 0; i < 50; i++) { const b = m.u8(a + i); if (!b) break; s += String.fromCharCode(b); } return s; };
const slm = m.u32(m.u32(0xde1f54) + 0x856);
const nPairs = m.s32(slm + 0x10);
console.log('par', nPairs, 'positionslister', [...Array(16).keys()].map((p) => m.s32(slm + 0x98 + 4 * p)).join(' '));
const clubs = m.u32(G.CLUBS), nClubs = m.s32(0xae235c), staff = m.u32(G.STAFF);
const eng = m.s32(0x9cf2e4);
let targets = 0, bids = 0, clubsWith = 0, share = 0;
const perClub: string[] = [];
for (let cid = 0; cid < nClubs; cid++) {
  const c = clubs + 0x245 * cid, nat = m.u32(c + 0x53);
  if (!nat) continue;
  const ent = m.u32(slm + 0xdc) + 9 * cid, base = m.u32(ent);
  if (!base) continue;
  let t = 0, b = 0, sh = 0;
  const tl: string[] = [];
  for (let i = 0; i < 40; i++) {
    const s = base + 0x25 * i;
    if (m.u8(s) !== 0xb) continue;
    const f = m.s32(s + 0xf), h = m.s32(s + 0x13);
    if (f > -1 && f !== h) { t++; const st = staff + 0x6e * f; tl.push(`${m.s32(st)}@${m.s32(s + 7)}`); }
    if (m.s32(s + 0x17) > -1) b++;
    if (f === -1 && m.s32(s + 7) > 0) sh++;
  }
  targets += t; bids += b; share += sh; if (t) clubsWith++;
  if (m.s32(nat) === eng && perClub.length < 30) perClub.push(`${cid} tilstand ${m.u8(ent + 4)} tæller ${m.u8(ent + 8)} mål ${t} [${tl.slice(0, 6).join(' ')}] bud ${b} andele ${sh}`);
}
console.log(`mål ${targets} (klubber med mål ${clubsWith}), budmærker ${bids}, åbne pladser med andel ${share}`);
for (const l of perClub) console.log('  ' + l);
void name;
