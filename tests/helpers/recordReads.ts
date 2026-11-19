// Vitest (setupFiles, kun når scripts/test.mjs sætter CM_TEST_RECORD): optager hvilke filer en testfil læser via node:fs (indhold, mappeoversigter,
// om en fil findes), så testresultat-cachen (scripts/test.mjs) kan give testfilen en nøgle af ALT, den afhænger af: modulerne (vitests egen
// experimental.recordDependencies) + de filer, den læser her (fx public/data/world-original.json, oraklets udtræk i ~/cm0102-engine).
// Ændrer intet i testene: funktionerne kaldes uændret, de noteres kun. Første setup-fil, så også testfilens egne læsninger på topniveau kommer med.
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { afterAll, expect } from 'vitest';

type Kind = 'f' | 'd' | 'e';   // indhold, mappeoversigt, findes/type
const OUT = process.env.CM_TEST_RECORD;
// __cmTestReadsPause: tests/helpers/gameCache.ts læser hele src/ til sin egen nøgle – det er ikke testens input (spillet er det samme med og uden)
const G = globalThis as unknown as { __cmTestReads?: Map<string, Kind>; __cmTestReadsPause?: number };
const rank: Record<Kind, number> = { e: 0, d: 1, f: 2 };

if (OUT) {
  // én gang pr. proces (en arbejdsproces kan køre flere testfiler); tælleren nulstilles pr. testfil herunder
  if (!G.__cmTestReads) {
    const reads = new Map<string, Kind>();
    G.__cmTestReads = reads;
    const note = (p: unknown, kind: Kind) => {
      if (G.__cmTestReadsPause) return;
      try {
        const s = typeof p === 'string' ? p : p instanceof URL ? fileURLToPath(p) : Buffer.isBuffer(p) ? p.toString() : null;
        if (s == null) return;   // fd o.l.
        const a = path.resolve(s);
        const prev = G.__cmTestReads!.get(a);
        if (!prev || rank[kind] > rank[prev]) G.__cmTestReads!.set(a, kind);
      } catch { /* aldrig til gene for testen */ }
    };
    const wrap = (obj: Record<string, unknown>, name: string, kind: Kind) => {
      const orig = obj[name];
      if (typeof orig !== 'function') return;
      const f = function (this: unknown, p: unknown, ...rest: unknown[]) { note(p, kind); return (orig as (...a: unknown[]) => unknown).call(this, p, ...rest); };
      Object.defineProperty(f, 'name', { value: name });
      for (const k of Reflect.ownKeys(orig)) if (k !== 'length' && k !== 'name' && k !== 'prototype') Object.defineProperty(f, k, Object.getOwnPropertyDescriptor(orig, k)!);   // fx util.promisify.custom (fs.exists)
      obj[name] = f;
    };
    const F = fs as unknown as Record<string, unknown>;
    const P = fs.promises as unknown as Record<string, unknown>;
    for (const n of ['readFileSync', 'readFile', 'createReadStream', 'openSync', 'open']) wrap(F, n, 'f');
    for (const n of ['readFile', 'open']) wrap(P, n, 'f');
    for (const n of ['readdirSync', 'readdir', 'opendirSync', 'opendir']) wrap(F, n, 'd');
    for (const n of ['readdir', 'opendir']) wrap(P, n, 'd');
    for (const n of ['existsSync', 'exists', 'statSync', 'stat', 'lstatSync', 'lstat', 'accessSync', 'access']) wrap(F, n, 'e');
    for (const n of ['stat', 'lstat', 'access']) wrap(P, n, 'e');
    syncBuiltinESMExports();   // også `import { readFileSync } from 'node:fs'`
  }
  G.__cmTestReads.clear();   // ny testfil
  afterAll(() => {
    const file = expect.getState().testPath;
    if (!file) return;
    const reads = [...G.__cmTestReads!].map(([p, k]) => [p, k]);
    try {
      fs.mkdirSync(OUT, { recursive: true });
      fs.writeFileSync(path.join(OUT, createHash('sha256').update(path.resolve(file)).digest('hex') + '.json'), JSON.stringify({ file: path.resolve(file), reads }));
    } catch { /* cachen springer filen over */ }
  });
}
