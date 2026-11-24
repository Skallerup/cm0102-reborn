// snapshot.ts jsonChunks/gzipChunks: præcis samme tekst som JSON.stringify (spilstartens arbejder pakker spillet i bidder – 24/11)
import { describe, expect, it } from 'vitest';
import { gunzipText, gzipChunks, jsonChunks } from '../src/game/snapshot';

const cases: unknown[] = [
  { a: 1, b: undefined, c: () => 1, d: null, e: [1, undefined, () => 2, { x: undefined, y: [[], {}] }], f: { g: { h: { i: { j: 'ø"\n ' } } } } },
  { date: new Date(0), n: NaN, inf: -Infinity, neg: -0, big: 1e300, s: Symbol('x'), m: new Map([[1, 2]]), ta: new Uint8Array([1, 2]), t: { toJSON: () => 'TJ' } },
  [undefined, null, { a: [undefined] }],
  Object.assign(Object.create(null), { z: 1, 10: 'ti', 2: 'to', a: { b: undefined } }),
  {}, [], 'tekst', 42, null,
];

describe('jsonChunks', () => {
  it('samme tekst som JSON.stringify', () => {
    for (const c of cases) for (const d of [0, 1, 2, 5]) expect([...jsonChunks(c, d)].join('')).toBe(JSON.stringify(c));
  });
  it('gzipChunks pakkes ud til samme tekst', async () => {
    const big = { players: Array.from({ length: 5000 }, (_, i) => ({ id: i, name: `Spiller ${i} æøå`, v: i / 7, x: undefined })), meta: { a: 1 } };
    expect(await gunzipText(new Blob(await gzipChunks(jsonChunks(big))))).toBe(JSON.stringify(big));
  });
});
