import { describe, expect, it } from 'vitest';
import { gunzipSync } from 'node:zlib';
import { gzConcat, gzipTextBytes } from '../src/game/snapshot';

// (26/11) gem i bidder med luft imellem (menuerne frøs ~1 s under autogemmet): teksten skal komme ud uændret – også med surrogatpar
// midt på en grænse (1 M tegn) og æ/ø/å
describe('gzipTextBytes i bidder', () => {
  it('giver nøjagtig samme tekst, også over en bidgrænse med et surrogatpar', async () => {
    const STEP = 1 << 20;
    const text = `${'æøå'.repeat(Math.floor((STEP - 1) / 3))}${'x'.repeat((STEP - 1) % 3)}😀${'abc😀'.repeat(300_000)}`;
    // surrogatparrets første halvdel står som tegn nr. STEP − 1 (sidste tegn i første bid)
    expect(text.charCodeAt(STEP - 1) >= 0xd800 && text.charCodeAt(STEP - 1) <= 0xdbff).toBe(true);
    const back = gunzipSync(Buffer.from(gzConcat(await gzipTextBytes(text)))).toString('utf8');
    expect(back === text).toBe(true);
  });
  it('tom tekst giver en gyldig gzip', async () => {
    expect(gunzipSync(Buffer.from(gzConcat(await gzipTextBytes('')))).length).toBe(0);
  });
});
