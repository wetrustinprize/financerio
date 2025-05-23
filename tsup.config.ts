import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server/index.ts'],
  outDir: 'build/server',
  format: ['cjs'],
  platform: 'node',
  target: 'node20',
  bundle: true,
  clean: true,
  dts: false,
  minify: true,
  noExternal: ['hono', '@hono/node-serve'],
  env: {
    type: "prod"
  },
});