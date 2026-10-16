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
        name: 'Championship Manager 01/02 Reborn',
        short_name: 'CM 01/02',
        description: 'Fodboldmanager i CM 01/02-stil med rigtige spillere',
        theme_color: '#16285a',
        background_color: '#0f1d3d',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  worker: { format: 'es' },
})
