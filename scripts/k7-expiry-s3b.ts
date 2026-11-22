// hjælper til k7-expiry-s3.ts: vores uafklarede i sæson 3 (snapshots fra k7-expiry-s3.ts) – hvem er de?
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import { cmCmScope } from '../src/game/cmContractManager';
import type { GameState, Player } from '../src/game/types';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const opts = { world: w, worldFile: process.env.WORLD, club: 'Arsenal', seed: 1, mode: 'authentic' as const, managerName: 'Test Smoke', advanceTag: 'k7', advance: () => { throw new Error('ingen snapshot'); } };
const pick = (g: GameState) => { const eng = g.nations.findIndex((x) => x.name === 'England'); return Object.values(g.players).filter((p) => !p.virtual && g.clubs[p.club]?.nation === eng && p.contract && !p.loan && p.contract.expires.slice(0, 10) <= '2004-06-27'); };
const gA = loadOrCreate({ ...opts, date: '2003-06-28' });
const A = pick(gA).map((p) => ({ id: p.id, club: p.club, exp: p.contract!.expires, regen: !!p.regen, b4f: p.cmContract?.b4f, type: p.contract!.cmType ?? 2, start: p.contract!.cmStart ?? p.joined ?? p.cmJoined ?? '', scope: cmCmScope(gA, p), dob: p.dob, youth: (p as Player & { youth?: unknown }).youth }));
const gB = loadOrCreate({ ...opts, date: '2004-06-26' });
const t = new Map<string, number>();
for (const a of A) {
  const b = gB.players[a.id];
  const out = !b ? 'væk' : !b.club ? 'klubløs' : b.club !== a.club ? 'anden' : b.contract && b.contract.expires.slice(0, 10) > '2004-06-27' ? 'forlænget' : 'uafklaret';
  const k = `regen ${a.regen} b4f ${a.b4f === undefined ? '-' : 'ja'} scope ${a.scope} start ${a.start ? 'ja' : '-'} → ${out}`;
  t.set(k, (t.get(k) ?? 0) + 1);
}
for (const [k, v] of [...t].sort()) console.log(`${k}: ${v}`);
const ex = A.filter((a) => a.regen).slice(0, 6);
for (const a of ex) { const p = gA.players[a.id]; console.log(JSON.stringify({ id: a.id, name: `${p.first} ${p.last}`, dob: p.dob, regen: p.regen, club: gA.clubs[p.club]?.name, contract: p.contract, cmContract: p.cmContract, joined: p.joined, cmJoined: p.cmJoined, id2: p.id, rep: p.cmRep, ca: p.ca, pa: p.pa }), JSON.stringify(gB.players[a.id]?.contract)); }
