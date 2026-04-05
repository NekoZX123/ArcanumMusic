import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: './',
    plugins: [
        vue(),
        vueJsx(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: [
                'appIcon/ArcanumMusic.png',
                'apple-touch-icon.png',
                'pwa-192.png',
                'pwa-512.png'
            ],
            manifest: {
                name: 'Arcanum Music',
                short_name: 'Arcanum',
                description: 'Arcanum Music mobile web app',
                theme_color: '#1378ec',
                background_color: '#f5f5f5',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './',
                scope: './',
                icons: [
                    {
                        src: 'pwa-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,xml,woff2}'],
                navigateFallback: 'index.html',
                runtimeCaching: [
                    {
                        urlPattern: ({ request, url }) => {
                            return request.destination === 'audio'
                                || /\/proxy$/.test(url.pathname)
                                || /\/auth\//.test(url.pathname);
                        },
                        handler: 'NetworkOnly'
                    }
                ]
            },
            devOptions: {
                enabled: true,
                suppressWarnings: true
            }
        })
    ]
});
