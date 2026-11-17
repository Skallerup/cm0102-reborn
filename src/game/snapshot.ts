// (De)serialisering af hele spiltilstanden som gzip-komprimeret JSON
import { stash } from './humans';
import { rng } from './rng';
import { packCarry } from './state';
import type { GameState } from './types';

// (17/11) tallene gemmes uden afrunding: med 2 decimaler (før) spillede et gemt og indlæst spil ikke videre som det samme spil (egenskaberne,
// moralen, lønnen, værdien, saldoen … er kommatal i originalens beregninger) – scripts/save-diff.ts: +19 % gzip

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
  // modulernes tilstand (carry.ts) følger med det aktive spil, så det indlæste spil fortsætter præcis som dette
  packCarry(g);
  try { return gzipText(JSON.stringify(g)); } finally { delete g.cmCarry; }
}

export async function deserializeState(blob: Blob): Promise<GameState> {
  return JSON.parse(await gunzipText(blob)) as GameState;
}
