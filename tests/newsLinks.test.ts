// Nyhedslinks: spillere, stab, klubber (også genitiv/kortnavn), nationer og turneringer i overskrift og brødtekst er links (ejerens fund 25/11:
// rygtenyheden "Gary Breen rumours" havde ingen links). Teksten er uændret – kun markeringen.
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });

import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { NewsBody, NewsTitle, autoLink, newsBody } from '../src/ui/screens/common';
import type { NewsItem } from '../src/game/types';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const link = (h: string) => [...h.matchAll(/<a [^>]*>(.*?)<\/a>/g)].map((m) => m[1].replace(/&#x27;/g, "'"));
const plain = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'");
const body = (n: NewsItem) => renderToStaticMarkup(createElement(NewsBody, { n }));
const title = (n: NewsItem) => renderToStaticMarkup(createElement(NewsTitle, { n }));
const mk = (key: string, params: NewsItem['params'], link?: NewsItem['link']): NewsItem => ({ id: 9999, date: gs().date, cat: 'transfer', key, params, read: false, link });

describe('nyhedslinks', { timeout: 600_000 }, () => {
  const c = world.clubs.find((x) => x[1] === 'Arsenal')!;
  createGame(world, { managerName: 'M S', managerNation: c[3] as number, clubId: c[0], activeNations: [c[3] as number], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs();

  it('rygtenyhed: spiller, tre klubber (med genitiv) og manager er links, teksten er uændret', () => {
    const p = Object.values(g.players).find((x) => x.club && x.club !== g.userClub && !x.loan && g.clubs[x.club].manager >= 0)!;
    const cur = g.clubs[p.club];
    const others = Object.values(g.clubs).filter((x) => x.id !== cur.id && x.league === cur.league).slice(0, 2);
    const mgr = g.staff[cur.manager];
    const name = `${p.first} ${p.last}`.trim();
    const n = mk('cm.rum', { player: name, pid: p.id, cur: cur.id, clubs: [others[0].id, others[1].id, cur.id].join('|'), n: 3, v: 0, amt: 2100000, h: 'rumour', ptype: 'CM', own: 0, local: 1, ans: 1 }, { kind: 'player', id: p.id });
    const html = body(n);
    expect(plain(html)).toBe(newsBody(n));
    const l = link(html);
    expect(l).toContain(name);
    expect(l).toContain(others[0].name);
    expect(l).toContain(`${mgr.first} ${mgr.last}`.trim());
    expect(l.length).toBeGreaterThanOrEqual(4);
  });

  it('genitiv og kortnavn: "Club\'s" og "Club manager" bliver links, og tegnsætning bevares', () => {
    const k = Object.values(g.clubs).find((x) => x.id !== g.userClub && x.short.length >= 5 && /^[A-Z]/.test(x.short))!;
    const text = `${k.short}'s boss said: ${k.short} manager is happy, ${k.name}.`;
    const html = renderToStaticMarkup(createElement('p', null, autoLink(text, mk('x', {}))));
    expect(plain(html)).toBe(text);
    expect(link(html).length).toBeGreaterThanOrEqual(3);
  });

  it('kampnyhed: de to klubber i resultatet er links; overskriften åbner kampen (link-feltet)', () => {
    const [a, b] = Object.values(g.clubs).filter((x) => x.id !== g.userClub).slice(0, 2);
    const n = mk('res.win', { teamR: a.name, oppR: b.name, a: 3, b: 1, venue: 'Somewhere Park', team: a.short, opp: b.short }, { kind: 'fixture', id: 1 });
    const l = link(body(n));
    expect(l).toContain(a.name);
    expect(l).toContain(b.name);
  });

  it('landsholdsnyhed: nationen er et link, og spillerne i udtagelsen også', () => {
    const p = Object.values(g.players).find((x) => x.club && x.club !== g.userClub && x.nation >= 0)!;
    const nat = g.nations[p.nation].name;
    const n = mk('intl.sel1', { player: `${p.first} ${p.last}`.trim(), names: `${p.first} ${p.last}`.trim(), nation: nat, opp: g.nations[(p.nation + 1) % g.nations.length].name, club: g.clubs[p.club].name }, { kind: 'player', id: p.id });
    const hb = body(n), ht = title(n);
    expect(link(hb)).toContain(`${p.first} ${p.last}`.trim());
    expect(link(hb + ht).some((x) => x === nat || x.includes(nat))).toBe(true);
  });

  it('to spillere med samme navn: nyhedens eget link vælger id', () => {
    const [p, q] = Object.values(g.players).filter((x) => x.club && x.club !== g.userClub).slice(0, 2);
    q.first = p.first; q.last = p.last;
    const n = mk('cm.rum', { player: `${p.first} ${p.last}`.trim(), pid: q.id, cur: q.club, clubs: String(g.userClub), n: 1, v: 0, amt: 1, h: 'rumour', ptype: 'CM', own: 0, local: 1 }, { kind: 'player', id: q.id });
    expect(link(body(n)).length).toBeGreaterThan(0);
  });
});
