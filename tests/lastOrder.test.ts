// "Seneste spil" sættes først, når gemningen er lykkedes – og glemmes, når spillet slettes.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
describe('rækkefølgen setLast/gem', () => {
  const src = readFileSync('src/game/save.ts', 'utf8');
  it('saveGame: rememberLast efter skrivningen', () => {
    const f = src.slice(src.indexOf('export async function saveGame'), src.indexOf('const extOf'));
    expect(f.indexOf('guardWrite(')).toBeGreaterThan(0);
    expect(f.indexOf('rememberLast(')).toBeGreaterThan(f.indexOf('guardWrite('));
  });
  it('deleteSave glemmer "seneste", hvis det peger på det slettede', () => {
    const f = src.slice(src.indexOf('export async function deleteSave'), src.indexOf('export async function exportSave'));
    expect(f).toMatch(/forgetLast\(\)/);
  });
});
