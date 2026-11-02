import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// base: roden på Vercel, repo-navnet på GitHub Pages (sættes af workflowet)
export default defineConfig({
  base: process.env.BASE_PATH ?? (process.env.VERCEL ? '/' : '/cm0102-reborn/'),
  plugins: [
    react(),
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
        globIgnores: ['**/data/careers.json', '**/data/world-original.json', '**/data/world-modern.json'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [{
          urlPattern: /\/data\/(careers|world-original|world-modern)\.json$/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'big-data', expiration: { maxEntries: 4 } },
        }, {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
          handler: 'CacheFirst',
          options: { cacheName: 'fonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
        }, {
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/luukhopman\/football-logos/,
          handler: 'CacheFirst',
          options: { cacheName: 'club-logos', expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 90 }, cacheableResponse: { statuses: [0, 200] } },
        }],
      },
    }),
  ],
  worker: { format: 'es' },
})
