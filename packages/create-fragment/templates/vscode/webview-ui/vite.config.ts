import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', rollupOptions: { output: { entryFileNames: 'assets/index.js', assetFileNames: 'assets/[name][extname]' } } },
  resolve: {
    alias: {
      '{{PACKAGE_SCOPE}}/ui': resolve(__dirname, '../../packages/ui/src'),
      '{{PACKAGE_SCOPE}}/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
});
