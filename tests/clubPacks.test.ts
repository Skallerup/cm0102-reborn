import { describe, expect, it } from 'vitest';
import { normClub } from '../src/ui/backgrounds';

describe('klubpakker matches på klubnavnet', () => {
  it('ignorerer FC, accenter og tegn', () => {
    expect(normClub('Chelsea FC')).toBe(normClub('Chelsea'));
    expect(normClub('Atlético Madrid')).toBe('atletico madrid');
    expect(normClub('A.F.C. Bournemouth')).toBe(normClub('Bournemouth'));
  });
  it('blander ikke klubber sammen', () => {
    expect(normClub('Manchester United')).not.toBe(normClub('Manchester City'));
    expect(normClub('Chelsea')).not.toBe(normClub('Chelsea Reserves'));
  });
});
