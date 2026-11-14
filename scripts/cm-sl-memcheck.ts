// Kontrol: ønskelisternes hurtige hukommelse (cmSlMem.ts buildSlWantMem) mod de oprindelige byggere (cmContractGame.ts buildWantMem med full) –
// alle sider byte for byte og spillerlisten, ved spilstarten og hver dag.   npx tsx scripts/cm-sl-memcheck.ts [dage]
import { readFileSync } from 'node:fs';
process.env.CM_SL_MEMCHECK = '1';
const { createGame } = await import('../src/game/newgame');
const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
const { gs } = await import('../src/game/state');
const { SL_ON, MEMCHECK } = await import('../src/game/cmShortlistGame');
const { SLMEM_STATS, FPDBG } = await import('../src/game/cmSlMem');
type WorldData = import('../src/game/newgame').WorldData;

SL_ON.on = true;
const days = +(process.argv[2] ?? 10);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
for (let d = 0; d < days; d++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
console.log('personer / skrevet igen / genopbygninger', SLMEM_STATS, FPDBG ?? '');
console.log(`hukommelsen kontrolleret ${MEMCHECK.n} gange (${MEMCHECK.pages} sider) (til ${g.date}): ${MEMCHECK.bad} med afvigelser`);
if (MEMCHECK.bad) process.exitCode = 1;
