// Fællesskabets rettelser (ui/world.ts withCommunityEdits): kun de rettede rækker kopieres (hukommelse, 21/11 – før en hel kopi af databasen),
// og den delte database forbliver uændret.
import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/online/hub', () => ({
  approvedEdits: async () => ({ edits: [
    { kind: 'player', target: '2', field: 'last', value: 'Nyt' },
    { kind: 'player', target: '2', field: 'attr', value: '1:20' },
    { kind: 'club', target: '10', field: 'name', value: 'FC Ny' },
    { kind: 'club', target: '10', field: 'color', value: '#111111,#222222' },
  ] }),
}));
import { withCommunityEdits } from '../src/ui/world';

describe('withCommunityEdits', () => {
  it('retter kopien, ikke databasen, og deler de uændrede rækker', async () => {
    const base = {
      kind: 'cm0102', playerFields: ['id', 'first', 'last'],
      players: [[1, 'A', 'Aa'], [2, 'B', 'Bb']], clubs: [[10, 'FC', 'F'], [11, 'IF', 'I']],
      ratings: { 2: { attrs: [5, 6, 7] }, 1: { attrs: [1, 1, 1] } }, clubColors: { 10: ['#000', '#fff'] },
    };
    const snap = structuredClone(base);
    const w = await withCommunityEdits(base as never, 'original') as unknown as typeof base;
    expect(base).toEqual(snap);
    expect(w.players[1]).toEqual([2, 'B', 'Nyt']);
    expect(w.ratings[2].attrs).toEqual([5, 20, 7]);
    expect(w.clubs[0]).toEqual([10, 'FC Ny', 'F']);
    expect(w.clubColors[10]).toEqual(['#111111', '#222222']);
    expect(w.players[0]).toBe(base.players[0]);
    expect(w.clubs[1]).toBe(base.clubs[1]);
    expect(w.ratings[1]).toBe(base.ratings[1]);
  });
});
