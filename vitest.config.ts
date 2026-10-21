import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: [
      'tests/**/*.test.ts',
      'src/app/api/management-objects/management-objects.test.ts',
    ],
    environment: 'node',
  },
  resolve: {
    alias: {
      'next/server': path.resolve(__dirname, 'tests/shims/next-server.ts'),
      '@supabase/supabase-js': path.resolve(__dirname, 'tests/shims/supabase-js.ts'),
      'react-router-dom': path.resolve(__dirname, 'tests/shims/react-router-dom.ts'),
      '@tanstack/react-query': path.resolve(__dirname, 'tests/shims/react-query.ts'),
      'react': path.resolve(__dirname, 'tests/shims/react.ts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
