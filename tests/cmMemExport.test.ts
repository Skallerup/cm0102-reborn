// (hukommelse, iOS 26/11) SparseMem.exportPages i bidder à højst 4 MB: samme sider og bytes efter importPages, også over flere overdragelser
// (ønskelisternes portioner, cmShortlistGame.ts cmShortlistStartPart), og uanset sidepuljens loft (setPagePoolMax – kun genbrug)
import { describe, expect, it } from 'vitest';
import { SparseMem, setPagePoolMax } from '../src/game/cmMem';

const fill = (m: SparseMem, n: number, seed: number) => { for (let p = 0; p < n; p++) m.w32(((p * 7919) % 5000) * 4096 + (p % 1000) * 4, (p * 2654435761 + seed) >>> 0); };
const dump = (m: SparseMem) => m.pageList().map(([p, b]) => `${p}:${Buffer.from(b).toString('base64')}`).join('|');

describe('SparseMem.exportPages', () => {
  it('bidder à højst 1024 sider, samme indhold efter import – også efter en ny portion oven i', () => {
    const a = new SparseMem();
    fill(a, 3000, 1);
    const ref = dump(a);
    const x = a.exportPages();
    expect(x.data.every((d) => d.length <= 1024 * 4096)).toBe(true);
    expect(x.data.reduce((s, d) => s + d.length, 0)).toBe(x.nums.length * 4096);
    expect(dump(a)).toBe(ref);
    const b = new SparseMem();
    b.importPages(x);
    expect(dump(b)).toBe(ref);
    // næste portion: nye sider og ændringer i de importerede
    fill(b, 2500, 2); b.w32(123 * 4096, 42); b.w32(4999 * 4096 + 8, 7);
    const ref2 = dump(b);
    const c = new SparseMem();
    c.importPages(b.exportPages());
    expect(dump(c)).toBe(ref2);
  });
  it('sidepuljens loft ændrer ikke indholdet', () => {
    const run = (max: number) => { setPagePoolMax(max); const m = new SparseMem(); fill(m, 1500, 3); m.release(); const n = new SparseMem(); fill(n, 1200, 4); const d = dump(n); n.release(); return d; };
    const big = run(24000), none = run(0), small = run(16);
    setPagePoolMax(24000);
    expect(none).toBe(big);
    expect(small).toBe(big);
  });
  it('keepPages (Android 27/11): en hukommelse bygget forfra beholder afsenderens sider i dens rækkefølge – som importPages af indholdet', () => {
    const a = new SparseMem();
    fill(a, 3000, 5);
    // afsenderen har mistet nogle sider (dagens hukommelse overtog dem – moveBase)
    const nums = a.pageNums().filter((_p, i) => i % 3 !== 1);
    const ref = new SparseMem(); ref.importPages({ nums: Int32Array.from(nums), data: [Int32Array.from(nums).reduce((d, p, i) => { d.set(a.pageList().find(([q]) => q === p)![1], i * 4096); return d; }, new Uint8Array(nums.length * 4096))] });
    const b = new SparseMem();
    fill(b, 3000, 5);
    b.keepPages(Int32Array.from(nums));
    expect(dump(b)).toBe(dump(ref));
    expect([...b.pageNums()]).toEqual([...nums]);
    expect(() => b.keepPages(Int32Array.from([999999]))).toThrow();
  });
});
