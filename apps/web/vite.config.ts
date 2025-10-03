import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { visualizer } from 'rollup-plugin-visualizer';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import removeAttr from 'react-remove-attr';
import sitemap from 'vite-plugin-sitemap';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    removeAttr({
      extensions: ['jsx', 'tsx'],
      attributes: ['data-testid'],
    }),
    react(),
    tsconfigPaths(),
    helmet(),
    htmlPlugin(loadEnv(mode, '.')),
    ViteMinifyPlugin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: false,
    }),
    tailwindcss(),
    sitemap({
      hostname: 'https://canvas.minagishl.com',
      generateRobotsTxt: false,
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

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Canvas',
  description: 'A free canvas tool available online for building ideas.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'All',
};

function helmet() {
  return {
    name: 'helmet-transform',
    transformIndexHtml: {
      order: 'pre' as const,
      handler: (html: string): string =>
        html.replace(
          /<head>([\s\S]*?)<\/head>/,
          `<head>$1<script type="application/ld+json">${JSON.stringify(
            schema
          )}</script></head>`
        ),
    },
  };
}
