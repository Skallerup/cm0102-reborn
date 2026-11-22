// Det nye spils størrelse pr. felt (JSON-bytes) – hvad der kopieres fra spilstartens arbejder til hovedtråden.
// Brug: npx tsx scripts/mem-gamesize.ts [world-fil] [land=England]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, packCarry } from '../src/game/state';
const [file = 'public/data/world-original.json', nat = 'England'] = process.argv.slice(2);
const w = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const act = [w.nations.findIndex((x) => x.name === nat)];
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'S', managerNation: eng, clubId: w.clubs.find((c) => c[3] === act[0])![0], activeNations: act, lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs() as unknown as Record<string, unknown>;
packCarry(gs());
const size = (v: unknown) => { try { return JSON.stringify(v)?.length ?? 0; } catch { return -1; } };
const MB = (n: number) => (n / 1048576).toFixed(1);
const rows = Object.keys(g).map((k) => [k, size(g[k])] as const).sort((a, b) => b[1] - a[1]);
console.log('i alt', MB(rows.reduce((s, r) => s + Math.max(0, r[1]), 0)), 'MB');
for (const [k, n] of rows.slice(0, 25)) console.log(MB(n).padStart(7), k);
const carry = g.cmCarry as Record<string, unknown>;
console.log('cmCarry:');
for (const [k, n] of Object.keys(carry).map((k) => [k, size(carry[k])] as const).sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(MB(n).padStart(7), k);
// typed arrays (JSON viser dem som objekter): bytes pr. felt
const ta = (v: unknown, seen = new Set<unknown>()): number => { if (!v || typeof v !== 'object' || seen.has(v)) return 0; seen.add(v); if (ArrayBuffer.isView(v)) return v.byteLength; let s = 0; for (const x of (v instanceof Map ? v.values() : Object.values(v))) s += ta(x, seen); return s; };
console.log('typed arrays pr. felt:');
for (const k of Object.keys(g)) { const n = ta(g[k]); if (n > 1 << 20) console.log(MB(n).padStart(7), k); }
