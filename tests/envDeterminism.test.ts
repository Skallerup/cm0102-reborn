// Samme spil i alle miljøer (27/11): et nyt spil med den originale database skal give det samme spil bit for bit under vitest og i en almindelig
// tsx-proces (som måle-scriptene og, med samme kode, browserens Web Worker). Før slog cmShortlistGame.ts' SL_ON ønskelisterne fra, når VITEST
// var sat – så gav cmEurope.test.ts' sæson (Wrexham, frø 3) andre kampe under vitest end under tsx (Hapoel Haifa i Intertoto). Testene kører
// nu med CM_SL=0 som et åbent valg (vite.config.ts test.env), og tsx-processen får samme CM_SL – men intet af vitests eget miljø.
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { envFingerprint } from '../scripts/env-fingerprint';

const UNTIL = '2001-07-16';   // 14/7 → 15/7 var den første dag, der afveg (aiTransferTick under vitest, ønskelisterne under tsx)

describe('samme spil i alle miljøer', () => {
  it('spilmotoren læser ikke testværktøjets miljø (VITEST, NODE_ENV, import.meta.vitest)', () => {
    const bad: string[] = [];
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const f = join(d, e.name);
        if (e.isDirectory()) walk(f);
        else if (/\.tsx?$/.test(e.name) && /\bVITEST\b|NODE_ENV|import\.meta\.vitest/.test(readFileSync(f, 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, ''))) bad.push(f);
      }
    };
    walk('src/game');
    expect(bad).toEqual([]);
  });

  it('vitest og tsx giver samme dage (talrækken, resultaterne og hele GameState)', () => {
    const env: NodeJS.ProcessEnv = {};
    for (const [k, v] of Object.entries(process.env)) if (!/^(VITEST|VITE_|NODE_ENV$|TEST$|CM_GAME_CACHE|CM_TEST_)/.test(k)) env[k] = v;
    expect(env.CM_SL).toBe(process.env.CM_SL);
    // først processen (så de to spil ikke er i hukommelsen på samme tid)
    const tsx = execFileSync('npx', ['tsx', 'scripts/env-fingerprint.ts', UNTIL], { env, encoding: 'utf8', maxBuffer: 1 << 24 }).trim().split('\n');
    const here = envFingerprint(UNTIL);
    expect(here.length).toBeGreaterThan(2);
    expect(here).toEqual(tsx);
  }, 600_000);
});
