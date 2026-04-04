import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '{{PACKAGE_SCOPE}}/ui': resolve(__dirname, '../../packages/ui/src'),
      '{{PACKAGE_SCOPE}}/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
});
