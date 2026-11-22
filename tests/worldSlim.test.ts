// (hukommelse, telefoner 22/11) startforløbets lister uden at tolke hele databasen (worldFetch.ts jsonTopKeys/fetchSlimWorld) = som før
import { describe, expect, it, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { applyCommunityEdits, fetchSlimWorld, jsonTopKeys, slimWorld, type CommunityEdit } from '../src/ui/worldFetch';
import type { WorldData } from '../src/game/newgame';

const FILES = { original: 'public/data/world-original-normal.json', modern: 'public/data/world.json' } as const;

afterEach(() => { vi.unstubAllGlobals(); });

describe('jsonTopKeys', () => {
  it('giver de samme værdier som JSON.parse', () => {
    const txt = '{ "a" : [1, {"b": "x\\"]}"}], "s": "q,\\\\", "n": -1.5e3, "t": true, "z": null, "o": {"k": [[]]} }';
    const buf = new TextEncoder().encode(txt);
    expect(jsonTopKeys(buf, new Set(['a', 's', 'n', 't', 'z', 'o']))).toEqual(JSON.parse(txt));
    expect(jsonTopKeys(buf, new Set(['o']))).toEqual({ o: { k: [[]] } });
  });
  it('hele world-filen', () => {
    const buf = new Uint8Array(readFileSync(FILES.original));
    const full = JSON.parse(new TextDecoder().decode(buf));
    expect(jsonTopKeys(buf, new Set(Object.keys(full)))).toEqual(full);
  });
});

describe('fetchSlimWorld', () => {
  for (const [base, file] of Object.entries(FILES) as ['original' | 'modern', string][]) {
    it(`${base}: = slimWorld(applyCommunityEdits(databasen))`, async () => {
      const bytes = readFileSync(file);
      vi.stubGlobal('fetch', async () => new Response(bytes));
      const full = JSON.parse(bytes.toString('utf8')) as WorldData;
      const c = full.clubs[3];
      const edits: CommunityEdit[] = [{ kind: 'club', target: String(c[0]), field: 'name', value: 'Edited FC' }, { kind: 'player', target: String(full.players[0][0]), field: 'last', value: 'X' }];
      const slim = await fetchSlimWorld({ base, ver: '3.9.60', size: 'normal', edits });
      expect(slim).toEqual(slimWorld(applyCommunityEdits(full, edits)));
      expect(slim!.clubs[3][1]).toBe('Edited FC');
    });
  }
  it('en egen database: null (hele databasen som før)', async () => {
    expect(await fetchSlimWorld({ base: 'original', ver: '3.9.60', custom: {}, edits: null })).toBeNull();
  });
});
