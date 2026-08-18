import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: [
      '__tests__/**/*.test.ts',
      '__tests__/**/*.test.tsx',
      '__tests__/**/*.property.test.ts',
      '__tests__/**/*.property.test.tsx',
    ],
    // Node 22+ ships a native `globalThis.localStorage`. Vitest's jsdom
    // environment setup only proxies jsdom's own Storage implementation
    // onto globals it doesn't already find present, so Node's (here,
    // non-functional without a --localstorage-file) native version wins
    // and jsdom's real implementation never gets wired up. Disabling
    // Node's native Web Storage restores the assumption vitest relies on.
    env: { NODE_OPTIONS: '--no-experimental-webstorage' },
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'text'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/instrumentation.ts',
        'src/instrumentation-client.ts',
        'src/app/globals.css',
        'src/app/manifest.json',
      ],
    },
  },
});
