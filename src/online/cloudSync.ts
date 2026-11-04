// Gemte spil i skyen: uploades ved "Gem spil" og når man afslutter, ellers højst hvert 5. minut under spillet.
import { setCloudHook, type SaveMeta } from '../game/save';
import { getAccount, uploadCloudSave } from './account';

export type CloudState = 'idle' | 'saving' | 'saved' | 'error';
let state: CloudState = 'idle';
let lastAt = 0;
let busy = false;
let queued: { meta: SaveMeta; blob: Blob } | null = null;
const EVERY = 5 * 60 * 1000;

export const cloudState = () => state;
function setState(s: CloudState) { state = s; window.dispatchEvent(new Event('cm-cloud')); }

async function run(meta: SaveMeta, blob: Blob) {
  busy = true;
  setState('saving');
  try { await uploadCloudSave(meta, blob); lastAt = Date.now(); setState('saved'); } catch { setState('error'); }
  busy = false;
  if (queued) { const q = queued; queued = null; void run(q.meta, q.blob); }
}

setCloudHook((meta, blob, force) => {
  if (!getAccount()) return;
  if (!force && Date.now() - lastAt < EVERY) return;
  if (busy) { queued = { meta, blob }; return; }
  void run(meta, blob);
});
