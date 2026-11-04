import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [!process.env.VITEST && devtools(), solidPlugin()].filter(Boolean),
  base: '/ti-fagame-pali/',
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
  build: {
    target: 'esnext',
    outDir: 'root',
    assetsDir: 'assets',
  },
});
