// Samme spil i alle miljøer: fingeraftryk pr. dag (talrækken, kampresultaterne og en hash af hele GameState) for et nyt spil med den originale
// database i ægte tilstand (Wrexham, frø 3 – opsætningen i tests/cmEurope.test.ts). tests/envDeterminism.test.ts kører det under vitest og i en
// tsx-proces uden vitests miljø og kræver samme linjer – spillet må aldrig afhænge af, hvilket værktøj det kører i (27/11: SL_ON fulgte VITEST).
//   npx tsx scripts/env-fingerprint.ts [slutdato = 2001-07-17]
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { rng } from '../src/game/rng';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { RES_SKIP } from '../src/game/cmReserves';

export function envFingerprint(until = '2001-07-17'): string[] {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
  RES_SKIP.on = true;
  const g = gs();
  // g.id (save-<tid>) er ikke en del af spillet
  const rep = function (this: unknown, k: string, v: unknown) { return this === g && k === 'id' ? 0 : v instanceof Map ? { __map: [...v] } : v instanceof Set ? { __set: [...v] } : v; };
  const line = () => {
    let s = 0, n = 0;
    for (const f of Object.values(g.fixtures)) if (f.result) { n++; s = (Math.imul(s, 31) + f.result.hg * 7 + f.result.ag + f.home) >>> 0; }
    return `${g.date} rng=${rng.state} res=${n}/${s} state=${createHash('sha256').update(JSON.stringify(g, rep)).digest('hex').slice(0, 16)}`;
  };
  const out = [line()];
  for (let i = 0; i < 60 && g.date < until; i++) {
    if (continueGame().match) quickPlayUserMatch();
    out.push(line());
  }
  return out;
}

if (process.argv[1]?.endsWith('env-fingerprint.ts')) console.log(envFingerprint(process.argv[2]).join('\n'));
