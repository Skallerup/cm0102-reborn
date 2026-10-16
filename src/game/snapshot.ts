// (De)serialisering af hele spiltilstanden som gzip-komprimeret JSON
import { stash } from './humans';
import { rng } from './rng';
import type { GameState } from './types';

const round = (_k: string, v: unknown) => (typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 100) / 100 : v);

export async function gzipText(text: string): Promise<Blob> {
  if (typeof CompressionStream === 'undefined') return new Blob([text]);
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).blob();
}

export async function gunzipText(blob: Blob): Promise<string> {
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] !== 0x1f || head[1] !== 0x8b) return blob.text();
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

export async function serializeState(g: GameState): Promise<Blob> {
  g.rng = rng.state;
  stash(g);
  return gzipText(JSON.stringify(g, round));
}

export async function deserializeState(blob: Blob): Promise<GameState> {
  return JSON.parse(await gunzipText(blob)) as GameState;
}
