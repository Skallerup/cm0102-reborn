// Oraklets dagsbilleder (scripts/oracle-day-snaps.py): index.json + k-<iso>.zst (nøglebillede, zstd) og p-<iso>.zst (zstd --patch-from mod
// ugens nøglebillede). loadDaySnap pakker ud med zstd (CLI) og giver SparseMem som loadSnap (ct-snap.ts). Nøglebillederne pakkes ud én gang
// til os.tmpdir()/cm-daysnap/ (≈93 MB pr. uge; den forrige uges slettes).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { SparseMem } from '../src/game/cmMem';

export interface DaySnapEntry { iso: string; kind: 'k' | 'p'; file: string; key?: string; bytes: number }
export interface DaySnapIndex { seed: number; database: string; club: string; every: number; snaps: DaySnapEntry[]; dir: string }

export const DEFAULT_DAYSNAP = join(homedir(), 'cm0102-engine/oracle/daysnap/s1-3.9.60-e1');
const ZSTD = ['/opt/homebrew/bin/zstd', '/usr/local/bin/zstd'].find((p) => existsSync(p)) ?? 'zstd';

export function readDaySnapIndex(dir = DEFAULT_DAYSNAP): DaySnapIndex | null {
  const f = join(dir, 'index.json');
  if (!existsSync(f)) return null;
  return { ...(JSON.parse(readFileSync(f, 'utf8')) as Omit<DaySnapIndex, 'dir'>), dir };
}

function toMem(b: Buffer): SparseMem {
  const m = new SparseMem();
  let o = 0;
  while (o + 8 <= b.length) {
    const a = b.readUInt32LE(o), n = b.readUInt32LE(o + 4);
    o += 8;
    let i = 0;
    while (i < n) {
      const addr = a + i, pg = addr >>> 12, off = addr & 0xfff, len = Math.min(0x1000 - off, n - i);
      m.page(pg)!.set(b.subarray(o + i, o + i + len), off);
      i += len;
    }
    o += n;
  }
  return m;
}

const cache = join(tmpdir(), 'cm-daysnap');
function keyRaw(ix: DaySnapIndex, key: string): string {
  mkdirSync(cache, { recursive: true });
  const tag = `${ix.seed}-${ix.database}-${ix.every}-${key}.bin`;
  const f = join(cache, tag);
  if (!existsSync(f)) {
    for (const x of readdirSync(cache)) if (x.startsWith(`${ix.seed}-${ix.database}-${ix.every}-`) && x !== tag) rmSync(join(cache, x), { force: true });
    writeFileSync(f, execFileSync(ZSTD, ['-q', '-d', '-c', join(ix.dir, `k-${key}.zst`)], { maxBuffer: 1 << 30 }));
  }
  return f;
}

/** rå bytes for dagen (samme format som sn_trace.c's pre-<dag>-<år>.bin) */
export function daySnapBytes(ix: DaySnapIndex, e: DaySnapEntry): Buffer {
  if (e.kind === 'k') return readFileSync(keyRaw(ix, e.iso));
  return execFileSync(ZSTD, ['-q', '-d', '-c', `--patch-from=${keyRaw(ix, e.key!)}`, join(ix.dir, e.file)], { maxBuffer: 1 << 30 });
}

export function loadDaySnap(ix: DaySnapIndex, e: DaySnapEntry): SparseMem { return toMem(daySnapBytes(ix, e)); }
