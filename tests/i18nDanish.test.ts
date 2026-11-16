// Dansk i ægte tilstand: ingen nyhed må stå på engelsk (cmBoardText, cmban.*, cmaw.* … blev før bygget direkte på engelsk i TS).
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
// en import trækker analytics.ts med (window ved indlæsning) – i Node en tom stand-in
vi.hoisted(() => { (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {}, location: { search: '', hostname: 'localhost', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }) }; });
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { ensureLang, setLang } from '../src/i18n';
import { setCompEra } from '../src/i18n/comps';
import { newsBody, newsTitle } from '../src/ui/screens/common';
import { cmBoardRequest, cmBoardUltimatum } from '../src/game/cmBoardGame';
import { confidenceText, expectBody, expectTitle, requestReply, requestTitle, ultimatumBody, ultimatumConfirm, ultimatumTitle } from '../src/game/cmBoardText';
import DA_PACK from '../src/game/data/cmBoard.da.json';
import BT from '../src/game/data/cmBoardTexts.json';

/** typiske engelske ord – en dansk tekst må ikke indeholde dem som egne ord */
const EN_WORDS = /(?<!\p{L})(the|has|were|will|expect|expects|appoint|appoints|announce|board|your|with|from|this|season|agree|refuse|request|his|she|was|and|of|are|is)(?!\p{L})/iu;

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const nat = (n: string) => world.nations.findIndex((x) => x.name === n);

describe('bestyrelsens tekster på dansk', () => {
  it('alle 290 blade er oversat og har de samme pladsholdere', () => {
    const S = (BT as { S: string[] }).S;
    expect(DA_PACK.S).toHaveLength(S.length);
    S.forEach((en, i) => {
      const d = DA_PACK.S[i];
      expect(d === '' ? en === '' : d.length > 0, `blad ${i}`).toBe(true);
      expect((d.match(/\{club\}/g) ?? []).length, `blad ${i} club`).toBe((en.match(/\{club\}/g) ?? []).length);
      expect((d.match(/\{n\}/g) ?? []).length, `blad ${i} n`).toBe((en.match(/\{n\}/g) ?? []).length);
      expect(EN_WORDS.test(d), `blad ${i}: ${d}`).toBe(false);
    });
  });
  it('alle skabeloner findes på dansk, og ingen står på engelsk', async () => {
    await ensureLang('da');
    setLang('da');
    const out: string[] = [];
    for (const f of [0x400, 0x2, 0x85, 0x30, 0x308, 0x1, 0x401, 0x101, 0x402, 0x102, 0x4, 0x404, 0x104, 0x8, 0x408, 0x108, 0x40, 0x440, 0x140, 0x10, 0x410, 0x110, 0x20, 0x420, 0x120, 0x800])
      for (const ne of [false, true]) for (const ap of [false, true]) { out.push(expectTitle(f), expectBody('Vejle Boldklub', f, ne, ap)); }
    out.push(expectTitle(0, true));
    for (let req = 1; req <= 7; req++) { out.push(requestTitle(req)); for (let code = 0; code < 14; code++) out.push(requestReply('Vejle Boldklub', req, code)); out.push(ultimatumConfirm('Vejle', req)); }
    for (let type = 1; type <= 3; type += 2) for (let req = 1; req <= 4; req++) for (let sub = 1; sub <= 4; sub++) for (const res of [1, 2, 3, 4]) {
      out.push(ultimatumTitle(type, req, res, 'Vejle'), ultimatumBody(type, req, sub, 'Vejle Boldklub', 'Martin Skallerup', 'Vejle Stadion', true, true), ultimatumBody(type, req, sub, 'Vejle Boldklub', 'Martin Skallerup', 'Vejle Stadion', false, false));
    }
    const base = { club: 'Vejle Boldklub', days: 100, wealth: 0, leagueBand: 3, confBand: 3, runType: 1, runLen: 3, arrogDays: 9999, conf: 5000, fans: 0 };
    for (const conf of [5000, 4000, 3600]) for (const fans of [-800, -600, 0, 1600]) for (const arrogDays of [10, 9999]) out.push(confidenceText({ ...base, conf, fans, arrogDays }));
    const bad = out.filter((x) => x && EN_WORDS.test(x.replace(/Vejle Boldklub|Vejle Stadion|Martin Skallerup/g, '')));
    expect(bad.slice(0, 5)).toEqual([]);
    expect(out.length).toBeGreaterThan(400);
    setLang('en');
    expect(expectTitle(0x2)).toBe('Board want the title');
    setLang('da');
  });
});

describe('dansk i ægte tilstand', () => {
  it('nyhederne står på dansk (60 dage, Vejle)', async () => {
    await ensureLang('da');
    setLang('da');
    const cid = world.clubs.find((c) => c[1] === 'Vejle Boldklub')![0];
    createGame(world, { managerName: 'Martin Skallerup', managerNation: nat('Denmark'), clubId: cid, activeNations: [nat('Denmark'), nat('England')], lang: 'da', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    setCompEra(true, g.season);
    for (let i = 0; i < Number(process.env.I18N_DAYS ?? 60); i++) {
      const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
      if (i === 10) for (const q of [1, 2, 3, 4, 5] as const) cmBoardRequest(g, q);
      if (i === 12) cmBoardUltimatum(g, 3);
    }
    const bad: string[] = [];
    const seen = new Set<string>();
    let n = 0;
    for (const item of g.news) {
      setLang('da');
      const d = [newsTitle(item), newsBody(item)];
      setLang('en');
      const e = [newsTitle(item), newsBody(item)];
      for (let i = 0; i < 2; i++) {
        if (!d[i]) continue;
        n++;
        const sig = `${item.key}|${i}|${d[i]}`;
        if (seen.has(sig)) continue;
        if (d[i] === e[i] && EN_WORDS.test(d[i])) { seen.add(sig); bad.push(`${item.key} [${i ? 'body' : 'title'}]: ${d[i].slice(0, 110).replace(/\n/g, ' ')}`); }
      }
    }
    setLang('da');
    console.log(`tjekkede ${n} tekster, ${bad.length} engelske nøgler`);
    expect(bad, bad.join('\n')).toEqual([]);
  }, 3_600_000);
});
