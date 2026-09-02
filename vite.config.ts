import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 등록은 main.tsx에서 직접 한다. 기본값 'auto'는 registerSW.js를 따로 주입해 이중 등록이 된다.
      injectRegister: null,
      // manifest에 없는 아이콘만 따로 넣는다. manifest의 아이콘과 webmanifest 자체는 플러그인이 알아서 프리캐시한다.
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: '별고비팀 · 고비사막+테를지 5박 6일',
        short_name: '별고비팀',
        description: '별고비팀 몽골 여행의 일정, 준비물, 정산을 신호가 없는 곳에서도 확인해요.',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#19382f',
        background_color: '#f2f0e8',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,jpg}'],
        navigateFallback: 'index.html',
        // 일정·준비물·정산은 번들과 localStorage에만 기대므로 셸만 캐시하면 오프라인에서 그대로 열린다.
        runtimeCaching: [
          {
            // 한 번 본 지도 타일은 다시 받지 않는다. 미리 긁어오는 것은 OSM 타일 정책 위반이라 하지 않는다.
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Open-Meteo는 일부러 뺐다. 서비스워커가 가로채면 예보를 스텁하는 e2e가 무력해지고,
        // 오래된 예보를 조용히 되돌려주면 사용자가 그것을 최신으로 오해한다.
      },
    }),
  ],
  test: { include: ['src/**/*.test.{ts,tsx}'] },
})
