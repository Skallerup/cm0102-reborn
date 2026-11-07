import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/ui/data/matchTexts.json', () => ({ default: JSON.parse(readFileSync('src/ui/data/matchTexts.json', 'utf8')) }));
import { loadMatchTexts, originalText } from '../src/ui/matchTexts';

const ctx = (lang: string) => ({ home: 'Vejle', away: 'Brøndby', score: 'Vejle 1-0 Brøndby', ref: 'Hansen', lang });

describe('originalens kommentarlinjer (CM 01/02)', () => {
  it('erstatter pladsholderne og vælger dansk/engelsk', async () => {
    await loadMatchTexts();
    for (let i = 0; i < 60; i++) {
      for (const lang of ['en', 'da']) {
        for (const k of ['save', 'foul', 'penalty', 'sub', 'yellow', 'goal', 'pl-fwd', 'pl-goalkick', 'pen-appeal', 'added-time', 'halftime', 'goal-offside']) {
          const txt = originalText({ m: 10 + i, k, a: k === 'added-time' ? '3' : 'Lauth', b: 'Schram', t: 0 }, ctx(lang), i);
          expect(txt, k).toBeTruthy();
          expect(txt, `${k}: ${txt}`).not.toMatch(/<|>|\{s\}|\|/);
        }
      }
    }
    expect(originalText({ m: 1, k: 'sub', a: 'Lauth', b: 'Schram', t: 0 }, ctx('da'), 0)).toMatch(/Lauth|Schram/);
    expect(originalText({ m: 1, k: 'halftime' }, ctx('da'), 0)).toBe('Pause. Vejle 1-0 Brøndby');
    // andre sprog bruger vores egne tekster
    expect(originalText({ m: 1, k: 'save', a: 'A', b: 'B', t: 0 }, ctx('de'), 0)).toBeNull();
    // ingen modspiller: kun varianter uden <p2>
    for (let i = 0; i < 30; i++) expect(originalText({ m: i, k: 'pl-fwd', a: 'Lauth', t: 1 }, ctx('en'), i)).not.toMatch(/undefined|  /);
  });
});
