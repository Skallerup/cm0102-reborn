// Spilstartens pensioneringsliste (cmRetire.ts 0x7a58f0) mod oraklets (14/7-2001, PLAYER_REGEN [0xb7434c]): hvem mangler hos os, hvem har vi
// i overskud, og hvorfor (alder 1/1, CA, positioner, omdømme, division). Kørsel: WORLD=<world-dbs2.json> npx tsx scripts/cm-retire-diff.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { ageOn } from '../src/game/dates';

const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const m = loadSnap(process.env.SNAP ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const PR = m.u32(0xb7434c), S = m.u32(0xae23bc), C = m.u32(0xae23b4);
const arr = m.u32(PR + 4), cnt = m.s32(PR + 8);
const byKey = new Map<string, number>();
for (const p of Object.values(g.players)) byKey.set(`${p.first}|${p.last}|${p.dob.slice(0, 4)}`, p.id);
const ours = new Set(g.cmRet!.list.map((e) => e.id));
let found = 0, inOurs = 0, missing = 0;
const why: Record<string, number> = {};
const matched = new Set<number>();
for (let i = 0; i < cnt; i++) {
  const e = arr + 26 * i, id = m.s32(e), club = m.s32(e + 4);
  const st = S + 0x6e * id, pr = m.u32(st + 0x61);
  if (!pr) continue;
  const cnat = club >= 0 ? str(m, m.u32(C + 0x245 * club + 0x53) + 4, 51) : '';
  if (cnat !== 'England') continue;
  const common = str(m, m.u32(st + 0xc)), first = common ? '' : str(m, m.u32(st + 4)), last = common || str(m, m.u32(st + 8));
  const yob = m.u16(st + 0x12) > 1850 ? m.u16(st + 0x12) : m.s16(st + 0x18);
  const pid = byKey.get(`${first}|${last}|${yob}`);
  if (pid === undefined) {
    missing++;
    const cn = str(m, C + 0x245 * club + 4, 51), oc = Object.values(g.clubs).find((c) => c.name === cn);
    const k = !oc ? 'ikke fundet: klubben findes ikke' : g.leagues[oc.league]?.hidden ? 'ikke fundet: skjult liga (højst 16 spillere)' : 'ikke fundet: synlig liga';
    why[k] = (why[k] ?? 0) + 1;
    if (k.endsWith('synlig liga') && process.env.V) console.log(`  mangler ${first} ${last} ${yob} ${cn}`);
    continue;
  }
  found++; matched.add(pid);
  if (ours.has(pid)) { inOurs++; continue; }
  const p = g.players[pid];
  const a = ageOn(p.dob, '2001-01-01');
  const k = `oraklet alder ${m.s8(st + 0x18)} CA ${m.s16(pr + 5)} | vores alder1/1 ${a} CA ${p.ca} pos ${p.pos[0]},${p.pos[5]},${p.pos[6]} klub ${g.clubs[p.club]?.name ?? '-'} liga ${p.club ? g.clubs[p.club].league : ''}`;
  if (Object.keys(why).length < 400) console.log(`${first} ${last}: ${k}`);
  const r = p.ca > 80 ? 'CA>80' : !p.club ? 'klubløs' : 'andet';
  why[r] = (why[r] ?? 0) + 1;
}
console.log(`oraklets engelske spillere ${found + missing}: fundet ${found}, i vores liste ${inOurs}, ikke fundet ${missing}`, JSON.stringify(why));
const extra = g.cmRet!.list.filter((e) => g.clubs[e.club]?.nation === eng && !matched.has(e.id));
console.log(`vores engelske uden for oraklets liste: ${extra.length}`);
for (const e of extra.slice(0, 15)) { const p = g.players[e.id]; console.log(`  ${p.first} ${p.last} ${p.dob} CA ${p.ca} ${g.clubs[p.club]?.name}`); }
