// https://vitejs.dev/config/

import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  server: {
    port: 8080,
    open: true,
  },
  esbuild: {
    jsxFactory: 'tsx',
  },
});
