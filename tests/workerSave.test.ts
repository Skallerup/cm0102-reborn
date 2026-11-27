// (27/11) Autogemmet laves i dagens arbejder (ui/dayWorker.ts → game/workerSave.ts): arbejderens bytes (strømmende jsonChunks + gzip, efter at
// spillet er sendt til hovedtråden som struktureret kopi) er bit for bit de samme som hovedtrådens serializeBytes af det modtagne spil, og
// hovedtråden bruger dem kun, så længe spillet er uændret (ingen notify efter sealWorkerSave).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { serialize, deserialize } from 'node:v8';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame } from '../src/game/sim';
import { gs, notify, packCarry, setGame } from '../src/game/state';
import { deserializeState, gzConcat, serializeBytes, SaveAbortedError, type GzBytes } from '../src/game/snapshot';
import { dropWorkerSave, offerWorkerSave, sealWorkerSave, takeWorkerSave } from '../src/game/workerSave';
import { captureCarry } from '../src/game/carry';
import { lowMemMobile } from '../src/ui/dbSize';
import type { GameState } from '../src/game/types';

process.env.CM_GAME_CACHE = '0'; delete process.env.CM_GAME_CACHE_USE;

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[1] === 'Wrexham')![0];
const bytes = (p: GzBytes) => new Uint8Array(gzConcat(p));

describe('gem i dagens arbejder', () => {
  it('arbejderens bytes = hovedtrådens bytes af det modtagne spil; kun brugt mens spillet er uændret', async () => {
    createGame(world, { managerName: 'T', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    gs().options.engine = 'original';
    for (let i = 0; i < 3; i++) continueGame();
    // arbejderen: notify + packCarry, spillet sendes (struktureret kopi), derefter gemmet af dens eget eksemplar
    notify();
    const wg = gs();
    packCarry(wg);
    const posted = deserialize(serialize(wg)) as GameState;
    delete wg.cmCarry;
    const w = bytes(await serializeBytes(wg, true, () => false));
    // hovedtråden: det modtagne spil lægges ind, og hovedtrådens eget gem
    setGame(posted);
    notify();
    const m = bytes(await serializeBytes(gs()));
    expect(w.length).toBe(m.length);
    expect(Buffer.from(w).equals(Buffer.from(m))).toBe(true);
    // modulernes tilstand i fast (sorteret) rækkefølge – arbejderen registrerer modulerne i en anden importrækkefølge end hovedtråden
    const ks = Object.keys(captureCarry());
    expect(ks).toEqual([...ks].sort());
    // og gemmet indlæses som spillet
    expect((await deserializeState(new Blob([w]))).date).toBe(gs().date);

    const part = [w] as GzBytes;
    // forseglet og uændret → arbejderens bytes
    offerWorkerSave(gs(), Promise.resolve(part));
    sealWorkerSave();
    expect(await takeWorkerSave(gs())).toBe(part);
    // brugt én gang
    expect(await takeWorkerSave(gs())).toBeNull();
    // ikke forseglet → hovedtråden gemmer selv
    offerWorkerSave(gs(), Promise.resolve(part));
    expect(await takeWorkerSave(gs())).toBeNull();
    // en ændring (notify) efter forseglingen → ubrugelige
    sealWorkerSave();
    notify();
    expect(await takeWorkerSave(gs())).toBeNull();
    // ændring, mens bytes er undervejs
    let res!: (p: GzBytes | null) => void;
    offerWorkerSave(gs(), new Promise((r) => { res = r; }));
    sealWorkerSave();
    const t = takeWorkerSave(gs());
    notify();
    res(part);
    expect(await t).toBeNull();
    // arbejderen gemte ikke (afbrudt) → null
    offerWorkerSave(gs(), Promise.resolve(null));
    sealWorkerSave();
    expect(await takeWorkerSave(gs())).toBeNull();
    dropWorkerSave();
  }, 120_000);

  it('en ny kørsel afbryder arbejderens gem', async () => {
    const big = { a: Array.from({ length: 400_000 }, (_, i) => ({ i, s: `x${i}` })) } as unknown as GameState;
    let n = 0;
    await expect(serializeBytes(big, true, () => ++n > 1)).rejects.toBeInstanceOf(SaveAbortedError);
  });

  it('arbejderens gem er slået fra på iPhone/iPad og telefoner med ≤ 4 GB/ukendt hukommelse – desktop beholder det', () => {
    const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
    const ipados = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
    const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';
    const win = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
    expect(lowMemMobile(iphone, 5, 8)).toBe(true);
    expect(lowMemMobile(ipados, 5, undefined)).toBe(true);
    expect(lowMemMobile(ipados, 0, undefined)).toBe(false); // Mac
    expect(lowMemMobile(android, 5, 4)).toBe(true);
    expect(lowMemMobile(android, 5, undefined)).toBe(true);
    expect(lowMemMobile(android, 5, 8)).toBe(false);
    expect(lowMemMobile(win, 0, 4)).toBe(false);
    expect(lowMemMobile(win, 0, undefined)).toBe(false);
  });
});
