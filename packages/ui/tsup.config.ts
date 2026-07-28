import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  // Several exports (nav, loader, page-header-hero) are client components.
  // tsup bundles everything into one file and strips per-file "use client"
  // directives in the process, so re-add it once at the top of the bundle.
  banner: { js: "'use client';" },
});
