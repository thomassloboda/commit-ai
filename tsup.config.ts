import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/commit-ai.ts'],
  format: ['esm', 'cjs'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
})
