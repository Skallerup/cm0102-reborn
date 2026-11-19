// Et kopieret (v8 – som spillets Web Workers) eller gemt og indlæst spil fortsætter bit for bit som det samme spil uden afbrydelse:
// GameState + indeksernes rækkefølge + modulernes tilstand uden for GameState (src/game/carry.ts). Og et nyt spil i samme proces arver intet
// fra det forrige. Den originale database i ægte tilstand, frø 1, Wrexham, de første dage (med en kampdag: punktet midt i dagen, før egen kamp).
// Længere perioder: scripts/snap-verify.ts og scripts/snap-chain.ts (en hel sæson i stykker, hvert i en ny proces).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { serialize, deserialize } from 'node:v8';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, packCarry, setGame } from '../src/game/state';
import { rng } from '../src/game/rng';
import { captureCarry, restoreCarry } from '../src/game/carry';
import { serializeState, deserializeState } from '../src/game/snapshot';
import { ensureAllNumbers, upgradeLoaded } from '../src/game/save';
import type { GameState } from '../src/game/types';

// et nybygget spil i en ny proces er det, der afprøves: ikke createGame-cachen (tests/helpers/gameCache.ts)
process.env.CM_GAME_CACHE = '0'; delete process.env.CM_GAME_CACHE_USE;

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[1] === 'Wrexham')![0];
const newGame = () => {
  createGame(world, { managerName: 'T', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  gs().options.engine = 'original';
};
/** `canon`: felterne sorteret – spillets JSON-gem bevarer ikke rækkefølgen af felter, der har været undefined (fx p.cmContract ved et klubskifte) */
const sorted = (_k: string, v: unknown) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
  const o = v as Record<string, unknown>, out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) out[k] = o[k];
  return out;
};
const fp = (canon = false) => {
  const g = gs();
  g.rng = rng.state;
  return createHash('sha1').update(JSON.stringify({ ...g, id: 0 }, canon ? sorted : undefined)).update(JSON.stringify(captureCarry())).digest('hex');
};
/** ét skridt: continueGame, eller den ventende egne kamp */
const step = (): string => {
  if (gs().pendingFixture) { quickPlayUserMatch(); return 'match'; }
  return continueGame().match !== undefined ? 'pause' : 'day';
};
const v8Copy = (): Buffer => { const g = gs(); g.rng = rng.state; packCarry(g); try { return serialize(g); } finally { delete g.cmCarry; } };

describe('kopi/gem af spillet = uafbrudt (carry.ts)', () => {
  const STEPS = 7;
  newGame();
  const fp0 = fp();
  const ref: string[] = [], refC: string[] = [], what: string[] = [];
  const copies = new Map<number, Buffer>();
  const saves = new Map<number, Blob>();
  const wantAt = (i: number) => i === 2 || what[i - 1] === 'pause';
  // referencen i ét stræk; kopier ved skridt 2 (dagsskifte) og ved pausen før egen kamp (midt i en kampdag)
  for (let i = 1; i <= STEPS; i++) {
    what.push(step());
    ref.push(fp());
    refC.push(fp(true));
  }
  const pts = [2, what.indexOf('pause') + 1].filter((x, j, a) => x > 0 && a.indexOf(x) === j);

  it('referencen har en kampdag med pause før egen kamp', () => {
    expect(what).toContain('pause');
    expect(pts.length).toBe(2);
  });

  it('v8-kopi (Web Worker) fortsætter som uafbrudt – også med modulerne nulstillet som i en ny proces', async () => {
    // spil forfra til punkterne og tag kopierne (samme frø → samme forløb)
    newGame();
    expect(fp()).toBe(fp0);   // nyt spil efter et spillet spil i samme proces: intet arvet
    for (let i = 1; i <= Math.max(...pts); i++) {
      step();
      expect(fp()).toBe(ref[i - 1]);
      if (pts.includes(i)) { copies.set(i, v8Copy()); saves.set(i, await serializeState(gs())); }
    }
    for (const at of pts) {
      setGame(null); restoreCarry(undefined);
      setGame(deserialize(copies.get(at)!) as GameState);
      expect(fp()).toBe(ref[at - 1]);
      for (let i = at + 1; i <= STEPS; i++) { step(); expect(fp(), `kopi ved ${at}, skridt ${i}`).toBe(ref[i - 1]); }
    }
  }, 600_000);

  it('spillets eget gem/indlæs (snapshot.ts + upgradeLoaded) fortsætter som uafbrudt', async () => {
    for (const at of pts) {
      setGame(null); restoreCarry(undefined);
      setGame(await deserializeState(saves.get(at)!));
      upgradeLoaded();
      ensureAllNumbers();
      expect(fp(true)).toBe(refC[at - 1]);
      for (let i = at + 1; i <= STEPS; i++) { step(); expect(fp(true), `gem ved ${at}, skridt ${i}`).toBe(refC[i - 1]); }
    }
  }, 600_000);
}, 900_000);
