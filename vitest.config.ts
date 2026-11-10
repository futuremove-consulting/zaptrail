import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    globals: true,
    include: [
      'tests/**/*.test.ts',
      'src/app/api/**/*.test.ts',
      'src/components/**/__tests__/**/*.test.{ts,tsx}',
      'src/components/**/*.test.tsx',
      'src/hooks/__tests__/**/*.test.{ts,tsx}',
      'src/context/__tests__/**/*.test.{ts,tsx}',
      'src/packages/core/__tests__/**/*.test.ts',
    ],
    environment: 'node',
    environmentMatchGlobs: [
      ['src/components/**', 'jsdom'],
      ['src/hooks/**', 'jsdom'],
      ['src/context/**', 'jsdom'],
    ],
    setupFiles: [path.resolve(__dirname, 'src/test/setup.ts')],
  },
  resolve: {
    alias: {
      'next/server': path.resolve(__dirname, 'tests/shims/next-server.ts'),
      'next/navigation': path.resolve(__dirname, 'src/test/mocks/next-navigation.ts'),
      'next/link': path.resolve(__dirname, 'src/test/mocks/next-link.ts'),
      'next/image': path.resolve(__dirname, 'src/test/mocks/next-image.ts'),
      '@supabase/supabase-js': path.resolve(__dirname, 'tests/shims/supabase-js.ts'),
      'react-router-dom': path.resolve(__dirname, 'tests/shims/react-router-dom.ts'),
      '@tanstack/react-query': path.resolve(__dirname, 'tests/shims/react-query.ts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
