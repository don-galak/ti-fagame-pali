import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
  base: '/ti-fagame-pali/',
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'root',
    assetsDir: 'assets',
  },
});
