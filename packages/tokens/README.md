# @gauntlet/tokens

Design tokens and Tailwind preset shared across Gauntlet applications.

## Contents

- `src/index.ts` – Exports semantic token definitions (colors, spacing,
  typography) for consumption in component libraries or CSS-in-JS setups.
- `tailwind-preset.ts` – Tailwind configuration snippet that maps tokens to
  utility classes.

## Design Decisions

- **Single source of truth** – Tokens mirror the `brand/` assets; any rebrand
  work should update both places in lockstep.
- **Tailwind-first** – The preset extends Tailwind so `apps/web` can opt-in
  without duplicating configuration.
- **Distribution** – Bundled with `tsup` to emit ESM/CJS formats, enabling usage
  in both Next.js and Node contexts.

## Commands

```bash
pnpm --filter @gauntlet/tokens build   # tsup bundle
pnpm --filter @gauntlet/tokens clean   # remove dist/
```

When adding new tokens, document naming conventions in this README and ensure
the Tailwind preset exposes the same values.
