// snapshot.ts JsonStreamParser/parseJsonBlob: samme værdi som JSON.parse, uanset hvor teksten deles i bidder (nyt spil/indlæsning pakkes ud i
// bidder – hukommelse 26/11)
import { describe, expect, it } from 'vitest';
import { gzipChunks, jsonChunks, JsonStreamParser, parseJsonBlob } from '../src/game/snapshot';

let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const STRS = ['', 'a', 'æøå', '"', '\\', '\\"', '{', '}', '[', ']', ',', ':', ' x y ', '\n\t', '\u0000', '😀', '\ud83d', 'a"b\\c{[', 'true', '1e5'];
function gen(d: number): unknown {
  const r = rnd();
  if (d > 4 || r < 0.35) {
    const k = Math.floor(rnd() * 9);
    return [0, -1, 1.5, 1e300, -2.5e-7, true, false, null, STRS[Math.floor(rnd() * STRS.length)]][k];
  }
  if (r < 0.65) return Array.from({ length: Math.floor(rnd() * 5) }, () => gen(d + 1));
  const o: Record<string, unknown> = {};
  for (let i = Math.floor(rnd() * 5); i > 0; i--) o[rnd() < 0.3 ? String(Math.floor(rnd() * 20)) : STRS[Math.floor(rnd() * STRS.length)] + i] = gen(d + 1);
  return o;
}
function feedSplit(text: string, depth: number, split: () => number): unknown {
  const p = new JsonStreamParser(depth);
  for (let o = 0; o < text.length;) { const e = Math.min(text.length, o + split()); p.feed(text.slice(o, e)); o = e; }
  return p.end();
}
const same = (a: unknown, b: unknown) => expect(JSON.stringify(a)).toBe(JSON.stringify(b));

describe('JsonStreamParser', () => {
  it('samme værdi som JSON.parse – tilfældige værdier, alle dybder og bidstørrelser', () => {
    for (let n = 0; n < 400; n++) {
      const v = gen(0), text = JSON.stringify(v), want = JSON.parse(text);
      for (const depth of [0, 1, 2, 3, 6]) {
        same(feedSplit(text, depth, () => 1), want);
        same(feedSplit(text, depth, () => 1 + Math.floor(rnd() * 7)), want);
        same(feedSplit(text, depth, () => 1 << 20), want);
      }
    }
  });
  it('mellemrum, __proto__ og tal/literaler i roden', () => {
    const text = ' { "__proto__" : { "x" : [ 1 , 2 ] } , "a" : [ ] , "b" : { } , "10": 1, "2": [true,false,null] } ';
    const got = feedSplit(text, 2, () => 3) as Record<string, unknown>;
    same(got, JSON.parse(text));
    expect(Object.getPrototypeOf(got)).toBe(Object.prototype);
    expect(Object.keys(got)).toEqual(Object.keys(JSON.parse(text)));
    for (const t of ['42', ' -1.5e3 ', 'true', 'null', '"s"', '[]', '{}']) for (const d of [0, 2]) same(feedSplit(t, d, () => 1), JSON.parse(t));
  });
  it('ugyldig JSON giver SyntaxError', () => {
    for (const t of ['', '{', '{"a":1', '{"a" 1}', '[1,]', '{"a":1,}', '[1 2]', '{"a":1}}', '{a:1}', '[1]x', 'tru', '"abc']) {
      for (const d of [0, 2]) expect(() => feedSplit(t, d, () => 2), `${t} d${d}`).toThrow(SyntaxError);
    }
  });
  it('parseJsonBlob: gzip-bytes (gzipChunks) og ren tekst', async () => {
    const big = { players: Array.from({ length: 3000 }, (_, i) => ({ id: i, name: `Spiller ${i} æøå "😀"`, v: i / 7, a: [i, { b: '}]' }] })), meta: { a: 1, s: 'x\\' } };
    same(await parseJsonBlob(new Blob(await gzipChunks(jsonChunks(big)))), big);
    same(await parseJsonBlob(new Blob([JSON.stringify(big)])), big);
  });
});
