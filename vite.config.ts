/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { ramBudget } from './scripts/ram-budget.mjs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

// base: roden på Vercel, repo-navnet på GitHub Pages (sættes af workflowet)
// søgemaskiner: Search Console-verifikation (VITE_GSC_TOKEN) og noindex på kopien på GitHub Pages,
// så kun cm0102reborn.com bliver indekseret
const seoHtml = {
  name: 'seo-html',
  transformIndexHtml(html: string) {
    const token = process.env.VITE_GSC_TOKEN?.trim();
    const tags = [token ? `<meta name="google-site-verification" content="${token}" />` : '', process.env.BASE_PATH ? '<meta name="robots" content="noindex" />' : ''].filter(Boolean).join('\n    ');
    return html.replace('<!--%SEARCH_CONSOLE%-->', tags);
  },
}

// CI (28/11): GitHubs maskiner er 2–5× langsommere pr. testfil end Mac mini'en og har ingen createGame-cache (tests/helpers/gameCache.ts) – de
// faste tidsgrænser i testfilerne (`}, 120_000)` og `{ timeout: 600_000 }`, sat efter lokale tider) vinder over `--testTimeout`, så tunge tests
// faldt på tiden alene (authentic, gridSim, gridStats, newsTypes, miniReport, cmBoard, scoutBgMatch). I CI ganges de med CI_TIMEOUT_FACTOR
// (standard 5) – kun tidsgrænserne; et forløb, der hænger, fejler stadig. Lokalt (også scripts/test.mjs) urørt.
const ciTimeouts = {
  name: 'ci-test-timeouts',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!process.env.CI || !process.env.VITEST || !/\/tests\/[^/]+\.test\.tsx?$/.test(id)) return null;
    const k = Number(process.env.CI_TIMEOUT_FACTOR ?? 5);
    const scale = (n: string) => String(Math.round(Number(n.replace(/_/g, '')) * k));
    const out = code
      .replace(/^(\s*\}\s*,\s*)(\d[\d_]{3,})(\s*\))/gm, (_m, a: string, n: string, b: string) => a + scale(n) + b)
      .replace(/(\{\s*timeout:\s*)(\d[\d_]{3,})/g, (_m, a: string, n: string) => a + scale(n));
    return out === code ? null : { code: out, map: null };
  },
}

if (!process.env.CI && process.env.CM_GAME_CACHE === undefined) process.env.CM_GAME_CACHE = '1';   // arves af test-workers

export default defineConfig({
  // appens version til src/version.ts (uden at hente ændringsloggen på forsiden)
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  base: process.env.BASE_PATH ?? (process.env.VERCEL ? '/' : '/cm0102-reborn/'),
  plugins: [
    react(),
    seoHtml,
    ciTimeouts,
    VitePWA({
      // prompt: siden genindlæser aldrig af sig selv – en ny version tages i brug ved næste besøg eller via knappen (ui/UpdateToast.tsx)
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'CM Reborn',
        short_name: 'CM Reborn',
        description: 'Championship Manager 01/02 in your browser – free: the original database and the original match engine, ported',
        theme_color: '#070b16',
        background_color: '#070b16',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        // gamle versioners forhåndscache (hash-nøgler) ryddes ved hver ny service worker – ellers hober de sig op på spillerens disk (fuld disk 20/11)
        cleanupOutdatedCaches: true,
        // store sekundære datafiler precaches ikke (de hentes ved kørsel, når de vælges):
        // karrierehistorik, den originale 2001-database og den gamle moderne database (kun til tests)
        globIgnores: ['**/data/careers*.json', '**/data/world-original*.json', '**/data/world-modern.json', '**/data/world-cm-staff.json',
          // SEO-siderne (scripts/build-seo.ts – titusindvis af statiske sider) hører ikke til appen
          'cm-01-02/**', '2026-27/**', 'cm-01-02-*/**', 'play-cm-01-02-online/**', 'faq/**', 'changelog/**', 'about/**', '404.html', 'seo.css', 'build.json', '{da,sv,no,de,es,fr,it,pt,tr}/**', 'free-football-manager-browser-game/**'],
        // world.json (2026/27) er ~8 MB med staben fra databasen – plads til at vokse
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // guiderne (statiske SEO-sider, scripts/build-seo.ts) er rigtige sider – ikke appen
        navigateFallbackDenylist: [/^\/(play-cm-01-02-online|cm-01-02-[\w-]+|cm-01-02|2026-27|faq|changelog|about|free-football-manager-browser-game|da|sv|no|de|es|fr|it|pt|tr)\//, /^\/api\//, /^\/llms\.txt$/, /^\/sitemap/],
        runtimeCaching: [{
          // originalens kamplyde: hentes første gang de spilles, derefter fra cachen
          urlPattern: /\/sounds\/[\w.-]+\.m4a$/,
          handler: 'CacheFirst',
          options: { cacheName: 'match-sounds', expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 365 } },
        }, {
          // baggrundsfotos (klassisk tema): hentes først når de vises, derefter fra cachen
          urlPattern: /\/(bg|stadiums|screens|original-bg)\/[\w.-]+\.(jpg|webp)$/,
          handler: 'CacheFirst',
          options: { cacheName: 'backgrounds', expiration: { maxEntries: 140, maxAgeSeconds: 60 * 60 * 24 * 365 } },
        }, {
          // den originale database: altid den nyeste ved nyt spil (cachen bruges kun offline) – med
          // StaleWhileRevalidate fik det første spil efter en opdatering den gamle database (fx uden Tsigalko)
          urlPattern: /\/data\/(world-original[\w-]*|world-modern|world-cm-staff)\.json$/,
          handler: 'NetworkFirst',
          options: { cacheName: 'big-data', networkTimeoutSeconds: 15, expiration: { maxEntries: 8 } },
        }, {
          urlPattern: /\/data\/careers[\w-]*\.json$/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'big-data', expiration: { maxEntries: 6 } },
        }, {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
          handler: 'CacheFirst',
          options: { cacheName: 'fonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
        }, {
          urlPattern: /^https:\/\/(cdn\.jsdelivr\.net\/gh\/luukhopman\/football-logos|r2\.thesportsdb\.com\/images\/media\/team\/badge)\//,
          handler: 'CacheFirst',
          options: { cacheName: 'club-logos', expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 90 }, cacheableResponse: { statuses: [0, 200] } },
        }],
      },
    }),
  ],
  worker: { format: 'es' },
  // Lokalt højst 3 test-workers: hver indlæser world-filerne (~1,2 GB), og 11 parallelle (standard = kerner-1) fyldte
  // de 16 GB og fik Mac mini'en til at gå ned 17/11 (WindowServer-watchdog). CI bruger standarden. Er Chrome lukket (og ≥ 6 GB ledig), 5
  // (scripts/ram-budget.mjs; CM_TEST_WORKERS=n overstyrer).
  // createGame gennem cachen på disken (tests/helpers/gameCache.ts): til som standard lokalt (nyt spil med den originale database = 18-25 s; med
  // cachen ~1 s), fra i CI og med CM_GAME_CACHE=0. snapCarry.test.ts slår den selv fra (den afprøver et nybygget spil i en ny proces).
  // Lokalt 120 s pr. test: under belastning (flere agenter) ramte 5 s-standarden falske fejl. CI giver selv --testTimeout.
  // CM_SL=0: ønskelisterne (cmShortlistGame.ts SL_ON) fra som standard i testene (~2 s pr. spilledag) – et åbent valg, ikke en skjult
  // VITEST-gren i spillet, så en test giver samme spil som `CM_SL=0 npx tsx …` (tests/envDeterminism.test.ts); CM_SL=1 slår dem til.
  test: { env: { CM_SL: process.env.CM_SL ?? '0' }, testTimeout: process.env.CI ? undefined : 120_000, maxWorkers: process.env.CI ? undefined : ramBudget().testWorkers, setupFiles: [
    // scripts/test.mjs (testresultat-cachen) optager de læste filer – først, så testfilens egne læsninger på topniveau kommer med
    ...(process.env.CM_TEST_RECORD && !process.env.CI ? ['tests/helpers/recordReads.ts'] : []),
    ...(process.env.CM_GAME_CACHE !== '0' && !process.env.CI ? ['tests/helpers/setupGameCache.ts'] : []),
  ] },
})
