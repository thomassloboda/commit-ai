import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/commit-ai.ts'],
  format: ['cjs'], // tu restes en CJS
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: false,
  noExternal: ['openai'],
});
