import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    htmlPlugin(loadEnv(mode, '.')),
    ViteMinifyPlugin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: false,
    }),
    VitePWA({
      injectRegister: 'auto',
      manifest: {
        name: 'Canvas',
        short_name: 'A free canvas tool available online for building ideas.',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    minify: 'terser',
    rollupOptions: {
      plugins: [visualizer() as Plugin],
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
    exclude: ['lucide-react/icons'],
  },
}));

function htmlPlugin(env: ReturnType<typeof loadEnv>) {
  return {
    name: 'html-transform',
    transformIndexHtml: {
      order: 'pre' as const,
      handler: (html: string): string =>
        html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match),
    },
  };
}
