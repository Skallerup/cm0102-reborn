import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// (25/11, v0.37.0) Vite bundler kun en arbejder, når `new URL('./x.ts', import.meta.url)` står bogstaveligt i `new Worker(...)`/`new SharedWorker(...)`.
// Stod URL'en i en konstant, kopieredes den rå .ts-fil til assets/, og nyt spil startede aldrig ("NewGameInterrupted … step none").
const files = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : []; });

describe('Worker-oprettelser', () => {
  const src = files(join(__dirname, '../src')).map((p) => ({ p, s: readFileSync(p, 'utf8') }));

  it('new Worker får altid new URL(<bogstavelig sti>, import.meta.url) direkte', () => {
    const bad: string[] = [];
    let n = 0;
    for (const { p, s } of src) {
      for (const m of s.matchAll(/new (?:Shared)?Worker\(([^\n]*)/g)) {
        n++;
        if (!/^new URL\((['"`])[^'"`]+\.(?:ts|js)\1, import\.meta\.url\)/.test(m[1])) bad.push(`${p}: ${m[0].slice(0, 120)}`);
      }
    }
    expect(n).toBeGreaterThan(0);
    expect(bad).toEqual([]);
  });

  it('ingen new URL(…Worker.ts / .worker.ts, import.meta.url) uden for new Worker', () => {
    const bad: string[] = [];
    for (const { p, s } of src) {
      for (const m of s.matchAll(/(.{0,20})new URL\((['"`])([^'"`]*[wW]orker\.ts)\2, import\.meta\.url\)/g)) {
        if (!/new (?:Shared)?Worker\($/.test(m[1])) bad.push(`${p}: ${m[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
