# @gauntlet/ui

Shared UI primitives and Storybook workspace backing the web application.

## Purpose
- Provide lightweight, theme-aware building blocks (layout components, chart shells, motion variants) for features in `apps/web`.
- Centralize shadcn-inspired components so design updates propagate consistently.
- Host Storybook stories that document interaction patterns outside of the Next.js app.

## Design Decisions
- **Lean surface area** – Components stay presentational; data fetching and state live in consuming features.
- **Design tokens** – Styling relies on `@gauntlet/tokens`; avoid hardcoding colors/spacing.
- **Exports** – `src/index.ts` acts as the public API; add new exports there with clear naming to keep tree-shaking effective.
- **Stories** – Storybook stories (`src/stories/*`) document usage and serve as reference for AI-assisted implementations.

## Commands
```bash
pnpm --filter @gauntlet/ui build           # tsup bundle (esm/cjs + d.ts)
pnpm --filter @gauntlet/ui storybook       # Storybook dev server
pnpm --filter @gauntlet/ui build-storybook # Static Storybook build
```

When introducing new components, capture design intent in a short Storybook note or README snippet so future contributors understand styling constraints.

