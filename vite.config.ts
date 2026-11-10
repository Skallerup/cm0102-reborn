import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

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

export default defineConfig({
  // appens version til src/version.ts (uden at hente ændringsloggen på forsiden)
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  base: process.env.BASE_PATH ?? (process.env.VERCEL ? '/' : '/cm0102-reborn/'),
  plugins: [
    react(),
    seoHtml,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'CM Reborn',
        short_name: 'CM Reborn',
        description: 'Football manager with real players, free in your browser',
        theme_color: '#070b16',
        background_color: '#070b16',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        // store sekundære datafiler precaches ikke (de hentes ved kørsel, når de vælges):
        // karrierehistorik, den originale 2001-database og den gamle moderne database (kun til tests)
        globIgnores: ['**/data/careers*.json', '**/data/world-original*.json', '**/data/world-modern.json',
          // SEO-siderne (scripts/build-seo.ts – titusindvis af statiske sider) hører ikke til appen
          'cm-01-02/**', '2026-27/**', 'cm-01-02-*/**', 'play-cm-01-02-online/**', 'faq/**', 'changelog/**', '404.html', 'seo.css', '{da,sv,no,de,es,fr,it,pt,tr}/**', 'free-football-manager-browser-game/**'],
        // world.json (2026/27) er ~8 MB med staben fra databasen – plads til at vokse
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // guiderne (statiske SEO-sider, scripts/build-seo.ts) er rigtige sider – ikke appen
        navigateFallbackDenylist: [/^\/(play-cm-01-02-online|cm-01-02-[\w-]+|cm-01-02|2026-27|faq|changelog|free-football-manager-browser-game|da|sv|no|de|es|fr|it|pt|tr)\//, /^\/api\//, /^\/llms\.txt$/, /^\/sitemap/],
        runtimeCaching: [{
          // originalens kamplyde: hentes første gang de spilles, derefter fra cachen
          urlPattern: /\/sounds\/[\w.-]+\.m4a$/,
          handler: 'CacheFirst',
          options: { cacheName: 'match-sounds', expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 365 } },
        }, {
          // baggrundsfotos (klassisk tema): hentes først når de vises, derefter fra cachen
          urlPattern: /\/(bg|stadiums|screens)\/[\w.-]+\.jpg$/,
          handler: 'CacheFirst',
          options: { cacheName: 'backgrounds', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 } },
        }, {
          // den originale database: altid den nyeste ved nyt spil (cachen bruges kun offline) – med
          // StaleWhileRevalidate fik det første spil efter en opdatering den gamle database (fx uden Tsigalko)
          urlPattern: /\/data\/(world-original[\w-]*|world-modern)\.json$/,
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
})
