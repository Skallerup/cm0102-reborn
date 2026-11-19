// Ægte tilstand: alle nyheder en soak-periode producerer har en brødtekst – undtagen de nøgler, hvor originalen selv kun har overskriften.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// common.tsx trækker analytics.ts med (window ved indlæsning) – i Node en tom stand-in
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });

import { createGame, type WorldData } from '../src/game/newgame';
import { runUntil } from '../src/game/sim';
import { gs } from '../src/game/state';
import { newsBody } from '../src/ui/screens/common';

/** Originalen har ingen brødtekst til disse (kun overskriften) – dokumenteret, ikke en mangel */
const HEADLINE_ONLY = new Set<string>([]);

describe('nyheder i ægte tilstand har brødtekst', () => {
  it('45 dage fra spilstart (Vejle, original DB)', async () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const dk = w.nations.findIndex((n) => n.name === 'Denmark');
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: dk, clubId: w.clubs.find((c) => c[1].startsWith('Vejle'))![0], activeNations: [dk, eng], lang: 'en', masking: true, seed: 11, mode: 'authentic' });
    const g = gs();
    const end = new Date(Date.parse(g.date) + 45 * 86400000).toISOString().slice(0, 10);
    await runUntil({ untilDate: end, autoPlay: true, maxDays: 60 });
    const missing = new Map<string, number>();
    for (const n of g.news) if (!HEADLINE_ONLY.has(n.key) && !newsBody(n)) missing.set(n.key, (missing.get(n.key) ?? 0) + 1);
    expect(g.news.length).toBeGreaterThan(20);
    expect([...missing.entries()]).toEqual([]);
  }, 600_000);

  it('egne handler (Lasse Lauth moves from … for £65,000) har brødtekst', () => {
    const base = { cat: 'transfer' as const, id: 1, date: '2001-07-27', read: false, params: { player: 'Lasse Lauth', last: 'Lauth', from: 'Vejle', to: 'Cheltenham', fee: 65_000 } };
    for (const key of ['transfer.done', 'transfer.freeDone', 'transfer.loanDone', 'transfer.o.0', 'transfer.o.3', 'transfer.oFree.2']) {
      expect(newsBody({ ...base, key } as never), key).toBeTruthy();
    }
  });
});
