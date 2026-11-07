import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/ui/data/matchTexts.json', () => ({ default: JSON.parse(readFileSync('src/ui/data/matchTexts.json', 'utf8')) }));
import { loadMatchTexts, originalReport, originalSounds, originalText } from '../src/ui/matchTexts';

const ctx = (lang: string) => ({ home: 'Vejle', away: 'Brøndby', score: 'Vejle 1-0 Brøndby', ref: 'Hansen', lang });

describe('originalens kommentarlinjer (CM 01/02)', () => {
  it('erstatter pladsholderne og vælger dansk/engelsk', async () => {
    await loadMatchTexts();
    for (let i = 0; i < 60; i++) {
      for (const lang of ['en', 'da', 'de', 'es', 'fr', 'it', 'pt']) {
        for (const k of ['save', 'foul', 'penalty', 'sub', 'yellow', 'goal', 'pl-fwd', 'pl-goalkick', 'pen-appeal', 'added-time', 'halftime', 'goal-offside']) {
          const txt = originalText({ m: 10 + i, k, a: k === 'added-time' ? '3' : 'Lauth', b: 'Schram', t: 0 }, ctx(lang), i);
          expect(txt, k).toBeTruthy();
          expect(txt, `${k}: ${txt}`).not.toMatch(/<|>|\{s\}|\|/);
        }
      }
    }
    expect(originalText({ m: 1, k: 'sub', a: 'Lauth', b: 'Schram', t: 0 }, ctx('da'), 0)).toMatch(/Lauth|Schram/);
    expect(originalText({ m: 1, k: 'halftime' }, ctx('da'), 0)).toBe('Pause. Vejle 1-0 Brøndby');
    // oversatte sprog: samme linjer uden pladsholdere; ukendt sprog → vores egne tekster
    for (const lang of ['de', 'es', 'fr', 'it', 'pt', 'tr']) for (let i = 0; i < 20; i++) for (const k of ['save', 'foul', 'pen-appeal', 'pl-fwd', 'yellow']) {
      const txt = originalText({ m: i, k, a: 'Lauth', b: 'Schram', t: 0 }, ctx(lang), i);
      expect(txt, `${lang} ${k}`).toBeTruthy();
      expect(txt, `${lang} ${k}: ${txt}`).not.toMatch(/<|>|\{s\}|\|/);
    }
    expect(originalText({ m: 1, k: 'save', a: 'A', b: 'B', t: 0 }, ctx('xx'), 0)).toBeNull();
    // ingen modspiller: kun varianter uden <p2>
    for (let i = 0; i < 30; i++) expect(originalText({ m: i, k: 'pl-fwd', a: 'Lauth', t: 1 }, ctx('en'), i)).not.toMatch(/undefined|  /);
  });
  it('kampreferatet bruger rapportlinjen i datid (samme variant som kommentaren)', async () => {
    await loadMatchTexts();
    for (let i = 0; i < 40; i++) for (const lang of ['en', 'da', 'de']) for (const k of ['save', 'foul', 'goal', 'pl-fwd', 'ai-push', 'pl-icpt']) {
      const rep = originalReport({ m: i, k, a: 'Lauth', b: 'Schram', t: 0 }, ctx(lang), i);
      expect(rep?.length, `${lang} ${k}`).toBeGreaterThan(0);
      for (const r of rep!) expect(r, `${lang} ${k}: ${r}`).not.toMatch(/<|>|\{s\}|\|/);
    }
    // CM 01/02: "<t> go to an attacking style" → "<t> went to an attacking style"
    const all = Array.from({ length: 30 }, (_, i) => originalReport({ m: 1, k: 'ai-push', t: 0 }, ctx('en'), i)!.join(' '));
    expect(all.some((x) => /^Vejle went /.test(x))).toBe(true);
    expect(originalText({ m: 1, k: 'ai-push', t: 0 }, ctx('en'), 0)).not.toMatch(/went/);
  });
  it('hver linje har originalens lyd fra den samme variant (CM 01/02 events_eng.cfg)', async () => {
    await loadMatchTexts();
    expect(originalSounds({ m: 1, k: 'yellow', a: 'Lauth', t: 0 }, ctx('en'), 0)).toEqual(['whist3']);
    expect(originalSounds({ m: 1, k: 'kickoff', t: 0 }, ctx('da'), 0)).toContain('startgam');
    const { existsSync } = await import('node:fs');
    for (const k of ['save', 'corner', 'pl-fwd', 'offside', 'post']) for (const s of originalSounds({ m: 3, k, a: 'A', b: 'B', t: 0 }, ctx('en'), 4)) expect(existsSync(`public/sounds/${s}.m4a`), s).toBe(true);
  });
});
