// Ægte tilstand: alle nyheder en soak-periode producerer har en brødtekst – undtagen de nøgler, hvor originalen selv kun har overskriften.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// common.tsx trækker analytics.ts med (window ved indlæsning) – i Node en tom stand-in
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });

import { createGame, type WorldData } from '../src/game/newgame';
import { runUntil } from '../src/game/sim';
import { gs } from '../src/game/state';
import { newsBody } from '../src/ui/screens/common';
import { ensureLang, setLang } from '../src/i18n';

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

  it('nyheder uden egne pladser i selve spillet (pokalvinder, op-/nedrykning, kontrakt, rekord) har brødtekst på en og da', async () => {
    const mk = (key: string, params: Record<string, unknown>) => ({ cat: 'general' as const, id: 1, date: '2001-08-12', read: false, key, params });
    const items = [
      mk('news.cupWin', { club: 'Liverpool', comp: 'Charity Shield', body: 'win', a: 2, b: 1, opp: 'Man Utd' }),
      mk('news.cupWin', { club: 'Liverpool', comp: 'FA Cup', body: 'agg', a: 3, b: 1, opp: 'Man Utd' }),
      mk('news.cupWin', { club: 'Liverpool', comp: 'Charity Shield', body: 'plain' }),
      mk('news.cupWin', { club: 'Liverpool', comp: 'Charity Shield' }), // gamle gemte nyheder uden brødtekstens felter
      mk('news.playoffWin', { club: 'Liverpool', comp: 'Playoff', body: 'plain' }),
      mk('news.promoted', { club: 'Man City', comp: 'English Premier Division' }),
      mk('news.relegated', { club: 'Southampton', comp: 'English First Division' }),
      mk('contract.left', { player: 'Neil Wood' }),
      mk('transfer.bosmanDone', { player: 'Ronny Johnsen', from: 'Man Utd', to: 'Feyenoord' }),
      ...['signing2', 'signing3', 'renew2', 'renew3', 'leave.sold2', 'leave.sold3', 'leave.released2', 'leave.released3', 'leave.free2', 'leave.free3'].map((k) => mk(`fans.${k}`, { player: 'Verón', club: 'Man Utd' })),
      mk('recb.news.apps', { player: 'Verón', n: 61 }),
    ];
    for (const lang of ['en', 'da'] as const) {
      await ensureLang(lang); setLang(lang);
      for (const n of items) expect(newsBody(n as never), `${lang} ${n.key} ${JSON.stringify(n.params)}`).toMatch(/\S/);
    }
    setLang('en');
    expect(newsBody(items[0] as never)).toBe('Liverpool have won the Charity Shield with a 2-1 win over Man Utd.');
  });
});
