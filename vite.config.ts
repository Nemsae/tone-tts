import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  plugins: [
    svelte({
      compilerOptions: {
        dev: mode === 'development',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: mode !== 'production',
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: './src/shared/testing/setup-tests.ts',
    include: ['src/**/*.test.ts', 'src/**/*.test.svelte'],
  },
}));
