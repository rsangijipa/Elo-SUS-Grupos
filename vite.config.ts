import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  build: {
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase/')) return 'vendor-firebase'
          if (id.includes('recharts')) return 'vendor-charts'
          if (id.includes('@react-google-maps/api')) return 'vendor-maps'
        }
      }
    }
  },
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'elosusgrupos_logo.png', 'offline.html'],
      manifest: {
        name: 'EloSUS Grupos — Plataforma Terapêutica',
        short_name: 'EloSUS',
        description: 'Plataforma de Grupos Terapêuticos do SUS — Saúde Mental Coletiva',
        theme_color: '#0054A6',
        background_color: '#F8F9FC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['health', 'medical'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'elosusgrupos_setting_login.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Tela de Login EloSUS'
          },
          {
            src: 'elosusgrupos_setting_login.png',
            sizes: '720x1280',
            type: 'image/png',
            label: 'Experiencia mobile do EloSUS'
          }
        ],
        shortcuts: [
          {
            name: 'Meu Grupo',
            short_name: 'Meu Grupo',
            description: 'Acesso rapido ao grupo atual',
            url: '/my-group'
          },
          {
            name: 'Registrar Humor',
            short_name: 'Humor',
            description: 'Registrar humor do dia',
            url: '/dashboard'
          }
        ]
      },
      workbox: {
        // Precache app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching strategies
        runtimeCaching: [
          {
            // Google Fonts CSS
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Firebase Auth + Firestore REST
            urlPattern: /^https:\/\/(www\.googleapis\.com|firestore\.googleapis\.com|identitytoolkit\.googleapis\.com)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-api',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
        ],
        // Offline fallback page
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
      }
    })
  ],
})
