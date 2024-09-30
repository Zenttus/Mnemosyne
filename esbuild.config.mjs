// esbuild.config.mjs

import esbuild from 'esbuild';

const isProduction = process.argv.includes('production');

esbuild.build({
  entryPoints: ['src/Mnemosyne.ts'], // Change this to point to Mnemosyne.ts
  bundle: true,
  minify: isProduction,
  sourcemap: !isProduction,
  outfile: 'main.js',
  platform: 'node',
  external: ['obsidian'],
  format: 'cjs',
  target: 'es2017',
}).catch(() => process.exit(1));
