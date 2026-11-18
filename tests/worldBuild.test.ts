// De originale world-filer skal komme fra scripts/build-cm-data.mts – ikke rettes i hånden. 7597c59/33da7e8 rettede world-original.json
// direkte, så parseren ikke længere gav den committede fil (fx 49 spillere og 4 skjulte klubber ind, 8 spillere ud). Byggescriptet skriver
// filens sha256 i scripts/data/world-builds.json; denne test fanger en fil, der er ændret uden byggescriptet. Selve genbygningen fra kilderne
// (kræver .orig-db lokalt): npx tsx scripts/world-repro.ts
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Entry = { source: string; season: number; noLegacy?: boolean; sha256: string; careers?: string; careersSha256?: string; cm?: string; cmSha256?: string; cmStaff?: string; cmStaffSha256?: string; reproducible: boolean; note?: string };
const LOG = JSON.parse(readFileSync('scripts/data/world-builds.json', 'utf8')) as Record<string, Entry>;
const sha = (f: string) => createHash('sha256').update(readFileSync(f)).digest('hex');
const HINT = 'Filen er ændret uden scripts/build-cm-data.mts. Genbyg den fra kilden (se CLAUDE.md – byggescriptet opdaterer scripts/data/world-builds.json), og tjek med npx tsx scripts/world-repro.ts';

describe('world-filerne er bygget af byggescriptet', () => {
  it('alle originale world-filer står i byggeloggen', () => {
    const files = readdirSync('public/data').filter((f) => /^world-original.*\.json$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(LOG[f], `${f} mangler i scripts/data/world-builds.json`).toBeDefined();
  });
  for (const [file, e] of Object.entries(LOG)) {
    it(`${file} har byggeloggens sha256`, () => {
      const path = `public/data/${file}`;
      if (!existsSync(path)) return; // fx world.json, når den moderne database ikke ligger lokalt
      expect(sha(path), `${file}: ${HINT}`).toBe(e.sha256);
      if (e.careers && e.careersSha256 && existsSync(`public/data/${e.careers}`)) expect(sha(`public/data/${e.careers}`), `${e.careers}: ${HINT}`).toBe(e.careersSha256);
      if (e.cm && e.cmSha256 && existsSync(`public/data/${e.cm}`)) expect(sha(`public/data/${e.cm}`), `${e.cm}: ${HINT}`).toBe(e.cmSha256);
      if (e.cmStaff && e.cmStaffSha256 && existsSync(`public/data/${e.cmStaff}`)) expect(sha(`public/data/${e.cmStaff}`), `${e.cmStaff}: ${HINT}`).toBe(e.cmStaffSha256);
    });
  }
  it('kilderne er de aftalte (memory original-databases): 3.9.60 Swedish_fixed, 3.9.65 officiel, 3.9.68 uden legender', () => {
    expect(LOG['world-original.json']?.source).toMatch(/Original-3\.9\.60-Database-Swedish_fixed$/);
    expect(LOG['world-original-3965.json']?.source).toMatch(/Data-3\.9\.65$|Original-3\.9\.65-Database$/);
    expect(LOG['world-original-3968.json']?.source).toMatch(/Original-3\.9\.68-Database$/);
    expect(LOG['world-original-3968.json']?.noLegacy).toBe(true);
  });
});
